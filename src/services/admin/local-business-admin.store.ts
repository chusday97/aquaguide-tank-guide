import { careArticleAdminInputSchema, speciesAdminInputSchema, type CareArticleDetailDto, type ReleaseEventDto, type SpeciesDetailDto } from '../../../packages/contracts/src';
import { fishData } from '../../data/fishData';
import { careTopicsData } from '../../data/careTopicsData';
import type { Fish } from '../../types';
import { AquaGuideApiError } from '../api/api-client';
import type { AdminCareArticleRecord, AdminSpeciesRecord, CareArticleAdminInput, SpeciesAdminInput } from './content-admin.service';

const STORAGE_KEY = 'aquaguide-local-business-admin-v1';
const now = () => new Date().toISOString();

const runtimeEnv = (import.meta as ImportMeta & { env?: { DEV?: boolean; VITE_ADMIN_LOCAL_MODE?: string } }).env;
export const isLocalBusinessAdminMode = runtimeEnv?.DEV === true && runtimeEnv.VITE_ADMIN_LOCAL_MODE === 'true';

type LocalBusinessAdminState = {
  schemaVersion: 1;
  species: AdminSpeciesRecord[];
  care: AdminCareArticleRecord[];
  publishedSpecies: Record<string, SpeciesAdminInput>;
  publishedCare: Record<string, CareArticleAdminInput>;
  releaseEvents?: ReleaseEventDto[];
  updatedAt: string;
};
const numberRange = (value: string): [number | undefined, number | undefined] => {
  const values = [...value.matchAll(/\d+(?:\.\d+)?/g)].map(match => Number(match[0])).filter(Number.isFinite);
  return [values[0], values[1] ?? values[0]];
};

const firstNumber = (value: string) => {
  const match = value.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
};

const speciesInputFromSeed = (fish: (typeof fishData)[number]): SpeciesAdminInput => {
  const [waterTemperatureMinC, waterTemperatureMaxC] = numberRange(fish.waterTemperature);
  const [phMin, phMax] = numberRange(fish.phLevel);
  return speciesAdminInputSchema.parse({
    catalogKey: fish.id, name: fish.name, scientificName: fish.scientificName, category: fish.category,
    difficulty: fish.difficulty, waterTemperatureText: fish.waterTemperature,
    waterTemperatureMinC, waterTemperatureMaxC, phLevelText: fish.phLevel, phMin, phMax,
    waterChangeCycleDays: fish.waterChangeCycle, description: fish.description, diet: fish.diet,
    tankSizeText: fish.tankSize, minTankLiters: firstNumber(fish.tankSize), temperament: fish.temperament,
    sizeClass: fish.size, housingMode: fish.housingMode, housingReason: fish.housingReason,
    isCustom: Boolean(fish.isCustom), searchTerms: [fish.name, fish.scientificName, fish.category],
  });
};
const careInputFromSeed = (topic: (typeof careTopicsData)[number]): CareArticleAdminInput => careArticleAdminInputSchema.parse({
  catalogKey: topic.id, title: topic.title, category: topic.category, urgency: topic.urgency,
  summary: topic.summary, symptoms: topic.symptoms,
  steps: topic.firstSteps.map(instruction => ({ instruction, actionKind: 'immediate' as const })),
  avoidActions: topic.avoid, observeItems: topic.observe, diagnoseWhen: topic.diagnoseWhen,
  nextStep: topic.nextStep?.trim() || topic.diagnoseWhen.at(-1)?.trim() || topic.summary, keywords: topic.keywords,
});

const speciesRecord = (input: SpeciesAdminInput, status: AdminSpeciesRecord['status'] = 'published', version = 1): AdminSpeciesRecord => ({
  id: `local-species-${input.catalogKey}`, ...input, status, version, speciesAssets: [],
});

const careRecord = (input: CareArticleAdminInput, status: AdminCareArticleRecord['status'] = 'published', version = 1): AdminCareArticleRecord => ({
  id: `local-care-${input.catalogKey}`, catalogKey: input.catalogKey, title: input.title, category: input.category,
  urgency: input.urgency, summary: input.summary, symptoms: input.symptoms, avoidActions: input.avoidActions,
  observeItems: input.observeItems, diagnoseWhen: input.diagnoseWhen, nextStep: input.nextStep, keywords: input.keywords,
  status, version, careArticleAssets: [],
  careArticleSteps: input.steps.map((step, index) => ({ id: `local-care-${input.catalogKey}-step-${index + 1}`, position: index + 1, instruction: step.instruction, durationLabel: step.durationLabel, actionTitle: step.actionTitle, actionKind: step.actionKind })),
});

const buildSeedState = (): LocalBusinessAdminState => {
  const speciesInputs = fishData.map(speciesInputFromSeed);
  const careInputs = careTopicsData.map(careInputFromSeed);
  return {
    schemaVersion: 1, species: speciesInputs.map(input => speciesRecord(input)), care: careInputs.map(input => careRecord(input)),
    publishedSpecies: Object.fromEntries(speciesInputs.map(input => [input.catalogKey, input])),
    publishedCare: Object.fromEntries(careInputs.map(input => [input.catalogKey, input])), releaseEvents: [], updatedAt: now(),
  };
};
const readState = (): LocalBusinessAdminState => {
  if (typeof window === 'undefined') return buildSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as LocalBusinessAdminState;
    if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.species) || !Array.isArray(parsed.care)) throw new Error('invalid local admin store');
    parsed.releaseEvents = Array.isArray(parsed.releaseEvents) ? parsed.releaseEvents : [];
    return parsed;
  } catch {
    const seeded = buildSeedState();
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const writeState = (state: LocalBusinessAdminState) => {
  state.updatedAt = now();
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const assertVersion = (actual: number, expected: number) => {
  if (actual !== expected) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '本地内容已变化，请刷新后再保存。');
};

const appendReleaseEvent = (state: LocalBusinessAdminState, event: ReleaseEventDto) => {
  state.releaseEvents = [event, ...(state.releaseEvents || [])].slice(0, 200);
};

const clone = <T>(value: T): T => structuredClone(value);
const localization = { requestedLocale: 'zh-CN' as const, resolvedLocale: 'zh-CN' as const, usedFallback: false };
const speciesDto = (record: AdminSpeciesRecord, input: SpeciesAdminInput): SpeciesDetailDto => ({
  id: record.id, catalogKey: input.catalogKey, name: input.name, scientificName: input.scientificName,
  category: input.category, difficulty: input.difficulty, waterTemperatureText: input.waterTemperatureText,
  waterTemperatureMinC: input.waterTemperatureMinC, waterTemperatureMaxC: input.waterTemperatureMaxC,
  phLevelText: input.phLevelText, phMin: input.phMin, phMax: input.phMax,
  waterChangeCycleDays: input.waterChangeCycleDays, description: input.description, diet: input.diet,
  tankSizeText: input.tankSizeText, minTankLiters: input.minTankLiters, temperament: input.temperament,
  sizeClass: input.sizeClass, housingMode: input.housingMode, housingReason: input.housingReason,
  assets: [], updatedAt: now(), localization,
});

const careDto = (record: AdminCareArticleRecord, input: CareArticleAdminInput): CareArticleDetailDto => ({
  id: record.id, catalogKey: input.catalogKey, title: input.title, category: input.category, urgency: input.urgency,
  summary: input.summary, keywords: input.keywords, symptoms: input.symptoms, avoidActions: input.avoidActions,
  observeItems: input.observeItems, diagnoseWhen: input.diagnoseWhen, nextStep: input.nextStep,
  steps: input.steps.map((step, index) => ({ id: `${record.id}-published-step-${index + 1}`, position: index + 1, instruction: step.instruction, durationLabel: step.durationLabel, actionTitle: step.actionTitle, actionKind: step.actionKind })),
  references: [], assets: [], updatedAt: now(), localization,
});
const publishedFishFromState = (state: LocalBusinessAdminState): Fish[] => {
  const seedIds = new Set(fishData.map(item => item.id));
  const seeded = fishData.map(seed => {
    const input = state.publishedSpecies[seed.id];
    return input ? { ...seed, name: input.name, scientificName: input.scientificName, category: input.category,
      difficulty: input.difficulty, waterTemperature: input.waterTemperatureText, phLevel: input.phLevelText,
      waterChangeCycle: input.waterChangeCycleDays, description: input.description, diet: input.diet, tankSize: input.tankSizeText,
      temperament: input.temperament, size: input.sizeClass, housingMode: input.housingMode, housingReason: input.housingReason } : { ...seed };
  });
  const custom = Object.values(state.publishedSpecies).filter(input => !seedIds.has(input.catalogKey)).map(input => ({
    id: input.catalogKey, name: input.name, scientificName: input.scientificName, category: input.category, image: '',
    difficulty: input.difficulty, waterTemperature: input.waterTemperatureText, phLevel: input.phLevelText,
    waterChangeCycle: input.waterChangeCycleDays, description: input.description, diet: input.diet, tankSize: input.tankSizeText,
    temperament: input.temperament, size: input.sizeClass, housingMode: input.housingMode, housingReason: input.housingReason,
  } as Fish));
  return [...seeded, ...custom];
};

export const localBusinessAdminStore = {
  listSpecies: async () => clone(readState().species),
  listCareArticles: async () => clone(readState().care),
  getPublishedCompatibilityFish: async () => clone(publishedFishFromState(readState())),
  getReleaseEvents: async () => clone(readState().releaseEvents || []),

  getPublishedSpecies: async (catalogKey: string) => {
    const state = readState();
    const input = state.publishedSpecies[catalogKey];
    const record = state.species.find(item => item.catalogKey === catalogKey);
    return input && record ? speciesDto(record, input) : null;
  },

  getPublishedCareArticle: async (catalogKey: string) => {
    const state = readState();
    const input = state.publishedCare[catalogKey];
    const record = state.care.find(item => item.catalogKey === catalogKey);
    return input && record ? careDto(record, input) : null;
  },


  createSpecies: async (raw: SpeciesAdminInput) => {
    const input = speciesAdminInputSchema.parse(raw);
    const state = readState();
    if (state.species.some(item => item.catalogKey === input.catalogKey)) throw new AquaGuideApiError(409, 'DUPLICATE_RESOURCE', '本地 Species catalog key 已存在。');
    const record = speciesRecord(input, 'draft', 1);
    state.species.unshift(record); writeState(state); return clone(record);
  },

  createCareArticle: async (raw: CareArticleAdminInput) => {
    const input = careArticleAdminInputSchema.parse(raw);
    const state = readState();
    if (state.care.some(item => item.catalogKey === input.catalogKey)) throw new AquaGuideApiError(409, 'DUPLICATE_RESOURCE', '本地 Care catalog key 已存在。');
    const record = careRecord(input, 'draft', 1);
    state.care.unshift(record); writeState(state); return clone(record);
  },
  updateSpecies: async (id: string, version: number, raw: SpeciesAdminInput) => {
    const input = speciesAdminInputSchema.parse(raw);
    const state = readState();
    const index = state.species.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Species 不存在。');
    const current = state.species[index];
    assertVersion(current.version, version);
    const next = speciesRecord(input, 'draft', current.version + 1);
    next.id = current.id;
    state.species[index] = next; writeState(state); return clone(next);
  },

  updateCareArticle: async (id: string, version: number, raw: CareArticleAdminInput) => {
    const input = careArticleAdminInputSchema.parse(raw);
    const state = readState();
    const index = state.care.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地 Care 内容不存在。');
    const current = state.care[index];
    assertVersion(current.version, version);
    const next = careRecord(input, 'draft', current.version + 1);
    next.id = current.id;
    state.care[index] = next; writeState(state); return clone(next);
  },

  setStatus: async (type: 'species' | 'care', id: string, version: number, status: 'published' | 'archived') => {
    const state = readState();
    const rows = type === 'species' ? state.species : state.care;
    const index = rows.findIndex(item => item.id === id);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '本地内容不存在。');
    const current = rows[index]; assertVersion(current.version, version);
    const next = { ...current, status, version: current.version + 1 };
    rows[index] = next as never;
    if (type === 'species') {
      const species = next as AdminSpeciesRecord;
      if (status === 'published') state.publishedSpecies[species.catalogKey] = speciesAdminInputSchema.parse(species);
      else delete state.publishedSpecies[species.catalogKey];
    } else {
      const care = next as AdminCareArticleRecord;
      if (status === 'published') {
        state.publishedCare[care.catalogKey] = careArticleAdminInputSchema.parse({
          ...care,
          steps: (care.careArticleSteps || []).sort((a, b) => a.position - b.position).map(step => ({ instruction: step.instruction, durationLabel: step.durationLabel, actionTitle: step.actionTitle, actionKind: step.actionKind || 'immediate' })),
        });
      } else delete state.publishedCare[care.catalogKey];
    }
    const resource = next as AdminSpeciesRecord | AdminCareArticleRecord;
    appendReleaseEvent(state, {
      id: `local-product-care:${type}:${resource.catalogKey}:${resource.version}:${Date.now()}`,
      authority: 'product_care', domain: type === 'care' ? 'care' : 'product',
      eventType: status === 'published' ? 'publication_publish' : 'publication_archive', status,
      title: `${type === 'care' ? 'Care' : 'Product'} ${status === 'published' ? '发布版本' : '已下线'}`,
      detail: `${resource.catalogKey} · source v${resource.version}`, resourceKey: resource.catalogKey, version: resource.version,
      occurredAt: now(), sourceRef: `local:${type}:${resource.id}:${resource.version}`,
      metadata: { resourceId: resource.id, historyCoverage: 'revision_history', local: true },
    });
    writeState(state);
    return clone(next) as AdminSpeciesRecord | AdminCareArticleRecord;
  },

  reset: () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  },
};

import type { CareArticleDetailDto, SpeciesDetailDto } from '../../packages/contracts/src/index';
import type { Fish } from '../types';
import { apiRequest } from '../services/api/api-client';
import { fishData as seedFishData } from './fishData';
import { careTopicsData as seedCareTopicsData, type CareTopic } from './careTopicsData';

type ContentBootstrapResponse = {
  species: SpeciesDetailDto[];
  careArticles: CareArticleDetailDto[];
  authority: 'publication-snapshot' | 'legacy-published';
  publicationCounts: { species: number; care: number };
};

export type RuntimeContentLocale = 'zh-CN' | 'en';

export type RuntimeContentStatus = {
  source: 'published-api' | 'static-fallback';
  speciesFromPublished: number;
  careFromPublished: number;
  speciesFallback: number;
  careFallback: number;
};

const cloneFish = (fish: Fish): Fish => ({
  ...fish,
  ...(fish.feedingProfile ? { feedingProfile: { ...fish.feedingProfile } } : {}),
});

const cloneCareTopic = (topic: CareTopic): CareTopic => ({
  ...topic,
  symptoms: [...topic.symptoms],
  firstSteps: [...topic.firstSteps],
  avoid: [...topic.avoid],
  observe: [...topic.observe],
  diagnoseWhen: [...topic.diagnoseWhen],
  keywords: [...topic.keywords],
});
const toFish = (detail: SpeciesDetailDto, fallback?: Fish): Fish => {
  const feeding = detail.feedingProfile as Partial<NonNullable<Fish['feedingProfile']>> | undefined;
  const image = detail.assets.find(asset => asset.variant === 'detail')?.url
    || detail.thumbnail?.url
    || fallback?.image
    || '';
  return {
    id: detail.catalogKey,
    name: detail.name,
    scientificName: detail.scientificName,
    category: detail.category,
    image,
    difficulty: detail.difficulty,
    waterTemperature: detail.waterTemperatureText,
    phLevel: detail.phLevelText,
    waterChangeCycle: detail.waterChangeCycleDays,
    description: detail.description,
    diet: detail.diet,
    ...(feeding ? {
      feedingProfile: {
        dietType: feeding.dietType,
        feedingType: feeding.feedingType || fallback?.feedingProfile?.feedingType || detail.diet,
        recommendedFoods: feeding.recommendedFoods || fallback?.feedingProfile?.recommendedFoods || detail.diet,
        feedingFrequency: feeding.feedingFrequency || fallback?.feedingProfile?.feedingFrequency || '',
        portionRule: feeding.portionRule || fallback?.feedingProfile?.portionRule || '',
        feedingLayer: feeding.feedingLayer,
        avoidFoods: feeding.avoidFoods || fallback?.feedingProfile?.avoidFoods || '',
        specialNotes: feeding.specialNotes,
        confidence: feeding.confidence,
        sourceName: feeding.sourceName,
        sourceUrl: feeding.sourceUrl,
        sourceFields: feeding.sourceFields,
        needsReview: feeding.needsReview,
        reviewReason: feeding.reviewReason,
      },
    } : fallback?.feedingProfile ? { feedingProfile: { ...fallback.feedingProfile } } : {}),
    tankSize: detail.tankSizeText,
    temperament: detail.temperament,
    size: detail.sizeClass,
    housingMode: detail.housingMode,
    housingReason: detail.housingReason,
    isCustom: fallback?.isCustom,
  };
};

const toCareTopic = (detail: CareArticleDetailDto, fallback?: CareTopic): CareTopic => ({
  id: detail.catalogKey,
  title: detail.title,
  category: detail.category,
  urgency: detail.urgency,
  summary: detail.summary,
  symptoms: [...detail.symptoms],
  firstSteps: detail.steps.map(step => step.instruction),
  avoid: [...detail.avoidActions],
  observe: [...detail.observeItems],
  diagnoseWhen: [...detail.diagnoseWhen],
  nextStep: detail.nextStep,
  imageUrl: detail.image?.url
    || detail.assets.find(asset => asset.variant === 'article_main')?.url
    || fallback?.imageUrl
    || '',
  keywords: [...detail.keywords],
});

export const runtimeFishData: Fish[] = seedFishData.map(cloneFish);
export const runtimeCareTopicsData: CareTopic[] = seedCareTopicsData.map(cloneCareTopic);

const publishedSpeciesKeys = new Set<string>();
const publishedCareKeys = new Set<string>();

export const isRuntimeSpeciesPublished = (catalogKey: string) => publishedSpeciesKeys.has(catalogKey);
export const isRuntimeCarePublished = (catalogKey: string) => publishedCareKeys.has(catalogKey);

let runtimeContentStatus: RuntimeContentStatus = {
  source: 'static-fallback',
  speciesFromPublished: 0,
  careFromPublished: 0,
  speciesFallback: runtimeFishData.length,
  careFallback: runtimeCareTopicsData.length,
};
const mergeSpecies = (published: SpeciesDetailDto[]) => {
  const publishedByKey = new Map(published.map(item => [item.catalogKey, item]));
  const seedKeys = new Set(seedFishData.map(item => item.id));
  const merged = seedFishData.map(seed => {
    const detail = publishedByKey.get(seed.id);
    return detail ? toFish(detail, seed) : cloneFish(seed);
  });
  for (const detail of published) {
    if (!seedKeys.has(detail.catalogKey)) merged.push(toFish(detail));
  }
  return merged;
};

const mergeCare = (published: CareArticleDetailDto[]) => {
  const publishedByKey = new Map(published.map(item => [item.catalogKey, item]));
  const seedKeys = new Set(seedCareTopicsData.map(item => item.id));
  const merged = seedCareTopicsData.map(seed => {
    const detail = publishedByKey.get(seed.id);
    return detail ? toCareTopic(detail, seed) : cloneCareTopic(seed);
  });
  for (const detail of published) {
    if (!seedKeys.has(detail.catalogKey)) merged.push(toCareTopic(detail));
  }
  return merged;
};

export const getRuntimeContentStatus = () => ({ ...runtimeContentStatus });

export const getRuntimeContentLocalePreference = (): RuntimeContentLocale => {
  try {
    const stored = window.localStorage.getItem('aquaguide_locale');
    if (stored === 'zh-CN' || stored === 'en') return stored;
  } catch {
    // Browser storage can be unavailable in private contexts.
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
};

const resetRuntimeContentCatalog = () => {
  runtimeFishData.splice(0, runtimeFishData.length, ...seedFishData.map(cloneFish));
  runtimeCareTopicsData.splice(0, runtimeCareTopicsData.length, ...seedCareTopicsData.map(cloneCareTopic));
  publishedSpeciesKeys.clear();
  publishedCareKeys.clear();
  runtimeContentStatus = {
    source: 'static-fallback',
    speciesFromPublished: 0,
    careFromPublished: 0,
    speciesFallback: runtimeFishData.length,
    careFallback: runtimeCareTopicsData.length,
  };
};

export const hydratePublishedContentCatalog = async (
  locale: RuntimeContentLocale = getRuntimeContentLocalePreference(),
) => {
  try {
    const payload = await apiRequest<ContentBootstrapResponse>(`/content-bootstrap?locale=${encodeURIComponent(locale)}`, {
      authenticated: false,
      signal: AbortSignal.timeout(5000),
    });
    if (payload.species.length === 0 && payload.careArticles.length === 0) {
      resetRuntimeContentCatalog();
      return getRuntimeContentStatus();
    }

    publishedSpeciesKeys.clear();
    publishedCareKeys.clear();
    payload.species.forEach(item => publishedSpeciesKeys.add(item.catalogKey));
    payload.careArticles.forEach(item => publishedCareKeys.add(item.catalogKey));

    const mergedSpecies = mergeSpecies(payload.species);
    const mergedCare = mergeCare(payload.careArticles);
    runtimeFishData.splice(0, runtimeFishData.length, ...mergedSpecies);
    runtimeCareTopicsData.splice(0, runtimeCareTopicsData.length, ...mergedCare);
    runtimeContentStatus = {
      source: 'published-api',
      speciesFromPublished: payload.species.length,
      careFromPublished: payload.careArticles.length,
      speciesFallback: Math.max(0, mergedSpecies.length - payload.species.length),
      careFallback: Math.max(0, mergedCare.length - payload.careArticles.length),
    };
  } catch {
    resetRuntimeContentCatalog();
  }
  return getRuntimeContentStatus();
};

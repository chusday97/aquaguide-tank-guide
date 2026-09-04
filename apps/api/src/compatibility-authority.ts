import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ReviewedCompatibilityPairRuleDto,
  ReviewedCompatibilityProfileDto,
  RuntimeEvidenceSourceDto,
  SpeciesDetailDto,
} from '../../../packages/contracts/src';
import type { Fish } from '../../../src/types';
import { fishData as seedFishData } from '../../../src/data/fishData';
import type { CompatibilityEvidenceProvider, TankCompatibilityResult } from '../../../src/lib/tankCompatibilityEngine';
import { evaluateTankCompatibility } from '../../../src/lib/tankCompatibilityEngine';
import { getCompatibilityEvidenceAudit, type ReviewedCompatibilityProfile, type ReviewedPairRule } from '../../../src/data/compatibilityEvidence';
import { mapSpeciesDetail } from './content-mappers';
import { type PublicationSnapshotPayload, speciesPublicationSelect } from './content-publications';
import { ApiError } from './http';

export type ReviewedCompatibilityAuthority = {
  profiles: ReviewedCompatibilityProfileDto[];
  pairRules: ReviewedCompatibilityPairRuleDto[];
  authority: 'reviewed-db';
  counts: { profiles: number; pairRules: number };
};

const pairKey = (left: string, right: string) => [left, right].sort().join('__');
const staticAudit = getCompatibilityEvidenceAudit();
const expectedProfileKeys = new Set(staticAudit.reviewedProfiles.map(profile => profile.speciesId));
const expectedPairKeys = new Set(staticAudit.reviewedPairRules.map(rule => pairKey(...rule.speciesIds)));
export const COMPATIBILITY_REGRESSION_ENGINE_VERSION = 'compatibility-regression-v1';
const stableHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24);
const catalogFingerprint = (fish: Fish[]) => stableHash([...fish].sort((left, right) => left.id.localeCompare(right.id)));
const mapEvidence = (row: any): RuntimeEvidenceSourceDto => ({
  id: row.source_key || row.id,
  title: row.title,
  publisher: row.publisher,
  url: row.url,
  sourceType: row.source_type,
  reviewStatus: 'reviewed',
  version: row.version,
});

const reviewedSources = (links: any[] = []) => links
  .map(link => link?.evidence_sources)
  .filter(source => source?.review_status === 'reviewed' && !source?.deleted_at)
  .map(mapEvidence);

export const loadReviewedCompatibilityAuthority = async (client: SupabaseClient): Promise<ReviewedCompatibilityAuthority> => {
  const [profileResult, pairResult] = await Promise.all([
    client.from('species_compatibility_profiles')
      .select('species_id,behavior_traits,minimum_group_size,predation_targets,confidence,review_status,version,species_compatibility_profile_sources(evidence_sources(id,source_key,title,publisher,url,source_type,review_status,version,deleted_at))')
      .eq('review_status', 'reviewed').is('deleted_at', null),
    client.from('species_pair_compatibility_rules')
      .select('species_a_id,species_b_id,verdict,risk_type,reason,mitigation,basis,confidence,review_status,version,species_pair_compatibility_rule_sources(evidence_sources(id,source_key,title,publisher,url,source_type,review_status,version,deleted_at))')
      .eq('review_status', 'reviewed').is('deleted_at', null),
  ]);
  if (profileResult.error || pairResult.error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Reviewed Compatibility authority 尚未准备完成。');
  const speciesIds = Array.from(new Set([...(profileResult.data || []).map(row => row.species_id), ...(pairResult.data || []).flatMap(row => [row.species_a_id, row.species_b_id])]));
  const speciesResult = speciesIds.length
    ? await client.from('species').select('id,catalog_key').in('id', speciesIds).eq('status', 'published').is('deleted_at', null)
    : { data: [], error: null };
  if (speciesResult.error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Compatibility 物种身份暂时无法加载。');
  const keyBySpeciesId = new Map((speciesResult.data || []).map(row => [row.id, row.catalog_key]));
  const profiles: ReviewedCompatibilityProfileDto[] = (profileResult.data || []).flatMap(row => {
    const catalogKey = keyBySpeciesId.get(row.species_id);
    const citations = reviewedSources(row.species_compatibility_profile_sources as any[]);
    return catalogKey && citations.length ? [{
      catalogKey,
      behaviorTraits: row.behavior_traits || [],
      minimumGroupSize: row.minimum_group_size ?? undefined,
      predationTargets: row.predation_targets || [],
      confidence: row.confidence,
      reviewStatus: 'reviewed' as const,
      citations,
      version: row.version,
    }] : [];
  }).sort((left, right) => left.catalogKey.localeCompare(right.catalogKey));
  const pairRules: ReviewedCompatibilityPairRuleDto[] = (pairResult.data || []).flatMap(row => {
    const left = keyBySpeciesId.get(row.species_a_id);
    const right = keyBySpeciesId.get(row.species_b_id);
    const citations = reviewedSources(row.species_pair_compatibility_rule_sources as any[]);
    if (!left || !right || citations.length === 0) return [];
    return [{
      catalogKeys: [left, right].sort() as [string, string],
      verdict: row.verdict,
      riskType: row.risk_type,
      reason: row.reason,
      mitigation: row.mitigation || [],
      basis: row.basis,
      confidence: row.confidence,
      reviewStatus: 'reviewed' as const,
      citations,
      version: row.version,
    }];
  }).sort((left, right) => pairKey(...left.catalogKeys).localeCompare(pairKey(...right.catalogKeys)));

  const profileKeys = new Set(profiles.map(profile => profile.catalogKey));
  const pairKeys = new Set(pairRules.map(rule => pairKey(...rule.catalogKeys)));
  const exactCoverage = profileKeys.size === expectedProfileKeys.size && pairKeys.size === expectedPairKeys.size
    && [...expectedProfileKeys].every(key => profileKeys.has(key))
    && [...expectedPairKeys].every(key => pairKeys.has(key));
  if (!exactCoverage) throw new ApiError(409, 'MIGRATION_REJECTED', 'Reviewed Compatibility DB baseline 尚未完成 7 Profiles / 4 Pair Rules 全量对齐。');
  return { profiles, pairRules, authority: 'reviewed-db', counts: { profiles: profiles.length, pairRules: pairRules.length } };
};
const speciesDetailToFish = (detail: SpeciesDetailDto): Fish => ({
  id: detail.catalogKey,
  name: detail.name,
  scientificName: detail.scientificName,
  category: detail.category,
  image: detail.thumbnail?.url || detail.assets.find(asset => asset.variant === 'detail')?.url || '',
  difficulty: detail.difficulty,
  waterTemperature: detail.waterTemperatureText,
  phLevel: detail.phLevelText,
  waterChangeCycle: detail.waterChangeCycleDays || 0,
  description: detail.description,
  diet: detail.diet,
  tankSize: detail.tankSizeText,
  temperament: detail.temperament,
  size: detail.sizeClass,
  housingMode: detail.housingMode,
  housingReason: detail.housingReason,
});

export const loadPublishedCompatibilityFish = async (client: SupabaseClient): Promise<Fish[]> => {
  const [publicationResult, legacyResult] = await Promise.all([
    client.from('content_publications').select('catalog_key,snapshot').eq('resource_type', 'species').order('catalog_key'),
    client.from('species').select(speciesPublicationSelect).eq('status', 'published').is('deleted_at', null).order('catalog_key'),
  ]);
  if (publicationResult.error || legacyResult.error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Compatibility regression 无法读取当前 Published Product catalog。');
  const publicationKeys = new Set((publicationResult.data || []).map(row => row.catalog_key));
  const published = (publicationResult.data || []).flatMap(row => {
    const snapshot = row.snapshot as PublicationSnapshotPayload | null;
    const detail = snapshot?.['zh-CN'] as SpeciesDetailDto | undefined;
    return detail ? [speciesDetailToFish(detail)] : [];
  });
  const legacy = (legacyResult.data || [])
    .filter(row => !publicationKeys.has(row.catalog_key))
    .map(row => speciesDetailToFish(mapSpeciesDetail(row, 'zh-CN')));
  const publishedByKey = new Map([...published, ...legacy].map(item => [item.id, item]));
  const seedKeys = new Set(seedFishData.map(item => item.id));
  const merged = seedFishData.map(seed => publishedByKey.get(seed.id) || { ...seed });
  for (const item of publishedByKey.values()) if (!seedKeys.has(item.id)) merged.push(item);
  return merged.sort((left, right) => left.id.localeCompare(right.id));
};

export const loadCompatibilityAuthoritySequence = async (client: SupabaseClient) => {
  const { data, error } = await client.from('compatibility_authority_state').select('version').eq('singleton', true).maybeSingle();
  if (error || !data) throw new ApiError(409, 'MIGRATION_REJECTED', 'Compatibility authority sequence 尚未初始化。');
  return Number(data.version);
};
const toProfile = (profile: ReviewedCompatibilityProfileDto): ReviewedCompatibilityProfile => ({
  speciesId: profile.catalogKey,
  behaviorTraits: [...profile.behaviorTraits],
  minimumGroupSize: profile.minimumGroupSize,
  predationTargets: [...profile.predationTargets],
  confidence: profile.confidence,
  reviewStatus: 'reviewed',
  citations: profile.citations.map(source => ({ ...source })),
});
const toPairRule = (rule: ReviewedCompatibilityPairRuleDto): ReviewedPairRule => ({
  speciesIds: [...rule.catalogKeys] as [string, string],
  verdict: rule.verdict,
  riskType: rule.riskType,
  reason: rule.reason,
  mitigation: [...rule.mitigation],
  basis: rule.basis,
  confidence: rule.confidence,
  reviewStatus: 'reviewed',
  affectedSpeciesIds: [...rule.catalogKeys],
  citations: rule.citations.map(source => ({ ...source })),
});

export const createAuthorityEvidenceProvider = (
  authority: ReviewedCompatibilityAuthority,
  authorityVersion: string,
): CompatibilityEvidenceProvider => {
  const profiles = new Map(authority.profiles.map(profile => [profile.catalogKey, toProfile(profile)]));
  const pairRules = new Map(authority.pairRules.map(rule => [pairKey(...rule.catalogKeys), toPairRule(rule)]));
  return {
    getProfile: speciesId => profiles.get(speciesId),
    getPairRule: (leftId, rightId) => pairRules.get(pairKey(leftId, rightId)),
    authorityVersion,
  };
};

const citationsForSourceKeys = (authority: ReviewedCompatibilityAuthority, sourceKeys: string[]) => {
  const sourceByKey = new Map([...authority.profiles.flatMap(profile => profile.citations), ...authority.pairRules.flatMap(rule => rule.citations)].map(source => [source.id, source]));
  const citations = sourceKeys.map(key => sourceByKey.get(key)).filter((source): source is RuntimeEvidenceSourceDto => Boolean(source));
  if (citations.length !== sourceKeys.length) throw new ApiError(409, 'MIGRATION_REJECTED', 'Regression 无法解析 Draft 使用的 canonical Evidence。');
  return citations;
};
type RegressionDecision = {
  status: TankCompatibilityResult['status'];
  riskLevel: TankCompatibilityResult['riskLevel'];
  blocking: string[];
  warning: string[];
  missing: string[];
};
export type CompatibilityRegressionReport = {
  kind: 'profile' | 'pair_rule';
  targetKey: string;
  baselineVersion: number;
  authoritySequence: number;
  engineVersion: string;
  catalogFingerprint: string;
  regressionDigest: string;
  evaluatedScenarios: number;
  changedScenarios: number;
  changes: Array<{ scenario: string; species: [string, string]; before: RegressionDecision; after: RegressionDecision }>;
  generatedAt: string;
};

const ruleSignature = (rule: TankCompatibilityResult['blockingRules'][number]) => [
  rule.code, rule.evidence, rule.basis, rule.confidence, rule.reviewStatus,
].join('|');
const decisionSignature = (result: TankCompatibilityResult): RegressionDecision => ({
  status: result.status,
  riskLevel: result.riskLevel,
  blocking: result.blockingRules.map(ruleSignature).sort(),
  warning: result.warningRules.map(ruleSignature).sort(),
  missing: result.missingData.map(ruleSignature).sort(),
});
const decisionsEqual = (left: RegressionDecision, right: RegressionDecision) => JSON.stringify(left) === JSON.stringify(right);
const neutralTank = {
  id: 'compatibility-regression-neutral-tank',
  name: 'Compatibility regression neutral tank',
  fishes: [],
  dimensions: { length: '200', width: '100', height: '100' },
  waterType: 'Freshwater' as const,
  targetTemperature: '25',
  equipment: { filter: '桶滤' as const, heater: true, oxygen: true, light: '普通灯' as const },
};

const evaluatePairScenarios = (left: Fish, right: Fish, provider: CompatibilityEvidenceProvider) => ([
  ['species_only', evaluateTankCompatibility({ scope: 'species_only', existingSpecies: [left], candidateSpecies: right, evidenceProvider: provider })],
  ['tank_left_to_right', evaluateTankCompatibility({ tank: neutralTank, existingSpecies: [left], candidateSpecies: right, evidenceProvider: provider })],
  ['tank_right_to_left', evaluateTankCompatibility({ tank: neutralTank, existingSpecies: [right], candidateSpecies: left, evidenceProvider: provider })],
] as const);
const runRegression = (
  kind: CompatibilityRegressionReport['kind'],
  targetKey: string,
  baselineVersion: number,
  authoritySequence: number,
  catalogFingerprintValue: string,
  pairs: Array<[Fish, Fish]>,
  beforeProvider: CompatibilityEvidenceProvider,
  afterProvider: CompatibilityEvidenceProvider,
): CompatibilityRegressionReport => {
  const changes: CompatibilityRegressionReport['changes'] = [];
  const regressionRows: unknown[] = [];
  let evaluatedScenarios = 0;
  for (const [left, right] of pairs) {
    const beforeScenarios = evaluatePairScenarios(left, right, beforeProvider);
    const afterScenarios = evaluatePairScenarios(left, right, afterProvider);
    for (let index = 0; index < beforeScenarios.length; index += 1) {
      const [scenario, beforeResult] = beforeScenarios[index];
      const [, afterResult] = afterScenarios[index];
      evaluatedScenarios += 1;
      const before = decisionSignature(beforeResult);
      const after = decisionSignature(afterResult);
      regressionRows.push([scenario, left.id, right.id, before, after]);
      if (!decisionsEqual(before, after)) changes.push({ scenario, species: [left.id, right.id], before, after });
    }
  }
  return {
    kind,
    targetKey,
    baselineVersion,
    authoritySequence,
    engineVersion: COMPATIBILITY_REGRESSION_ENGINE_VERSION,
    catalogFingerprint: catalogFingerprintValue,
    regressionDigest: stableHash(regressionRows),
    evaluatedScenarios,
    changedScenarios: changes.length,
    changes: changes.slice(0, 120),
    generatedAt: new Date().toISOString(),
  };
};

export const buildProfileRevisionRegression = (input: {
  authority: ReviewedCompatibilityAuthority;
  fish: Fish[];
  authoritySequence: number;
  catalogKey: string;
  baselineVersion: number;
  behaviorTraits: string[];
  minimumGroupSize?: number | null;
  predationTargets: string[];
  confidence: ReviewedCompatibilityProfileDto['confidence'];
  sourceKeys: string[];
}) => {
  const current = input.authority.profiles.find(profile => profile.catalogKey === input.catalogKey);
  if (!current) throw new ApiError(409, 'MIGRATION_REJECTED', 'Regression 找不到 reviewed Profile baseline。');
  const citations = citationsForSourceKeys(input.authority, input.sourceKeys);
  const afterAuthority: ReviewedCompatibilityAuthority = {
    ...input.authority,
    profiles: input.authority.profiles.map(profile => profile.catalogKey === input.catalogKey ? {
      ...profile,
      behaviorTraits: [...input.behaviorTraits],
      minimumGroupSize: input.minimumGroupSize ?? undefined,
      predationTargets: [...input.predationTargets],
      confidence: input.confidence,
      citations,
      version: profile.version + 1,
    } : profile),
  };
  const target = input.fish.find(item => item.id === input.catalogKey);
  if (!target) throw new ApiError(409, 'MIGRATION_REJECTED', 'Regression 找不到对应的 Published Product species。');
  const pairs = input.fish.filter(item => item.id !== target.id).map(item => [target, item] as [Fish, Fish]);
  return runRegression('profile', input.catalogKey, input.baselineVersion, input.authoritySequence, catalogFingerprint(input.fish), pairs,
    createAuthorityEvidenceProvider(input.authority, `reviewed-db-seq-${input.authoritySequence}`),
    createAuthorityEvidenceProvider(afterAuthority, `draft-profile-seq-${input.authoritySequence}`));
};
export const buildPairRuleRevisionRegression = (input: {
  authority: ReviewedCompatibilityAuthority;
  fish: Fish[];
  authoritySequence: number;
  catalogKeys: [string, string];
  baselineVersion: number;
  verdict: ReviewedCompatibilityPairRuleDto['verdict'];
  riskType: string;
  reason: string;
  mitigation: string[];
  basis: ReviewedCompatibilityPairRuleDto['basis'];
  confidence: ReviewedCompatibilityPairRuleDto['confidence'];
  sourceKeys: string[];
}) => {
  const normalizedKey = pairKey(...input.catalogKeys);
  const current = input.authority.pairRules.find(rule => pairKey(...rule.catalogKeys) === normalizedKey);
  if (!current) throw new ApiError(409, 'MIGRATION_REJECTED', 'Regression 找不到 reviewed Pair Rule baseline。');
  const citations = citationsForSourceKeys(input.authority, input.sourceKeys);
  const afterAuthority: ReviewedCompatibilityAuthority = {
    ...input.authority,
    pairRules: input.authority.pairRules.map(rule => pairKey(...rule.catalogKeys) === normalizedKey ? {
      ...rule,
      verdict: input.verdict,
      riskType: input.riskType,
      reason: input.reason,
      mitigation: [...input.mitigation],
      basis: input.basis,
      confidence: input.confidence,
      citations,
      version: rule.version + 1,
    } : rule),
  };
  const left = input.fish.find(item => item.id === input.catalogKeys[0]);
  const right = input.fish.find(item => item.id === input.catalogKeys[1]);
  if (!left || !right) throw new ApiError(409, 'MIGRATION_REJECTED', 'Regression 找不到 Pair Rule 对应的 Published Product species。');
  return runRegression('pair_rule', normalizedKey, input.baselineVersion, input.authoritySequence, catalogFingerprint(input.fish), [[left, right]],
    createAuthorityEvidenceProvider(input.authority, `reviewed-db-seq-${input.authoritySequence}`),
    createAuthorityEvidenceProvider(afterAuthority, `draft-pair-seq-${input.authoritySequence}`));
};

export const loadStableCompatibilityRegressionContext = async (client: SupabaseClient) => {
  const beforeSequence = await loadCompatibilityAuthoritySequence(client);
  const [authority, fish] = await Promise.all([
    loadReviewedCompatibilityAuthority(client),
    loadPublishedCompatibilityFish(client),
  ]);
  const afterSequence = await loadCompatibilityAuthoritySequence(client);
  if (beforeSequence !== afterSequence) {
    throw new ApiError(409, 'VERSION_CONFLICT', 'Compatibility authority 在 regression 计算期间发生变化，请重新提交审核。');
  }
  return { authority, fish, authoritySequence: afterSequence };
};

export const isCompatibilityRegressionReportFresh = (
  stored: Partial<CompatibilityRegressionReport> | null | undefined,
  fresh: CompatibilityRegressionReport,
) => Boolean(stored
  && stored.kind === fresh.kind
  && stored.targetKey === fresh.targetKey
  && stored.baselineVersion === fresh.baselineVersion
  && stored.authoritySequence === fresh.authoritySequence
  && stored.engineVersion === fresh.engineVersion
  && stored.catalogFingerprint === fresh.catalogFingerprint
  && stored.regressionDigest === fresh.regressionDigest
  && stored.evaluatedScenarios === fresh.evaluatedScenarios
  && stored.changedScenarios === fresh.changedScenarios);

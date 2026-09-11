import type { CompatibilityStageRiskRuleInput, CompatibilityStockingGuidance, ReviewedCompatibilityPairRuleDto, ReviewedCompatibilityProfileDto } from '../../../packages/contracts/src';
import type { Fish } from '../../types';
import { evaluateTankCompatibility, type CompatibilityEvidenceProvider, type TankCompatibilityResult } from '../compatibility/compatibility.service';
import type { CompatibilityBootstrapResponse } from '../../data/runtimeCompatibilityRegistry';
import type { CompatibilityRegressionReport } from './compatibility-admin.service';

type RegressionDecision = {
  status: TankCompatibilityResult['status'];
  riskLevel: TankCompatibilityResult['riskLevel'];
  blocking: string[];
  warning: string[];
  missing: string[];
};

const pairKey = (left: string, right: string) => [left, right].sort().join('__');
const stableHash = (value: unknown) => {
  const text = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

const toProvider = (authority: CompatibilityBootstrapResponse, authorityVersion: string): CompatibilityEvidenceProvider => {
  const profiles = new Map(authority.profiles.map(profile => [profile.catalogKey, profile]));
  const pairs = new Map(authority.pairRules.map(rule => [pairKey(...rule.catalogKeys), rule]));
  return {
    authorityVersion,
    getProfile: speciesId => {
      const profile = profiles.get(speciesId);
      return profile ? {
        speciesId, behaviorTraits: [...profile.behaviorTraits], minimumGroupSize: profile.minimumGroupSize,
        predationTargets: [...profile.predationTargets], confidence: profile.confidence,
        reviewStatus: 'reviewed', citations: profile.citations.map(source => ({ ...source })),
        requiredFacts: [...profile.requiredFacts],
        ...(profile.stockingGuidance ? { stockingGuidance: { ...profile.stockingGuidance, constraints: [...profile.stockingGuidance.constraints], evidenceIds: [...profile.stockingGuidance.evidenceIds] } } : {}),
      } : undefined;
    },
    getStageRisks: speciesId => (profiles.get(speciesId)?.stageRiskRules || []).map(rule => ({
      speciesId, youngerStages: [...rule.youngerStages], olderStages: [...rule.olderStages], verdict: rule.verdict,
      riskType: rule.riskType as 'conspecific_fry_predation', reason: rule.reason, mitigation: [...rule.mitigation],
      basis: rule.basis, confidence: rule.confidence, reviewStatus: rule.reviewStatus, affectedSpeciesIds: [speciesId],
      citations: rule.citations.map(source => ({ ...source })),
    })),
    getPairRule: (leftId, rightId) => {
      const rule = pairs.get(pairKey(leftId, rightId));
      return rule ? {
        speciesIds: [...rule.catalogKeys] as [string, string], verdict: rule.verdict, riskType: rule.riskType,
        reason: rule.reason, mitigation: [...rule.mitigation], basis: rule.basis, confidence: rule.confidence,
        reviewStatus: 'reviewed', affectedSpeciesIds: [...rule.catalogKeys], citations: rule.citations.map(source => ({ ...source })),
      } : undefined;
    },
  };
};

const ruleSignature = (rule: TankCompatibilityResult['blockingRules'][number]) => [
  rule.code, rule.evidence, rule.basis, rule.confidence, rule.reviewStatus,
].join('|');

const decisionSignature = (result: TankCompatibilityResult): RegressionDecision => ({
  status: result.status, riskLevel: result.riskLevel,
  blocking: result.blockingRules.map(ruleSignature).sort(),
  warning: result.warningRules.map(ruleSignature).sort(),
  missing: result.missingData.map(ruleSignature).sort(),
});
const decisionsEqual = (left: RegressionDecision, right: RegressionDecision) => JSON.stringify(left) === JSON.stringify(right);
const neutralTank = {
  id: 'local-compatibility-regression-neutral-tank', name: 'Local Compatibility regression neutral tank', fishes: [],
  dimensions: { length: '200', width: '100', height: '100' }, waterType: 'Freshwater' as const,
  targetTemperature: '25', equipment: { filter: '桶滤' as const, heater: true, oxygen: true, light: '普通灯' as const },
};

const evaluatePairScenarios = (left: Fish, right: Fish, provider: CompatibilityEvidenceProvider) => ([
  ['species_only', evaluateTankCompatibility({ scope: 'species_only', existingSpecies: [left], candidateSpecies: right, evidenceProvider: provider })],
  ['tank_left_to_right', evaluateTankCompatibility({ tank: neutralTank, existingSpecies: [left], candidateSpecies: right, evidenceProvider: provider })],
  ['tank_right_to_left', evaluateTankCompatibility({ tank: neutralTank, existingSpecies: [right], candidateSpecies: left, evidenceProvider: provider })],
] as const);

const runRegression = (kind: CompatibilityRegressionReport['kind'], targetKey: string, baselineVersion: number, authoritySequence: number,
  fish: Fish[], pairs: Array<[Fish, Fish]>, before: CompatibilityBootstrapResponse, after: CompatibilityBootstrapResponse, stageRiskSpecies: Fish[] = []): CompatibilityRegressionReport => {
  const changes: CompatibilityRegressionReport['changes'] = [];
  const rows: unknown[] = [];
  let evaluatedScenarios = 0;
  const beforeProvider = toProvider(before, `local-reviewed-${authoritySequence}`);
  const afterProvider = toProvider(after, `local-draft-${authoritySequence}`);
  for (const [left, right] of pairs) {
    const beforeRows = evaluatePairScenarios(left, right, beforeProvider);
    const afterRows = evaluatePairScenarios(left, right, afterProvider);
    for (let index = 0; index < beforeRows.length; index += 1) {
      const [scenario, beforeResult] = beforeRows[index];
      const [, afterResult] = afterRows[index];
      evaluatedScenarios += 1;
      const beforeDecision = decisionSignature(beforeResult);
      const afterDecision = decisionSignature(afterResult);
      rows.push([scenario, left.id, right.id, beforeDecision, afterDecision]);
      if (!decisionsEqual(beforeDecision, afterDecision)) {
        changes.push({ scenario, species: [left.id, right.id], before: beforeDecision, after: afterDecision });
      }
    }
  }
  for (const species of stageRiskSpecies) {
    const existing = [{ species, record: { quantity: 1, batches: [{ id: 'regression-adult', quantity: 1, entryDate: '2026-01-01', lifeStage: 'adult' as const, reproductiveState: 'unknown' as const, stateUpdatedAt: '2026-01-01T00:00:00.000Z' }] } }];
    const beforeResult = evaluateTankCompatibility({ scope: 'species_only', existingSpecies: existing, candidateSpecies: species, candidateLifeStage: 'fry', evidenceProvider: beforeProvider });
    const afterResult = evaluateTankCompatibility({ scope: 'species_only', existingSpecies: existing, candidateSpecies: species, candidateLifeStage: 'fry', evidenceProvider: afterProvider });
    const beforeDecision = decisionSignature(beforeResult);
    const afterDecision = decisionSignature(afterResult);
    const scenario = 'same_species_adult_to_fry';
    evaluatedScenarios += 1;
    rows.push([scenario, species.id, species.id, beforeDecision, afterDecision]);
    if (!decisionsEqual(beforeDecision, afterDecision)) changes.push({ scenario, species: [species.id, species.id], before: beforeDecision, after: afterDecision });
  }
  return {
    kind, targetKey, baselineVersion, authoritySequence,
    engineVersion: 'local-compatibility-regression-v1',
    catalogFingerprint: stableHash(fish.map(item => [item.id, item.waterTemperature, item.phLevel, item.tankSize, item.temperament, item.size])),
    regressionDigest: stableHash(rows), evaluatedScenarios, changedScenarios: changes.length,
    changes: changes.slice(0, 120), generatedAt: new Date().toISOString(),
  };
};
const runtimeCitationIds = (authority: CompatibilityBootstrapResponse) => new Map(
  [...authority.profiles.flatMap(item => item.citations), ...authority.profiles.flatMap(item => item.stageRiskRules.flatMap(rule => rule.citations)), ...authority.pairRules.flatMap(item => item.citations)].map(source => [source.id, source]),
);

export const buildLocalProfileRegression = (input: {
  authority: CompatibilityBootstrapResponse;
  fish: Fish[];
  authoritySequence: number;
  catalogKey: string;
  baselineVersion: number;
  behaviorTraits: string[];
  minimumGroupSize?: number | null;
  predationTargets: string[];
  confidence: ReviewedCompatibilityProfileDto['confidence'];
  requiredFacts: ReviewedCompatibilityProfileDto['requiredFacts'];
  stockingGuidance?: ReviewedCompatibilityProfileDto['stockingGuidance'];
  stageRiskRules: CompatibilityStageRiskRuleInput[];
  sourceKeys: string[];
}) => {
  const current = input.authority.profiles.find(item => item.catalogKey === input.catalogKey);
  if (!current) throw new Error('Local regression 找不到 reviewed Profile baseline。');
  const sourceById = runtimeCitationIds(input.authority);
  const citations = input.sourceKeys.map(key => sourceById.get(key)).filter(Boolean);
  if (citations.length !== input.sourceKeys.length) throw new Error('Local regression 无法解析 canonical Evidence。');
  const stageRiskRules = input.stageRiskRules.map(rule => ({
    ruleKey: rule.ruleKey, youngerStages: [...rule.youngerStages], olderStages: [...rule.olderStages], verdict: rule.verdict,
    riskType: rule.riskType, reason: rule.reason, mitigation: [...rule.mitigation], basis: rule.basis, confidence: rule.confidence,
    reviewStatus: 'reviewed' as const, citations: rule.citations.map(source => {
      const resolved = sourceById.get(source.sourceKey);
      if (!resolved) throw new Error(`Local regression 无法解析 Stage Risk Evidence ${source.sourceKey}。`);
      return { ...resolved };
    }),
  }));
  const after: CompatibilityBootstrapResponse = {
    ...input.authority,
    profiles: input.authority.profiles.map(profile => profile.catalogKey === input.catalogKey ? {
      ...profile,
      behaviorTraits: [...input.behaviorTraits], minimumGroupSize: input.minimumGroupSize ?? undefined,
      predationTargets: [...input.predationTargets], confidence: input.confidence,
      citations: citations.map(source => ({ ...source! })), requiredFacts: [...input.requiredFacts],
      ...(input.stockingGuidance ? { stockingGuidance: { ...input.stockingGuidance, constraints: [...input.stockingGuidance.constraints], evidenceIds: [...input.stockingGuidance.evidenceIds] } } : { stockingGuidance: undefined }),
      stageRiskRules, version: profile.version + 1,
    } : profile),
  };
  const target = input.fish.find(item => item.id === input.catalogKey);
  if (!target) throw new Error('Local regression 找不到 Published Product species。');
  const pairs = input.fish.filter(item => item.id !== target.id).map(item => [target, item] as [Fish, Fish]);
  return runRegression('profile', input.catalogKey, input.baselineVersion, input.authoritySequence, input.fish, pairs, input.authority, after, [target]);
};

export const buildLocalPairRegression = (input: {
  authority: CompatibilityBootstrapResponse;
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
  const normalized = pairKey(...input.catalogKeys);
  const current = input.authority.pairRules.find(item => pairKey(...item.catalogKeys) === normalized);
  if (!current) throw new Error('Local regression 找不到 reviewed Pair Rule baseline。');
  const sourceById = runtimeCitationIds(input.authority);
  const citations = input.sourceKeys.map(key => sourceById.get(key)).filter(Boolean);
  if (citations.length !== input.sourceKeys.length) throw new Error('Local regression 无法解析 canonical Evidence。');
  const after: CompatibilityBootstrapResponse = {
    ...input.authority,
    pairRules: input.authority.pairRules.map(rule => pairKey(...rule.catalogKeys) === normalized ? {
      ...rule,
      verdict: input.verdict, riskType: input.riskType, reason: input.reason,
      mitigation: [...input.mitigation], basis: input.basis, confidence: input.confidence,
      citations: citations.map(source => ({ ...source! })), version: rule.version + 1,
    } : rule),
  };
  const left = input.fish.find(item => item.id === input.catalogKeys[0]);
  const right = input.fish.find(item => item.id === input.catalogKeys[1]);
  if (!left || !right) throw new Error('Local regression 找不到 Pair Rule 对应的 Published Product species。');
  return runRegression('pair_rule', normalized, input.baselineVersion, input.authoritySequence, input.fish, [[left, right]], input.authority, after);
};

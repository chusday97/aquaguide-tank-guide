import {
  evaluateSpeciesCombination as evaluateLegacySpeciesCombination,
  evaluateTankCompatibility as evaluateLegacyTankCompatibility,
  getTankCompatibilityAddPolicy as getLegacyTankCompatibilityAddPolicy,
  getTankCompatibilityStatusLabel as getLegacyTankCompatibilityStatusLabel,
  type EvaluateTankCompatibilityInput,
  type TankCompatibilityAddPolicy,
  type TankCompatibilityResult,
  type TankCompatibilityRule,
  type TankCompatibilityStatus,
} from '../../lib/tankCompatibilityEngine';
import type { CompatibilityIntent } from '../../../packages/domain-rules/src';
import { getCompatibilityAddPolicy } from '../../../packages/domain-rules/src';

/**
 * Compatibility is the application boundary for all callers.
 *
 * The legacy engine remains an evidence implementation detail. Its result is
 * normalized here so every service consumer receives the Domain Rules status
 * and policy, while preserving the existing evidence-rich shape for the UI.
 */
export const evaluateTankCompatibility = (input: EvaluateTankCompatibilityInput): TankCompatibilityResult => (
  normalizeCanonicalResult(evaluateLegacyTankCompatibility(input))
);

export const evaluateSpeciesCombination = (species: Parameters<typeof evaluateLegacySpeciesCombination>[0]): TankCompatibilityResult => (
  normalizeCanonicalResult(evaluateLegacySpeciesCombination(species))
);

export const getTankCompatibilityAddPolicy = (status: TankCompatibilityStatus): TankCompatibilityAddPolicy => (
  getLegacyTankCompatibilityAddPolicy(status)
);

export const getTankCompatibilityStatusLabel = (status: TankCompatibilityStatus): string => (
  getLegacyTankCompatibilityStatusLabel(status)
);

export type CanonicalCompatibilityDecision = {
  status: TankCompatibilityStatus;
  addPolicy: TankCompatibilityAddPolicy;
  ruleCodes: string[];
  catalogVersion: string;
  ruleVersion: string;
};

export const getCompatibilityDecision = (
  result: TankCompatibilityResult,
  intent: CompatibilityIntent = result.metadata.intent,
): CanonicalCompatibilityDecision => ({
  status: result.metadata.domainStatus,
  addPolicy: getCompatibilityAddPolicy(intent, result.metadata.domainStatus),
  ruleCodes: result.metadata.domainRuleCodes,
  catalogVersion: result.metadata.catalogVersion,
  ruleVersion: result.metadata.ruleVersion,
});

const normalizeCanonicalResult = (result: TankCompatibilityResult): TankCompatibilityResult => {
  const decision = getCompatibilityDecision(result);
  if (decision.status === result.status) return result;
  const domainRules = decision.ruleCodes
    .map(code => DOMAIN_RULE_EVIDENCE[code])
    .filter((rule): rule is TankCompatibilityRule => Boolean(rule));
  const hasRule = (rules: TankCompatibilityRule[], code: string) => rules.some(rule => rule.code === code);
  const blockingRules = decision.status === 'not_recommended'
    ? [...result.blockingRules, ...domainRules.filter(rule => !hasRule(result.blockingRules, rule.code))]
    : result.blockingRules;
  const missingData = decision.status === 'insufficient_data'
    ? [...result.missingData, ...domainRules.filter(rule => !hasRule(result.missingData, rule.code))]
    : result.missingData;
  const warningRules = decision.status === 'caution'
    ? [...result.warningRules, ...domainRules.filter(rule => !hasRule(result.warningRules, rule.code))]
    : result.warningRules;
  const summary = decision.status === 'not_recommended'
    ? blockingRules[0]?.evidence || result.summary
    : decision.status === 'insufficient_data'
      ? missingData[0]?.evidence || '关键资料不足，暂时无法可靠判断。'
      : decision.status === 'caution'
        ? warningRules[0]?.evidence || result.summary
        : result.summary;
  return {
    ...result,
    status: decision.status,
    riskLevel: decision.status === 'not_recommended'
      ? 'high'
      : decision.status === 'insufficient_data'
        ? 'unknown'
        : decision.status === 'caution'
          ? 'medium'
          : 'none',
    summary,
    blockingRules,
    warningRules,
    missingData,
  };
};

const DOMAIN_RULE_EVIDENCE: Record<string, TankCompatibilityRule> = {
  water_type_conflict: {
    code: 'water_type_conflict',
    title: '物种水体不一致',
    evidence: '组合中的物种水体类型不一致，不能按同一水体规划加入。',
    severity: 'high',
    basis: 'tank_condition',
    confidence: 'high',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  },
  candidate_tank_water_type_conflict: {
    code: 'candidate_tank_water_type_conflict',
    title: '候选物种与鱼缸水体不一致',
    evidence: '候选物种水体类型与当前鱼缸不一致，不能规划加入。',
    severity: 'high',
    basis: 'tank_condition',
    confidence: 'high',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  },
  predation_risk: {
    code: 'predation_risk',
    title: '捕食或吞食风险',
    evidence: '已审核资料显示组合存在捕食或吞食风险。',
    severity: 'high',
    basis: 'species_trait',
    confidence: 'high',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  },
  territorial_conflict: {
    code: 'territorial_conflict',
    title: '领地冲突',
    evidence: '已审核资料显示组合存在领地防御冲突。',
    severity: 'high',
    basis: 'species_trait',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  },
  single_housing_required: {
    code: 'single_housing_required',
    title: '更适合单养',
    evidence: '已审核资料显示候选物种不适合作为普通混养对象。',
    severity: 'high',
    basis: 'species_trait',
    confidence: 'medium',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  },
  reviewed_pair_rule: {
    code: 'reviewed_pair_rule',
    title: '已审核配对需要谨慎',
    evidence: '已审核配对资料要求在明确确认后再规划加入。',
    severity: 'medium',
    basis: 'pair_rule',
    confidence: 'high',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  },
  candidate_water_type_missing: {
    code: 'candidate_water_type_missing',
    title: '缺少候选物种水体',
    evidence: '候选物种尚未记录淡水或海水类型，暂时无法可靠判断。',
    severity: 'medium',
    basis: 'species_trait',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
  tank_water_type_missing: {
    code: 'tank_water_type_missing',
    title: '缺少鱼缸水体',
    evidence: '当前鱼缸尚未确认淡水或海水类型，暂时无法可靠判断。',
    severity: 'medium',
    basis: 'tank_condition',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
  tank_volume_missing: {
    code: 'tank_volume_missing',
    title: '缺少鱼缸容量',
    evidence: '当前鱼缸容量尚未完整记录，暂时无法可靠判断负荷。',
    severity: 'medium',
    basis: 'tank_condition',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
  tank_temperature_missing: {
    code: 'tank_temperature_missing',
    title: '缺少目标水温',
    evidence: '当前鱼缸目标水温尚未记录，暂时无法可靠判断。',
    severity: 'medium',
    basis: 'tank_condition',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
  species_evidence_unreviewed: {
    code: 'species_evidence_unreviewed',
    title: '物种资料尚未审核',
    evidence: '至少一个物种的关键行为资料尚未审核，不能据此给出安全结论。',
    severity: 'medium',
    basis: 'species_trait',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
  temperature_range_missing: {
    code: 'temperature_range_missing',
    title: '缺少温度适宜区间',
    evidence: '组合中至少一个物种缺少可比较的适宜温度区间。',
    severity: 'medium',
    basis: 'species_trait',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
  ph_range_missing: {
    code: 'ph_range_missing',
    title: '缺少 pH 适宜区间',
    evidence: '组合中至少一个物种缺少可比较的 pH 适宜区间。',
    severity: 'medium',
    basis: 'species_trait',
    confidence: 'unknown',
    reviewStatus: 'draft',
    affectedSpeciesIds: [],
    citations: [],
  },
};

export type {
  EvaluateTankCompatibilityInput,
  TankCompatibilityAddPolicy,
  TankCompatibilityResult,
  TankCompatibilityRule,
  TankCompatibilityStatus,
};

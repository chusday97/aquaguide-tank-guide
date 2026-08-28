import type { CompatibilityDecision } from '../../../packages/domain-rules/src';
import type {
  TankCompatibilityResult,
  TankCompatibilityRiskLevel,
  TankCompatibilityRule,
} from '../tankCompatibilityEngine';

const DOMAIN_RULE_EVIDENCE: Record<string, TankCompatibilityRule> = {
  candidate_missing: {
    code: 'candidate_missing', title: '缺少候选生物', evidence: '请先选择要评估的生物。', severity: 'high', basis: 'rule_inference', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  empty_tank_no_existing_species: {
    code: 'empty_tank_no_existing_species', title: '暂无已记录的缸内生物', evidence: '当前鱼缸还没有已记录的其他生物，暂时无法判断混养关系。', severity: 'medium', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_missing: {
    code: 'tank_missing', title: '缺少当前鱼缸', evidence: '请先选择一个鱼缸，再判断混养适配。', severity: 'high', basis: 'tank_condition', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  water_type_unknown: {
    code: 'water_type_unknown', title: '水体类型未确认', evidence: '组合中至少一个物种尚未确认淡水或海水类型，暂时无法可靠判断。', severity: 'medium', basis: 'tank_condition', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  water_type_conflict: {
    code: 'water_type_conflict', title: '物种水体不一致', evidence: '组合中的物种水体类型不一致，不能按同一水体规划加入。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  candidate_tank_water_type_conflict: {
    code: 'candidate_tank_water_type_conflict', title: '候选物种与鱼缸水体不一致', evidence: '候选物种水体类型与当前鱼缸不一致，不能规划加入。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  predation_risk: {
    code: 'predation_risk', title: '捕食或吞食风险', evidence: '已审核资料显示组合存在捕食或吞食风险。', severity: 'high', basis: 'species_trait', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  territorial_conflict: {
    code: 'territorial_conflict', title: '领地冲突', evidence: '已审核资料显示组合存在领地防御冲突。', severity: 'high', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  single_housing_required: {
    code: 'single_housing_required', title: '更适合单养', evidence: '已审核资料显示候选物种不适合作为普通混养对象。', severity: 'high', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  reviewed_pair_rule: {
    code: 'reviewed_pair_rule', title: '已审核配对需要谨慎', evidence: '已审核配对资料要求在明确确认后再规划加入。', severity: 'medium', basis: 'pair_rule', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  candidate_water_type_missing: {
    code: 'candidate_water_type_missing', title: '缺少候选物种水体', evidence: '候选物种尚未记录淡水或海水类型，暂时无法可靠判断。', severity: 'medium', basis: 'species_trait', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  tank_water_type_missing: {
    code: 'tank_water_type_missing', title: '缺少鱼缸水体', evidence: '当前鱼缸尚未确认淡水或海水类型，暂时无法可靠判断。', severity: 'medium', basis: 'tank_condition', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  tank_volume_missing: {
    code: 'tank_volume_missing', title: '缺少鱼缸容量', evidence: '当前鱼缸容量尚未完整记录，暂时无法可靠判断负荷。', severity: 'medium', basis: 'tank_condition', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  tank_temperature_missing: {
    code: 'tank_temperature_missing', title: '缺少目标水温', evidence: '当前鱼缸目标水温尚未记录，暂时无法可靠判断。', severity: 'medium', basis: 'tank_condition', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  species_evidence_unreviewed: {
    code: 'species_evidence_unreviewed', title: '物种资料尚未审核', evidence: '至少一个物种的关键行为资料尚未审核，不能据此给出安全结论。', severity: 'medium', basis: 'species_trait', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  temperature_range_missing: {
    code: 'temperature_range_missing', title: '缺少温度适宜区间', evidence: '组合中至少一个物种缺少可比较的适宜温度区间。', severity: 'medium', basis: 'species_trait', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  ph_range_missing: {
    code: 'ph_range_missing', title: '缺少 pH 适宜区间', evidence: '组合中至少一个物种缺少可比较的 pH 区间。', severity: 'medium', basis: 'species_trait', confidence: 'unknown', reviewStatus: 'draft', affectedSpeciesIds: [], citations: [],
  },
  temperature_range_conflict: {
    code: 'temperature_range_conflict', title: '温度区间不重合', evidence: '组合中的物种没有共同的适宜温度区间，不能按同一温度规划加入。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  ph_range_conflict: {
    code: 'ph_range_conflict', title: 'pH 区间差异较大', evidence: '组合中的物种没有明确的共同 pH 区间，需先确认实际水质和物种敏感度。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_temperature_conflict: {
    code: 'tank_temperature_conflict', title: '鱼缸温度不匹配', evidence: '当前鱼缸目标温度不在候选物种的已审核适宜范围内。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_volume_below_species_minimum: {
    code: 'tank_volume_below_species_minimum', title: '水体低于物种最低建议', evidence: '当前水体低于候选物种的已审核最低建议，需要先调整空间或更换候选。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_length_below_species_minimum: {
    code: 'tank_length_below_species_minimum', title: '缸长低于物种最低建议', evidence: '当前鱼缸长度低于候选物种的已审核最低建议，需要先确认活动空间。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
};

const hasRule = (rules: TankCompatibilityRule[], code: string) => rules.some(rule => rule.code === code);

export const applyCanonicalCompatibilityDecision = (
  result: TankCompatibilityResult,
  decision: CompatibilityDecision,
): TankCompatibilityResult => {
  const domainRules = decision.ruleCodes
    .map(code => DOMAIN_RULE_EVIDENCE[code])
    .filter((rule): rule is TankCompatibilityRule => Boolean(rule));
  const blockingCodes = new Set(['water_type_conflict', 'candidate_tank_water_type_conflict', 'temperature_range_conflict', 'tank_temperature_conflict', 'predation_risk', 'territorial_conflict', 'single_housing_required']);
  const warningCodes = new Set(['reviewed_pair_rule', 'ph_range_conflict', 'tank_volume_below_species_minimum', 'tank_length_below_species_minimum']);
  const domainBlockingRules = domainRules.filter(rule => blockingCodes.has(rule.code));
  const domainWarningRules = domainRules.filter(rule => warningCodes.has(rule.code));
  const domainMissingRules = domainRules.filter(rule => !blockingCodes.has(rule.code) && !warningCodes.has(rule.code));
  const blockingRules = [...result.blockingRules, ...domainBlockingRules.filter(rule => !hasRule(result.blockingRules, rule.code))];
  const missingData = [...result.missingData, ...domainMissingRules.filter(rule => !hasRule(result.missingData, rule.code))];
  const warningRules = [...result.warningRules, ...domainWarningRules.filter(rule => !hasRule(result.warningRules, rule.code))];
  const riskLevel: TankCompatibilityRiskLevel = decision.status === 'not_recommended'
    ? 'high'
    : decision.status === 'insufficient_data'
      ? 'unknown'
      : decision.status === 'caution'
        ? 'medium'
        : 'none';
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
    riskLevel,
    summary,
    blockingRules,
    warningRules,
    missingData,
  };
};

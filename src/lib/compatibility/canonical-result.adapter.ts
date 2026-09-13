import type { CompatibilityDecision } from '../../../packages/domain-rules/src';
import type {
  TankCompatibilityResult,
  TankCompatibilityRiskLevel,
  TankCompatibilityRule,
  TankCompatibilityStatus,
} from '../tankCompatibilityEngine';

const DOMAIN_RULE_EVIDENCE: Record<string, TankCompatibilityRule> = {
  compatibility_clear: {
    code: 'compatibility_clear', title: '未发现明确阻断', evidence: '已审核事实与当前环境没有发现明确的阻断规则。', severity: 'info', basis: 'rule_inference', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  bioload_screening_high: {
    code: 'bioload_screening_high', title: '负荷筛查偏高', evidence: '按当前粗粒度体型与数量筛查，负荷偏高；这只是提醒，不等于水体不足或必须换缸，需要结合过滤、成体体型、维护记录与实际水质继续判断。', severity: 'medium', basis: 'tank_condition', confidence: 'low', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  bioload_screening_elevated: {
    code: 'bioload_screening_elevated', title: '负荷筛查需要留意', evidence: '按当前粗粒度体型与数量筛查，负荷有所升高；这不是硬性上限，建议结合鱼缸运行稳定性继续观察。', severity: 'medium', basis: 'tank_condition', confidence: 'low', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  bioload_screening_high_stable_context: {
    code: 'bioload_screening_high_stable_context', title: '稳定鱼缸下仍需留意负荷', evidence: '当前鱼缸已有较长稳定运行与规律维护记录，但加入后粗粒度负荷筛查仍偏高；稳定历史可以降低误报概率，不能证明新增后一定安全。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  bioload_screening_elevated_stable_context: {
    code: 'bioload_screening_elevated_stable_context', title: '稳定运行背景已纳入判断', evidence: '当前鱼缸已有较长稳定运行与规律维护记录，粗粒度负荷仅轻度偏高，因此保留为背景提示，不单独升级为风险结论。', severity: 'info', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
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
  juvenile_predation_risk: {
    code: 'juvenile_predation_risk', title: '幼体阶段仍有捕食风险', evidence: '当前体型可能暂时降低捕食风险，但成体体型和行为仍需纳入长期规划，不能据此确认长期兼容。', severity: 'medium', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  predation_vulnerability_context: {
    code: 'predation_vulnerability_context', title: '存在被捕食脆弱性', evidence: '组合中一方是鱼类，另一方有已审核的被捕食脆弱性。即使对方不是明确捕食者，也不应把“暂时没追吃”当成长期安全。', severity: 'medium', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  territorial_conflict: {
    code: 'territorial_conflict', title: '领地管理需要观察', evidence: '已审核资料显示组合存在领地防御或空间重叠风险，应通过分区、遮挡和现实观察管理，不把领地性标签直接当作阻断。', severity: 'medium', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  territorial_pressure_context: {
    code: 'territorial_pressure_context', title: '和平鱼可能承受领地压力', evidence: '组合中一方有已审核的领地行为，而另一方是低领地或非领地型物种；这不是绝对禁配，但不能把“只有一方有领地性”当成无风险。', severity: 'medium', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  breeding_territory_active: {
    code: 'breeding_territory_active', title: '繁殖护域需要观察', evidence: '物种处于护卵、护幼或产卵状态时，领地和追逐行为可能暂时增强；应先观察并准备分隔方案。', severity: 'medium', basis: 'species_trait', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
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
  ph_range_edge_overlap: {
    code: 'ph_range_edge_overlap', title: 'pH 适宜区间只在边界相接', evidence: '两个物种的已审核 pH 区间只在单一边界值相交，长期共同水质几乎没有调整余量，应先确认实际稳定水质再决定。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_temperature_conflict: {
    code: 'tank_temperature_conflict', title: '鱼缸温度不匹配', evidence: '当前鱼缸目标温度不在候选物种的已审核适宜范围内。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_volume_below_species_minimum: {
    code: 'tank_volume_below_species_minimum', title: '水体低于物种建议', evidence: '当前水体低于该物种的参考建议值。它用于提醒空间与长期维护压力，不单独作为“不能养”的硬阻断。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  tank_length_below_species_minimum: {
    code: 'tank_length_below_species_minimum', title: '缸长低于物种建议', evidence: '当前鱼缸长度低于该物种的参考建议值，需要结合成体尺寸、活动方式和可用空间进一步判断。', severity: 'medium', basis: 'tank_condition', confidence: 'medium', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  minimum_group_not_met: {
    code: 'minimum_group_not_met', title: '群体数量还不够', evidence: '该物种有已审核的最低群体数量要求；当前计划总数不足时，不建议把少量个体当成更保守的长期饲养方案。', severity: 'medium', basis: 'species_trait', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  fin_nipping_group_pressure: {
    code: 'fin_nipping_group_pressure', title: '群体不足会放大追鳍压力', evidence: '该物种有已审核的追鳍倾向，而且当前同种数量低于最低群体要求；先处理同种群体结构，再评估与其他鱼长期混养。', severity: 'medium', basis: 'species_trait', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  fin_nipping_target_vulnerability: {
    code: 'fin_nipping_target_vulnerability', title: '追鳍鱼与脆弱鳍型不匹配', evidence: '组合中一方有已审核的追鳍倾向，另一方有已审核的追鳍脆弱特征或慢游特征；不要把这类组合当作普通兼容关系。', severity: 'medium', basis: 'species_trait', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  shared_bottom_zone_context: {
    code: 'shared_bottom_zone_context', title: '共享底层活动区', evidence: '两种已审核物种都主要使用底层空间；这只是空间与投喂背景提示，不单独代表不兼容。规划时应留意底床可用面积、躲避位和沉底饵料是否都能被吃到。', severity: 'info', basis: 'species_trait', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  observed_intervention: {
    code: 'observed_intervention', title: '现实观察需要干预', evidence: '已记录持续追逐或进食排除，建议先暂停新增并调整环境或分隔观察。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
  observed_emergency: {
    code: 'observed_emergency', title: '现实观察达到紧急等级', evidence: '已记录伤口、呼吸异常或多只死亡，建议立即隔离并优先处理现实风险。', severity: 'high', basis: 'tank_condition', confidence: 'high', reviewStatus: 'reviewed', affectedSpeciesIds: [], citations: [],
  },
};

const uniqueRules = (rules: TankCompatibilityRule[]) => {
  const seen = new Set<string>();
  return rules.filter(rule => {
    const key = `${rule.code}::${rule.evidence}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const LEGACY_SOFT_CAPACITY_CODES = new Set(['bioload_over_limit', 'bioload_near_limit']);
const CANONICAL_REVIEWED_STAGE_HARD_BLOCK_CODES = new Set(['conspecific_fry_predation']);

export const applyCanonicalCompatibilityDecision = (
  result: TankCompatibilityResult,
  decision: CompatibilityDecision,
): TankCompatibilityResult => {
  const domainRules = decision.ruleCodes
    .map(code => DOMAIN_RULE_EVIDENCE[code])
    .filter((rule): rule is TankCompatibilityRule => Boolean(rule));
  const blockingCodes = new Set(['water_type_conflict', 'candidate_tank_water_type_conflict', 'temperature_range_conflict', 'tank_temperature_conflict', 'predation_risk', 'single_housing_required', 'observed_emergency']);
  const warningCodes = new Set(['reviewed_pair_rule', 'ph_range_conflict', 'ph_range_edge_overlap', 'tank_volume_below_species_minimum', 'tank_length_below_species_minimum', 'territorial_conflict', 'territorial_pressure_context', 'breeding_territory_active', 'juvenile_predation_risk', 'observed_intervention', 'bioload_screening_high', 'bioload_screening_elevated', 'bioload_screening_high_stable_context', 'minimum_group_not_met', 'fin_nipping_group_pressure', 'fin_nipping_target_vulnerability', 'predation_vulnerability_context']);
  const domainBlockingRules = domainRules.filter(rule => blockingCodes.has(rule.code));
  const domainWarningRules = domainRules.filter(rule => warningCodes.has(rule.code));
  const informationalCodes = new Set(['compatibility_clear', 'bioload_screening_elevated_stable_context', 'shared_bottom_zone_context']);
  const domainMissingRules = domainRules.filter(rule => !blockingCodes.has(rule.code) && !warningCodes.has(rule.code) && !informationalCodes.has(rule.code));
  const domainInformationalRules = domainRules.filter(rule => informationalCodes.has(rule.code));

  // The legacy engine is presentation/evidence input only. Old coarse load
  // thresholds are explicitly reclassified as warnings so they cannot leak
  // back into a canonical hard-block decision.
  const legacySoftCapacityWarnings = [
    ...result.blockingRules.filter(rule => LEGACY_SOFT_CAPACITY_CODES.has(rule.code)),
    ...result.warningRules.filter(rule => LEGACY_SOFT_CAPACITY_CODES.has(rule.code)),
  ].map(rule => ({
    ...rule,
    title: '容量/负荷参考提醒',
    evidence: `${rule.evidence} 该数值只用于粗略筛查，不代表硬性安全上限。`,
    severity: 'medium' as const,
    confidence: 'low' as const,
  }));
  const legacyHardBlocks = result.blockingRules.filter(rule => !LEGACY_SOFT_CAPACITY_CODES.has(rule.code));
  const legacyWarnings = result.warningRules.filter(rule => !LEGACY_SOFT_CAPACITY_CODES.has(rule.code));
  const reviewedStageHardBlocks = legacyHardBlocks.filter(rule => (
    rule.reviewStatus === 'reviewed' && CANONICAL_REVIEWED_STAGE_HARD_BLOCK_CODES.has(rule.code)
  ));
  // Life-stage risk is reviewed authority that is not yet represented in the
  // Domain input contract. Preserve only this explicit reviewed bridge here;
  // all other legacy hard blocks remain subordinate to Domain status.
  const effectiveStatus: TankCompatibilityStatus = reviewedStageHardBlocks.length > 0
    ? 'not_recommended'
    : decision.status;

  const reviewedPairBlocking = decision.status === 'not_recommended' && decision.ruleCodes.includes('reviewed_pair_rule')
    ? domainRules.filter(rule => rule.code === 'reviewed_pair_rule')
    : [];
  const domainBlockingWithoutGenericPair = domainBlockingRules.filter(rule => rule.code !== 'reviewed_pair_rule');
  const domainBlockingPriority: Record<string, number> = {
    candidate_tank_water_type_conflict: 0,
    water_type_conflict: 1,
    temperature_range_conflict: 2,
    tank_temperature_conflict: 3,
    predation_risk: 4,
    single_housing_required: 5,
    observed_emergency: 6,
  };
  const orderedDomainBlockingRules = [...domainBlockingWithoutGenericPair].sort(
    (left, right) => (domainBlockingPriority[left.code] ?? 99) - (domainBlockingPriority[right.code] ?? 99),
  );
  const blockingRules = effectiveStatus === 'not_recommended'
    ? uniqueRules([
      ...orderedDomainBlockingRules,
      ...(decision.status === 'not_recommended' ? legacyHardBlocks : reviewedStageHardBlocks),
      ...reviewedPairBlocking,
    ])
    : [];
  const missingData = effectiveStatus === 'insufficient_data'
    ? uniqueRules([...domainMissingRules, ...result.missingData])
    : [];
  const warningRules = effectiveStatus === 'caution' || effectiveStatus === 'insufficient_data' || effectiveStatus === 'not_recommended'
    ? uniqueRules([...domainWarningRules, ...legacySoftCapacityWarnings, ...legacyWarnings])
    : [];
  const riskLevel: TankCompatibilityRiskLevel = effectiveStatus === 'not_recommended'
    ? 'high'
    : effectiveStatus === 'insufficient_data'
      ? 'unknown'
      : effectiveStatus === 'caution'
        ? 'medium'
        : 'none';
  const summary = effectiveStatus === 'not_recommended'
    ? blockingRules[0]?.evidence || result.summary
    : effectiveStatus === 'insufficient_data'
      ? missingData[0]?.evidence || '关键资料不足，暂时无法可靠判断。'
      : effectiveStatus === 'caution'
        ? warningRules[0]?.evidence || result.summary
        : result.summary;
  return {
    ...result,
    status: effectiveStatus,
    riskLevel,
    summary,
    blockingRules,
    warningRules,
    passedRules: uniqueRules([...result.passedRules, ...domainInformationalRules]),
    missingData,
    stockingGuidance: decision.stockingGuidance,
    observedStatus: decision.observedStatus,
    evidenceIds: decision.evidenceIds,
  };
};

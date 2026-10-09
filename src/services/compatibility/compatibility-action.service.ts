import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';

export type BeginnerCompatibilityVerdict =
  | 'add'
  | 'add_with_conditions'
  | 'wait'
  | 'do_not_mix'
  | 'need_information';

export type BeginnerCompatibilityAction = {
  verdict: BeginnerCompatibilityVerdict;
  headline: string;
  immediateAction: string;
  primaryReason: string;
  observeAfterAction: string | null;
  detailsLabel: string;
};

const HARD_BLOCK_CODES = new Set([
  'water_type_conflict',
  'species_water_type_conflict',
  'candidate_tank_water_type_conflict',
  'temperature_range_conflict',
  'temperature_no_overlap',
  'tank_temperature_conflict',
  'predation_risk',
  'single_housing_required',
  'observed_emergency',
  'reviewed_pair_rule',
]);

const SOFT_CAPACITY_CODES = new Set([
  'tank_volume_below_species_minimum',
  'tank_length_below_species_minimum',
  'bioload_screening_high',
  'bioload_screening_elevated',
  'bioload_near_limit',
  'bioload_over_limit',
]);

const SPACE_CODES = new Set([
  'tank_volume_below_species_minimum',
  'tank_length_below_species_minimum',
]);

const BIOLOAD_CODES = new Set([
  'bioload_screening_high',
  'bioload_screening_elevated',
  'bioload_screening_high_stable_context',
  'bioload_near_limit',
  'bioload_over_limit',
]);

const PH_CODES = new Set([
  'ph_range_conflict',
  'ph_range_edge_overlap',
]);

const TERRITORIAL_CODES = new Set([
  'territorial_pressure_context',
  'territorial_conflict',
  'breeding_territory_active',
]);

const RULE_PRIORITY: Record<string, number> = {
  observed_emergency: 0,
  water_type_conflict: 10,
  species_water_type_conflict: 10,
  candidate_tank_water_type_conflict: 10,
  predation_risk: 20,
  single_housing_required: 25,
  temperature_range_conflict: 30,
  temperature_no_overlap: 30,
  tank_temperature_conflict: 30,
  reviewed_pair_rule: 35,
  observed_intervention: 40,
  predation_vulnerability_context: 50,
  fin_nipping_target_vulnerability: 60,
  territorial_pressure_context: 70,
  territorial_conflict: 72,
  breeding_territory_active: 74,
  fin_nipping_group_pressure: 80,
  minimum_group_not_met: 90,
  group_requirement_gap: 90,
  ph_range_conflict: 100,
  ph_range_edge_overlap: 105,
  tank_length_below_species_minimum: 110,
  tank_volume_below_species_minimum: 115,
  bioload_screening_high: 120,
  bioload_over_limit: 122,
  bioload_screening_elevated: 125,
  bioload_near_limit: 127,
  tank_missing: 200,
  tank_water_type_missing: 205,
  candidate_water_type_missing: 210,
  tank_temperature_missing: 215,
  temperature_range_missing: 220,
  species_evidence_unreviewed: 225,
  ph_range_missing: 230,
};

type PrioritizableRule = { code: string; title?: string; evidence?: string; severity?: string };

const severityPriority = (severity?: string) => (
  severity === 'high' ? 0 : severity === 'medium' ? 1 : severity === 'low' ? 2 : 3
);

export const prioritizeCompatibilityRules = <T extends PrioritizableRule>(rules: T[]): T[] => (
  rules
    .map((rule, index) => ({ rule, index }))
    .sort((a, b) => (
      (RULE_PRIORITY[a.rule.code] ?? 500) - (RULE_PRIORITY[b.rule.code] ?? 500)
      || severityPriority(a.rule.severity) - severityPriority(b.rule.severity)
      || a.index - b.index
    ))
    .map(item => item.rule)
);

const firstText = (rules: Array<{ title?: string; evidence?: string }>, fallback: string) => (
  rules.find(rule => rule.evidence || rule.title)?.evidence
  || rules.find(rule => rule.evidence || rule.title)?.title
  || fallback
);

const codesOf = (decision: CompatibilityDecision) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
]);

export const buildBeginnerCompatibilityAction = (decision: CompatibilityDecision): BeginnerCompatibilityAction => {
  const codes = codesOf(decision);
  const blockingRules = prioritizeCompatibilityRules(decision.blockingRules);
  const warningRules = prioritizeCompatibilityRules(decision.warningRules);
  const missingData = prioritizeCompatibilityRules(decision.missingData);
  const hasHardBlock = Array.from(codes).some(code => HARD_BLOCK_CODES.has(code));
  const hasSoftCapacityConcern = Array.from(codes).some(code => SOFT_CAPACITY_CODES.has(code));
  const hasSpaceConcern = Array.from(codes).some(code => SPACE_CODES.has(code));
  const hasBioloadConcern = Array.from(codes).some(code => BIOLOAD_CODES.has(code));
  const hasPhConcern = Array.from(codes).some(code => PH_CODES.has(code));
  const hasGroupSizeGap = codes.has('minimum_group_not_met') || codes.has('group_requirement_gap');
  const hasFinNippingGroupPressure = codes.has('fin_nipping_group_pressure');
  const hasFinNippingTargetVulnerability = codes.has('fin_nipping_target_vulnerability');
  const hasPredationVulnerability = codes.has('predation_vulnerability_context');
  const hasTerritorialPressure = Array.from(codes).some(code => TERRITORIAL_CODES.has(code));
  const hasObservedIntervention = codes.has('observed_intervention');

  if (decision.status === 'not_recommended') {
    return {
      verdict: 'do_not_mix',
      headline: hasHardBlock ? '不建议混养' : '现在先不要加',
      immediateAction: hasHardBlock
        ? '先不要把这组生物放在一起；先处理下面的明确阻断风险，再重新判断。'
        : '先暂停新增，处理当前高风险项后再重新判断。',
      primaryReason: firstText(blockingRules, decision.summary || '当前存在明确风险。'),
      observeAfterAction: null,
      detailsLabel: '为什么不建议？',
    };
  }

  if (decision.status === 'insufficient_data') {
    return {
      verdict: 'need_information',
      headline: '现在还不能可靠判断',
      immediateAction: '先别急着加；补齐最关键的缺失信息后再算一次。',
      primaryReason: firstText(missingData, decision.summary || '关键资料还不够。'),
      observeAfterAction: null,
      detailsLabel: '还缺什么？',
    };
  }

  if (decision.status === 'caution') {
    if (hasObservedIntervention) {
      return {
        verdict: 'add_with_conditions',
        headline: '先处理已经发生的问题',
        immediateAction: '先暂停继续加生物；优先处理当前已经出现的持续追逐、进食受阻或其他异常，等现实状态恢复稳定后再重新判断。',
        primaryReason: firstText(warningRules.filter(rule => rule.code === 'observed_intervention'), '当前鱼缸已经出现需要干预的现实异常。'),
        observeAfterAction: '调整或分隔后先确认追逐、躲藏和进食恢复稳定，再考虑继续新增。',
        detailsLabel: '为什么现实问题优先？',
      };
    }
    if (hasPredationVulnerability) {
      return {
        verdict: 'add_with_conditions',
        headline: '先确认鱼不会把虾当食物',
        immediateAction: '不要直接按“性情温和”判断安全；先确认成体体型、口裂和实际追食行为，并给虾保留密集躲避与可分隔方案。',
        primaryReason: firstText(warningRules.filter(rule => rule.code === 'predation_vulnerability_context'), '组合中存在对鱼类捕食较脆弱的无脊椎动物。'),
        observeAfterAction: '重点看持续追逐、啄咬、虾长期躲藏不出和数量异常减少；出现任一情况就分隔。',
        detailsLabel: '为什么要先确认？',
      };
    }
    if (hasFinNippingTargetVulnerability) {
      return {
        verdict: 'add_with_conditions',
        headline: '先不要把追鳍鱼和脆弱鳍型直接混养',
        immediateAction: '优先更换其中一方；如果只是暂时观察，也要准备立即分隔，不要把短期没追咬当成长期安全。',
        primaryReason: firstText(warningRules.filter(rule => rule.code === 'fin_nipping_target_vulnerability'), '一方有追鳍倾向，另一方对追鳍更脆弱。'),
        observeAfterAction: '重点看持续追逐、鳍条破损、躲藏和进食受阻；出现任一持续异常就分隔。',
        detailsLabel: '为什么这组风险更高？',
      };
    }
    if (hasTerritorialPressure) {
      return {
        verdict: 'add_with_conditions',
        headline: '先处理领地压迫风险',
        immediateAction: '先保证有足够的可用空间、遮挡和退让路线，并准备可立即分隔的方案；不要因为暂时没有追逐就直接判定长期安全。',
        primaryReason: firstText(warningRules.filter(rule => TERRITORIAL_CODES.has(rule.code)), '组合存在需要先管理的领地或繁殖护域压力。'),
        observeAfterAction: '重点看持续追逐、堵在角落、进食受阻和长期躲藏；出现持续异常就分隔。',
        detailsLabel: '为什么要先处理领地风险？',
      };
    }
    if (hasFinNippingGroupPressure) {
      return {
        verdict: 'add_with_conditions',
        headline: '先把群体数量补够，再混养',
        immediateAction: '当前不是“少养几条更安全”：先满足追鳍物种的同种最低群体要求，再考虑加入其他鱼。',
        primaryReason: firstText(warningRules.filter(rule => rule.code === 'fin_nipping_group_pressure'), '该物种有追鳍倾向，群体不足时对同缸鱼的骚扰压力更难管理。'),
        observeAfterAction: '群体调整后继续观察 3–7 天；如果仍有持续追鳍、躲藏、破鳍或抢食，再暂停新增并考虑分隔。',
        detailsLabel: '为什么先补群体？',
      };
    }
    if (hasGroupSizeGap) {
      const minimumGroupSize = decision.stockingGuidance?.recommendedMin;
      return {
        verdict: 'add_with_conditions',
        headline: '可以养，但数量要够',
        immediateAction: minimumGroupSize
          ? `不要只加 1–2 条；把该物种规划到至少 ${minimumGroupSize} 条/只，再观察是否正常群游和进食。`
          : '不要只加 1–2 条；按该物种的最低群体数量规划到位，再观察是否正常群游和进食。',
        primaryReason: firstText(warningRules.filter(rule => rule.code === 'minimum_group_not_met' || rule.code === 'group_requirement_gap'), '该物种需要达到最低群体数量；少量个体长期饲养并不一定更保守。'),
        observeAfterAction: '加入后 3–7 天观察是否正常结群、进食，以及是否长期躲藏或被排挤。',
        detailsLabel: '为什么数量不能太少？',
      };
    }
    if (hasPhConcern) {
      return {
        verdict: 'add_with_conditions',
        headline: '先确认实际水质',
        immediateAction: '先测一次当前稳定 pH，并确认组合是否存在可长期维持的共同区间；如果只能卡在边界值，不要先加鱼再观察。',
        primaryReason: firstText(warningRules.filter(rule => PH_CODES.has(rule.code)), '当前组合的 pH 适宜区间需要先确认。'),
        observeAfterAction: '确认实际水质稳定后再加入；加入后继续观察进食、体色、呼吸和应激表现。',
        detailsLabel: '为什么先确认水质？',
      };
    }
    if (hasSpaceConcern) {
      return {
        verdict: 'add_with_conditions',
        headline: '先解决空间余量',
        immediateAction: '先按成体需求核对缸长和可用空间，再决定数量；空间明显偏紧时优先减少数量或调整方案，不要把短期稳定当作长期可行。',
        primaryReason: firstText(warningRules.filter(rule => SPACE_CODES.has(rule.code)), '当前空间或缸长低于该物种的参考建议。'),
        observeAfterAction: '空间方案调整后再加入，并观察游动受限、抢位、躲藏和进食是否正常。',
        detailsLabel: '为什么先看空间？',
      };
    }
    if (hasBioloadConcern || hasSoftCapacityConcern) {
      return {
        verdict: 'add_with_conditions',
        headline: '可以尝试，但别一次加太多',
        immediateAction: '先降低本次新增数量，并确认过滤与维护能承受新增负荷；不要一次把计划数量全部加入，也不要只因为低于一个参考水体值就立刻换缸。',
        primaryReason: firstText(warningRules.filter(rule => BIOLOAD_CODES.has(rule.code)), '当前主要是累计负荷偏高，不是明确的生物学禁配。'),
        observeAfterAction: '加入后 3–7 天重点看呼吸、进食和明显水质波动；如果一直稳定，再决定是否继续增加。',
        detailsLabel: '为什么只是有条件？',
      };
    }
    return {
      verdict: 'add_with_conditions',
      headline: '可以，但有条件',
      immediateAction: '先处理下面最重要的可调整条件，再少量加入。',
      primaryReason: firstText(warningRules, decision.summary || '当前存在需要管理的风险。'),
      observeAfterAction: '加入后 3–7 天观察追咬、躲藏、拒食和呼吸异常；出现持续异常就停止继续加鱼。',
      detailsLabel: '为什么有条件？',
    };
  }

  return {
    verdict: 'add',
    headline: '可以混养',
    immediateAction: '可以按当前计划加入；不需要为了这次判断额外调整鱼缸。',
    primaryReason: firstText(decision.passedRules, decision.summary || '当前没有发现明确阻断。'),
    observeAfterAction: '加入后 3–7 天继续观察追咬、拒食和呼吸异常。',
    detailsLabel: '为什么可以？',
  };
};

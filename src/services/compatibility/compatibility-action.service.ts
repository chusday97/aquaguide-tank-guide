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
  const hasHardBlock = Array.from(codes).some(code => HARD_BLOCK_CODES.has(code));
  const hasSoftCapacityConcern = Array.from(codes).some(code => SOFT_CAPACITY_CODES.has(code));
  const hasGroupSizeGap = codes.has('minimum_group_not_met') || codes.has('group_requirement_gap');
  const hasFinNippingGroupPressure = codes.has('fin_nipping_group_pressure');
  const hasFinNippingTargetVulnerability = codes.has('fin_nipping_target_vulnerability');
  const hasPredationVulnerability = codes.has('predation_vulnerability_context');
  const hasTerritorialPressure = codes.has('territorial_pressure_context');

  if (decision.status === 'not_recommended') {
    return {
      verdict: 'do_not_mix',
      headline: hasHardBlock ? '不建议混养' : '现在先不要加',
      immediateAction: hasHardBlock
        ? '先不要把这组生物放在一起；先处理下面的明确阻断风险，再重新判断。'
        : '先暂停新增，处理当前高风险项后再重新判断。',
      primaryReason: firstText(decision.blockingRules, decision.summary || '当前存在明确风险。'),
      observeAfterAction: null,
      detailsLabel: '为什么不建议？',
    };
  }

  if (decision.status === 'insufficient_data') {
    return {
      verdict: 'need_information',
      headline: '现在还不能可靠判断',
      immediateAction: '先别急着加；补齐最关键的缺失信息后再算一次。',
      primaryReason: firstText(decision.missingData, decision.summary || '关键资料还不够。'),
      observeAfterAction: null,
      detailsLabel: '还缺什么？',
    };
  }

  if (decision.status === 'caution') {
    if (hasPredationVulnerability) {
      return {
        verdict: 'add_with_conditions',
        headline: '先确认鱼不会把虾当食物',
        immediateAction: '不要直接按“性情温和”判断安全；先确认成体体型、口裂和实际追食行为，并给虾保留密集躲避与可分隔方案。',
        primaryReason: firstText(decision.warningRules.filter(rule => rule.code === 'predation_vulnerability_context'), '组合中存在对鱼类捕食较脆弱的无脊椎动物。'),
        observeAfterAction: '重点看持续追逐、啄咬、虾长期躲藏不出和数量异常减少；出现任一情况就分隔。',
        detailsLabel: '为什么要先确认？',
      };
    }
    if (hasTerritorialPressure) {
      return {
        verdict: 'add_with_conditions',
        headline: '先处理领地压迫风险',
        immediateAction: '先保证有足够的可用空间、遮挡和退让路线，并准备可立即分隔的方案；不要因为暂时没有追逐就直接判定长期安全。',
        primaryReason: firstText(decision.warningRules.filter(rule => rule.code === 'territorial_pressure_context'), '一方有明显领地行为，另一方是低领地或非领地型物种。'),
        observeAfterAction: '重点看持续追逐、堵在角落、进食受阻和长期躲藏；出现持续异常就分隔。',
        detailsLabel: '为什么要先处理领地风险？',
      };
    }
    if (hasFinNippingTargetVulnerability) {
      return {
        verdict: 'add_with_conditions',
        headline: '先不要把追鳍鱼和脆弱鳍型直接混养',
        immediateAction: '优先更换其中一方；如果只是暂时观察，也要准备立即分隔，不要把短期没追咬当成长期安全。',
        primaryReason: firstText(decision.warningRules.filter(rule => rule.code === 'fin_nipping_target_vulnerability'), '一方有追鳍倾向，另一方对追鳍更脆弱。'),
        observeAfterAction: '重点看持续追逐、鳍条破损、躲藏和进食受阻；出现任一持续异常就分隔。',
        detailsLabel: '为什么这组风险更高？',
      };
    }
    if (hasFinNippingGroupPressure) {
      return {
        verdict: 'add_with_conditions',
        headline: '先把群体数量补够，再混养',
        immediateAction: '当前不是“少养几条更安全”：先满足追鳍物种的同种最低群体要求，再考虑加入其他鱼。',
        primaryReason: firstText(decision.warningRules.filter(rule => rule.code === 'fin_nipping_group_pressure'), '该物种有追鳍倾向，群体不足时对同缸鱼的骚扰压力更难管理。'),
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
        primaryReason: firstText(decision.warningRules, '该物种需要达到最低群体数量；少量个体长期饲养并不一定更保守。'),
        observeAfterAction: '加入后 3–7 天观察是否正常结群、进食，以及是否长期躲藏或被排挤。',
        detailsLabel: '为什么数量不能太少？',
      };
    }
    if (hasSoftCapacityConcern) {
      return {
        verdict: 'add_with_conditions',
        headline: '可以尝试，但别一次加太多',
        immediateAction: '先按较小数量加入并观察；不要只因为低于一个参考水体值就立刻换缸。',
        primaryReason: firstText(decision.warningRules, '当前主要是空间或负荷类建议值偏紧，不是明确的生物学禁配。'),
        observeAfterAction: '加入后 3–7 天重点看追咬、拒食、呼吸异常和明显水质波动；如果一直稳定，再决定是否继续增加。',
        detailsLabel: '为什么只是有条件？',
      };
    }
    return {
      verdict: 'add_with_conditions',
      headline: '可以，但有条件',
      immediateAction: '先处理下面最重要的可调整条件，再少量加入。',
      primaryReason: firstText(decision.warningRules, decision.summary || '当前存在需要管理的风险。'),
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

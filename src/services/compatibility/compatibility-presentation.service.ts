import type { CompatibilityDecision, CompatibilityRiskType } from '../../modules/knowledge/knowledge.types';

export type CompatibilityDimension =
  | 'water_type'
  | 'temperature'
  | 'ph'
  | 'space'
  | 'size'
  | 'social_behavior'
  | 'predation'
  | 'breeding'
  | 'bioload';

export type CompatibilityCoverageLevel = 'full' | 'partial' | 'none';
export type CompatibilityPresentationMode = 'verdict' | 'confirmed_facts' | 'unavailable';

export type CompatibilityCoverage = {
  level: CompatibilityCoverageLevel;
  confirmedDimensions: CompatibilityDimension[];
  omittedDimensions: CompatibilityDimension[];
  canIssueOverallVerdict: boolean;
};
export type CompatibilityVerdictIndicator = 'green' | 'yellow' | 'red' | 'gray';

export type CompatibilityPresentation = {
  mode: CompatibilityPresentationMode;
  headline: string;
  /** Stable product contract: judgment first, then reasons, then concrete adjustments. */
  verdict: {
    status: CompatibilityDecision['status'];
    label: string;
    indicator: CompatibilityVerdictIndicator;
  };
  reasons: string[];
  adjustments: string[];
  confirmedFindings: string[];
  cautions: string[];
  coverageLabel: string | null;
  primaryAction: 'add_to_tank' | 'confirm_addition' | 'save_to_wishlist' | 'none';
  coverage: CompatibilityCoverage;
};

const dimensions: CompatibilityDimension[] = [
  'water_type', 'temperature', 'ph', 'space', 'size', 'social_behavior', 'predation', 'breeding', 'bioload',
];

const dimensionLabels: Record<CompatibilityDimension, string> = {
  water_type: '水体',
  temperature: '温度',
  ph: '水质',
  space: '空间',
  size: '体型',
  social_behavior: '群体与性情',
  predation: '捕食',
  breeding: '繁殖行为',
  bioload: '负荷',
};

const ruleDimension = (code: string, riskType?: CompatibilityRiskType): CompatibilityDimension | null => {
  if (riskType === 'water_type' || code.includes('water_type')) return 'water_type';
  if (riskType === 'temperature' || code.includes('temperature')) return 'temperature';
  if (riskType === 'ph' || code.includes('ph_')) return 'ph';
  if (riskType === 'space' || code.includes('tank_volume') || code.includes('tank_length') || code.includes('space')) return 'space';
  if (riskType === 'predation' || code.includes('predation')) return 'predation';
  if (riskType === 'territory' || riskType === 'aggression' || riskType === 'group_size' || code.includes('territorial') || code.includes('housing') || code.includes('group') || code.includes('fin_nipping') || code.includes('single_housing') || code.includes('solitary')) return 'social_behavior';
  if (riskType === 'bioload' || code.includes('bioload')) return 'bioload';
  if (code.includes('breeding')) return 'breeding';
  if (code.includes('size')) return 'size';
  return null;
};

const ruleText = (rule: { code: string; title: string; evidence?: string }, fallback: string) => rule.evidence || rule.title || fallback;

const blockerPriority = (rule: { code: string }) => {
  const dimension = ruleDimension(rule.code);
  if (dimension === 'water_type') return 0;
  if (dimension === 'predation') return 1;
  if (dimension === 'temperature') return 2;
  if (rule.code.includes('single_housing') || rule.code.includes('solitary')) return 3;
  if (dimension === 'social_behavior') return 4;
  if (dimension === 'ph') return 5;
  if (dimension === 'space') return 6;
  if (dimension === 'bioload') return 7;
  return 8;
};

const sortBlockingRulesForPresentation = <T extends { code: string }>(rules: T[]) => (
  [...rules].sort((left, right) => blockerPriority(left) - blockerPriority(right))
);

const verdictForStatus = (status: CompatibilityDecision['status']) => {
  if (status === 'not_recommended') return { status, label: '不建议一起饲养', indicator: 'red' as const };
  if (status === 'caution') return { status, label: '调整后可尝试', indicator: 'yellow' as const };
  if (status === 'compatible') return { status, label: '当前条件适合', indicator: 'green' as const };
  return { status, label: '暂无法完整判断', indicator: 'gray' as const };
};

const uniqueText = (items: Array<string | null | undefined>, limit = 3) => (
  Array.from(new Set(items.map(item => item?.trim()).filter((item): item is string => Boolean(item)))).slice(0, limit)
);

const adjustmentForRule = (rule: { code: string; evidence?: string }): string | null => {
  const { code, evidence = '' } = rule;
  if (code.includes('water_type')) return '不要放在同一水体；改为分缸，或更换水体类型相符的候选物种。';
  if (code === 'temperature_range_conflict') return '双方已审核适温区间没有可靠重叠；不要靠折中温度硬混，建议更换候选物种。';
  if (code.includes('temperature')) return '先把目标水温调整到已审核适温范围，再重新评估整缸其他物种是否仍适合。';
  if (code.includes('ph_')) return '先把 pH 稳定到双方已审核的可重叠范围；若没有可靠重叠，改为分缸或更换物种。';
  if (code.includes('tank_volume') || code.includes('tank_length') || code.includes('volume_too_small') || code.includes('space')) return '先升级到满足已审核最低缸长/体积的鱼缸；空间未达标前不要继续加入。';
  if (code === 'group_requirement_gap') {
    const match = evidence.match(/^(.+?) 当前模拟合计 (\d+) 只\/条，已审核 minimumGroupSize 为 (\d+)/);
    if (match) return `${match[1]}：当前 ${match[2]} → 至少 ${match[3]} 只/条；补足后重新核对空间与整缸负荷。`;
    return '先补足已审核的最低群体数量，并重新核对增加数量后的空间与负荷。';
  }
  if (code === 'minimum_group_not_met' || code === 'fin_nipping_group_pressure') return '先补足已审核的最低群体数量，并重新核对增加数量后的空间与负荷。';
  if (code === 'territorial_conflict' || code === 'territorial_pressure_context') return '增加领地空间、躲避点和视觉遮挡；若仍持续追咬或压迫，改为分缸。';
  if (code === 'breeding_territory_active' || code.includes('breeding')) return '繁殖期增加隔离与躲避；出现持续追咬时临时分缸，繁殖期结束后再复评。';
  if (code === 'single_housing_required' || code === 'solitary_species_conflict') return '按单养要求处理，不要用增加躲避物替代分缸。';
  if (code === 'predation_risk' || code === 'juvenile_predation_risk' || code === 'conspecific_fry_predation' || code.includes('predation_threat')) return '不要与可被吞食的个体同缸；分缸，或更换为体型与捕食关系更合适的室友。';
  if (code === 'predation_vulnerability_context') return '避免加入明显更大或有捕食倾向的室友，并准备可快速分缸的备用方案。';
  if (code === 'fin_nipping_target_vulnerability' || code.includes('fin_nipping')) return '避免与长鳍、慢游或容易被追咬的鱼搭配；必要时补足群体、扩大空间或分缸。';
  if (code.includes('bioload')) return '降低整缸总负荷或升级过滤与水体容量；分批加入，并在每次加入后复核水质和行为。';
  if (code.includes('unreviewed') || code.includes('evidence') || code.includes('unknown')) return '先保留方案并补齐可靠物种/行为资料，再决定是否加入。';
  if (code.includes('missing')) return '先补齐当前缺少的鱼缸尺寸、水温或必要环境信息，再重新评估。';
  return null;
};

const buildDecisionReasons = (decision: CompatibilityDecision) => {
  const rawActiveRules = decision.status === 'not_recommended'
    ? sortBlockingRulesForPresentation(decision.blockingRules)
    : decision.status === 'caution'
      ? decision.warningRules
      : decision.status === 'insufficient_data'
        ? decision.missingData
        : [];
  const hasSpecificPairRule = rawActiveRules.some(rule => rule.code.startsWith('pair_rule_'));
  const activeRules = rawActiveRules.filter(rule => !(hasSpecificPairRule && rule.code === 'reviewed_pair_rule'));
  const summaryRule = activeRules.find(rule => ruleText(rule, '') === decision.summary);
  const primaryRule = decision.status === 'not_recommended'
    ? activeRules[0]
    : summaryRule;
  const usedDimensions = new Set<CompatibilityDimension>();
  const primaryDimension = primaryRule ? ruleDimension(primaryRule.code) : null;
  if (primaryDimension) usedDimensions.add(primaryDimension);
  const secondaryReasons = activeRules
    .filter(rule => rule !== primaryRule)
    .filter(rule => {
      const dimension = ruleDimension(rule.code);
      if (!dimension) return true;
      if (usedDimensions.has(dimension)) return false;
      usedDimensions.add(dimension);
      return true;
    })
    .map(rule => (
      rule.code === 'minimum_group_not_met' || rule.code === 'group_requirement_gap'
        ? '当前计划数量低于该物种已审核的最低群体要求。'
        : ruleText(rule, '该项影响当前混养判断。')
    ));
  // The direct decision summary is the canonical primary reason. This matters
  // for 3+ species, where a whole-tank-only risk may outrank pairwise details.
  if (decision.status !== 'compatible') {
    const primaryText = primaryRule ? ruleText(primaryRule, decision.summary) : decision.summary;
    return uniqueText([primaryText, ...secondaryReasons]);
  }
  return uniqueText([
    decision.summary,
    ...decision.passedRules.map(rule => ruleText(rule, '该项已核对通过。')),
  ]);
};

const buildDecisionAdjustments = (decision: CompatibilityDecision) => {
  const rawActiveRules = decision.status === 'not_recommended'
    ? sortBlockingRulesForPresentation(decision.blockingRules)
    : decision.status === 'caution'
      ? decision.warningRules
      : decision.status === 'insufficient_data'
        ? decision.missingData
        : [];
  const hasSpecificPairRule = rawActiveRules.some(rule => rule.code.startsWith('pair_rule_'));
  const activeRules = rawActiveRules.filter(rule => !(hasSpecificPairRule && rule.code === 'reviewed_pair_rule'));
  const groupGapRules = activeRules.filter(rule => rule.code === 'group_requirement_gap');
  const hasSpecificGroupGaps = groupGapRules.length > 0;
  const adjustmentRules = activeRules.filter(rule => !(
    hasSpecificGroupGaps && (rule.code === 'minimum_group_not_met' || rule.code === 'fin_nipping_group_pressure' || rule.code === 'group_requirement_gap')
  ));
  const groupGapActions = groupGapRules
    .map(rule => adjustmentForRule(rule))
    .filter((item): item is string => Boolean(item));
  const compactGroupAction = groupGapActions.length > 0
    ? `先补足群体数量：${groupGapActions.map(item => item.replace(/；补足后重新核对空间与整缸负荷。$/, '')).join('；')}。补足后重新核对空间与整缸负荷。`
    : null;
  const usedDimensions = new Set<CompatibilityDimension>();
  const mapped = uniqueText([
    ...adjustmentRules.flatMap(rule => {
      const dimension = ruleDimension(rule.code);
      if (dimension && usedDimensions.has(dimension)) return [];
      if (dimension) usedDimensions.add(dimension);
      return [adjustmentForRule(rule)];
    }),
    compactGroupAction,
  ]);
  const specificSuggestions = decision.suggestions.filter(item => (
    !item.includes('主要风险项')
    && !item.includes('明确阻断项')
    && !item.includes('当前条件可加入')
  ));
  const fallback = decision.status === 'not_recommended'
    ? '不要直接加入；先消除阻断风险，无法消除时更换候选物种或分缸。'
    : decision.status === 'caution'
      ? '先完成风险对应的调整，再尝试加入，并持续观察追咬、拒食和水质变化。'
      : decision.status === 'compatible'
        ? '无需先做兼容性调整；建议分批加入，并在 3–7 天内观察行为与水质。'
        : '先补齐缺失信息或审核资料，再决定是否加入。';
  // Prefer actions derived from the actual active risk codes. Generic engine
  // suggestions are fallback only, so users do not see the same advice twice.
  return mapped.length > 0
    ? mapped
    : uniqueText([...specificSuggestions, fallback]);
};

export const getCompatibilityPresentation = (decision: CompatibilityDecision): CompatibilityPresentation => {
  const confirmed = new Set<CompatibilityDimension>();
  const confirmedFindings: string[] = [];
  const cautions: string[] = [];
  const addConfirmed = (rule: { code: string; title: string; evidence?: string }) => {
    const dimension = ruleDimension(rule.code);
    if (!dimension || rule.code.includes('unreviewed') || rule.code.includes('missing') || rule.code.includes('unknown')) return;
    confirmed.add(dimension);
    confirmedFindings.push(ruleText(rule, '已完成该项核对。'));
  };
  decision.passedRules.forEach(addConfirmed);
  decision.warningRules.forEach(rule => {
    addConfirmed(rule);
    cautions.push(ruleText(rule, '该项需要继续观察。'));
  });
  decision.blockingRules.forEach(rule => {
    const dimension = ruleDimension(rule.code);
    if (dimension) confirmed.add(dimension);
  });

  const confirmedDimensions = dimensions.filter(dimension => confirmed.has(dimension));
  const omittedDimensions = dimensions.filter(dimension => !confirmed.has(dimension));
  const hasConfirmedFacts = confirmedFindings.length > 0 || decision.blockingRules.length > 0 || decision.warningRules.length > 0;
  const coverageLevel: CompatibilityCoverageLevel = decision.status === 'insufficient_data'
    ? (hasConfirmedFacts ? 'partial' : 'none')
    : 'full';
  const coverage: CompatibilityCoverage = {
    level: coverageLevel,
    confirmedDimensions,
    omittedDimensions,
    canIssueOverallVerdict: decision.status !== 'insufficient_data',
  };
  const coverageLabel = coverageLevel === 'partial'
    ? `本次已核对：${confirmedDimensions.map(dimension => dimensionLabels[dimension]).join('、') || '部分环境条件'}`
    : null;
  const verdict = verdictForStatus(decision.status);
  const reasons = buildDecisionReasons(decision);
  const adjustments = buildDecisionAdjustments(decision);

  if (decision.status === 'not_recommended') {
    return { mode: 'verdict', headline: verdict.label, verdict, reasons, adjustments, confirmedFindings, cautions, coverageLabel, primaryAction: 'none', coverage };
  }
  if (decision.status === 'caution') {
    return { mode: 'verdict', headline: verdict.label, verdict, reasons, adjustments, confirmedFindings, cautions, coverageLabel, primaryAction: 'confirm_addition', coverage };
  }
  if (decision.status === 'compatible') {
    return { mode: 'verdict', headline: verdict.label, verdict, reasons, adjustments, confirmedFindings, cautions, coverageLabel, primaryAction: 'add_to_tank', coverage };
  }
  if (coverageLevel === 'partial') {
    return {
      mode: 'confirmed_facts',
      headline: '当前可确认',
      verdict,
      reasons,
      adjustments,
      confirmedFindings: Array.from(new Set(confirmedFindings)).slice(0, 5),
      cautions: Array.from(new Set(cautions)).slice(0, 3),
      coverageLabel,
      primaryAction: 'save_to_wishlist',
      coverage,
    };
  }
  return {
    mode: 'unavailable',
    headline: '暂未开放这组混养建议',
    verdict,
    reasons,
    adjustments,
    confirmedFindings: [],
    cautions: [],
    coverageLabel: null,
    primaryAction: 'save_to_wishlist',
    coverage,
  };
};

export const getCompatibilityPresentationForStatus = ({
  status,
  hasConfirmedFacts,
  confirmedFindings = [],
  cautions = [],
}: {
  status: CompatibilityDecision['status'];
  hasConfirmedFacts: boolean;
  confirmedFindings?: string[];
  cautions?: string[];
}): CompatibilityPresentation => {
  const verdict = verdictForStatus(status);
  const reasons = uniqueText(
    status === 'caution' || status === 'not_recommended'
      ? cautions
      : status === 'compatible'
        ? confirmedFindings
        : [...cautions, ...confirmedFindings],
  );
  const fallbackReason = status === 'not_recommended'
    ? '当前评估存在明确阻断条件。'
    : status === 'caution'
      ? '当前组合存在需要先处理的条件风险。'
      : status === 'compatible'
        ? '当前已核对条件未发现明确阻断风险。'
        : '当前只完成了部分条件核对。';
  const resolvedReasons = reasons.length > 0 ? reasons : [fallbackReason];
  const adjustments = status === 'not_recommended'
    ? ['不要直接加入；先查看阻断原因并分缸、调整条件或更换候选物种。']
    : status === 'caution'
      ? ['先处理当前风险项，再尝试加入，并持续观察追咬、拒食和水质变化。']
      : status === 'compatible'
        ? ['无需先做兼容性调整；建议分批加入，并在 3–7 天内观察行为与水质。']
        : ['先补齐未核对条件或审核资料，再决定是否加入。'];
  const fullCoverage = { level: 'full' as const, confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: true };

  if (status === 'not_recommended') return {
    mode: 'verdict', headline: verdict.label, verdict, reasons: resolvedReasons, adjustments,
    confirmedFindings, cautions, coverageLabel: null, primaryAction: 'none', coverage: fullCoverage,
  };
  if (status === 'caution') return {
    mode: 'verdict', headline: verdict.label, verdict, reasons: resolvedReasons, adjustments,
    confirmedFindings, cautions, coverageLabel: null, primaryAction: 'confirm_addition', coverage: fullCoverage,
  };
  if (status === 'compatible') return {
    mode: 'verdict', headline: verdict.label, verdict, reasons: resolvedReasons, adjustments,
    confirmedFindings, cautions, coverageLabel: null, primaryAction: 'add_to_tank', coverage: fullCoverage,
  };
  return hasConfirmedFacts ? {
    mode: 'confirmed_facts', headline: '当前可确认', verdict, reasons: resolvedReasons, adjustments,
    confirmedFindings: Array.from(new Set(confirmedFindings)).slice(0, 5),
    cautions: Array.from(new Set(cautions)).slice(0, 3), coverageLabel: '本次仅展示已核对的环境与行为条件', primaryAction: 'save_to_wishlist',
    coverage: { level: 'partial', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: false },
  } : {
    mode: 'unavailable', headline: '暂未开放这组混养建议', verdict, reasons: resolvedReasons, adjustments,
    confirmedFindings: [], cautions: [], coverageLabel: null,
    primaryAction: 'save_to_wishlist', coverage: { level: 'none', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: false },
  };
};

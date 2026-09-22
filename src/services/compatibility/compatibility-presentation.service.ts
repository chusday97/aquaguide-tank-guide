import type { CompatibilityDecision, CompatibilityRiskType } from '../../modules/knowledge/knowledge.types';
import { buildBeginnerCompatibilityAction } from './compatibility-action.service';

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
export type CompatibilityPresentation = {
  mode: CompatibilityPresentationMode;
  headline: '可以养' | '有条件可以' | '不建议' | '暂时无法判断';
  primaryReason: string;
  secondaryReason: string | null;
  primaryActionText: string;
  detailsLabel: '查看依据';
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
  if (riskType === 'territory' || riskType === 'aggression' || riskType === 'group_size' || code.includes('territorial') || code.includes('housing')) return 'social_behavior';
  if (riskType === 'bioload' || code.includes('bioload')) return 'bioload';
  if (code.includes('breeding')) return 'breeding';
  if (code.includes('size')) return 'size';
  return null;
};

const ruleText = (rule: { code: string; title: string; evidence?: string }, fallback: string) => rule.evidence || rule.title || fallback;

const headlineForStatus = (status: CompatibilityDecision['status']): CompatibilityPresentation['headline'] => {
  if (status === 'compatible') return '可以养';
  if (status === 'caution') return '有条件可以';
  if (status === 'not_recommended') return '不建议';
  return '暂时无法判断';
};

const firstDistinctText = (primaryReason: string, values: string[]) => (
  Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
    .find(value => value != primaryReason.trim()) || null
);


export const getCompatibilityPresentation = (decision: CompatibilityDecision): CompatibilityPresentation => {
  const confirmed = new Set<CompatibilityDimension>();
  const confirmedFindings: string[] = [];
  const cautions: string[] = [];
  const confirmedRuleCodes = new Set<string>();
  const cautionRuleCodes = new Set<string>();
  const addConfirmed = (rule: { code: string; title: string; evidence?: string }) => {
    const dimension = ruleDimension(rule.code);
    if (!dimension || rule.code.includes('unreviewed') || rule.code.includes('missing') || rule.code.includes('unknown')) return;
    confirmed.add(dimension);
    if (confirmedRuleCodes.has(rule.code)) return;
    confirmedRuleCodes.add(rule.code);
    confirmedFindings.push(ruleText(rule, '已完成该项核对。'));
  };
  decision.passedRules.forEach(addConfirmed);
  decision.warningRules.forEach(rule => {
    addConfirmed(rule);
    if (cautionRuleCodes.has(rule.code)) return;
    cautionRuleCodes.add(rule.code);
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

  const beginnerAction = buildBeginnerCompatibilityAction(decision);
  const primaryReason = beginnerAction.primaryReason;
  const secondaryReason = firstDistinctText(primaryReason, [
    ...decision.blockingRules.map(rule => ruleText(rule, '')),
    ...decision.warningRules.map(rule => ruleText(rule, '')),
    ...decision.missingData.map(rule => ruleText(rule, '')),
    ...decision.passedRules.map(rule => ruleText(rule, '')),
  ]);
  const directFields = {
    headline: headlineForStatus(decision.status),
    primaryReason,
    secondaryReason,
    primaryActionText: beginnerAction.immediateAction,
    detailsLabel: '查看依据' as const,
  };

  if (decision.status === 'not_recommended') {
    return { mode: 'verdict', ...directFields, confirmedFindings, cautions, coverageLabel, primaryAction: 'none', coverage };
  }
  if (decision.status === 'caution') {
    return { mode: 'verdict', ...directFields, confirmedFindings, cautions, coverageLabel, primaryAction: 'confirm_addition', coverage };
  }
  if (decision.status === 'compatible') {
    return { mode: 'verdict', ...directFields, confirmedFindings, cautions, coverageLabel, primaryAction: 'add_to_tank', coverage };
  }
  if (coverageLevel === 'partial') {
    return {
      mode: 'confirmed_facts',
      ...directFields,
      confirmedFindings: Array.from(new Set(confirmedFindings)).slice(0, 5),
      cautions: Array.from(new Set(cautions)).slice(0, 3),
      coverageLabel,
      primaryAction: 'save_to_wishlist',
      coverage,
    };
  }
  return {
    mode: 'unavailable',
    ...directFields,
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
  const headline = headlineForStatus(status);
  const reasonCandidates = status === 'compatible' ? confirmedFindings : [...cautions, ...confirmedFindings];
  const fallbackReason = status === 'not_recommended'
    ? '当前存在明确的混养风险。'
    : status === 'caution'
      ? '当前有条件需要先调整。'
      : status === 'compatible'
        ? '当前没有发现明确阻断。'
        : '关键条件还不能可靠确认。';
  const primaryReason = reasonCandidates[0] || fallbackReason;
  const secondaryReason = firstDistinctText(primaryReason, reasonCandidates.slice(1));
  const primaryActionText = status === 'not_recommended'
    ? '不要直接混养；先处理明确风险后再重新判断。'
    : status === 'caution'
      ? '先处理最重要的条件，再加入并继续观察。'
      : status === 'compatible'
        ? '可以按当前计划加入，并继续观察。'
        : '暂时不要加入；有更明确的信息后再重新判断。';
  const common = { headline, primaryReason, secondaryReason, primaryActionText, detailsLabel: '查看依据' as const };

  if (status === 'not_recommended') return {
    mode: 'verdict', ...common, confirmedFindings, cautions, coverageLabel: null,
    primaryAction: 'none', coverage: { level: 'full', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: true },
  };
  if (status === 'caution') return {
    mode: 'verdict', ...common, confirmedFindings, cautions, coverageLabel: null,
    primaryAction: 'confirm_addition', coverage: { level: 'full', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: true },
  };
  if (status === 'compatible') return {
    mode: 'verdict', ...common, confirmedFindings, cautions, coverageLabel: null,
    primaryAction: 'add_to_tank', coverage: { level: 'full', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: true },
  };
  return hasConfirmedFacts ? {
    mode: 'confirmed_facts', ...common, confirmedFindings: Array.from(new Set(confirmedFindings)).slice(0, 5),
    cautions: Array.from(new Set(cautions)).slice(0, 3), coverageLabel: '本次仅展示已核对的环境与行为条件', primaryAction: 'save_to_wishlist',
    coverage: { level: 'partial', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: false },
  } : {
    mode: 'unavailable', ...common, confirmedFindings: [], cautions: [], coverageLabel: null,
    primaryAction: 'save_to_wishlist', coverage: { level: 'none', confirmedDimensions: [], omittedDimensions: dimensions, canIssueOverallVerdict: false },
  };
};

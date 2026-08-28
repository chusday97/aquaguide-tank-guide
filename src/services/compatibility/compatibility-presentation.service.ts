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
export type CompatibilityPresentation = {
  mode: CompatibilityPresentationMode;
  headline: string;
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

  if (decision.status === 'not_recommended') {
    return { mode: 'verdict', headline: '不建议一起饲养', confirmedFindings, cautions, coverageLabel, primaryAction: 'none', coverage };
  }
  if (decision.status === 'caution') {
    return { mode: 'verdict', headline: '调整后可尝试', confirmedFindings, cautions, coverageLabel, primaryAction: 'confirm_addition', coverage };
  }
  if (decision.status === 'compatible') {
    return { mode: 'verdict', headline: '当前条件适合', confirmedFindings, cautions, coverageLabel, primaryAction: 'add_to_tank', coverage };
  }
  if (coverageLevel === 'partial') {
    return {
      mode: 'confirmed_facts',
      headline: '当前可确认',
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
    confirmedFindings: [],
    cautions: [],
    coverageLabel: null,
    primaryAction: 'save_to_wishlist',
    coverage,
  };
};

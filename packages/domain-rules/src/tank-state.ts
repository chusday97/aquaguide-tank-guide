export type TankState = 'stable' | 'watch' | 'intervene' | 'urgent' | 'unknown';
export type TankStateConfidence = 'high' | 'medium' | 'low' | 'unknown';
export type TankPriorRiskLevel = 'low' | 'medium' | 'high';
export type TankPriorRiskKind = 'aggression' | 'territory' | 'predation' | 'space' | 'bioload' | 'water_type' | 'temperature' | 'equipment' | 'other';

export type TankPriorRisk = {
  code: string;
  kind: TankPriorRiskKind;
  level: TankPriorRiskLevel;
  evidence?: string;
  observationTargets?: string[];
};

export type TankHardConstraint = {
  code: string;
  active: boolean;
  severity?: 'intervene' | 'urgent';
  evidence?: string;
};

export type TankObservationCode =
  | 'normal_feeding'
  | 'normal_activity'
  | 'no_persistent_chasing'
  | 'no_injury'
  | 'no_hiding_pressure'
  | 'persistent_chasing'
  | 'hiding_pressure'
  | 'feeding_exclusion'
  | 'appetite_drop'
  | 'injury'
  | 'severe_injury'
  | 'respiratory_distress'
  | 'multiple_deaths'
  | 'cloudy_water'
  | 'odor';

export type TankObservation = {
  code: TankObservationCode;
  observedAt: string;
  evidence?: string;
};

export type EvaluateTankStateInput = {
  priors?: TankPriorRisk[];
  observations?: TankObservation[];
  hardConstraints?: TankHardConstraint[];
  cohabitationDays?: number;
  now?: string;
};

export type TankStateAction = 'no_action' | 'observe' | 'adjust' | 'urgent_action' | 'complete_check';

export type TankStateResult = {
  state: TankState;
  confidence: TankStateConfidence;
  primaryAction: TankStateAction;
  summary: string;
  reasons: string[];
  matchedRules: string[];
  activeSignals: TankObservationCode[];
  priorCodes: string[];
  observationTargets: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_WINDOW_DAYS = 7;
const REPEAT_WINDOW_DAYS = 14;

const normalCodes = new Set<TankObservationCode>([
  'normal_feeding',
  'normal_activity',
  'no_persistent_chasing',
  'no_injury',
  'no_hiding_pressure',
]);

const watchCodes = new Set<TankObservationCode>([
  'persistent_chasing',
  'hiding_pressure',
  'feeding_exclusion',
  'appetite_drop',
  'cloudy_water',
  'odor',
]);

const interveneCodes = new Set<TankObservationCode>(['injury']);
const urgentCodes = new Set<TankObservationCode>(['severe_injury', 'respiratory_distress', 'multiple_deaths']);

const parseTime = (value: string | undefined) => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const withinDays = (observedAt: string, nowMs: number, days: number) => {
  const observedMs = parseTime(observedAt);
  if (observedMs === null) return false;
  const age = nowMs - observedMs;
  return age >= 0 && age <= days * DAY_MS;
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

export const evaluateTankState = ({
  priors = [],
  observations = [],
  hardConstraints = [],
  cohabitationDays = 0,
  now = new Date().toISOString(),
}: EvaluateTankStateInput): TankStateResult => {
  const nowMs = parseTime(now) ?? Date.now();
  const recent = observations.filter(item => withinDays(item.observedAt, nowMs, RECENT_WINDOW_DAYS));
  const repeatWindow = observations.filter(item => withinDays(item.observedAt, nowMs, REPEAT_WINDOW_DAYS));
  const activeHardConstraints = hardConstraints.filter(item => item.active);
  const priorCodes = priors.map(item => item.code);
  const observationTargets = unique(priors.flatMap(item => item.observationTargets || []));
  const reasons: string[] = [];
  const matchedRules: string[] = [];

  if (activeHardConstraints.length > 0) {
    const urgent = activeHardConstraints.some(item => (item.severity || 'urgent') === 'urgent');
    reasons.push(...activeHardConstraints.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-004');
    return {
      state: urgent ? 'urgent' : 'intervene',
      confidence: 'high',
      primaryAction: urgent ? 'urgent_action' : 'adjust',
      summary: urgent ? '存在明确的当前硬约束，需要优先处理。' : '存在明确的当前硬约束，需要调整。',
      reasons,
      matchedRules,
      activeSignals: [],
      priorCodes,
      observationTargets,
    };
  }

  const urgentSignals = recent.filter(item => urgentCodes.has(item.code));
  if (urgentSignals.length > 0) {
    reasons.push(...urgentSignals.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-007');
    return {
      state: 'urgent',
      confidence: 'high',
      primaryAction: 'urgent_action',
      summary: '当前观察到需要优先处理的异常信号。',
      reasons,
      matchedRules,
      activeSignals: unique(urgentSignals.map(item => item.code)),
      priorCodes,
      observationTargets,
    };
  }

  const directInterventionSignals = recent.filter(item => interveneCodes.has(item.code));
  const chasingCount = repeatWindow.filter(item => item.code === 'persistent_chasing').length;
  const correlatedBehaviorSignals = new Set(recent.filter(item => ['hiding_pressure', 'feeding_exclusion'].includes(item.code)).map(item => item.code));
  const repeatedBehaviorProblem = chasingCount >= 2 || (chasingCount >= 1 && correlatedBehaviorSignals.size > 0);
  if (directInterventionSignals.length > 0 || repeatedBehaviorProblem) {
    const involved = [
      ...directInterventionSignals,
      ...recent.filter(item => item.code === 'persistent_chasing' || correlatedBehaviorSignals.has(item.code)),
    ];
    reasons.push(...involved.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-006');
    return {
      state: 'intervene',
      confidence: 'high',
      primaryAction: 'adjust',
      summary: '当前异常已经形成可重复或相互印证的现实证据，需要采取调整。',
      reasons: unique(reasons),
      matchedRules,
      activeSignals: unique(involved.map(item => item.code)),
      priorCodes,
      observationTargets,
    };
  }

  const watchSignals = recent.filter(item => watchCodes.has(item.code));
  if (watchSignals.length > 0) {
    reasons.push(...watchSignals.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-006');
    return {
      state: 'watch',
      confidence: 'medium',
      primaryAction: 'observe',
      summary: '出现需要继续观察的当前信号，但证据尚不足以要求立即干预。',
      reasons,
      matchedRules,
      activeSignals: unique(watchSignals.map(item => item.code)),
      priorCodes,
      observationTargets,
    };
  }

  const normalSignals = recent.filter(item => normalCodes.has(item.code));
  if (normalSignals.length > 0) {
    reasons.push(...normalSignals.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-001', 'AQ-STATE-003');
    return {
      state: 'stable',
      confidence: priors.length > 0 ? 'medium' : normalSignals.length >= 2 ? 'high' : 'medium',
      primaryAction: 'no_action',
      summary: priors.length > 0
        ? '理论风险仍可保留为观察背景，但近期现实观察未支持当前干预。'
        : '近期现实观察未发现需要处理的异常。',
      reasons,
      matchedRules,
      activeSignals: unique(normalSignals.map(item => item.code)),
      priorCodes,
      observationTargets,
    };
  }

  if (priors.some(item => item.level === 'medium' || item.level === 'high')) {
    reasons.push(...priors.map(item => item.evidence || item.code));
    if (cohabitationDays > 0) reasons.push(`共同饲养 ${cohabitationDays} 天，但缺少近期观察记录。`);
    matchedRules.push('AQ-STATE-001', 'AQ-STATE-003', 'AQ-STATE-008');
    return {
      state: 'watch',
      confidence: 'low',
      primaryAction: 'observe',
      summary: '存在理论风险，但缺少足够近期现实观察；先补充观察，不把时间本身当作稳定证据。',
      reasons,
      matchedRules,
      activeSignals: [],
      priorCodes,
      observationTargets,
    };
  }

  matchedRules.push('AQ-STATE-008');
  return {
    state: 'unknown',
    confidence: 'unknown',
    primaryAction: 'complete_check',
    summary: '缺少足够近期观察，暂不能可靠判断当前鱼缸状态。',
    reasons: cohabitationDays > 0 ? [`共同饲养 ${cohabitationDays} 天，但没有近期观察证据。`] : [],
    matchedRules,
    activeSignals: [],
    priorCodes,
    observationTargets,
  };
};


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
  | 'normal_breathing'
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
  'normal_breathing',
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

const recoveryCodesBySignal: Partial<Record<TankObservationCode, TankObservationCode[]>> = {
  respiratory_distress: ['normal_breathing'],
  persistent_chasing: ['no_persistent_chasing'],
  hiding_pressure: ['no_hiding_pressure'],
  feeding_exclusion: ['normal_feeding'],
  appetite_drop: ['normal_feeding'],
  injury: ['no_injury'],
  severe_injury: ['no_injury'],
};

const laterRecoveryObservations = (signal: TankObservation, pool: TankObservation[]) => {
  const signalMs = parseTime(signal.observedAt);
  const recoveryCodes = recoveryCodesBySignal[signal.code] || [];
  if (signalMs === null || recoveryCodes.length === 0) return [];
  return pool.filter(item => {
    const itemMs = parseTime(item.observedAt);
    return itemMs !== null && itemMs > signalMs && recoveryCodes.includes(item.code);
  });
};

const isRecovered = (signal: TankObservation, pool: TankObservation[], confirmations = 2) => (
  new Set(laterRecoveryObservations(signal, pool).map(item => item.observedAt)).size >= confirmations
);

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
  const activeUrgentSignals = urgentSignals.filter(item => !isRecovered(item, recent));
  const recoveringUrgentSignals = urgentSignals.filter(item => isRecovered(item, recent) && !isRecovered(item, recent, 3));
  if (activeUrgentSignals.length > 0) {
    reasons.push(...activeUrgentSignals.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-007');
    return {
      state: 'urgent',
      confidence: 'high',
      primaryAction: 'urgent_action',
      summary: '当前观察到需要优先处理的异常信号。',
      reasons,
      matchedRules,
      activeSignals: unique(activeUrgentSignals.map(item => item.code)),
      priorCodes,
      observationTargets,
    };
  }

  const directInterventionSignals = recent.filter(item => interveneCodes.has(item.code));
  const activeDirectInterventionSignals = directInterventionSignals.filter(item => !isRecovered(item, recent));
  const recoveringDirectInterventionSignals = directInterventionSignals.filter(item => isRecovered(item, recent) && !isRecovered(item, recent, 3));
  const allChasingSignals = repeatWindow.filter(item => item.code === 'persistent_chasing');
  const activeChasingSignals = allChasingSignals.filter(item => !isRecovered(item, repeatWindow));
  const allCorrelatedBehaviorSignals = recent.filter(item => ['hiding_pressure', 'feeding_exclusion'].includes(item.code));
  const activeCorrelatedBehaviorSignals = allCorrelatedBehaviorSignals.filter(item => !isRecovered(item, recent));
  const correlatedBehaviorCodes = new Set(activeCorrelatedBehaviorSignals.map(item => item.code));
  const activeRecentChasingSignals = activeChasingSignals.filter(item => withinDays(item.observedAt, nowMs, RECENT_WINDOW_DAYS));
  const hadRepeatedBehaviorProblem = allChasingSignals.length >= 2
    || (allChasingSignals.length >= 1 && allCorrelatedBehaviorSignals.length > 0);
  const repeatedBehaviorProblem = (activeChasingSignals.length >= 2 && activeRecentChasingSignals.length >= 1)
    || (activeRecentChasingSignals.length >= 1 && correlatedBehaviorCodes.size > 0);
  if (activeDirectInterventionSignals.length > 0 || repeatedBehaviorProblem) {
    const involved = [
      ...activeDirectInterventionSignals,
      ...activeRecentChasingSignals,
      ...activeCorrelatedBehaviorSignals,
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

  const behaviorSignalsForRecovery = [...allChasingSignals, ...allCorrelatedBehaviorSignals];
  const recoveryConfirmedBehaviorProblem = hadRepeatedBehaviorProblem
    && behaviorSignalsForRecovery.length > 0
    && behaviorSignalsForRecovery.every(item => isRecovered(item, repeatWindow));
  const fullyRecoveredBehaviorProblem = recoveryConfirmedBehaviorProblem
    && behaviorSignalsForRecovery.every(item => isRecovered(item, repeatWindow, 3));
  const recoveringBehaviorProblem = recoveryConfirmedBehaviorProblem && !fullyRecoveredBehaviorProblem;
  if (recoveringUrgentSignals.length > 0 || recoveringDirectInterventionSignals.length > 0 || recoveringBehaviorProblem) {
    const recoverySignals = recent.filter(item => normalCodes.has(item.code));
    reasons.push(...recoverySignals.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-010');
    return {
      state: 'watch',
      confidence: 'medium',
      primaryAction: 'observe',
      summary: '之前的异常已有后续正常复查支持缓解，但仍处于恢复观察期；继续确认没有复发。',
      reasons: unique(reasons),
      matchedRules,
      activeSignals: unique(recoverySignals.map(item => item.code)),
      priorCodes,
      observationTargets,
    };
  }

  const watchSignals = recent.filter(item => watchCodes.has(item.code) && !isRecovered(item, recent, 1));
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

  if (hadRepeatedBehaviorProblem && !repeatedBehaviorProblem && !recoveryConfirmedBehaviorProblem) {
    matchedRules.push('AQ-STATE-011');
    reasons.push(...allChasingSignals.map(item => item.evidence || item.code));
    return {
      state: 'watch',
      confidence: 'low',
      primaryAction: 'observe',
      summary: '过去两周出现过重复追咬或行为压力，但近期缺少足够复查；先确认是否仍在发生。',
      reasons: unique(reasons),
      matchedRules,
      activeSignals: [],
      priorCodes,
      observationTargets,
    };
  }

  const normalSignals = recent.filter(item => normalCodes.has(item.code));
  if (normalSignals.length > 0) {
    reasons.push(...normalSignals.map(item => item.evidence || item.code));
    matchedRules.push('AQ-STATE-001', 'AQ-STATE-003');
    const hasHighPrior = priors.some(item => item.level === 'high' && ['predation', 'aggression', 'territory'].includes(item.kind));
    if (hasHighPrior) {
      matchedRules.push('AQ-STATE-009');
      reasons.push(...priors.filter(item => item.level === 'high').map(item => item.evidence || item.code));
      return {
        state: 'watch',
        confidence: 'medium',
        primaryAction: 'observe',
        summary: '近期没有观察到异常，但当前组合存在已审核的高风险背景；不能把一次正常观察当成已经安全。',
        reasons: unique(reasons),
        matchedRules,
        activeSignals: unique(normalSignals.map(item => item.code)),
        priorCodes,
        observationTargets,
      };
    }
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

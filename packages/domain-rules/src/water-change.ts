import type { TankObservationCode } from './tank-state.js';

export type WaterChangeScheduleStatus = 'unknown' | 'complete' | 'not_due' | 'due' | 'overdue';
export type WaterChangeAction = 'none' | 'record_water_change' | 'check_water_quality';
export type WaterChangePriority = 'normal' | 'medium' | 'high';

export type EvaluateWaterChangeInput = {
  baselineDays?: number | null;
  history?: string[];
  today: string;
  currentSignals?: TankObservationCode[];
};

export type WaterChangeDecision = {
  scheduleStatus: WaterChangeScheduleStatus;
  action: WaterChangeAction;
  priority: WaterChangePriority;
  baselineDays: number | null;
  latestChangeDate: string | null;
  nextBaselineDate: string | null;
  daysUntilBaseline: number | null;
  overdueDays: number;
  currentSignals: TankObservationCode[];
  summary: string;
  reasons: string[];
  matchedRules: string[];
};

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
const waterQualitySignals = new Set<TankObservationCode>(['cloudy_water', 'odor']);
const severeWaterCheckSignals = new Set<TankObservationCode>(['respiratory_distress', 'multiple_deaths']);

const normalizeDateKey = (value: string) => {
  const candidate = DATE_KEY.test(value) ? value : value.slice(0, 10);
  if (!DATE_KEY.test(candidate)) return null;
  const [year, month, day] = candidate.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return candidate;
};

const dateKeyToMs = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

const addDays = (dateKey: string, days: number) => {
  const next = new Date(dateKeyToMs(dateKey) + days * DAY_MS);
  return next.toISOString().slice(0, 10);
};

const unique = <T,>(values: T[]) => Array.from(new Set(values));

export const evaluateWaterChangeDecision = ({
  baselineDays,
  history = [],
  today,
  currentSignals = [],
}: EvaluateWaterChangeInput): WaterChangeDecision => {
  const todayKey = normalizeDateKey(today);
  if (!todayKey) throw new Error('Water Change decision requires a valid local today date key.');

  const normalizedBaseline = Number.isFinite(baselineDays) && Number(baselineDays) > 0
    ? Math.max(1, Math.round(Number(baselineDays)))
    : null;
  const normalizedHistory = unique(history.map(normalizeDateKey).filter((value): value is string => Boolean(value))).sort();
  const futureHistory = normalizedHistory.filter(value => value > todayKey);
  const completedHistory = normalizedHistory.filter(value => value <= todayKey);
  const latestChangeDate = completedHistory.at(-1) || null;
  const signals = unique(currentSignals);
  const severeSignals = signals.filter(signal => severeWaterCheckSignals.has(signal));
  const waterSignals = signals.filter(signal => waterQualitySignals.has(signal));
  const matchedRules = ['AQ-WATER-001', 'AQ-WATER-002'];
  const reasons: string[] = [];

  if (futureHistory.length > 0) {
    matchedRules.push('AQ-WATER-003');
    reasons.push('未来日期没有被当作已完成换水历史。');
  }

  let scheduleStatus: WaterChangeScheduleStatus = 'unknown';
  let nextBaselineDate: string | null = null;
  let daysUntilBaseline: number | null = null;
  let overdueDays = 0;

  if (latestChangeDate === todayKey) {
    scheduleStatus = 'complete';
  } else if (latestChangeDate && normalizedBaseline) {
    nextBaselineDate = addDays(latestChangeDate, normalizedBaseline);
    daysUntilBaseline = Math.round((dateKeyToMs(nextBaselineDate) - dateKeyToMs(todayKey)) / DAY_MS);
    if (daysUntilBaseline < 0) {
      scheduleStatus = 'overdue';
      overdueDays = Math.abs(daysUntilBaseline);
    } else if (daysUntilBaseline <= 1) {
      scheduleStatus = 'due';
    } else {
      scheduleStatus = 'not_due';
    }
  }

  if (!latestChangeDate) reasons.push('缺少可用的已完成换水历史。');
  if (!normalizedBaseline) reasons.push('缺少可用的换水参考周期。');
  if (nextBaselineDate) reasons.push(`参考维护日期：${nextBaselineDate}。`);

  if (severeSignals.length > 0) {
    matchedRules.push('AQ-WATER-004');
    reasons.unshift('当前存在需要优先核查的严重异常信号，不能只按日历自动决定换水。');
    return {
      scheduleStatus,
      action: 'check_water_quality',
      priority: 'high',
      baselineDays: normalizedBaseline,
      latestChangeDate,
      nextBaselineDate,
      daysUntilBaseline,
      overdueDays,
      currentSignals: signals,
      summary: '当前异常证据优先于换水日历；先核查水体与当前状态，再决定处理方式。',
      reasons,
      matchedRules: unique(matchedRules),
    };
  }

  if (waterSignals.length > 0) {
    matchedRules.push('AQ-WATER-004');
    reasons.unshift('近期记录到水体外观或气味异常，先核查现实水体状态。');
    return {
      scheduleStatus,
      action: 'check_water_quality',
      priority: 'medium',
      baselineDays: normalizedBaseline,
      latestChangeDate,
      nextBaselineDate,
      daysUntilBaseline,
      overdueDays,
      currentSignals: signals,
      summary: '当前有水体异常证据，先检查水体状态，不把维护周期直接等同于必须换水。',
      reasons,
      matchedRules: unique(matchedRules),
    };
  }

  if (scheduleStatus === 'overdue') {
    matchedRules.push('AQ-WATER-004');
    reasons.unshift(`换水参考维护日期已过去 ${overdueDays} 天，但没有当前异常证据支持紧急状态。`);
    return {
      scheduleStatus,
      action: 'record_water_change',
      priority: 'medium',
      baselineDays: normalizedBaseline,
      latestChangeDate,
      nextBaselineDate,
      daysUntilBaseline,
      overdueDays,
      currentSignals: signals,
      summary: '换水维护已到期，今天可以完成并记录；仅逾期不代表鱼缸当前处于紧急状态。',
      reasons,
      matchedRules: unique(matchedRules),
    };
  }

  if (scheduleStatus === 'due') {
    return {
      scheduleStatus,
      action: 'record_water_change',
      priority: 'medium',
      baselineDays: normalizedBaseline,
      latestChangeDate,
      nextBaselineDate,
      daysUntilBaseline,
      overdueDays,
      currentSignals: signals,
      summary: '换水维护已进入 baseline 到期窗口。',
      reasons,
      matchedRules: unique(matchedRules),
    };
  }

  const summary = scheduleStatus === 'complete'
    ? '今天已经记录换水。'
    : scheduleStatus === 'not_due'
      ? '当前尚未到换水参考维护日期。'
      : '换水建议信息不足，暂不根据日历生成处理任务。';

  return {
    scheduleStatus,
    action: 'none',
    priority: 'normal',
    baselineDays: normalizedBaseline,
    latestChangeDate,
    nextBaselineDate,
    daysUntilBaseline,
    overdueDays,
    currentSignals: signals,
    summary,
    reasons,
    matchedRules: unique(matchedRules),
  };
};


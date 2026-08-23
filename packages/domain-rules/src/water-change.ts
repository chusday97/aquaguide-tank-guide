import type { TankObservationCode, TankState } from './tank-state';

export type WaterChangeStatus = 'not_needed' | 'due_soon' | 'recommended' | 'urgent' | 'unknown';
export type WaterChangePriority = 'none' | 'low' | 'medium' | 'high';
export type WaterChangeConfidence = 'high' | 'medium' | 'low' | 'unknown';

export type EvaluateWaterChangeInput = {
  baselineCycleDays?: number;
  lastWaterChangeAt?: string;
  waterChangedToday?: boolean;
  currentTankState?: TankState;
  currentSignals?: TankObservationCode[];
  bioloadPressure?: 'low' | 'elevated' | 'high' | 'unknown';
  now?: string;
};

export type WaterChangeResult = {
  status: WaterChangeStatus;
  priority: WaterChangePriority;
  confidence: WaterChangeConfidence;
  summary: string;
  reasons: string[];
  matchedRules: string[];
  daysSinceChange?: number;
  daysUntilBaseline?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const waterQualitySignals = new Set<TankObservationCode>(['cloudy_water', 'odor']);
const physiologicalSignals = new Set<TankObservationCode>(['respiratory_distress', 'multiple_deaths']);
const parseTime = (value: string | undefined) => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const hasAny = (signals: TankObservationCode[], set: Set<TankObservationCode>) => signals.some(signal => set.has(signal));

export const evaluateWaterChangeRecommendation = ({
  baselineCycleDays,
  lastWaterChangeAt,
  waterChangedToday = false,
  currentTankState,
  currentSignals = [],
  bioloadPressure = 'unknown',
  now = new Date().toISOString(),
}: EvaluateWaterChangeInput): WaterChangeResult => {
  const nowMs = parseTime(now) ?? Date.now();
  const lastMs = parseTime(lastWaterChangeAt);
  const validBaseline = Number.isFinite(baselineCycleDays) && Number(baselineCycleDays) > 0
    ? Math.max(1, Math.round(Number(baselineCycleDays)))
    : null;
  const hasWaterAbnormality = hasAny(currentSignals, waterQualitySignals);
  const hasPhysiologicalDanger = hasAny(currentSignals, physiologicalSignals);

  if (waterChangedToday) {
    return {
      status: 'not_needed',
      priority: 'none',
      confidence: 'high',
      summary: '今天已经记录换水，不重复生成新的换水任务。',
      reasons: ['今天已有完成的换水事实记录。'],
      matchedRules: ['AQ-WATER-001'],
      daysSinceChange: 0,
      daysUntilBaseline: validBaseline ?? undefined,
    };
  }

  if (hasWaterAbnormality && hasPhysiologicalDanger) {
    return {
      status: 'urgent',
      priority: 'high',
      confidence: 'high',
      summary: '当前水体异常同时伴随生物急性异常，换水属于当前处置的一部分。',
      reasons: ['结构化观察同时包含水体异常与呼吸/死亡等急性信号。'],
      matchedRules: ['AQ-WATER-004'],
    };
  }

  if (hasWaterAbnormality) {
    return {
      status: 'recommended',
      priority: 'medium',
      confidence: 'high',
      summary: '当前有明确水体异常，建议把换水作为近期处理动作，而不是等待日历到期。',
      reasons: ['结构化观察记录了浑浊或异味。'],
      matchedRules: ['AQ-WATER-002', 'AQ-WATER-004'],
    };
  }

  if (lastMs === null || validBaseline === null) {
    return {
      status: 'unknown',
      priority: 'low',
      confidence: 'unknown',
      summary: '缺少可靠的上次换水记录或维护基线，先补充事实再给出周期建议。',
      reasons: [lastMs === null ? '缺少上次换水事实。' : '缺少可用维护基线。'],
      matchedRules: ['AQ-WATER-001', 'AQ-WATER-002'],
    };
  }

  const daysSinceChange = Math.max(0, Math.floor((nowMs - lastMs) / DAY_MS));
  const daysUntilBaseline = validBaseline - daysSinceChange;
  const contextReason = currentTankState === 'stable'
    ? '当前 Tank State 稳定。'
    : currentTankState
      ? `当前 Tank State：${currentTankState}。`
      : '当前 Tank State 未提供。';
  const loadReason = bioloadPressure === 'high'
    ? '整缸粗略负荷筛查偏高，仅作为维护背景，不单独升级紧急度。'
    : null;

  if (daysUntilBaseline < 0) {
    return {
      status: 'recommended',
      priority: 'medium',
      confidence: currentTankState ? 'medium' : 'low',
      summary: currentTankState === 'stable'
        ? '维护基线已到，但当前状态稳定；安排常规换水即可，不属于紧急处置。'
        : '维护基线已到，建议安排常规换水，并结合当前状态决定先后顺序。',
      reasons: [`距上次换水约 ${daysSinceChange} 天，维护基线约 ${validBaseline} 天。`, contextReason, ...(loadReason ? [loadReason] : [])],
      matchedRules: ['AQ-WATER-002', 'AQ-WATER-004'],
      daysSinceChange,
      daysUntilBaseline,
    };
  }

  if (daysUntilBaseline <= 1) {
    return {
      status: 'due_soon',
      priority: 'low',
      confidence: 'medium',
      summary: '接近维护基线，可以安排下一次常规换水，但不需要把它当作当前异常。',
      reasons: [`距上次换水约 ${daysSinceChange} 天，距离维护基线约 ${daysUntilBaseline} 天。`, contextReason],
      matchedRules: ['AQ-WATER-002'],
      daysSinceChange,
      daysUntilBaseline,
    };
  }

  return {
    status: 'not_needed',
    priority: 'none',
    confidence: 'medium',
    summary: '当前没有水体异常证据，且尚未接近维护基线，不需要安排换水。',
    reasons: [`距上次换水约 ${daysSinceChange} 天，距离维护基线约 ${daysUntilBaseline} 天。`, contextReason],
    matchedRules: ['AQ-WATER-002'],
    daysSinceChange,
    daysUntilBaseline,
  };
};

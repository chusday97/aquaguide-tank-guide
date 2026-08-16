import { TANK_LOAD_THRESHOLDS } from './recommendation.config';

export type LoadPressureLevel = 'unknown' | 'low' | 'moderate' | 'high' | 'near_limit';

export type RecommendationTankSemantics = {
  estimatedWaterVolume: {
    liters: number | null;
    labelZh: '估算有效水量';
    labelEn: 'Estimated water volume';
    explanationZh: string;
    explanationEn: string;
  };
  loadPressure: {
    level: LoadPressureLevel;
    estimatedRate: number | null;
    isHeuristic: true;
    labelZh: string;
    labelEn: string;
    explanationZh: string;
    explanationEn: string;
  };
};

const normalizeRate = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.max(0, Math.round(value));
};

export const getLoadPressureLevel = (
  loadRate: number | null | undefined,
  capacityKnown: boolean,
): LoadPressureLevel => {
  const normalized = normalizeRate(loadRate);
  if (!capacityKnown || normalized === null) return 'unknown';
  if (normalized >= TANK_LOAD_THRESHOLDS.nearLimit) return 'near_limit';
  if (normalized >= TANK_LOAD_THRESHOLDS.moderate) return 'high';
  if (normalized >= TANK_LOAD_THRESHOLDS.relaxed) return 'moderate';
  return 'low';
};

const LOAD_LABELS: Record<LoadPressureLevel, { zh: string; en: string }> = {
  unknown: { zh: '待确认', en: 'Needs information' },
  low: { zh: '较低', en: 'Low' },
  moderate: { zh: '中等', en: 'Moderate' },
  high: { zh: '偏高', en: 'High' },
  near_limit: { zh: '接近建议上限', en: 'Near the suggested limit' },
};

/**
 * Translate recommendation internals into user-facing semantics without turning
 * heuristic carrying-capacity math into a fake physical volume measurement.
 *
 * The physical/estimated water volume is kept separate from load pressure. A
 * filter/care multiplier can affect the heuristic load budget used internally,
 * but it must never be described as making the aquarium contain more liters.
 */
export const buildRecommendationTankSemantics = (input: {
  estimatedWaterVolumeLiters: number | null | undefined;
  loadRate: number | null | undefined;
  capacityKnown: boolean;
}): RecommendationTankSemantics => {
  const waterVolume = input.estimatedWaterVolumeLiters !== null
    && input.estimatedWaterVolumeLiters !== undefined
    && Number.isFinite(input.estimatedWaterVolumeLiters)
    && input.estimatedWaterVolumeLiters > 0
      ? Math.round(input.estimatedWaterVolumeLiters)
      : null;
  const loadPressureLevel = getLoadPressureLevel(input.loadRate, input.capacityKnown);
  const loadRate = loadPressureLevel === 'unknown' ? null : normalizeRate(input.loadRate);
  const label = LOAD_LABELS[loadPressureLevel];

  return {
    estimatedWaterVolume: {
      liters: waterVolume,
      labelZh: '估算有效水量',
      labelEn: 'Estimated water volume',
      explanationZh: '根据鱼缸尺寸估算实际水体；过滤、换水或增氧不会把它变成更多升水。',
      explanationEn: 'Estimated from tank dimensions; filtration, water changes, and aeration do not turn it into more liters of water.',
    },
    loadPressure: {
      level: loadPressureLevel,
      estimatedRate: loadRate,
      isHeuristic: true,
      labelZh: label.zh,
      labelEn: label.en,
      explanationZh: loadPressureLevel === 'unknown'
        ? '关键容量信息不足，暂不计算饲养压力，避免把未知显示成 0%。'
        : '这是用于比较饲养压力的启发式估算，不代表已经使用了对应百分比的水量，也不是安全概率。',
      explanationEn: loadPressureLevel === 'unknown'
        ? 'Key capacity information is missing, so load pressure stays unknown instead of being displayed as 0%.'
        : 'This is a heuristic estimate for comparing stocking pressure; it is not the percentage of water used and is not a safety probability.',
    },
  };
};

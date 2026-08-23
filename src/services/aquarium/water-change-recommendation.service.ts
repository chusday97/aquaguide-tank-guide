import type { Aquarium, Fish } from '../../types';
import { evaluateWaterChangeRecommendation, type WaterChangeResult } from '../../../packages/domain-rules/src';
import type { CurrentTankStateEvidence } from './tank-state-evidence.service';
import { getLatestWaterChangeDate } from './water-change.service';

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWaterChangeBaselineDays = (aquarium: Aquarium, speciesCatalog: Fish[]) => {
  const cycles = aquarium.fishes.flatMap(record => {
    const species = speciesCatalog.find(item => item.id === record.fishId);
    const cycle = Number(species?.waterChangeCycle);
    return Number.isFinite(cycle) && cycle > 0 ? [Math.round(cycle)] : [];
  });
  return cycles.length > 0 ? Math.min(...cycles) : undefined;
};

export const deriveWaterChangeRecommendation = ({
  aquarium,
  speciesCatalog,
  tankStateEvidence,
  now = new Date(),
}: {
  aquarium: Aquarium;
  speciesCatalog: Fish[];
  tankStateEvidence: CurrentTankStateEvidence | null;
  now?: Date;
}): WaterChangeResult => {
  const history = aquarium.waterChangeHistory || [];
  const latestHistoryDate = getLatestWaterChangeDate(history);
  const latestAt = latestHistoryDate
    ? `${latestHistoryDate}T12:00:00`
    : aquarium.lastWaterChangeDate;
  const todayKey = toLocalDateKey(now);
  return evaluateWaterChangeRecommendation({
    baselineCycleDays: getWaterChangeBaselineDays(aquarium, speciesCatalog),
    lastWaterChangeAt: latestAt,
    waterChangedToday: history.includes(todayKey),
    currentTankState: tankStateEvidence?.result.state,
    currentSignals: tankStateEvidence?.result.activeSignals || [],
    bioloadPressure: tankStateEvidence?.compatibilityDecision?.wholeTankFeasibility.bioloadPressure || 'unknown',
    now: now.toISOString(),
  });
};

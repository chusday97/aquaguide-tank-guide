import type { Aquarium, Fish } from '../../types';
import { evaluateWaterChangeDecision, type WaterChangeDecision } from '../../../packages/domain-rules/src';
import type { CurrentTankStateEvidence } from './tank-state-evidence.service';

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const deriveWaterChangeDecision = ({
  aquarium,
  speciesCatalog,
  tankStateEvidence,
  now = new Date(),
}: {
  aquarium: Aquarium;
  speciesCatalog: Fish[];
  tankStateEvidence: CurrentTankStateEvidence | null;
  now?: Date;
}): WaterChangeDecision => {
  const cycles = aquarium.fishes
    .map(record => speciesCatalog.find(species => species.id === record.fishId)?.waterChangeCycle)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);
  const baselineDays = cycles.length > 0 ? Math.min(...cycles) : null;
  const history = [...(aquarium.waterChangeHistory || [])];
  if (aquarium.lastWaterChangeDate) history.push(aquarium.lastWaterChangeDate);

  return evaluateWaterChangeDecision({
    baselineDays,
    history,
    today: toLocalDateKey(now),
    currentSignals: tankStateEvidence?.result.activeSignals || [],
  });
};


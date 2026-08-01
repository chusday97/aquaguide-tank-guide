import type { TankCompatibilityStatus } from '../../lib/tankCompatibilityEngine';
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';
import { trackActivationIfFirstValidCompatibility, trackSessionEvent } from '../analytics/session-events.service';

export interface CompatibilityRecord {
  id: string;
  aquariumId: string;
  speciesIds: string[];
  status: TankCompatibilityStatus;
  scope: 'tank';
  evaluatedAt: string;
}

export const isCompatibilityRecord = (value: unknown): value is CompatibilityRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<CompatibilityRecord>;
  return typeof record.id === 'string'
    && typeof record.aquariumId === 'string'
    && Array.isArray(record.speciesIds)
    && record.speciesIds.length >= 2
    && record.speciesIds.every(id => typeof id === 'string')
    && ['compatible', 'caution', 'not_recommended', 'insufficient_data'].includes(String(record.status))
    && record.scope === 'tank'
    && typeof record.evaluatedAt === 'string';
};

export const recordTankCompatibility = (input: Omit<CompatibilityRecord, 'id' | 'evaluatedAt' | 'scope'>) => {
  const state = loadAppStateFromStorage();
  const speciesIds = [...new Set(input.speciesIds)].sort();
  if (!input.aquariumId || speciesIds.length < 2) return null;
  const alreadyActivated = state.compatibilityRecords.some(item => (
    isCompatibilityRecord(item) && state.aquariums.some(aquarium => aquarium.id === item.aquariumId)
  ));

  const record: CompatibilityRecord = {
    id: crypto.randomUUID(),
    aquariumId: input.aquariumId,
    speciesIds,
    status: input.status,
    scope: 'tank',
    evaluatedAt: new Date().toISOString(),
  };
  const existing = state.compatibilityRecords.filter(item => {
    if (!isCompatibilityRecord(item)) return true;
    return !(item.aquariumId === record.aquariumId && item.speciesIds.join('|') === speciesIds.join('|'));
  });
  patchLocalAppState({ compatibilityRecords: [...existing, record] });
  trackSessionEvent('compatibility_completed', {
    action: 'complete',
    status: record.status,
    entry: 'full_compatibility',
    source: 'rules',
    candidateCount: record.speciesIds.length,
  });
  trackActivationIfFirstValidCompatibility({
    alreadyActivated,
    status: record.status,
    candidateCount: record.speciesIds.length,
  });
  return record;
};

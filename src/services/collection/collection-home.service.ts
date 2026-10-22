import type { KeepingHistoryEvent, KeepingHistorySnapshot } from '../../modules/collection/collection.types';
import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium } from '../../types';
import { findDailyPatrolRecord } from '../diagnosis/diagnosis-records.service';

export type CollectionHomePriorityKind =
  | 'setup_aquarium'
  | 'add_resident'
  | 'daily_check_due'
  | 'daily_check_attention'
  | 'daily_check_recorded';

export type CollectionHomePriority = {
  kind: CollectionHomePriorityKind;
  summary?: string;
  suggestedAction?: string;
};

export type CollectionHomeModel = {
  aquarium: Aquarium | null;
  speciesCount: number;
  residentCount: number;
  daysRunning: number | null;
  volumeLiters: number | null;
  residentSpeciesIds: string[];
  recentEvents: KeepingHistoryEvent[];
  priority: CollectionHomePriority;
};

type BuildCollectionHomeInput = {
  aquariums: Aquarium[];
  currentAquariumId?: string;
  diagnosisRecords: DiagnosisRecord[];
  history: KeepingHistorySnapshot;
  now?: Date;
};

const finitePositive = (value: string | undefined) => {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const aquariumVolumeLiters = (aquarium: Aquarium) => {
  const length = finitePositive(aquarium.dimensions?.length);
  const width = finitePositive(aquarium.dimensions?.width);
  const height = finitePositive(aquarium.dimensions?.height);
  if (length === null || width === null || height === null) return null;
  return Math.round((length * width * height) / 1000);
};

const aquariumDaysRunning = (aquarium: Aquarium, now: Date) => {
  if (!aquarium.startedAt) return null;
  const startedAt = new Date(aquarium.startedAt);
  if (Number.isNaN(startedAt.getTime()) || startedAt.getTime() > now.getTime()) return null;
  return Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 86_400_000));
};

export const buildCollectionHomeModel = ({
  aquariums,
  currentAquariumId,
  diagnosisRecords,
  history,
  now = new Date(),
}: BuildCollectionHomeInput): CollectionHomeModel => {
  const aquarium = aquariums.find(item => item.id === currentAquariumId) || aquariums[0] || null;

  if (!aquarium) {
    return {
      aquarium: null,
      speciesCount: 0,
      residentCount: 0,
      daysRunning: null,
      volumeLiters: null,
      residentSpeciesIds: [],
      recentEvents: [],
      priority: { kind: 'setup_aquarium' },
    };
  }

  const liveResidents = aquarium.fishes.filter(record => record.quantity > 0);
  const residentSpeciesIds = [...new Set(liveResidents.map(record => record.fishId))];
  const residentCount = liveResidents.reduce((sum, record) => sum + record.quantity, 0);
  const recentEvents = history.events
    .filter(event => event.aquariumId === aquarium.id)
    .slice(0, 4);

  if (liveResidents.length === 0) {
    return {
      aquarium,
      speciesCount: 0,
      residentCount: 0,
      daysRunning: aquariumDaysRunning(aquarium, now),
      volumeLiters: aquariumVolumeLiters(aquarium),
      residentSpeciesIds: [],
      recentEvents,
      priority: { kind: 'add_resident' },
    };
  }

  const todayCheck = findDailyPatrolRecord(diagnosisRecords, aquarium.id, now);
  let priority: CollectionHomePriority;

  if (!todayCheck) {
    priority = { kind: 'daily_check_due' };
  } else if (todayCheck.riskCode === 'high' || todayCheck.riskCode === 'medium' || todayCheck.riskCode === 'unknown') {
    priority = {
      kind: 'daily_check_attention',
      summary: todayCheck.conclusion || todayCheck.resultSummary,
      suggestedAction: todayCheck.suggestedActions?.[0],
    };
  } else {
    priority = {
      kind: 'daily_check_recorded',
      summary: todayCheck.resultSummary,
      suggestedAction: todayCheck.suggestedActions?.[0],
    };
  }

  return {
    aquarium,
    speciesCount: residentSpeciesIds.length,
    residentCount,
    daysRunning: aquariumDaysRunning(aquarium, now),
    volumeLiters: aquariumVolumeLiters(aquarium),
    residentSpeciesIds,
    recentEvents,
    priority,
  };
};

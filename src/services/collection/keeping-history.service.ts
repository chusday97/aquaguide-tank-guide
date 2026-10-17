import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Fish } from '../../types';
import type {
  KeepingCohortSummary,
  KeepingHistoryEvent,
  KeepingHistoryEventType,
  KeepingHistorySnapshot,
  MemorialItem,
} from '../../modules/collection/collection.types';
import { isCompatibilityRecord } from '../compatibility/compatibility-records.service';
import type { CareReminderRecord } from '../care/care-activity.service';
import { buildAquariumTimeline } from '../care/care-timeline.service';
import type { LocalAppState, LocalCareEventRecord } from '../storage/local-app-state';

type BuildKeepingHistoryInput = {
  appState: LocalAppState;
  memorials: MemorialItem[];
  reminders?: CareReminderRecord[];
  speciesCatalog?: Fish[];
};

const lifecycleTypes = new Set<KeepingHistoryEventType>([
  'species_added',
  'species_removed',
  'life_stage_updated',
  'memorial',
]);

const timeValue = (value: string) => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const diagnosisRecords = (state: LocalAppState) => state.diagnosisRecords.filter((value): value is DiagnosisRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<DiagnosisRecord>;
  return typeof record.aquariumId === 'string'
    && typeof record.problemType === 'string'
    && typeof record.createdAt === 'string';
});

const stringsFromPayload = (payload: Record<string, unknown>) => {
  const ids = new Set<string>();
  if (typeof payload.speciesId === 'string' && payload.speciesId) ids.add(payload.speciesId);
  if (Array.isArray(payload.speciesIds)) {
    payload.speciesIds.forEach(id => {
      if (typeof id === 'string' && id) ids.add(id);
    });
  }
  return [...ids];
};

const toHistoryEvent = (
  event: LocalCareEventRecord,
  aquariumNames: Map<string, string>,
  aquariumFishSpecies: Map<string, string>,
): KeepingHistoryEvent => {
  const speciesIds = stringsFromPayload(event.payload);
  const recordId = typeof event.payload.aquariumFishId === 'string'
    ? event.payload.aquariumFishId
    : typeof event.payload.speciesRecordId === 'string'
      ? event.payload.speciesRecordId
      : undefined;
  if (speciesIds.length === 0 && recordId) {
    const speciesId = aquariumFishSpecies.get(recordId);
    if (speciesId) speciesIds.push(speciesId);
  }
  return {
    id: `care:${event.id}`,
    eventType: event.eventType,
    occurredAt: event.occurredAt,
    title: event.title,
    label: event.label,
    aquariumId: event.aquariumId,
    aquariumName: aquariumNames.get(event.aquariumId),
    speciesIds,
    payload: event.payload,
    sourceType: event.sourceType,
    sourceId: event.sourceId,
    isInferred: event.isInferred,
  };
};

export const buildKeepingHistory = ({
  appState,
  memorials,
  reminders = [],
  speciesCatalog = [],
}: BuildKeepingHistoryInput): KeepingHistorySnapshot => {
  const aquariumNames = new Map(appState.aquariums.map(aquarium => [aquarium.id, aquarium.name]));
  const aquariumFishSpecies = new Map(
    appState.aquariums.flatMap(aquarium => aquarium.fishes.map(record => [record.id, record.fishId] as const)),
  );
  const events = new Map<string, KeepingHistoryEvent>();

  const putCareEvent = (event: LocalCareEventRecord) => {
    const historyEvent = toHistoryEvent(event, aquariumNames, aquariumFishSpecies);
    events.set(historyEvent.id, historyEvent);
  };

  for (const aquarium of appState.aquariums) {
    buildAquariumTimeline({
      aquarium,
      species: speciesCatalog,
      diagnosisRecords: diagnosisRecords(appState),
      feedingRecords: appState.feedingRecords,
      reminders,
      persistedEvents: appState.careEvents || [],
    }).forEach(putCareEvent);
  }

  // Preserve explicit events even when their aquarium was later removed from the current tank list.
  (appState.careEvents || []).forEach(putCareEvent);

  appState.observationRecords.forEach(record => {
    events.set(`observation:${record.id}`, {
      id: `observation:${record.id}`,
      eventType: 'observation',
      occurredAt: record.createdAt,
      title: '记录观察',
      label: record.note,
      aquariumId: record.aquariumId,
      aquariumName: aquariumNames.get(record.aquariumId),
      speciesIds: [],
      payload: {},
      sourceType: 'observation_record',
      sourceId: record.id,
      isInferred: false,
    });
  });

  memorials.forEach(record => {
    events.set(`memorial:${record.id}`, {
      id: `memorial:${record.id}`,
      eventType: 'memorial',
      occurredAt: record.date,
      title: '生命纪念',
      label: record.reason || record.observation,
      speciesIds: [record.fishId],
      payload: {
        causeCodes: record.causeCodes || [],
        improvement: record.improvement,
      },
      sourceType: 'memorial_record',
      sourceId: record.id,
      isInferred: false,
    });
  });

  appState.compatibilityRecords.filter(isCompatibilityRecord).forEach(record => {
    events.set(`compatibility:${record.id}`, {
      id: `compatibility:${record.id}`,
      eventType: 'compatibility_decision',
      occurredAt: record.evaluatedAt,
      title: '完成混养判断',
      label: record.status,
      aquariumId: record.aquariumId,
      aquariumName: aquariumNames.get(record.aquariumId),
      speciesIds: record.speciesIds,
      payload: { status: record.status, scope: record.scope },
      sourceType: 'compatibility_record',
      sourceId: record.id,
      isInferred: false,
    });
  });

  const activeCohorts: KeepingCohortSummary[] = appState.aquariums.flatMap(aquarium => (
    aquarium.fishes.flatMap(record => {
      const batches = record.batches?.length
        ? record.batches
        : [{
            id: record.id,
            quantity: record.quantity,
            entryDate: record.entryDate,
            lifeStage: undefined,
            reproductiveState: undefined,
            stateUpdatedAt: undefined,
          }];
      return batches
        .filter(batch => batch.quantity > 0)
        .map(batch => ({
          id: batch.id,
          aquariumId: aquarium.id,
          aquariumName: aquarium.name,
          speciesId: record.fishId,
          quantity: batch.quantity,
          entryDate: batch.entryDate,
          lifeStage: batch.lifeStage,
          reproductiveState: batch.reproductiveState,
          stateUpdatedAt: batch.stateUpdatedAt,
        }));
    })
  ));

  const currentSpeciesIds = new Set(activeCohorts.map(cohort => cohort.speciesId));
  const speciesEverKeptIds = new Set(currentSpeciesIds);
  events.forEach(event => {
    if (!lifecycleTypes.has(event.eventType)) return;
    event.speciesIds.forEach(speciesId => speciesEverKeptIds.add(speciesId));
  });

  const orderedEvents = [...events.values()].sort((a, b) => (
    timeValue(b.occurredAt) - timeValue(a.occurredAt) || a.id.localeCompare(b.id)
  ));
  const aquariumIds = new Set(appState.aquariums.map(aquarium => aquarium.id));
  orderedEvents.forEach(event => {
    if (event.aquariumId) aquariumIds.add(event.aquariumId);
  });

  return {
    events: orderedEvents,
    activeCohorts: activeCohorts.sort((a, b) => timeValue(b.entryDate) - timeValue(a.entryDate)),
    speciesEverKeptIds: [...speciesEverKeptIds].sort(),
    currentSpeciesIds: [...currentSpeciesIds].sort(),
    aquariumIds: [...aquariumIds].sort(),
  };
};

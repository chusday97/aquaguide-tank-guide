import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium, Fish } from '../../types';
import type { CareEventType } from '../../types/database';
import {
  loadAppStateFromStorage,
  patchLocalAppState,
  type LocalCareEventRecord,
  type LocalEventRecord,
} from '../storage/local-app-state';
import type { CareReminderRecord } from './care-activity.service';

export type CareTimelineItem = LocalCareEventRecord;

type TimelineContext = {
  aquarium: Aquarium;
  species: Fish[];
  diagnosisRecords: DiagnosisRecord[];
  feedingRecords: LocalEventRecord[];
  reminders: CareReminderRecord[];
  persistedEvents?: LocalCareEventRecord[];
};

const stableEventId = (aquariumId: string, eventType: CareEventType, sourceType: string, sourceId: string) =>
  `${aquariumId}:${eventType}:${sourceType}:${sourceId}`;

const asIso = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
};

export const recordCareTimelineEvent = (input: Omit<LocalCareEventRecord, 'id'>) => {
  if (Boolean(input.sourceType) !== Boolean(input.sourceId)) {
    throw new Error('鱼缸记录的来源类型和来源标识必须同时提供。');
  }
  const current = loadAppStateFromStorage().careEvents || [];
  const id = input.sourceType && input.sourceId
    ? stableEventId(input.aquariumId, input.eventType, input.sourceType, input.sourceId)
    : `${input.aquariumId}:${input.eventType}:${Date.now()}`;
  const record: LocalCareEventRecord = { ...input, id };
  patchLocalAppState({ careEvents: [record, ...current.filter(item => item.id !== id)] });
  return record;
};

export const removeCareTimelineEvent = (aquariumId: string, sourceType: string, sourceId: string) => {
  const current = loadAppStateFromStorage().careEvents || [];
  patchLocalAppState({
    careEvents: current.filter(item => !(item.aquariumId === aquariumId && item.sourceType === sourceType && item.sourceId === sourceId)),
  });
};

export const buildAquariumTimeline = ({
  aquarium,
  species,
  diagnosisRecords,
  feedingRecords,
  reminders,
  persistedEvents = loadAppStateFromStorage().careEvents || [],
}: TimelineContext): CareTimelineItem[] => {
  const fallbackDate = new Date().toISOString();
  const speciesById = new Map(species.map(item => [item.id, item]));
  const derived: CareTimelineItem[] = [];
  const addDerived = (input: Omit<LocalCareEventRecord, 'id' | 'aquariumId' | 'isInferred'>) => {
    if (!input.sourceType || !input.sourceId) return;
    derived.push({
      ...input,
      id: stableEventId(aquarium.id, input.eventType, input.sourceType, input.sourceId),
      aquariumId: aquarium.id,
      isInferred: true,
    });
  };

  const startedAt = asIso(
    aquarium.startedAt,
    aquarium.fishes.map(item => item.entryDate).sort()[0] || aquarium.lastWaterChangeDate || fallbackDate,
  );
  addDerived({
    eventType: 'aquarium_created',
    title: '建立鱼缸',
    label: aquarium.startedAtSource === 'inferred' ? '日期由旧记录推算' : undefined,
    payload: {},
    occurredAt: startedAt,
    sourceType: 'aquarium',
    sourceId: aquarium.id,
  });

  aquarium.fishes.forEach(record => {
    const name = speciesById.get(record.fishId)?.name || '缸内生物';
    const batches = record.batches?.length ? record.batches : [{ id: record.id, quantity: record.quantity, entryDate: record.entryDate }];
    batches.forEach(batch => addDerived({
      eventType: 'species_added',
      title: `加入${name}`,
      label: `${batch.quantity} 只/条`,
      payload: { speciesId: record.fishId, quantity: batch.quantity },
      occurredAt: asIso(batch.entryDate, fallbackDate),
      sourceType: 'livestock_batch',
      sourceId: batch.id,
    }));
  });

  (aquarium.waterChangeHistory || []).forEach(date => addDerived({
    eventType: 'water_change',
    title: '记录换水',
    payload: {},
    occurredAt: asIso(`${date}T12:00:00`, fallbackDate),
    sourceType: 'water_change_day',
    sourceId: date,
  }));

  feedingRecords.filter(item => item.aquariumId === aquarium.id).forEach(item => addDerived({
    eventType: 'feeding',
    title: '记录喂食',
    label: item.note,
    payload: {},
    occurredAt: asIso(item.createdAt, fallbackDate),
    sourceType: 'feeding_record',
    sourceId: item.id,
  }));

  diagnosisRecords.filter(item => item.aquariumId === aquarium.id).forEach(item => addDerived({
    eventType: 'daily_check',
    title: item.problemType === '巡检' ? '完成每日检查' : `完成${item.problemType}`,
    label: item.resultSummary,
    payload: { riskLevel: item.riskLevel },
    occurredAt: asIso(item.createdAt, fallbackDate),
    sourceType: 'diagnosis_record',
    sourceId: item.id || item.diagnosisId,
  }));

  reminders.filter(item => item.aquariumId === aquarium.id && item.completedAt).forEach(item => addDerived({
    eventType: 'care_plan_completed',
    title: `完成养护计划：${item.title}`,
    payload: {},
    occurredAt: asIso(item.completedAt, fallbackDate),
    sourceType: 'care_reminder',
    sourceId: item.id,
  }));

  const merged = new Map<string, CareTimelineItem>();
  derived.forEach(item => merged.set(item.id, item));
  persistedEvents.filter(item => item.aquariumId === aquarium.id).forEach(item => merged.set(item.id, item));
  return [...merged.values()].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
};

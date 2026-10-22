import type { KeepingHistoryEvent, KeepingHistorySnapshot } from '../../modules/collection/collection.types';
import type { DiagnosisRecord } from '../../modules/diagnosis/diagnosis.types';
import type { Aquarium } from '../../types';
import { getCareReminderStatus, type CareReminderRecord } from '../care/care-activity.service';
import { findDailyPatrolRecord } from '../diagnosis/diagnosis-records.service';

export type CollectionHomePriorityKind =
  | 'setup_aquarium'
  | 'add_resident'
  | 'diagnosis_attention'
  | 'follow_up_due'
  | 'care_reminder_overdue'
  | 'care_reminder_today'
  | 'new_resident_observation'
  | 'daily_check_recorded'
  | 'no_priority_task';

export type CollectionHomePriority = {
  kind: CollectionHomePriorityKind;
  summary?: string;
  suggestedAction?: string;
  sourceId?: string;
  sourceTitle?: string;
  scheduledFor?: string;
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
  reminders?: CareReminderRecord[];
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

const timeValue = (value: string | undefined) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const latestDiagnosisByProblem = (records: DiagnosisRecord[], aquariumId: string) => {
  const latest = new Map<string, DiagnosisRecord>();
  records
    .filter(record => record.aquariumId === aquariumId)
    .sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt))
    .forEach(record => {
      if (!latest.has(record.problemType)) latest.set(record.problemType, record);
    });
  return [...latest.values()];
};

const unresolvedDiagnosisPriority = (records: DiagnosisRecord[], aquariumId: string): CollectionHomePriority | null => {
  const latest = latestDiagnosisByProblem(records, aquariumId);
  const attention = latest
    .filter(record => record.riskCode === 'high' || record.riskCode === 'medium' || record.riskCode === 'unknown')
    .sort((a, b) => {
      const rank = (record: DiagnosisRecord) => record.riskCode === 'high' ? 3 : record.riskCode === 'medium' ? 2 : 1;
      return rank(b) - rank(a) || timeValue(b.createdAt) - timeValue(a.createdAt);
    })[0];
  if (!attention) return null;
  return {
    kind: 'diagnosis_attention',
    summary: attention.conclusion || attention.resultSummary,
    suggestedAction: attention.suggestedActions?.[0],
    sourceId: attention.diagnosisId || attention.id,
    sourceTitle: attention.problemType,
    scheduledFor: attention.nextCheckAt,
  };
};

const dueFollowUpPriority = (records: DiagnosisRecord[], aquariumId: string, now: Date): CollectionHomePriority | null => {
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1;
  const due = latestDiagnosisByProblem(records, aquariumId)
    .filter(record => record.nextCheckAt && timeValue(record.nextCheckAt) <= endOfToday)
    .sort((a, b) => timeValue(a.nextCheckAt) - timeValue(b.nextCheckAt))[0];
  if (!due) return null;
  return {
    kind: 'follow_up_due',
    summary: due.followUpNotes?.[0] || due.observeItems?.[0] || due.resultSummary,
    suggestedAction: due.suggestedActions?.[0],
    sourceId: due.diagnosisId || due.id,
    sourceTitle: due.problemType,
    scheduledFor: due.nextCheckAt,
  };
};

const dueReminderPriority = (reminders: CareReminderRecord[], aquariumId: string, now: Date): CollectionHomePriority | null => {
  const candidates = reminders
    .filter(reminder => !reminder.completedAt && (!reminder.aquariumId || reminder.aquariumId === aquariumId))
    .map(reminder => ({ reminder, status: getCareReminderStatus(reminder, now) }))
    .filter(item => item.status === 'overdue' || item.status === 'today')
    .sort((a, b) => {
      const rank = (status: 'overdue' | 'today' | 'upcoming' | 'completed') => status === 'overdue' ? 2 : status === 'today' ? 1 : 0;
      return rank(b.status) - rank(a.status) || timeValue(a.reminder.scheduledFor) - timeValue(b.reminder.scheduledFor);
    });
  const first = candidates[0];
  if (!first) return null;
  return {
    kind: first.status === 'overdue' ? 'care_reminder_overdue' : 'care_reminder_today',
    summary: first.reminder.label,
    sourceId: first.reminder.id,
    sourceTitle: first.reminder.title,
    scheduledFor: first.reminder.scheduledFor,
  };
};

const recentResidentPriority = (history: KeepingHistorySnapshot, aquariumId: string, now: Date): CollectionHomePriority | null => {
  const cutoff = now.getTime() - (72 * 60 * 60 * 1000);
  const event = history.events.find(item => (
    item.aquariumId === aquariumId
    && item.eventType === 'species_added'
    && item.isInferred === false
    && timeValue(item.occurredAt) >= cutoff
    && timeValue(item.occurredAt) <= now.getTime()
  ));
  if (!event) return null;
  return {
    kind: 'new_resident_observation',
    summary: event.label || event.title,
    sourceId: event.id,
    scheduledFor: event.occurredAt,
  };
};

export const buildCollectionHomeModel = ({
  aquariums,
  currentAquariumId,
  diagnosisRecords,
  reminders = [],
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
  const priority = unresolvedDiagnosisPriority(diagnosisRecords, aquarium.id)
    || dueFollowUpPriority(diagnosisRecords, aquarium.id, now)
    || dueReminderPriority(reminders, aquarium.id, now)
    || recentResidentPriority(history, aquarium.id, now)
    || (todayCheck
      ? {
          kind: 'daily_check_recorded' as const,
          summary: todayCheck.resultSummary,
          suggestedAction: todayCheck.suggestedActions?.[0],
          sourceId: todayCheck.diagnosisId || todayCheck.id,
          sourceTitle: todayCheck.problemType,
        }
      : { kind: 'no_priority_task' as const });

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

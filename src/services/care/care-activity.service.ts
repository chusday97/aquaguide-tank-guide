export const CARE_REMINDERS_STORAGE_KEY = 'aqua_care_reminders';
export const CARE_COMPLETED_OPERATIONS_STORAGE_KEY = 'aqua_care_completed_operations';
export const CARE_SAVED_CHECKLISTS_STORAGE_KEY = 'aqua_care_saved_checklists';
export const CARE_ACTIVITY_CHANGED_EVENT = 'aquaguide:care-activity-changed';

export type CareReminderRecord = {
  id: string;
  sourceTopicId: string;
  title: string;
  type: string;
  createdAt: string;
  scheduledFor: string;
  aquariumId?: string;
  label?: string;
  completedAt?: string;
  seriesId?: string;
  repeatEnabled?: boolean;
  repeatIntervalDays?: number;
};
export type CareReminderStatus = 'overdue' | 'today' | 'upcoming' | 'completed';
export type CareCompletedOperation = { id: string; title: string; label: string; aquariumId?: string; completedAt: string };

type CareOperationEventLike = {
  aquariumId?: string;
  eventType: string;
  title: string;
  label?: string;
  occurredAt: string;
  sourceType?: string;
  sourceId?: string;
};

export const getCompletedCareOperationsFromEvents = (
  events: CareOperationEventLike[],
  aquariumId?: string,
): CareCompletedOperation[] => {
  const seen = new Set<string>();
  return [...events]
    .filter(event => event.eventType === 'care_operation_completed'
      && event.sourceType === 'care_operation'
      && Boolean(event.sourceId)
      && (!aquariumId || event.aquariumId === aquariumId))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .flatMap(event => {
      const sourceId = event.sourceId!;
      const identity = `${event.aquariumId || 'global'}:${sourceId}`;
      if (seen.has(identity)) return [];
      seen.add(identity);
      return [{
        id: sourceId,
        title: event.title,
        label: event.label || event.title,
        aquariumId: event.aquariumId,
        completedAt: event.occurredAt,
      }];
    });
};
export type CareSavedChecklist = {
  id: string;
  title: string;
  savedAt: string;
  actionKeys?: string[];
  /** Legacy display-text identities retained only for migration/fallback. */
  actions?: string[];
  aquariumId?: string;
};

export const getCareChecklistActionKey = (topicId: string, actionIndex: number) =>
  `care-checklist:v1:${topicId}:${actionIndex}`;

export const getSavedCareChecklistForContext = (
  records: CareSavedChecklist[],
  topicId: string,
  aquariumId?: string,
) => (
  records.find(item => item.id === topicId && item.aquariumId === aquariumId)
  || records.find(item => item.id === topicId && !item.aquariumId)
);

export const getSavedCareChecklistRestoredActions = (
  record: CareSavedChecklist | undefined,
  topicId: string,
  visibleActions: string[],
) => {
  if (!record) return [];
  const stableKeys = new Set(record.actionKeys || []);
  const legacyActions = record.actions || [];
  return visibleActions.filter((description, index) => (
    stableKeys.has(getCareChecklistActionKey(topicId, index))
    || legacyActions.some(saved => saved === description || saved.endsWith(`：${description}`))
  ));
};

type LegacyCareReminderRecord = Partial<CareReminderRecord> & {
  id: string;
  title: string;
  type: string;
  createdAt: string;
};

const addTime = (source: Date, amount: number, unit: 'hour' | 'day') => {
  const next = new Date(source);
  if (unit === 'hour') next.setHours(next.getHours() + amount);
  else next.setDate(next.getDate() + amount);
  return next;
};

const inferScheduledFor = (record: LegacyCareReminderRecord) => {
  const createdAt = new Date(record.createdAt);
  const base = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
  const label = record.label || '';
  const hourMatch = label.match(/(\d+)\s*小时/);
  if (hourMatch) return addTime(base, Number(hourMatch[1]), 'hour').toISOString();
  if (/明天/.test(label)) return addTime(base, 1, 'day').toISOString();
  const dayMatch = label.match(/(\d+)\s*天后/);
  if (dayMatch) return addTime(base, Number(dayMatch[1]), 'day').toISOString();
  return addTime(base, 1, 'day').toISOString();
};

export const normalizeCareReminder = (record: LegacyCareReminderRecord): CareReminderRecord => ({
  id: record.id,
  sourceTopicId: record.sourceTopicId || record.id.split(':')[0] || record.id,
  title: record.title,
  type: record.type,
  createdAt: record.createdAt,
  scheduledFor: record.scheduledFor && !Number.isNaN(new Date(record.scheduledFor).getTime())
    ? record.scheduledFor
    : inferScheduledFor(record),
  aquariumId: record.aquariumId,
  label: record.label,
  completedAt: record.completedAt,
  seriesId: record.seriesId,
  repeatEnabled: record.repeatEnabled === true,
  repeatIntervalDays: record.repeatEnabled === true ? record.repeatIntervalDays : undefined,
});

const readArray = <T,>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeArray = <T,>(key: string, value: T[]) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CARE_ACTIVITY_CHANGED_EVENT));
    return value;
  } catch {
    throw new Error('养护记录没有保存成功，请检查浏览器存储权限后重试。');
  }
};

export const getCareReminders = () => readArray<LegacyCareReminderRecord>(CARE_REMINDERS_STORAGE_KEY).map(normalizeCareReminder);
export const setCareReminders = (records: CareReminderRecord[]) => writeArray(CARE_REMINDERS_STORAGE_KEY, records);
export const upsertCareReminder = (input: Omit<CareReminderRecord, 'id' | 'createdAt'>) => {
  const current = getCareReminders();
  const identity = `${input.sourceTopicId}:${input.aquariumId || 'global'}`;
  const existing = current.find(item => !item.completedAt && `${item.sourceTopicId}:${item.aquariumId || 'global'}` === identity);
  const nextRecord: CareReminderRecord = {
    ...input,
    id: existing?.id || `${identity}:${Date.now()}`,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  setCareReminders([nextRecord, ...current.filter(item => item.id !== existing?.id)]);
  return nextRecord;
};

export const completeCareReminder = (id: string, completedAt = new Date().toISOString()) => {
  const current = getCareReminders();
  const target = current.find(item => item.id === id);
  if (!target) throw new Error('没有找到这条养护计划。');
  if (target.completedAt) return target;
  const completed = { ...target, completedAt };
  let next = current.map(item => item.id === id ? completed : item);
  if (target.repeatEnabled && target.repeatIntervalDays && target.seriesId) {
    const scheduledFor = addTime(new Date(completedAt), target.repeatIntervalDays, 'day').toISOString();
    const nextId = `${target.seriesId}:${scheduledFor}`;
    if (!next.some(item => item.id === nextId)) {
      next = [{
        ...target,
        id: nextId,
        createdAt: completedAt,
        scheduledFor,
        completedAt: undefined,
        label: `${target.repeatIntervalDays} 天循环`,
      }, ...next];
    }
  }
  setCareReminders(next);
  return next.find(item => item.id === id)!;
};

export const configureCareReminderRecurrence = (id: string, repeatEnabled: boolean, repeatIntervalDays?: number) => {
  const current = getCareReminders();
  const target = current.find(item => item.id === id);
  if (!target) throw new Error('没有找到这条养护计划。');
  if (repeatEnabled && (!Number.isInteger(repeatIntervalDays) || repeatIntervalDays! < 1 || repeatIntervalDays! > 90)) {
    throw new Error('循环间隔需要是 1–90 天的整数。');
  }
  const seriesId = target.seriesId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `series-${Date.now()}`);
  const next = current.map(item => item.id === id ? {
    ...item,
    repeatEnabled,
    seriesId: repeatEnabled ? seriesId : undefined,
    repeatIntervalDays: repeatEnabled ? repeatIntervalDays : undefined,
  } : item);
  setCareReminders(next);
  return next.find(item => item.id === id)!;
};

export const rescheduleCareReminder = (id: string, scheduledFor: string, label?: string) => {
  if (Number.isNaN(new Date(scheduledFor).getTime())) throw new Error('新的提醒时间无效。');
  const current = getCareReminders();
  const target = current.find(item => item.id === id);
  if (!target) throw new Error('没有找到这条养护计划。');
  const next = current.map(item => item.id === id ? { ...item, scheduledFor, label, completedAt: undefined } : item);
  setCareReminders(next);
  return next.find(item => item.id === id)!;
};

export const deleteCareReminder = (id: string) => {
  const current = getCareReminders();
  if (!current.some(item => item.id === id)) throw new Error('没有找到这条养护计划。');
  return setCareReminders(current.filter(item => item.id !== id));
};

const startOfLocalDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

export const getCareReminderStatus = (record: CareReminderRecord, now = new Date()): CareReminderStatus => {
  if (record.completedAt) return 'completed';
  const scheduled = new Date(record.scheduledFor);
  const scheduledDay = startOfLocalDay(scheduled);
  const today = startOfLocalDay(now);
  if (scheduledDay < today) return 'overdue';
  if (scheduledDay === today) return 'today';
  return 'upcoming';
};

export const subscribeToCareActivity = (listener: () => void) => {
  window.addEventListener(CARE_ACTIVITY_CHANGED_EVENT, listener);
  return () => window.removeEventListener(CARE_ACTIVITY_CHANGED_EVENT, listener);
};
export const getCompletedCareOperations = () => readArray<CareCompletedOperation>(CARE_COMPLETED_OPERATIONS_STORAGE_KEY);
export const setCompletedCareOperations = (records: CareCompletedOperation[]) => writeArray(CARE_COMPLETED_OPERATIONS_STORAGE_KEY, records);
export const getSavedCareChecklists = () => readArray<CareSavedChecklist>(CARE_SAVED_CHECKLISTS_STORAGE_KEY);
export const setSavedCareChecklists = (records: CareSavedChecklist[]) => writeArray(CARE_SAVED_CHECKLISTS_STORAGE_KEY, records);

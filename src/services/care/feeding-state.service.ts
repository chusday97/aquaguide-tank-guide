import type { CareTimelineRecord } from '../repository/aquaguide.repository';
import type { LocalEventRecord } from '../storage/local-app-state';

export const FEEDING_DAY_SOURCE_TYPE = 'feeding_day';

export const getLocalDateKey = (value: string | Date = new Date()): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getFeedingSourceForDate = (dateKey: string) => ({
  sourceType: FEEDING_DAY_SOURCE_TYPE,
  sourceId: dateKey,
});

const getEventLocalDate = (event: CareTimelineRecord): string => {
  const payloadLocalDate = event.payload?.localDate;
  if (typeof payloadLocalDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payloadLocalDate)) {
    return payloadLocalDate;
  }
  if (event.sourceType === FEEDING_DAY_SOURCE_TYPE && event.sourceId && /^\d{4}-\d{2}-\d{2}$/.test(event.sourceId)) {
    return event.sourceId;
  }
  // Legacy feeding_record events did not persist their originating local date.
  // Interpret occurredAt in the current client timezone as a compatibility fallback only.
  return getLocalDateKey(event.occurredAt);
};

export const getFeedingEventsForDate = (
  events: CareTimelineRecord[],
  aquariumId: string,
  dateKey: string,
): CareTimelineRecord[] => events.filter(event => (
  event.aquariumId === aquariumId
  && event.eventType === 'feeding'
  && getEventLocalDate(event) === dateKey
));

export const getLocalFeedingRecordsForDate = (
  records: LocalEventRecord[],
  aquariumId: string,
  dateKey: string,
): LocalEventRecord[] => records.filter(record => (
  record.type === 'feeding'
  && record.aquariumId === aquariumId
  && getLocalDateKey(record.createdAt) === dateKey
));

export const isAquariumFedOnDate = ({
  events,
  localRecords,
  aquariumId,
  dateKey,
}: {
  events: CareTimelineRecord[];
  localRecords: LocalEventRecord[];
  aquariumId: string;
  dateKey: string;
}): boolean => (
  getFeedingEventsForDate(events, aquariumId, dateKey).length > 0
  || getLocalFeedingRecordsForDate(localRecords, aquariumId, dateKey).length > 0
);

export const getLatestFeedingOccurredAt = (
  events: CareTimelineRecord[],
  localRecords: LocalEventRecord[],
  aquariumId: string,
): string | undefined => {
  const persisted = events
    .filter(event => event.aquariumId === aquariumId && event.eventType === 'feeding')
    .map(event => event.occurredAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  if (persisted) return persisted;

  return localRecords
    .filter(record => record.aquariumId === aquariumId && record.type === 'feeding')
    .map(record => record.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
};

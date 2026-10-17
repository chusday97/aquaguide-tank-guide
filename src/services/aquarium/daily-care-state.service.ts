import type { CareTimelineRecord } from '../repository/aquaguide.repository';
import type { LocalEventRecord } from '../storage/local-app-state';

const toLocalRecord = (event: CareTimelineRecord, type: 'feeding' | 'observation'): LocalEventRecord => ({
  id: event.sourceId || event.id,
  aquariumId: event.aquariumId,
  createdAt: event.occurredAt,
  type,
  note: event.label || event.title,
});

export const projectCareEventsToDailyRecords = (events: CareTimelineRecord[]) => ({
  feedingRecords: events
    .filter(event => event.eventType === 'feeding' && event.sourceType === 'feeding_record')
    .map(event => toLocalRecord(event, 'feeding')),
  observationRecords: events
    .filter(event => event.eventType === 'observation' && event.sourceType === 'observation_record')
    .map(event => toLocalRecord(event, 'observation')),
});

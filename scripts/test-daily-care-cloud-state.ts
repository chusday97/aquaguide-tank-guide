import assert from 'node:assert/strict';
import { projectCareEventsToDailyRecords } from '../src/services/aquarium/daily-care-state.service';

const result = projectCareEventsToDailyRecords([
  {
    id: 'evt-feed',
    aquariumId: 'tank-1',
    eventType: 'feeding',
    title: '记录喂食',
    payload: {},
    occurredAt: '2026-10-17T08:15:00.000Z',
    sourceType: 'feeding_record',
    sourceId: 'feed-source',
    isInferred: false,
  },
  {
    id: 'evt-observe',
    aquariumId: 'tank-1',
    eventType: 'observation',
    title: '记录观察',
    label: '呼吸正常',
    payload: {},
    occurredAt: '2026-10-17T08:20:00.000Z',
    sourceType: 'observation_record',
    sourceId: 'observe-source',
    isInferred: false,
  },
  {
    id: 'evt-other',
    aquariumId: 'tank-1',
    eventType: 'feeding',
    title: '推导喂食',
    payload: {},
    occurredAt: '2026-10-17T08:30:00.000Z',
    sourceType: 'other',
    sourceId: 'other-source',
    isInferred: true,
  },
]);

assert.deepEqual(result.feedingRecords, [{
  id: 'feed-source',
  aquariumId: 'tank-1',
  createdAt: '2026-10-17T08:15:00.000Z',
  type: 'feeding',
  note: '记录喂食',
}]);
assert.deepEqual(result.observationRecords, [{
  id: 'observe-source',
  aquariumId: 'tank-1',
  createdAt: '2026-10-17T08:20:00.000Z',
  type: 'observation',
  note: '呼吸正常',
}]);

console.log('daily care cloud projection verified: explicit feeding and observation Care Events restore daily UI state without inferred-event leakage');

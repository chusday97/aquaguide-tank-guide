import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FEEDING_DAY_SOURCE_TYPE,
  getFeedingEventsForDate,
  getFeedingSourceForDate,
  getLatestFeedingOccurredAt,
  isAquariumFedOnDate,
} from '../src/services/care/feeding-state.service';
import type { CareTimelineRecord } from '../src/services/repository/aquaguide.repository';
import type { LocalEventRecord } from '../src/services/storage/local-app-state';

const aquariumId = 'tank-a';
const today = '2026-08-15';
const canonical: CareTimelineRecord = {
  id: 'event-canonical',
  aquariumId,
  eventType: 'feeding',
  title: '记录喂食',
  payload: {},
  occurredAt: '2026-08-15T12:30:00+09:00',
  sourceType: FEEDING_DAY_SOURCE_TYPE,
  sourceId: today,
  isInferred: false,
};
const legacyCloud: CareTimelineRecord = {
  ...canonical,
  id: 'event-legacy',
  occurredAt: '2026-08-15T08:00:00+09:00',
  sourceType: 'feeding_record',
  sourceId: 'legacy-local-id',
};
const localLegacy: LocalEventRecord = {
  id: 'local-only',
  aquariumId,
  createdAt: '2026-08-15T09:00:00+09:00',
  type: 'feeding',
  note: 'legacy local feeding',
};

assert.deepEqual(getFeedingSourceForDate(today), { sourceType: 'feeding_day', sourceId: today });
assert.equal(isAquariumFedOnDate({ events: [canonical], localRecords: [], aquariumId, dateKey: today }), true,
  'a new device with only a persisted feeding event must show fed today');
assert.equal(isAquariumFedOnDate({ events: [legacyCloud], localRecords: [], aquariumId, dateKey: today }), true,
  'legacy persisted feeding_record events must remain readable');
assert.equal(isAquariumFedOnDate({ events: [], localRecords: [localLegacy], aquariumId, dateKey: today }), true,
  'legacy local-only users retain a migration fallback');
assert.equal(isAquariumFedOnDate({ events: [canonical], localRecords: [], aquariumId: 'tank-b', dateKey: today }), false,
  'feeding state must be isolated by aquarium');
assert.equal(isAquariumFedOnDate({ events: [canonical], localRecords: [], aquariumId, dateKey: '2026-08-14' }), false,
  'feeding state must be isolated by local date');
assert.deepEqual(getFeedingEventsForDate([canonical, legacyCloud], aquariumId, today).map(item => item.id).sort(), ['event-canonical', 'event-legacy']);
assert.equal(getLatestFeedingOccurredAt([canonical, legacyCloud], [localLegacy], aquariumId), canonical.occurredAt,
  'persisted care events are canonical for latest feeding time when available');

const aquariumSource = await readFile(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
assert.match(aquariumSource, /isAquariumFedOnDate\([\s\S]*careTimelineEvents/,
  'Aquarium fedToday must derive from canonical care timeline events');
assert.match(aquariumSource, /getFeedingEventsForDate\(careTimelineEvents/,
  'undo must identify persisted feeding events instead of relying on local IDs only');
assert.match(aquariumSource, /sourceType:\s*FEEDING_DAY_SOURCE_TYPE/,
  'new feeding writes must use a deterministic feeding-day source');
assert.doesNotMatch(aquariumSource, /setFedToday\(prev\s*=>/,
  'feeding persistence must not run async side effects inside a state setter');
assert.match(aquariumSource, /await persistCareTimelineEvent\([\s\S]*setFeedingRecords/,
  'canonical event persistence must happen before the local feeding mirror is updated');

console.log('feeding canonical state contract passed');

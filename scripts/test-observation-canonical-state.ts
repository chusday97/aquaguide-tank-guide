import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  NO_OBVIOUS_ABNORMALITY_CODE,
  OBSERVATION_SOURCE_TYPE,
  getLatestObservationStatusForDate,
  getObservationEventsForDate,
  normalizeObservationChecks,
  toggleObservationCheck,
  type ObservationCheckCode,
} from '../src/services/care/observation-state.service';
import type { CareTimelineRecord } from '../src/services/repository/aquaguide.repository';
import type { LocalEventRecord } from '../src/services/storage/local-app-state';

const aquariumId = 'tank-a';
const today = '2026-08-16';
const normalEvent: CareTimelineRecord = {
  id: 'obs-normal',
  aquariumId,
  eventType: 'observation',
  title: '记录观察：未见明显异常',
  payload: { status: 'normal', checks: [NO_OBVIOUS_ABNORMALITY_CODE], localDate: today },
  occurredAt: '2026-08-16T08:00:00+09:00',
  sourceType: OBSERVATION_SOURCE_TYPE,
  sourceId: '11111111-1111-4111-8111-111111111111',
  isInferred: false,
};
const abnormalEvent: CareTimelineRecord = {
  ...normalEvent,
  id: 'obs-abnormal',
  title: '记录观察：发现异常',
  payload: { status: 'abnormal', checks: ['rapid_breathing'], localDate: today },
  occurredAt: '2026-08-16T09:30:00+09:00',
  sourceId: '22222222-2222-4222-8222-222222222222',
};
const otherDayEvent: CareTimelineRecord = {
  ...abnormalEvent,
  id: 'obs-yesterday',
  payload: { status: 'abnormal', checks: ['surface_gasping'], localDate: '2026-08-15' },
  occurredAt: '2026-08-15T22:00:00+09:00',
  sourceId: '33333333-3333-4333-8333-333333333333',
};
const legacyLocal: LocalEventRecord = {
  id: 'legacy-normal',
  aquariumId,
  // Legacy local records never stored their originating localDate. Midday keeps
  // this fallback fixture on the same calendar date in UTC CI and Asia/Tokyo.
  createdAt: '2026-08-16T12:00:00+09:00',
  type: 'observation',
  note: '未发现明显呼吸异常',
};

assert.equal(OBSERVATION_SOURCE_TYPE, 'observation_record');
assert.deepEqual(
  getObservationEventsForDate([normalEvent, abnormalEvent, otherDayEvent], aquariumId, today).map(item => item.id).sort(),
  ['obs-abnormal', 'obs-normal'],
  'same-day observations must remain append-only instead of collapsing to one event',
);
assert.equal(getLatestObservationStatusForDate({
  events: [normalEvent, abnormalEvent],
  localRecords: [],
  aquariumId,
  dateKey: today,
}), 'abnormal', 'the latest persisted observation must drive today status');
assert.equal(getLatestObservationStatusForDate({
  events: [],
  localRecords: [legacyLocal],
  aquariumId,
  dateKey: today,
}), 'normal', 'legacy local observations remain a compatibility fallback');
assert.equal(getLatestObservationStatusForDate({
  events: [abnormalEvent],
  localRecords: [],
  aquariumId: 'tank-b',
  dateKey: today,
}), undefined, 'observation state must be isolated by aquarium');
assert.equal(getLatestObservationStatusForDate({
  events: [otherDayEvent],
  localRecords: [],
  aquariumId,
  dateKey: today,
}), undefined, 'yesterday observations must not keep today marked complete');

let selected: ObservationCheckCode[] = ['rapid_breathing'];
selected = toggleObservationCheck(selected, NO_OBVIOUS_ABNORMALITY_CODE);
assert.deepEqual(selected, [NO_OBVIOUS_ABNORMALITY_CODE], 'normal selection must clear abnormal checks');
selected = toggleObservationCheck(selected, 'surface_gasping');
assert.deepEqual(selected, ['surface_gasping'], 'abnormal selection must clear the normal check');
assert.deepEqual(normalizeObservationChecks('normal', ['rapid_breathing']), [NO_OBVIOUS_ABNORMALITY_CODE]);
assert.deepEqual(normalizeObservationChecks('abnormal', [NO_OBVIOUS_ABNORMALITY_CODE, 'rapid_breathing']), ['rapid_breathing']);

const aquariumSource = await readFile(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const quickActionSource = await readFile(new URL('../src/components/product/QuickActionGrid.tsx', import.meta.url), 'utf8');
assert.match(aquariumSource, /const handleObservationSubmit = async \(status: ObservationStatus\)/,
  'observation submission must use one repository-first async handler');
assert.match(aquariumSource, /await persistCareTimelineEvent\([\s\S]*eventType:\s*'observation'[\s\S]*sourceType:\s*OBSERVATION_SOURCE_TYPE/,
  'observation must persist a canonical care event');
assert.match(aquariumSource, /payload:\s*\{\s*status,\s*checks:\s*selectedChecks,\s*localDate:/,
  'observation payload must persist language-neutral status, check codes, and local date');
assert.match(aquariumSource, /sourceId:\s*crypto\.randomUUID\(\)/,
  'append-only observations must use a unique source identity');
assert.match(aquariumSource, /await persistCareTimelineEvent\([\s\S]*setObservationRecords/,
  'canonical persistence must happen before the local compatibility mirror changes');
assert.doesNotMatch(aquariumSource, /markPriorityTask\('observeBreathing'/,
  'observeBreathing status must not be written as a second local truth');
assert.match(aquariumSource, /const todayObservationStatus = getLatestObservationStatusForDate/,
  'today observation status must derive from canonical events');
assert.match(aquariumSource, /actionText:\s*todayObservationStatus === 'abnormal'/,
  'the reminder card must display event-derived observation state');
assert.match(aquariumSource, /if \(status === 'abnormal'\) handleOpenDiagnosisWithType\('鱼只异常'\)/,
  'diagnosis should open only after an abnormal observation was persisted');
assert.match(aquariumSource, /disabled=\{isObservationSaving/,
  'observation actions must block duplicate submission while saving');
assert.match(aquariumSource, /id:\s*'recordObservation'[\s\S]*onClick:\s*\(\)\s*=>\s*setIsObservationOpen\(true\)/,
  'the aquarium quick-action surface must expose a reachable observation entry');
assert.match(aquariumSource, /id:\s*'recordObservation'[\s\S]*disabled:\s*!hasStockedAnimals/,
  'observation entry must be disabled when there is no livestock to observe');
assert.match(quickActionSource, /disabled\?:\s*boolean/,
  'quick actions must expose a disabled contract for unavailable factual actions');
assert.match(quickActionSource, /disabled=\{action\.disabled\}/,
  'quick-action buttons must enforce the disabled contract in the DOM');

console.log('observation canonical state contract passed');

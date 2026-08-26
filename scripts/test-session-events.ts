import assert from 'node:assert/strict';
import { getSessionEvents, resetSessionEvents, trackSessionEvent } from '../src/services/analytics/session-events.service';

resetSessionEvents();
const unsafeInput = {
  action: 'complete',
  status: 'watch',
  entry: 'aquarium',
  userDescription: '这里不应被记录',
  answers: { odor: '明显异味' },
};
trackSessionEvent('daily_check_completed', unsafeInput);
let events = getSessionEvents();
assert.equal(events.length, 1);
assert.deepEqual(Object.keys(events[0]).sort(), [
  'action',
  'appVersion',
  'candidateCount',
  'durationBucket',
  'entry',
  'failureReason',
  'filterType',
  'goal',
  'locale',
  'name',
  'occurredAt',
  'pairKey',
  'riskLevel',
  'source',
  'status',
  'task',
]);
assert.equal(JSON.stringify(events).includes('这里不应被记录'), false);
assert.equal(JSON.stringify(events).includes('明显异味'), false);

trackSessionEvent('compatibility_pair_evaluated', {
  action: 'evaluate_pair',
  status: 'insufficient_data',
  entry: 'compatibility_v2',
  source: 'rules',
  pairKey: 'sp_0436__sp_0431',
});
events = getSessionEvents();
assert.equal(events[1].pairKey, 'sp_0431__sp_0436', 'catalog pair keys must be direction-independent and normalized');
assert.equal(events[1].status, 'insufficient_data');

trackSessionEvent('compatibility_pair_evaluated', {
  action: 'evaluate_pair',
  status: 'caution',
  pairKey: '../../user-text__sp_0431',
});
events = getSessionEvents();
assert.equal(events[2].pairKey, undefined, 'free text/path-like values must not enter pair telemetry');
assert.equal(JSON.stringify(events).includes('../../user-text'), false);

trackSessionEvent('compatibility_pair_evaluated', {
  action: 'evaluate_pair',
  status: 'compatible',
  pairKey: 'sp_0431__sp_0431',
});
events = getSessionEvents();
assert.equal(events[3].pairKey, undefined, 'self-pairs are not valid compatibility telemetry');
resetSessionEvents();
assert.equal(getSessionEvents().length, 0);

console.log('session events: allowlist, pair-key normalization, privacy rejection and memory-only reset passed');

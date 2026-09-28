import assert from 'node:assert/strict';
import { selectCompatibilityLaunchCohort } from '../src/data/compatibility-launch-cohort';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium } from '../src/types';

const cohort = selectCompatibilityLaunchCohort();
assert.equal(cohort.length, 30);
assert.equal(cohort.length * (cohort.length - 1) / 2, 435);

const tank: Aquarium = {
  id: 'compatibility-launch-matrix',
  name: 'Compatibility launch matrix',
  fishes: [],
  dimensions: { length: '200', width: '80', height: '65' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const counts = { compatible: 0, caution: 0, not_recommended: 0, insufficient_data: 0 };
const evaluatePair = (existing: (typeof cohort)[number], candidate: (typeof cohort)[number]) => (
  evaluateCompatibilityDecision({
    tank,
    items: [
      { species: existing, quantity: 1, origin: 'existing' },
      { species: candidate, quantity: 1, origin: 'candidate' },
    ],
  }).pairResults[0]
);

const withoutCalculatedAt = <T>(value: T): T => {
  const clone = structuredClone(value) as any;
  if (clone?.rawResult?.metadata) delete clone.rawResult.metadata.calculatedAt;
  return clone as T;
};

for (let left = 0; left < cohort.length; left += 1) {
  for (let right = left + 1; right < cohort.length; right += 1) {
    const forward = evaluatePair(cohort[left], cohort[right]);
    const reverse = evaluatePair(cohort[right], cohort[left]);
    const repeat = evaluatePair(cohort[left], cohort[right]);
    assert.ok(forward && reverse && repeat, `${cohort[left].id}/${cohort[right].id} must produce a pair result`);
    assert.equal(forward.status, reverse.status, `${cohort[left].id}/${cohort[right].id} must be symmetric`);
    assert.deepEqual(withoutCalculatedAt(forward), withoutCalculatedAt(repeat), `${cohort[left].id}/${cohort[right].id} must be deterministic apart from calculation timestamp`);
    counts[forward.status] += 1;
  }
}

const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
assert.equal(total, 435, 'every unordered pair must have an explicit status');
assert.ok(counts.insufficient_data <= 108, 'reviewed launch coverage must not regress above the runtime-audited insufficient-data baseline');
assert.ok(counts.compatible >= 1, 'runtime launch matrix must preserve at least one evidence-backed compatible path');
assert.ok(counts.not_recommended >= 1, 'runtime launch matrix must preserve at least one blocking path');

console.log(`compatibility launch matrix verified via runtime facade: ${total} unordered pairs, ${counts.insufficient_data} insufficient, ${counts.not_recommended} blocked, ${counts.caution} caution, ${counts.compatible} compatible, deterministic and symmetric`);

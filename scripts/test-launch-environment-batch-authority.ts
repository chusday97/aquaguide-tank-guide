import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch48Authority } from '../src/modules/knowledge/phase2Batch48Authority';

const supported = [
  ['sp_0434', 'freshwater', [18, 22], [6, 8], [5, 19]],
  ['sp_0435', 'freshwater', [18, 24], [6, 8], [5, 19]],
  ['sp_0439', 'freshwater', [20, 26], [6, 8], [5, 19]],
  ['sp_0443', 'freshwater', [20, 25], [6, 8], [2, 25]],
] as const;

for (const [id, waterType, temp, ph, hardness] of supported) {
  const knowledge = getReviewedSpeciesKnowledge(id);
  assert.ok(knowledge, id + ' must have direct reviewed knowledge');
  assert.equal(knowledge.environment?.waterType, waterType);
  assert.deepEqual(knowledge.environment?.temperatureRangeC, { min: temp[0], max: temp[1] });
  assert.deepEqual(knowledge.environment?.phRange, { min: ph[0], max: ph[1] });
  assert.deepEqual(knowledge.environment?.hardnessDgh, { min: hardness[0], max: hardness[1] });
  assert.equal(knowledge.environment?.evidence.reviewStatus, 'reviewed');
  assert.notEqual(knowledge.environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch48Authority[id]?.environment.status, 'reviewed_supported');
}

const guppy = getReviewedSpeciesKnowledge('sp_0436');
assert.ok(guppy);
assert.equal(guppy.environment?.waterType, 'unknown');
assert.deepEqual(guppy.environment?.temperatureRangeC, { min: 18, max: 28 });
assert.deepEqual(guppy.environment?.phRange, { min: 7, max: 8 });
assert.deepEqual(guppy.environment?.hardnessDgh, { min: 9, max: 19 });
assert.match((guppy.environment?.notes || []).join(' '), /freshwater/i);
assert.match((guppy.environment?.notes || []).join(' '), /brackish/i);
assert.equal(phase2Batch48Authority.sp_0436?.environment.status, 'reviewed_unknown');

console.log('Launch environment batch authority passed: 4 supported species + guppy multi-water representation boundary');

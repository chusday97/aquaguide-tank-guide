import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch48Authority } from '../src/modules/knowledge/phase2Batch48Authority';

const supported = [
  ['sp_0432', [23, 27], [4, 6], [5, 12]],
  ['sp_0446', [24, 30], [6, 8], [5, 13]],
  ['sp_0014', [25, 28], [6, 8], [5, 19]],
] as const;

for (const [id, temp, ph, hardness] of supported) {
  const knowledge = getReviewedSpeciesKnowledge(id);
  assert.ok(knowledge, id + ' must have direct reviewed Species Knowledge');
  assert.equal(knowledge.environment?.waterType, 'freshwater');
  assert.deepEqual(knowledge.environment?.temperatureRangeC, { min: temp[0], max: temp[1] });
  assert.deepEqual(knowledge.environment?.phRange, { min: ph[0], max: ph[1] });
  assert.deepEqual(knowledge.environment?.hardnessDgh, { min: hardness[0], max: hardness[1] });
  assert.equal(knowledge.environment?.evidence.reviewStatus, 'reviewed');
  assert.notEqual(knowledge.environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch48Authority[id]?.environment.status, 'reviewed_supported');
}

assert.ok(phase2Batch48Authority.sp_0432.environment.citationIds.includes('batch33-fishbase-paracheirodon-axelrodi'));
console.log('Secondary environment batch passed: cardinal tetra, angelfish, and bronze cory');

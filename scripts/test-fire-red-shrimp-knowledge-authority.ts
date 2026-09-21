import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';

const direct = getReviewedSpeciesKnowledge('sp_0001');
assert.ok(direct, 'Fire Red Shrimp must have direct reviewed Species Knowledge');
assert.equal(direct.environment?.waterType, 'freshwater');
assert.equal(direct.environment?.evidence.reviewStatus, 'reviewed');
assert.notEqual(direct.environment?.evidence.confidence, 'unknown');

assert.equal(direct.socialBehavior?.mode, 'group');
assert.equal(direct.socialBehavior?.swimmingZone, 'bottom');
assert.equal(direct.socialBehavior?.evidence.reviewStatus, 'reviewed');
assert.notEqual(direct.socialBehavior?.evidence.confidence, 'unknown');

// Do not fabricate a minimum tank size or hard group count from ecology/social studies.
assert.equal(direct.socialBehavior?.minimumGroupSize, undefined);
assert.equal(direct.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(direct.spaceAndGrowth?.evidence.confidence, 'unknown');

const sourceIds = new Set([
  ...(direct.environment?.evidence.sourceIds || []),
  ...(direct.socialBehavior?.evidence.sourceIds || []),
]);
const sources = resolveKnowledgeSources([...sourceIds]);
assert.equal(sources.length, sourceIds.size);
assert.ok(sources.some(source => source.publisher === 'UF/IFAS Extension'));
assert.ok(sources.some(source => source.publisher === 'Canadian Journal of Zoology'));

console.log('Fire Red Shrimp direct knowledge authority passed: freshwater + gregarious/benthic reviewed, space limits remain unknown');

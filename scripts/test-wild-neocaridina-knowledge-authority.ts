import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';

const direct = getReviewedSpeciesKnowledge('sp_0459');
assert.ok(direct, 'Wild-type Neocaridina must have direct reviewed Species Knowledge');

assert.equal(direct.environment?.waterType, 'freshwater');
assert.equal(direct.environment?.evidence.reviewStatus, 'reviewed');
assert.notEqual(direct.environment?.evidence.confidence, 'unknown');

assert.equal(direct.spaceAndGrowth?.adultLengthCm?.max, 4);
assert.equal(direct.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(direct.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(direct.spaceAndGrowth?.evidence.reviewStatus, 'reviewed');
assert.notEqual(direct.spaceAndGrowth?.evidence.confidence, 'unknown');

assert.equal(direct.socialBehavior?.mode, 'group');
assert.equal(direct.socialBehavior?.minimumGroupSize, undefined);
assert.equal(direct.socialBehavior?.evidence.reviewStatus, 'reviewed');
assert.notEqual(direct.socialBehavior?.evidence.confidence, 'unknown');
assert.ok(direct.socialBehavior?.evidence.sourceIds.includes('neocaridina-gregarious-zoology-2018'));

const sourceIds = new Set([
  ...(direct.environment?.evidence.sourceIds || []),
  ...(direct.spaceAndGrowth?.evidence.sourceIds || []),
]);
const sources = resolveKnowledgeSources([...sourceIds]);
assert.equal(sources.length, sourceIds.size);
assert.ok(sources.some(source => source.publisher === 'UF/IFAS Extension'));
assert.ok(sources.some(source => source.publisher === 'U.S. Geological Survey'));

console.log('Wild Neocaridina authority passed: freshwater + 40mm adult-size reviewed, social/minimum tank remain unknown');

import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';

const direct = getReviewedSpeciesKnowledge('sp_0049');
assert.ok(direct, 'Pearl red snakehead must have direct reviewed Species Knowledge');

assert.equal(direct.environment?.waterType, 'freshwater');
assert.deepEqual(direct.environment?.temperatureRangeC, { min: 22, max: 28 });
assert.equal(direct.environment?.phRange, undefined);
assert.equal(direct.environment?.evidence.reviewStatus, 'reviewed');

assert.equal(direct.spaceAndGrowth?.adultLengthCm?.max, 23.5);
assert.equal(direct.spaceAndGrowth?.adultLengthCm?.measurement, 'TL');
assert.equal(direct.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(direct.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(direct.spaceAndGrowth?.evidence.reviewStatus, 'reviewed');

assert.equal(direct.socialBehavior?.mode, 'solitary');
assert.equal(direct.socialBehavior?.territoriality, 'high');
assert.equal(direct.socialBehavior?.predationRisk, 'high');
assert.equal(direct.socialBehavior?.evidence.reviewStatus, 'reviewed');
assert.ok(direct.socialBehavior?.evidence.sourceIds.includes('small-snakehead-fws-assessment'));

const sourceIds = new Set([
  ...(direct.environment?.evidence.sourceIds || []),
  ...(direct.spaceAndGrowth?.evidence.sourceIds || []),
  ...(direct.socialBehavior?.evidence.sourceIds || []),
]);
const sources = resolveKnowledgeSources([...sourceIds]);
assert.equal(sources.length, sourceIds.size);
assert.ok(sources.some(source => source.publisher === 'FishBase'));
assert.ok(sources.some(source => source.publisher === 'U.S. Fish and Wildlife Service'));

console.log('Pearl red snakehead authority passed: freshwater/22-28C/23.5cm TL plus reviewed predatory-solitary-territorial behavior');

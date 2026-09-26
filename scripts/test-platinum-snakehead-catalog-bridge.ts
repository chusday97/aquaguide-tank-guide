import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

const approved = getApprovedCatalogFieldReviews('sp_0224');
const byField = new Map(approved.map(review => [review.field, review]));

assert.deepEqual(byField.get('identity')?.proposedValue, {
  scientificName: 'Channa argus var. Platinum',
  baseSpeciesKey: 'Channa argus',
  variantKey: 'Platinum',
});
assert.equal(byField.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(byField.get('temperature')?.proposedValue, { min: 4, max: 22 });
assert.deepEqual(byField.get('adult_size')?.proposedValue, { min: null, max: 100 });

const knowledge = getReviewedSpeciesKnowledge('sp_0224');
assert.ok(knowledge);
assert.equal(knowledge.environment?.waterType, 'freshwater');
assert.deepEqual(knowledge.environment?.temperatureRangeC, { min: 4, max: 22 });
assert.equal(knowledge.environment?.phRange, undefined);
assert.equal(knowledge.environment?.evidence.reviewStatus, 'reviewed');
assert.notEqual(knowledge.environment?.evidence.confidence, 'unknown');

assert.equal(knowledge.spaceAndGrowth?.adultLengthCm?.max, 100);
assert.equal(knowledge.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(knowledge.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(knowledge.spaceAndGrowth?.evidence.reviewStatus, 'reviewed');
assert.notEqual(knowledge.spaceAndGrowth?.evidence.confidence, 'unknown');

assert.equal(knowledge.socialBehavior?.mode, 'unknown');
assert.equal(knowledge.socialBehavior?.evidence.confidence, 'unknown');

console.log('Platinum snakehead catalog bridge passed: identity-bound environment and adult size supported; social remains fail-closed');

import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews, getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

const miniIdentity = getCatalogFieldReviews('sp_0021').find(review => review.field === 'identity');
assert.equal(miniIdentity?.resolution, 'unknown');
const miniApproved = new Map(getApprovedCatalogFieldReviews('sp_0021').map(review => [review.field, review]));
assert.deepEqual(miniApproved.get('adult_size')?.proposedValue, { min: null, max: 10 });
const mini = getReviewedSpeciesKnowledge('sp_0021');
assert.equal(mini?.spaceAndGrowth?.adultLengthCm?.max, 10);
assert.equal(mini?.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(mini?.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(mini?.spaceAndGrowth?.evidence.reviewStatus, 'reviewed');
assert.notEqual(mini?.spaceAndGrowth?.evidence.confidence, 'unknown');
assert.equal(mini?.environment?.evidence.confidence, 'unknown');
assert.equal(mini?.socialBehavior?.evidence.confidence, 'unknown');

const koiIdentity = getCatalogFieldReviews('sp_0258').find(review => review.field === 'identity');
assert.equal(koiIdentity?.resolution, 'supported');
assert.deepEqual(koiIdentity?.proposedValue, {
  scientificName: 'Betta splendens var. Koi',
  baseSpeciesKey: 'Betta splendens',
  variantKey: 'Koi',
});
assert.deepEqual(koiIdentity?.citationIds, ['batch03-sciadv-betta-mosaic-koi']);
const koiApproved = new Map(getApprovedCatalogFieldReviews('sp_0258').map(review => [review.field, review]));
assert.equal(koiApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(koiApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(koiApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(koiApproved.get('adult_size')?.proposedValue, { min: null, max: 6.5 });

const koi = getReviewedSpeciesKnowledge('sp_0258');
assert.equal(koi?.environment?.waterType, 'freshwater');
assert.deepEqual(koi?.environment?.temperatureRangeC, { min: 24, max: 30 });
assert.deepEqual(koi?.environment?.phRange, { min: 6, max: 8 });
assert.equal(koi?.environment?.evidence.reviewStatus, 'reviewed');
assert.notEqual(koi?.environment?.evidence.confidence, 'unknown');
assert.equal(koi?.spaceAndGrowth?.adultLengthCm?.max, 6.5);
assert.equal(koi?.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(koi?.spaceAndGrowth?.minTankLengthCm, undefined);
assert.notEqual(koi?.spaceAndGrowth?.evidence.confidence, 'unknown');
assert.equal(koi?.socialBehavior?.evidence.confidence, 'unknown');

console.log('Identity-bound catalog bridges passed: approved fields promoted without resolving trade-form identity');

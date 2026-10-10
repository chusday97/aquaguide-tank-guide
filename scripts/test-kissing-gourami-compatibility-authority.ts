import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  getApprovedCatalogFieldReviews,
  getCatalogFieldReviews,
} from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { applyApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';

const fish = fishData.find(item => item.id === 'sp_0015');
assert.ok(fish, 'sp_0015 must exist');

const reviews = getCatalogFieldReviews('sp_0015');
assert.equal(reviews.length, 10);
const approved = new Map(getApprovedCatalogFieldReviews('sp_0015').map(review => [review.field, review]));
for (const field of ['identity','water','temperature','ph','adult_size','tank_size','social_behavior','territoriality'] as const) {
  assert.equal(approved.has(field), true, `${field} must be reviewed-supported`);
}
assert.equal(approved.has('predation'), false);
assert.equal(approved.has('breeding_behavior'), false);

const profile = applyApprovedCatalogFieldReviews(fish as any);
assert.equal(profile.waterType, 'freshwater');
assert.equal(profile.waterTemperatureMinC, 22);
assert.equal(profile.waterTemperatureMaxC, 28);
assert.equal(profile.phMin, 6);
assert.equal(profile.phMax, 8);
assert.equal(profile.adultLengthMaxCm, 30);
assert.equal(profile.minTankLiters, 304);
assert.equal(profile.minTankLengthCm, 150);
assert.equal(profile.socialMode, 'variable');
assert.equal(profile.minimumGroupSize, null);

const compatibility = getReviewedCompatibilityProfile('sp_0015');
assert.ok(compatibility);
assert.deepEqual(compatibility.behaviorTraits, ['interspecific_aggression']);
assert.equal(compatibility.minimumGroupSize, undefined);
assert.deepEqual(compatibility.predationTargets, []);
assert.equal(compatibility.confidence, 'medium');
assert.deepEqual(
  compatibility.citations.map(source => source.id).sort(),
  ['fishbase-helostoma-temminkii','seriouslyfish-helostoma-temminkii'],
);

console.log('kissing gourami authority passed: reviewed environment/space/social facts plus scoped aggression profile');

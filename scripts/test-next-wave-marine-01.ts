import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { applyApprovedCatalogFieldReviews, getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { speciesProfileFromFish } from '../src/services/catalog/species-profile.adapter';

const expected = {
  sp_0022: { water: 'saltwater', adultMax: 40, social: 'group' },
  sp_0023: { water: 'saltwater', adultMax: 20, social: 'variable' },
  sp_0024: { water: 'saltwater', adultMax: 31, social: 'group' },
} as const;

for (const [id, expectation] of Object.entries(expected)) {
  const reviews = getApprovedCatalogFieldReviews(id);
  const byField = new Map(reviews.map(review => [review.field, review]));
  assert.equal(byField.get('water')?.proposedValue, expectation.water, id + ': water authority');
  assert.deepEqual(byField.get('adult_size')?.proposedValue, { min: null, max: expectation.adultMax }, id + ': adult-size authority');
  assert.deepEqual(byField.get('social_behavior')?.proposedValue, { mode: expectation.social, minimumGroupSize: null }, id + ': social authority');
  const stillUnsupported = id === 'sp_0022'
    ? ['breeding_behavior']
    : ['temperature', 'ph', 'tank_size', 'territoriality', 'predation', 'breeding_behavior'];
  for (const unsupported of stillUnsupported) {
    assert.equal(byField.has(unsupported as any), false, id + ': field without later reviewed authority must remain fail-closed: ' + unsupported);
  }

  const profile = getReviewedCompatibilityProfile(id);
  assert.ok(profile, id + ': compatibility profile');
  assert.equal(profile?.waterType, 'saltwater');
  assert.deepEqual(profile?.predationTargets, id === 'sp_0022' ? ['small_fish'] : []);
  assert.equal(profile?.confidence, 'medium');

  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, id + ': catalog object');
  const catalogProfile = applyApprovedCatalogFieldReviews(speciesProfileFromFish(fish!));
  assert.equal(catalogProfile.waterType, 'saltwater');
  assert.equal(catalogProfile.adultLengthMaxCm, expectation.adultMax);
}

console.log('next-wave marine authority verified: original water/size/social authority is retained; later reviewed sp_0022 completion is allowed while remaining unsupported fields stay fail closed');

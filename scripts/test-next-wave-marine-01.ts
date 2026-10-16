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
    : id === 'sp_0024'
      ? ['ph', 'predation', 'breeding_behavior']
      : id === 'sp_0023'
        ? ['predation', 'breeding_behavior']
        : ['temperature', 'ph', 'tank_size', 'territoriality', 'predation', 'breeding_behavior'];
  for (const unsupported of stillUnsupported) {
    assert.equal(byField.has(unsupported as any), false, id + ': field without later reviewed authority must remain fail-closed: ' + unsupported);
  }

  const profile = getReviewedCompatibilityProfile(id);
  assert.ok(profile, id + ': compatibility profile');
  assert.equal(profile?.waterType, 'saltwater');
  assert.deepEqual(profile?.predationTargets, id === 'sp_0022' ? ['small_fish'] : []);
  assert.equal(profile?.confidence, 'medium');
  if (id === 'sp_0023') {
    assert.deepEqual(byField.get('temperature')?.proposedValue, { min: 23, max: 27 }, 'sp_0023: later exact-taxon Fishipedia temperature authority');
    assert.deepEqual(byField.get('ph')?.proposedValue, { min: 8.2, max: 8.4 }, 'sp_0023: later exact-taxon Fishipedia pH authority');
    assert.deepEqual(byField.get('tank_size')?.proposedValue, { liters: 600, lengthCm: null }, 'sp_0023: later exact-taxon Fishipedia tank-size authority');
    assert.deepEqual(byField.get('territoriality')?.proposedValue, { traits: [] }, 'sp_0023: later exact-taxon Fishipedia non-territorial authority');
    assert.ok(profile?.requiredFacts.includes('temperature'));
    assert.ok(profile?.requiredFacts.includes('ph'));
    assert.ok(profile?.requiredFacts.includes('tank_size'));
    assert.ok(profile?.requiredFacts.includes('territoriality'));
    assert.equal(profile?.requiredFacts.includes('predation'), false);
  }
  if (id === 'sp_0024') {
    assert.deepEqual(byField.get('temperature')?.proposedValue, { min: 23, max: 27 }, 'sp_0024: later exact-taxon Fishipedia temperature authority');
    assert.deepEqual(byField.get('tank_size')?.proposedValue, { liters: 1000, lengthCm: null }, 'sp_0024: later exact-taxon Fishipedia tank-size authority');
    assert.deepEqual(byField.get('territoriality')?.proposedValue, { traits: [] }, 'sp_0024: later exact-taxon Fishipedia non-territorial authority');
    assert.ok(profile?.requiredFacts.includes('temperature'));
    assert.ok(profile?.requiredFacts.includes('tank_size'));
    assert.ok(profile?.requiredFacts.includes('territoriality'));
    assert.equal(profile?.requiredFacts.includes('ph'), false);
    assert.equal(profile?.requiredFacts.includes('predation'), false);
  }

  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, id + ': catalog object');
  const catalogProfile = applyApprovedCatalogFieldReviews(speciesProfileFromFish(fish!));
  assert.equal(catalogProfile.waterType, 'saltwater');
  assert.equal(catalogProfile.adultLengthMaxCm, expectation.adultMax);
}

console.log('next-wave marine authority verified: original authority is immutable; later exact reviewed sp_0022/sp_0023/sp_0024 evidence may close only sourced fields while remaining predation/pH gaps stay fail closed');

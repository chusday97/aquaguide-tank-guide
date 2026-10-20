import assert from 'node:assert/strict';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import {
  getCatalogCanonicalIdentity,
  hasFullGenericCompatibilityInheritance,
} from '../src/data/catalogCanonicalIdentity';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const bridged = [
  ['sp_0289', 'Glo Red'],
  ['sp_0290', 'Glo Green'],
  ['sp_0291', 'Glo Orange'],
  ['sp_0363', 'Glo Purple'],
] as const;

const coverage = buildCompatibilityCoreFieldCoverage();
const row = (speciesId: string) => coverage.rows.find(item => item.speciesId === speciesId);

const baseProfile = getReviewedCompatibilityProfile('sp_0435');
assert.ok(baseProfile, 'Danio rerio base profile must exist');
for (const fact of GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS) {
  assert.ok(baseProfile.requiredFacts?.includes(fact), `Danio rerio base requiredFacts must declare ${fact}`);
}
assert.equal(row('sp_0435')?.authoritativeFieldCount, 8);
assert.equal(row('sp_0435')?.genericOnboardingReady, true, 'reviewed 8/8 Danio rerio base must not be blocked by stale requiredFacts metadata');

for (const [speciesId, variantKey] of bridged) {
  const identityReview = getApprovedCatalogFieldReviews(speciesId)
    .filter(review => review.field === 'identity')
    .at(-1);
  assert.ok(identityReview, `${speciesId} must have a reviewed identity bridge`);
  assert.deepEqual(identityReview.proposedValue, {
    scientificName: 'Danio rerio',
    baseSpeciesKey: 'Danio rerio',
    variantKey,
  });

  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity, `${speciesId} must resolve to reviewed canonical identity`);
  assert.equal(identity.canonicalSpeciesId, 'sp_0435');
  assert.equal(identity.canonicalScientificName, 'Danio rerio');
  assert.equal(identity.relationshipType, 'color_morph');
  assert.equal(identity.registrySource, 'reviewed_color_morph_policy');
  assert.equal(identity.variantKey, variantKey);
  assert.equal(hasFullGenericCompatibilityInheritance(speciesId), true);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, []);

  const coverageRow = row(speciesId);
  assert.equal(coverageRow?.authoritativeFieldCount, 8);
  assert.equal(coverageRow?.genericOnboardingReady, true);
  for (const fact of GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS) {
    assert.equal(coverageRow?.fields[fact].authoritySource, 'canonical_inheritance', `${speciesId} ${fact} must retain canonical inheritance provenance`);
  }
}

for (const speciesId of ['sp_0152', 'sp_0364', 'sp_0419']) {
  assert.equal(getCatalogCanonicalIdentity(speciesId), undefined, `${speciesId} must remain outside automatic GloFish inheritance`);
  assert.equal(row(speciesId)?.genericOnboardingReady, false);
}

assert.equal(
  coverage.backlog.some(item => bridged.some(([speciesId]) => speciesId === item.speciesId) && item.field === 'predation'),
  false,
  'reviewed color bridges must leave the predation research backlog without pair precomputation',
);

console.log('GloFish Danio color identity bridge PASS: FDA/officially confirmed Red, Green, Orange and Purple lines inherit reviewed Danio rerio Compatibility authority; Pink, generic GloFish and Longfin remain fail-closed.');

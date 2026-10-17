import assert from 'node:assert/strict';

import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import {
  catalogCanonicalIdentities,
  createCompatibilityInheritancePolicy,
  getCatalogCanonicalIdentity,
} from '../src/data/catalogCanonicalIdentity';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { catalogIdentityCorrectionBaseSpeciesIds } from '../src/data/catalogIdentityCorrections';
import {
  buildCanonicalVariantCompatibilityProfile,
  getCompatibilityEvidenceAudit,
  getReviewedCompatibilityProfile,
  getReviewedCompatibilityProfileForFish,
} from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { assessCompatibilityOnboardingGate } from '../src/services/compatibility/compatibility-onboarding-gate.service';

const allFacts = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS];

assert.equal(
  Object.keys(catalogCanonicalIdentities).length,
  Object.keys(catalogIdentityCorrectionBaseSpeciesIds).length,
  'every reviewed identity correction must be represented by the canonical identity registry',
);
assert.equal(Object.keys(catalogCanonicalIdentities).length, 15);

for (const identity of Object.values(catalogCanonicalIdentities)) {
  assert.equal(identity.identityStatus, 'reviewed');
  assert.ok(identity.identityEvidenceSourceIds.length > 0);
  assert.equal(getCatalogIdentityBoundary(identity.catalogSpeciesId), undefined);
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, allFacts);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, []);

  const catalog = fishData.find(item => item.id === identity.catalogSpeciesId);
  const base = fishData.find(item => item.id === identity.canonicalSpeciesId);
  assert.ok(catalog);
  assert.ok(base);
  assert.equal(identity.canonicalScientificName, base.scientificName);

  const variantProfile = getReviewedCompatibilityProfile(identity.catalogSpeciesId);
  const baseProfile = getReviewedCompatibilityProfile(identity.canonicalSpeciesId);
  assert.ok(variantProfile);
  assert.ok(baseProfile);
  assert.equal(variantProfile.speciesId, identity.catalogSpeciesId);
  assert.deepEqual(
    variantProfile.requiredFacts,
    baseProfile.requiredFacts?.filter(field => identity.inheritancePolicy.inheritedFacts.includes(field)),
    'canonical variant must inherit only allowlisted required facts',
  );
  assert.deepEqual(variantProfile.behaviorTraits, baseProfile.behaviorTraits);
  assert.deepEqual(variantProfile.predationTargets, baseProfile.predationTargets);
  for (const sourceId of identity.identityEvidenceSourceIds) {
    assert.ok(variantProfile.citations.some(source => source.id === sourceId));
  }

  const inheritedKnowledge = getReviewedSpeciesKnowledgeForFish(catalog);
  const baseKnowledge = getReviewedSpeciesKnowledgeForFish(base);
  assert.equal(inheritedKnowledge, baseKnowledge, 'full canonical inheritance must resolve to the reviewed base Knowledge');
}

const platinum = fishData.find(item => item.id === 'sp_0240');
const blackLongfin = fishData.find(item => item.id === 'sp_0272');
assert.ok(platinum);
assert.ok(blackLongfin);
assert.equal(getCatalogCanonicalIdentity(platinum.id)?.relationshipType, 'longfin_variant');
assert.equal(getCatalogCanonicalIdentity(blackLongfin.id)?.relationshipType, 'longfin_variant');

assert.equal(getCatalogCanonicalIdentity('sp_0266')?.relationshipType, 'geographic_variant');
assert.equal(getCatalogCanonicalIdentity('sp_0266')?.canonicalSpeciesId, 'sp_0057');
assert.equal(getCatalogCanonicalIdentity('sp_0242')?.relationshipType, 'color_morph');
assert.equal(getCatalogCanonicalIdentity('sp_0242')?.canonicalSpeciesId, 'sp_0116');
assert.equal(getCatalogCanonicalIdentity('sp_0408')?.relationshipType, 'trade_strain');
assert.equal(getCatalogCanonicalIdentity('sp_0408')?.canonicalSpeciesId, 'sp_0116');

assert.equal(getCatalogCanonicalIdentity('sp_0257')?.relationshipType, 'color_morph');
assert.equal(getCatalogCanonicalIdentity('sp_0257')?.canonicalSpeciesId, 'sp_0121');
assert.equal(getCatalogCanonicalIdentity('sp_0284')?.relationshipType, 'color_morph');
assert.equal(getCatalogCanonicalIdentity('sp_0284')?.canonicalSpeciesId, 'sp_0116');

const unresolved = fishData.find(item => item.id === 'sp_0241');
assert.ok(unresolved);
assert.equal(getCatalogCanonicalIdentity(unresolved.id), undefined);
assert.ok(getCatalogIdentityBoundary(unresolved.id));
const unresolvedGate = assessCompatibilityOnboardingGate(unresolved, {
  lifeType: 'fish',
  hasReviewedCompatibilityProfile: true,
  declaredRequiredFacts: allFacts,
  authoritativeFacts: allFacts,
  catalogPersisted: true,
});
assert.equal(unresolvedGate.ready, false);
assert.equal(unresolvedGate.identityReadiness, 'unresolved_identity');
assert.ok(unresolvedGate.reasons.includes('unresolved_identity'));

const crystalShrimp = fishData.find(item => item.id === 'sp_0002');
assert.ok(crystalShrimp);
assert.ok(getCatalogIdentityBoundary(crystalShrimp.id));
assert.equal(
  getReviewedCompatibilityProfileForFish(crystalShrimp),
  undefined,
  'an unresolved identity may not inherit a base-only Compatibility Profile from its raw scientific-name suffix',
);

const synthetic = {
  id: 'sp_new_unreviewed_fixture',
  scientificName: 'Fixtureus canonicalis',
};
const unreviewedNewObject = assessCompatibilityOnboardingGate(synthetic, {
  lifeType: 'fish',
  hasReviewedCompatibilityProfile: true,
  declaredRequiredFacts: allFacts,
  authoritativeFacts: allFacts,
  catalogPersisted: false,
});
assert.equal(unreviewedNewObject.ready, false);
assert.equal(unreviewedNewObject.identityReadiness, 'unreviewed_new_object');

const reviewedNewObject = assessCompatibilityOnboardingGate(synthetic, {
  lifeType: 'fish',
  hasReviewedCompatibilityProfile: true,
  declaredRequiredFacts: allFacts,
  authoritativeFacts: allFacts,
  catalogPersisted: false,
  reviewedDirectIdentity: true,
});
assert.equal(reviewedNewObject.ready, true);
assert.equal(reviewedNewObject.identityReadiness, 'reviewed_direct_identity');

const angelfishBase = getReviewedCompatibilityProfile('sp_0446');
assert.ok(angelfishBase);
const partialPolicy = createCompatibilityInheritancePolicy(
  allFacts.filter(field => field !== 'adult_size' && field !== 'tank_size'),
);
const partialProfile = buildCanonicalVariantCompatibilityProfile(
  {
    catalogSpeciesId: 'sp_partial_variant_fixture',
    inheritancePolicy: partialPolicy,
  },
  angelfishBase,
  [],
);
assert.ok(!partialProfile.requiredFacts?.includes('adult_size'));
assert.ok(!partialProfile.requiredFacts?.includes('tank_size'));
assert.ok(partialPolicy.blockedFacts.includes('adult_size'));
assert.ok(partialPolicy.blockedFacts.includes('tank_size'));

const partialGate = assessCompatibilityOnboardingGate(
  { id: 'sp_partial_variant_fixture', scientificName: 'Pterophyllum scalare var. Fixture' },
  {
    lifeType: 'fish',
    hasReviewedCompatibilityProfile: true,
    declaredRequiredFacts: partialProfile.requiredFacts || [],
    authoritativeFacts: partialPolicy.inheritedFacts,
    catalogPersisted: false,
    reviewedDirectIdentity: true,
  },
);
assert.equal(partialGate.ready, false);
assert.ok(partialGate.missingDeclaredFacts.includes('adult_size'));
assert.ok(partialGate.missingDeclaredFacts.includes('tank_size'));
assert.ok(partialGate.missingAuthoritativeFacts.includes('adult_size'));
assert.ok(partialGate.missingAuthoritativeFacts.includes('tank_size'));

const coverage = buildCompatibilityCoreFieldCoverage();
assert.equal(coverage.summary.genericOnboardingReadySpecies, 86);
for (const speciesId of Object.keys(catalogCanonicalIdentities)) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.ok(row);
  assert.equal(row.genericOnboardingReady, true, 'reviewed canonical variant must remain generic-ready: ' + speciesId);
}
assert.equal(getCompatibilityEvidenceAudit().reviewedPairRules.length, 21, 'canonical identity migration must not add Pair Rules');

console.log(JSON.stringify({
  canonicalIdentityRecords: Object.keys(catalogCanonicalIdentities).length,
  genericReadySpecies: coverage.summary.genericOnboardingReadySpecies,
  pairRules: getCompatibilityEvidenceAudit().reviewedPairRules.length,
  unresolvedVariantGate: unresolvedGate.identityReadiness,
  newObjectWithoutIdentity: unreviewedNewObject.identityReadiness,
  newObjectWithReviewedIdentity: reviewedNewObject.identityReadiness,
  partialInheritanceBlockedFacts: partialPolicy.blockedFacts,
  invariant: 'Catalog object -> reviewed canonical identity -> field allowlist -> resolved authority -> Compatibility',
}, null, 2));

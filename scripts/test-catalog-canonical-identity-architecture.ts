import assert from 'node:assert/strict';

import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import {
  catalogCanonicalIdentities,
  createCompatibilityInheritancePolicy,
  getCatalogCanonicalIdentity,
  isReviewedColorOnlyVariantKey,
  reviewedColorPolicyCanonicalSpeciesIds,
  reviewedColorTaxonPolicyCanonicalSpeciesIds,
} from '../src/data/catalogCanonicalIdentity';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
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

const explicitCanonicalIds = Object.keys(catalogIdentityCorrectionBaseSpeciesIds).sort();
const policyCanonicalIds = [...reviewedColorPolicyCanonicalSpeciesIds].sort();
const expectedColorPolicyIds = [
  'sp_0016', 'sp_0104', 'sp_0116', 'sp_0146', 'sp_0151', 'sp_0156',
  'sp_0157', 'sp_0174', 'sp_0207', 'sp_0214', 'sp_0224', 'sp_0283',
];
const expectedTaxonRootIds = ['sp_0156', 'sp_0214', 'sp_0224'];
assert.equal(explicitCanonicalIds.length, 19);
assert.deepEqual(policyCanonicalIds, expectedColorPolicyIds);
assert.deepEqual([...reviewedColorTaxonPolicyCanonicalSpeciesIds].sort(), expectedTaxonRootIds);
assert.equal(Object.keys(catalogCanonicalIdentities).length, explicitCanonicalIds.length + expectedColorPolicyIds.length);
for (const speciesId of explicitCanonicalIds) assert.ok(catalogCanonicalIdentities[speciesId]);

for (const identity of Object.values(catalogCanonicalIdentities)) {
  assert.equal(identity.identityStatus, 'reviewed');
  assert.ok([
    'explicit_reviewed_bridge',
    'reviewed_color_morph_policy',
    'reviewed_color_morph_taxon_policy',
  ].includes(identity.registrySource));
  assert.ok(identity.identityEvidenceSourceIds.length > 0);
  assert.equal(getCatalogIdentityBoundary(identity.catalogSpeciesId), undefined);
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, allFacts);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, []);

  const catalog = fishData.find(item => item.id === identity.catalogSpeciesId);
  assert.ok(catalog);

  if (identity.canonicalRootKind === 'catalog_species') {
    assert.ok(identity.canonicalSpeciesId);
    const base = fishData.find(item => item.id === identity.canonicalSpeciesId);
    assert.ok(base);
    assert.equal(identity.canonicalScientificName, base.scientificName);

    const variantProfile = getReviewedCompatibilityProfile(identity.catalogSpeciesId);
    const baseProfile = getReviewedCompatibilityProfile(identity.canonicalSpeciesId);
    assert.ok(variantProfile);
    assert.ok(baseProfile);
    assert.equal(variantProfile.speciesId, identity.catalogSpeciesId);
    assert.deepEqual(
      variantProfile.requiredFacts,
      identity.inheritancePolicy.inheritedFacts,
      'catalog-root variant requiredFacts must mirror the reviewed inheritance allowlist',
    );
    assert.deepEqual(variantProfile.behaviorTraits, baseProfile.behaviorTraits);
    assert.deepEqual(variantProfile.predationTargets, baseProfile.predationTargets);
    for (const sourceId of identity.identityEvidenceSourceIds) {
      assert.ok(variantProfile.citations.some(source => source.id === sourceId));
    }

    const resolvedKnowledge = getReviewedSpeciesKnowledgeForFish(catalog);
    const baseKnowledge = getReviewedSpeciesKnowledgeForFish(base);
    assert.ok(resolvedKnowledge);
    assert.ok(baseKnowledge);
  } else {
    assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
    assert.equal(identity.canonicalSpeciesId, null);
    assert.equal(identity.registrySource, 'reviewed_color_morph_taxon_policy');
    assert.ok(getReviewedCompatibilityProfileForFish(catalog));
  }
}

for (const speciesId of expectedColorPolicyIds) {
  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity);
  assert.ok(
    identity.registrySource === 'reviewed_color_morph_policy'
    || identity.registrySource === 'reviewed_color_morph_taxon_policy',
  );
  assert.equal(identity.relationshipType, 'color_morph');
  assert.ok(isReviewedColorOnlyVariantKey(identity.variantKey || ''));
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, allFacts);
  assert.equal(getCatalogIdentityBoundary(speciesId), undefined);
}

assert.equal(getCatalogCanonicalIdentity('sp_0070'), undefined, 'longfin must never be auto-promoted by the color-only policy');
assert.equal(getCatalogCanonicalIdentity('sp_0258'), undefined, 'Koi trade strain must never be auto-promoted by the color-only policy');
assert.equal(getCatalogCanonicalIdentity('sp_0069'), undefined, 'generic ornamental variety must remain outside the color-only policy');
assert.equal(getCatalogCanonicalIdentity('sp_0001'), undefined, 'non-fish color morphs must stay outside the fish Compatibility canonical policy');
for (const [speciesId, taxon] of [
  ['sp_0156', 'Trichopodus trichopterus'],
  ['sp_0214', 'Pelvicachromis pulcher'],
  ['sp_0224', 'Channa argus'],
] as const) {
  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity);
  assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
  assert.equal(identity.canonicalSpeciesId, null);
  assert.equal(identity.canonicalScientificName, taxon);
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

assert.equal(getCatalogCanonicalIdentity('sp_0234')?.relationshipType, 'color_morph');
assert.equal(getCatalogCanonicalIdentity('sp_0234')?.canonicalSpeciesId, 'sp_0200');
assert.equal(getCatalogCanonicalIdentity('sp_0231')?.relationshipType, 'color_morph');
assert.equal(getCatalogCanonicalIdentity('sp_0231')?.canonicalSpeciesId, 'sp_0443');
assert.equal(getCatalogCanonicalIdentity('sp_0411')?.relationshipType, 'geographic_variant');
assert.equal(getCatalogCanonicalIdentity('sp_0411')?.canonicalSpeciesId, 'sp_0197');
assert.equal(getCatalogCanonicalIdentity('sp_0442')?.relationshipType, 'same_taxon_catalog_alias');
assert.equal(getCatalogCanonicalIdentity('sp_0442')?.canonicalSpeciesId, 'sp_0441');
assert.equal(getCatalogIdentityBoundary('sp_0442'), undefined);
assert.deepEqual(getApprovedCatalogFieldReviews('sp_0442').map(review => review.field), ['identity']);
assert.deepEqual(getApprovedCatalogFieldReviews('sp_0411').map(review => review.field), [
  'identity', 'water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation',
]);
assert.deepEqual(getApprovedCatalogFieldReviews('sp_0231').map(review => review.field), ['identity']);
assert.equal(
  getCatalogCanonicalIdentity('sp_0120'),
  undefined,
  'an exact-taxon catalog name correction must remain direct authority rather than masquerading as a canonical variant',
);
const darioGoldReviews = getApprovedCatalogFieldReviews('sp_0234');
assert.deepEqual(
  darioGoldReviews.map(review => review.field),
  ['identity'],
  'identity-only canonical migration must not duplicate inherited base field reviews',
);

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
assert.equal(coverage.summary.genericOnboardingReadySpecies, 97);
for (const speciesId of Object.keys(catalogCanonicalIdentities)) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.ok(row);
  if (speciesId !== 'sp_0224') {
    assert.equal(row.genericOnboardingReady, true, 'reviewed canonical variant with complete authority must remain generic-ready: ' + speciesId);
  }
}
const platinumSnakeheadCoverage = coverage.rows.find(item => item.speciesId === 'sp_0224');
assert.ok(platinumSnakeheadCoverage);
assert.equal(platinumSnakeheadCoverage.genericOnboardingReady, false);
assert.equal(platinumSnakeheadCoverage.authoritativeFieldCount, 4);
assert.equal(platinumSnakeheadCoverage.fields.predation.authoritySource, 'canonical_inheritance');
assert.equal(platinumSnakeheadCoverage.fields.predation.disposition, 'ready');
for (const field of ['ph', 'tank_size', 'social_behavior', 'territoriality'] as const) {
  assert.equal(platinumSnakeheadCoverage.fields[field].disposition, 'terminal_hold');
}
assert.equal(getCompatibilityEvidenceAudit().reviewedPairRules.length, 21, 'canonical identity migration must not add Pair Rules');

console.log(JSON.stringify({
  canonicalIdentityRecords: Object.keys(catalogCanonicalIdentities).length,
  explicitCanonicalIdentityRecords: explicitCanonicalIds.length,
  reviewedColorPolicyRecords: policyCanonicalIds.length,
  reviewedColorTaxonRootRecords: reviewedColorTaxonPolicyCanonicalSpeciesIds.size,
  genericReadySpecies: coverage.summary.genericOnboardingReadySpecies,
  pairRules: getCompatibilityEvidenceAudit().reviewedPairRules.length,
  unresolvedVariantGate: unresolvedGate.identityReadiness,
  newObjectWithoutIdentity: unreviewedNewObject.identityReadiness,
  newObjectWithReviewedIdentity: reviewedNewObject.identityReadiness,
  partialInheritanceBlockedFacts: partialPolicy.blockedFacts,
  invariant: 'Catalog object -> reviewed canonical identity -> field allowlist -> resolved authority -> Compatibility',
}, null, 2));

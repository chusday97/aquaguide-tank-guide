import assert from 'node:assert/strict';

import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import {
  catalogCanonicalIdentities,
  createCompatibilityInheritancePolicy,
  getCatalogCanonicalIdentity,
  isReviewedColorOnlyVariantKey,
  reviewedColorPolicyCanonicalSpeciesIds,
  reviewedColorTaxonPolicyCanonicalSpeciesIds,
  reviewedVariantFieldPolicySpeciesIds,
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
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium } from '../src/types';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { assessCompatibilityOnboardingGate } from '../src/services/compatibility/compatibility-onboarding-gate.service';

const allFacts = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS];
const coverage = buildCompatibilityCoreFieldCoverage();
const coverageBySpecies = new Map(coverage.rows.map(row => [row.speciesId, row]));

const explicitCanonicalIds = Object.keys(catalogIdentityCorrectionBaseSpeciesIds).sort();
const policyCanonicalIds = [...reviewedColorPolicyCanonicalSpeciesIds].sort();
const expectedColorPolicyIds = [
  'sp_0016', 'sp_0104', 'sp_0116', 'sp_0146', 'sp_0151', 'sp_0156',
  'sp_0157', 'sp_0162', 'sp_0171', 'sp_0174', 'sp_0196', 'sp_0207', 'sp_0214', 'sp_0224', 'sp_0283',
  'sp_0289', 'sp_0290', 'sp_0291', 'sp_0363', 'sp_0445',
];
const expectedTaxonRootIds = ['sp_0156', 'sp_0162', 'sp_0214', 'sp_0224', 'sp_0445'];
assert.equal(explicitCanonicalIds.length, 21);
assert.deepEqual(policyCanonicalIds, expectedColorPolicyIds);
assert.deepEqual([...reviewedColorTaxonPolicyCanonicalSpeciesIds].sort(), expectedTaxonRootIds);
const expectedVariantFieldPolicyIds = ['sp_0063', 'sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0149', 'sp_0155', 'sp_0180', 'sp_0258', 'sp_0348', 'sp_0349', 'sp_0351', 'sp_0361', 'sp_0386'];
assert.deepEqual([...reviewedVariantFieldPolicySpeciesIds].sort(), expectedVariantFieldPolicyIds);
assert.equal(Object.keys(catalogCanonicalIdentities).length, explicitCanonicalIds.length + expectedColorPolicyIds.length + expectedVariantFieldPolicyIds.length);
for (const speciesId of explicitCanonicalIds) assert.ok(catalogCanonicalIdentities[speciesId]);

for (const identity of Object.values(catalogCanonicalIdentities)) {
  assert.equal(identity.identityStatus, 'reviewed');
  assert.ok([
    'explicit_reviewed_bridge',
    'reviewed_color_morph_policy',
    'reviewed_color_morph_taxon_policy',
    'reviewed_variant_field_policy',
  ].includes(identity.registrySource));
  assert.ok(identity.identityEvidenceSourceIds.length > 0);
  assert.equal(getCatalogIdentityBoundary(identity.catalogSpeciesId), undefined);
  if (identity.registrySource === 'reviewed_variant_field_policy') {
    if (identity.catalogSpeciesId === 'sp_0258') {
      assert.deepEqual(identity.inheritancePolicy.inheritedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'predation']);
      assert.deepEqual(identity.inheritancePolicy.blockedFacts, ['social_behavior', 'territoriality']);
    } else {
      assert.ok(['sp_0063', 'sp_0149', 'sp_0180', 'sp_0348', 'sp_0349', 'sp_0351', 'sp_0386', ...['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0155', 'sp_0361']].includes(identity.catalogSpeciesId));
      assert.deepEqual(identity.inheritancePolicy.inheritedFacts, [], 'identity-only strain or morphology review must not imply husbandry inheritance');
      assert.deepEqual(identity.inheritancePolicy.blockedFacts, allFacts);
    }
  } else {
    assert.deepEqual(identity.inheritancePolicy.inheritedFacts, allFacts);
    assert.deepEqual(identity.inheritancePolicy.blockedFacts, []);
  }

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
    assert.ok(
      identity.registrySource === 'reviewed_color_morph_taxon_policy'
      || identity.registrySource === 'reviewed_variant_field_policy',
    );
    const resolvedProfile = getReviewedCompatibilityProfileForFish(catalog);
    const coreCoverage = coverageBySpecies.get(identity.catalogSpeciesId);
    assert.ok(coreCoverage, 'canonical identity must have a core-field coverage row: ' + identity.catalogSpeciesId);
    if (
      identity.registrySource === 'reviewed_variant_field_policy'
      && identity.inheritancePolicy.inheritedFacts.length === 0
    ) {
      if (coreCoverage.genericOnboardingReady) {
        assert.ok(
          resolvedProfile,
          'identity-only variant may synthesize a Compatibility Profile only after exact-object reviews make all 8 core fields ready: ' + identity.catalogSpeciesId,
        );
        assert.equal(resolvedProfile.speciesId, identity.catalogSpeciesId);
      } else {
        assert.equal(
          resolvedProfile,
          undefined,
          'identity-only variant with terminal exact-object field gaps must remain fail-closed: ' + identity.catalogSpeciesId,
        );
      }
    } else {
      assert.ok(resolvedProfile);
    }
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
const koiBettaIdentity = getCatalogCanonicalIdentity('sp_0258');
assert.ok(koiBettaIdentity, 'Koi trade strain may use an explicit reviewed field-scoped policy without class-wide auto-promotion');
assert.equal(koiBettaIdentity.registrySource, 'reviewed_variant_field_policy');
assert.equal(koiBettaIdentity.relationshipType, 'trade_strain');
assert.equal(koiBettaIdentity.canonicalRootKind, 'reviewed_taxon');
assert.equal(koiBettaIdentity.canonicalScientificName, 'Betta splendens');
assert.deepEqual(koiBettaIdentity.inheritancePolicy.inheritedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'predation']);
assert.deepEqual(koiBettaIdentity.inheritancePolicy.blockedFacts, ['social_behavior', 'territoriality']);
for (const [speciesId, variantKey] of [
  ['sp_0066', 'Red Cap Oranda'],
  ['sp_0067', 'Pearlscale'],
  ['sp_0068', 'Bubble Eye'],
] as const) {
  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity);
  assert.equal(identity.registrySource, 'reviewed_variant_field_policy');
  assert.equal(identity.relationshipType, 'selectively_bred_variant');
  assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
  assert.equal(identity.canonicalScientificName, 'Carassius auratus');
  assert.equal(identity.variantKey, variantKey);
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, []);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, allFacts);
  assert.equal(getCatalogIdentityBoundary(speciesId), undefined);
  const fish = fishData.find(item => item.id === speciesId);
  assert.ok(fish);
  const resolvedProfile = getReviewedCompatibilityProfileForFish(fish);
  if (speciesId === 'sp_0067') {
    assert.ok(resolvedProfile, 'Pearlscale exact reviewed 8/8 fields should synthesize a Compatibility Profile');
    assert.equal(resolvedProfile.speciesId, 'sp_0067');
  } else {
    assert.equal(resolvedProfile, undefined, 'incomplete morphology variants must remain fail-closed');
  }
}
const butterflyTailIdentity = getCatalogCanonicalIdentity('sp_0065');
assert.ok(butterflyTailIdentity);
assert.equal(butterflyTailIdentity.registrySource, 'reviewed_variant_field_policy');
assert.equal(butterflyTailIdentity.relationshipType, 'selectively_bred_variant');
assert.equal(butterflyTailIdentity.canonicalRootKind, 'reviewed_taxon');
assert.equal(butterflyTailIdentity.canonicalScientificName, 'Carassius auratus');
assert.equal(butterflyTailIdentity.variantKey, 'Butterfly Tail');
assert.deepEqual(butterflyTailIdentity.inheritancePolicy.inheritedFacts, []);
assert.deepEqual(butterflyTailIdentity.inheritancePolicy.blockedFacts, allFacts);
assert.equal(getCatalogIdentityBoundary('sp_0065'), undefined);

const redGrassGoldfishIdentity = getCatalogCanonicalIdentity('sp_0162');
assert.ok(redGrassGoldfishIdentity);
assert.equal(redGrassGoldfishIdentity.registrySource, 'reviewed_color_morph_taxon_policy');
assert.equal(redGrassGoldfishIdentity.relationshipType, 'color_morph');
assert.equal(redGrassGoldfishIdentity.canonicalRootKind, 'reviewed_taxon');
assert.equal(redGrassGoldfishIdentity.canonicalScientificName, 'Carassius auratus');
assert.equal(redGrassGoldfishIdentity.variantKey, 'Red Grass Goldfish');
assert.deepEqual(redGrassGoldfishIdentity.inheritancePolicy.inheritedFacts, allFacts);
assert.deepEqual(redGrassGoldfishIdentity.inheritancePolicy.blockedFacts, []);
assert.equal(getCatalogIdentityBoundary('sp_0162'), undefined);
const redGrassGoldfish = fishData.find(item => item.id === 'sp_0162');
assert.ok(redGrassGoldfish);
assert.ok(getReviewedCompatibilityProfileForFish(redGrassGoldfish));

for (const [speciesId, variantKey] of [
  ['sp_0143', 'Red Grass'],
  ['sp_0144', 'Blue Grass'],
] as const) {
  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity);
  assert.equal(identity.registrySource, 'reviewed_variant_field_policy');
  assert.equal(identity.relationshipType, 'trade_strain');
  assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
  assert.equal(identity.canonicalScientificName, 'Poecilia reticulata');
  assert.equal(identity.variantKey, variantKey);
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, []);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, allFacts);
  assert.equal(getCatalogIdentityBoundary(speciesId), undefined);
  const fish = fishData.find(item => item.id === speciesId);
  assert.ok(fish);
  const row = coverageBySpecies.get(speciesId);
  assert.ok(row);
  const profile = getReviewedCompatibilityProfileForFish(fish);
  if (row.genericOnboardingReady) {
    assert.ok(profile, 'direct exact-strain 8/8 field authority may synthesize a Profile without canonical inheritance: ' + speciesId);
  } else {
    assert.equal(profile, undefined, 'terminal exact-strain field gaps must remain fail-closed: ' + speciesId);
  }
}
for (const [speciesId, taxon] of [
  ['sp_0155', 'Paracheirodon innesi'],
  ['sp_0361', 'Tanichthys albonubes'],
] as const) {
  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity);
  assert.equal(identity.registrySource, 'reviewed_variant_field_policy');
  assert.equal(identity.relationshipType, 'longfin_variant');
  assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
  assert.equal(identity.canonicalScientificName, taxon);
  assert.equal(identity.variantKey, 'Longfin');
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, []);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, allFacts);
  assert.equal(getCatalogIdentityBoundary(speciesId), undefined);
  const fish = fishData.find(item => item.id === speciesId);
  assert.ok(fish);
  const row = coverageBySpecies.get(speciesId);
  assert.ok(row);
  const profile = getReviewedCompatibilityProfileForFish(fish);
  if (row.genericOnboardingReady) {
    assert.ok(profile, 'direct exact-longfin 8/8 field authority may synthesize a Profile without canonical inheritance: ' + speciesId);
  } else {
    assert.equal(profile, undefined, 'terminal exact-longfin field gaps must remain fail-closed: ' + speciesId);
  }
}
const goldenCobraAlias = getCatalogCanonicalIdentity('sp_0216');
assert.ok(goldenCobraAlias);
assert.equal(goldenCobraAlias.registrySource, 'explicit_reviewed_bridge');
assert.equal(goldenCobraAlias.relationshipType, 'same_taxon_catalog_alias');
assert.equal(goldenCobraAlias.canonicalRootKind, 'catalog_species');
assert.equal(goldenCobraAlias.canonicalSpeciesId, 'sp_0109');
assert.equal(goldenCobraAlias.canonicalScientificName, 'Channa aurantimaculata');
assert.equal(goldenCobraAlias.variantKey, null, 'Golden Cobra is a reviewed trade/common-name alias, not an ornamental Gold variant');
assert.deepEqual(goldenCobraAlias.inheritancePolicy.inheritedFacts, allFacts);
assert.equal(getCatalogIdentityBoundary('sp_0216'), undefined);
assert.equal(getCatalogCanonicalIdentity('sp_0069'), undefined, 'generic ornamental variety must remain outside the color-only policy');
assert.equal(getCatalogCanonicalIdentity('sp_0001'), undefined, 'non-fish color morphs must stay outside the fish Compatibility canonical policy');
const blueGouramiIdentity = getCatalogCanonicalIdentity('sp_0445');
assert.ok(blueGouramiIdentity);
assert.equal(blueGouramiIdentity.registrySource, 'reviewed_color_morph_taxon_policy');
assert.equal(blueGouramiIdentity.relationshipType, 'color_morph');
assert.equal(blueGouramiIdentity.variantKey, 'Blue');
assert.equal(blueGouramiIdentity.canonicalScientificName, 'Trichopodus trichopterus');
assert.equal(getCatalogIdentityBoundary('sp_0445'), undefined);
for (const [speciesId, taxon] of [
  ['sp_0156', 'Trichopodus trichopterus'],
  ['sp_0214', 'Pelvicachromis pulcher'],
  ['sp_0224', 'Channa argus'],
  ['sp_0445', 'Trichopodus trichopterus'],
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
const duplicatePelvicachromis = fishData.find(item => item.id === 'sp_0338');
const reviewedPelvicachromis = fishData.find(item => item.id === 'sp_0214');
assert.ok(duplicatePelvicachromis);
assert.ok(reviewedPelvicachromis);
assert.equal(duplicatePelvicachromis.name, reviewedPelvicachromis.name);
assert.equal(duplicatePelvicachromis.scientificName, reviewedPelvicachromis.scientificName);
assert.equal(duplicatePelvicachromis.category, reviewedPelvicachromis.category);
assert.equal(getCatalogCanonicalIdentity('sp_0338')?.relationshipType, 'same_taxon_catalog_alias');
assert.equal(getCatalogCanonicalIdentity('sp_0338')?.canonicalSpeciesId, 'sp_0214');
assert.equal(getCatalogIdentityBoundary('sp_0338'), undefined);
assert.deepEqual(getApprovedCatalogFieldReviews('sp_0338').map(review => review.field), ['identity']);
const duplicateAliasTank: Aquarium = {
  id: 'duplicate-catalog-alias-equivalence',
  name: 'Duplicate catalog alias equivalence',
  fishes: [],
  dimensions: { length: '300', width: '100', height: '80' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};
const duplicateProfile = getReviewedCompatibilityProfileForFish(duplicatePelvicachromis);
const reviewedProfile = getReviewedCompatibilityProfileForFish(reviewedPelvicachromis);
assert.ok(duplicateProfile);
assert.ok(reviewedProfile);
let duplicateAliasComparedPairs = 0;
for (const thirdParty of fishData) {
  if (thirdParty.id === duplicatePelvicachromis.id || thirdParty.id === reviewedPelvicachromis.id) continue;
  const thirdProfile = getReviewedCompatibilityProfileForFish(thirdParty);
  if (!thirdProfile) continue;
  const tankWaterType = reviewedProfile.waterType === 'saltwater' && thirdProfile.waterType === 'saltwater'
    ? 'Saltwater'
    : 'Freshwater';
  const quantity = Math.max(1, thirdProfile.minimumGroupSize || 1);
  const original = evaluateCompatibilityDecision({
    tank: { ...duplicateAliasTank, waterType: tankWaterType },
    items: [
      { species: reviewedPelvicachromis, quantity: Math.max(1, reviewedProfile.minimumGroupSize || 1), origin: 'existing' },
      { species: thirdParty, quantity, origin: 'candidate' },
    ],
  });
  const alias = evaluateCompatibilityDecision({
    tank: { ...duplicateAliasTank, waterType: tankWaterType },
    items: [
      { species: duplicatePelvicachromis, quantity: Math.max(1, duplicateProfile.minimumGroupSize || 1), origin: 'existing' },
      { species: thirdParty, quantity, origin: 'candidate' },
    ],
  });
  assert.equal(alias.status, original.status, `duplicate catalog alias status drifted against ${thirdParty.id}`);
  assert.equal(alias.metadata.decisionReadiness, original.metadata.decisionReadiness, `duplicate catalog alias readiness drifted against ${thirdParty.id}`);
  assert.deepEqual([...alias.metadata.domainRuleCodes].sort(), [...original.metadata.domainRuleCodes].sort(), `duplicate catalog alias rule codes drifted against ${thirdParty.id}`);
  duplicateAliasComparedPairs += 1;
}
assert.ok(duplicateAliasComparedPairs > 100, 'duplicate alias equivalence must cover the broad reviewed third-party set');
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
assert.equal(unresolvedGate.decisionReady, false);
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
assert.equal(unreviewedNewObject.decisionReady, false);
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
assert.equal(reviewedNewObject.decisionReady, true);
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
assert.equal(partialGate.decisionReady, false, 'missing adult_size remains a hard decision hold');
assert.ok(partialGate.missingDecisionFacts.includes('adult_size'));
assert.ok(!partialGate.missingDecisionFacts.includes('tank_size'));
assert.ok(partialGate.missingRiskCoverageFacts.includes('tank_size'));

const softGapGate = assessCompatibilityOnboardingGate(
  { id: 'sp_soft_gap_fixture', scientificName: 'Fixtureus partialis' },
  {
    lifeType: 'fish',
    hasReviewedCompatibilityProfile: false,
    declaredRequiredFacts: ['water', 'temperature', 'adult_size'],
    authoritativeFacts: ['water', 'temperature', 'adult_size'],
    catalogPersisted: false,
    reviewedDirectIdentity: true,
  },
);
assert.equal(softGapGate.ready, false, '8/8 generic authority remains strict');
assert.equal(softGapGate.decisionReady, true, 'reviewed hard facts are enough to enter decision mode without inventing soft risks');
assert.deepEqual(softGapGate.missingDecisionFacts, []);
assert.ok(softGapGate.missingRiskCoverageFacts.includes('predation'));

assert.equal(
  coverage.summary.genericOnboardingReadySpecies,
  coverage.rows.filter(row => row.genericOnboardingReady).length,
  'core-field readiness summary must equal the row-level readiness count',
);
assert.equal(
  coverage.summary.decisionReadySpecies,
  coverage.rows.filter(row => row.lifeType === 'fish' && row.decisionReady).length,
  'decision readiness summary must equal the row-level decision-ready count',
);
const blueGouramiCoverage = coverage.rows.find(item => item.speciesId === 'sp_0445');
assert.ok(blueGouramiCoverage);
assert.equal(blueGouramiCoverage.genericOnboardingReady, true);
assert.equal(blueGouramiCoverage.authoritativeFieldCount, 8);
const identityOnlyVariantIds = ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0155', 'sp_0361'];
const identityResolvedFieldCeilingIds = ['sp_0063', 'sp_0149', 'sp_0180', 'sp_0348', 'sp_0349', 'sp_0351', 'sp_0386'];
for (const speciesId of Object.keys(catalogCanonicalIdentities)) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.ok(row);
  if (!['sp_0224', 'sp_0258', ...identityOnlyVariantIds, ...identityResolvedFieldCeilingIds].includes(speciesId)) {
    assert.equal(row.genericOnboardingReady, true, 'reviewed canonical variant with complete authority must remain generic-ready: ' + speciesId);
  }
  if (identityResolvedFieldCeilingIds.includes(speciesId)) {
    assert.equal(row.authoritativeFieldCount, 0, 'identity-resolved morphology variants must not gain Compatibility facts automatically: ' + speciesId);
    assert.equal(row.terminalGapCount, 8, 'Wave37 must preserve the seven prior exact-object ceilings and terminalize the exhausted predation slot: ' + speciesId);
    assert.equal(row.actionableGapCount, 0, 'Wave37 goldfish predation research must not re-enter the actionable queue: ' + speciesId);
    assert.equal(row.genericOnboardingReady, false);
  }
  if (identityOnlyVariantIds.includes(speciesId)) {
    assert.equal(
      row.actionableGapCount,
      0,
      'identity-only reviewed variants must not retain ordinary actionable gaps after field research is terminalized: ' + speciesId,
    );
    assert.equal(
      row.authoritativeFieldCount + row.terminalGapCount,
      allFacts.length,
      'identity-only variant core fields must be either directly authoritative or explicitly terminal: ' + speciesId,
    );
    assert.equal(
      row.genericOnboardingReady,
      row.terminalGapCount === 0,
      'exact-object field readiness alone must control identity-only variant onboarding: ' + speciesId,
    );
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
const koiBettaCoverage = coverage.rows.find(item => item.speciesId === 'sp_0258');
assert.ok(koiBettaCoverage);
assert.equal(koiBettaCoverage.genericOnboardingReady, false);
assert.equal(koiBettaCoverage.authoritativeFieldCount, 7);
assert.equal(koiBettaCoverage.fields.tank_size.authoritySource, 'canonical_inheritance');
assert.equal(koiBettaCoverage.fields.predation.authoritySource, 'canonical_inheritance');
assert.equal(koiBettaCoverage.fields.social_behavior.disposition, 'terminal_hold');
assert.equal(koiBettaCoverage.fields.social_behavior.reasonCode, 'variant_social_not_established');
assert.equal(koiBettaCoverage.fields.territoriality.authoritySource, 'catalog_field_review');
assert.equal(getCompatibilityEvidenceAudit().reviewedPairRules.length, 21, 'canonical identity migration must not add Pair Rules');

console.log(JSON.stringify({
  canonicalIdentityRecords: Object.keys(catalogCanonicalIdentities).length,
  explicitCanonicalIdentityRecords: explicitCanonicalIds.length,
  reviewedColorPolicyRecords: policyCanonicalIds.length,
  reviewedColorTaxonRootRecords: reviewedColorTaxonPolicyCanonicalSpeciesIds.size,
  reviewedVariantFieldPolicyRecords: reviewedVariantFieldPolicySpeciesIds.size,
  genericReadySpecies: coverage.summary.genericOnboardingReadySpecies,
  pairRules: getCompatibilityEvidenceAudit().reviewedPairRules.length,
  unresolvedVariantGate: unresolvedGate.identityReadiness,
  newObjectWithoutIdentity: unreviewedNewObject.identityReadiness,
  newObjectWithReviewedIdentity: reviewedNewObject.identityReadiness,
  partialInheritanceBlockedFacts: partialPolicy.blockedFacts,
  invariant: 'Catalog object -> reviewed canonical identity -> field allowlist -> resolved authority -> Compatibility',
}, null, 2));

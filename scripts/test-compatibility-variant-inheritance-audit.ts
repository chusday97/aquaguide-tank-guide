import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCompatibilityVariantInheritanceAudit } from '../src/services/compatibility/compatibility-variant-inheritance-audit.service';

const audit = buildCompatibilityVariantInheritanceAudit();
const disk = JSON.parse(readFileSync(resolve(process.cwd(), 'docs/compatibility_variant_inheritance_audit.json'), 'utf8'));
assert.deepEqual(disk, audit, 'variant inheritance audit artifact must be regenerated when canonical policy changes');

assert.equal(audit.summary.fishDomainSpecies, 308);
assert.equal(audit.summary.explicitReviewedCanonicalBridges, 21);
assert.equal(audit.summary.reviewedColorPolicyCanonicalRecords, 20);
assert.equal(audit.summary.reviewedColorTaxonRootRecords, 5);
assert.equal(audit.summary.reviewedVariantFieldPolicyRecords, 15);
assert.equal(audit.summary.reviewedVariantFieldResearchPolicies, 8);
assert.equal(audit.summary.baseTaxonCandidateFactSlots, 24);
assert.equal(audit.summary.exactObjectEvidenceFactSlots, 40);
assert.equal(audit.summary.totalCanonicalIdentityRecords, 56);
assert.equal(audit.summary.genericOnboardingReadySpecies, 111);
assert.equal(audit.summary.policyPromotedReadySpecies, 19);
assert.equal(audit.summary.fieldPolicyReadySpecies, 3);
assert.equal(audit.summary.directReviewedVariantObjects, 2);
assert.equal(audit.summary.remainingReviewedVariantObjects, 0);
assert.equal(audit.policy.pairRulesRequiredForPromotedColorMorphs, false);
assert.equal(audit.policy.pairRulesRequiredForFieldScopedVariantPolicies, false);
assert.equal(audit.policy.requiresCanonicalCatalogRoot, false);
assert.equal(audit.policy.allowsReviewedTaxonRoot, true);
assert.equal(audit.policy.restrictedToFishCompatibilityDomain, true);
assert.equal(audit.policy.morphologyVariantsAutoPromoted, false);
assert.equal(audit.policy.tradeOrLineageVariantsAutoPromoted, false);
assert.equal(audit.policy.explicitFieldScopedVariantPoliciesAllowed, true);
assert.equal(audit.policy.directReviewedVariantsRequireInheritance, false);
assert.equal(audit.policy.unresolvedIdentityAutoPromoted, false);

assert.deepEqual(
  audit.promoted.map(item => item.speciesId),
  ['sp_0016', 'sp_0104', 'sp_0116', 'sp_0146', 'sp_0151', 'sp_0156', 'sp_0157', 'sp_0162', 'sp_0171', 'sp_0174', 'sp_0196', 'sp_0207', 'sp_0214', 'sp_0224', 'sp_0283', 'sp_0289', 'sp_0290', 'sp_0291', 'sp_0363', 'sp_0445'],
);
assert.ok(audit.promoted.every(item => (
  item.registrySource === 'reviewed_color_morph_policy'
  || item.registrySource === 'reviewed_color_morph_taxon_policy'
)));
assert.ok(audit.promoted.filter(item => item.speciesId !== 'sp_0224').every(item => item.genericOnboardingReady && item.authoritativeFieldCount === 8));
assert.ok(audit.promoted.every(item => item.blockedFacts.length === 0));
const taxonRootRows = audit.promoted.filter(item => item.canonicalRootKind === 'reviewed_taxon');
assert.deepEqual(taxonRootRows.map(item => item.speciesId), ['sp_0156', 'sp_0162', 'sp_0214', 'sp_0224', 'sp_0445']);
assert.ok(taxonRootRows.every(item => item.canonicalSpeciesId === null));
const platinumSnakehead = audit.promoted.find(item => item.speciesId === 'sp_0224');
assert.ok(platinumSnakehead);
assert.equal(platinumSnakehead.genericOnboardingReady, false);
assert.equal(platinumSnakehead.authoritativeFieldCount, 4);
const blueGourami = audit.promoted.find(item => item.speciesId === 'sp_0445');
assert.ok(blueGourami);
assert.equal(blueGourami.canonicalRootKind, 'reviewed_taxon');
assert.equal(blueGourami.canonicalScientificName, 'Trichopodus trichopterus');
assert.equal(blueGourami.variantKey, 'Blue');
assert.equal(blueGourami.genericOnboardingReady, true);
assert.equal(blueGourami.authoritativeFieldCount, 8);

assert.deepEqual(audit.fieldScopedPolicies.map(item => item.speciesId), ['sp_0063', 'sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0149', 'sp_0155', 'sp_0180', 'sp_0258', 'sp_0348', 'sp_0351', 'sp_0361', 'sp_0386']);
for (const speciesId of ['sp_0063', 'sp_0149', 'sp_0180', 'sp_0348', 'sp_0351', 'sp_0386']) {
  const policy = audit.fieldScopedPolicies.find(item => item.speciesId === speciesId);
  assert.ok(policy);
  assert.equal(policy.registrySource, 'reviewed_variant_field_policy');
  assert.equal(policy.relationshipType, 'selectively_bred_variant');
  assert.equal(policy.canonicalScientificName, 'Carassius auratus');
  assert.deepEqual(policy.inheritedFacts, []);
  assert.deepEqual(policy.blockedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
  assert.equal(policy.researchPolicyPresent, false);
  assert.equal(policy.researchPolicyGrantsInheritance, false);
  assert.equal(policy.authoritativeFieldCount, 0);
  assert.equal(policy.genericOnboardingReady, false);
}

const butterflyTailPolicy = audit.fieldScopedPolicies.find(item => item.speciesId === 'sp_0065');
assert.ok(butterflyTailPolicy);
assert.equal(butterflyTailPolicy.registrySource, 'reviewed_variant_field_policy');
assert.equal(butterflyTailPolicy.relationshipType, 'selectively_bred_variant');
assert.equal(butterflyTailPolicy.canonicalScientificName, 'Carassius auratus');
assert.equal(butterflyTailPolicy.variantKey, 'Butterfly Tail');
assert.deepEqual(butterflyTailPolicy.inheritedFacts, []);
assert.equal(butterflyTailPolicy.genericOnboardingReady, true);
assert.equal(butterflyTailPolicy.authoritativeFieldCount, 8);

const redGrassGoldfishPolicy = audit.promoted.find(item => item.speciesId === 'sp_0162');
assert.ok(redGrassGoldfishPolicy);
assert.equal(redGrassGoldfishPolicy.registrySource, 'reviewed_color_morph_taxon_policy');
assert.equal(redGrassGoldfishPolicy.canonicalScientificName, 'Carassius auratus');
assert.equal(redGrassGoldfishPolicy.variantKey, 'Red Grass Goldfish');
assert.deepEqual(redGrassGoldfishPolicy.blockedFacts, []);
assert.equal(redGrassGoldfishPolicy.authoritativeFieldCount, 8);
assert.equal(redGrassGoldfishPolicy.genericOnboardingReady, true);
const fieldScopedCoverageExpectations: Record<string, { authoritative: number; ready: boolean; terminal: string[] }> = {
  sp_0066: { authoritative: 7, ready: false, terminal: ['territoriality'] },
  sp_0067: { authoritative: 8, ready: true, terminal: [] },
  sp_0068: { authoritative: 7, ready: false, terminal: ['territoriality'] },
  sp_0143: { authoritative: 8, ready: true, terminal: [] },
  sp_0144: { authoritative: 7, ready: false, terminal: ['territoriality'] },
  sp_0155: { authoritative: 6, ready: false, terminal: ['territoriality', 'predation'] },
  sp_0361: { authoritative: 7, ready: false, terminal: ['territoriality'] },
};
for (const speciesId of ['sp_0066', 'sp_0067', 'sp_0068']) {
  const policy = audit.fieldScopedPolicies.find(item => item.speciesId === speciesId);
  assert.ok(policy);
  assert.equal(policy.registrySource, 'reviewed_variant_field_policy');
  assert.equal(policy.relationshipType, 'selectively_bred_variant');
  assert.equal(policy.canonicalScientificName, 'Carassius auratus');
  assert.deepEqual(policy.inheritedFacts, []);
  assert.deepEqual(policy.blockedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
  assert.equal(policy.authoritativeFieldCount, fieldScopedCoverageExpectations[speciesId].authoritative);
  assert.equal(policy.genericOnboardingReady, fieldScopedCoverageExpectations[speciesId].ready);
  assert.deepEqual([...policy.terminalGapFields].sort(), [...fieldScopedCoverageExpectations[speciesId].terminal].sort());
}
for (const [speciesId, variantKey] of [
  ['sp_0143', 'Red Grass'],
  ['sp_0144', 'Blue Grass'],
] as const) {
  const policy = audit.fieldScopedPolicies.find(item => item.speciesId === speciesId);
  assert.ok(policy);
  assert.equal(policy.registrySource, 'reviewed_variant_field_policy');
  assert.equal(policy.relationshipType, 'trade_strain');
  assert.equal(policy.canonicalScientificName, 'Poecilia reticulata');
  assert.equal(policy.variantKey, variantKey);
  assert.deepEqual(policy.inheritedFacts, []);
  assert.deepEqual(policy.blockedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
  assert.equal(policy.authoritativeFieldCount, fieldScopedCoverageExpectations[speciesId].authoritative);
  assert.equal(policy.genericOnboardingReady, fieldScopedCoverageExpectations[speciesId].ready);
  assert.deepEqual([...policy.terminalGapFields].sort(), [...fieldScopedCoverageExpectations[speciesId].terminal].sort());
}
for (const [speciesId, taxon] of [
  ['sp_0155', 'Paracheirodon innesi'],
  ['sp_0361', 'Tanichthys albonubes'],
] as const) {
  const policy = audit.fieldScopedPolicies.find(item => item.speciesId === speciesId);
  assert.ok(policy);
  assert.equal(policy.registrySource, 'reviewed_variant_field_policy');
  assert.equal(policy.relationshipType, 'longfin_variant');
  assert.equal(policy.canonicalScientificName, taxon);
  assert.deepEqual(policy.inheritedFacts, []);
  assert.deepEqual(policy.blockedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
  assert.equal(policy.authoritativeFieldCount, fieldScopedCoverageExpectations[speciesId].authoritative);
  assert.equal(policy.genericOnboardingReady, fieldScopedCoverageExpectations[speciesId].ready);
  assert.deepEqual([...policy.terminalGapFields].sort(), [...fieldScopedCoverageExpectations[speciesId].terminal].sort());
}
for (const speciesId of ['sp_0065', 'sp_0066', 'sp_0067', 'sp_0068', 'sp_0143', 'sp_0144', 'sp_0155', 'sp_0361']) {
  const policy = audit.fieldScopedPolicies.find(item => item.speciesId === speciesId);
  assert.ok(policy);
  assert.equal(policy.researchPolicyPresent, true);
  assert.deepEqual(policy.baseTaxonCandidateFacts, ['water', 'temperature', 'ph']);
  assert.deepEqual(policy.exactObjectEvidenceFacts, ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
  assert.equal(policy.researchPolicyGrantsInheritance, false);
  assert.deepEqual(policy.inheritedFacts, [], 'research eligibility must not silently become runtime inheritance authority');
}

const koiPolicy = audit.fieldScopedPolicies.find(item => item.speciesId === 'sp_0258');
assert.ok(koiPolicy);
assert.equal(koiPolicy.researchPolicyPresent, false);
assert.deepEqual(koiPolicy.baseTaxonCandidateFacts, []);
assert.deepEqual(koiPolicy.exactObjectEvidenceFacts, []);
assert.equal(koiPolicy.researchPolicyGrantsInheritance, false);
assert.equal(koiPolicy.registrySource, 'reviewed_variant_field_policy');
assert.equal(koiPolicy.relationshipType, 'trade_strain');
assert.deepEqual(koiPolicy.inheritedFacts, ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'predation']);
assert.deepEqual(koiPolicy.blockedFacts, ['social_behavior', 'territoriality']);
assert.equal(koiPolicy.authoritativeFieldCount, 7);
assert.equal(koiPolicy.genericOnboardingReady, false);
assert.deepEqual(koiPolicy.terminalGapFields, ['social_behavior']);

assert.deepEqual(audit.directReviewedVariants.map(item => item.speciesId), ['sp_0069', 'sp_0070']);
assert.equal(audit.directReviewedVariants[0]?.class, 'trade_or_selective_strain');
assert.equal(audit.directReviewedVariants[1]?.class, 'morphology_or_body_form_variant');
assert.ok(audit.directReviewedVariants.every(item => item.authoritativeFieldCount === 8));
assert.ok(audit.directReviewedVariants.every(item => item.resolutionStrategy === 'direct_reviewed_authority_no_inheritance'));

assert.deepEqual(audit.remainingReviewedVariants, []);

console.log('Compatibility variant inheritance audit PASS:', JSON.stringify(audit.summary));

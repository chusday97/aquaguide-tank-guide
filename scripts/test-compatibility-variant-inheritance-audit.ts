import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCompatibilityVariantInheritanceAudit } from '../src/services/compatibility/compatibility-variant-inheritance-audit.service';

const audit = buildCompatibilityVariantInheritanceAudit();
const disk = JSON.parse(readFileSync(resolve(process.cwd(), 'docs/compatibility_variant_inheritance_audit.json'), 'utf8'));
assert.deepEqual(disk, audit, 'variant inheritance audit artifact must be regenerated when canonical policy changes');

assert.equal(audit.summary.fishDomainSpecies, 308);
assert.equal(audit.summary.explicitReviewedCanonicalBridges, 20);
assert.equal(audit.summary.reviewedColorPolicyCanonicalRecords, 12);
assert.equal(audit.summary.reviewedColorTaxonRootRecords, 3);
assert.equal(audit.summary.reviewedVariantFieldPolicyRecords, 1);
assert.equal(audit.summary.totalCanonicalIdentityRecords, 33);
assert.equal(audit.summary.genericOnboardingReadySpecies, 98);
assert.equal(audit.summary.policyPromotedReadySpecies, 11);
assert.equal(audit.summary.fieldPolicyReadySpecies, 0);
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
  ['sp_0016', 'sp_0104', 'sp_0116', 'sp_0146', 'sp_0151', 'sp_0156', 'sp_0157', 'sp_0174', 'sp_0207', 'sp_0214', 'sp_0224', 'sp_0283'],
);
assert.ok(audit.promoted.every(item => (
  item.registrySource === 'reviewed_color_morph_policy'
  || item.registrySource === 'reviewed_color_morph_taxon_policy'
)));
assert.ok(audit.promoted.filter(item => item.speciesId !== 'sp_0224').every(item => item.genericOnboardingReady && item.authoritativeFieldCount === 8));
assert.ok(audit.promoted.every(item => item.blockedFacts.length === 0));
const taxonRootRows = audit.promoted.filter(item => item.canonicalRootKind === 'reviewed_taxon');
assert.deepEqual(taxonRootRows.map(item => item.speciesId), ['sp_0156', 'sp_0214', 'sp_0224']);
assert.ok(taxonRootRows.every(item => item.canonicalSpeciesId === null));
const platinumSnakehead = audit.promoted.find(item => item.speciesId === 'sp_0224');
assert.ok(platinumSnakehead);
assert.equal(platinumSnakehead.genericOnboardingReady, false);
assert.equal(platinumSnakehead.authoritativeFieldCount, 4);

assert.deepEqual(audit.fieldScopedPolicies.map(item => item.speciesId), ['sp_0258']);
const koiPolicy = audit.fieldScopedPolicies[0];
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

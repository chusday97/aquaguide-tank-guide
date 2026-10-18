import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCompatibilityVariantInheritanceAudit } from '../src/services/compatibility/compatibility-variant-inheritance-audit.service';

const audit = buildCompatibilityVariantInheritanceAudit();
const disk = JSON.parse(readFileSync(resolve(process.cwd(), 'docs/compatibility_variant_inheritance_audit.json'), 'utf8'));
assert.deepEqual(disk, audit, 'variant inheritance audit artifact must be regenerated when canonical policy changes');

assert.equal(audit.summary.fishDomainSpecies, 308);
assert.equal(audit.summary.explicitReviewedCanonicalBridges, 19);
assert.equal(audit.summary.reviewedColorPolicyCanonicalRecords, 12);
assert.equal(audit.summary.reviewedColorTaxonRootRecords, 3);
assert.equal(audit.summary.totalCanonicalIdentityRecords, 31);
assert.equal(audit.summary.genericOnboardingReadySpecies, 97);
assert.equal(audit.summary.policyPromotedReadySpecies, 11);
assert.equal(audit.policy.pairRulesRequiredForPromotedColorMorphs, false);
assert.equal(audit.policy.requiresCanonicalCatalogRoot, false);
assert.equal(audit.policy.allowsReviewedTaxonRoot, true);
assert.equal(audit.policy.restrictedToFishCompatibilityDomain, true);
assert.equal(audit.policy.morphologyVariantsAutoPromoted, false);
assert.equal(audit.policy.tradeOrLineageVariantsAutoPromoted, false);
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

const remainingById = new Map(audit.remainingReviewedVariants.map(item => [item.speciesId, item]));
assert.equal(remainingById.get('sp_0070')?.class, 'morphology_or_body_form_variant');
assert.equal(remainingById.get('sp_0258')?.class, 'trade_or_selective_strain');
for (const speciesId of ['sp_0156', 'sp_0214', 'sp_0224']) {
  assert.ok(!remainingById.has(speciesId), 'reviewed fish color morph must resolve through a catalog or reviewed taxon root: ' + speciesId);
}
assert.ok(!remainingById.has('sp_0001'), 'non-fish color variants must stay outside the fish Compatibility audit');
assert.ok(!remainingById.has('sp_0459'), 'non-fish wild forms must stay outside the fish Compatibility audit');

console.log('Compatibility variant inheritance audit PASS:', JSON.stringify(audit.summary));

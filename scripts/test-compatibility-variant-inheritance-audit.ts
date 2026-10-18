import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildCompatibilityVariantInheritanceAudit } from '../src/services/compatibility/compatibility-variant-inheritance-audit.service';

const audit = buildCompatibilityVariantInheritanceAudit();
const disk = JSON.parse(readFileSync(resolve(process.cwd(), 'docs/compatibility_variant_inheritance_audit.json'), 'utf8'));
assert.deepEqual(disk, audit, 'variant inheritance audit artifact must be regenerated when canonical policy changes');

assert.equal(audit.summary.fishDomainSpecies, 308);
assert.equal(audit.summary.explicitReviewedCanonicalBridges, 19);
assert.equal(audit.summary.reviewedColorPolicyCanonicalRecords, 9);
assert.equal(audit.summary.totalCanonicalIdentityRecords, 28);
assert.equal(audit.summary.genericOnboardingReadySpecies, 97);
assert.equal(audit.summary.policyPromotedReadySpecies, 9);
assert.equal(audit.policy.pairRulesRequiredForPromotedColorMorphs, false);
assert.equal(audit.policy.morphologyVariantsAutoPromoted, false);
assert.equal(audit.policy.tradeOrLineageVariantsAutoPromoted, false);
assert.equal(audit.policy.unresolvedIdentityAutoPromoted, false);

assert.deepEqual(
  audit.promoted.map(item => item.speciesId),
  ['sp_0016', 'sp_0104', 'sp_0116', 'sp_0146', 'sp_0151', 'sp_0157', 'sp_0174', 'sp_0207', 'sp_0283'],
);
assert.ok(audit.promoted.every(item => item.registrySource === 'reviewed_color_morph_policy'));
assert.ok(audit.promoted.every(item => item.genericOnboardingReady && item.authoritativeFieldCount === 8));
assert.ok(audit.promoted.every(item => item.blockedFacts.length === 0));

const remainingById = new Map(audit.remainingReviewedVariants.map(item => [item.speciesId, item]));
assert.equal(remainingById.get('sp_0070')?.class, 'morphology_or_body_form_variant');
assert.equal(remainingById.get('sp_0258')?.class, 'trade_or_selective_strain');
for (const speciesId of ['sp_0156', 'sp_0214', 'sp_0224']) {
  assert.equal(remainingById.get(speciesId)?.class, 'color_variant_without_canonical_root');
}
assert.ok(!remainingById.has('sp_0001'), 'non-fish color variants must stay outside the fish Compatibility audit');
assert.ok(!remainingById.has('sp_0459'), 'non-fish wild forms must stay outside the fish Compatibility audit');

console.log('Compatibility variant inheritance audit PASS:', JSON.stringify(audit.summary));

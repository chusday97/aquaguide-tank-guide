import assert from 'node:assert/strict';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import {
  getCatalogCanonicalIdentity,
  hasFullGenericCompatibilityInheritance,
} from '../src/data/catalogCanonicalIdentity';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { identityCorrectionsPhase2_21Sources } from '../src/data/catalogReviewBatches/identity-corrections-phase2-21';
import { getKnowledgeSource } from '../src/modules/knowledge/knowledgeSources';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildCompatibilityVariantHoldClassification } from '../src/services/compatibility/compatibility-variant-hold-classification.service';

const bridged = [
  ['sp_0171', 'Tanichthys albonubes', 'Albino', 'sp_0434'],
  ['sp_0196', 'Sahyadria denisonii', 'Gold', 'sp_0440'],
] as const;

for (const source of Object.values(identityCorrectionsPhase2_21Sources)) {
  assert.deepEqual(getKnowledgeSource(source.id), source, `${source.id} must resolve through Species Knowledge source registry`);
}

const coverage = buildCompatibilityCoreFieldCoverage();
const row = (speciesId: string) => coverage.rows.find(item => item.speciesId === speciesId);

for (const [speciesId, scientificName, variantKey, canonicalSpeciesId] of bridged) {
  const review = getApprovedCatalogFieldReviews(speciesId)
    .filter(item => item.field === 'identity')
    .at(-1);
  assert.ok(review, `${speciesId} must expose a reviewed identity bridge`);
  assert.deepEqual(review.proposedValue, {
    scientificName,
    baseSpeciesKey: scientificName,
    variantKey,
  });

  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity, `${speciesId} must resolve to reviewed canonical identity`);
  assert.equal(identity.canonicalSpeciesId, canonicalSpeciesId);
  assert.equal(identity.canonicalScientificName, scientificName);
  assert.equal(identity.relationshipType, 'color_morph');
  assert.equal(identity.registrySource, 'reviewed_color_morph_policy');
  assert.equal(identity.variantKey, variantKey);
  assert.equal(hasFullGenericCompatibilityInheritance(speciesId), true);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, []);

  const coverageRow = row(speciesId);
  assert.equal(coverageRow?.authoritativeFieldCount, 8);
  assert.equal(coverageRow?.genericOnboardingReady, true);
  for (const fact of GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS) {
    assert.equal(
      coverageRow?.fields[fact].authoritySource,
      'canonical_inheritance',
      `${speciesId} ${fact} must retain canonical inheritance provenance`,
    );
  }
}

const stillHeldColorCandidates = ['sp_0168', 'sp_0213', 'sp_0252', 'sp_0254'];
for (const speciesId of stillHeldColorCandidates) {
  assert.equal(getCatalogCanonicalIdentity(speciesId), undefined, `${speciesId} lacks sufficient exact variant identity evidence and must remain held`);
  assert.equal(row(speciesId)?.genericOnboardingReady, false);
}

for (const speciesId of ['sp_0147', 'sp_0148', 'sp_0203', 'sp_0389']) {
  assert.equal(getCatalogCanonicalIdentity(speciesId), undefined, `${speciesId} is morphology/lineage-sensitive and must not be promoted by color heuristics`);
  assert.equal(row(speciesId)?.genericOnboardingReady, false);
}

const holdReport = buildCompatibilityVariantHoldClassification();
assert.deepEqual(
  holdReport.items
    .filter(item => item.classification === 'color_only_identity_candidate')
    .map(item => item.speciesId),
  stillHeldColorCandidates,
);
assert.equal(holdReport.summary.heldCatalogObjects, 47);
assert.equal(holdReport.summary.color_only_identity_candidate, 4);
assert.equal(holdReport.summary.morphology_variant, 29);
assert.equal(holdReport.summary.trade_or_lineage_label, 13);
assert.equal(holdReport.summary.size_grade_or_trade_label, 1);

assert.equal(
  coverage.backlog.some(item => bridged.some(([speciesId]) => speciesId === item.speciesId) && item.field === 'predation'),
  false,
  'verified color bridges must leave predation research backlog through generic inheritance',
);
assert.equal(
  getCompatibilityEvidenceAudit().reviewedPairRules.length,
  21,
  'identity bridging must not add pair-specific Compatibility rules',
);

console.log('Verified color identity bridge PASS: Tanichthys albonubes Albino and Sahyadria denisonii Gold gain canonical 8/8 inheritance; four weaker color-looking candidates and all morphology/lineage-sensitive objects remain fail-closed; pair rules stay at 21.');

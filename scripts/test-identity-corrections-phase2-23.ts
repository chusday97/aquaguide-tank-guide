import assert from 'node:assert/strict';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getCatalogCanonicalIdentity, hasFullGenericCompatibilityInheritance } from '../src/data/catalogCanonicalIdentity';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { getCompatibilityVariantFieldResearchPolicy } from '../src/data/compatibilityVariantFieldResearchPolicy';
import { compatibilityVariantResearchCeilings, getCompatibilityVariantResearchCeiling } from '../src/data/compatibilityVariantResearchCeilings';
import { identityCorrectionsPhase2_23Sources } from '../src/data/catalogReviewBatches/identity-corrections-phase2-23';
import { getKnowledgeSource } from '../src/modules/knowledge/knowledgeSources';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildCompatibilityVariantHoldClassification } from '../src/services/compatibility/compatibility-variant-hold-classification.service';

const speciesId = 'sp_0349';
const source = identityCorrectionsPhase2_23Sources.calicoRanchuAquacultureReports;
assert.deepEqual(getKnowledgeSource(source.id), source);

const review = getApprovedCatalogFieldReviews(speciesId).filter(item => item.field === 'identity').at(-1);
assert.ok(review);
assert.deepEqual(review.proposedValue, {
  scientificName: 'Carassius auratus',
  baseSpeciesKey: 'Carassius auratus',
  variantKey: 'Calico Ranchu',
});
assert.equal(review.resolution, 'supported');
assert.equal(review.confidence, 'high');
assert.deepEqual(review.citationIds, [source.id]);

const identity = getCatalogCanonicalIdentity(speciesId);
assert.ok(identity);
assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
assert.equal(identity.canonicalSpeciesId, null);
assert.equal(identity.canonicalScientificName, 'Carassius auratus');
assert.equal(identity.relationshipType, 'selectively_bred_variant');
assert.equal(identity.registrySource, 'reviewed_variant_field_policy');
assert.equal(identity.variantKey, 'Calico Ranchu');
assert.deepEqual(identity.inheritancePolicy.inheritedFacts, []);
assert.deepEqual(identity.inheritancePolicy.blockedFacts, [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS]);
assert.equal(hasFullGenericCompatibilityInheritance(speciesId), false);
assert.equal(getCatalogIdentityBoundary(speciesId), undefined);

const policy = getCompatibilityVariantFieldResearchPolicy(speciesId);
assert.ok(policy);
assert.deepEqual(policy.baseTaxonCandidateFacts, ['water', 'temperature', 'ph']);
assert.deepEqual(policy.exactObjectEvidenceFacts, ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
assert.equal(policy.grantsInheritance, false);

const coverage = buildCompatibilityCoreFieldCoverage();
const row = coverage.rows.find(item => item.speciesId === speciesId);
assert.ok(row);
assert.equal(row.authoritativeFieldCount, 0);
assert.equal(row.genericOnboardingReady, false);
assert.equal(row.terminalGapCount, 8);
assert.equal(row.actionableGapCount, 0);
assert.equal(row.fields.predation.disposition, 'terminal_hold');

for (const field of ['water', 'temperature', 'ph', 'adult_size', 'tank_size'] as const) {
  const ceiling = getCompatibilityVariantResearchCeiling(speciesId, field);
  assert.ok(ceiling);
  assert.equal(ceiling.status, 'field_bridge_evidence_ceiling');
  assert.equal(ceiling.reasonCode, 'variant_field_bridge_research_exhausted');
}
assert.equal(getCompatibilityVariantResearchCeiling(speciesId, 'predation'), undefined);
assert.equal(compatibilityVariantResearchCeilings.length, 56);
assert.equal(compatibilityVariantResearchCeilings.filter(item => item.status === 'field_bridge_evidence_ceiling').length, 8);

const hold = buildCompatibilityVariantHoldClassification();
const item = hold.items.find(entry => entry.speciesId === speciesId);
assert.equal(item, undefined, 'Calico Ranchu must leave executable hold intake after Wave37 terminalizes its final predation research slot');

for (const unresolvedId of ['sp_0064', 'sp_0150', 'sp_0350', 'sp_0385', 'sp_0387']) {
  assert.equal(getCatalogCanonicalIdentity(unresolvedId), undefined);
  const unresolved = hold.items.find(entry => entry.speciesId === unresolvedId);
  assert.ok(unresolved);
  assert.equal(unresolved.identityEvidenceCeilingPresent, true);
  assert.equal(unresolved.pipelineStage, 'identity_evidence_ceiling');
  assert.equal(unresolved.nextAction, 'keep_terminal_identity_hold_unless_new_exact_evidence');
}

assert.equal(hold.summary.heldCatalogObjects, 40);
assert.equal(hold.summary.missingIdentityReviewCatalogObjects, 40);
assert.equal(hold.summary.reviewedSupportedIdentityCatalogObjects, 0);
assert.equal(hold.summary.canonicalBridgeCatalogObjects, 0);
assert.equal(hold.summary.fieldResearchPolicyCatalogObjects, 0);
assert.deepEqual(hold.summary.pipelineStages, {
  identity_review_pending: 0,
  identity_evidence_ceiling: 40,
  canonical_bridge_pending: 0,
  field_policy_pending: 0,
  field_review_pending: 0,
});
assert.equal(getCompatibilityEvidenceAudit().reviewedPairRules.length, 21);

console.log('Calico Ranchu identity bridge PASS: sp_0349 keeps reviewed zero-inheritance identity and exits field-review execution after Wave37; five unresolved goldfish remain terminal identity ceilings.');

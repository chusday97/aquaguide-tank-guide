import assert from 'node:assert/strict';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import {
  getCatalogCanonicalIdentity,
  hasFullGenericCompatibilityInheritance,
} from '../src/data/catalogCanonicalIdentity';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence';
import { getCompatibilityVariantFieldResearchPolicy } from '../src/data/compatibilityVariantFieldResearchPolicy';
import {
  compatibilityVariantResearchCeilings,
  getCompatibilityVariantResearchCeiling,
} from '../src/data/compatibilityVariantResearchCeilings';
import { identityCorrectionsPhase2_22Sources } from '../src/data/catalogReviewBatches/identity-corrections-phase2-22';
import { getKnowledgeSource } from '../src/modules/knowledge/knowledgeSources';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildCompatibilityVariantHoldClassification } from '../src/services/compatibility/compatibility-variant-hold-classification.service';

const bridged = [
  ['sp_0063', 'Ranchu'],
  ['sp_0149', 'Panda'],
  ['sp_0180', 'Telescope'],
  ['sp_0348', 'Tigerhead'],
  ['sp_0351', 'Butterfly Tail'],
  ['sp_0386', 'Black Moor'],
] as const;

for (const source of Object.values(identityCorrectionsPhase2_22Sources)) {
  assert.deepEqual(getKnowledgeSource(source.id), source, source.id + ' must resolve through the shared source registry');
}

const coverage = buildCompatibilityCoreFieldCoverage();
const hold = buildCompatibilityVariantHoldClassification();
const row = (speciesId: string) => coverage.rows.find(item => item.speciesId === speciesId);

for (const [speciesId, variantKey] of bridged) {
  const review = getApprovedCatalogFieldReviews(speciesId)
    .filter(item => item.field === 'identity')
    .at(-1);
  assert.ok(review, speciesId + ' must expose a reviewed exact-form identity');
  assert.deepEqual(review.proposedValue, {
    scientificName: 'Carassius auratus',
    baseSpeciesKey: 'Carassius auratus',
    variantKey,
  });

  const identity = getCatalogCanonicalIdentity(speciesId);
  assert.ok(identity, speciesId + ' must resolve to reviewed canonical identity');
  assert.equal(identity.canonicalRootKind, 'reviewed_taxon');
  assert.equal(identity.canonicalSpeciesId, null);
  assert.equal(identity.canonicalScientificName, 'Carassius auratus');
  assert.equal(identity.relationshipType, 'selectively_bred_variant');
  assert.equal(identity.registrySource, 'reviewed_variant_field_policy');
  assert.equal(identity.variantKey, variantKey);
  assert.deepEqual(identity.inheritancePolicy.inheritedFacts, []);
  assert.deepEqual(identity.inheritancePolicy.blockedFacts, [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS]);
  assert.equal(hasFullGenericCompatibilityInheritance(speciesId), false);
  assert.equal(getCatalogIdentityBoundary(speciesId), undefined);

  const coverageRow = row(speciesId);
  assert.ok(coverageRow);
  assert.equal(coverageRow.authoritativeFieldCount, 0);
  assert.equal(coverageRow.genericOnboardingReady, false);
  assert.equal(coverageRow.terminalGapCount, 7);
  assert.equal(coverageRow.actionableGapCount, 1);
  assert.equal(coverageRow.fields.predation.disposition, 'targeted_source_expansion');

  const researchPolicy = getCompatibilityVariantFieldResearchPolicy(speciesId);
  assert.ok(researchPolicy, speciesId + ' must enter the reviewed field-research pipeline after identity resolution');
  assert.deepEqual(researchPolicy.baseTaxonCandidateFacts, ['water', 'temperature', 'ph']);
  assert.deepEqual(researchPolicy.exactObjectEvidenceFacts, ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation']);
  assert.equal(researchPolicy.grantsInheritance, false);
  for (const field of ['water', 'temperature', 'ph', 'adult_size', 'tank_size'] as const) {
    const ceiling = getCompatibilityVariantResearchCeiling(speciesId, field);
    assert.ok(ceiling, speciesId + ':' + field + ' must retain a research ceiling after identity resolution');
    assert.equal(ceiling.status, 'field_bridge_evidence_ceiling');
    assert.equal(ceiling.reasonCode, 'variant_field_bridge_research_exhausted');
  }
  assert.equal(getCompatibilityVariantResearchCeiling(speciesId, 'predation'), undefined);

  const holdItem = hold.items.find(item => item.speciesId === speciesId);
  assert.ok(holdItem, speciesId + ' must remain in held intake until fields are reviewed');
  assert.equal(holdItem.identityReviewState, 'reviewed_supported');
  assert.equal(holdItem.canonicalBridgePresent, true);
  assert.equal(holdItem.candidateForAutomaticInheritance, false);
}

assert.equal(hold.summary.heldCatalogObjects, 47);
assert.equal(hold.summary.missingIdentityReviewCatalogObjects, 41);
assert.equal(hold.summary.reviewedSupportedIdentityCatalogObjects, 6);
assert.equal(hold.summary.canonicalBridgeCatalogObjects, 6);

assert.equal(
  compatibilityVariantResearchCeilings.length,
  56,
  'durable variant research ceilings must survive cleanup or emptying of working bridge manifests',
);
assert.equal(
  compatibilityVariantResearchCeilings.filter(item => item.status === 'field_bridge_evidence_ceiling').length,
  7,
  'six newly identity-resolved goldfish plus the existing field-bridge record must remain field-stage ceilings',
);
assert.equal(
  compatibilityVariantResearchCeilings.find(item => item.speciesId === 'sp_0419')?.status,
  'identity_evidence_ceiling',
  'unresolved control variants must not be migrated merely because other variants gained reviewed identity',
);

for (const speciesId of ['sp_0064', 'sp_0150', 'sp_0349', 'sp_0350', 'sp_0385', 'sp_0387']) {
  assert.equal(getCatalogCanonicalIdentity(speciesId), undefined, speciesId + ' lacks sufficient exact-form evidence and must stay identity-held');
  assert.equal(row(speciesId)?.genericOnboardingReady, false);
}

assert.equal(
  getCompatibilityEvidenceAudit().reviewedPairRules.length,
  21,
  'goldfish identity resolution must not add pair-specific rules',
);

console.log('Goldfish exact variant identity bridge PASS: six evidence-backed Carassius auratus forms retain zero runtime inheritance, move from identity-stage ceilings into reviewed field-bridge research policy, and leave weaker compound/trade forms identity-held.');

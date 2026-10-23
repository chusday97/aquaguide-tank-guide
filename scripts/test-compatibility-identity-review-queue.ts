import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildCompatibilityIdentityReviewQueue,
  type CompatibilityIdentityMigrationAudit,
} from '../src/services/compatibility/identity-review-queue.service';

const row = (overrides: Partial<CompatibilityIdentityMigrationAudit['rows'][number]> = {}): CompatibilityIdentityMigrationAudit['rows'][number] => ({
  speciesId: 'sp_test',
  name: 'Test Variant',
  scientificName: 'Testus fishii var. Blue',
  lifeType: 'fish',
  blankVariantSuffix: false,
  boundaryCode: 'catalog_variant_identity_unresolved',
  migrationPath: 'identity_only_after_exact_evidence',
  catalogStructureSubtype: null,
  catalogStructureBlockedReason: null,
  catalogStructureReopenRequirement: null,
  nextAction: 'Find exact-object evidence.',
  candidateTaxa: ['Testus fishii ornamental Blue lineage'],
  morphologyRisk: false,
  readyBaseCandidateCount: 1,
  readyBaseCandidates: [{ speciesId: 'sp_base', scientificName: 'Testus fishii' }],
  baseCandidates: [{ speciesId: 'sp_base', scientificName: 'Testus fishii' }],
  identityEvidenceStatus: 'no_object_identity_review',
  researchDisposition: null,
  researchDebtStatus: null,
  researchDebtBlockingReason: null,
  researchDebtReopenRequirement: null,
  identityResearchDebt: null,
  affectedIdentityUnknownPairs: 10,
  soleBoundaryIdentityUnknownPairs: 8,
  sharedBoundaryIdentityUnknownPairs: 2,
  ...overrides,
});

const synthetic: CompatibilityIdentityMigrationAudit = {
  schemaVersion: 4,
  activeIdentityBoundaries: 7,
  identityUnknownPairs: 42,
  rows: [
    row(),
    row({
      speciesId: 'sp_balloon',
      name: 'Balloon Variant',
      scientificName: 'Testus fishii var. Balloon',
      migrationPath: 'partial_inheritance_review',
      morphologyRisk: true,
      soleBoundaryIdentityUnknownPairs: 7,
    }),
    row({
      speciesId: 'sp_debt',
      migrationPath: 'identity_only_after_exact_evidence',
      researchDebtStatus: 'exact_object_evidence_not_found',
      researchDebtBlockingReason: 'Exact object evidence was not found.',
      researchDebtReopenRequirement: 'Provide a new exact-object professional source.',
      identityResearchDebt: { searchedObjectLabels: ['Exact Trade Label'] },
      soleBoundaryIdentityUnknownPairs: 6,
    }),
    row({
      speciesId: 'sp_label',
      migrationPath: 'exact_variant_label_disambiguation',
      researchDebtStatus: 'catalog_label_disambiguation_required',
      researchDebtBlockingReason: 'Catalog label is ambiguous.',
      researchDebtReopenRequirement: 'Resolve the exact trade label first.',
      soleBoundaryIdentityUnknownPairs: 5,
    }),
    row({
      speciesId: 'sp_open_trade',
      name: 'Open Trade Label',
      scientificName: 'Ancistrus sp. Gold',
      migrationPath: 'base_authority_or_parent_resolution',
      readyBaseCandidateCount: 0,
      readyBaseCandidates: [],
      baseCandidates: [],
      soleBoundaryIdentityUnknownPairs: 4,
    }),
    row({
      speciesId: 'sp_terminal',
      migrationPath: 'base_authority_or_parent_resolution',
      researchDisposition: 'terminal_unknown_hold',
      soleBoundaryIdentityUnknownPairs: 4,
    }),
    row({
      speciesId: 'sp_hybrid',
      migrationPath: 'hybrid_object_specific_hold',
      readyBaseCandidateCount: 0,
      readyBaseCandidates: [],
      baseCandidates: [],
      soleBoundaryIdentityUnknownPairs: 4,
    }),
  ],
};

const syntheticQueue = buildCompatibilityIdentityReviewQueue(synthetic, '2026-10-18T00:00:00.000Z', 'synthetic');
const syntheticById = new Map(syntheticQueue.items.map(item => [item.speciesId, item] as const));
assert.equal(syntheticQueue.summary.total, 7);
assert.equal(syntheticById.get('sp_test')?.queue, 'exact_object_identity_research');
assert.equal(syntheticById.get('sp_test')?.automatedResearchAllowed, true);
assert.equal(syntheticById.get('sp_balloon')?.queue, 'partial_inheritance_review');
assert.equal(syntheticById.get('sp_balloon')?.fullInheritanceAllowed, false);
assert.equal(syntheticById.get('sp_debt')?.queue, 'evidence_ceiling_hold');
assert.equal(syntheticById.get('sp_debt')?.automatedResearchAllowed, false);
assert.ok(syntheticById.get('sp_debt')?.researchLabels.includes('Exact Trade Label'));
assert.equal(syntheticById.get('sp_label')?.queue, 'manual_label_disambiguation');
assert.equal(syntheticById.get('sp_open_trade')?.queue, 'trade_name_disambiguation');
assert.equal(syntheticById.get('sp_open_trade')?.automatedResearchAllowed, false);
assert.match(syntheticById.get('sp_open_trade')?.researchBlockedReason || '', /structurally open/i);
assert.match(syntheticById.get('sp_open_trade')?.reopenRequirement || '', /lineage\/provenance/i);
assert.equal(syntheticById.get('sp_terminal')?.queue, 'evidence_ceiling_hold');
assert.equal(syntheticById.get('sp_terminal')?.automatedResearchAllowed, false);
assert.match(syntheticById.get('sp_terminal')?.researchBlockedReason || '', /terminal_unknown_hold/i);
assert.match(syntheticById.get('sp_terminal')?.reopenRequirement || '', /authoritative/i);
assert.equal(syntheticById.get('sp_hybrid')?.queue, 'hybrid_object_hold');
assert.equal(syntheticQueue.items.every(item => item.requiresHumanReview && !item.promotionAllowed && !item.writesAuthority), true);

const auditPath = 'docs/compatibility_identity_migration_audit.json';
const artifactPath = 'evaluation/product/compatibility-identity-review-queue.v1.json';
const audit = JSON.parse(readFileSync(auditPath, 'utf8')) as CompatibilityIdentityMigrationAudit;
const committed = JSON.parse(readFileSync(artifactPath, 'utf8'));
const current = buildCompatibilityIdentityReviewQueue(audit, committed.generatedAt, auditPath);

assert.deepEqual(committed, current, 'committed identity review queue must exactly match the current identity migration audit');
assert.equal(current.summary.total, audit.activeIdentityBoundaries);
assert.equal(current.items.length, audit.rows.length);
assert.equal(new Set(current.items.map(item => item.speciesId)).size, current.items.length);
assert.equal(current.summary.sourceIdentityUnknownPairs, audit.identityUnknownPairs);
assert.equal(current.promotionAllowed, false);
assert.equal(current.writesAuthority, false);
assert.equal(current.items.every(item => item.requiresHumanReview && item.fullInheritanceAllowed === false), true);

const byId = new Map(current.items.map(item => [item.speciesId, item] as const));
const auditById = new Map(audit.rows.map(row => [row.speciesId, row] as const));
for (const item of current.items) {
  assert.deepEqual(
    item.candidateTaxa,
    [...new Set(auditById.get(item.speciesId)?.candidateTaxa || [])],
    `${item.speciesId} review queue must preserve the complete migration-audit candidate taxon set`,
  );
  assert.equal(
    item.catalogStructureSubtype,
    auditById.get(item.speciesId)?.catalogStructureSubtype ?? null,
    `${item.speciesId} review queue must preserve migration-audit catalog structure subtype`,
  );
}
assert.equal(byId.has('sp_0338'), false, 'resolved duplicate catalog alias must leave the active identity review queue');
assert.equal(byId.get('sp_0175')?.queue, 'manual_label_disambiguation');
assert.equal(byId.get('sp_0175')?.automatedResearchAllowed, false);
assert.equal(byId.get('sp_0158')?.queue, 'evidence_ceiling_hold');
assert.equal(byId.get('sp_0158')?.gate, 'evidence_ceiling');
assert.equal(byId.get('sp_0158')?.blankVariantSuffix, true);
for (const id of ['sp_0158', 'sp_0142', 'sp_0210']) {
  assert.equal(byId.get(id)?.queue, 'evidence_ceiling_hold');
  assert.equal(byId.get(id)?.researchDebtStatus, 'exact_object_evidence_not_found');
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
  assert.equal(byId.get(id)?.fullInheritanceAllowed, false);
}
assert.ok((byId.get('sp_0158')?.candidateTaxa || []).some(item => item.includes('Xiphophorus maculatus')));
assert.ok((byId.get('sp_0142')?.candidateTaxa || []).some(item => item.includes('breeding complex')));
assert.ok((byId.get('sp_0210')?.candidateTaxa || []).some(item => item.includes('Pangio anguillaris')));
assert.equal(byId.get('sp_0474')?.queue, 'trade_name_disambiguation');
assert.equal(byId.get('sp_0474')?.gate, 'manual_disambiguation');
assert.equal(byId.get('sp_0474')?.automatedResearchAllowed, false);
assert.ok((byId.get('sp_0474')?.candidateTaxa || []).some(item => item.includes('Oryzias latipes species complex')));
assert.equal(byId.get('sp_0141')?.queue, 'trade_name_disambiguation');
assert.equal(byId.get('sp_0141')?.gate, 'manual_disambiguation');
assert.equal(byId.get('sp_0141')?.catalogStructureSubtype, null);
assert.equal(byId.get('sp_0141')?.automatedResearchAllowed, false);
assert.ok((byId.get('sp_0141')?.candidateTaxa || []).some(item => item.includes('Muzel Red Cherry')));
for (const item of current.items) {
  if (item.queue !== 'catalog_structure_correction' || item.candidateTaxa.length !== 1) continue;
  assert.match(
    item.candidateTaxa[0],
    /legacy catalog attribution; exact catalog object not independently confirmed/i,
    `${item.speciesId} review queue must expose legacy-only provenance for unresolved blank-var parent hints`,
  );
}
assert.equal(byId.has('sp_0445'), false, 'reviewed Blue Gourami identity must leave the active identity review queue');
for (const resolvedGoldfishId of ['sp_0066', 'sp_0067', 'sp_0068']) {
  assert.equal(byId.has(resolvedGoldfishId), false, `${resolvedGoldfishId} reviewed goldfish breed identity must leave the active identity review queue`);
}
for (const resolvedLongfinId of ['sp_0155', 'sp_0361']) {
  assert.equal(byId.has(resolvedLongfinId), false, `${resolvedLongfinId} reviewed Longfin identity must leave the active identity review queue`);
}
for (const resolvedPhase213Id of ['sp_0143', 'sp_0144', 'sp_0216']) {
  assert.equal(byId.has(resolvedPhase213Id), false, `${resolvedPhase213Id} reviewed exact identity must leave the active identity review queue`);
}
for (const resolvedPhase214Id of ['sp_0065', 'sp_0162']) {
  assert.equal(byId.has(resolvedPhase214Id), false, `${resolvedPhase214Id} reviewed goldfish identity must leave the active identity review queue`);
}
assert.equal(byId.get('sp_0158')?.catalogStructureSubtype, 'conflicting_candidate_lineages');
assert.match(byId.get('sp_0158')?.researchBlockedReason || '', /conflicting plausible lineage interpretations/i);
assert.match(byId.get('sp_0158')?.reopenRequirement || '', /breeder\/importer provenance/i);
assert.match(byId.get('sp_0158')?.nextAction || '', /do not retry automated identity research/i);
for (const id of ['sp_0365', 'sp_0296', 'sp_0366', 'sp_0358']) {
  assert.equal(byId.get(id)?.queue, 'evidence_ceiling_hold');
  assert.equal(byId.get(id)?.gate, 'evidence_ceiling');
  assert.equal(byId.get(id)?.researchDebtStatus, 'exact_object_evidence_not_found');
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
  assert.match(byId.get(id)?.nextAction || '', /do not retry automated identity research/i);
}
assert.equal(byId.get('sp_0365')?.catalogStructureSubtype, 'morphology_modifier_requires_lineage');
assert.equal(byId.get('sp_0296')?.catalogStructureSubtype, 'generic_improvement_modifier_requires_lineage');
for (const id of ['sp_0211', 'sp_0265', 'sp_0205', 'sp_0360']) {
  assert.equal(byId.get(id)?.catalogStructureSubtype, 'named_trade_label_requires_lineage');
  assert.equal(byId.get(id)?.queue, 'evidence_ceiling_hold');
  assert.equal(byId.get(id)?.gate, 'evidence_ceiling');
  assert.equal(byId.get(id)?.researchDebtStatus, 'exact_object_evidence_not_found');
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
  assert.match(byId.get(id)?.nextAction || '', /do not retry automated identity research/i);
}
for (const id of ['sp_0154', 'sp_0204', 'sp_0212']) {
  assert.equal(byId.get(id)?.queue, 'trade_name_disambiguation');
  assert.equal(byId.get(id)?.gate, 'manual_disambiguation');
  assert.equal(byId.get(id)?.catalogStructureSubtype, null);
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
}
assert.ok((byId.get('sp_0204')?.candidateTaxa || []).some(item => item.includes('Petitella rhodostoma')));
assert.ok((byId.get('sp_0154')?.candidateTaxa || []).some(item => item.includes('Petitella rhodostoma')));
assert.ok((byId.get('sp_0212')?.candidateTaxa || []).some(item => item.includes('Hyphessobrycon saizi')));
for (const id of ['sp_0271', 'sp_0376', 'sp_0399']) {
  assert.equal(byId.get(id)?.queue, 'evidence_ceiling_hold');
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
  assert.ok((byId.get(id)?.reopenRequirement || '').length > 0);
}
assert.equal(byId.get('sp_0241')?.queue, 'evidence_ceiling_hold');
assert.equal(byId.get('sp_0241')?.automatedResearchAllowed, false);
assert.equal(byId.get('sp_0241')?.morphologyRisk, true);
assert.equal(byId.get('sp_0241')?.fullInheritanceAllowed, false);
assert.equal(byId.get('sp_0021')?.queue, 'hybrid_object_hold');
assert.equal(byId.get('sp_0110')?.queue, 'evidence_ceiling_hold');
assert.equal(byId.get('sp_0110')?.automatedResearchAllowed, false);
assert.equal(byId.get('sp_0110')?.researchDisposition, 'terminal_unknown_hold');
assert.ok((byId.get('sp_0110')?.reopenRequirement || '').length > 0);
const structuralOpenParentIds = [
  'sp_0124', 'sp_0159', 'sp_0160', 'sp_0182', 'sp_0201', 'sp_0217', 'sp_0230',
  'sp_0280', 'sp_0281', 'sp_0297', 'sp_0392', 'sp_0414', 'sp_0418',
];
for (const id of structuralOpenParentIds) {
  assert.equal(byId.get(id)?.queue, 'trade_name_disambiguation');
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
  assert.match(byId.get(id)?.researchBlockedReason || '', /structurally open/i);
  assert.ok((byId.get(id)?.reopenRequirement || '').length > 0);
}
assert.equal(current.summary.automatedResearchEligible, 0);
assert.equal(current.summary.manualReviewOnly, 93);
assert.equal(current.summary.fishIdentityBoundaries, 91);
assert.equal(current.summary.nonFishIdentityBoundaries, 2);
assert.equal(current.summary.blankVariantCatalogCorrections, 0);
assert.deepEqual(current.summary.catalogStructureSubtypeCounts, {
  conflicting_candidate_lineages: 3,
  morphology_modifier_requires_lineage: 1,
  generic_improvement_modifier_requires_lineage: 3,
  named_trade_label_requires_lineage: 4,
});
assert.equal(current.summary.readyBaseIdentityBoundaries, 37);
assert.equal(current.summary.readyBaseMorphologySafeBoundaries, 18);
assert.equal(current.summary.readyBaseMorphologyRiskBoundaries, 19);
assert.equal(current.summary.evidenceCeilingHolds, 68);
assert.equal(current.summary.terminalEvidenceCeilingHolds, 68);
assert.equal(current.summary.actionableManualIntervention, 25);
assert.equal(current.summary.classifiedBoundaryCoveragePct, 100);
assert.equal(current.summary.unclassifiedBoundaries, 0);
assert.equal(current.summary.partialInheritanceReview, 0);
assert.equal(current.summary.byQueue.exact_object_identity_research, 0);
assert.equal(current.summary.byQueue.partial_inheritance_review, 0);
assert.equal(current.summary.byQueue.base_or_parent_resolution, 0);
assert.equal(current.summary.byQueue.taxonomic_review, 0);
assert.equal(current.summary.byQueue.manual_label_disambiguation, 1);
assert.equal(current.summary.byQueue.catalog_structure_correction, 0);
assert.equal(current.summary.byQueue.trade_name_disambiguation, 21);
assert.equal(current.summary.byQueue.evidence_ceiling_hold, 68);
assert.equal(current.summary.byQueue.hybrid_object_hold, 3);
assert.equal(current.items.every(item => item.researchDisposition === 'terminal_unknown_hold'), true);
assert.equal(current.items.every(item => item.automatedResearchAllowed === false), true);
assert.equal(
  current.items.some(item => item.queue === 'catalog_structure_correction'),
  false,
  'review queue must contain no repeat-search catalog-structure work after all source-level structure debts have either evidence ceilings or a more accurate trade route',
);
for (const item of current.items.filter(item => item.migrationPath === 'catalog_structure_correction')) {
  assert.equal(item.queue, 'evidence_ceiling_hold');
  assert.equal(item.gate, 'evidence_ceiling');
  assert.equal(item.researchDebtStatus, 'exact_object_evidence_not_found');
}

const totalByQueue = Object.values(current.summary.byQueue).reduce((sum, count) => sum + count, 0);
assert.equal(totalByQueue, current.summary.total);
const soleImpact = current.items.reduce((sum, item) => sum + item.soleBoundaryIdentityUnknownPairs, 0);
const queuedSoleImpact = Object.values(current.summary.soleBoundaryPairImpactByQueue).reduce((sum, count) => sum + count, 0);
assert.equal(queuedSoleImpact, soleImpact);

console.log('Compatibility identity review queue PASS:', JSON.stringify(current.summary));

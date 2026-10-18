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
  boundaryCode: 'catalog_variant_identity_unresolved',
  migrationPath: 'identity_only_after_exact_evidence',
  nextAction: 'Find exact-object evidence.',
  candidateTaxa: ['Testus fishii ornamental Blue lineage'],
  morphologyRisk: false,
  readyBaseCandidateCount: 1,
  readyBaseCandidates: [{ speciesId: 'sp_base', scientificName: 'Testus fishii' }],
  baseCandidates: [{ speciesId: 'sp_base', scientificName: 'Testus fishii' }],
  identityEvidenceStatus: 'no_object_identity_review',
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
  schemaVersion: 3,
  activeIdentityBoundaries: 5,
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
assert.equal(syntheticQueue.summary.total, 5);
assert.equal(syntheticById.get('sp_test')?.queue, 'exact_object_identity_research');
assert.equal(syntheticById.get('sp_test')?.automatedResearchAllowed, true);
assert.equal(syntheticById.get('sp_balloon')?.queue, 'partial_inheritance_review');
assert.equal(syntheticById.get('sp_balloon')?.fullInheritanceAllowed, false);
assert.equal(syntheticById.get('sp_debt')?.queue, 'evidence_ceiling_hold');
assert.equal(syntheticById.get('sp_debt')?.automatedResearchAllowed, false);
assert.ok(syntheticById.get('sp_debt')?.researchLabels.includes('Exact Trade Label'));
assert.equal(syntheticById.get('sp_label')?.queue, 'manual_label_disambiguation');
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
assert.equal(byId.get('sp_0175')?.queue, 'manual_label_disambiguation');
assert.equal(byId.get('sp_0175')?.automatedResearchAllowed, false);
for (const id of ['sp_0271', 'sp_0376', 'sp_0399']) {
  assert.equal(byId.get(id)?.queue, 'evidence_ceiling_hold');
  assert.equal(byId.get(id)?.automatedResearchAllowed, false);
  assert.ok((byId.get(id)?.reopenRequirement || '').length > 0);
}
assert.equal(byId.get('sp_0241')?.queue, 'partial_inheritance_review');
assert.equal(byId.get('sp_0241')?.fullInheritanceAllowed, false);
assert.equal(byId.get('sp_0021')?.queue, 'hybrid_object_hold');

const totalByQueue = Object.values(current.summary.byQueue).reduce((sum, count) => sum + count, 0);
assert.equal(totalByQueue, current.summary.total);
const soleImpact = current.items.reduce((sum, item) => sum + item.soleBoundaryIdentityUnknownPairs, 0);
const queuedSoleImpact = Object.values(current.summary.soleBoundaryPairImpactByQueue).reduce((sum, count) => sum + count, 0);
assert.equal(queuedSoleImpact, soleImpact);

console.log('Compatibility identity review queue PASS:', JSON.stringify(current.summary));

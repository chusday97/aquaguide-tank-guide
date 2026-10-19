import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fishData } from '../src/data/fishData';
import { getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getCatalogCanonicalIdentity } from '../src/data/catalogCanonicalIdentity';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const jsonPath = 'docs/compatibility_identity_migration_audit.json';
const mdPath = 'docs/compatibility_identity_migration_audit.md';
const committedJson = readFileSync(jsonPath, 'utf8');
const committedMd = readFileSync(mdPath, 'utf8');
let generatedJson = committedJson;
let generatedMd = committedMd;
try {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/generate-compatibility-identity-migration-audit.ts'], {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'identity migration audit generator failed');
  generatedJson = readFileSync(jsonPath, 'utf8');
  generatedMd = readFileSync(mdPath, 'utf8');
} finally {
  writeFileSync(jsonPath, committedJson);
  writeFileSync(mdPath, committedMd);
}
assert.equal(generatedJson, committedJson, 'compatibility_identity_migration_audit.json is stale');
assert.equal(generatedMd, committedMd, 'compatibility_identity_migration_audit.md is stale');

const report = JSON.parse(committedJson) as {
  activeIdentityBoundaries: number;
  fishDomainIdentityBoundaries: number;
  identityUnknownPairs: number;
  identityUnknownPairsWithOneActiveBoundary: number;
  identityUnknownPairsWithTwoActiveBoundaries: number;
  identityUnknownPairsWithoutActiveBoundary: number;
  autoMigratableCount: number;
  migrationPathCounts: Record<string, number>;
  migrationPathSoleBoundaryImpact: Record<string, number>;
  identityEvidenceStatusCounts: Record<string, number>;
  researchDebtStatusCounts: Record<string, number>;
  researchedHighImpactHoldCount: number;
  terminalIdentityHoldCount: number;
  identityOnlyAfterExactEvidenceCount: number;
  partialInheritanceReviewCount: number;
  rows: Array<{
    speciesId: string;
    scientificName: string;
    boundaryCode: string;
    migrationBucket: string;
    migrationPath: string;
    identityEvidenceStatus: string;
    researchDisposition: 'terminal_unknown_hold' | null;
    researchDebtStatus: string | null;
    researchDebtReviewedAt: string | null;
    researchDebtBlockingReason: string | null;
    researchDebtReopenRequirement: string | null;
    nonQualifyingReferenceCount: number;
    blankVariantSuffix: boolean;
    morphologyRisk: boolean;
    readyBaseCandidateCount: number;
    readyBaseCandidates: Array<{ speciesId: string; genericOnboardingReady: boolean; authoritativeFieldCount: number }>;
    autoMigrationAllowed: boolean;
    sourceIds: string[];
    genericOnboardingReady: boolean;
    canonicalIdentityPresent: boolean;
    affectedIdentityUnknownPairs: number;
    soleBoundaryIdentityUnknownPairs: number;
    sharedBoundaryIdentityUnknownPairs: number;
  }>;
};

const active = fishData
  .map(species => ({ species, boundary: getCatalogIdentityBoundary(species.id) }))
  .filter(item => Boolean(item.boundary));
assert.equal(report.activeIdentityBoundaries, active.length);
assert.equal(report.rows.length, active.length);
assert.equal(new Set(report.rows.map(row => row.speciesId)).size, report.rows.length);
assert.equal(report.autoMigratableCount, 0);
assert.equal(report.terminalIdentityHoldCount, report.activeIdentityBoundaries);
assert.equal(report.identityUnknownPairsWithoutActiveBoundary, 0);
assert.ok(report.identityOnlyAfterExactEvidenceCount > 0);
assert.ok(report.partialInheritanceReviewCount > 0);
assert.equal(report.researchedHighImpactHoldCount, 4);
assert.equal(report.researchDebtStatusCounts.catalog_label_disambiguation_required, 1);
assert.equal(report.researchDebtStatusCounts.exact_object_evidence_not_found, 3);
assert.equal(report.migrationPathCounts.catalog_structure_correction, 16, 'blank var. catalog labels must be routed to structural correction instead of evidence research');
assert.equal(report.migrationPathCounts.exact_variant_label_disambiguation, 1, 'only the non-blank reviewed trade/lineage label ambiguity should remain in exact label disambiguation');
for (const resolvedGoldfishId of ['sp_0066', 'sp_0067', 'sp_0068']) {
  assert.equal(report.rows.some(row => row.speciesId === resolvedGoldfishId), false, `${resolvedGoldfishId} reviewed breed identity must leave the active migration audit`);
}
for (const resolvedLongfinId of ['sp_0155', 'sp_0361']) {
  assert.equal(report.rows.some(row => row.speciesId === resolvedLongfinId), false, `${resolvedLongfinId} reviewed Longfin identity must leave the active migration audit`);
}
for (const resolvedPhase213Id of ['sp_0143', 'sp_0144', 'sp_0216']) {
  assert.equal(report.rows.some(row => row.speciesId === resolvedPhase213Id), false, `${resolvedPhase213Id} reviewed exact identity must leave the active migration audit`);
}
for (const resolvedPhase214Id of ['sp_0065', 'sp_0162']) {
  assert.equal(report.rows.some(row => row.speciesId === resolvedPhase214Id), false, `${resolvedPhase214Id} reviewed goldfish identity must leave the active migration audit`);
}
assert.equal(Object.values(report.migrationPathCounts).reduce((sum, count) => sum + count, 0), report.activeIdentityBoundaries);
assert.equal(Object.values(report.identityEvidenceStatusCounts).reduce((sum, count) => sum + count, 0), report.activeIdentityBoundaries);
assert.equal(
  report.identityEvidenceStatusCounts.supported_identity_review_present || 0,
  0,
  'a supported reviewed identity must supersede its active boundary instead of remaining in the debt queue',
);
assert.equal(
  report.identityUnknownPairsWithOneActiveBoundary + report.identityUnknownPairsWithTwoActiveBoundaries,
  report.identityUnknownPairs,
);

const decisionAudit = JSON.parse(readFileSync('docs/compatibility_decision_audit.json', 'utf8'));
assert.equal(
  report.identityUnknownPairs,
  decisionAudit.unknownReasons.unresolved_identity,
  'identity migration audit must reconcile exactly to decision-audit unresolved_identity pairs',
);

const coverage = buildCompatibilityCoreFieldCoverage();
const coverageById = new Map(coverage.rows.map(row => [row.speciesId, row]));
for (const row of report.rows) {
  assert.equal(row.autoMigrationAllowed, false, `${row.speciesId} active boundary must never auto-migrate`);
  assert.ok(row.sourceIds.length > 0, `${row.speciesId} active identity hold must retain reviewed source provenance`);
  assert.equal(row.researchDisposition, 'terminal_unknown_hold', `${row.speciesId} active identity boundary must preserve source-controlled terminal disposition`);
  assert.equal(row.genericOnboardingReady, false, `${row.speciesId} active identity boundary cannot be generic-ready`);
  assert.equal(coverageById.get(row.speciesId)?.genericOnboardingReady, false);
  assert.equal(row.canonicalIdentityPresent, false, `${row.speciesId} cannot be canonical-ready while an active boundary exists`);
  assert.equal(getCatalogCanonicalIdentity(row.speciesId), undefined);
  assert.ok(row.migrationPath.length > 0, row.speciesId + ' must have an explicit migration path');
  assert.ok(row.identityEvidenceStatus.length > 0, row.speciesId + ' must expose identity-review status');
  assert.equal(row.readyBaseCandidateCount, row.readyBaseCandidates.length);
  for (const base of row.readyBaseCandidates) {
    assert.equal(base.genericOnboardingReady, true);
    assert.equal(base.authoritativeFieldCount, 8);
  }
  assert.equal(
    row.affectedIdentityUnknownPairs,
    row.soleBoundaryIdentityUnknownPairs + row.sharedBoundaryIdentityUnknownPairs,
  );

  const unsafeByName = /\bvar\.?\b|\bsp\.?\b/i.test(row.scientificName)
    || row.boundaryCode.includes('variant')
    || row.boundaryCode.includes('trade_name')
    || row.boundaryCode.includes('hybrid');
  if (unsafeByName) {
    assert.equal(row.autoMigrationAllowed, false, `${row.speciesId} cannot migrate from a name/suffix/lineage hint`);
  }
}

for (const item of active) {
  assert.ok(report.rows.some(row => row.speciesId === item.species.id));
}

assert.ok(
  report.rows.some(row => row.migrationBucket === 'taxonomic_research_candidate'),
  'plain-binomial unresolved taxonomy must remain visible as a separate research lane',
);
assert.ok(report.rows.some(row => row.migrationBucket === 'variant_object_evidence_required'));
assert.ok(report.rows.some(row => row.migrationBucket === 'parent_taxon_resolution_required'));
assert.ok(report.rows.some(row => row.migrationBucket === 'trade_name_disambiguation_required'));
assert.ok(report.rows.some(row => row.migrationBucket === 'commercial_hybrid_hold'));

const byId = new Map(report.rows.map(row => [row.speciesId, row]));

assert.equal(byId.get('sp_0175')?.migrationPath, 'exact_variant_label_disambiguation');
assert.equal(byId.get('sp_0175')?.readyBaseCandidateCount, 1);
assert.equal(byId.get('sp_0175')?.morphologyRisk, false);
assert.equal(byId.get('sp_0175')?.researchDebtStatus, 'catalog_label_disambiguation_required');
assert.ok((byId.get('sp_0175')?.researchDebtReopenRequirement || '').includes('exact trade/lineage'));

for (const id of ['sp_0271', 'sp_0376', 'sp_0399']) {
  assert.equal(byId.get(id)?.migrationPath, 'identity_only_after_exact_evidence');
  assert.equal(byId.get(id)?.researchDebtStatus, 'exact_object_evidence_not_found');
  assert.equal(byId.get(id)?.researchDebtReviewedAt, '2026-10-18');
  assert.ok((byId.get(id)?.nonQualifyingReferenceCount || 0) > 0);
  assert.ok((byId.get(id)?.researchDebtReopenRequirement || '').length > 0);
}
assert.equal(byId.get('sp_0241')?.migrationPath, 'partial_inheritance_review');
assert.equal(byId.get('sp_0241')?.morphologyRisk, true);
assert.equal(byId.get('sp_0241')?.readyBaseCandidateCount, 1);
assert.equal(byId.get('sp_0415')?.migrationPath, 'partial_inheritance_review');
assert.equal(byId.get('sp_0415')?.morphologyRisk, true);
assert.equal(byId.get('sp_0158')?.migrationBucket, 'catalog_structure_correction_required');
assert.equal(byId.get('sp_0158')?.migrationPath, 'catalog_structure_correction');
assert.equal(byId.get('sp_0158')?.blankVariantSuffix, true);
assert.equal(byId.get('sp_0158')?.readyBaseCandidateCount, 1);
assert.equal(byId.get('sp_0142')?.migrationPath, 'catalog_structure_correction');
assert.equal(byId.get('sp_0142')?.morphologyRisk, true, 'reviewed Balloon lineage hint must trigger morphology-risk routing even when the legacy catalog name/scientificName misses the English morphology token');
assert.equal(byId.get('sp_0021')?.migrationPath, 'hybrid_object_specific_hold');
assert.equal(byId.get('sp_0021')?.identityEvidenceStatus, 'reviewed_identity_hold_present');
assert.equal(byId.get('sp_0110')?.researchDisposition, 'terminal_unknown_hold');

console.log(
  `Compatibility identity migration audit PASS: ${report.activeIdentityBoundaries} active catalog boundaries reconcile to ${report.identityUnknownPairs} unresolved-identity fish pairs; 0 are auto-migrated and all remain species-level fail-closed work.`,
);

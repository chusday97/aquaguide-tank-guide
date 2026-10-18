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
  rows: Array<{
    speciesId: string;
    scientificName: string;
    boundaryCode: string;
    migrationBucket: string;
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
assert.equal(report.identityUnknownPairsWithoutActiveBoundary, 0);
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
  assert.equal(row.genericOnboardingReady, false, `${row.speciesId} active identity boundary cannot be generic-ready`);
  assert.equal(coverageById.get(row.speciesId)?.genericOnboardingReady, false);
  assert.equal(row.canonicalIdentityPresent, false, `${row.speciesId} cannot be canonical-ready while an active boundary exists`);
  assert.equal(getCatalogCanonicalIdentity(row.speciesId), undefined);
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

console.log(
  `Compatibility identity migration audit PASS: ${report.activeIdentityBoundaries} active catalog boundaries reconcile to ${report.identityUnknownPairs} unresolved-identity fish pairs; 0 are auto-migrated and all remain species-level fail-closed work.`,
);

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  careSeoHostedAcceptanceEvidenceSchema,
  careSeoReleaseDecisionSchema,
} from '../packages/contracts/src/index';
import {
  careSeoSnapshotSha256,
  evaluateCareSeoReleaseReadiness,
} from './care-seo-release-readiness';

const snapshotRaw = await readFile('content/care-seo/staging-snapshot.json', 'utf8');
const snapshot = JSON.parse(snapshotRaw);
const snapshotSha256 = careSeoSnapshotSha256(snapshotRaw);
const acceptance = careSeoHostedAcceptanceEvidenceSchema.parse({
  schemaVersion: 1,
  environment: 'staging',
  snapshotSha256,
  snapshotGitSha: '1'.repeat(40),
  acceptedAt: '2026-09-05T10:00:00.000Z',
  deployment: {
    provider: 'vercel',
    deploymentId: 'dpl_contract_acceptance',
    deploymentUrl: 'https://preview.aquaguide.test',
    canonicalBaseUrl: 'https://branch.aquaguide.test',
  },  verification: {
    pagesChecked: snapshot.records.length,
    bilingualPairsChecked: new Set(snapshot.records.map((record: any) => record.projection.sourceCareCatalogKey)).size,
    http200: true,
    metadataMatched: true,
    canonicalHreflangMatched: true,
    sourceVersionMatched: true,
    noindexRetained: true,
    hygienePassed: true,
  },
});

let result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance, decision: null });
assert.equal(result.readyForProductionIndex, false);
assert.deepEqual(result.blockers, ['explicit_human_release_decision_required']);

const hold = careSeoReleaseDecisionSchema.parse({
  schemaVersion: 1,
  targetEnvironment: 'production',
  decision: 'hold_noindex',
  decidedAt: '2026-09-05T10:05:00.000Z',
  decidedBy: 'repo-admin',
  snapshotSha256,
  acceptanceDeploymentId: acceptance.deployment.deploymentId,
  rationale: 'Keep the accepted Staging pages non-indexable.',
});result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance, decision: hold });
assert.equal(result.readyForProductionIndex, false);
assert.deepEqual(result.blockers, ['release_decision_hold']);

const approve = careSeoReleaseDecisionSchema.parse({
  ...hold,
  decision: 'approve_index_release',
  rationale: 'Explicit contract-only approval fixture.',
});
result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance, decision: approve });
assert.equal(result.readyForProductionIndex, true);
assert.deepEqual(result.blockers, []);

const mismatchedAcceptance = { ...acceptance, snapshotSha256: '2'.repeat(64) };
result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance: mismatchedAcceptance, decision: approve });
assert.equal(result.readyForProductionIndex, false);
assert.ok(result.blockers.includes('acceptance_snapshot_hash_mismatch'));

const mismatchedDecision = { ...approve, acceptanceDeploymentId: 'dpl_other_acceptance' };
result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance, decision: mismatchedDecision });
assert.equal(result.readyForProductionIndex, false);
assert.ok(result.blockers.includes('release_decision_acceptance_mismatch'));

const forgedSnapshot = structuredClone(snapshot);
forgedSnapshot.records[0].editorial.indexStrategy = 'index';
const forgedRaw = `${JSON.stringify(forgedSnapshot, null, 2)}\n`;
result = evaluateCareSeoReleaseReadiness({ snapshotRaw: forgedRaw, acceptance: null, decision: null });
assert.equal(result.readyForProductionIndex, false);
assert.ok(result.blockers.includes('staging_record_not_noindex'));
const persistedAcceptance = careSeoHostedAcceptanceEvidenceSchema.parse(JSON.parse(await readFile('content/care-seo/staging-acceptance.json', 'utf8')));
const persistedDecision = careSeoReleaseDecisionSchema.parse(JSON.parse(await readFile('content/care-seo/release-decision.json', 'utf8')));
result = evaluateCareSeoReleaseReadiness({ snapshotRaw, acceptance: persistedAcceptance, decision: persistedDecision });
assert.equal(result.readyForProductionIndex, false);
assert.equal(result.decision, 'hold_noindex');
if (persistedAcceptance.snapshotSha256 === snapshotSha256 && persistedDecision.snapshotSha256 === snapshotSha256) {
  assert.deepEqual(result.blockers, ['release_decision_hold']);
} else {
  assert.ok(result.blockers.includes('acceptance_snapshot_hash_mismatch'));
  assert.ok(result.blockers.includes('release_decision_snapshot_mismatch'));
  assert.ok(result.blockers.includes('release_decision_hold'));
}

console.log('Care SEO release readiness: acceptance evidence + explicit human decision + noindex staging lock PASS');

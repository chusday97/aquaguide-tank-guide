import assert from 'node:assert/strict';
import {
  MIGRATION,
  START,
  TARGET,
  buildPatchBundleSql,
  validateLocalPatch,
} from './compatibility-materialized-authority-production-reconciliation-guard.mjs';

assert.equal(MIGRATION, '20261021142700_compatibility_materialized_authority_reconciliation.sql');
assert.deepEqual(START, { migrationCount: 73, latestVersion: '20261020193000', profiles: 131, pairRules: 21, stageRisks: 1, evidence: 279 });
assert.deepEqual(TARGET, { migrationCount: 74, latestVersion: '20261021142700', profiles: 137, pairRules: 21, stageRisks: 1, evidence: 281 });
const local = validateLocalPatch();
assert.match(local.fingerprint, /^[0-9a-f]{64}$/);
const rollback = buildPatchBundleSql({ finalize: 'rollback' });
assert.ok(rollback.startsWith('begin;'));
assert.ok(rollback.trimEnd().endsWith('rollback;'));
assert.ok(rollback.includes('profile baseline drift'));
assert.ok(rollback.includes('evidence baseline drift'));
assert.ok(rollback.includes('POSTCHECK: profile count mismatch'));
assert.ok(rollback.includes('POSTCHECK: evidence count mismatch'));
assert.ok(!/(?:insert\s+into|update|delete\s+from)\s+public\.(species_pair_compatibility_rules|species_compatibility_profile_stage_risks|content_publications|care_articles|species_feeding_profiles)\b/i.test(local.sql));
console.log('Compatibility materialized-authority Production reconciliation guard PASS: 73/131/279 -> 74/137/281 is fail-closed and rollback-simulatable.');

import assert from 'node:assert/strict';
import {
  CONFIRM_TOKEN, MIGRATION, START, TARGET, buildPatchBundleSql, validateLivePreflight, validateLocalPatch,
} from './compatibility-chrysiptera-production-reconciliation-guard.mjs';

assert.equal(MIGRATION, '20261016184500_compatibility_chrysiptera_cyanea_authority_reconciliation.sql');
assert.equal(CONFIRM_TOKEN, 'EXECUTE_CHRYSIPTERA_CYANEA_AUTHORITY_RECONCILIATION_20261016');
assert.deepEqual(START, { migrationCount: 70, latestVersion: '20261015211500', profiles: 109, pairRules: 21, stageRisks: 1, evidence: 200 });
assert.deepEqual(TARGET, { migrationCount: 71, latestVersion: '20261016184500', profiles: 109, pairRules: 21, stageRisks: 1, evidence: 202 });
const { sql, fingerprint } = validateLocalPatch();
assert.match(fingerprint, /^[a-f0-9]{64}$/);
assert.match(sql, /version = p\.version \+ 1/);
assert.doesNotMatch(sql, /update\s+public\.content_publications/i);
const rollback = buildPatchBundleSql({ finalize: 'rollback' });
assert.ok(rollback.startsWith('begin;'));
assert.match(rollback, /rollback;\s*$/);
assert.equal((rollback.match(/^begin;$/gim) || []).length, 1);
assert.equal((rollback.match(/^commit;$/gim) || []).length, 0);
assert.match(rollback, /supabase_migrations\.schema_migrations/);
const commit = buildPatchBundleSql({ finalize: 'commit' });
assert.match(commit, /commit;\s*$/);
assert.equal((commit.match(/^commit;$/gim) || []).length, 1);
const baseline = { migration_count: 70, latest_version: '20261015211500', species: 486, feeding: 486, care: 41, care_steps: 128, content_publications: 527, profiles: 109, pair_rules: 21, stage_risks: 1, evidence: 200 };
assert.doesNotThrow(() => validateLivePreflight(baseline));
assert.throws(() => validateLivePreflight({ ...baseline, evidence: 201 }), /preflight drift/);
assert.throws(() => validateLivePreflight({ ...baseline, migration_count: 71 }), /preflight drift/);
console.log('Compatibility Chrysiptera Production reconciliation guard PASS: frozen 70/109/200 baseline -> guarded 71/109/202 target; immutable Product publication remains untouched.');

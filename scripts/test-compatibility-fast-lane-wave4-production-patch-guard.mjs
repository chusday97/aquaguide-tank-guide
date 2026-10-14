import assert from 'node:assert/strict';
import {
  CONFIRM_TOKEN,
  EXPECTED_MIGRATION_SHA256,
  MIGRATION,
  START,
  TARGET,
  buildPatchBundleSql,
  validateLocalPatch,
  validateLivePreflight,
} from './compatibility-fast-lane-wave4-production-patch-guard.mjs';

assert.equal(MIGRATION, '20261014163500_compatibility_fast_lane_wave4_authority_patch.sql');
assert.equal(CONFIRM_TOKEN, 'EXECUTE_COMPATIBILITY_FAST_LANE_WAVE4_PATCH_20261014');
assert.deepEqual(START, {
  migrationCount: 68,
  latestVersion: '20261014152500',
  profiles: 101,
  pairRules: 21,
  stageRisks: 1,
  evidence: 184,
});
assert.deepEqual(TARGET, {
  migrationCount: 69,
  latestVersion: '20261014163500',
  profiles: 101,
  pairRules: 21,
  stageRisks: 1,
  evidence: 189,
});

const local = validateLocalPatch();
assert.equal(local.fingerprint, EXPECTED_MIGRATION_SHA256);

const rollback = buildPatchBundleSql({ finalize: 'rollback' });
assert.ok(rollback.startsWith('begin;'));
assert.match(rollback, /20261014163500_compatibility_fast_lane_wave4_authority_patch\.sql/);
assert.match(rollback, /supabase_migrations\.schema_migrations/);
assert.match(rollback, /rollback;\s*$/);
assert.equal((rollback.match(/^begin;$/gim) || []).length, 1);
assert.equal((rollback.match(/^commit;$/gim) || []).length, 0);

const commit = buildPatchBundleSql({ finalize: 'commit' });
assert.match(commit, /commit;\s*$/);
assert.equal((commit.match(/^commit;$/gim) || []).length, 1);

const baseline = {
  migration_count: 68,
  latest_version: '20261014152500',
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  profiles: 101,
  pair_rules: 21,
  stage_risks: 1,
  evidence: 184,
};
assert.doesNotThrow(() => validateLivePreflight(baseline));
assert.throws(() => validateLivePreflight({ ...baseline, evidence: 185 }), /preflight drift/);
assert.throws(() => validateLivePreflight({ ...baseline, migration_count: 69 }), /preflight drift/);

console.log('Compatibility Fast Lane wave4 Production guard PASS: frozen 68/101/184 baseline -> guarded 69/101/189 target; no Production mutation performed.');

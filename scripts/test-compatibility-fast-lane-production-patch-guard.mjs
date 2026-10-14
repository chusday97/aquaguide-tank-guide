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
} from './compatibility-fast-lane-production-patch-guard.mjs';

assert.equal(MIGRATION, '20261014133500_compatibility_fast_lane_authority_patch.sql');
assert.equal(CONFIRM_TOKEN, 'EXECUTE_COMPATIBILITY_FAST_LANE_PATCH_20261014');
assert.equal(START.migrationCount, 65);
assert.equal(START.latestVersion, '20261013153000');
assert.equal(START.profiles, 101);
assert.equal(START.evidence, 177);
assert.equal(TARGET.migrationCount, 66);
assert.equal(TARGET.latestVersion, '20261014133500');
assert.equal(TARGET.profiles, 101);
assert.equal(TARGET.evidence, 180);

const local = validateLocalPatch();
assert.equal(local.fingerprint, EXPECTED_MIGRATION_SHA256);

const rollback = buildPatchBundleSql({ finalize: 'rollback' });
assert.ok(rollback.startsWith('begin;'));
assert.match(rollback, /20261014133500_compatibility_fast_lane_authority_patch\.sql/);
assert.match(rollback, /supabase_migrations\.schema_migrations/);
assert.match(rollback, /rollback;\s*$/);
assert.equal((rollback.match(/^begin;$/gim) || []).length, 1);
assert.equal((rollback.match(/^commit;$/gim) || []).length, 0);

const commit = buildPatchBundleSql({ finalize: 'commit' });
assert.match(commit, /commit;\s*$/);
assert.equal((commit.match(/^commit;$/gim) || []).length, 1);

assert.doesNotThrow(() => validateLivePreflight({
  migration_count: 65,
  latest_version: '20261013153000',
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  profiles: 101,
  pair_rules: 21,
  stage_risks: 1,
  evidence: 177,
}));
assert.throws(() => validateLivePreflight({
  migration_count: 65,
  latest_version: '20261013153000',
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  profiles: 101,
  pair_rules: 21,
  stage_risks: 1,
  evidence: 178,
}), /preflight drift/);

console.log('Compatibility Fast Lane Production patch guard PASS: 65/101/177 baseline -> guarded atomic 66/101/180 target with rollback simulation support.');

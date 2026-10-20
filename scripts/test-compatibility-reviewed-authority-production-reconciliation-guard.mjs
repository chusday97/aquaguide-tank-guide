import assert from 'node:assert/strict';
import {
  CONFIRM_TOKEN,
  MIGRATION,
  START,
  TARGET,
  buildPatchBundleSql,
  validateLivePreflight,
  validateLocalPatch,
} from './compatibility-reviewed-authority-production-reconciliation-guard.mjs';

assert.equal(MIGRATION, '20261020193000_compatibility_reviewed_authority_reconciliation.sql');
assert.equal(CONFIRM_TOKEN, 'EXECUTE_COMPATIBILITY_REVIEWED_AUTHORITY_RECONCILIATION_20261020');
assert.deepEqual(START, { migrationCount: 72, latestVersion: '20261017081435', profiles: 109, pairRules: 21, stageRisks: 1, evidence: 202 });
assert.deepEqual(TARGET, { migrationCount: 73, latestVersion: '20261020193000', profiles: 131, pairRules: 21, stageRisks: 1, evidence: 279 });

const { sql, fingerprint } = validateLocalPatch();
assert.match(fingerprint, /^[a-f0-9]{64}$/);
assert.match(sql, /expected 131 reviewed Compatibility profiles/);
assert.match(sql, /expected 279 reviewed evidence sources/);
assert.match(sql, /version=p\.version\+1/);
assert.match(sql, /version=e\.version\+1/);
assert.doesNotMatch(sql, /stocking_guidance\s*=/i);
assert.doesNotMatch(sql, /(?:insert\s+into|update|delete\s+from)\s+public\.species_pair_compatibility_rules/i);
assert.doesNotMatch(sql, /(?:insert\s+into|update|delete\s+from)\s+public\.species_compatibility_profile_stage_risks/i);
assert.doesNotMatch(sql, /(?:insert\s+into|update|delete\s+from)\s+public\.content_publications/i);

const rollback = buildPatchBundleSql({ finalize: 'rollback' });
assert.ok(rollback.startsWith('begin;'));
assert.match(rollback, /rollback;\s*$/);
assert.equal((rollback.match(/^begin;$/gim) || []).length, 1);
assert.equal((rollback.match(/^commit;$/gim) || []).length, 0);
assert.match(rollback, /supabase_migrations\.schema_migrations/);

const commit = buildPatchBundleSql({ finalize: 'commit' });
assert.match(commit, /commit;\s*$/);
assert.equal((commit.match(/^commit;$/gim) || []).length, 1);

const baseline = {
  migration_count: 72,
  latest_version: '20261017081435',
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  profiles: 109,
  pair_rules: 21,
  stage_risks: 1,
  evidence: 202,
};
assert.doesNotThrow(() => validateLivePreflight(baseline));
assert.throws(() => validateLivePreflight({ ...baseline, profiles: 110 }), /preflight drift/);
assert.throws(() => validateLivePreflight({ ...baseline, evidence: 203 }), /preflight drift/);
assert.throws(() => validateLivePreflight({ ...baseline, migration_count: 73 }), /preflight drift/);

console.log('Compatibility reviewed-authority Production reconciliation guard PASS: frozen 72/109/202 baseline -> guarded 73/131/279 target; pair/stage/Product-Care writes denied.');

import assert from 'node:assert/strict';
import {
  MIGRATIONS,
  PREREQUISITE_MIGRATIONS,
  COMPATIBILITY_MIGRATIONS,
  HELD_MIGRATION,
  EXPECTED_CHAIN_FINGERPRINT,
  PRODUCTION_PROJECT_REF,
  START_MIGRATION_COUNT,
  START_LATEST_VERSION,
  START_REVIEWED_PROFILES,
  START_REVIEWED_EVIDENCE,
  TARGET_MIGRATION_COUNT,
  TARGET_LATEST_VERSION,
  TARGET_REVIEWED_PROFILES,
  TARGET_REVIEWED_EVIDENCE,
  calculateChainFingerprint,
  validateLocalChain,
  buildBundleSql,
  validateLivePreflight,
  getAuthorityKeys,
  validateProductionCodeCompatibility,
} from './compatibility-production-migration-guard.mjs';

assert.equal(PRODUCTION_PROJECT_REF, 'ydiygvhuqpogmqlcvgob');
assert.equal(START_MIGRATION_COUNT, 60);
assert.equal(START_LATEST_VERSION, '20261011213000');
assert.equal(START_REVIEWED_PROFILES, 63);
assert.equal(START_REVIEWED_EVIDENCE, 116);
assert.equal(TARGET_MIGRATION_COUNT, 65);
assert.equal(TARGET_LATEST_VERSION, '20261013153000');
assert.equal(TARGET_REVIEWED_PROFILES, 101);
assert.equal(TARGET_REVIEWED_EVIDENCE, 177);
assert.equal(PREREQUISITE_MIGRATIONS.length, 0);
assert.equal(COMPATIBILITY_MIGRATIONS.length, 5);
assert.deepEqual(MIGRATIONS, [
  '20261011234500_compatibility_unified_next25_authority.sql',
  '20261012001500_compatibility_unified_wave04_authority.sql',
  '20261012014500_compatibility_unified_wave05_authority.sql',
  '20261012023000_compatibility_unified_wave06_authority.sql',
  '20261013153000_compatibility_unified_wave16_authority.sql',
]);
assert.ok(!MIGRATIONS.includes(HELD_MIGRATION));

assert.equal(calculateChainFingerprint(), EXPECTED_CHAIN_FINGERPRINT);
const local = validateLocalChain();
assert.deepEqual(
  [local.authority.profiles.length, local.authority.pairRules.length, local.authority.stageRisks.length],
  [101, 21, 1],
);
assert.deepEqual(getAuthorityKeys().stageRisks, ['sp_0436:conspecific_fry_predation']);

const productionCode = validateProductionCodeCompatibility();
assert.equal(productionCode.releaseBranch, 'origin/release/production');
assert.equal(typeof productionCode.runtimeCompatible, 'boolean');
assert.ok(Array.isArray(productionCode.changedFiles));
assert.equal(typeof productionCode.loaderCompatible, 'boolean');

const bundle = buildBundleSql();
const rollbackBundle = buildBundleSql({ finalize: 'rollback' });
assert.equal((bundle.match(/^begin;$/gmi) || []).length, 1);
assert.equal((bundle.match(/^commit;$/gmi) || []).length, 1);
assert.equal((rollbackBundle.match(/^rollback;$/gmi) || []).length, 1);
assert.equal((rollbackBundle.match(/^commit;$/gmi) || []).length, 0);
for (const name of MIGRATIONS) assert.ok(bundle.includes('BEGIN GUARDED MIGRATION ' + name));
assert.ok(bundle.includes('ABORT: reviewed profile baseline drift'));
assert.ok(bundle.includes('POSTCHECK: reviewed profile key set mismatch'));
assert.ok(bundle.includes('POSTCHECK: reviewed evidence count mismatch'));
assert.ok(bundle.includes('POSTCHECK: migration history count mismatch'));
assert.ok(!bundle.includes(HELD_MIGRATION));

const good = {
  migration_count: 60,
  latest_version: '20261011213000',
  content_publications_exists: true,
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  profiles: 63,
  pair_rules: 21,
  evidence: 116,
  stage_risks: 1,
  authority_state_exists: true,
  stage_risks_exists: true,
};
assert.doesNotThrow(() => validateLivePreflight(good));
assert.throws(() => validateLivePreflight({ ...good, migration_count: 61 }), /Production preflight drift/);
assert.throws(() => validateLivePreflight({ ...good, profiles: 64 }), /Production preflight drift/);
assert.throws(() => validateLivePreflight({ ...good, evidence: 117 }), /Production preflight drift/);

console.log('Compatibility Production migration guard verified: exact 60→65 migration state, 63→101 Profiles, 116→177 evidence, atomic five-migration rollback/commit bundle.');

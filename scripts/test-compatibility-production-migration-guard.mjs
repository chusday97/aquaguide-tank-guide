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
assert.equal(START_MIGRATION_COUNT, 55);
assert.equal(START_LATEST_VERSION, '20261011020543');
assert.equal(TARGET_MIGRATION_COUNT, 59);
assert.equal(TARGET_LATEST_VERSION, '20261011170000');
assert.equal(PREREQUISITE_MIGRATIONS.length, 0);
assert.equal(COMPATIBILITY_MIGRATIONS.length, 4);
assert.deepEqual(MIGRATIONS, [
  '20261011111500_compatibility_chindongo_socolofi_authority.sql',
  '20261011124500_compatibility_opsariichthys_bidens_authority.sql',
  '20261011162500_compatibility_pseudorasbora_parva_authority.sql',
  '20261011170000_compatibility_next_wave_freshwater_batch_authority.sql',
]);
assert.ok(!MIGRATIONS.includes(HELD_MIGRATION));

assert.equal(calculateChainFingerprint(), EXPECTED_CHAIN_FINGERPRINT);
const local = validateLocalChain();
assert.deepEqual(
  [local.authority.profiles.length, local.authority.pairRules.length, local.authority.stageRisks.length],
  [52, 21, 1],
);
assert.equal(TARGET_REVIEWED_PROFILES, 52);
assert.equal(TARGET_REVIEWED_EVIDENCE, 98);
assert.deepEqual(getAuthorityKeys().stageRisks, ['sp_0436:conspecific_fry_predation']);

const productionCode = validateProductionCodeCompatibility();
assert.equal(productionCode.runtimeCompatible, false, 'current release/production must be recognized as behind main Compatibility authority');
assert.ok(productionCode.changedFiles.includes('src/data/compatibilityEvidence.ts'));

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
  migration_count: 55,
  latest_version: '20261011020543',
  content_publications_exists: true,
  species: 486,
  feeding: 486,
  care: 41,
  care_steps: 128,
  content_publications: 527,
  profiles: 42,
  pair_rules: 21,
  evidence: 77,
  stage_risks: 1,
  authority_state_exists: true,
  stage_risks_exists: true,
};
assert.doesNotThrow(() => validateLivePreflight(good));
assert.throws(() => validateLivePreflight({ ...good, migration_count: 56 }), /Production preflight drift/);
assert.throws(() => validateLivePreflight({ ...good, profiles: 43 }), /Production preflight drift/);
assert.throws(() => validateLivePreflight({ ...good, evidence: 78 }), /Production preflight drift/);

console.log('Compatibility Production incremental migration guard verified: exact 55→59 migration state, 42→52 Profiles, atomic 4-file rollback/commit bundle, runtime-alignment commit blocker.');

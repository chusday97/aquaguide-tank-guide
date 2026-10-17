import assert from 'node:assert/strict';
import {
  EXPECTED_MIGRATION_SHA256,
  MIGRATION,
  REQUIRED_ORDER,
  buildLivePreflightSql,
  validateLivePreflight,
  validateLocalMigration,
} from './aquarium-water-parameters-production-guard.mjs';

assert.equal(MIGRATION, '20261017160000_aquarium_water_parameters.sql');
assert.equal(EXPECTED_MIGRATION_SHA256, 'dd6808b313ac3b1889238a8810926cb3d243953bef61532daf83bd599f76e8ef');
assert.deepEqual(REQUIRED_ORDER, [
  'apply_database_migration',
  'verify_columns_and_constraints',
  'deploy_runtime_that_reads_ph_and_hardness_dgh',
]);

const local = validateLocalMigration();
assert.equal(local.fingerprint, EXPECTED_MIGRATION_SHA256);

const sql = buildLivePreflightSql();
assert.match(sql, /information_schema\.columns/);
assert.match(sql, /column_name='ph'/);
assert.match(sql, /column_name='hardness_dgh'/);
assert.match(sql, /aquariums_ph_range_check/);
assert.match(sql, /aquariums_hardness_dgh_range_check/);
assert.match(sql, /20261017160000/);

const notReady = validateLivePreflight({
  ph_exists: false,
  hardness_dgh_exists: false,
  ph_constraint_exists: false,
  hardness_constraint_exists: false,
  migration_recorded: false,
});
assert.equal(notReady.readyForRuntimeDeploy, false);
assert.equal(notReady.phase, 'MIGRATION_REQUIRED');
assert.ok(notReady.blockers.includes('missing_ph_column'));

const ready = validateLivePreflight({
  ph_exists: true,
  hardness_dgh_exists: true,
  ph_constraint_exists: true,
  hardness_constraint_exists: true,
  migration_recorded: true,
});
assert.equal(ready.readyForRuntimeDeploy, true);
assert.equal(ready.phase, 'MIGRATION_READY');
assert.deepEqual(ready.blockers, []);

console.log('Aquarium water-parameter Production guard PASS: migration fingerprint is frozen and runtime deployment is blocked until pH/GH columns, constraints, and migration history are verified.');

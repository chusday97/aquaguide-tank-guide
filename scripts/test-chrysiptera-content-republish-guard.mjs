import assert from 'node:assert/strict';
import {
  CONFIRM_TOKEN,
  SOURCE_ID,
  START,
  TARGET,
  buildRepublishSql,
} from './chrysiptera-content-republish-guard.mjs';

assert.equal(CONFIRM_TOKEN, 'EXECUTE_CHRYSIPTERA_CYANEA_CONTENT_REPUBLISH_20261016');
assert.equal(SOURCE_ID, 'a156f685-3dc9-439f-90ce-9d74eb4a9b60');
assert.deepEqual(START, { migrationCount: 71, latestVersion: '20261016184500', profiles: 109, evidence: 202, contentPublications: 527, sourceVersion: 1, publicationVersion: 1 });
assert.deepEqual(TARGET, { migrationCount: 71, latestVersion: '20261016184500', profiles: 109, evidence: 202, contentPublications: 527, sourceVersion: 3, publicationVersion: 3 });
const rollback = buildRepublishSql({ finalize: 'rollback' });
assert.ok(rollback.startsWith('begin;'));
assert.match(rollback, /publish_content_snapshot\('species'/);
assert.match(rollback, /status='draft'/);
assert.match(rollback, /water_temperature_min_c=22/);
assert.match(rollback, /water_temperature_max_c=26/);
assert.match(rollback, /ph_min=8\.2/);
assert.match(rollback, /min_tank_liters=200/);
assert.match(rollback, /jsonb_array_length\(v_compatibility->'citations'\) <> 4/);
assert.match(rollback, /source_version=3/);
assert.doesNotMatch(rollback, /update\s+public\.content_publications/i);
assert.doesNotMatch(rollback, /delete\s+from\s+public\.content_publications/i);
assert.match(rollback, /rollback;\s*$/);
const commit = buildRepublishSql({ finalize: 'commit' });
assert.match(commit, /commit;\s*$/);
assert.throws(() => buildRepublishSql({ finalize: 'invalid' }), /Unsupported finalizer/);
console.log('Chrysiptera content republish guard PASS: existing publish RPC is used for v1 -> draft v2 -> published v3, reviewed 22-26C / pH 8.2-8.4 / 200L and four Compatibility citations are preserved without direct publication mutation.');

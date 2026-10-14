import assert from 'node:assert/strict';
import {
  CORE_USER_STATE_RPC_REQUIREMENTS,
  CORE_USER_STATE_TABLE_REQUIREMENTS,
  evaluateCoreUserStateParity,
} from './core-user-state-production-parity-lib.mjs';

const tables = CORE_USER_STATE_TABLE_REQUIREMENTS.map(([name, policies]) => ({
  name,
  rls_enabled: true,
  policies: [...policies],
}));
const rpcs = CORE_USER_STATE_RPC_REQUIREMENTS.map(item => ({
  ...item,
  authenticated_execute: true,
  anon_execute: false,
  security_definer: false,
}));

let result = evaluateCoreUserStateParity({ tables, rpcs });
assert.equal(result.phase, 'READY_CORE_USER_STATE_PARITY');
assert.equal(result.verified, true);
assert.deepEqual(result.blockers, []);
assert.equal(result.expected.tables, 17);
assert.equal(result.expected.rpcs, 6);

result = evaluateCoreUserStateParity({
  tables: tables.map(row => row.name === 'aquariums' ? { ...row, rls_enabled: false } : row),
  rpcs,
});
assert.ok(result.blockers.includes('rls_disabled:aquariums'));

result = evaluateCoreUserStateParity({
  tables: tables.map(row => row.name === 'aquarium_share_reports'
    ? { ...row, policies: ['aquarium_share_reports_owner_select', 'aquarium_share_reports_owner_update'] }
    : row),
  rpcs,
});
assert.ok(result.blockers.some(item => item.startsWith('policy_mismatch:aquarium_share_reports:')));

result = evaluateCoreUserStateParity({
  tables,
  rpcs: rpcs.map(row => row.name === 'add_aquarium_livestock' ? { ...row, anon_execute: true } : row),
});
assert.ok(result.blockers.includes('rpc_anon_execute_exposed:add_aquarium_livestock'));

result = evaluateCoreUserStateParity({
  tables,
  rpcs: rpcs.filter(row => row.name !== 'record_livestock_memorial'),
});
assert.ok(result.blockers.includes('rpc_missing_or_signature_drift:record_livestock_memorial'));

console.log('core user-state Production parity contract PASS: exact RLS policy sets and six runtime RPC permission/signature boundaries fail closed.');

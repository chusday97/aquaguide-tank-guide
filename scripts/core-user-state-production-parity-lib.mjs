export const CORE_USER_STATE_TABLE_REQUIREMENTS = [
  ['profiles', ['profiles_delete_own', 'profiles_insert_own', 'profiles_select_own', 'profiles_update_own']],
  ['user_roles', ['user_roles_admin_delete', 'user_roles_admin_insert', 'user_roles_admin_update', 'user_roles_select_own']],
  ['aquariums', ['aquariums_owner_all']],
  ['aquarium_species', ['aquarium_species_owner_all']],
  ['aquarium_species_batches', ['aquarium_species_batches_owner_all']],
  ['aquarium_equipment', ['aquarium_equipment_owner_all']],
  ['aquarium_components', ['aquarium_components_owner_all']],
  ['diagnosis_records', ['diagnosis_owner_all']],
  ['species_favorites', ['species_favorites_owner_all']],
  ['care_favorites', ['care_favorites_owner_all']],
  ['memorial_records', ['memorial_owner_all']],
  ['care_reminders', ['care_reminders_owner_all']],
  ['care_events', ['care_events_owner_all']],
  ['care_checklist_progress', ['care_checklist_progress_owner_all']],
  ['aquarium_share_reports', ['aquarium_share_reports_owner_select']],
  ['migration_batches', ['migration_batches_owner_all']],
  ['idempotency_records', ['idempotency_records_owner_all']],
];

export const CORE_USER_STATE_RPC_REQUIREMENTS = [
  {
    name: 'add_aquarium_livestock',
    args: 'target_aquarium_id uuid, target_species_catalog_key text, target_quantity integer, target_entry_date date, target_last_water_change_at timestamp with time zone, target_life_stage aquarium_life_stage, target_reproductive_state aquarium_reproductive_state, new_species_record_id uuid, new_batch_id uuid, operation_key text, operation_request_hash text',
  },
  {
    name: 'complete_care_reminder_with_recurrence',
    args: 'reminder_id uuid, expected_version integer, completion_time timestamp with time zone, next_reminder_id uuid, operation_key text, operation_request_hash text',
  },
  {
    name: 'merge_aquarium_species_batches',
    args: 'expected_species_record_id uuid, target_batch_id uuid, source_batch_id uuid, final_entry_date date, final_life_stage aquarium_life_stage, final_reproductive_state aquarium_reproductive_state, target_version integer, source_version integer',
  },
  {
    name: 'record_livestock_memorial',
    args: 'target_aquarium_id uuid, target_species_record_id uuid, target_batch_id uuid, target_batch_version integer, target_memorial_date date, target_cause_codes text[], target_observation text, target_reason text, target_improvement text, new_memorial_id uuid',
  },
  {
    name: 'remove_aquarium_species_batch_quantity',
    args: 'expected_aquarium_id uuid, expected_species_record_id uuid, target_batch_id uuid, removal_quantity integer, operation_key text, operation_request_hash text',
  },
  {
    name: 'split_aquarium_species_batch',
    args: 'source_batch_id uuid, expected_species_record_id uuid, source_version integer, split_quantity integer, split_entry_date date, split_life_stage aquarium_life_stage, split_reproductive_state aquarium_reproductive_state, new_batch_id uuid',
  },
];

const sameStrings = (actual, expected) => {
  const a = [...actual].sort();
  const e = [...expected].sort();
  return a.length === e.length && a.every((value, index) => value === e[index]);
};

export const evaluateCoreUserStateParity = ({ tables, rpcs }) => {
  const blockers = [];
  const tableMap = new Map((tables || []).map(row => [row.name, row]));
  for (const [name, policies] of CORE_USER_STATE_TABLE_REQUIREMENTS) {
    const row = tableMap.get(name);
    if (!row) {
      blockers.push(`table_missing:${name}`);
      continue;
    }
    if (row.rls_enabled !== true) blockers.push(`rls_disabled:${name}`);
    const actualPolicies = Array.isArray(row.policies) ? row.policies : [];
    if (!sameStrings(actualPolicies, policies)) {
      blockers.push(`policy_mismatch:${name}:${actualPolicies.join(',') || 'none'}`);
    }
  }

  const rpcMap = new Map((rpcs || []).map(row => [`${row.name}(${row.args})`, row]));
  for (const requirement of CORE_USER_STATE_RPC_REQUIREMENTS) {
    const key = `${requirement.name}(${requirement.args})`;
    const row = rpcMap.get(key);
    if (!row) {
      blockers.push(`rpc_missing_or_signature_drift:${requirement.name}`);
      continue;
    }
    if (row.authenticated_execute !== true) blockers.push(`rpc_authenticated_execute_missing:${requirement.name}`);
    if (row.anon_execute !== false) blockers.push(`rpc_anon_execute_exposed:${requirement.name}`);
    if (row.security_definer !== false) blockers.push(`rpc_security_definer_unexpected:${requirement.name}`);
  }

  return {
    phase: blockers.length === 0 ? 'READY_CORE_USER_STATE_PARITY' : 'BLOCKED_CORE_USER_STATE_PARITY',
    verified: blockers.length === 0,
    mutationAuthorized: false,
    blockers,
    expected: {
      tables: CORE_USER_STATE_TABLE_REQUIREMENTS.length,
      rpcs: CORE_USER_STATE_RPC_REQUIREMENTS.length,
    },
    observed: {
      tables: tables?.length || 0,
      rpcs: rpcs?.length || 0,
    },
  };
};

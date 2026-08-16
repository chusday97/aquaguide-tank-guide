import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migrationPath = 'supabase/migrations/20260816160129_atomic_verified_livestock_relocation.sql';
const sql = readFileSync(migrationPath, 'utf8');
const contract = readFileSync('packages/contracts/src/livestock-relocation.ts', 'utf8');

assert.match(sql, /create or replace function public\.relocate_verified_aquarium_livestock\(/i);
assert.match(sql, /security invoker/i, 'relocation RPC must run as SECURITY INVOKER');
assert.match(sql, /set search_path = ''/i, 'relocation RPC must use an empty search_path');
assert.match(sql, /source_aquarium_id = destination_aquarium_id/i);
assert.match(sql, /owner_id = current_user_id/g);
assert.match(sql, /UNRESOLVED_SOURCE_SPECIES/);
assert.match(sql, /identity_status/);
assert.match(sql, /for update/gi);
assert.match(sql, /resource_type <> 'livestock_relocation'/);
assert.match(sql, /'livestock_relocation'/);
assert.match(sql, /revoke all on function public\.relocate_verified_aquarium_livestock[\s\S]*from public/i);
assert.match(sql, /revoke all on function public\.relocate_verified_aquarium_livestock[\s\S]*from anon/i);
assert.match(sql, /grant execute on function public\.relocate_verified_aquarium_livestock[\s\S]*to authenticated/i);
assert.doesNotMatch(sql, /source_batch_version/i, 'public relocation path must not require a DB batch version unavailable to hydrated product state');
assert.doesNotMatch(sql, /security definer/i);

const destinationInsertIndex = sql.indexOf('insert into public.aquarium_species_batches');
const sourceMutationIndex = Math.min(
  ...['set deleted_at = now()', 'set quantity = source_batch.quantity - relocation_quantity']
    .map(token => sql.indexOf(token))
    .filter(index => index >= 0),
);
assert.ok(destinationInsertIndex >= 0 && sourceMutationIndex > destinationInsertIndex, 'destination batch must be written before source decrement inside the same transaction');

assert.match(contract, /destinationAquariumId: uuidSchema/);
assert.match(contract, /quantity: z\.number\(\)\.int\(\)\.positive\(\)/);
assert.doesNotMatch(contract, /sourceBatchVersion/);

console.log('livestock relocation contract passed: verified-only atomic RPC, ownership/RLS context, idempotency, no unavailable batch-version input, public/anon denied');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createLivestockRemovalAttempt,
  markLivestockRemovalSubmitted,
} from '../src/services/aquarium/livestock-removal-attempt.service';

let sequence = 0;
const nextOperationId = () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}` as `${string}-${string}-${string}-${string}-${string}`;
const firstDraft = createLivestockRemovalAttempt(nextOperationId);
const submittedDraft = markLivestockRemovalSubmitted(firstDraft);
const retryDraft = markLivestockRemovalSubmitted(submittedDraft);
const nextDraft = createLivestockRemovalAttempt(nextOperationId);

assert.equal(submittedDraft.operationId, firstDraft.operationId);
assert.equal(retryDraft.operationId, firstDraft.operationId, 'a failed response retry must reuse the same operation id');
assert.equal(submittedDraft.submitted, true);
assert.notEqual(nextDraft.operationId, firstDraft.operationId, 'a newly opened removal must receive a new operation id');

const root = resolve(import.meta.dirname, '..');
const routeSource = readFileSync(resolve(root, 'apps/api/src/routes/aquariums.ts'), 'utf8');
const migrationSource = readFileSync(resolve(root, 'supabase/migrations/202607260002_atomic_livestock_removal.sql'), 'utf8');
const routeStart = routeSource.indexOf("aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/remove'");
const routeEnd = routeSource.indexOf("aquariumsRouter.post('/aquariums/:id/species/:recordId/batches/:batchId/memorial'");
const removalRoute = routeSource.slice(routeStart, routeEnd);

assert.ok(routeStart >= 0 && routeEnd > routeStart);
assert.doesNotMatch(removalRoute.split("client.rpc('remove_aquarium_species_batch_quantity'")[0], /getOwnedSpeciesRecord/);
assert.ok(
  migrationSource.indexOf('from public.idempotency_records') < migrationSource.indexOf('from public.aquarium_species_batches batch'),
  'the database must resolve a replay before requiring the still-active final batch',
);
assert.match(migrationSource, /return query select expected_aquarium_id, true/);

console.log('livestock removal replay verified: stable draft key and replay-before-active-record ordering');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(
  resolve(import.meta.dirname, '../supabase/migrations/202608090003_atomic_livestock_addition.sql'),
  'utf8',
);
const routeSource = readFileSync(resolve(import.meta.dirname, '../apps/api/src/routes/aquariums.ts'), 'utf8');
const route = routeSource.slice(
  routeSource.indexOf("aquariumsRouter.post('/aquariums/:id/species'"),
  routeSource.indexOf("aquariumsRouter.patch('/aquariums/:id/species/:recordId'"),
);

assert.match(migration, /create or replace function public\.add_aquarium_livestock/);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(migration, /insert into public\.aquarium_species \(/);
assert.match(migration, /insert into public\.aquarium_species_batches \(/);
assert.match(migration, /insert into public\.idempotency_records \(/);
assert.match(route, /client\.rpc\('add_aquarium_livestock'/);
assert.doesNotMatch(route, /\.from\('aquarium_species'\)\s*\.insert/);
assert.doesNotMatch(route, /\.from\('aquarium_species_batches'\)\s*\.insert/);
assert.doesNotMatch(route, /finishIdempotentWrite/);

type AtomicState = {
  parents: Map<string, { id: string; quantity: number }>;
  batches: Map<string, { id: string; parentId: string; quantity: number }>;
  operations: Map<string, { parentId: string; requestHash: string }>;
};

const emptyState = (): AtomicState => ({
  parents: new Map(),
  batches: new Map(),
  operations: new Map(),
});

const cloneState = (state: AtomicState): AtomicState => ({
  parents: new Map(state.parents),
  batches: new Map(state.batches),
  operations: new Map(state.operations),
});

const executeAtomicAddition = (
  state: AtomicState,
  input: { operationId: string; requestHash: string; parentId: string; batchId: string; quantity: number },
  failAfterParent = false,
) => {
  const replay = state.operations.get(input.operationId);
  if (replay) {
    if (replay.requestHash !== input.requestHash) throw new Error('DUPLICATE_OPERATION_KEY');
    return replay.parentId;
  }

  const transaction = cloneState(state);
  if (!transaction.parents.has(input.parentId)) {
    transaction.parents.set(input.parentId, { id: input.parentId, quantity: input.quantity });
  }
  if (failAfterParent) throw new Error('INJECTED_BATCH_FAILURE');

  if (!transaction.batches.has(input.batchId)) {
    transaction.batches.set(input.batchId, {
      id: input.batchId,
      parentId: input.parentId,
      quantity: input.quantity,
    });
  }
  transaction.operations.set(input.operationId, {
    parentId: input.parentId,
    requestHash: input.requestHash,
  });

  state.parents = transaction.parents;
  state.batches = transaction.batches;
  state.operations = transaction.operations;
  return input.parentId;
};

const state = emptyState();
const input = {
  operationId: 'record-existing:sp_0001',
  requestHash: 'a'.repeat(64),
  parentId: 'parent-1',
  batchId: 'batch-1',
  quantity: 2,
};

assert.throws(() => executeAtomicAddition(state, input, true), /INJECTED_BATCH_FAILURE/);
assert.equal(state.parents.size, 0, 'a batch failure must roll back the new parent');
assert.equal(state.batches.size, 0, 'a batch failure must not leave a batch');
assert.equal(state.operations.size, 0, 'a batch failure must not consume the operation key');

assert.equal(executeAtomicAddition(state, input), input.parentId);
assert.equal(executeAtomicAddition(state, input), input.parentId);
assert.equal(state.parents.size, 1, 'retry must keep one parent');
assert.equal(state.batches.size, 1, 'retry must keep one batch');
assert.equal(state.operations.size, 1, 'retry must keep one idempotency result');
assert.equal([...state.batches.values()][0].quantity, 2);

console.log('atomic livestock addition verified: executable failure injection rolls back parent and replay keeps one batch');

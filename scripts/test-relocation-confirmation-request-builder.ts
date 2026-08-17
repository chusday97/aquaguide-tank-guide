import assert from 'node:assert/strict';
import type { Aquarium, AquariumSpeciesBatch, Fish } from '../src/types';
import { buildRelocationConfirmationRequest } from '../src/lib/relocationConfirmationRequestBuilder';

const species: Fish = {
  id: 'sp_control',
  name: 'Control Fish',
  scientificName: 'Testus controlus',
  category: 'Freshwater Fish',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '',
  diet: '',
  tankSize: '40L',
  temperament: 'Peaceful',
  size: 'Small',
};

const batch = (id: string, quantity: number): AquariumSpeciesBatch => ({
  id,
  quantity,
  entryDate: '2026-08-01T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-01T00:00:00.000Z',
});

const destination: Aquarium = {
  id: 'tank-b',
  name: 'Destination',
  fishes: [],
  waterType: 'Freshwater',
};

const makeSource = (fishes: Aquarium['fishes']): Aquarium => ({
  id: 'tank-a',
  name: 'Source',
  fishes,
  waterType: 'Freshwater',
});

const intent = {
  subjectSpeciesId: species.id,
  subjectName: species.name,
  quantity: 6,
  destinationAquariumId: destination.id,
  destinationAquariumName: destination.name,
};

const ready = buildRelocationConfirmationRequest({
  aquariums: [makeSource([{
    id: 'record-1',
    fishId: species.id,
    quantity: 6,
    entryDate: '2026-08-01T00:00:00.000Z',
    batches: [batch('batch-1', 6)],
  }]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: 'relocation:test:stable-operation',
});
assert.equal(ready.status, 'ready');
if (ready.status === 'ready') {
  assert.equal(ready.request.sourceAquariumFishId, 'record-1');
  assert.equal(ready.request.sourceBatchId, 'batch-1');
  assert.equal(ready.request.quantity, 6);
  assert.equal(ready.request.operationId, 'relocation:test:stable-operation');
  assert.equal(ready.facts.sourceAquariumName, 'Source');
  assert.equal(ready.facts.destinationAquariumName, 'Destination');
  assert.equal(ready.facts.speciesName, species.name);
}

const multiBatch = buildRelocationConfirmationRequest({
  aquariums: [makeSource([{
    id: 'record-1',
    fishId: species.id,
    quantity: 6,
    entryDate: '2026-08-01T00:00:00.000Z',
    batches: [batch('batch-1', 3), batch('batch-2', 3)],
  }]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: 'relocation:test:multi-batch',
});
assert.deepEqual(multiBatch, { status: 'blocked', reason: 'requires_multi_batch_relocation' });

const multiRecord = buildRelocationConfirmationRequest({
  aquariums: [makeSource([
    {
      id: 'record-1',
      fishId: species.id,
      quantity: 3,
      entryDate: '2026-08-01T00:00:00.000Z',
      batches: [batch('batch-1', 3)],
    },
    {
      id: 'record-2',
      fishId: species.id,
      quantity: 3,
      entryDate: '2026-08-02T00:00:00.000Z',
      batches: [batch('batch-2', 3)],
    },
  ]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: 'relocation:test:multi-record',
});
assert.deepEqual(multiRecord, { status: 'blocked', reason: 'multiple_source_records' });

const changedQuantity = buildRelocationConfirmationRequest({
  aquariums: [makeSource([{
    id: 'record-1',
    fishId: species.id,
    quantity: 5,
    entryDate: '2026-08-01T00:00:00.000Z',
    batches: [batch('batch-1', 5)],
  }]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: 'relocation:test:changed-quantity',
});
assert.deepEqual(changedQuantity, { status: 'blocked', reason: 'subject_quantity_changed' });

const missingBatch = buildRelocationConfirmationRequest({
  aquariums: [makeSource([{
    id: 'record-1',
    fishId: species.id,
    quantity: 6,
    entryDate: '2026-08-01T00:00:00.000Z',
    batches: [],
  }]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: 'relocation:test:no-batch',
});
assert.deepEqual(missingBatch, { status: 'blocked', reason: 'source_batch_missing' });

const mismatchedBatch = buildRelocationConfirmationRequest({
  aquariums: [makeSource([{
    id: 'record-1',
    fishId: species.id,
    quantity: 6,
    entryDate: '2026-08-01T00:00:00.000Z',
    batches: [batch('batch-1', 5)],
  }]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: 'relocation:test:mismatch',
});
assert.deepEqual(mismatchedBatch, { status: 'blocked', reason: 'source_batch_quantity_mismatch' });

const noOperationIdentity = buildRelocationConfirmationRequest({
  aquariums: [makeSource([{
    id: 'record-1',
    fishId: species.id,
    quantity: 6,
    entryDate: '2026-08-01T00:00:00.000Z',
    batches: [batch('batch-1', 6)],
  }]), destination],
  sourceAquariumId: 'tank-a',
  catalog: [species],
  intent,
  operationId: '   ',
});
assert.deepEqual(noOperationIdentity, { status: 'blocked', reason: 'invalid_operation_id' });

console.log('relocation confirmation request builder passed: only one-record/one-complete-batch mappings become executable requests; multi-record, multi-batch, quantity drift, missing batch, and missing operation identity fail closed');

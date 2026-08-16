import assert from 'node:assert/strict';
import type { Aquarium, AquariumFish } from '../src/types';
import { relocateLivestockInAquariums } from '../src/services/aquarium/livestock-relocation.service';

const fish = (overrides: Partial<AquariumFish> = {}): AquariumFish => ({
  id: 'source-fish',
  fishId: 'sp_0431',
  identityStatus: 'verified',
  quantity: 5,
  entryDate: '2026-08-01',
  batches: [{
    id: 'source-batch',
    quantity: 5,
    entryDate: '2026-08-01',
    lifeStage: 'adult',
    reproductiveState: 'normal',
    stateUpdatedAt: '2026-08-01T00:00:00.000Z',
  }],
  ...overrides,
});

const tank = (id: string, fishes: AquariumFish[] = []): Aquarium => ({ id, name: id, fishes });

{
  const result = relocateLivestockInAquariums(
    [tank('source', [fish()]), tank('destination')],
    {
      sourceAquariumId: 'source',
      sourceAquariumFishId: 'source-fish',
      sourceBatchId: 'source-batch',
      destinationAquariumId: 'destination',
      quantity: 2,
      operationId: 'partial',
    },
  );
  assert.equal(result.sourceAquarium.fishes[0].quantity, 3);
  assert.equal(result.sourceAquarium.fishes[0].batches?.[0].quantity, 3);
  assert.equal(result.destinationAquarium.fishes.length, 1);
  assert.equal(result.destinationAquarium.fishes[0].quantity, 2);
  assert.equal(result.destinationAquarium.fishes[0].fishId, 'sp_0431');
  const moved = result.destinationAquarium.fishes[0].batches?.[0];
  assert.equal(moved?.quantity, 2);
  assert.equal(moved?.entryDate, '2026-08-01');
  assert.equal(moved?.lifeStage, 'adult');
  assert.equal(moved?.reproductiveState, 'normal');
}

{
  const result = relocateLivestockInAquariums(
    [tank('source', [fish()]), tank('destination')],
    {
      sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch',
      destinationAquariumId: 'destination', quantity: 5, operationId: 'full',
    },
  );
  assert.equal(result.sourceAquarium.fishes.length, 0, 'moving the final source batch must remove the empty species record from local state');
  assert.equal(result.destinationAquarium.fishes[0].quantity, 5);
}

{
  const destinationExisting = fish({
    id: 'destination-fish',
    quantity: 3,
    entryDate: '2026-07-15',
    batches: [{
      id: 'destination-old-batch', quantity: 3, entryDate: '2026-07-15',
      lifeStage: 'juvenile', reproductiveState: 'unknown', stateUpdatedAt: '2026-07-15T00:00:00.000Z',
    }],
  });
  const result = relocateLivestockInAquariums(
    [tank('source', [fish()]), tank('destination', [destinationExisting])],
    {
      sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch',
      destinationAquariumId: 'destination', quantity: 2, operationId: 'append',
    },
  );
  assert.equal(result.destinationAquarium.fishes.length, 1, 'same verified species should reuse destination species record');
  assert.equal(result.destinationAquarium.fishes[0].id, 'destination-fish');
  assert.equal(result.destinationAquarium.fishes[0].quantity, 5);
  assert.equal(result.destinationAquarium.fishes[0].batches?.length, 2);
}

{
  const initial = [tank('source', [fish()]), tank('destination')];
  const first = relocateLivestockInAquariums(initial, {
    sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch',
    destinationAquariumId: 'destination', quantity: 2, operationId: 'replay',
  });
  const replay = relocateLivestockInAquariums(first.aquariums, {
    sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch',
    destinationAquariumId: 'destination', quantity: 2, operationId: 'replay',
  });
  assert.equal(replay.replayed, true);
  assert.equal(replay.sourceAquarium.fishes[0].quantity, 3, 'replay must not decrement source twice');
  assert.equal(replay.destinationAquarium.fishes[0].quantity, 2, 'replay must not duplicate destination batch');
}

assert.throws(() => relocateLivestockInAquariums(
  [tank('source', [fish({ fishId: 'unresolved:x', identityStatus: 'unresolved', rawName: '未知鱼' })]), tank('destination')],
  { sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch', destinationAquariumId: 'destination', quantity: 1, operationId: 'u' },
), /未确认身份/);

assert.throws(() => relocateLivestockInAquariums(
  [tank('source', [fish()])],
  { sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch', destinationAquariumId: 'source', quantity: 1, operationId: 'same' },
), /必须不同/);

assert.throws(() => relocateLivestockInAquariums(
  [tank('source', [fish()]), tank('destination')],
  { sourceAquariumId: 'source', sourceAquariumFishId: 'source-fish', sourceBatchId: 'source-batch', destinationAquariumId: 'destination', quantity: 6, operationId: 'too-many' },
), /超出/);

console.log('livestock relocation regression passed: partial/full moves, same-species destination append, batch metadata preservation, replay, unresolved/same-tank/over-quantity guards');

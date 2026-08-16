import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium, AquariumFish, AquariumSpeciesBatch } from '../src/types';
import { executeFreshRelocation } from '../src/lib/relocationExecutionPolicy';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');

const batch = (id: string, quantity: number): AquariumSpeciesBatch => ({
  id,
  quantity,
  entryDate: '2026-08-16T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-16T00:00:00.000Z',
});

const fish = (id: string, fishId: string, quantity: number, batches: AquariumSpeciesBatch[]): AquariumFish => ({
  id,
  fishId,
  quantity,
  entryDate: '2026-08-16T00:00:00.000Z',
  batches,
});

const makeTank = (
  id: string,
  name: string,
  fishes: Aquarium['fishes'],
  overrides: Partial<Aquarium> = {},
): Aquarium => ({
  id,
  name,
  fishes,
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  ...overrides,
});

const sourceTank = () => makeTank('source', 'Source', [
  fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
  fish('neon-record', neon.id, 5, [batch('neon-batch', 5)]),
  fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
]);
const compatibleTarget = () => makeTank('target', 'Target', []);

const request = {
  sourceAquariumId: 'source',
  sourceAquariumFishId: 'neon-record',
  sourceBatchId: 'neon-batch',
  destinationAquariumId: 'target',
  quantity: 5,
  operationId: 'relocate-neon-once',
};

const applyMockRelocation = (aquariums: Aquarium[], input = request): Aquarium[] => aquariums.map(aquarium => {
  if (aquarium.id === input.sourceAquariumId) {
    return {
      ...aquarium,
      fishes: aquarium.fishes.flatMap(record => {
        if (record.id !== input.sourceAquariumFishId) return [record];
        const sourceBatch = record.batches?.find(item => item.id === input.sourceBatchId);
        assert.ok(sourceBatch);
        const remainingQuantity = sourceBatch.quantity - input.quantity;
        if (remainingQuantity === 0) return [];
        const nextBatches = (record.batches || []).map(item => item.id === input.sourceBatchId
          ? { ...item, quantity: remainingQuantity }
          : item);
        return [{ ...record, quantity: record.quantity - input.quantity, batches: nextBatches }];
      }),
    };
  }
  if (aquarium.id === input.destinationAquariumId) {
    return {
      ...aquarium,
      fishes: [...aquarium.fishes, fish(
        'destination-neon-record',
        neon.id,
        input.quantity,
        [batch('destination-neon-batch', input.quantity)],
      )],
    };
  }
  return aquarium;
});

// Green path: the execution policy loads fresh state, rebuilds both source and
// destination decisions, executes only the current compatible verdict, then
// reloads and recomputes both aquariums.
{
  let state = [sourceTank(), compatibleTarget()];
  let loadCount = 0;
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => {
      loadCount += 1;
      return structuredClone(state);
    },
    relocate: async input => {
      relocateCount += 1;
      state = applyMockRelocation(state, input);
      return { destinationFishId: 'destination-neon-record', destinationBatchId: 'destination-neon-batch', replayed: false };
    },
  });
  assert.equal(result.status, 'executed');
  assert.equal(relocateCount, 1);
  assert.equal(loadCount, 2, 'execution must load once before mutation and once after commit');
  if (result.status === 'executed') {
    assert.equal(result.freshDestinationEvaluation.status, 'compatible_by_current_evidence');
    assert.equal(result.postAquariums.find(item => item.id === 'source')?.fishes.some(item => item.id === 'neon-record'), false);
    assert.equal(result.postAquariums.find(item => item.id === 'target')?.fishes.find(item => item.fishId === neon.id)?.quantity, 5);
    assert.equal(result.postSourceDecision.context.aquariumId, 'source');
    assert.equal(result.postDestinationDecision.context.aquariumId, 'target');
  }
}

// A stale UI-compatible destination must not authorize execution after the
// target changes. The fresh snapshot now contains a reviewed predator.
{
  const staleChangedTarget = makeTank('target', 'Target now changed', [
    fish('target-predator', predator.id, 1, [batch('target-predator-batch', 1)]),
  ]);
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => [sourceTank(), staleChangedTarget],
    relocate: async () => {
      relocateCount += 1;
      throw new Error('mutation must not run');
    },
  });
  assert.equal(result.status, 'blocked');
  if (result.status === 'blocked') {
    assert.equal(result.reason, 'destination_not_compatible_by_current_evidence');
    assert.equal(result.freshDestinationEvaluation?.status, 'not_recommended');
  }
  assert.equal(relocateCount, 0);
}

// Unresolved destination residents fail closed even when the known subset is
// otherwise compatible.
{
  const unresolvedTarget = makeTank('target', 'Target with unknown resident', [
    fish('unknown-target-record', 'unresolved:cloud-target-record', 1, [batch('unknown-target-batch', 1)]),
  ]);
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => [sourceTank(), unresolvedTarget],
    relocate: async () => {
      relocateCount += 1;
      throw new Error('mutation must not run');
    },
  });
  assert.equal(result.status, 'blocked');
  if (result.status === 'blocked') {
    assert.equal(result.reason, 'destination_not_compatible_by_current_evidence');
    assert.equal(result.freshDestinationEvaluation?.status, 'insufficient_data');
  }
  assert.equal(relocateCount, 0);
}

// Fresh source certainty is also mandatory. If an unresolved resident appears
// after the read-only decision was shown, the old formal intervention cannot execute.
{
  const sourceWithUnknown = makeTank('source', 'Source changed', [
    ...sourceTank().fishes,
    fish('unknown-source-record', 'unresolved:cloud-source-record', 1, [batch('unknown-source-batch', 1)]),
  ]);
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => [sourceWithUnknown, compatibleTarget()],
    relocate: async () => {
      relocateCount += 1;
      throw new Error('mutation must not run');
    },
  });
  assert.equal(result.status, 'blocked');
  if (result.status === 'blocked') assert.equal(result.reason, 'source_intervention_not_formally_allowed');
  assert.equal(relocateCount, 0);
}

// If the conflict disappeared while the panel was open, the species is no
// longer a formal relocation option and an old CTA cannot move it anyway.
{
  const noLongerConflictSource = makeTank('source', 'Conflict resolved', [
    fish('neon-record', neon.id, 5, [batch('neon-batch', 5)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => [noLongerConflictSource, compatibleTarget()],
    relocate: async () => {
      relocateCount += 1;
      throw new Error('mutation must not run');
    },
  });
  assert.equal(result.status, 'blocked');
  if (result.status === 'blocked') assert.equal(result.reason, 'source_subject_no_longer_formal_relocation_option');
  assert.equal(relocateCount, 0);
}

// The formal intervention currently means relocating the whole subject. A stale
// quantity or a partial move must not masquerade as resolving the blocker.
{
  const sixNeonSource = makeTank('source', 'Quantity changed', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('neon-record', neon.id, 6, [batch('neon-batch', 6)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => [sixNeonSource, compatibleTarget()],
    relocate: async () => {
      relocateCount += 1;
      throw new Error('mutation must not run');
    },
  });
  assert.equal(result.status, 'blocked');
  if (result.status === 'blocked') assert.equal(result.reason, 'requested_quantity_not_fresh_formal_option');
  assert.equal(relocateCount, 0);
}

// A single-batch mutation cannot execute a full-species option that spans
// multiple batches. This is deliberately blocked until a multi-batch atomic
// relocation contract exists.
{
  const multiBatchSource = makeTank('source', 'Multi-batch source', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('neon-record', neon.id, 5, [batch('neon-batch', 3), batch('neon-batch-2', 2)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => [multiBatchSource, compatibleTarget()],
    relocate: async () => {
      relocateCount += 1;
      throw new Error('mutation must not run');
    },
  });
  assert.equal(result.status, 'blocked');
  if (result.status === 'blocked') assert.equal(result.reason, 'source_batch_quantity_changed');
  assert.equal(relocateCount, 0);
}

// A mutation may have committed even if the subsequent canonical reload fails.
// Never rewrite this situation as a normal failure/rollback claim.
{
  let loadCount = 0;
  let relocateCount = 0;
  const result = await executeFreshRelocation({
    request,
    catalog: fishData,
    loadAquariums: async () => {
      loadCount += 1;
      if (loadCount === 1) return [sourceTank(), compatibleTarget()];
      throw new Error('canonical reload unavailable');
    },
    relocate: async () => {
      relocateCount += 1;
      return { destinationFishId: 'destination-neon-record', destinationBatchId: 'destination-neon-batch', replayed: false };
    },
  });
  assert.equal(relocateCount, 1);
  assert.equal(result.status, 'executed_post_state_unavailable');
  if (result.status === 'executed_post_state_unavailable') {
    assert.match(result.errorMessage, /canonical reload unavailable/);
  }
}

console.log('relocation execution policy passed: fresh source and destination decisions gate mutation, stale/unknown/partial states fail closed, whole-subject quantity semantics are enforced, and committed-but-unreloadable mutations remain truthfully distinct from blocked execution');

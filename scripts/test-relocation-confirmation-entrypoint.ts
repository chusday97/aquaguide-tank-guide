import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { buildRelocationConfirmationEntrypoint } from '../src/lib/relocationConfirmationEntrypoint';
import { buildTankDecisionSupport } from '../src/lib/tankDecisionSupportOrchestrator';
import type { Aquarium, AquariumFish, AquariumSpeciesBatch, Fish } from '../src/types';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const cardinal = byId('sp_0432');
const relocationCandidate: Fish = {
  id: 'synthetic-relocation-entrypoint-candidate',
  name: 'Relocation Entrypoint Test Fish',
  scientificName: 'Testus relocationis entrypointis',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: 'Small peaceful freshwater control used only to test confirmation-entrypoint semantics.',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};
const catalog = [...fishData, relocationCandidate];

const batch = (id: string, quantity: number): AquariumSpeciesBatch => ({
  id,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-17T00:00:00.000Z',
});

const fish = (
  id: string,
  fishId: string,
  quantity: number,
  batches?: AquariumSpeciesBatch[],
): AquariumFish => ({
  id,
  fishId,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  ...(batches ? { batches } : {}),
});

const makeTank = (id: string, name: string, fishes: AquariumFish[]): Aquarium => ({
  id,
  name,
  fishes,
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const compatibleTarget = () => makeTank('target', 'Target', []);
const baseSource = () => makeTank('source', 'Source', [
  fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
  fish('candidate-record', relocationCandidate.id, 5, [batch('candidate-batch', 5)]),
  fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
]);

const build = (source: Aquarium, target: Aquarium = compatibleTarget()) => buildTankDecisionSupport({
  aquarium: source,
  catalog,
  allAquariums: [source, target],
});

const findCandidateOptionId = (result: ReturnType<typeof build>) => {
  const option = result.formalChoiceComparison?.options.find(item => (
    item.subjectSpeciesId === relocationCandidate.id
  ));
  assert.ok(option, 'expected synthetic candidate to be a formal relocation option');
  return option.id;
};

// Exact one-record + one-batch whole-subject mapping may open confirmation.
{
  const source = baseSource();
  const result = build(source);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.equal(entry.status, 'eligible');
  if (entry.status === 'eligible') {
    assert.deepEqual(entry.candidate, {
      sourceAquariumId: 'source',
      sourceAquariumName: 'Source',
      sourceAquariumFishId: 'candidate-record',
      sourceBatchId: 'candidate-batch',
      destinationAquariumId: 'target',
      destinationAquariumName: 'Target',
      subjectSpeciesId: relocationCandidate.id,
      speciesName: relocationCandidate.name,
      quantity: 5,
    });
    const serialized = JSON.stringify(entry.candidate);
    assert.doesNotMatch(serialized, /isSafe|allowed|expectedCompatibility|compatible_by_current_evidence|operationId/);
  }
}

// A species-level option can aggregate multiple factual records. Never pick the
// first sourceRecordId just to manufacture a single-record mutation request.
{
  const source = makeTank('source', 'Source', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('candidate-record-a', relocationCandidate.id, 2, [batch('candidate-batch-a', 2)]),
    fish('candidate-record-b', relocationCandidate.id, 3, [batch('candidate-batch-b', 3)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  const result = build(source);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'multiple_source_records' });
}

// Whole-subject quantity split across batches is not representable by #62's
// single-batch mutation and must not silently select batches[0].
{
  const source = makeTank('source', 'Source', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('candidate-record', relocationCandidate.id, 5, [batch('candidate-batch-a', 3), batch('candidate-batch-b', 2)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  const result = build(source);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'multiple_positive_source_batches' });
}

// Legacy source record without a canonical explicit batch cannot invent one.
{
  const source = makeTank('source', 'Source', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('candidate-record', relocationCandidate.id, 5),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  const result = build(source);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'source_batch_missing' });
}

// Stale/inconsistent source facts cannot open confirmation even if the displayed
// decision result was generated from a previously valid whole-subject quantity.
{
  const original = baseSource();
  const result = build(original);
  const changedSource = makeTank('source', 'Source', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('candidate-record', relocationCandidate.id, 6, [batch('candidate-batch', 6)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: changedSource,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'source_record_quantity_mismatch' });
}

// A matching record quantity with a non-matching single batch is also blocked.
{
  const original = baseSource();
  const result = build(original);
  const inconsistentSource = makeTank('source', 'Source', [
    fish('predator-record', predator.id, 1, [batch('predator-batch', 1)]),
    fish('candidate-record', relocationCandidate.id, 5, [batch('candidate-batch', 4)]),
    fish('cardinal-record', cardinal.id, 5, [batch('cardinal-batch', 5)]),
  ]);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: inconsistentSource,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'source_batch_quantity_mismatch' });
}

// Current destination card can expose the opener only for the direct-compatible
// display status. This still does not authorize the later mutation.
{
  const source = baseSource();
  const changedTarget = makeTank('target', 'Target with predator', [
    fish('target-predator', predator.id, 1, [batch('target-predator-batch', 1)]),
  ]);
  const result = build(source, changedTarget);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'destination_not_compatible_by_current_evidence' });
}

// A destination not contained in the formal decision result cannot be supplied
// externally to manufacture a confirmation entrypoint.
{
  const source = baseSource();
  const result = build(source);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: findCandidateOptionId(result),
    destinationAquariumId: 'invented-target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'destination_not_in_formal_result' });
}

// Unresolved residents disable formal intervention before any opener can exist.
{
  const source = makeTank('source', 'Source', [
    ...baseSource().fishes,
    fish('unknown-record', 'unresolved:entrypoint-unknown', 1, [batch('unknown-batch', 1)]),
  ]);
  const result = build(source);
  assert.equal(result.formalInterventionAllowed, false);
  const entry = buildRelocationConfirmationEntrypoint({
    result,
    sourceAquarium: source,
    optionId: 'old-option-id',
    destinationAquariumId: 'target',
  });
  assert.deepEqual(entry, { status: 'blocked', reason: 'formal_intervention_not_allowed' });
}

console.log('relocation confirmation entrypoint passed: only a lossless single-record/single-batch whole-subject mapping can open confirmation; cached destination status never becomes mutation authorization');

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import { buildTankDecisionSupport } from '../src/lib/tankDecisionSupportOrchestrator';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');

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

const completeSource = makeTank('complete-source', 'Complete Source', [
  { id: 'predator-record', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
  { id: 'neon-record', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
  { id: 'cardinal-record', fishId: cardinal.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
]);
const emptyTarget = makeTank('empty-target', 'Empty Target', []);

const complete = buildTankDecisionSupport({
  aquarium: completeSource,
  catalog: fishData,
  allAquariums: [completeSource, emptyTarget],
});
assert.equal(complete.certainty, 'complete_known_community');
assert.equal(complete.formalInterventionAllowed, true);
assert.equal(complete.formalInterventionBlockReason, undefined);
assert.ok(complete.formalChoiceComparison);
assert.equal(complete.formalChoiceComparison.kind, 'unique_strongest_single_change');
assert.equal(complete.destinationSetProvided, true);
const predatorDestination = complete.relocationDestinations.find(item => item.subjectSpeciesId === predator.id);
assert.ok(predatorDestination, 'formal predator relocation choice should receive destination evaluation');
const emptyTargetEvaluation = predatorDestination.destinations.evaluations.find(item => item.aquariumId === emptyTarget.id);
assert.ok(
  emptyTargetEvaluation,
  'an explicitly supplied target must be re-evaluated for the formal relocation option rather than assumed suitable or omitted',
);
assert.ok(
  ['compatible_by_current_evidence', 'conditional', 'insufficient_data', 'not_recommended'].includes(emptyTargetEvaluation.status),
  'the orchestrator must preserve the destination evaluator verdict instead of pre-classifying an empty tank as safe',
);
assert.deepEqual(predatorDestination.destinations.excludedSourceTankIds, [completeSource.id]);

const destinationUnknown = buildTankDecisionSupport({
  aquarium: completeSource,
  catalog: fishData,
});
assert.equal(destinationUnknown.destinationSetProvided, false);
assert.deepEqual(destinationUnknown.relocationDestinations, [], 'omitted aquarium set must stay unknown, not become no-existing-destination');

const partialSource = makeTank('partial-source', 'Partial Source', [
  { id: 'predator-record-partial', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
  { id: 'neon-record-partial', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
  {
    id: 'unknown-record',
    fishId: 'unresolved:real-cloud-record',
    identityStatus: 'unresolved',
    rawName: '用户记录但身份未确认的生物',
    quantity: 1,
    entryDate: '2026-08-16T00:00:00.000Z',
  },
]);
const partial = buildTankDecisionSupport({
  aquarium: partialSource,
  catalog: fishData,
  allAquariums: [partialSource, emptyTarget],
});
assert.equal(partial.certainty, 'partial_known_community');
assert.deepEqual(partial.context.unresolvedCurrentSpeciesIds, ['unresolved:real-cloud-record']);
assert.ok(
  partial.knownSubsetActionPlan.graph.summary.blockerCount > 0,
  'known-subset graph may still expose a verified predator relationship for transparency',
);
assert.equal(partial.knownSubsetChoiceComparison.summary.baselineBlockerCount > 0, true);
assert.equal(partial.formalInterventionAllowed, false, 'unresolved source residents must block whole-tank formal intervention');
assert.equal(partial.formalInterventionBlockReason, 'unresolved_current_livestock');
assert.equal(partial.formalChoiceComparison, null, 'known-subset keep-A/keep-B result must not be promoted as a full-community choice');
assert.deepEqual(partial.relocationDestinations, [], 'no destination should be promoted from an incomplete source-community intervention');

const onlyUnknown = makeTank('unknown-only-source', 'Unknown Only Source', [{
  id: 'unknown-only-record',
  fishId: 'unresolved:only-resident',
  identityStatus: 'unresolved',
  rawName: '未知生物',
  quantity: 2,
  entryDate: '2026-08-16T00:00:00.000Z',
}]);
const onlyUnknownResult = buildTankDecisionSupport({ aquarium: onlyUnknown, catalog: fishData });
assert.equal(onlyUnknownResult.certainty, 'partial_known_community');
assert.equal(onlyUnknownResult.knownSubsetActionPlan.graph.nodes.length, 0);
assert.equal(onlyUnknownResult.formalInterventionAllowed, false);
assert.equal(onlyUnknownResult.formalChoiceComparison, null);

console.log('tank decision support orchestrator passed: complete communities may produce formal counterfactual choices and destination checks, while unresolved source reality limits output to a transparent known-subset graph and blocks formal intervention');

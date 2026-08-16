import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium, Fish } from '../src/types';
import { evaluateRelocationDestinations } from '../src/lib/relocationDestinationEvaluator';

const predator = fishData.find(item => item.id === 'sp_0049');
assert.ok(predator, 'missing reviewed predator fixture');

const candidate: Fish = {
  id: 'synthetic-relocation-candidate',
  name: 'Relocation Test Fish',
  scientificName: 'Testus relocationis',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: 'Small peaceful freshwater test fish.',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};

const makeTank = (id: string, name: string, overrides: Partial<Aquarium> = {}): Aquarium => ({
  id,
  name,
  fishes: [],
  dimensions: { length: '100', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: {
    filter: '桶滤',
    heater: true,
    oxygen: true,
    light: '普通灯',
  },
  ...overrides,
});

const source = makeTank('source-tank', 'Source Tank');
const compatible = makeTank('compatible-target', 'Compatible Target');
const conditional = makeTank('conditional-target', 'Conditional Target', { targetTemperature: '21' });
const unresolved = makeTank('unresolved-target', 'Unresolved Target');
const predatorTarget = makeTank('predator-target', 'Predator Target', {
  fishes: [{
    id: 'predator-record',
    fishId: predator.id,
    quantity: 1,
    entryDate: '2026-08-16T00:00:00.000Z',
  }],
});

const result = evaluateRelocationDestinations({
  relocatingSpecies: candidate,
  quantity: 1,
  sourceAquariumId: source.id,
  destinations: [
    { aquarium: source, existingSpecies: [] },
    { aquarium: compatible, existingSpecies: [] },
    { aquarium: conditional, existingSpecies: [] },
    { aquarium: unresolved, existingSpecies: [], unresolvedCurrentSpeciesIds: ['unresolved:unknown-resident'] },
    { aquarium: predatorTarget, existingSpecies: [{ species: predator, quantity: 1 }] },
  ],
});

assert.deepEqual(result.excludedSourceTankIds, [source.id]);
assert.equal(result.status, 'compatible_destination_found');
assert.deepEqual(result.compatibleDestinationIds, [compatible.id]);
assert.deepEqual(result.conditionalDestinationIds, [conditional.id]);
assert.deepEqual(result.insufficientDataDestinationIds, [unresolved.id]);
assert.deepEqual(result.notRecommendedDestinationIds, [predatorTarget.id]);

const compatibleEvaluation = result.evaluations.find(item => item.aquariumId === compatible.id);
assert.ok(compatibleEvaluation);
assert.equal(compatibleEvaluation.rawCompatibilityStatus, 'compatible');
assert.equal(compatibleEvaluation.status, 'compatible_by_current_evidence');
assert.equal(compatibleEvaluation.failClosedForUnresolvedResidents, false);

const unresolvedEvaluation = result.evaluations.find(item => item.aquariumId === unresolved.id);
assert.ok(unresolvedEvaluation);
assert.equal(unresolvedEvaluation.rawCompatibilityStatus, 'compatible');
assert.equal(unresolvedEvaluation.status, 'insufficient_data');
assert.equal(unresolvedEvaluation.failClosedForUnresolvedResidents, true);
assert.deepEqual(unresolvedEvaluation.unresolvedCurrentSpeciesIds, ['unresolved:unknown-resident']);

const blockedEvaluation = result.evaluations.find(item => item.aquariumId === predatorTarget.id);
assert.ok(blockedEvaluation);
assert.equal(blockedEvaluation.status, 'not_recommended', 'known predation blocker must remain stronger than any destination promotion');
assert.equal(blockedEvaluation.compatibility.blockingRules.some(rule => rule.code === 'predation_risk'), true);

const unresolvedAndBlocked = evaluateRelocationDestinations({
  relocatingSpecies: candidate,
  destinations: [{
    aquarium: predatorTarget,
    existingSpecies: [{ species: predator, quantity: 1 }],
    unresolvedCurrentSpeciesIds: ['unresolved:another-resident'],
  }],
});
assert.equal(unresolvedAndBlocked.evaluations[0].status, 'not_recommended');
assert.equal(unresolvedAndBlocked.evaluations[0].failClosedForUnresolvedResidents, false, 'known blocker remains the decisive result even when other residents are unresolved');

const noOtherTank = evaluateRelocationDestinations({
  relocatingSpecies: candidate,
  sourceAquariumId: source.id,
  destinations: [{ aquarium: source, existingSpecies: [] }],
});
assert.equal(noOtherTank.status, 'no_existing_destination');
assert.equal(noOtherTank.evaluations.length, 0);

console.log('relocation destination evaluator passed: source tank is excluded, each target is re-evaluated, unresolved residents fail closed, known blockers win, and compatible-by-current-evidence never implies guaranteed safety');

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { buildConflictActionPlan } from '../src/lib/conflictActionEngine';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');

const predatorPlan = buildConflictActionPlan([
  { species: predator, quantity: 1 },
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);

assert.equal(predatorPlan.graph.summary.blockerCount, 2);
assert.deepEqual(predatorPlan.strongestSingleChangeSpeciesIds, [predator.id]);
const predatorOption = predatorPlan.relocationOptions.find(option => option.subjectSpeciesIds[0] === predator.id);
const neonOption = predatorPlan.relocationOptions.find(option => option.subjectSpeciesIds[0] === neon.id);
const cardinalOption = predatorPlan.relocationOptions.find(option => option.subjectSpeciesIds[0] === cardinal.id);
assert.ok(predatorOption && neonOption && cardinalOption);
assert.equal(predatorOption.strongestSingleChange, true);
assert.equal(predatorOption.blockerReduction, 2);
assert.equal(predatorOption.resolvesBlockerIds.length, 2);
assert.equal(predatorOption.remainingBlockerIds.length, 0);
assert.equal(neonOption.strongestSingleChange, false);
assert.equal(neonOption.blockerReduction, 1);
assert.equal(cardinalOption.blockerReduction, 1);
assert.equal(
  predatorPlan.conditionActions.some(action => (
    action.subjectSpeciesIds.includes(predator.id)
    && action.action === 'adjust_environment'
    && action.rationale.includes('捕食')
  )),
  false,
  'predation blockers must not be disguised as environment-adjustment actions',
);
assert.equal(predatorPlan.unresolvedBlockerIds.length, 0, 'every current predation blocker has a counterfactually verified relocation option');

const schoolingPlan = buildConflictActionPlan([
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);
assert.equal(schoolingPlan.graph.summary.blockerCount, 0);
assert.equal(schoolingPlan.relocationOptions.length, 0, 'warning-only communities should not receive blocker-relocation options');
assert.ok(
  schoolingPlan.conditionActions.some(action => action.action === 'adjust_quantity' && action.sourceFixability === 'quantity_adjustment'),
  'group-size/shared-schooling caution should map to a quantity-condition action rather than relocation',
);

const syntheticA = {
  ...neon,
  id: 'synthetic-action-a',
  name: 'Synthetic action A',
  scientificName: 'Syntheticus actiona',
  phLevel: '6.0-6.5',
};
const syntheticB = {
  ...cardinal,
  id: 'synthetic-action-b',
  name: 'Synthetic action B',
  scientificName: 'Syntheticus actionb',
  phLevel: '7.5-8.0',
};
const uncertaintyPlan = buildConflictActionPlan([
  { species: syntheticA, quantity: 3 },
  { species: syntheticB, quantity: 3 },
]);
assert.ok(
  uncertaintyPlan.conditionActions.some(action => action.action === 'collect_more_data' && action.effect === 'reduces_uncertainty'),
  'unreviewed behavior must produce a collect-more-data action, never a fabricated compatibility conclusion',
);
assert.ok(
  uncertaintyPlan.conditionActions.some(action => action.action === 'adjust_environment' && action.effect === 'addresses_condition'),
  'pH-range gaps should surface as an environment-condition action',
);
assert.ok(
  uncertaintyPlan.conditionActions.every(action => action.evidenceMode === 'rule_mapped'),
  'all condition actions must stay rule-mapped rather than pretending to be counterfactual relocation results',
);
assert.ok(
  predatorPlan.relocationOptions.every(option => option.evidenceMode === 'counterfactual_recomputed'),
  'every relocation action must come from a counterfactually recomputed intervention scenario',
);

console.log('conflict action engine passed: relocation is counterfactually verified, fixability maps to the right action family, warnings stay warnings, and evidence gaps become information work');

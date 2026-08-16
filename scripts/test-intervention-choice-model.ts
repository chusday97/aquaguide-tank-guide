import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { buildInterventionChoiceComparison } from '../src/lib/interventionChoiceModel';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');
const convict = byId('sp_0021');
const tigerBarb = byId('sp_0439');

const predatorChoice = buildInterventionChoiceComparison([
  { species: predator, quantity: 1 },
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);
assert.equal(predatorChoice.decisionMode, 'user_choice_required');
assert.equal(predatorChoice.kind, 'unique_strongest_single_change');
assert.equal(predatorChoice.summary.baselineBlockerCount, 2);
assert.equal(predatorChoice.summary.bestSingleChangeBlockerReduction, 2);
assert.equal(predatorChoice.summary.tie, false);
assert.equal(predatorChoice.strongestOptionIds.length, 1);
const strongestPredatorOption = predatorChoice.options.find(option => option.id === predatorChoice.strongestOptionIds[0]);
assert.ok(strongestPredatorOption);
assert.equal(strongestPredatorOption.subjectSpeciesId, predator.id);
assert.equal(strongestPredatorOption.resolvesBlockerCount, 2);
assert.equal(strongestPredatorOption.remainingBlockerCount, 0);
assert.equal(strongestPredatorOption.evidenceMode, 'counterfactual_recomputed');

const pairChoice = buildInterventionChoiceComparison([
  { species: convict, quantity: 1 },
  { species: tigerBarb, quantity: 6 },
]);
assert.equal(pairChoice.kind, 'multiple_equal_single_change_options');
assert.equal(pairChoice.summary.tie, true);
assert.equal(pairChoice.strongestOptionIds.length, 2);
assert.deepEqual(
  pairChoice.options.filter(option => option.strongestSingleChange).map(option => option.subjectSpeciesId).sort(),
  [convict.id, tigerBarb.id].sort(),
  'equal counterfactual outcomes must remain an explicit keeper choice',
);
assert.ok(pairChoice.options.every(option => option.remainingBlockerCount === 0));

const warningOnlyChoice = buildInterventionChoiceComparison([
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);
assert.equal(warningOnlyChoice.kind, 'no_blocking_conflict');
assert.equal(warningOnlyChoice.summary.baselineBlockerCount, 0);
assert.equal(warningOnlyChoice.strongestOptionIds.length, 0);
assert.equal(warningOnlyChoice.options.length, 0, 'warning-only combinations must not generate keep-A/keep-B relocation choices');

console.log('intervention choice model passed: strongest single-change evidence is explicit, ties stay user choices, and warning-only communities do not receive removal comparisons');

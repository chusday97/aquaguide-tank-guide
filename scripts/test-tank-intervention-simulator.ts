import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { simulateTankInterventions } from '../src/lib/tankInterventionSimulator';

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

const multiConflict = simulateTankInterventions([
  { species: predator, quantity: 1 },
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);

assert.equal(multiConflict.baselineGraph.summary.blockerCount, 2, 'reviewed predator should create one blocker toward each small tetra');
assert.deepEqual(
  multiConflict.minimumChangeCandidateSpeciesIds,
  [predator.id],
  'the predator is the unique strongest single-species change because it resolves both blocker edges',
);
assert.equal(multiConflict.summary.bestSingleSpeciesBlockerReduction, 2);

const removePredator = multiConflict.scenarios.find(item => item.subjectSpeciesId === predator.id);
const removeNeon = multiConflict.scenarios.find(item => item.subjectSpeciesId === neon.id);
const removeCardinal = multiConflict.scenarios.find(item => item.subjectSpeciesId === cardinal.id);
assert.ok(removePredator && removeNeon && removeCardinal);
assert.equal(removePredator.blockerReduction, 2);
assert.equal(removePredator.after.blockerCount, 0);
assert.equal(removePredator.status, 'improves');
assert.equal(removePredator.introducedConflictIds.length, 0, 'removing one species must not fabricate new pair conflicts');
assert.equal(removePredator.introducedEvidenceGapIds.length, 0, 'removing one species must not fabricate new evidence gaps');
assert.equal(removeNeon.blockerReduction, 1);
assert.equal(removeCardinal.blockerReduction, 1);

const tiedPair = simulateTankInterventions([
  { species: convict, quantity: 1 },
  { species: tigerBarb, quantity: 6 },
]);
assert.ok(tiedPair.baselineGraph.summary.blockerCount > 0, 'reviewed incompatible pair should have a blocker');
assert.deepEqual(
  tiedPair.minimumChangeCandidateSpeciesIds,
  [convict.id, tigerBarb.id].sort(),
  'when either single-species relocation resolves the same blockers, the simulator must preserve the tie instead of choosing for the keeper',
);
assert.equal(tiedPair.summary.candidateCount, 2);

const noBlocker = simulateTankInterventions([
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);
assert.equal(noBlocker.summary.hasBlockingConflict, false);
assert.equal(noBlocker.summary.bestSingleSpeciesBlockerReduction, 0);
assert.deepEqual(noBlocker.minimumChangeCandidateSpeciesIds, [], 'warnings alone must not be presented as a blocker-removal recommendation');

const duplicateRecords = simulateTankInterventions([
  { species: predator, quantity: 1 },
  { species: predator, quantity: 2 },
  { species: neon, quantity: 5 },
]);
const duplicatePredatorScenario = duplicateRecords.scenarios.find(item => item.subjectSpeciesId === predator.id);
assert.ok(duplicatePredatorScenario);
assert.equal(duplicatePredatorScenario.removedQuantity, 3, 'duplicate records of one species should be aggregated into one relocation scenario');
assert.equal(duplicateRecords.scenarios.filter(item => item.subjectSpeciesId === predator.id).length, 1);

console.log('tank intervention simulator passed: counterfactual removals are re-evaluated, strongest single-change options are evidence-based, ties stay ties, and warnings are not promoted to removal commands');

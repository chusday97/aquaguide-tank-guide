import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';

const base = {
  id: 'a',
  waterType: 'freshwater' as const,
  temperatureMinC: 22,
  temperatureMaxC: 26,
  phMin: 6,
  phMax: 8,
  reviewed: true,
};

const emptyPlan = evaluateCompatibility({ intent: 'planned_addition', existingSpecies: [], candidateSpecies: base });
assert.equal(emptyPlan.status, 'insufficient_data');
assert.equal(emptyPlan.addPolicy, 'complete_information');
assert.ok(emptyPlan.ruleCodes.includes('empty_tank_no_existing_species'));

const emptyFact = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [], candidateSpecies: base });
assert.equal(emptyFact.status, 'insufficient_data');
assert.equal(emptyFact.addPolicy, 'allow');

const noTankPlan = evaluateCompatibility({
  intent: 'planned_addition',
  existingSpecies: [{ ...base, id: 'b' }],
  candidateSpecies: base,
});
assert.equal(noTankPlan.status, 'insufficient_data');
assert.equal(noTankPlan.addPolicy, 'complete_information');
assert.ok(noTankPlan.ruleCodes.includes('tank_missing'));

const blocked = evaluateCompatibility({
  intent: 'planned_addition',
  existingSpecies: [{ ...base, id: 'b', waterType: 'saltwater' }],
  candidateSpecies: base,
});
assert.equal(blocked.status, 'not_recommended');
assert.equal(blocked.addPolicy, 'block');

const candidateWaterConflict = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'b' }],
  candidateSpecies: { ...base, waterType: 'saltwater' },
});
assert.equal(candidateWaterConflict.status, 'not_recommended');
assert.ok(candidateWaterConflict.ruleCodes.includes('candidate_tank_water_type_conflict'));

const unknownCandidateWater = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'b' }],
  candidateSpecies: { ...base, waterType: 'unknown' },
});
assert.equal(unknownCandidateWater.status, 'insufficient_data');
assert.ok(unknownCandidateWater.ruleCodes.includes('candidate_water_type_missing'));

const missing = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'unknown' },
  existingSpecies: [{ ...base, id: 'b', reviewed: false }],
  candidateSpecies: base,
  explicitPairStatus: 'caution',
});
assert.equal(missing.status, 'insufficient_data');
assert.equal(missing.addPolicy, 'complete_information');
assert.deepEqual(missing.ruleCodes.slice(-1), ['reviewed_pair_rule']);

console.log('domain compatibility policy verified: fail-closed precedence and record-existing allowance');

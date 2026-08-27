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

const blocked = evaluateCompatibility({
  intent: 'planned_addition',
  existingSpecies: [{ ...base, id: 'b', waterType: 'saltwater' }],
  candidateSpecies: base,
});
assert.equal(blocked.status, 'not_recommended');
assert.equal(blocked.addPolicy, 'block');

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

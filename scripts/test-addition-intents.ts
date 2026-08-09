import assert from 'node:assert/strict';
import { getSpeciesAdditionPolicy } from '../src/services/aquarium/species-addition-policy';

assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'compatible' }), 'save');
assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'caution' }), 'save_with_warning');
assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'insufficient_data' }), 'save_with_unknown');
assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'not_recommended' }), 'save_with_urgent_warning');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'compatible' }), 'allow');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'caution' }), 'confirm');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'insufficient_data' }), 'complete_information');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'not_recommended' }), 'block');

console.log('addition intent policies verified: facts never block and plans remain safety-gated');

import assert from 'node:assert/strict';
import { getSpeciesAdditionPolicy } from '../src/services/aquarium/species-addition-policy';
import { isAquariumTaskAction, taskRoutes } from '../src/services/navigation/task-routes';

assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'compatible' }), 'save');
assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'caution' }), 'save_with_warning');
assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'insufficient_data' }), 'save_with_unknown');
assert.equal(getSpeciesAdditionPolicy({ intent: 'record_existing', status: 'not_recommended' }), 'save_with_urgent_warning');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'compatible' }), 'allow');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'caution' }), 'confirm');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'insufficient_data' }), 'complete_information');
assert.equal(getSpeciesAdditionPolicy({ intent: 'planned_addition', status: 'not_recommended' }), 'block');
assert.equal(taskRoutes.aquarium.recordExisting('sp_0001'), '/aquarium?action=record-existing&species=sp_0001');
assert.equal(taskRoutes.aquarium.planSpecies('sp_0001'), '/aquarium?action=plan-species&species=sp_0001');
assert.equal(isAquariumTaskAction('add-species'), true, 'legacy addition deep link must remain compatible');
assert.equal(isAquariumTaskAction('record-existing'), true);
assert.equal(isAquariumTaskAction('plan-species'), true);

console.log('addition intent policies verified: facts never block and plans remain safety-gated');

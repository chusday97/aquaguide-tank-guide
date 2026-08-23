import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Aquarium } from '../src/types';
import { selectAquariumSnapshot } from '../src/services/aquarium/aquarium-selection.service';
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

const cloudOnlyAquariums: Aquarium[] = [
  { id: 'cloud-a', name: '云端 A', fishes: [] },
  { id: 'cloud-b', name: '云端 B', fishes: [] },
];
assert.equal(
  selectAquariumSnapshot(cloudOnlyAquariums, ['missing-local-id', 'cloud-b'])?.id,
  'cloud-b',
  'a cloud aquarium must be selected without relying on a localStorage copy',
);

const calculatorSource = readFileSync(new URL('../src/components/CompatibilityRiskCalculator.tsx', import.meta.url), 'utf8');
assert.match(calculatorSource, /已经实际入缸，记录下来/);
assert.match(calculatorSource, /确认风险后再记录/);
assert.doesNotMatch(calculatorSource, /添加选中的新生物|确认风险后添加/);

console.log('addition intent policies verified: facts never block and plans remain safety-gated');

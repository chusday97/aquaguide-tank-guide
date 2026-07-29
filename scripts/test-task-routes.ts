import assert from 'node:assert/strict';
import { isAquariumTaskAction, taskRoutes } from '../src/services/navigation/task-routes';

assert.equal(taskRoutes.aquarium.addSpecies(), '/aquarium?action=add-species');
assert.equal(taskRoutes.aquarium.create(), '/aquarium?action=create');
assert.equal(taskRoutes.aquarium.create('onboarding'), '/aquarium?action=create&source=onboarding');
assert.equal(taskRoutes.aquarium.setup('onboarding'), '/aquarium?action=setup&source=onboarding');
assert.equal(
  taskRoutes.aquarium.addSpecies('species / 1'),
  '/aquarium?action=add-species&species=species%20%2F%201',
);
assert.equal(taskRoutes.aquarium.dailyCheck, '/aquarium?action=daily-check');
assert.equal(taskRoutes.aquarium.livestock, '/aquarium?action=livestock');
assert.equal(taskRoutes.aquarium.waterChange, '/aquarium?action=water-change');
assert.equal(taskRoutes.aquarium.settings('parameters'), '/aquarium#settings-parameters');
assert.equal(taskRoutes.encyclopedia.compatibility, '/encyclopedia?mode=compatibility');

for (const action of ['add-species', 'daily-check', 'livestock', 'water-change', 'create', 'setup']) {
  assert.equal(isAquariumTaskAction(action), true);
}
assert.equal(isAquariumTaskAction('unknown'), false);
assert.equal(isAquariumTaskAction(null), false);

console.log('任务路由契约测试通过。');

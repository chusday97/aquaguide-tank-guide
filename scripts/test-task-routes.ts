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
assert.equal(
  taskRoutes.aquarium.addSpecies('species-1', 'identify'),
  '/aquarium?action=add-species&species=species-1&source=identify',
);
assert.equal(taskRoutes.aquarium.dailyCheck, '/aquarium?action=daily-check');
assert.equal(taskRoutes.aquarium.dailyCheckFrom('onboarding'), '/aquarium?action=daily-check&source=onboarding');
assert.equal(taskRoutes.aquarium.livestock, '/aquarium?action=livestock');
assert.equal(taskRoutes.aquarium.waterChange, '/aquarium?action=water-change');
assert.equal(taskRoutes.aquarium.settings('parameters'), '/aquarium#settings-parameters');
assert.equal(taskRoutes.aquarium.settings('equipment', 'identify'), '/aquarium?source=identify#settings-equipment');

assert.equal(taskRoutes.encyclopedia.compatibility, '/encyclopedia?mode=compatibility');
assert.equal(taskRoutes.encyclopedia.compatibilityWith('onboarding'), '/encyclopedia?mode=compatibility&source=onboarding');
assert.equal(
  taskRoutes.encyclopedia.compatibilitySpecies('fish-1', 'identify'),
  '/encyclopedia?mode=compatibility&species=fish-1&source=identify',
);
assert.equal(
  taskRoutes.encyclopedia.browseWith({ difficulty: 'Easy', source: 'onboarding' }),
  '/encyclopedia?mode=browse&difficulty=Easy&source=onboarding',
);
assert.equal(taskRoutes.encyclopedia.species('fish / 1', 'search'), '/encyclopedia?mode=browse&species=fish+%2F+1&source=search');

assert.equal(taskRoutes.care.recommendations, '/care#care-recommendations');
assert.equal(taskRoutes.care.search, '/care#care-search');
assert.equal(taskRoutes.care.results, '/care#care-results');
assert.equal(taskRoutes.care.favorites, '/care#care-favorites');
assert.equal(taskRoutes.care.topic('guide / 1', 'care-plan'), '/care?topic=guide%20%2F%201&source=care-plan');

assert.equal(taskRoutes.collection.wishlist, '/collection/wishlist');
assert.equal(taskRoutes.collection.care, '/collection/care');
assert.equal(taskRoutes.collection.memorial, '/collection/memorial');
assert.equal(taskRoutes.collection.memorialDetail('record / 1'), '/collection/memorial/record%20%2F%201');
assert.equal(taskRoutes.identify.home, '/identify');
assert.equal(taskRoutes.search.query('betta fish', 'sidebar'), '/search?q=betta%20fish&source=sidebar');

for (const action of ['add-species', 'record-existing', 'plan-species', 'daily-check', 'livestock', 'water-change', 'create', 'setup']) {
  assert.equal(isAquariumTaskAction(action), true);
}
assert.equal(isAquariumTaskAction('settings'), false, 'settings is not an aquarium task action; use a settings deep link instead');
assert.equal(isAquariumTaskAction('unknown'), false);
assert.equal(isAquariumTaskAction(null), false);

console.log('任务路由契约测试通过。');

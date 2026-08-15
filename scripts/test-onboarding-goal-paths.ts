import assert from 'node:assert/strict';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const localStorage = new MemoryStorage();
const eventTarget = new EventTarget();
const fakeWindow = Object.assign(eventTarget, { localStorage, setTimeout, clearTimeout });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });

const { patchLocalAppState } = await import('../src/services/storage/local-app-state');
const { buildOnboardingTaskProgress, getOnboardingTasks } = await import('../src/services/onboarding/onboarding-paths');
const { recordTankCompatibility } = await import('../src/services/compatibility/compatibility-records.service');

const aquarium = {
  id: 'tank-1',
  name: '测试缸',
  fishes: [{ id: 'stock-1', fishId: 'fish-1', quantity: 1, entryDate: '2026-08-01', lastWaterChangeDate: '2026-08-01' }],
  dimensions: { length: '40', width: '25', height: '30' },
  waterType: 'Freshwater' as const,
  targetTemperature: '25',
  equipment: { filter: '无' as const },
};
patchLocalAppState({
  currentAquariumId: aquarium.id,
  aquariums: [aquarium],
  wishlist: ['fish-2'],
  onboarding: { version: 1, status: 'pending', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false },
});

let progress = buildOnboardingTaskProgress((await import('../src/services/storage/local-app-state')).loadAppStateFromStorage());
assert.equal(progress.aquariumReady, true, 'setup task completion must come from complete aquarium facts');
assert.equal(progress.speciesChosen, true);
assert.equal(progress.compatibilityCompleted, false, '收藏或加入物种不能代替完整混养判断');
const buildTankTasks = getOnboardingTasks('build_tank', progress);
const browseSpeciesTasks = getOnboardingTasks('browse_species', progress);
assert.deepEqual(buildTankTasks.map(task => task.id), ['setup_aquarium', 'choose_species', 'complete_compatibility', 'complete_daily_check']);
assert.deepEqual(browseSpeciesTasks.map(task => task.id), ['view_species', 'choose_species', 'setup_aquarium', 'complete_compatibility']);

assert.equal(buildTankTasks[0].route, '/aquarium?action=setup&source=onboarding', '完善鱼缸参数必须直接进入 setup task，而不是落在鱼缸首页');
assert.equal(buildTankTasks[1].route, '/encyclopedia?mode=browse&difficulty=Easy&source=onboarding', '选择物种必须直接进入筛选后的图鉴任务');
assert.equal(buildTankTasks[2].route, '/encyclopedia?mode=compatibility&source=onboarding', '混养任务必须直接进入混养模式');
assert.equal(buildTankTasks[3].route, '/aquarium?action=daily-check&source=onboarding', '每日检查必须直接进入巡检任务');
assert.equal(buildTankTasks.some(task => task.route.includes('action=settings')), false, '不得使用 Aquarium 不消费的伪 action=settings');

recordTankCompatibility({ aquariumId: aquarium.id, speciesIds: ['fish-1', 'fish-2'], status: 'compatible' });
progress = buildOnboardingTaskProgress((await import('../src/services/storage/local-app-state')).loadAppStateFromStorage());
assert.equal(progress.compatibilityCompleted, true);
assert.equal(progress.complete, false, '建缸路线仍需完成每日巡检');

patchLocalAppState({ onboarding: { version: 1, status: 'pending', goal: 'browse_species', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false } });
progress = buildOnboardingTaskProgress((await import('../src/services/storage/local-app-state')).loadAppStateFromStorage());
assert.equal(progress.complete, true, '浏览路线不额外要求每日巡检');
assert.equal(progress.completedCount, 4);
assert.equal(progress.totalCount, 4);

console.log('onboarding goal paths: factual tank readiness, real compatibility, direct task destinations, and goal-specific completion passed');
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

const aquarium = { id: 'tank-1', name: '测试缸', fishes: [{ id: 'stock-1', fishId: 'fish-1', quantity: 1, entryDate: '2026-08-01', lastWaterChangeDate: '2026-08-01' }], dimensions: { length: '40', width: '25', height: '30' } };
patchLocalAppState({
  currentAquariumId: aquarium.id,
  aquariums: [aquarium],
  wishlist: ['fish-2'],
  onboarding: { version: 1, status: 'pending', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false },
});

let progress = buildOnboardingTaskProgress((await import('../src/services/storage/local-app-state')).loadAppStateFromStorage());
assert.equal(progress.speciesChosen, true);
assert.equal(progress.compatibilityCompleted, false, '收藏或加入物种不能代替完整混养判断');
assert.deepEqual(getOnboardingTasks('build_tank', progress).map(task => task.id), ['setup_aquarium', 'choose_species', 'complete_compatibility', 'complete_daily_check']);
assert.deepEqual(getOnboardingTasks('browse_species', progress).map(task => task.id), ['view_species', 'choose_species', 'setup_aquarium', 'complete_compatibility']);

recordTankCompatibility({ aquariumId: aquarium.id, speciesIds: ['fish-1', 'fish-2'], status: 'compatible' });
progress = buildOnboardingTaskProgress((await import('../src/services/storage/local-app-state')).loadAppStateFromStorage());
assert.equal(progress.compatibilityCompleted, true);
assert.equal(progress.complete, false, '建缸路线仍需完成每日巡检');

patchLocalAppState({ onboarding: { version: 1, status: 'pending', goal: 'browse_species', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false } });
progress = buildOnboardingTaskProgress((await import('../src/services/storage/local-app-state')).loadAppStateFromStorage());
assert.equal(progress.complete, true, '浏览路线不额外要求每日巡检');
assert.equal(progress.completedCount, 4);
assert.equal(progress.totalCount, 4);

console.log('onboarding goal paths: real tank compatibility and goal-specific completion passed');

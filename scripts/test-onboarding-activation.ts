import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

class MemoryStorage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
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

const { loadAppStateFromStorage, patchLocalAppState } = await import('../src/services/storage/local-app-state');
const { buildOnboardingTaskProgress, getOnboardingTasks, hasHistoricalUserActivity } = await import('../src/services/onboarding/onboarding-paths');
const { recordTankCompatibility } = await import('../src/services/compatibility/compatibility-records.service');

const aquarium = {
  id: 'tank-activation',
  name: '验证鱼缸',
  fishes: [{ id: 'stock-1', fishId: 'fish-1', quantity: 1, entryDate: '2026-08-01', lastWaterChangeDate: '2026-08-01' }],
  dimensions: { length: '40', width: '25', height: '30' },
};

patchLocalAppState({
  currentAquariumId: aquarium.id,
  aquariums: [aquarium],
  wishlist: ['fish-2'],
  compatibilityRecords: [],
  onboarding: { version: 1, status: 'pending', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false },
});

let state = loadAppStateFromStorage();
let progress = buildOnboardingTaskProgress(state);
assert.equal(progress.speciesChosen, true);
assert.equal(progress.compatibilityCompleted, false, '收藏或已有生物不能替代完整适配');
assert.deepEqual(getOnboardingTasks('build_tank', progress).map(task => task.id), ['setup_aquarium', 'choose_species', 'complete_compatibility', 'complete_daily_check']);
assert.deepEqual(getOnboardingTasks('browse_species', progress).map(task => task.id), ['view_species', 'choose_species', 'setup_aquarium', 'complete_compatibility']);

recordTankCompatibility({ aquariumId: aquarium.id, speciesIds: ['fish-1', 'fish-2'], status: 'compatible' });
state = loadAppStateFromStorage();
progress = buildOnboardingTaskProgress(state);
assert.equal(progress.compatibilityCompleted, true);
assert.equal(progress.complete, false, '建缸路径仍需首次巡检');

patchLocalAppState({ onboarding: { version: 1, status: 'pending', goal: 'browse_species', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false } });
progress = buildOnboardingTaskProgress(loadAppStateFromStorage());
assert.equal(progress.complete, true, '浏览路径完成适配后不强制首次巡检');

patchLocalAppState({ onboarding: undefined });
assert.equal(hasHistoricalUserActivity(loadAppStateFromStorage()), true, '存在历史鱼缸、收藏或适配记录时不得强制欢迎页');

patchLocalAppState({
  currentAquariumId: null,
  aquariums: [],
  wishlist: [],
  compatibilityRecords: [],
  onboarding: { version: 1, status: 'pending', viewedSpecies: false, taskCardDismissed: false } as never,
});
progress = buildOnboardingTaskProgress(loadAppStateFromStorage());
assert.equal(progress.complete, false, '缺少旧版可选字段的 onboarding 数据必须安全读取');
assert.equal(getOnboardingTasks(undefined, progress)[0]?.id, 'setup_aquarium');
assert.equal(hasHistoricalUserActivity(loadAppStateFromStorage(), true), true, '历史养护活动也必须阻止强制欢迎页');

const taskCardSource = readFileSync(resolve('src/components/onboarding/OnboardingTaskCard.tsx'), 'utf8');
assert.match(taskCardSource, /getOnboardingTasks\(/, '任务卡必须使用统一任务定义');
assert.match(taskCardSource, /buildStarterChecklistArtifact\(\{ labels: tasks\.map/, '导出清单必须复用任务卡的同一任务集合');
assert.match(taskCardSource, /progress\.completedCount > 0/, '未完成任何真实任务时不得下载清单');

console.log('onboarding activation: goal order, real compatibility, legacy data and shared checklist passed');

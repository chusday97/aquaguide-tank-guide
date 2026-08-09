import assert from 'node:assert/strict';
import type { Fish } from '../src/types';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const localStorage = new MemoryStorage();
const fakeWindow = Object.assign(new EventTarget(), { localStorage, setTimeout, clearTimeout });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });

const { LocalAquaGuideRepository } = await import('../src/services/repository/local-aquaguide.repository');
const { recordExistingLivestock } = await import('../src/services/aquarium/livestock-recording.service');

const makeFish = (overrides: Partial<Fish> = {}): Fish => ({
  id: 'freshwater-test',
  name: '测试淡水鱼',
  scientificName: 'Testus aqua',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: '测试物种',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  ...overrides,
});

const freshwater = makeFish();
const saltwater = makeFish({ id: 'saltwater-test', name: '测试海水鱼', category: '海水观赏鱼' });
const freshwaterCompanion = makeFish({ id: 'freshwater-companion', name: '测试同伴鱼' });
const repository = new LocalAquaGuideRepository();

const created = await repository.createAquarium({
  name: '事实测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-factual-tank',
});
assert.equal(created.dimensions, undefined);
assert.equal(created.targetTemperature, undefined);
assert.equal(created.equipment, undefined);
assert.equal(created.lastWaterChangeDate, undefined);
assert.equal((await repository.createAquarium({
  name: '事实测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-factual-tank',
})).id, created.id, 'create replay must return the same local aquarium');

const incompleteResult = await recordExistingLivestock({
  repository,
  aquarium: created,
  items: [{ fishId: freshwater.id, quantity: 3, entryDate: '2026-08-09' }],
  speciesCatalog: [freshwater, saltwater],
  operationId: 'record-incomplete',
});
assert.equal(incompleteResult.aquarium.fishes[0].quantity, 3);
assert.equal(incompleteResult.assessment?.status, 'insufficient_data');
assert.equal(incompleteResult.policy, 'save_with_unknown');

const configured = await repository.saveAquarium({
  ...incompleteResult.aquarium,
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true },
});
const blockedReality = await recordExistingLivestock({
  repository,
  aquarium: configured,
  items: [{ fishId: saltwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: [freshwater, saltwater],
  operationId: 'record-blocked-reality',
});
assert.equal(blockedReality.assessment?.status, 'not_recommended');
assert.equal(blockedReality.policy, 'save_with_urgent_warning');
assert.ok(blockedReality.aquarium.fishes.some(item => item.fishId === saltwater.id), 'blocked reality must still persist');

const replay = await recordExistingLivestock({
  repository,
  aquarium: blockedReality.aquarium,
  items: [{ fishId: saltwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: [freshwater, saltwater],
  operationId: 'record-blocked-reality',
});
assert.equal(replay.aquarium.fishes.find(item => item.fishId === saltwater.id)?.quantity, 1, 'record replay must not duplicate quantity');
assert.equal((await repository.getAquariums())[0].fishes.length, 2, 'recorded facts must survive repository reload');

const partialTank = await repository.createAquarium({
  name: '部分失败测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-partial-tank',
});
let companionFailures = 1;
const partialRepository = {
  addLivestock: async (input: Parameters<typeof repository.addLivestock>[0]) => {
    if (input.speciesCatalogKey === freshwaterCompanion.id && companionFailures > 0) {
      companionFailures -= 1;
      throw new Error('模拟第二项网络失败');
    }
    return repository.addLivestock(input);
  },
};
const partialResult = await recordExistingLivestock({
  repository: partialRepository,
  aquarium: partialTank,
  items: [
    { fishId: freshwater.id, quantity: 2, entryDate: '2026-08-09' },
    { fishId: freshwaterCompanion.id, quantity: 1, entryDate: '2026-08-09' },
  ],
  speciesCatalog: [freshwater, freshwaterCompanion],
  operationId: 'record-partial',
});
assert.deepEqual(partialResult.savedItems.map(item => item.fishId), [freshwater.id]);
assert.deepEqual(partialResult.failedItems.map(item => item.fishId), [freshwaterCompanion.id]);
assert.equal(partialResult.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 2);
assert.equal(partialResult.aquarium.fishes.some(item => item.fishId === freshwaterCompanion.id), false);

const retriedPartial = await recordExistingLivestock({
  repository: partialRepository,
  aquarium: partialResult.aquarium,
  items: partialResult.failedItems,
  speciesCatalog: [freshwater, freshwaterCompanion],
  operationId: 'record-partial',
});
assert.equal(retriedPartial.failedItems.length, 0);
assert.equal(retriedPartial.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 2, 'successful item must not be duplicated while retrying failures');
assert.equal(retriedPartial.aquarium.fishes.find(item => item.fishId === freshwaterCompanion.id)?.quantity, 1);

const responseLossTank = await repository.createAquarium({
  name: '响应丢失测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-response-loss-tank',
});
let loseFirstResponse = true;
const responseLossRepository = {
  addLivestock: async (input: Parameters<typeof repository.addLivestock>[0]) => {
    const saved = await repository.addLivestock(input);
    if (loseFirstResponse) {
      loseFirstResponse = false;
      throw new Error('模拟服务端已提交但响应丢失');
    }
    return saved;
  },
};
await assert.rejects(recordExistingLivestock({
  repository: responseLossRepository,
  aquarium: responseLossTank,
  items: [{ fishId: freshwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: [freshwater],
  operationId: 'record-response-loss',
}), /模拟服务端已提交但响应丢失/);
const recoveredResponse = await recordExistingLivestock({
  repository: responseLossRepository,
  aquarium: responseLossTank,
  items: [{ fishId: freshwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: [freshwater],
  operationId: 'record-response-loss',
});
assert.equal(recoveredResponse.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 1, 'response-loss retry must reuse the operation and not duplicate quantity');

console.log('livestock recording verified: incomplete, blocked, replayed and partially failed facts preserve correct batches');

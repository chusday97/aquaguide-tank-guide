import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { LocalAquaGuideRepository } from '../src/services/repository/local-aquaguide.repository';
import { recordExistingLivestock } from '../src/services/aquarium/livestock-recording.service';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.get(key) ?? null; }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

const localStorage = new MemoryStorage();
const fakeWindow = Object.assign(new EventTarget(), { localStorage });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true });
Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });

const repository = new LocalAquaGuideRepository();
const freshwater = fishData.find(item => item.waterType === 'Freshwater') || fishData[0];
const saltwater = fishData.find(item => item.waterType === 'Saltwater') || fishData.find(item => /海水|Marine/i.test(item.category || ''));
const freshwaterCompanion = fishData.find(item => item.id !== freshwater.id && (item.waterType === 'Freshwater' || /淡水|Freshwater/i.test(item.category || '')))
  || fishData.find(item => item.id !== freshwater.id)
  || freshwater;

const incompleteTank = await repository.createAquarium({
  name: '记录现实测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-recording-test-tank',
});
const incompleteResult = await recordExistingLivestock({
  repository,
  aquarium: incompleteTank,
  items: [{ fishId: freshwater.id, quantity: 2, entryDate: '2026-08-09' }],
  speciesCatalog: fishData,
  operationId: 'record-incomplete',
});
assert.equal(incompleteResult.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 2);
assert.equal(incompleteResult.assessment?.status, 'insufficient_data');
assert.equal(incompleteResult.policy, 'save_with_unknown');

if (saltwater) {
  const configuredTank = await repository.saveAquarium({
    ...incompleteResult.aquarium,
    waterType: 'Freshwater',
    dimensions: { length: '60', width: '30', height: '30' },
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true },
  });
  const conflictResult = await recordExistingLivestock({
    repository,
    aquarium: configuredTank,
    items: [{ fishId: saltwater.id, quantity: 1, entryDate: '2026-08-09' }],
    speciesCatalog: fishData,
    operationId: 'record-conflict',
  });
  assert.ok(conflictResult.aquarium.fishes.some(item => item.fishId === saltwater.id));
  assert.equal(conflictResult.assessment?.status, 'not_recommended');
  assert.equal(conflictResult.policy, 'save_with_urgent_warning');
}

const replayTank = await repository.createAquarium({
  name: '重复记录测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-replay-tank',
});
const firstReplay = await recordExistingLivestock({
  repository,
  aquarium: replayTank,
  items: [{ fishId: freshwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: fishData,
  operationId: 'record-replay',
});
const secondReplay = await recordExistingLivestock({
  repository,
  aquarium: firstReplay.aquarium,
  items: [{ fishId: freshwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: fishData,
  operationId: 'record-replay',
});
assert.equal(secondReplay.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 1, 'same operation must not duplicate quantity');

const partialTank = await repository.createAquarium({
  name: '部分失败测试缸',
  startedAt: '2026-08-09',
  startedAtSource: 'created',
  operationId: 'create-partial-tank',
});
let failCompanionOnce = true;
const partialRepository = {
  addLivestock: async (input: Parameters<typeof repository.addLivestock>[0]) => {
    if (input.speciesCatalogKey === freshwaterCompanion.id && failCompanionOnce) {
      failCompanionOnce = false;
      throw new Error('模拟第二个物种保存失败');
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
assert.equal(partialResult.failedItems[0]?.message, '该生物没有保存成功，请重试。');
assert.equal(partialResult.failedItems[0]?.message.includes('模拟第二个物种保存失败'), false);
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
await assert.rejects(
  recordExistingLivestock({
    repository: responseLossRepository,
    aquarium: responseLossTank,
    items: [{ fishId: freshwater.id, quantity: 1, entryDate: '2026-08-09' }],
    speciesCatalog: [freshwater],
    operationId: 'record-response-loss',
  }),
  error => {
    assert.ok(error instanceof Error);
    assert.equal(error.message, '该生物没有保存成功，请重试。');
    assert.equal(error.message.includes('模拟服务端已提交但响应丢失'), false, 'raw repository failure must not escape the service boundary');
    return true;
  },
);
const recoveredResponse = await recordExistingLivestock({
  repository: responseLossRepository,
  aquarium: responseLossTank,
  items: [{ fishId: freshwater.id, quantity: 1, entryDate: '2026-08-09' }],
  speciesCatalog: [freshwater],
  operationId: 'record-response-loss',
});
assert.equal(recoveredResponse.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 1, 'response-loss retry must reuse the operation and not duplicate quantity');

console.log('livestock recording verified: incomplete, blocked, replayed, partially failed and response-loss retries preserve facts without exposing raw errors');

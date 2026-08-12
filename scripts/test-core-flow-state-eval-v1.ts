import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Aquarium, Fish } from '../src/types';

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

const { evaluateTankCompatibility, getTankCompatibilityAddPolicy } = await import('../src/lib/tankCompatibilityEngine');
const { executeSpeciesAddition } = await import('../src/services/aquarium/species-addition.service');
const { recordExistingLivestock } = await import('../src/services/aquarium/livestock-recording.service');
const { LocalAquaGuideRepository } = await import('../src/services/repository/local-aquaguide.repository');

const dataset = JSON.parse(readFileSync(resolve(import.meta.dirname, '../evaluation/product/core-flow-v1.json'), 'utf8')) as {
  version: number;
  cases: Array<{ id: string; featureId: string; state: string }>;
};
assert.equal(dataset.version, 1);
assert.ok(dataset.cases.length >= 12, 'core flow state evaluation must contain at least 12 cases');
for (const featureId of ['compatibility', 'add_livestock']) {
  const states = new Set(dataset.cases.filter(item => item.featureId === featureId).map(item => item.state));
  assert.ok(states.size >= 6, `${featureId} must have at least 6 executable/evaluable states`);
}

const expectedCaseIds = [
  'CF-COMP-001', 'CF-COMP-002', 'CF-COMP-003', 'CF-COMP-004', 'CF-COMP-005', 'CF-COMP-006',
  'CF-ADD-001', 'CF-ADD-002', 'CF-ADD-003', 'CF-ADD-004', 'CF-ADD-005', 'CF-ADD-006', 'CF-ADD-007', 'CF-ADD-008',
];
for (const id of expectedCaseIds) assert.ok(dataset.cases.some(item => item.id === id), `missing evaluation case ${id}`);

const makeFish = (overrides: Partial<Fish> = {}): Fish => ({
  id: 'peaceful-small-fish',
  name: '测试小型淡水鱼',
  scientificName: 'Testus freshwater',
  category: '淡水观赏鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '6.0-8.0',
  waterChangeCycle: 7,
  description: '和平的小型淡水鱼。',
  diet: '杂食',
  tankSize: '至少 20 升',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  ...overrides,
});

const makeTank = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'test-tank',
  name: '测试鱼缸',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '30' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  ...overrides,
});

const freshwater = makeFish();
const saltwater = makeFish({ id: 'saltwater-fish', name: '测试海水鱼', category: '海水观赏鱼' });
const companion = makeFish({ id: 'freshwater-companion', name: '测试同伴鱼' });

const compatible = evaluateTankCompatibility({ tank: makeTank(), candidateSpecies: freshwater });
assert.equal(compatible.status, 'compatible');
assert.equal(getTankCompatibilityAddPolicy(compatible.status), 'allow');

const cautionTank = makeTank({ equipment: { filter: '瀑布过滤', heater: false, oxygen: false, light: '普通灯' } });
const warmCandidate = makeFish({ id: 'warm-candidate', waterTemperature: '24-28°C' });
const caution = evaluateTankCompatibility({ tank: cautionTank, candidateSpecies: warmCandidate });
assert.equal(caution.status, 'caution');
assert.equal(getTankCompatibilityAddPolicy(caution.status), 'confirm');
const cautionBlocked = executeSpeciesAddition({
  aquariums: [cautionTank], aquarium: cautionTank,
  items: [{ fishId: warmCandidate.id, quantity: 1 }], speciesCatalog: [warmCandidate], confirmedCaution: false,
});
assert.equal(cautionBlocked.added, false);
assert.equal(cautionBlocked.reason, 'confirmation_required');
const cautionConfirmed = executeSpeciesAddition({
  aquariums: [cautionTank], aquarium: cautionTank,
  items: [{ fishId: warmCandidate.id, quantity: 1 }], speciesCatalog: [warmCandidate], confirmedCaution: true,
});
assert.equal(cautionConfirmed.added, true);

const incompleteCompatibility = evaluateTankCompatibility({
  tank: makeTank({ dimensions: undefined, targetTemperature: undefined }), candidateSpecies: freshwater,
});
assert.equal(incompleteCompatibility.status, 'insufficient_data');
assert.equal(getTankCompatibilityAddPolicy(incompleteCompatibility.status), 'complete_information');

const hardConflict = evaluateTankCompatibility({ tank: makeTank(), candidateSpecies: saltwater });
assert.equal(hardConflict.status, 'not_recommended');
assert.equal(getTankCompatibilityAddPolicy(hardConflict.status), 'block');
const conflictTank = makeTank();
const blockedPlan = executeSpeciesAddition({
  aquariums: [conflictTank], aquarium: conflictTank,
  items: [{ fishId: saltwater.id, quantity: 1 }], speciesCatalog: [saltwater], confirmedCaution: true,
});
assert.equal(blockedPlan.added, false);
assert.equal(blockedPlan.reason, 'blocked');

const repository = new LocalAquaGuideRepository();
const incompleteTank = await repository.createAquarium({
  name: '事实记录测试缸', startedAt: '2026-08-11', startedAtSource: 'created', operationId: 'cf-create-incomplete',
});
const savedUnknown = await recordExistingLivestock({
  repository, aquarium: incompleteTank,
  items: [{ fishId: freshwater.id, quantity: 2, entryDate: '2026-08-11' }],
  speciesCatalog: [freshwater, saltwater, companion], operationId: 'cf-record-unknown',
});
assert.equal(savedUnknown.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 2);
assert.equal(savedUnknown.assessment?.status, 'insufficient_data');
assert.equal(savedUnknown.policy, 'save_with_unknown');

const configuredTank = await repository.saveAquarium({
  ...savedUnknown.aquarium,
  dimensions: { length: '60', width: '30', height: '30' }, waterType: 'Freshwater', targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true },
});
const savedConflictReality = await recordExistingLivestock({
  repository, aquarium: configuredTank,
  items: [{ fishId: saltwater.id, quantity: 1, entryDate: '2026-08-11' }],
  speciesCatalog: [freshwater, saltwater, companion], operationId: 'cf-record-conflict-reality',
});
assert.ok(savedConflictReality.aquarium.fishes.some(item => item.fishId === saltwater.id));
assert.equal(savedConflictReality.assessment?.status, 'not_recommended');
assert.equal(savedConflictReality.policy, 'save_with_urgent_warning');

const partialTank = await repository.createAquarium({
  name: '部分失败测试缸', startedAt: '2026-08-11', startedAtSource: 'created', operationId: 'cf-create-partial',
});
let failCompanionOnce = true;
const partialRepository = {
  addLivestock: async (input: Parameters<typeof repository.addLivestock>[0]) => {
    if (input.speciesCatalogKey === companion.id && failCompanionOnce) {
      failCompanionOnce = false;
      throw new Error('HTTP 503 database connection refused: secret_internal_detail');
    }
    return repository.addLivestock(input);
  },
};
const partial = await recordExistingLivestock({
  repository: partialRepository, aquarium: partialTank,
  items: [
    { fishId: freshwater.id, quantity: 2, entryDate: '2026-08-11' },
    { fishId: companion.id, quantity: 1, entryDate: '2026-08-11' },
  ],
  speciesCatalog: [freshwater, companion], operationId: 'cf-partial',
});
assert.deepEqual(partial.savedItems.map(item => item.fishId), [freshwater.id]);
assert.deepEqual(partial.failedItems.map(item => item.fishId), [companion.id]);
assert.equal(partial.failedItems[0]?.message, '该生物没有保存成功，请重试。');
assert.equal(partial.failedItems[0]?.message.includes('HTTP'), false);
assert.equal(partial.failedItems[0]?.message.includes('database'), false);
assert.equal(partial.failedItems[0]?.message.includes('secret_internal_detail'), false);
assert.equal(partial.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 2);
assert.equal(partial.aquarium.fishes.some(item => item.fishId === companion.id), false);
const retried = await recordExistingLivestock({
  repository: partialRepository, aquarium: partial.aquarium,
  items: partial.failedItems, speciesCatalog: [freshwater, companion], operationId: 'cf-partial',
});
assert.equal(retried.failedItems.length, 0);
assert.equal(retried.aquarium.fishes.find(item => item.fishId === freshwater.id)?.quantity, 2, 'retry must not duplicate successful species');
assert.equal(retried.aquarium.fishes.find(item => item.fishId === companion.id)?.quantity, 1);

const replay = await recordExistingLivestock({
  repository, aquarium: savedConflictReality.aquarium,
  items: [{ fishId: saltwater.id, quantity: 1, entryDate: '2026-08-11' }],
  speciesCatalog: [freshwater, saltwater, companion], operationId: 'cf-record-conflict-reality',
});
assert.equal(replay.aquarium.fishes.find(item => item.fishId === saltwater.id)?.quantity, 1);

const calculatorSource = readFileSync(resolve(import.meta.dirname, '../src/components/CompatibilityRiskCalculator.tsx'), 'utf8');
assert.match(calculatorSource, /const \[recordError, setRecordError\] = useState\(''\)/, 'compatibility record failure needs an explicit UI state');
assert.match(calculatorSource, /catch \{\s*setRecordError\(isEn \? 'Could not save the livestock record\. Try again\.' : '入缸记录没有保存成功，请重试。'\)/s, 'compatibility record failure must become stable user-facing feedback');
assert.match(calculatorSource, /disabled=\{isRecording\}/, 'record CTA must be disabled during save');
assert.match(calculatorSource, /选择至少 1 种准备加入的生物后，这里会直接给出结论。/, 'initial state must explain what to select');

console.log(`核心流程状态验收 v1 通过：${dataset.cases.length} 个 Case，覆盖混养与添加生物的至少 6 种状态。`);

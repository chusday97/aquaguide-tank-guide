import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Aquarium, AquariumFish } from '../src/types';
import {
  appendSpeciesBatch,
  deleteSpeciesBatch,
  decrementSpeciesBatch,
  getAquariumBatchCareSignal,
  getSpeciesBatchContextLabel,
  mergeSpeciesBatches,
  normalizeSpeciesBatches,
  removeSpeciesBatchQuantity,
  splitSpeciesBatch,
  summarizeSpeciesBatches,
  updateSpeciesBatch,
  withNormalizedSpeciesBatches,
} from '../src/services/aquarium/species-batches.service';
import { executeSpeciesAddition } from '../src/services/aquarium/species-addition.service';
import { fishData } from '../src/data/fishData';

const legacy: AquariumFish = {
  id: 'record-1',
  fishId: fishData[0].id,
  quantity: 4,
  entryDate: '2026-07-20T00:00:00.000Z',
  lastWaterChangeDate: '2026-07-20T00:00:00.000Z',
};

const normalized = withNormalizedSpeciesBatches(legacy);
assert.equal(normalizeSpeciesBatches(normalized).length, 1);
assert.equal(normalized.quantity, 4, 'legacy backfill must preserve aggregate quantity');

const adult = updateSpeciesBatch(normalized, normalized.batches![0].id, { lifeStage: 'adult', reproductiveState: 'normal' });
const split = splitSpeciesBatch(adult, adult.batches![0].id, {
  quantity: 1,
  lifeStage: 'adult',
  reproductiveState: 'pregnant_or_gravid',
});
assert.equal(split.quantity, 4, 'splitting must not change total quantity');
assert.equal(split.batches?.length, 2);
assert.equal(summarizeSpeciesBatches(split).pregnant, 1);
assert.match(getSpeciesBatchContextLabel(split, false), /怀孕\/\u62b1卵 1/);
assert.equal(getAquariumBatchCareSignal([split], false)?.code, 'pregnant');

const appended = appendSpeciesBatch(split, { quantity: 2, entryDate: '2026-07-22T00:00:00.000Z', lifeStage: 'juvenile' });
assert.equal(appended.quantity, 6);
assert.equal(summarizeSpeciesBatches(appended).juvenile, 2);
const spawning = updateSpeciesBatch(appended, appended.batches![1].id, { reproductiveState: 'in_labor_or_spawning' });
assert.deepEqual(
  {
    code: getAquariumBatchCareSignal([spawning], false)?.code,
    priority: getAquariumBatchCareSignal([spawning], false)?.priority,
  },
  { code: 'spawning', priority: 'important' },
  'birthing/spawning must outrank other life-stage observations without changing stored quantity',
);
assert.equal(spawning.quantity, appended.quantity);
const aquariumPageSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const healthScoreBlock = aquariumPageSource.match(/const calculateHealthScore = \(\) => \{([\s\S]*?)const healthScore = calculateHealthScore\(\);/)?.[1] || '';
assert.doesNotMatch(healthScoreBlock, /lifeStage|reproductiveState|batchCareSignal/, 'life and reproductive states must not directly change the aquarium health score');

const afterDelete = deleteSpeciesBatch(appended, appended.batches![2].id);
assert.equal(afterDelete?.quantity, 4);
const onlyBatch = withNormalizedSpeciesBatches(legacy);
assert.equal(deleteSpeciesBatch(onlyBatch, onlyBatch.batches![0].id), null, 'deleting final batch removes parent species');
const decremented = decrementSpeciesBatch(split, split.batches![0].id);
assert.equal(decremented?.quantity, 3, 'decrementing a memorial batch must reduce aggregate quantity');
assert.equal(decremented?.batches?.find(batch => batch.id === split.batches![0].id)?.quantity, 2);
const partlyRemoved = removeSpeciesBatchQuantity(split, split.batches![0].id, 2);
assert.equal(partlyRemoved?.quantity, 2, 'partial removal must reduce aggregate quantity by the confirmed amount');
assert.equal(partlyRemoved?.batches?.find(batch => batch.id === split.batches![0].id)?.quantity, 1);
assert.equal(removeSpeciesBatchQuantity(split, split.batches![1].id, 1)?.quantity, 3, 'removing a full non-final batch keeps the parent species');
assert.throws(() => removeSpeciesBatchQuantity(split, split.batches![0].id, 4), /数量范围/, 'removal must reject quantities above the selected batch');
assert.throws(() => removeSpeciesBatchQuantity(split, split.batches![0].id, 1.5), /整数/, 'removal must reject decimal quantities instead of rounding');
assert.throws(() => removeSpeciesBatchQuantity(split, split.batches![0].id, Number.NaN), /整数/, 'removal must reject NaN');
assert.throws(() => removeSpeciesBatchQuantity(split, split.batches![0].id, 0), /整数/, 'removal must reject zero');
const mergeReady = updateSpeciesBatch(split, split.batches![1].id, { reproductiveState: 'normal' });
const merged = mergeSpeciesBatches(mergeReady, mergeReady.batches![0].id, mergeReady.batches![1].id);
assert.equal(merged.quantity, 4);
assert.equal(merged.batches?.length, 1, 'merging equal-state batches must preserve total quantity');

const aquarium: Aquarium = {
  id: 'tank-1',
  name: 'Test',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '36' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
};
const addition = executeSpeciesAddition({
  aquariums: [aquarium],
  aquarium,
  items: [{ fishId: fishData[0].id, quantity: 3, entryDate: '2026-07-22' }],
  speciesCatalog: fishData,
  confirmedCaution: true,
  now: '2026-07-22T00:00:00.000Z',
});
if (addition.added) {
  assert.equal(addition.aquariums[0].fishes[0].batches?.length, 1);
  assert.equal(addition.aquariums[0].fishes[0].quantity, 3);
}

console.log('species batch service verified: legacy, edit, split, append, confirmed quantity removal, delete and addition');

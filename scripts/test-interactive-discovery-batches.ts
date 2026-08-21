import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  INTERACTIVE_DISCOVERY_BATCH_SIZE,
  normalizeDiscoveryState,
  recommendationService,
} from '../src/modules/recommendation/recommendation.service';

const pool = fishData.filter(fish => Boolean(fish.image?.trim()));

const initial = recommendationService.createInteractiveDiscoveryBatch({
  speciesPool: pool,
  batchSize: INTERACTIVE_DISCOVERY_BATCH_SIZE,
});

assert.equal(initial.batchIds.length, INTERACTIVE_DISCOVERY_BATCH_SIZE, '首批必须显示 6 个物种');
assert.equal(new Set(initial.batchIds).size, INTERACTIVE_DISCOVERY_BATCH_SIZE, '首批物种不得重复');

let result = initial;
let seen = new Set(initial.batchIds);
for (let batch = 1; batch <= 5; batch += 1) {
  result = recommendationService.replaceInteractiveDiscoveryBatch({
    speciesPool: pool,
    state: result.state,
    batchSize: INTERACTIVE_DISCOVERY_BATCH_SIZE,
  });
  assert.equal(result.batchIds.length, INTERACTIVE_DISCOVERY_BATCH_SIZE, `第 ${batch + 1} 批必须显示 6 个物种`);
  assert.equal(result.batchIds.some(id => seen.has(id)), false, `第 ${batch + 1} 批不得与此前批次重叠`);
  result.batchIds.forEach(id => seen.add(id));
}

const persisted = normalizeDiscoveryState(JSON.parse(JSON.stringify(result.state)));
assert.deepEqual(persisted.sceneBatchIds, result.batchIds, '刷新兼容读取必须保留当前批次');
assert.deepEqual(persisted.sceneSeenIds, result.state.sceneSeenIds, '刷新兼容读取必须保留已浏览集合');

const smallPool = pool.slice(0, 8);
const smallInitial = recommendationService.createInteractiveDiscoveryBatch({ speciesPool: smallPool, batchSize: 6 });
const smallFinal = recommendationService.replaceInteractiveDiscoveryBatch({ speciesPool: smallPool, state: smallInitial.state, batchSize: 6 });
assert.equal(smallFinal.batchIds.length, 2, '可用物种不足一批时必须显示剩余物种');
const exhausted = recommendationService.replaceInteractiveDiscoveryBatch({ speciesPool: smallPool, state: smallFinal.state, batchSize: 6 });
assert.equal(exhausted.complete, true, '全部浏览后必须进入明确完成状态');
assert.equal(exhausted.batchIds.length, 0, '完成状态不得悄悄回退成旧物种');

const restarted = recommendationService.restartInteractiveDiscoveryBatches({ speciesPool: smallPool, state: exhausted.state, batchSize: 6 });
assert.equal(restarted.complete, false, '用户明确重新开始后才能解除完成状态');
assert.equal(restarted.batchIds.length, 6, '重新开始后应生成新的首批');

console.log('Interactive discovery batch checks passed.');

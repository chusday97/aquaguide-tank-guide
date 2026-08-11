import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

const matrix = JSON.parse(await read('evaluation/product/feature-states.v1.json'));
assert.equal(matrix.version, 1, 'product evaluation dataset version must be explicit');
assert.ok(Number.isInteger(matrix.minimumStatesPerFeature) && matrix.minimumStatesPerFeature >= 6, 'minimumStatesPerFeature must be at least 6');
assert.ok(Array.isArray(matrix.features) && matrix.features.length >= 10, 'core product feature registry is unexpectedly small');

const featureIds = new Set();
for (const feature of matrix.features) {
  assert.ok(typeof feature.id === 'string' && feature.id.trim(), 'feature id is required');
  assert.ok(typeof feature.name === 'string' && feature.name.trim(), `${feature.id}: feature name is required`);
  assert.equal(featureIds.has(feature.id), false, `${feature.id}: duplicate feature id`);
  featureIds.add(feature.id);
  assert.ok(Array.isArray(feature.states), `${feature.id}: states must be an array`);
  assert.ok(feature.states.length >= matrix.minimumStatesPerFeature, `${feature.id}: expected at least ${matrix.minimumStatesPerFeature} states, got ${feature.states.length}`);
  const stateIds = new Set();
  for (const state of feature.states) {
    assert.ok(typeof state.id === 'string' && state.id.trim(), `${feature.id}: state id is required`);
    assert.equal(stateIds.has(state.id), false, `${feature.id}: duplicate state id ${state.id}`);
    stateIds.add(state.id);
    for (const key of ['scenario', 'expected', 'forbidden']) {
      assert.ok(typeof state[key] === 'string' && state[key].trim(), `${feature.id}/${state.id}: ${key} is required`);
    }
  }
}

const badcaseText = (await read('evaluation/product/badcases.v1.jsonl')).trim();
const badcases = badcaseText ? badcaseText.split(/\r?\n/).map(line => JSON.parse(line)) : [];
assert.ok(badcases.length > 0, 'product badcase registry must not stay empty');
const badcaseIds = new Set();
for (const badcase of badcases) {
  for (const key of ['id', 'featureId', 'discoveredAt', 'source', 'severity', 'symptom', 'trigger', 'expected', 'actual', 'rootCauseLayer', 'status', 'regression']) {
    assert.ok(typeof badcase[key] === 'string' && badcase[key].trim(), `${badcase.id || 'unknown badcase'}: ${key} is required`);
  }
  assert.equal(badcaseIds.has(badcase.id), false, `${badcase.id}: duplicate badcase id`);
  badcaseIds.add(badcase.id);
  assert.ok(featureIds.has(badcase.featureId) || badcase.featureId === 'evaluation_system', `${badcase.id}: unknown featureId ${badcase.featureId}`);
  assert.ok(['low', 'medium', 'high', 'critical'].includes(badcase.severity), `${badcase.id}: unsupported severity`);
  assert.ok(['open', 'investigating', 'fixed', 'regression_verified', 'wont_fix'].includes(badcase.status), `${badcase.id}: unsupported status`);
}

const evaluationReadme = await read('evaluation/README.md');
assert.ok(evaluationReadme.includes('evaluation/product/'), 'evaluation README must link the product evaluation dataset');
assert.ok(evaluationReadme.includes('evaluation/badcases/registry.jsonl'), 'evaluation README must point to the real AI badcase registry path');
assert.equal(evaluationReadme.includes('失败进入 `badcases/registry.jsonl`'), false, 'stale badcase path must not return');

console.log(`产品评测集通过：${matrix.features.length} 个功能，${matrix.features.reduce((sum, feature) => sum + feature.states.length, 0)} 个状态，${badcases.length} 个 Badcase。`);

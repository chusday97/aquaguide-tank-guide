import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};

const tank = (length: number, width: number, height: number, temperature: number): Aquarium => ({
  id: 'user-conclusion-tank',
  name: '用户结论测试缸',
  fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater',
  targetTemperature: String(temperature),
  equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
});

const underGroupedNeon = evaluateTankCompatibility({
  tank: tank(70, 30, 40, 24),
  candidateSpecies: byId('sp_0431'),
  candidateQuantity: 7,
});
assert.equal(underGroupedNeon.status, 'caution');
assert.ok(underGroupedNeon.warningRules.some(rule => rule.code === 'group_requirement_gap'));
assert.ok(underGroupedNeon.suggestions.some(item => item.includes('最低群体数量')));
assert.ok(underGroupedNeon.suggestions.every(item => !item.includes('移除阻断风险')));

const goldRamWithPanda = evaluateTankCompatibility({
  tank: tank(100, 40, 30, 25),
  existingSpecies: [{ species: byId('sp_0016'), record: { quantity: 2 } }],
  candidateSpecies: byId('sp_0443'),
  candidateQuantity: 6,
});
assert.equal(goldRamWithPanda.status, 'caution');
assert.equal(goldRamWithPanda.missingData.length, 0);
assert.ok(goldRamWithPanda.warningRules.some(rule => rule.code === 'territorial_pressure_context'));
assert.ok(goldRamWithPanda.suggestions.some(item => item.includes('主要风险项')));
assert.ok(goldRamWithPanda.suggestions.every(item => !item.includes('更换候选生物')));
assert.ok(goldRamWithPanda.suggestions.every(item => !item.includes('资料尚未审核')));

const channaWithNeon = evaluateTankCompatibility({
  tank: tank(120, 50, 40, 24),
  existingSpecies: [{ species: byId('sp_0431'), record: { quantity: 10 } }],
  candidateSpecies: byId('sp_0049'),
  candidateQuantity: 1,
});
assert.equal(channaWithNeon.status, 'not_recommended');
assert.ok(channaWithNeon.blockingRules.some(rule => rule.code === 'predation_risk'));
assert.ok(channaWithNeon.suggestions.some(item => item.includes('阻断')));

console.log('compatibility user conclusion contract passed: backend status-specific actions and reviewed evidence safety; presentation copy remains governed by current main');

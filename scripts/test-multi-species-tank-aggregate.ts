import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing catalog fish ${id}`);
  return fish;
};

const tank: Aquarium = {
  id: 'multi-species-aggregate-tank',
  name: '多物种整缸聚合测试',
  fishes: [],
  // 63 L nominal volume. Two 10-fish Small groups screen below the coarse
  // bioload threshold; all three groups together cross the elevated threshold.
  dimensions: { length: '60', width: '30', height: '35' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const items = [
  { species: byId('sp_0011'), quantity: 10 }, // 月光鱼
  { species: byId('sp_0012'), quantity: 10 }, // 樱桃灯
  { species: byId('sp_0013'), quantity: 10 }, // 小精灵
];

const decision = evaluateCompatibilityDecision({ tank, items });
assert.equal(decision.pairResults.length, 3, 'three species must retain three pairwise explanations');
assert.ok(decision.tankAggregateResult, '3+ species must produce a whole-tank aggregate result');

const pairBioloadRules = decision.pairResults.flatMap(pair => pair.rawResult.warningRules)
  .filter(rule => rule.code.startsWith('bioload_screening_'));
assert.equal(pairBioloadRules.length, 0, 'no two-species pair should cross the cumulative bioload threshold in this fixture');

assert.ok(
  decision.tankAggregateResult?.warningRules.some(rule => rule.code === 'bioload_screening_elevated'),
  'whole-tank evaluation must surface cumulative bioload pressure that pairwise checks miss',
);
assert.ok(
  decision.warningRules.some(rule => rule.code === 'bioload_screening_elevated'),
  'overall verdict must retain whole-tank-only warnings',
);
assert.equal(decision.status, 'caution', 'whole-tank cumulative pressure must affect the overall verdict');
assert.match(
  decision.summary,
  /负荷/,
  'when the whole-tank pass adds a new cumulative risk, the direct summary must lead with that tank-level reason',
);

const legacyLoadWarning = decision.warningRules.find(rule => rule.code === 'bioload_near_limit');
assert.ok(legacyLoadWarning, 'fixture should retain the coarse legacy load warning as supporting context');
assert.equal(
  legacyLoadWarning.evidence.split('该数值只用于粗略筛查，不代表硬性安全上限。').length - 1,
  1,
  'soft-capacity disclaimer must stay idempotent when results are aggregated repeatedly',
);

const twoSpeciesDecision = evaluateCompatibilityDecision({ tank, items: items.slice(0, 2) });
assert.equal(twoSpeciesDecision.tankAggregateResult, undefined, '1–2 species must preserve the existing pairwise-only path');

console.log('multi-species tank aggregate passed: pairwise explanations + whole-tank cumulative constraints');

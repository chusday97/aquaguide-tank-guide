import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};

const tank: Aquarium = {
  id: 'complex-badcase-tank',
  name: '复杂组合 badcase',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

// One candidate simultaneously hits a reviewed single-housing block plus predation,
// territorial pressure, water/space and schooling warnings from multiple existing species.
const blocked = evaluateTankCompatibility({
  tank,
  existingSpecies: [
    { species: byId('sp_0016'), record: { quantity: 2 } },
    { species: byId('sp_0049'), record: { quantity: 1 } },
  ],
  candidateSpecies: byId('sp_0001'),
  candidateQuantity: 2,
});
assert.equal(blocked.status, 'not_recommended');
assert.ok(blocked.blockingRules.some(rule => rule.code === 'single_housing_required'));
for (const expected of ['predation_vulnerability_context', 'territorial_pressure_context', 'group_requirement_gap']) {
  assert.ok(blocked.warningRules.some(rule => rule.code === expected), 'missing complex warning ' + expected);
}
assert.deepEqual(
  [...new Set(blocked.suggestions)],
  blocked.suggestions,
  'complex rule fan-out must not duplicate user actions',
);
assert.equal(
  blocked.suggestions.some(item => item.includes('阻断')),
  true,
  'hard block must dominate the action recommendation',
);
assert.equal(
  blocked.suggestions.some(item => item.includes('最低群体数量')),
  false,
  'lower-severity schooling advice must not displace a hard-block action',
);

// Without a hard block, simultaneous territorial + schooling risks remain caution
// and the actionable group-size fix wins over generic caution language.
const caution = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: byId('sp_0016'), record: { quantity: 2 } }],
  candidateSpecies: byId('sp_0443'),
  candidateQuantity: 2,
});
assert.equal(caution.status, 'caution');
assert.ok(caution.warningRules.some(rule => rule.code === 'territorial_pressure_context'));
assert.ok(caution.warningRules.some(rule => rule.code === 'group_requirement_gap'));
assert.equal(caution.suggestions.some(item => item.includes('最低群体数量')), true);
assert.equal(caution.blockingRules.length, 0);

console.log('complex compatibility badcases passed: hard-block priority, multi-risk retention and action dedupe');

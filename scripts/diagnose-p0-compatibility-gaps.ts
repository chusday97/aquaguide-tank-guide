import type { Aquarium, Fish } from '../src/types';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';

const fish = (id: string, overrides: Partial<Fish> = {}): Fish => ({
  id, name: id, scientificName: `Testus ${id}`, category: '淡水观赏鱼', image: '',
  difficulty: 'Easy', waterTemperature: '22-28°C', phLevel: '6.0-8.0',
  waterChangeCycle: 7, description: '测试物种。', diet: '杂食', tankSize: '至少 20 升',
  temperament: 'Peaceful', size: 'Small', housingMode: '适合混养', ...overrides,
});

const tank = (dimensions = { length: '40', width: '25', height: '30' }): Aquarium => ({
  id: 'p0-tank', name: 'P0 test tank', fishes: [], dimensions, waterType: 'Freshwater',
  targetTemperature: '25', equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
});

const allRules = (result: ReturnType<typeof evaluateTankCompatibility>) => [
  ...result.blockingRules, ...result.warningRules, ...result.passedRules, ...result.missingData,
];
const loadRate = (result: ReturnType<typeof evaluateTankCompatibility>) => {
  const rule = allRules(result).find(item => /bioload|负荷|负载/.test(`${item.code} ${item.title}`));
  return Number(rule?.evidence.match(/(\d+)%/)?.[1] || NaN);
};

const checks: Array<[string, boolean, string]> = [];
const peaceful = fish('medium-peaceful', { size: 'Medium', temperament: 'Peaceful' });
const aggressive = fish('medium-aggressive', { size: 'Medium', temperament: 'Aggressive' });
const peacefulRate = loadRate(evaluateTankCompatibility({ tank: tank(), candidateSpecies: peaceful, candidateQuantity: 2 }));
const aggressiveRate = loadRate(evaluateTankCompatibility({ tank: tank(), candidateSpecies: aggressive, candidateQuantity: 2 }));
checks.push(['AQ-SPACE-003 temperament must not inflate bioload', peacefulRate === aggressiveRate, `peaceful=${peacefulRate}% aggressive=${aggressiveRate}%`]);

const largePeaceful = fish('large-peaceful', { size: 'Large', temperament: 'Peaceful', tankSize: '至少 80 升' });
const smallCandidate = fish('small-candidate');
const fitWithLarge = evaluateSpeciesForAquarium(smallCandidate, tank({ length: '100', width: '40', height: '40' }), [{ species: largePeaceful, record: { quantity: 1 } }]);
checks.push(['AQ-MIX-003 Large is not automatically predatory', !fitWithLarge.hardBlocks.some(item => item.type === 'predation_risk'), fitWithLarge.hardBlocks.map(item => item.type).join(',') || 'no hard block']);

const guidelineFish = fish('guideline-fish', { size: 'Medium', tankSize: '至少 64 升' });
const guidelineFit = evaluateSpeciesForAquarium(guidelineFish, tank(), []);
checks.push(['AQ-MIX-007 ordinary tank-size guidance is not an implicit hard constraint', !guidelineFit.hardBlocks.some(item => item.type === 'volume_too_small'), `${guidelineFit.status}: ${guidelineFit.hardBlocks.map(item => item.type).join(',')}`]);

const group = [fish('group-a'), fish('group-b'), fish('group-c')];
const whole = evaluateCompatibilityDecision({ tank: tank(), items: group.map(species => ({ species, quantity: 7 })) });
const aggregateRates = [...whole.blockingRules, ...whole.warningRules, ...whole.passedRules]
  .filter(item => /bioload|负荷|负载/.test(`${item.code} ${item.title}`))
  .map(item => Number(item.evidence.match(/(\d+)%/)?.[1] || 0));
const maxAggregateRate = Math.max(0, ...aggregateRates);
checks.push(['AQ-MIX-006 whole-tank quantity must be evaluated outside pair loops', maxAggregateRate >= 100, `3 × 7 small fish; aggregate bioload evidence max=${maxAggregateRate}%`]);

let failed = 0;
for (const [name, ok, detail] of checks) {
  if (ok) console.log(`PASS ${name} — ${detail}`);
  else { failed += 1; console.error(`FAIL ${name} — ${detail}`); }
}
console.log(`P0 compatibility product-truth diagnostic: ${checks.length - failed}/${checks.length} pass`);
if (failed > 0) process.exitCode = 1;

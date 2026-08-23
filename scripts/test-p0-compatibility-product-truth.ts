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
const rules = (result: ReturnType<typeof evaluateTankCompatibility>) => [
  ...result.blockingRules, ...result.warningRules, ...result.passedRules, ...result.missingData,
];
const bioloadCode = (result: ReturnType<typeof evaluateTankCompatibility>) => (
  rules(result).find(item => item.code.startsWith('bioload_screen_'))?.code
);

const checks: Array<[string, boolean, string]> = [];
const peaceful = fish('medium-peaceful', { size: 'Medium', temperament: 'Peaceful' });
const aggressive = fish('medium-aggressive', { size: 'Medium', temperament: 'Aggressive' });
const peacefulResult = evaluateTankCompatibility({ tank: tank(), candidateSpecies: peaceful, candidateQuantity: 2 });
const aggressiveResult = evaluateTankCompatibility({ tank: tank(), candidateSpecies: aggressive, candidateQuantity: 2 });
checks.push(['AQ-SPACE-003 temperament must not inflate bioload', bioloadCode(peacefulResult) === bioloadCode(aggressiveResult), `${bioloadCode(peacefulResult)} vs ${bioloadCode(aggressiveResult)}`]);

const largePeaceful = fish('large-peaceful', { size: 'Large', temperament: 'Peaceful', tankSize: '至少 80 升' });
const fitWithLarge = evaluateSpeciesForAquarium(fish('small-candidate'), tank({ length: '100', width: '40', height: '40' }), [{ species: largePeaceful, record: { quantity: 1 } }]);
checks.push(['AQ-MIX-003 Large is not automatically predatory', !fitWithLarge.hardBlocks.some(item => item.type === 'predation_risk'), fitWithLarge.hardBlocks.map(item => item.type).join(',') || 'no predation hard block']);

const guidelineFit = evaluateSpeciesForAquarium(fish('guideline-fish', { size: 'Medium', tankSize: '至少 64 升' }), tank(), []);
checks.push(['AQ-MIX-007 ordinary tank-size guidance is not a hard constraint', !guidelineFit.hardBlocks.some(item => item.type === 'volume_too_small') && guidelineFit.warnings.some(item => item.type === 'volume_guideline_gap_high'), `${guidelineFit.status}: ${guidelineFit.warnings.map(item => item.type).join(',')}`]);

const group = [fish('group-a'), fish('group-b'), fish('group-c')];
const whole = evaluateCompatibilityDecision({ tank: tank(), items: group.map(species => ({ species, quantity: 7 })) });
checks.push(['AQ-MIX-006 whole-tank feasibility counts each animal once outside pair loops', whole.wholeTankFeasibility.totalQuantity === 21 && whole.wholeTankFeasibility.bioloadPressure === 'high' && whole.wholeTankFeasibility.status === 'caution' && whole.wholeTankFeasibility.rules.some(rule => rule.code === 'whole_tank_bioload_screen_high'), JSON.stringify(whole.wholeTankFeasibility)]);

const highLoad = evaluateTankCompatibility({ tank: tank(), candidateSpecies: fish('many-small'), candidateQuantity: 20 });
checks.push(['AQ-SPACE-004 heuristic bioload cannot hard-block by itself', highLoad.status !== 'not_recommended' && highLoad.blockingRules.every(rule => !rule.code.startsWith('bioload_')) && highLoad.warningRules.some(rule => rule.code === 'bioload_screen_high'), `${highLoad.status}: blocking=${highLoad.blockingRules.map(rule => rule.code).join(',')} warning=${highLoad.warningRules.map(rule => rule.code).join(',')}`]);

let failed = 0;
for (const [name, ok, detail] of checks) {
  if (ok) console.log(`PASS ${name} — ${detail}`);
  else { failed += 1; console.error(`FAIL ${name} — ${detail}`); }
}
console.log(`P0 compatibility product-truth regression: ${checks.length - failed}/${checks.length} pass`);
if (failed > 0) process.exitCode = 1;

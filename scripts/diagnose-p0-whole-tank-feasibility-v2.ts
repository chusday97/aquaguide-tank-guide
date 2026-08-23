import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium } from '../src/types';

const tigerBarb = fishData.find(item => item.id === 'sp_0439');
if (!tigerBarb) throw new Error('sp_0439 tiger barb fixture missing');

const tank: Aquarium = {
  id: 'whole-tank-v2',
  name: 'Whole Tank V2',
  fishes: [],
  dimensions: { length: '20', width: '20', height: '20' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const decision = evaluateCompatibilityDecision({
  tank,
  items: [{ species: tigerBarb, quantity: 3, origin: 'candidate' }],
});
const whole = decision.wholeTankFeasibility as any;
const checks = [
  [
    'AQ-MIX-006 group requirement is evaluated once at whole-tank level',
    whole.dimensions?.groupRequirement?.status === 'caution'
      && whole.rules?.some((rule: any) => rule.code === 'whole_tank_group_requirement_gap'),
  ],
  [
    'AQ-SPACE-002 physical-space guideline is a separate whole-tank dimension',
    whole.dimensions?.physicalSpace?.status === 'caution'
      && whole.rules?.some((rule: any) => rule.code === 'whole_tank_space_guideline_pressure'),
  ],
  [
    'AQ-MIX-005 equipment sufficiency is not falsely marked pass without reviewed requirements',
    whole.dimensions?.equipment?.status === 'unknown'
      && whole.rules?.some((rule: any) => rule.code === 'whole_tank_equipment_requirement_unreviewed'),
  ],
] as const;

let passed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (ok) passed += 1;
}
console.log(`P0 Whole-Tank Feasibility V2 fail-before: ${passed}/${checks.length} pass`);
process.exit(passed === checks.length ? 0 : 1);

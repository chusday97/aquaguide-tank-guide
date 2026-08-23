import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { buildTankPriorsFromCompatibilityDecision } from '../src/services/aquarium/tank-state-evidence.service';
import type { Aquarium, Fish } from '../src/types';

const species = (id: string) => {
  const found = fishData.find(item => item.id === id);
  if (!found) throw new Error(`Missing species fixture: ${id}`);
  return found;
};
const tigerBarb = species('sp_0439');
const neonTetra = species('sp_0431');

const tank = (overrides: Partial<Aquarium> = {}): Aquarium => ({
  id: 'whole-tank-v2',
  name: 'Whole Tank V2',
  fishes: [],
  dimensions: { length: '100', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  ...overrides,
});
const decide = (aquarium: Aquarium, fish: Fish, quantity: number) => evaluateCompatibilityDecision({
  tank: aquarium,
  items: [{ species: fish, quantity, origin: 'candidate' }],
});

const cases = [
  {
    name: 'AQ-MIX-006 reviewed group requirement is evaluated once across whole tank',
    run: () => {
      const decision = decide(tank(), tigerBarb, 3);
      const dimension = decision.wholeTankFeasibility.dimensions.groupRequirement;
      assert.equal(dimension.status, 'caution');
      const rule = dimension.warningRules.find(item => item.code === 'whole_tank_group_requirement_gap');
      assert.ok(rule);
      assert.equal(rule.reviewStatus, 'reviewed');
      assert.match(rule.evidence, /合计 3.*minimumGroupSize 为 6/);
    },
  },
  {
    name: 'reviewed minimumGroupSize=5 is not overwritten by legacy keyword=6 heuristic',
    run: () => {
      const decision = decide(tank(), neonTetra, 5);
      assert.equal(decision.wholeTankFeasibility.dimensions.groupRequirement.status, 'pass');
      assert.ok(decision.wholeTankFeasibility.passedRules.some(rule => rule.code === 'whole_tank_group_requirement_met'));
      assert.ok(!decision.warningRules.some(rule => rule.code === 'schooling_quantity_low'));
    },
  },
  {
    name: 'AQ-SPACE-002 generic tank-size guidance is separate physical-space pressure, never hard block',
    run: () => {
      const decision = decide(tank({ dimensions: { length: '20', width: '20', height: '20' } }), tigerBarb, 6);
      const dimension = decision.wholeTankFeasibility.dimensions.physicalSpace;
      assert.equal(dimension.status, 'caution');
      const rule = dimension.warningRules.find(item => item.code === 'whole_tank_space_guideline_pressure');
      assert.ok(rule);
      assert.equal(rule.confidence, 'low');
      assert.equal(rule.reviewStatus, 'draft');
      assert.ok(!decision.blockingRules.some(item => /whole_tank_space|volume_guideline/.test(item.code)));
    },
  },
  {
    name: 'AQ-MIX-005 configured equipment is not falsely called sufficient without reviewed requirements',
    run: () => {
      const decision = decide(tank(), neonTetra, 5);
      const dimension = decision.wholeTankFeasibility.dimensions.equipment;
      assert.equal(dimension.status, 'unknown');
      const gap = dimension.missingData.find(item => item.code === 'whole_tank_equipment_requirement_unreviewed');
      assert.ok(gap);
      assert.equal(gap.severity, 'low');
    },
  },
  {
    name: 'missing equipment context is material unknown instead of fabricated sufficiency',
    run: () => {
      const decision = decide(tank({ equipment: undefined }), neonTetra, 5);
      assert.equal(decision.wholeTankFeasibility.dimensions.equipment.status, 'unknown');
      assert.ok(decision.wholeTankFeasibility.missingData.some(item => item.code === 'whole_tank_equipment_context_missing' && item.severity === 'medium'));
      assert.equal(decision.status, 'insufficient_data');
    },
  },
  {
    name: 'whole-tank pass rules never become Current Tank medium priors',
    run: () => {
      const decision = decide(tank(), neonTetra, 5);
      assert.ok(decision.wholeTankFeasibility.passedRules.some(rule => rule.code === 'whole_tank_bioload_screen_low'));
      const priors = buildTankPriorsFromCompatibilityDecision(decision);
      assert.ok(!priors.some(prior => prior.code === 'whole_tank_bioload_screen_low'));
      assert.ok(!priors.some(prior => prior.code === 'whole_tank_group_requirement_met'));
    },
  },
  {
    name: 'recommendation consumer cannot reintroduce temperament-bioload or keyword group authority',
    run: () => {
      const source = readFileSync(new URL('../src/modules/recommendation/recommendation.service.ts', import.meta.url), 'utf8');
      assert.doesNotMatch(source, /temperamentMultiplier/);
      assert.match(source, /getReviewedCompatibilityProfile\(fish\.id\)\?\.minimumGroupSize/);
      assert.doesNotMatch(source, /if \(\/灯\|群游\|斑马/);
    },
  },
];

let failed = 0;
for (const testCase of cases) {
  try {
    testCase.run();
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
  }
}
if (failed > 0) process.exitCode = 1;
else console.log(`P0 Whole-Tank Feasibility V2: ${cases.length}/${cases.length} PASS`);

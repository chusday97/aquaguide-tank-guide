import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';
import {
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
  prioritizePlannedAdditionBlockingRules,
} from '../src/services/compatibility/compatibility-action.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing species fixture ${id}`);
  return species;
};

const minimumQuantity = (id: string) => Math.max(
  1,
  getReviewedCompatibilityProfile(id)?.minimumGroupSize || 1,
);

const tank: Aquarium = {
  id: 'priority-compression-canary',
  name: 'Priority Compression Canary',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

// Six distinct blocking families are intentionally present. The user-facing
// conclusion must expose only the two highest-priority biological decisions.
const complexRows: Array<[string, number]> = [
  ['sp_0431', 10],
  ['sp_0435', 8],
  ['sp_0453', 1],
  ['sp_0050', 1],
  ['sp_0448', 1],
];

const plannedDecision = evaluateCompatibilityDecision({
  tank,
  items: complexRows.map(([id, quantity], index) => ({
    species: byId(id),
    quantity,
    origin: index < 2 ? 'existing' : 'candidate',
  })),
});
assert.equal(plannedDecision.status, 'not_recommended');
const blockingFamilies = prioritizeDistinctCompatibilityRules(plannedDecision.blockingRules)
  .map(rule => getCompatibilityRuleFamily(rule.code));
assert.deepEqual(
  blockingFamilies.slice(0, 4),
  ['water_type', 'predation', 'housing', 'temperature'],
  'deterministic authority must keep biological hard blocks ahead of adjustable planning issues',
);
assert.ok(blockingFamilies.length >= 5, 'fixture must remain a genuinely complex multi-risk tank');

const plannedPlan = buildCompatibilityDecisionPlan(plannedDecision, 'planned_addition');
assert.ok(plannedPlan.riskSummary.length <= 3);
assert.ok(plannedPlan.nextSteps.length <= 2);
assert.deepEqual(
  plannedPlan.evidence.sourceRuleCodes.map(getCompatibilityRuleFamily),
  ['housing', 'temperature'],
  'top-2 must cover independent resolution targets instead of spending both slots on pair conflicts already subsumed by species-only housing',
);
assert.equal(plannedPlan.riskSummary.length, plannedPlan.evidence.sourceRuleCodes.length);
assert.ok(plannedPlan.evidence.evidenceIds.length > 0);
assert.match(plannedPlan.riskSummary[0] || '', /物种缸|单独|单养/);
assert.match(plannedPlan.riskSummary[1] || '', /温度|水温|适温/);
assert.match(plannedPlan.nextSteps[0] || '', /单养|更换更适合混养/);
assert.match(plannedPlan.nextSteps[1] || '', /温度|分缸|更换温度需求更接近/);
assert.doesNotMatch(plannedPlan.nextSteps.join(' '), /先处理下面的明确阻断风险/);
assert.doesNotMatch(plannedPlan.nextSteps.join(' '), /观察看看|继续观察/);
assert.match(plannedPlan.stopCondition, /不要执行当前混养计划/);

const coverageOrder = prioritizePlannedAdditionBlockingRules(plannedDecision);
assert.deepEqual(
  coverageOrder.slice(0, 2).map(rule => getCompatibilityRuleFamily(rule.code)),
  ['housing', 'temperature'],
);
assert.ok(
  coverageOrder.findIndex(rule => getCompatibilityRuleFamily(rule.code) === 'water_type')
    > coverageOrder.findIndex(rule => getCompatibilityRuleFamily(rule.code) === 'temperature'),
  'pair conflict involving a species-only fish should be deferred behind an independent blocker',
);

const competingIds = ['sp_0049', 'sp_0431', 'sp_0443', 'sp_0439', 'sp_0436'];
const competingQuantities: Record<string, number> = {
  sp_0049: 1,
  sp_0431: 10,
  sp_0443: 6,
  sp_0439: 8,
  sp_0436: 5,
};
const competingDecision = evaluateCompatibilityDecision({
  tank,
  items: competingIds.map((id, index) => ({
    species: byId(id),
    quantity: competingQuantities[id],
    origin: index === 0 ? 'existing' : 'candidate',
  })),
});
const competingOrder = prioritizePlannedAdditionBlockingRules(competingDecision);
assert.deepEqual(
  competingOrder.slice(0, 2).map(rule => getCompatibilityRuleFamily(rule.code)),
  ['housing', 'aggression'],
  'single-housing should consume the old pair conflicts around that species only after independent hard blockers get a slot',
);
assert.ok(
  competingOrder.findIndex(rule => getCompatibilityRuleFamily(rule.code) === 'predation') > 1,
  'predation involving the single-housing species must not consume the second top-level slot',
);
assert.equal(
  competingDecision.blockingRules.some(rule => rule.code === 'special_tank_required'),
  false,
  'freshwater shell-dweller husbandry copy must not be misread as coral/anemone identity',
);
const genuineSpecialTank = evaluateSpeciesForAquarium(byId('sp_0192'), tank, []);
assert.equal(
  genuineSpecialTank.hardBlocks.some(item => item.type === 'special_tank_required'),
  true,
  'real anemone identity must still trigger the special-tank boundary',
);
const competingPlan = buildCompatibilityDecisionPlan(competingDecision, 'planned_addition');
assert.deepEqual(
  competingPlan.evidence.sourceRuleCodes.map(getCompatibilityRuleFamily),
  ['housing', 'aggression'],
);
assert.match(competingPlan.nextSteps[0] || '', /单养|更换更适合混养/);
assert.match(competingPlan.nextSteps[1] || '', /追鳍|冲突|更换|分隔/);

const currentDecision = evaluateCompatibilityDecision({
  tank,
  items: complexRows.map(([id, quantity]) => ({
    species: byId(id),
    quantity,
    origin: 'existing',
  })),
});
assert.equal(currentDecision.status, plannedDecision.status, 'presentation mode must not change deterministic verdict authority');
const currentPlan = buildCompatibilityDecisionPlan(currentDecision, 'current_tank');
assert.ok(currentPlan.riskSummary.length <= 3);
assert.ok(currentPlan.nextSteps.length <= 2);
assert.deepEqual(
  currentPlan.evidence.sourceRuleCodes.map(getCompatibilityRuleFamily),
  ['housing', 'temperature'],
);
assert.match(currentPlan.nextSteps[0] || '', /单养|重新调整现有组合/);
assert.match(currentPlan.nextSteps[1] || '', /温度|分缸|更换温度需求更接近/);
assert.doesNotMatch(currentPlan.nextSteps.join(' '), /新增|计划加入|观察看看/);
assert.match(currentPlan.stopCondition, /保持分隔|原组合/);

// A real caution-only current tank validates that intervention language is
// about the animals already present, not about a future addition workflow.
const cautionTank: Aquarium = {
  ...tank,
  id: 'priority-compression-caution',
  dimensions: { length: '200', width: '70', height: '60' },
};
const cautionIds = ['sp_0114', 'sp_0469', 'sp_0013', 'sp_0431'];
const cautionDecision = evaluateCompatibilityDecision({
  tank: cautionTank,
  items: cautionIds.map(id => ({
    species: byId(id),
    quantity: minimumQuantity(id),
    origin: 'existing',
  })),
});
assert.equal(cautionDecision.status, 'caution');
const cautionPlan = buildCompatibilityDecisionPlan(cautionDecision, 'current_tank');
assert.ok(cautionPlan.riskSummary.length <= 3);
assert.ok(cautionPlan.nextSteps.length <= 2);
assert.deepEqual(
  cautionPlan.evidence.sourceRuleCodes.map(getCompatibilityRuleFamily),
  ['predation', 'group_size'],
  'caution provenance should follow the same surfaced priority order',
);
assert.equal(new Set(cautionPlan.riskSummary).size, cautionPlan.riskSummary.length);
assert.equal(new Set(cautionPlan.nextSteps).size, cautionPlan.nextSteps.length);
assert.doesNotMatch(cautionPlan.stopCondition, /停止新增|继续新增|新增/);
assert.match(cautionPlan.stopCondition, /立即分隔|重新评估|原组合/);
assert.match(cautionPlan.reviewCheckpoint, /追逐|躲藏|数量异常|分隔/);

console.log('Compatibility priority compression PASS: complex hard blocks remain deterministic, primary risks stay provenance-backed, next steps cap at two specific actions, and current-tank stop conditions use intervention semantics.');

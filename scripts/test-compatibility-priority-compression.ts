import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import {
  getCompatibilityRuleFamily,
  prioritizeDistinctCompatibilityRules,
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
  ['sp_0258', 1],
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
  ['water_type', 'predation'],
  'surfaced primary risks must retain matching provenance',
);
assert.equal(plannedPlan.riskSummary.length, plannedPlan.evidence.sourceRuleCodes.length);
assert.ok(plannedPlan.evidence.evidenceIds.length > 0);
assert.match(plannedPlan.riskSummary[0] || '', /水体类型/);
assert.match(plannedPlan.riskSummary[1] || '', /捕食|吞食/);
assert.match(plannedPlan.nextSteps[0] || '', /不要放在同一缸|淡水|海水/);
assert.match(plannedPlan.nextSteps[1] || '', /不要直接混养|体型|捕食/);
assert.doesNotMatch(plannedPlan.nextSteps.join(' '), /先处理下面的明确阻断风险/);
assert.doesNotMatch(plannedPlan.nextSteps.join(' '), /观察看看|继续观察/);
assert.match(plannedPlan.stopCondition, /不要执行当前混养计划/);

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
  ['water_type', 'predation'],
);
assert.match(currentPlan.nextSteps[0] || '', /尽快分缸|淡水|海水/);
assert.match(currentPlan.nextSteps[1] || '', /尽快分隔|捕食/);
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

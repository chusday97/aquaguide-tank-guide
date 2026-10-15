import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getCompatibilityRuleFamily, prioritizeDistinctCompatibilityRules } from '../src/services/compatibility/compatibility-action.service';
import {
  createCompatibilityAiCombinationAssessment,
  type CompatibilityAiReasoningProvider,
} from '../apps/api/src/compatibility-ai-reasoner';
import { buildCompatibilityProductAssessment } from '../apps/api/src/compatibility-ai-product';

const byId = (id: string) => {
  const value = fishData.find(item => item.id === id);
  assert.ok(value, `missing fixture fish ${id}`);
  return value;
};

const reasonFor = (family: string) => {
  if (family === 'water_type') return '这组生物需要的水体类型不同，不能按同一套长期水体条件饲养。';
  if (family === 'predation') return '组合中存在明确捕食风险，较小的一方可能被追食或吞食。';
  if (family === 'housing') return '其中一方更适合单独饲养，不适合按普通混养方式处理。';
  if (family === 'temperature') return '这些物种适合的长期水温缺少安全重叠。';
  if (family === 'group_size') return '当前群体数量不足以满足已审核的成群需求。';
  return '当前存在已审核并需要优先处理的混养风险。';
};

const actionFor = (family: string, mode: 'planned_addition' | 'current_tank') => {
  if (family === 'water_type') return mode === 'current_tank'
    ? '尽快分缸，分别按淡水或海水需求维持现有个体。'
    : '不要放进同一缸，分别按淡水或海水需求饲养。';
  if (family === 'predation') return mode === 'current_tank'
    ? '尽快分隔存在捕食关系的物种，再重新评估现有组合。'
    : '不要直接混养，先更换没有明确捕食关系的对象。';
  if (family === 'housing') return mode === 'current_tank'
    ? '按单养要求把对应物种分开饲养。'
    : '按单养要求处理，或更换更适合混养的物种。';
  if (family === 'group_size') return mode === 'current_tank'
    ? '先补足群体数量，再观察群游和进食是否稳定。'
    : '先补足计划群体数量，再重新判断是否加入。';
  return mode === 'current_tank' ? '先分隔高风险组合，再重新评估。' : '先处理高风险条件，再重新评估。';
};

const complexTank: Aquarium = {
  id: 'ai-explanation-complex',
  name: 'AI explanation complex',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};
const complexItems = [
  { species: byId('sp_0431'), quantity: 10, origin: 'existing' as const },
  { species: byId('sp_0435'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0453'), quantity: 1, origin: 'planned' as const },
  { species: byId('sp_0258'), quantity: 1, origin: 'planned' as const },
  { species: byId('sp_0448'), quantity: 1, origin: 'planned' as const },
];
const complexDecision = evaluateCompatibilityDecision({
  tank: complexTank,
  items: complexItems.map(item => ({
    species: item.species,
    quantity: item.quantity,
    origin: item.origin === 'planned' ? 'candidate' as const : 'existing' as const,
  })),
});
assert.equal(complexDecision.status, 'not_recommended');
assert.equal(complexDecision.metadata.decisionReadiness, 'reviewed');
const complexFamilies = prioritizeDistinctCompatibilityRules(complexDecision.blockingRules)
  .map(rule => getCompatibilityRuleFamily(rule.code));
assert.deepEqual(complexFamilies.slice(0, 4), ['water_type', 'predation', 'housing', 'temperature']);

let plannedPrompt: any;
const groundedProvider: CompatibilityAiReasoningProvider = async ({ user }) => {
  plannedPrompt = JSON.parse(user);
  const codes = plannedPrompt.allowedRuleCodes as string[];
  assert.equal(codes.length <= 3, true);
  assert.deepEqual(plannedPrompt.primaryRiskRuleCodes, codes);
  assert.equal(plannedPrompt.deterministicAuthority.rules.length, codes.length);
  const families = codes.map(getCompatibilityRuleFamily);
  assert.deepEqual(families, ['water_type', 'predation', 'housing']);
  return {
    model: 'ai-explanation-clamp-fixture',
    output: {
      suggestedVerdict: 'not_recommended',
      reasons: codes.map(code => ({ text: reasonFor(getCompatibilityRuleFamily(code)), ruleCodes: [code] })),
      adjustments: codes.slice(0, 2).map(code => ({
        text: actionFor(getCompatibilityRuleFamily(code), 'planned_addition'),
        ruleCodes: [code],
      })),
      uncertainties: [],
      confidence: 'high',
      evidenceIds: [],
    },
  };
};
const complexShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: complexDecision.aggregateResult,
  tank: complexTank,
  items: complexItems,
  assessmentMode: 'planned_addition',
}, groundedProvider);
assert.equal(complexShadow.ai.status, 'accepted');
assert.equal(complexShadow.finalDecision.status, 'not_recommended');
assert.equal(complexShadow.ai.reasons.length, 3);
assert.equal(complexShadow.ai.adjustments.length, 2);
const complexProduct = buildCompatibilityProductAssessment(complexDecision, complexShadow, 'planned_addition');
assert.equal(complexProduct.details.explanation.source, 'ai_grounded');
assert.equal(complexProduct.details.explanation.narrativeAccepted, true);
assert.match(complexProduct.main.why[0] || '', /水体|淡水|海水/);
assert.match(complexProduct.main.howTo[0] || '', /同一缸|淡水|海水/);
assert.equal(complexProduct.details.reasons.length <= 3, true);
assert.equal(complexProduct.details.adjustments.length <= 2, true);

const fourthRule = prioritizeDistinctCompatibilityRules(complexDecision.blockingRules)[3];
assert.ok(fourthRule, 'complex fixture must expose a fourth lower-priority risk');
const nonPrimaryProvider: CompatibilityAiReasoningProvider = async ({ user }) => {
  const payload = JSON.parse(user);
  assert.equal((payload.allowedRuleCodes as string[]).includes(fourthRule.code), false);
  return {
    model: 'ai-explanation-clamp-fixture',
    output: {
      suggestedVerdict: 'not_recommended',
      reasons: [{ text: reasonFor(getCompatibilityRuleFamily(fourthRule.code)), ruleCodes: [fourthRule.code] }],
      adjustments: [{ text: actionFor(getCompatibilityRuleFamily(fourthRule.code), 'planned_addition'), ruleCodes: [fourthRule.code] }],
      uncertainties: [],
      confidence: 'high',
      evidenceIds: [],
    },
  };
};
const rejectedLowerPriority = await createCompatibilityAiCombinationAssessment({
  deterministicResult: complexDecision.aggregateResult,
  tank: complexTank,
  items: complexItems,
  assessmentMode: 'planned_addition',
}, nonPrimaryProvider);
assert.equal(rejectedLowerPriority.ai.status, 'rejected');
assert.equal(rejectedLowerPriority.ai.reason, 'provider_output_uses_unknown_authority');
assert.equal(rejectedLowerPriority.finalDecision.status, 'not_recommended');

const currentTank: Aquarium = {
  id: 'ai-explanation-current',
  name: 'AI explanation current',
  fishes: [],
  dimensions: { length: '200', width: '70', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};
const currentItems = [
  { species: byId('sp_0114'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0469'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0013'), quantity: 1, origin: 'existing' as const },
  { species: byId('sp_0431'), quantity: 10, origin: 'existing' as const },
];
const currentDecision = evaluateCompatibilityDecision({
  tank: currentTank,
  items: currentItems.map(item => ({ species: item.species, quantity: item.quantity, origin: 'existing' as const })),
});
assert.equal(currentDecision.status, 'caution');
assert.equal(currentDecision.metadata.decisionReadiness, 'reviewed');
const currentProvider: CompatibilityAiReasoningProvider = async ({ user }) => {
  const payload = JSON.parse(user);
  assert.equal(payload.assessmentMode, 'current_tank');
  const code = payload.allowedRuleCodes[0] as string;
  const family = getCompatibilityRuleFamily(code);
  return {
    model: 'ai-explanation-clamp-fixture',
    output: {
      suggestedVerdict: 'caution',
      reasons: [{ text: reasonFor(family), ruleCodes: [code] }],
      adjustments: [{ text: actionFor(family, 'current_tank'), ruleCodes: [code] }],
      uncertainties: [],
      confidence: 'medium',
      evidenceIds: [],
    },
  };
};
const currentShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: currentDecision.aggregateResult,
  tank: currentTank,
  items: currentItems,
  assessmentMode: 'current_tank',
}, currentProvider);
assert.equal(currentShadow.ai.status, 'accepted');
assert.equal(currentShadow.finalDecision.status, 'caution');
const currentProduct = buildCompatibilityProductAssessment(currentDecision, currentShadow, 'current_tank');
assert.equal(currentProduct.details.explanation.source, 'ai_grounded');
assert.equal(currentProduct.assessmentMode, 'current_tank');
assert.doesNotMatch(currentProduct.main.howTo.join(' '), /加入|新增/);
assert.match(currentProduct.main.howTo.join(' '), /分隔|隔离|补足|观察|确认/);

console.log('Compatibility AI explanation clamp PASS: AI sees only top three deterministic risk families, generic/lower-priority drift is rejected, and current-tank actions preserve intervention semantics.');

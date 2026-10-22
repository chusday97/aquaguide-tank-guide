import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import {
  getCompatibilityRuleOriginScope,
  hasOnlyPreExistingBlockingRules,
} from '../src/services/compatibility/compatibility-action.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import { buildCompatibilityReadableConclusion } from '../src/services/compatibility/compatibility-readable-copy.service';
import { buildLocalCompatibilityAssessment } from '../src/services/compatibility/compatibility-assessment.service';
import type { Aquarium } from '../src/types';

const tank: Aquarium = {
  id: 'preexisting-risk-attribution',
  name: 'Pre-existing Risk Attribution',
  fishes: [
    {
      id: 'existing-black-skirt',
      fishId: 'sp_0010',
      quantity: 8,
      entryDate: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'existing-opsariichthys',
      fishId: 'sp_0038',
      quantity: 8,
      entryDate: '2026-10-01T00:00:00.000Z',
    },
  ],
  dimensions: { length: '300', width: '100', height: '70' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const review = reviewSpeciesAdditions({
  aquarium: tank,
  items: [{ fishId: 'sp_0020', quantity: 8 }],
  speciesCatalog: fishData,
});

assert.ok(review);
assert.equal(review.status, 'not_recommended');
assert.equal(review.policy, 'block', 'an unresolved existing hard conflict should still pause further additions');
assert.equal(
  review.evaluations[0]?.result.blockingRules.length,
  0,
  'the candidate itself must not be falsely assigned the pre-existing hard blocker',
);
assert.equal(
  hasOnlyPreExistingBlockingRules(review.decision),
  true,
  'the aggregate hard blockers in this fixture should be attributable only to existing livestock',
);
assert.ok(
  review.decision.blockingRules.every(rule => getCompatibilityRuleOriginScope(review.decision, rule) === 'existing_only'),
);

const readable = buildCompatibilityReadableConclusion(review.decision, {}, 'planned_addition');
assert.equal(readable.judgment, '不建议混养');
assert.equal(readable.why.length, 1, 'pre-existing hard blockers should be summarized once instead of blaming the candidate');
assert.match(readable.why[0] || '', /当前缸已有 黑裙鱼 与 马口鱼/);
assert.match(readable.why[0] || '', /不是候选生物新触发/);
assert.match(readable.howTo[0] || '', /先处理并解除 黑裙鱼 与 马口鱼 的现有冲突/);
assert.match(readable.howTo[0] || '', /重新评估/);
assert.doesNotMatch(readable.howTo.join(' '), /不要加入 刚果美人/);

const plan = buildCompatibilityDecisionPlan(review.decision, 'planned_addition');
assert.equal(plan.verdict, 'do_not_mix');
assert.match(plan.nextSteps[0] || '', /先处理并解除 黑裙鱼 与 马口鱼 的现有冲突/);
assert.match(plan.expectedAfterAdjustment, /现有阻断/);
assert.match(plan.expectedAfterAdjustment, /再单独判断这次候选/);
assert.match(plan.stopCondition, /现有冲突解除前，先暂停这次新增/);

const existingGroupStep = plan.actionSequence.find(step => (
  step.riskFamily === 'group_size'
  && step.resolutionTarget.speciesIds.includes('sp_0010')
));
assert.ok(existingGroupStep, 'fixture should retain the existing black-skirt group-size warning as a deferred detail');
assert.match(existingGroupStep.action, /当前数量/);
assert.doesNotMatch(existingGroupStep.action, /计划数量/);
assert.equal(existingGroupStep.blockedByHardStop, true);

const candidateConflictTank: Aquarium = {
  ...tank,
  id: 'candidate-conflict-attribution',
  fishes: [{
    id: 'existing-neon',
    fishId: 'sp_0431',
    quantity: 10,
    entryDate: '2026-10-01T00:00:00.000Z',
  }],
};
const candidateConflict = reviewSpeciesAdditions({
  aquarium: candidateConflictTank,
  items: [{ fishId: 'sp_0116', quantity: 1 }],
  speciesCatalog: fishData,
});
assert.ok(candidateConflict);
assert.equal(candidateConflict.status, 'not_recommended');
assert.equal(hasOnlyPreExistingBlockingRules(candidateConflict.decision), false);
assert.ok(
  candidateConflict.decision.blockingRules.some(
    rule => getCompatibilityRuleOriginScope(candidateConflict.decision, rule) === 'candidate_involved',
  ),
  'candidate-involved hard blockers must keep normal incompatibility attribution',
);
const candidateReadable = buildCompatibilityReadableConclusion(candidateConflict.decision, {}, 'planned_addition');
assert.doesNotMatch(candidateReadable.why.join(' '), /这次硬阻断不是候选生物新触发/);


const mixedConflictReview = reviewSpeciesAdditions({
  aquarium: tank,
  items: [{ fishId: 'sp_0003', quantity: 1 }],
  speciesCatalog: fishData,
});
assert.ok(mixedConflictReview);
assert.equal(mixedConflictReview.status, 'not_recommended');
assert.ok(
  mixedConflictReview.decision.blockingRules.some(
    rule => getCompatibilityRuleOriginScope(mixedConflictReview.decision, rule) === 'candidate_involved',
  ),
  'fixture must contain a hard blocker triggered by the candidate',
);
assert.ok(
  mixedConflictReview.decision.blockingRules.some(
    rule => getCompatibilityRuleOriginScope(mixedConflictReview.decision, rule) === 'existing_only',
  ),
  'fixture must also retain an independent pre-existing hard blocker',
);

const mixedReadable = buildCompatibilityReadableConclusion(
  mixedConflictReview.decision,
  {},
  'planned_addition',
);
assert.match(
  mixedReadable.why[0] || '',
  /长期水温|适温/,
  'candidate-involved hard blocker must drive the primary user-facing reason',
);
assert.doesNotMatch(
  mixedReadable.why[0] || '',
  /黑裙鱼 与 马口鱼|不是候选生物新触发/,
  'the primary reason must not be the pre-existing tank conflict',
);
assert.match(
  mixedReadable.why[1] || '',
  /当前缸原有的 黑裙鱼 与 马口鱼/,
  'the pre-existing blocker should remain visible only as secondary context',
);
assert.match(mixedReadable.why[1] || '', /不是候选生物新触发/);
assert.match(
  mixedReadable.howTo[0] || '',
  /温度|分缸|更换温度需求更接近/,
  'the first action must address the candidate-involved blocker',
);
assert.match(
  mixedReadable.howTo[1] || '',
  /当前缸原有的 黑裙鱼 与 马口鱼/,
  'the old tank conflict action must be explicitly labeled as pre-existing',
);

assert.equal(
  mixedConflictReview.keyRules[0]?.code,
  'temperature_range_conflict',
  'expanded key rules must use the same candidate-first ordering as the main conclusion',
);

const mixedLocalAssessment = buildLocalCompatibilityAssessment(mixedConflictReview.decision);
assert.equal(mixedLocalAssessment.details.reasons[0]?.text, mixedReadable.why[0]);
assert.equal(mixedLocalAssessment.details.reasons[1]?.text, mixedReadable.why[1]);
assert.deepEqual(mixedLocalAssessment.details.reasons[0]?.ruleCodes, ['temperature_range_conflict']);
assert.deepEqual(mixedLocalAssessment.details.reasons[1]?.ruleCodes, ['predation_risk']);
const temperatureRule = mixedConflictReview.decision.blockingRules.find(rule => rule.code === 'temperature_range_conflict');
const predationRule = mixedConflictReview.decision.blockingRules.find(rule => rule.code === 'predation_risk');
assert.ok(temperatureRule);
assert.ok(predationRule);
assert.deepEqual(
  mixedLocalAssessment.details.reasons[0]?.citations?.map(item => item.id),
  temperatureRule.citations.map(item => item.id),
  'primary displayed reason must expose only the candidate temperature blocker citations',
);
assert.deepEqual(
  mixedLocalAssessment.details.reasons[1]?.citations?.map(item => item.id),
  predationRule.citations.map(item => item.id),
  'secondary displayed reason must expose only the pre-existing predation blocker citations',
);
assert.equal(
  mixedLocalAssessment.details.reasons[0]?.citations?.some(source => predationRule.citations.some(item => item.id === source.id)),
  false,
  'candidate reason citations must not be contaminated by the old tank blocker',
);

const mixedPlan = buildCompatibilityDecisionPlan(mixedConflictReview.decision, 'planned_addition');
assert.equal(mixedPlan.evidence.sourceRuleCodes[0], 'temperature_range_conflict');
assert.equal(
  getCompatibilityRuleOriginScope(
    mixedConflictReview.decision,
    mixedConflictReview.decision.blockingRules.find(rule => rule.code === mixedPlan.evidence.sourceRuleCodes[0])!,
  ),
  'candidate_involved',
  'surfaced provenance must follow the candidate-involved primary blocker',
);
assert.match(mixedPlan.nextSteps[0] || '', /不要加入 苏拉威西虾|温度/);
assert.match(
  mixedPlan.nextSteps[1] || '',
  /另外，黑裙鱼 与 马口鱼 存在捕食风险/,
  'the pre-existing blocker must remain a clearly secondary next step',
);
assert.equal(mixedPlan.actionSequence[0]?.riskFamily, 'temperature');
assert.equal(mixedPlan.actionSequence[0]?.sourceRuleCode, 'temperature_range_conflict');
assert.equal(mixedPlan.actionSequence[1]?.riskFamily, 'predation');
assert.match(mixedPlan.actionSequence[1]?.action || '', /另外，黑裙鱼 与 马口鱼 存在捕食风险/);
assert.equal(mixedPlan.resolutionTargets[0]?.riskFamily, 'temperature');
assert.equal(mixedPlan.resolutionTargets[1]?.riskFamily, 'predation');
assert.match(mixedPlan.stopCondition, /苏拉威西虾|温度|适温|混养计划/);

console.log('Compatibility pre-existing risk attribution PASS: planned additions remain paused by unresolved existing hard conflicts without falsely attributing those blockers to the candidate, while candidate-involved blockers keep normal attribution.');

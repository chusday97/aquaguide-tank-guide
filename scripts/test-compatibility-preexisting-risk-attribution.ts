import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import {
  getCompatibilityRuleOriginScope,
  hasOnlyPreExistingBlockingRules,
} from '../src/services/compatibility/compatibility-action.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import { buildCompatibilityReadableConclusion } from '../src/services/compatibility/compatibility-readable-copy.service';
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

console.log('Compatibility pre-existing risk attribution PASS: planned additions remain paused by unresolved existing hard conflicts without falsely attributing those blockers to the candidate, while candidate-involved blockers keep normal attribution.');

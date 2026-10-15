import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const value = fishData.find(item => item.id === id);
  assert.ok(value, `missing fixture species ${id}`);
  return value;
};

const freshwater25: Aquarium = {
  id: 'action-specificity-25',
  name: 'Action specificity 25',
  fishes: [],
  dimensions: { length: '200', width: '70', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const freshwater23: Aquarium = {
  id: 'action-specificity-23',
  name: 'Action specificity 23',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '23',
};

const oscar = byId('sp_0451');
const zebrafish = byId('sp_0435');
const oscarZebra = evaluateCompatibilityDecision({
  tank: freshwater25,
  items: [
    { species: oscar, quantity: 1, origin: 'existing' },
    { species: zebrafish, quantity: 8, origin: 'candidate' },
  ],
});
const oscarZebraPlan = buildCompatibilityDecisionPlan(oscarZebra, 'planned_addition');
assert.equal(oscarZebra.status, 'not_recommended');
assert.deepEqual(
  oscarZebra.assessmentItems?.map(item => [item.name, item.quantity, item.origin]),
  [[oscar.name, 1, 'existing'], [zebrafish.name, 8, 'candidate']],
);
assert.match(oscarZebraPlan.nextSteps[0] || '', new RegExp(zebrafish.name));
assert.match(oscarZebraPlan.nextSteps[0] || '', new RegExp(oscar.name));
assert.match(oscarZebraPlan.nextSteps[0] || '', /捕食/);
assert.match(oscarZebraPlan.nextSteps[1] || '', /目标温度|适温/);
assert.doesNotMatch(oscarZebraPlan.riskSummary.join(' '), /没有安全重叠|硬取中间值/);
assert.match(oscarZebraPlan.riskSummary.join(' '), /目标温度/);
assert.match(oscarZebraPlan.expectedAfterAdjustment, /分隔|替换/);
assert.match(oscarZebraPlan.reviewCheckpoint, /重新运行混养判断/);
assert.match(oscarZebraPlan.stopCondition, new RegExp(`${oscar.name}.*${zebrafish.name}|${zebrafish.name}.*${oscar.name}`));
assert.match(oscarZebraPlan.stopCondition, /不要执行当前混养计划/);

const guppy = byId('sp_0436');
const tigerBarb = byId('sp_0439');
const tigerGuppy = evaluateCompatibilityDecision({
  tank: freshwater25,
  items: [
    { species: guppy, quantity: 8, origin: 'existing' },
    { species: tigerBarb, quantity: 6, origin: 'candidate' },
  ],
});
const tigerGuppyPlan = buildCompatibilityDecisionPlan(tigerGuppy, 'planned_addition');
assert.equal(tigerGuppy.status, 'not_recommended');
assert.equal(tigerGuppyPlan.nextSteps.length, 1, 'one direct pair conflict should not duplicate a generic action');
assert.match(tigerGuppyPlan.nextSteps[0] || '', new RegExp(guppy.name));
assert.match(tigerGuppyPlan.nextSteps[0] || '', new RegExp(tigerBarb.name));
assert.match(tigerGuppyPlan.nextSteps[0] || '', /追鳍|行为冲突/);
assert.doesNotMatch(tigerGuppyPlan.nextSteps.join(' '), /更换冲突物种|先处理下面的明确阻断风险/);
assert.match(tigerGuppyPlan.expectedAfterAdjustment, /直接冲突证据|更换|分隔/);

const neon = byId('sp_0431');
const lionfish = byId('sp_0453');
const waterMismatch = evaluateCompatibilityDecision({
  tank: freshwater25,
  items: [
    { species: neon, quantity: 8, origin: 'existing' },
    { species: lionfish, quantity: 1, origin: 'candidate' },
  ],
});
const waterMismatchPlan = buildCompatibilityDecisionPlan(waterMismatch, 'planned_addition');
assert.equal(waterMismatch.status, 'not_recommended');
assert.match(waterMismatchPlan.nextSteps[0] || '', new RegExp(lionfish.name));
assert.match(waterMismatchPlan.nextSteps[0] || '', new RegExp(neon.name));
assert.match(waterMismatchPlan.nextSteps[0] || '', /水体需求不一致|分缸/);
assert.match(waterMismatchPlan.nextSteps[1] || '', /捕食/);
assert.match(waterMismatchPlan.expectedAfterAdjustment, /水体需求冲突|分缸|更换/);
assert.match(waterMismatchPlan.reviewCheckpoint, /不需要靠行为观察期/);

const zebra7 = evaluateCompatibilityDecision({
  tank: freshwater23,
  items: [{ species: zebrafish, quantity: 7, origin: 'candidate' }],
});
const zebra7Plan = buildCompatibilityDecisionPlan(zebra7, 'planned_addition');
assert.equal(zebra7.status, 'caution');
assert.equal(zebra7Plan.nextSteps.length, 1);
assert.match(zebra7Plan.nextSteps[0] || '', /斑马鱼/);
assert.match(zebra7Plan.nextSteps[0] || '', /从 7 调整到至少 8/);
assert.match(zebra7Plan.expectedAfterAdjustment, /至少 8/);
assert.match(zebra7Plan.reviewCheckpoint, /至少 8/);
assert.match(zebra7Plan.reviewCheckpoint, /群游|进食/);
assert.match(zebra7Plan.stopCondition, /至少 8/);
assert.doesNotMatch(zebra7Plan.nextSteps.join(' '), /该物种/);

const zebra8 = evaluateCompatibilityDecision({
  tank: freshwater23,
  items: [{ species: zebrafish, quantity: 8, origin: 'candidate' }],
});
assert.equal(zebra8.status, 'compatible', 'meeting the reviewed minimum should clear the group-size caution');

const currentCaution = evaluateCompatibilityDecision({
  tank: freshwater25,
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0013'), quantity: 1, origin: 'existing' },
    { species: neon, quantity: 10, origin: 'existing' },
  ],
});
const currentCautionPlan = buildCompatibilityDecisionPlan(currentCaution, 'current_tank');
assert.equal(currentCaution.status, 'caution');
assert.equal(currentCautionPlan.nextSteps.length, 1);
assert.match(currentCautionPlan.nextSteps[0] || '', /被捕食脆弱性/);
assert.match(currentCautionPlan.nextSteps[0] || '', /观察实际追食|可立即分隔/);
assert.doesNotMatch(currentCautionPlan.nextSteps[0] || '', /存在捕食风险；尽快分隔/);
assert.match(currentCautionPlan.reviewCheckpoint, /追逐|躲藏|受伤|分隔/);
assert.match(currentCautionPlan.stopCondition, /立即分隔|重新评估/);
assert.doesNotMatch(currentCautionPlan.stopCondition, /新增/);

const currentHard = evaluateCompatibilityDecision({
  tank: freshwater25,
  items: [
    { species: oscar, quantity: 1, origin: 'existing' },
    { species: zebrafish, quantity: 8, origin: 'existing' },
  ],
});
const currentHardPlan = buildCompatibilityDecisionPlan(currentHard, 'current_tank');
assert.equal(currentHard.status, 'not_recommended');
assert.match(currentHardPlan.nextSteps[0] || '', new RegExp(oscar.name));
assert.match(currentHardPlan.nextSteps[0] || '', new RegExp(zebrafish.name));
assert.match(currentHardPlan.nextSteps[0] || '', /捕食风险|分隔/);
assert.match(currentHardPlan.stopCondition, /保持分隔/);
assert.doesNotMatch(currentHardPlan.stopCondition, /新增/);

const noInputContext = {
  ...tigerGuppy,
  assessmentItems: undefined,
};
const noInputContextPlan = buildCompatibilityDecisionPlan(noInputContext, 'planned_addition');
assert.doesNotMatch(noInputContextPlan.nextSteps.join(' '), new RegExp(`${guppy.name}|${tigerBarb.name}`));
assert.match(noInputContextPlan.nextSteps.join(' '), /更换|分隔|混养/);

console.log('Compatibility action specificity PASS: provenance-backed species names and quantities drive concrete actions, hard vs adjustable rechecks stay distinct, caution is not overstated, and missing context falls back without guessing.');

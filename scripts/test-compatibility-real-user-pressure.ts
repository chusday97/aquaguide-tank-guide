import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { CompatibilityDecision } from '../src/modules/knowledge/knowledge.types';
import { buildBeginnerCompatibilityAction, getCompatibilityRuleFamily } from '../src/services/compatibility/compatibility-action.service';
import {
  buildCompatibilityDecisionPlan,
  getCompatibilityDataLimitationReason,
} from '../src/services/compatibility/compatibility-decision-plan.service';
import { getCompatibilityPresentation } from '../src/services/compatibility/compatibility-presentation.service';
import { evaluateTankCompatibility } from '../src/services/compatibility/compatibility.service';
import type { Aquarium } from '../src/types';

const REPORT_PATH = resolve('evaluation/product/compatibility-real-user-pressure.v1.json');

const stages = [
  'input_normalization',
  'identity_resolution',
  'reviewed_facts',
  'pair_domain_stage_evaluation',
  'whole_tank_aggregation',
  'action_plan',
  'presentation',
] as const;

type Stage = typeof stages[number];
type Probe = { stage: Stage; check: string; pass: boolean; detail: string | null };
type BoundaryStage = Stage | null;

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};

const quantityFor = (id: string) => Math.max(1, getReviewedCompatibilityProfile(id)?.minimumGroupSize || 1);

const tank = (length = 120, width = 50, height = 40, temperature = 24): Aquarium => ({
  id: 'real-user-pressure-tank',
  name: 'Real user pressure tank',
  fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater',
  targetTemperature: String(temperature),
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const largeTank = tank(300, 100, 80, 25);
const largeCoolTank = tank(300, 100, 80, 22);

const allCodes = (decision: CompatibilityDecision) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
  ...decision.passedRules.map(rule => rule.code),
]);

const probe = (stage: Stage, check: string, assertion: () => void): Probe => {
  try {
    assertion();
    return { stage, check, pass: true, detail: null };
  } catch (error) {
    return { stage, check, pass: false, detail: error instanceof Error ? error.message : String(error) };
  }
};

const actionContractProbes = (decision: CompatibilityDecision): Probe[] => {
  const action = buildBeginnerCompatibilityAction(decision);
  const plan = buildCompatibilityDecisionPlan(decision);
  const deterministicCodes = allCodes(decision);
  const decisionEvidence = new Set(decision.evidenceIds || []);
  return [
    probe('action_plan', 'judgment + next action are present and bounded', () => {
      assert.ok(plan.judgment.trim().length > 0);
      assert.ok(plan.nextSteps.length >= 1 && plan.nextSteps.length <= 2);
      assert.ok(plan.nextSteps.every(step => step.trim().length > 0));
    }),
    probe('action_plan', 'source rules remain grounded in deterministic authority', () => {
      assert.ok(action.sourceRuleCodes.length > 0);
      assert.ok(action.sourceRuleCodes.every(code => deterministicCodes.has(code)));
    }),
    probe('action_plan', 'evidence provenance is retained', () => {
      assert.ok(action.evidenceIds.length > 0);
      assert.ok(action.evidenceIds.every(id => decisionEvidence.has(id)));
    }),
    probe('action_plan', 'recheck point and stop condition are executable', () => {
      assert.ok(plan.reviewCheckpoint.trim().length > 0);
      assert.ok(plan.stopCondition.trim().length > 0);
      assert.match(plan.reviewCheckpoint, /重新|复查|观察|确认/);
      assert.match(plan.stopCondition, /不要|停止|分隔|重新评估|保持/);
    }),
  ];
};

const presentationProbes = (decision: CompatibilityDecision): Probe[] => {
  const presentation = getCompatibilityPresentation(decision);
  return [
    probe('presentation', 'primary user output is judgment + reason + action', () => {
      assert.ok(presentation.headline.trim().length > 0);
      assert.ok(presentation.primaryReason.trim().length > 0);
      assert.ok(presentation.primaryActionText.trim().length > 0);
    }),
    probe('presentation', 'primary layer stays concise', () => {
      assert.ok(presentation.headline.length <= 12);
      assert.ok(presentation.primaryReason.length <= 90);
      assert.ok(presentation.primaryActionText.length <= 100);
    }),
  ];
};

const makeCase = (
  id: string,
  title: string,
  expectedBoundaryStage: BoundaryStage,
  probes: Probe[],
  snapshot: Record<string, unknown>,
) => {
  const ordered = [...probes].sort((a, b) => stages.indexOf(a.stage) - stages.indexOf(b.stage));
  const firstDivergence = ordered.find(item => !item.pass)?.stage || null;
  return { id, title, expectedBoundaryStage, firstDivergence, probes: ordered, snapshot };
};

const decisionFor = (ids: Array<[string, number]>, aquarium: Aquarium | null = tank()) => evaluateCompatibilityDecision({
  tank: aquarium,
  items: ids.map(([id, quantity], index) => ({
    species: byId(id),
    quantity,
    origin: index === 0 ? 'existing' as const : 'candidate' as const,
  })),
});

const cases: ReturnType<typeof makeCase>[] = [];

const duplicateMerged = decisionFor([['sp_0431', 8], ['sp_0443', 6]]);
const duplicateSplit = evaluateCompatibilityDecision({
  tank: tank(),
  items: [
    { species: byId('sp_0431'), quantity: 4, origin: 'existing' },
    { species: byId('sp_0431'), quantity: 4, origin: 'candidate' },
    { species: byId('sp_0443'), quantity: 6, origin: 'candidate' },
  ],
});
cases.push(makeCase(
  'duplicate-row-normalization',
  '同一物种被用户拆成多行时先合并，再做生物学判断',
  null,
  [
    probe('input_normalization', 'duplicate species are merged with summed quantity', () => {
      assert.equal(duplicateSplit.assessmentItems?.length, 2);
      assert.equal(duplicateSplit.assessmentItems?.find(item => item.speciesId === 'sp_0431')?.quantity, 8);
    }),
    probe('pair_domain_stage_evaluation', 'normalization does not change pair decision', () => {
      assert.equal(duplicateSplit.status, duplicateMerged.status);
      assert.deepEqual(duplicateSplit.pairResults.map(pair => pair.pairId), duplicateMerged.pairResults.map(pair => pair.pairId));
    }),
    ...actionContractProbes(duplicateSplit),
    ...presentationProbes(duplicateSplit),
  ],
  {
    status: duplicateSplit.status,
    normalizedItems: duplicateSplit.assessmentItems?.map(item => ({ speciesId: item.speciesId, quantity: item.quantity, origin: item.origin })),
    pairCount: duplicateSplit.pairResults.length,
  },
));

const unresolvedIdentity = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0474', 6],
], largeTank);
const unresolvedIdentityPlan = buildCompatibilityDecisionPlan(unresolvedIdentity);
cases.push(makeCase(
  'unresolved-variant-identity',
  '未确认具体品系身份时，不把近似物种资料套成安全结论',
  'identity_resolution',
  [
    probe('input_normalization', 'input reaches the decision engine intact', () => {
      assert.equal(unresolvedIdentity.assessmentItems?.length, 2);
    }),
    probe('identity_resolution', 'identity boundary is explicit and dominant', () => {
      assert.equal(unresolvedIdentity.status, 'insufficient_data');
      assert.ok(unresolvedIdentity.metadata.domainRuleCodes.includes('species_identity_unresolved'));
      assert.equal(getCompatibilityDataLimitationReason(unresolvedIdentity), 'unresolved_identity');
    }),
    probe('action_plan', 'unknown cause remains identity, not generic system gap', () => {
      assert.equal(unresolvedIdentityPlan.unknownReason, 'unresolved_identity');
      assert.equal(unresolvedIdentityPlan.judgment, '暂时无法判断');
      assert.match(unresolvedIdentityPlan.nextSteps.join(' '), /身份|学名|品系|确认/);
    }),
    ...presentationProbes(unresolvedIdentity),
  ],
  {
    status: unresolvedIdentity.status,
    unknownReason: unresolvedIdentityPlan.unknownReason,
    ruleCodes: unresolvedIdentity.metadata.domainRuleCodes.filter(code => code.includes('identity')),
  },
));

const evidenceCeiling = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0039', 6],
], largeCoolTank);
const evidenceCeilingPlan = buildCompatibilityDecisionPlan(evidenceCeiling);
cases.push(makeCase(
  'terminal-public-evidence-ceiling',
  '公开证据不足时保留证据边界，不误报“可以养”',
  'reviewed_facts',
  [
    probe('identity_resolution', 'identity is not misclassified as the blocker', () => {
      assert.equal(evidenceCeiling.metadata.domainRuleCodes.includes('species_identity_unresolved'), false);
    }),
    probe('reviewed_facts', 'public-evidence ceiling is explicit', () => {
      assert.equal(evidenceCeiling.status, 'insufficient_data');
      assert.ok(evidenceCeiling.metadata.domainRuleCodes.includes('species_public_evidence_insufficient'));
      assert.equal(getCompatibilityDataLimitationReason(evidenceCeiling), 'public_evidence_insufficient');
    }),
    probe('action_plan', 'evidence ceiling never turns into a safe action', () => {
      assert.equal(evidenceCeilingPlan.unknownReason, 'public_evidence_insufficient');
      assert.equal(evidenceCeilingPlan.verdict, 'need_information');
      assert.match(evidenceCeilingPlan.nextSteps.join(' '), /证据|来源|资料|审核/);
    }),
    ...presentationProbes(evidenceCeiling),
  ],
  {
    status: evidenceCeiling.status,
    unknownReason: evidenceCeilingPlan.unknownReason,
    ruleCodes: evidenceCeiling.metadata.domainRuleCodes.filter(code => code.includes('evidence')),
  },
));

const complexIds = ['sp_0049', 'sp_0431', 'sp_0443', 'sp_0439', 'sp_0436'];
const complexQuantities: Record<string, number> = { sp_0049: 1, sp_0431: 10, sp_0443: 6, sp_0439: 8, sp_0436: 5 };
const complexDecision = evaluateCompatibilityDecision({
  tank: tank(),
  items: complexIds.map((id, index) => ({
    species: byId(id),
    quantity: complexQuantities[id],
    origin: index === 0 ? 'existing' : 'candidate',
  })),
});
const complexPlan = buildCompatibilityDecisionPlan(complexDecision);
const complexFamilies = new Set([
  ...complexDecision.blockingRules,
  ...complexDecision.warningRules,
].map(rule => getCompatibilityRuleFamily(rule.code)));
cases.push(makeCase(
  'five-species-competing-risks',
  '五物种同时触发捕食、领地、追鳍等风险时给统一整缸结论',
  null,
  [
    probe('pair_domain_stage_evaluation', 'independent risk families survive pair evaluation', () => {
      for (const family of ['predation', 'territory', 'aggression']) assert.ok(complexFamilies.has(family));
    }),
    probe('whole_tank_aggregation', 'all ten unordered pairs are evaluated and hard block dominates', () => {
      assert.equal(complexDecision.pairResults.length, 10);
      assert.equal(complexDecision.status, 'not_recommended');
      assert.equal(complexDecision.metadata.domainStatus, 'not_recommended');
    }),
    ...actionContractProbes(complexDecision),
    probe('action_plan', 'single-housing resolution target only names the species that requires single housing', () => {
      const housing = complexPlan.resolutionTargets.find(target => target.riskFamily === 'housing');
      assert.ok(housing);
      assert.deepEqual(housing.speciesIds, ['sp_0049']);
    }),
    probe('action_plan', 'hard-block plan does not emit contradictory add advice', () => {
      assert.equal(complexPlan.verdict, 'do_not_mix');
      assert.equal(complexPlan.nextSteps.some(step => /可以按当前计划加入|直接加入/.test(step)), false);
    }),
    ...presentationProbes(complexDecision),
  ],
  {
    status: complexDecision.status,
    pairCount: complexDecision.pairResults.length,
    riskFamilies: [...complexFamilies].sort(),
    resolutionTargets: complexPlan.resolutionTargets,
  },
));

const adultStage = evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [{ species: byId('sp_0042'), record: { quantity: 8 } }],
  candidateSpecies: byId('sp_0434'),
  candidateLifeStage: 'adult',
});
const fryStage = evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [{ species: byId('sp_0042'), record: { quantity: 8 } }],
  candidateSpecies: byId('sp_0434'),
  candidateLifeStage: 'fry',
});
const fryAction = buildBeginnerCompatibilityAction(fryStage as unknown as CompatibilityDecision);
cases.push(makeCase(
  'fry-life-stage-predation',
  '鱼苗场景必须按生命阶段提升到阻断，不能沿用成鱼结论',
  'pair_domain_stage_evaluation',
  [
    probe('pair_domain_stage_evaluation', 'adult context does not invent fry predation', () => {
      assert.equal(adultStage.blockingRules.some(rule => rule.code === 'fry_predation_risk'), false);
    }),
    probe('pair_domain_stage_evaluation', 'fry context activates explicit fry predation block', () => {
      assert.equal(fryStage.status, 'not_recommended');
      assert.ok(fryStage.blockingRules.some(rule => rule.code === 'fry_predation_risk'));
    }),
    probe('action_plan', 'fry action requires isolation + later recheck', () => {
      assert.equal(fryAction.verdict, 'do_not_mix');
      assert.match(fryAction.immediateAction, /鱼苗|隔离|育苗/);
      assert.match(fryAction.observeAfterAction || '', /生命阶段|重新评估|隔离/);
      assert.ok(fryAction.sourceRuleCodes.includes('fry_predation_risk'));
      assert.ok(fryAction.evidenceIds.length > 0);
    }),
  ],
  { adultStatus: adultStage.status, fryStatus: fryStage.status },
));

const ordinaryAdult = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: byId('sp_0042'),
  existingSpecies: [byId('sp_0434')],
  candidateContext: { lifeStage: 'adult', reproductiveState: 'normal' },
});
const breedingAdult = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: byId('sp_0042'),
  existingSpecies: [byId('sp_0434')],
  candidateContext: { lifeStage: 'adult', reproductiveState: 'in_labor_or_spawning', guardingEggsOrFry: true },
});
const breedingAction = buildBeginnerCompatibilityAction(breedingAdult as unknown as CompatibilityDecision);
cases.push(makeCase(
  'breeding-territory-context',
  '繁殖护卵状态才触发繁殖领地风险，普通成鱼不误触发',
  'pair_domain_stage_evaluation',
  [
    probe('pair_domain_stage_evaluation', 'ordinary adult does not invent breeding territory', () => {
      assert.equal(ordinaryAdult.warningRules.some(rule => rule.code === 'breeding_territory_active'), false);
    }),
    probe('pair_domain_stage_evaluation', 'explicit spawning/guarding activates breeding territory', () => {
      assert.ok(breedingAdult.warningRules.some(rule => rule.code === 'breeding_territory_active'));
      assert.equal(breedingAdult.status, 'caution');
    }),
    probe('action_plan', 'breeding warning produces observable intervention', () => {
      assert.ok(breedingAction.sourceRuleCodes.includes('breeding_territory_active'));
      assert.match(breedingAction.primaryReason, /繁殖|领地|护域|护卵|攻击/);
      assert.match(breedingAction.stopCondition || '', /停止|分隔|重新评估/);
    }),
  ],
  { ordinaryStatus: ordinaryAdult.status, breedingStatus: breedingAdult.status },
));

const missingTank = decisionFor([
  ['sp_0010', quantityFor('sp_0010')],
  ['sp_0012', quantityFor('sp_0012')],
], null);
const missingTankPlan = buildCompatibilityDecisionPlan(missingTank);
cases.push(makeCase(
  'missing-user-tank-input',
  '用户没填鱼缸参数时明确要求补输入，不把它伪装成物种资料缺失',
  'input_normalization',
  [
    probe('input_normalization', 'missing tank input is explicit', () => {
      assert.equal(missingTank.status, 'insufficient_data');
      assert.ok(missingTank.metadata.domainRuleCodes.includes('tank_missing'));
      assert.equal(getCompatibilityDataLimitationReason(missingTank), 'missing_user_input');
    }),
    probe('reviewed_facts', 'reviewed species facts are not blamed for user input gap', () => {
      assert.equal(missingTank.metadata.domainRuleCodes.includes('species_public_evidence_insufficient'), false);
      assert.equal(missingTank.metadata.domainRuleCodes.includes('species_identity_unresolved'), false);
    }),
    probe('action_plan', 'plan asks for tank input before predicting safety', () => {
      assert.equal(missingTankPlan.unknownReason, 'missing_user_input');
      assert.equal(missingTankPlan.verdict, 'need_information');
      assert.match(missingTankPlan.nextSteps.join(' '), /鱼缸|补齐|参数|信息/);
    }),
    ...presentationProbes(missingTank),
  ],
  { status: missingTank.status, unknownReason: missingTankPlan.unknownReason },
));

const loadIds = ['sp_0012', 'sp_0431', 'sp_0443'];
const overloaded = evaluateCompatibilityDecision({
  tank: tank(60, 30, 35, 24),
  items: loadIds.map(id => ({ species: byId(id), quantity: 12 })),
});
const adjusted = evaluateCompatibilityDecision({
  tank: tank(60, 30, 35, 24),
  items: loadIds.map(id => ({ species: byId(id), quantity: 8 })),
});
const overloadedPlan = buildCompatibilityDecisionPlan(overloaded);
cases.push(makeCase(
  'adjustment-recheck-improves-outcome',
  '降低总负荷后必须能重新计算出更好的结果，而不是只给静态建议',
  null,
  [
    probe('whole_tank_aggregation', 'overload is detected at whole-tank level', () => {
      assert.equal(overloaded.status, 'caution');
      assert.ok(overloaded.warningRules.some(rule => rule.code === 'bioload_over_limit'));
    }),
    probe('action_plan', 'adjustment has recheck and whole-tank target semantics', () => {
      assert.match(overloadedPlan.expectedAfterAdjustment, /降低|负荷|重新评估/);
      assert.match(overloadedPlan.reviewCheckpoint, /降低|重新运行|稳定|负荷/);
      assert.ok(overloadedPlan.resolutionTargets.some(target => target.riskFamily === 'bioload' && target.speciesIds.length === 0));
    }),
    probe('whole_tank_aggregation', 'reduced quantities clear overload and improve verdict', () => {
      assert.equal(adjusted.status, 'compatible');
      assert.equal(adjusted.warningRules.some(rule => rule.code.includes('bioload')), false);
    }),
    ...presentationProbes(overloaded),
    ...presentationProbes(adjusted),
  ],
  { before: overloaded.status, after: adjusted.status, clearedRisk: 'bioload' },
));

const report = {
  schemaVersion: 1,
  pipelineStages: stages,
  summary: {
    caseCount: cases.length,
    passedCases: cases.filter(item => item.firstDivergence === null).length,
    failedCases: cases.filter(item => item.firstDivergence !== null).length,
    firstDivergenceCounts: Object.fromEntries(stages.map(stage => [stage, cases.filter(item => item.firstDivergence === stage).length])),
  },
  cases,
};

const failures = cases.filter(item => item.firstDivergence !== null);
if (process.argv.includes('--write-report')) {
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
}

if (failures.length > 0) {
  throw new Error('Compatibility real-user pressure first divergence: ' + failures.map(item => item.id + '@' + item.firstDivergence).join(', '));
}

if (!process.argv.includes('--write-report')) {
  const committed = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
  assert.deepEqual(report, committed, 'real-user pressure report is stale; regenerate it only after reviewing the behavior change');
}

console.log('Compatibility real-user pressure PASS: ' + cases.length + '/' + cases.length + ' cases have firstDivergence=null; identity/evidence/user-input boundaries remain explicit and machine action targets are precisely scoped.');

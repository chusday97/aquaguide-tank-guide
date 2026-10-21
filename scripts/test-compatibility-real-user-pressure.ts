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
import { buildLocalCompatibilityAssessment } from '../src/services/compatibility/compatibility-assessment.service';
import { projectCompatibilityAssessmentForLocale } from '../src/services/compatibility/compatibility-assessment-presentation.service';
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
      assert.equal(unresolvedIdentityPlan.judgment, '需要关键信息');
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

const minimalInputTank: Aquarium = {
  ...tank(60, 30, 35, 24),
  targetTemperature: '',
  equipment: { heater: false, oxygen: true },
};
const minimalInputDecision = evaluateCompatibilityDecision({
  tank: minimalInputTank,
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0446'), quantity: 2, origin: 'candidate' },
  ],
});
const minimalInputAction = buildBeginnerCompatibilityAction(minimalInputDecision);
const minimalInputModel = buildLocalCompatibilityAssessment(minimalInputDecision);
const minimalInputPresentation = projectCompatibilityAssessmentForLocale({
  model: minimalInputModel,
  decision: minimalInputDecision,
  isEnglish: false,
});
assert.ok(minimalInputPresentation);
cases.push(makeCase(
  'minimal-user-input-specific-condition',
  '只知道缸大小和鱼种时也应给单一结论，并优先给可执行的最低条件',
  null,
  [
    probe('input_normalization', 'unreported exact temperature does not erase a usable decision', () => {
      assert.equal(minimalInputDecision.status, 'caution');
      assert.ok(minimalInputDecision.metadata.domainRuleCodes.includes('tank_temperature_unreported'));
      assert.equal(minimalInputDecision.missingData.some(rule => /temperature|filter|ph/i.test(rule.code)), false);
    }),
    probe('action_plan', 'space threshold outranks generic territorial advice', () => {
      assert.equal(minimalInputAction.verdict, 'add_with_conditions');
      assert.match(minimalInputAction.immediateAction, /100cm/);
      assert.doesNotMatch(minimalInputAction.immediateAction, /换大|改善环境|补齐|测.*pH|水温/);
    }),
    probe('presentation', 'primary copy is one conclusion + one reason + one action', () => {
      assert.equal(minimalInputPresentation.judgment, '条件混养');
      assert.equal(minimalInputPresentation.why.length, 1);
      assert.equal(minimalInputPresentation.howTo.length, 1);
      assert.match(minimalInputPresentation.why[0], /100cm/);
      assert.match(minimalInputPresentation.howTo[0], /100cm/);
      assert.doesNotMatch(minimalInputPresentation.why[0] + minimalInputPresentation.howTo[0], /pH|准确水温|过滤|判断把握|置信/);
    }),
    ...presentationProbes(minimalInputDecision),
  ],
  {
    status: minimalInputDecision.status,
    readiness: minimalInputDecision.metadata.decisionReadiness,
    judgment: minimalInputPresentation.judgment,
    reason: minimalInputPresentation.why[0],
    action: minimalInputPresentation.howTo[0],
    optionalInputSignals: minimalInputDecision.metadata.domainRuleCodes.filter(code => code.endsWith('_unreported')),
  },
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

const sixSpeciesMixedRiskDecision = evaluateCompatibilityDecision({
  tank: tank(300, 100, 80, 24),
  items: [
    ['sp_0439', 8],
    ['sp_0436', 5],
    ['sp_0431', 10],
    ['sp_0443', 6],
    ['sp_0012', 6],
    ['sp_0010', 6],
  ].map(([id, quantity], index) => ({
    species: byId(id as string),
    quantity: quantity as number,
    origin: index === 0 ? 'existing' as const : 'candidate' as const,
  })),
});
const sixSpeciesMixedRiskPlan = buildCompatibilityDecisionPlan(sixSpeciesMixedRiskDecision);
const sixSpeciesBlockingFamilies = new Set(
  sixSpeciesMixedRiskDecision.blockingRules.map(rule => getCompatibilityRuleFamily(rule.code)),
);
const sixSpeciesWarningFamilies = new Set(
  sixSpeciesMixedRiskDecision.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)),
);
cases.push(makeCase(
  'six-species-hard-block-dominates-soft-risks',
  '六物种整缸同时有多项可调风险和硬阻断时，硬阻断主导但软风险不能被抹掉',
  null,
  [
    probe('pair_domain_stage_evaluation', 'six species generate all fifteen unordered pair evaluations', () => {
      assert.equal(sixSpeciesMixedRiskDecision.pairResults.length, 15);
    }),
    probe('whole_tank_aggregation', 'hard block dominates while multiple soft-risk families remain available for later re-evaluation', () => {
      assert.equal(sixSpeciesMixedRiskDecision.status, 'not_recommended');
      assert.ok(sixSpeciesBlockingFamilies.size >= 1);
      assert.ok(sixSpeciesWarningFamilies.has('aggression'));
      assert.ok(sixSpeciesWarningFamilies.has('group_size'));
      assert.ok(sixSpeciesWarningFamilies.has('ph'));
    }),
    probe('action_plan', 'primary action remains do-not-mix and machine targets stay executable', () => {
      assert.equal(sixSpeciesMixedRiskPlan.verdict, 'do_not_mix');
      assert.ok(sixSpeciesMixedRiskPlan.resolutionTargets.length >= 1);
      assert.ok(sixSpeciesMixedRiskPlan.resolutionTargets.every(target => target.criterion.trim().length > 0));
      assert.equal(sixSpeciesMixedRiskPlan.nextSteps.some(step => /直接加入|可以按当前计划加入/.test(step)), false);
    }),
    ...presentationProbes(sixSpeciesMixedRiskDecision),
  ],
  {
    status: sixSpeciesMixedRiskDecision.status,
    pairCount: sixSpeciesMixedRiskDecision.pairResults.length,
    blockingFamilies: [...sixSpeciesBlockingFamilies].sort(),
    warningFamilies: [...sixSpeciesWarningFamilies].sort(),
    resolutionTargets: sixSpeciesMixedRiskPlan.resolutionTargets,
  },
));

const stagedRiskBefore = evaluateCompatibilityDecision({
  tank: tank(60, 30, 35, 24),
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0446'), quantity: 2, origin: 'candidate' },
  ],
});
const stagedRiskAfter = evaluateCompatibilityDecision({
  tank: tank(120, 50, 40, 24),
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0446'), quantity: 2, origin: 'candidate' },
  ],
});
const stagedRiskBeforeAction = buildBeginnerCompatibilityAction(stagedRiskBefore);
const stagedRiskAfterAction = buildBeginnerCompatibilityAction(stagedRiskAfter);
const stagedRiskBeforePlan = buildCompatibilityDecisionPlan(stagedRiskBefore);
const stagedRiskAfterPlan = buildCompatibilityDecisionPlan(stagedRiskAfter);
cases.push(makeCase(
  'adjustment-reveals-secondary-risk',
  '先解决空间不足后必须重新计算并暴露剩余领地风险，不能重复旧动作',
  null,
  [
    probe('whole_tank_aggregation', 'before adjustment both space and territory are present', () => {
      const families = new Set(stagedRiskBefore.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)));
      assert.ok(families.has('space'));
      assert.ok(families.has('territory'));
      assert.equal(stagedRiskBefore.status, 'caution');
    }),
    probe('action_plan', 'before adjustment the explicit 100cm space condition is primary', () => {
      assert.match(stagedRiskBeforeAction.immediateAction, /100cm/);
      assert.equal(stagedRiskBeforePlan.resolutionTargets[0]?.riskFamily, 'space');
    }),
    probe('whole_tank_aggregation', 'after adjustment space clears but territory remains', () => {
      const families = new Set(stagedRiskAfter.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)));
      assert.equal(families.has('space'), false);
      assert.ok(families.has('territory'));
      assert.equal(stagedRiskAfter.status, 'caution');
    }),
    probe('action_plan', 're-evaluation switches to the newly exposed territory action instead of repeating the old space action', () => {
      assert.match(stagedRiskAfterAction.headline, /领地/);
      assert.doesNotMatch(stagedRiskAfterAction.immediateAction, /100cm|最低缸长/);
      assert.equal(stagedRiskAfterPlan.resolutionTargets[0]?.riskFamily, 'territory');
    }),
    ...presentationProbes(stagedRiskBefore),
    ...presentationProbes(stagedRiskAfter),
  ],
  {
    before: {
      status: stagedRiskBefore.status,
      primaryAction: stagedRiskBeforeAction.headline,
      firstTarget: stagedRiskBeforePlan.resolutionTargets[0]?.riskFamily || null,
    },
    after: {
      status: stagedRiskAfter.status,
      primaryAction: stagedRiskAfterAction.headline,
      firstTarget: stagedRiskAfterPlan.resolutionTargets[0]?.riskFamily || null,
    },
  },
));

const competingAdjustableDecision = evaluateCompatibilityDecision({
  tank: tank(100, 30, 35, 24),
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0446'), quantity: 2, origin: 'candidate' },
  ],
});
const competingAdjustableAction = buildBeginnerCompatibilityAction(competingAdjustableDecision);
const competingAdjustablePlan = buildCompatibilityDecisionPlan(competingAdjustableDecision);
cases.push(makeCase(
  'action-priority-territory-before-soft-space',
  '多个可调风险并存时，用户主动作与机器 resolutionTargets 必须遵循同一优先级',
  'action_plan',
  [
    probe('whole_tank_aggregation', 'territory and soft space warnings coexist without a hard block', () => {
      const families = new Set(competingAdjustableDecision.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)));
      assert.equal(competingAdjustableDecision.status, 'caution');
      assert.ok(families.has('territory'));
      assert.ok(families.has('space'));
      assert.equal(competingAdjustableDecision.blockingRules.length, 0);
    }),
    probe('action_plan', 'territory outranks generic soft-space warning in both human and machine action order', () => {
      assert.equal(competingAdjustablePlan.resolutionTargets[0]?.riskFamily, 'territory');
      assert.equal(competingAdjustablePlan.resolutionTargets[1]?.riskFamily, 'space');
      assert.match(competingAdjustableAction.headline, /领地/);
      assert.match(competingAdjustableAction.immediateAction, /遮挡|退让|分隔/);
      assert.doesNotMatch(competingAdjustableAction.immediateAction, /最低缸长|水体要求/);
    }),
    ...presentationProbes(competingAdjustableDecision),
  ],
  {
    status: competingAdjustableDecision.status,
    warningFamilies: [...new Set(competingAdjustableDecision.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)))].sort(),
    primaryAction: competingAdjustableAction.headline,
    resolutionTargets: competingAdjustablePlan.resolutionTargets,
  },
));

const partialSpaceBefore = evaluateCompatibilityDecision({
  tank: tank(60, 30, 35, 24),
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0446'), quantity: 2, origin: 'candidate' },
  ],
});
const partialSpaceAfter = evaluateCompatibilityDecision({
  tank: tank(100, 30, 35, 24),
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0446'), quantity: 2, origin: 'candidate' },
  ],
});
const partialSpaceBeforeAction = buildBeginnerCompatibilityAction(partialSpaceBefore);
const partialSpaceAfterAction = buildBeginnerCompatibilityAction(partialSpaceAfter);
const partialSpaceBeforePlan = buildCompatibilityDecisionPlan(partialSpaceBefore);
const partialSpaceAfterPlan = buildCompatibilityDecisionPlan(partialSpaceAfter);
cases.push(makeCase(
  'partial-space-adjustment-advances-primary-action',
  '用户只完成最低缸长调整后，即使仍有普通空间提醒，也必须推进到新的首要风险',
  'action_plan',
  [
    probe('whole_tank_aggregation', 'before adjustment explicit length risk and territory coexist', () => {
      assert.ok(partialSpaceBefore.warningRules.some(rule => rule.code === 'length_too_short'));
      assert.ok(partialSpaceBefore.warningRules.some(rule => getCompatibilityRuleFamily(rule.code) === 'territory'));
      assert.equal(partialSpaceBefore.status, 'caution');
    }),
    probe('action_plan', 'before adjustment every primary-action surface starts with the 100cm space requirement', () => {
      assert.match(partialSpaceBeforeAction.immediateAction, /100cm/);
      assert.equal(partialSpaceBeforePlan.resolutionTargets[0]?.riskFamily, 'space');
      assert.match(partialSpaceBeforePlan.nextSteps[0] || '', /100cm/);
    }),
    probe('whole_tank_aggregation', 'after reaching 100cm the hard length rule clears while a softer capacity warning remains', () => {
      assert.equal(partialSpaceAfter.warningRules.some(rule => rule.code === 'length_too_short'), false);
      assert.ok(partialSpaceAfter.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum'));
      assert.ok(partialSpaceAfter.warningRules.some(rule => getCompatibilityRuleFamily(rule.code) === 'territory'));
      assert.equal(partialSpaceAfter.status, 'caution');
    }),
    probe('action_plan', 'partial adjustment advances the primary action to territory instead of repeating the completed 100cm step', () => {
      assert.match(partialSpaceAfterAction.headline, /领地/);
      assert.equal(partialSpaceAfterPlan.resolutionTargets[0]?.riskFamily, 'territory');
      assert.match(partialSpaceAfterPlan.nextSteps[0] || '', /遮挡|退让|分隔|领地/);
      assert.doesNotMatch(partialSpaceAfterPlan.nextSteps[0] || '', /100cm/);
    }),
    ...presentationProbes(partialSpaceBefore),
    ...presentationProbes(partialSpaceAfter),
  ],
  {
    before: {
      primaryAction: partialSpaceBeforeAction.immediateAction,
      firstNextStep: partialSpaceBeforePlan.nextSteps[0] || null,
      firstTarget: partialSpaceBeforePlan.resolutionTargets[0]?.riskFamily || null,
    },
    after: {
      primaryAction: partialSpaceAfterAction.immediateAction,
      firstNextStep: partialSpaceAfterPlan.nextSteps[0] || null,
      firstTarget: partialSpaceAfterPlan.resolutionTargets[0]?.riskFamily || null,
      remainingWarningCodes: partialSpaceAfter.warningRules.map(rule => rule.code),
    },
  },
));

const existingWithFirstCandidate = evaluateCompatibilityDecision({
  tank: tank(500, 200, 100, 25),
  items: [
    { species: byId('sp_0015'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0011'), quantity: 10, origin: 'candidate' },
  ],
});
const existingWithSecondCandidate = evaluateCompatibilityDecision({
  tank: tank(500, 200, 100, 25),
  items: [
    { species: byId('sp_0015'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0118'), quantity: 10, origin: 'candidate' },
  ],
});
const combinedCandidatesDecision = evaluateCompatibilityDecision({
  tank: tank(500, 200, 100, 25),
  items: [
    { species: byId('sp_0015'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0011'), quantity: 10, origin: 'candidate' },
    { species: byId('sp_0118'), quantity: 10, origin: 'candidate' },
  ],
});
const combinedCandidatesPlan = buildCompatibilityDecisionPlan(combinedCandidatesDecision);
const candidateToCandidatePair = combinedCandidatesDecision.pairResults.find(pair => (
  new Set([pair.speciesA.id, pair.speciesB.id]).size === 2
  && [pair.speciesA.id, pair.speciesB.id].includes('sp_0011')
  && [pair.speciesA.id, pair.speciesB.id].includes('sp_0118')
));
cases.push(makeCase(
  'multiple-candidates-emergent-conflict',
  '两个候选单独加入都没有硬阻断时，候选彼此的新冲突仍必须改变整缸结论',
  'whole_tank_aggregation',
  [
    probe('pair_domain_stage_evaluation', 'each candidate is individually non-blocking against the existing fish', () => {
      assert.notEqual(existingWithFirstCandidate.status, 'not_recommended');
      assert.notEqual(existingWithSecondCandidate.status, 'not_recommended');
    }),
    probe('pair_domain_stage_evaluation', 'candidate-to-candidate pair is still evaluated and exposes the new predation block', () => {
      assert.ok(candidateToCandidatePair);
      assert.equal(candidateToCandidatePair.status, 'not_recommended');
      assert.ok(candidateToCandidatePair.rawResult.blockingRules.some(rule => getCompatibilityRuleFamily(rule.code) === 'predation'));
    }),
    probe('whole_tank_aggregation', 'whole-tank verdict follows the emergent candidate conflict instead of optimistic individual checks', () => {
      assert.equal(combinedCandidatesDecision.pairResults.length, 3);
      assert.equal(combinedCandidatesDecision.status, 'not_recommended');
      assert.equal(combinedCandidatesPlan.verdict, 'do_not_mix');
    }),
    probe('action_plan', 'the first machine target names the two conflicting candidates, not the unrelated existing fish', () => {
      const predationTarget = combinedCandidatesPlan.resolutionTargets.find(target => target.riskFamily === 'predation');
      assert.ok(predationTarget);
      assert.deepEqual([...predationTarget.speciesIds].sort(), ['sp_0011', 'sp_0118']);
    }),
    ...presentationProbes(combinedCandidatesDecision),
  ],
  {
    individualStatuses: {
      firstCandidate: existingWithFirstCandidate.status,
      secondCandidate: existingWithSecondCandidate.status,
    },
    combinedStatus: combinedCandidatesDecision.status,
    candidatePairStatus: candidateToCandidatePair?.status || null,
    resolutionTargets: combinedCandidatesPlan.resolutionTargets,
  },
));

const hardBlockWithUnknown = evaluateCompatibilityDecision({
  tank: tank(500, 200, 100, 25),
  items: [
    { species: byId('sp_0049'), quantity: 1, origin: 'existing' },
    { species: byId('sp_0431'), quantity: 10, origin: 'candidate' },
    { species: byId('sp_0474'), quantity: 6, origin: 'candidate' },
  ],
});
const hardBlockWithUnknownPlan = buildCompatibilityDecisionPlan(hardBlockWithUnknown);
cases.push(makeCase(
  'hard-block-dominates-nondominant-unknown',
  '已知硬阻断与身份/证据未知同时存在时，硬阻断直接阻止混养，但未知信息仍必须保留',
  'whole_tank_aggregation',
  [
    probe('identity_resolution', 'non-dominant unresolved identity remains visible in the aggregated evidence boundary', () => {
      assert.ok(hardBlockWithUnknown.missingData.length > 0);
      assert.equal(getCompatibilityDataLimitationReason(hardBlockWithUnknown), 'unresolved_identity');
      assert.ok(allCodes(hardBlockWithUnknown).has('species_identity_unresolved'));
    }),
    probe('whole_tank_aggregation', 'known hard block dominates the final verdict instead of being overwritten by unknown status', () => {
      assert.equal(hardBlockWithUnknown.status, 'not_recommended');
      assert.ok(hardBlockWithUnknown.blockingRules.some(rule => getCompatibilityRuleFamily(rule.code) === 'predation'));
      assert.ok(hardBlockWithUnknown.blockingRules.some(rule => getCompatibilityRuleFamily(rule.code) === 'housing'));
    }),
    probe('action_plan', 'user is told not to mix now; the non-dominant unknown is not promoted above the known hard block', () => {
      assert.equal(hardBlockWithUnknownPlan.verdict, 'do_not_mix');
      assert.equal(hardBlockWithUnknownPlan.unknownReason, null);
      assert.equal(hardBlockWithUnknownPlan.resolutionTargets.some(target => target.riskFamily === 'missing_information'), false);
      assert.equal(hardBlockWithUnknownPlan.nextSteps.some(step => /先补齐|暂时无法判断/.test(step)), false);
    }),
    ...presentationProbes(hardBlockWithUnknown),
  ],
  {
    status: hardBlockWithUnknown.status,
    dataLimitation: getCompatibilityDataLimitationReason(hardBlockWithUnknown),
    missingCodes: hardBlockWithUnknown.missingData.map(rule => rule.code),
    blockingFamilies: [...new Set(hardBlockWithUnknown.blockingRules.map(rule => getCompatibilityRuleFamily(rule.code)))].sort(),
    planVerdict: hardBlockWithUnknownPlan.verdict,
  },
));

const orderedAdjustableDecision = evaluateCompatibilityDecision({
  tank: tank(100, 40, 40, 24),
  items: [
    { species: byId('sp_0436'), quantity: 5, origin: 'existing' },
    { species: byId('sp_0431'), quantity: 10, origin: 'candidate' },
    { species: byId('sp_0443'), quantity: 6, origin: 'candidate' },
    { species: byId('sp_0012'), quantity: 6, origin: 'candidate' },
    { species: byId('sp_0010'), quantity: 6, origin: 'candidate' },
  ],
});
const orderedAdjustablePlan = buildCompatibilityDecisionPlan(orderedAdjustableDecision);
cases.push(makeCase(
  'multi-cause-ordered-action-sequence',
  '三个以上可调风险同时存在时，机器层保留完整处理顺序而主层只推进当前一步',
  'action_plan',
  [
    probe('whole_tank_aggregation', 'the tank is caution-only with at least three distinct adjustable families', () => {
      const families = new Set(orderedAdjustableDecision.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)));
      assert.equal(orderedAdjustableDecision.status, 'caution');
      assert.ok(families.size >= 3);
      assert.equal(orderedAdjustableDecision.blockingRules.length, 0);
    }),
    probe('action_plan', 'actionSequence keeps at least three ordered pending actions with exactly one current step', () => {
      assert.ok(orderedAdjustablePlan.actionSequence.length >= 3);
      assert.equal(orderedAdjustablePlan.actionSequence.filter(step => step.state === 'current').length, 1);
      assert.equal(orderedAdjustablePlan.actionSequence[0]?.state, 'current');
      assert.ok(orderedAdjustablePlan.actionSequence.slice(1, 3).every(step => step.state === 'next'));
      assert.ok(orderedAdjustablePlan.actionSequence.every((step, index) => step.order === index + 1));
      assert.ok(orderedAdjustablePlan.actionSequence.every(step => step.sourceRuleCode && step.resolutionTarget.criterion));
    }),
    probe('action_plan', 'adjustable aggression uses conditional mitigation language rather than falsely becoming a hard stop', () => {
      const first = orderedAdjustablePlan.actionSequence[0];
      assert.equal(first?.riskFamily, 'aggression');
      assert.match(first?.action || '', /加入.*前|遮挡|退让/);
      assert.doesNotMatch(first?.action || '', /^不要加入/);
      assert.equal(first?.resolutionTarget.resolutionMode, 'behavioral_recheck');
    }),
    ...presentationProbes(orderedAdjustableDecision),
  ],
  {
    status: orderedAdjustableDecision.status,
    warningFamilies: [...new Set(orderedAdjustableDecision.warningRules.map(rule => getCompatibilityRuleFamily(rule.code)))].sort(),
    actionSequence: orderedAdjustablePlan.actionSequence,
  },
));

cases.push(makeCase(
  'action-sequence-advances-after-first-step',
  '第一步完成并重新评估后，旧步骤退出 active sequence，第二风险自动成为 current',
  'action_plan',
  [
    probe('action_plan', 'before adjustment the explicit length rule is the current action', () => {
      assert.equal(partialSpaceBeforePlan.actionSequence[0]?.state, 'current');
      assert.equal(partialSpaceBeforePlan.actionSequence[0]?.riskFamily, 'space');
      assert.equal(partialSpaceBeforePlan.actionSequence[0]?.sourceRuleCode, 'length_too_short');
    }),
    probe('action_plan', 'after the 100cm threshold is met the completed length rule disappears and territory becomes current', () => {
      assert.equal(partialSpaceAfterPlan.actionSequence.some(step => step.sourceRuleCode === 'length_too_short'), false);
      assert.equal(partialSpaceAfterPlan.actionSequence[0]?.state, 'current');
      assert.equal(partialSpaceAfterPlan.actionSequence[0]?.riskFamily, 'territory');
    }),
    ...presentationProbes(partialSpaceAfter),
  ],
  {
    beforeSequence: partialSpaceBeforePlan.actionSequence,
    afterSequence: partialSpaceAfterPlan.actionSequence,
  },
));

cases.push(makeCase(
  'hard-stop-defers-soft-actions',
  '硬阻断与多个软风险共存时，硬阻断先处理，软风险保留但延期，避免制造“优化后就能混养”的错觉',
  'action_plan',
  [
    probe('action_plan', 'hard-block steps occupy the active front of the sequence', () => {
      assert.equal(sixSpeciesMixedRiskDecision.status, 'not_recommended');
      assert.equal(sixSpeciesMixedRiskPlan.actionSequence[0]?.state, 'current');
      assert.equal(sixSpeciesMixedRiskPlan.actionSequence[0]?.blockedByHardStop, false);
      assert.equal(sixSpeciesMixedRiskPlan.actionSequence[0]?.resolutionTarget.resolutionMode, 'deterministic_clearance');
    }),
    probe('action_plan', 'soft warnings remain internally available but are explicitly deferred behind the hard stop', () => {
      const deferred = sixSpeciesMixedRiskPlan.actionSequence.filter(step => step.state === 'deferred');
      assert.ok(deferred.length >= 1);
      assert.ok(deferred.every(step => step.blockedByHardStop));
      assert.ok(deferred.some(step => ['group_size', 'ph', 'reviewed_pair_rule'].includes(step.riskFamily)));
    }),
    probe('presentation', 'primary user layer remains one reason and one action despite the larger internal sequence', () => {
      const model = buildLocalCompatibilityAssessment(sixSpeciesMixedRiskDecision);
      const presentation = projectCompatibilityAssessmentForLocale({ model, decision: sixSpeciesMixedRiskDecision, isEnglish: false });
      assert.ok(presentation);
      assert.equal(presentation.why.length, 1);
      assert.equal(presentation.howTo.length, 1);
      assert.ok(presentation.plan.actionSequence.filter(step => step.state !== 'deferred').length >= 1);
    }),
  ],
  {
    status: sixSpeciesMixedRiskDecision.status,
    actionSequence: sixSpeciesMixedRiskPlan.actionSequence,
  },
));

cases.push(makeCase(
  'emergent-candidate-hard-block-leads-sequence',
  '两个候选之间新出现硬阻断时，处理链第一步必须精确指向冲突候选 pair',
  'action_plan',
  [
    probe('action_plan', 'candidate-to-candidate predation is the current sequence step', () => {
      const first = combinedCandidatesPlan.actionSequence[0];
      assert.equal(first?.state, 'current');
      assert.equal(first?.riskFamily, 'predation');
      assert.equal(first?.resolutionTarget.resolutionMode, 'deterministic_clearance');
      assert.deepEqual([...first!.resolutionTarget.speciesIds].sort(), ['sp_0011', 'sp_0118']);
    }),
    probe('action_plan', 'secondary risks cannot outrank the emergent hard block', () => {
      assert.equal(combinedCandidatesPlan.actionSequence[0]?.blockedByHardStop, false);
      assert.ok(combinedCandidatesPlan.actionSequence
        .filter(step => step.state === 'deferred')
        .every(step => step.blockedByHardStop));
    }),
    ...presentationProbes(combinedCandidatesDecision),
  ],
  {
    status: combinedCandidatesDecision.status,
    actionSequence: combinedCandidatesPlan.actionSequence,
  },
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

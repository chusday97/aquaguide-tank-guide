import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { CompatibilityDecision } from '../src/modules/knowledge/knowledge.types';
import type { CompatibilityAssessmentUiModel } from '../src/services/compatibility/compatibility-assessment.service';
import {
  getCompatibilityStatusLabelLocalized,
  projectCompatibilityAssessmentForLocale,
} from '../src/services/compatibility/compatibility-assessment-presentation.service';

const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);
const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
  return [];
};

const chineseModel = {
  main: {
    judgment: '有条件可以',
    why: ['中文原因'],
    howTo: ['中文动作'],
  },
  decisionPlan: {
    nextSteps: ['中文下一步'],
    expectedAfterAdjustment: '中文预期',
    reviewCheckpoint: '中文复查点',
    stopCondition: '中文停止条件',
  },
  details: {
    label: '查看依据',
    reasons: [{ text: '中文 AI 补充说明', ruleCodes: ['aggression_context'] }],
  },
  source: 'cloud_ai',
} as unknown as CompatibilityAssessmentUiModel;

const makeDecision = (
  status: CompatibilityDecision['status'],
  code: string,
): CompatibilityDecision => {
  const rule = {
    code,
    title: '中文规则标题',
    evidence: '中文证据',
    severity: status === 'not_recommended' ? 'high' : 'medium',
    basis: 'rule_inference',
    confidence: 'high',
    reviewStatus: 'reviewed',
    affectedSpeciesIds: [],
    citations: [],
  } as any;
  const base = {
    status,
    riskLevel: status === 'not_recommended' ? 'high' : status === 'compatible' ? 'none' : status === 'insufficient_data' ? 'unknown' : 'medium',
    summary: '中文总结',
    pairResults: [],
    blockedReasons: [],
    adjustableReasons: [],
    missingInformation: [],
    passedRules: [],
    warningRules: [],
    blockingRules: [],
    missingData: [],
    suggestions: [],
    aggregateResult: {
      status,
      riskLevel: 'medium',
      summary: '中文聚合',
      passedRules: [],
      warningRules: [],
      blockingRules: [],
      missingData: [],
      suggestions: [],
      metadata: {
        ruleVersion: 'test',
        speciesDataVersion: 'test',
        calculatedAt: new Date(0).toISOString(),
        scope: 'tank',
        intent: 'planned_addition',
        catalogVersion: 'test',
        domainRuleCodes: [code],
        domainStatus: status,
        decisionReadiness: status === 'insufficient_data' ? 'insufficient_data' : 'reviewed',
        authorityVersion: 'test',
      },
    },
    metadata: {
      ruleVersion: 'test',
      speciesDataVersion: 'test',
      calculatedAt: new Date(0).toISOString(),
      scope: 'tank',
      intent: 'planned_addition',
      catalogVersion: 'test',
      domainRuleCodes: [code],
      domainStatus: status,
      decisionReadiness: status === 'insufficient_data' ? 'insufficient_data' : 'reviewed',
      authorityVersion: 'test',
    },
  } as unknown as CompatibilityDecision;
  if (status === 'compatible') base.passedRules = [rule];
  if (status === 'caution') base.warningRules = [rule];
  if (status === 'not_recommended') base.blockingRules = [rule];
  if (status === 'insufficient_data') base.missingData = [rule];
  return base;
};

const scenarios: Array<[CompatibilityDecision['status'], string, string]> = [
  ['compatible', 'compatibility_clear', 'Compatible'],
  ['caution', 'fin_nipping_target_vulnerability', 'Compatible with adjustments'],
  ['not_recommended', 'species_water_type_conflict', 'Not recommended'],
  ['not_recommended', 'predation_risk', 'Not recommended'],
  ['caution', 'minimum_group_not_met', 'Compatible with adjustments'],
  ['insufficient_data', 'species_evidence_unreviewed', 'More information needed'],
];

for (const [status, code, expectedJudgment] of scenarios) {
  const decision = makeDecision(status, code);
  const before = JSON.stringify(decision);
  const projected = projectCompatibilityAssessmentForLocale({
    model: chineseModel,
    decision,
    isEnglish: true,
  });
  assert.ok(projected);
  assert.equal(projected.judgment, expectedJudgment);
  assert.equal(JSON.stringify(decision), before, 'presentation must never mutate deterministic decision');
  for (const text of collectStrings(projected)) {
    assert.equal(hasCjk(text), false, `English compatibility projection contains CJK for ${status}/${code}: ${text}`);
  }
  assert.equal(projected.details.reasons.length, 0, 'Chinese AI narrative must not leak into English presentation');
}

const englishAiModel = {
  ...chineseModel,
  details: { label: 'View evidence', reasons: [{ text: 'English grounded explanation', ruleCodes: ['fin_nipping_target_vulnerability'] }] },
} as unknown as CompatibilityAssessmentUiModel;
const englishAiProjected = projectCompatibilityAssessmentForLocale({
  model: englishAiModel,
  decision: makeDecision('caution', 'fin_nipping_target_vulnerability'),
  isEnglish: true,
});
assert.equal(englishAiProjected?.details.reasons[0]?.text, 'English grounded explanation');

for (const status of ['compatible', 'caution', 'not_recommended', 'insufficient_data'] as const) {
  assert.equal(hasCjk(getCompatibilityStatusLabelLocalized(status, true)), false);
}

const chineseProjection = projectCompatibilityAssessmentForLocale({
  model: chineseModel,
  decision: makeDecision('caution', 'fin_nipping_target_vulnerability'),
  isEnglish: false,
});
assert.equal(chineseProjection?.judgment, '有条件可以');
assert.deepEqual(chineseProjection?.why, ['中文原因']);

const aquariumSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(aquariumSource, /main\.judgment !== '可以养'/, 'UI branching must use stable status, not Chinese judgment text');
assert.doesNotMatch(aquariumSource, /addFishAssessmentView\?\.main\.why|addFishAssessmentView\?\.main\.howTo|addFishAssessmentView\.decisionPlan/);
assert.match(aquariumSource, /addFishCompatibilityReview\.status !== 'compatible'/);
assert.match(aquariumSource, /projectCompatibilityAssessmentForLocale/);
assert.match(aquariumSource, /getCompatibilityRuleFamilyEnglishReason/);

console.log('add-fish compatibility presentation boundary verified: deterministic status/rule families drive English UI without mutating canonical decision');

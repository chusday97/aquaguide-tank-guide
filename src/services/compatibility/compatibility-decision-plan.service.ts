import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';
import {
  buildBeginnerCompatibilityAction,
  type BeginnerCompatibilityVerdict,
  type CompatibilityActionAuthorityLevel,
  type CompatibilityAssessmentMode,
} from './compatibility-action.service';
import { buildCompatibilityReadableConclusion } from './compatibility-readable-copy.service';

export type CompatibilityUnknownReason =
  | 'missing_user_input'
  | 'unresolved_identity'
  | 'public_evidence_insufficient'
  | 'missing_species_fact'
  | null;

export type CompatibilityDecisionPlan = {
  judgment: '可以养' | '有条件可以' | '不建议' | '暂时无法判断';
  verdict: BeginnerCompatibilityVerdict;
  fullyInformed: boolean;
  riskSummary: string[];
  nextSteps: string[];
  expectedAfterAdjustment: string;
  reviewCheckpoint: string;
  stopCondition: string;
  unknownReason: CompatibilityUnknownReason;
  evidence: {
    authorityLevel: CompatibilityActionAuthorityLevel;
    sourceRuleCodes: string[];
    evidenceIds: string[];
  };
};

const unique = (values: Array<string | null | undefined>) => Array.from(new Set(
  values.map(value => value?.trim()).filter((value): value is string => Boolean(value)),
));

const decisionCodes = (decision: CompatibilityDecision) => new Set([
  ...(decision.metadata.domainRuleCodes || []),
  ...decision.blockingRules.map(rule => rule.code),
  ...decision.warningRules.map(rule => rule.code),
  ...decision.missingData.map(rule => rule.code),
]);

export const isCompatibilityDecisionFullyInformed = (decision: CompatibilityDecision) => (
  decision.metadata.decisionReadiness === 'reviewed'
  && decision.missingData.length === 0
);

const unknownReasonFor = (decision: CompatibilityDecision): CompatibilityUnknownReason => {
  if (decision.status !== 'insufficient_data') return null;
  const codes = decisionCodes(decision);
  if (
    codes.has('species_identity_unresolved')
    || [...codes].some(code => code.startsWith('identity_') && code.endsWith('_unresolved'))
  ) return 'unresolved_identity';
  if (
    codes.has('species_public_evidence_insufficient')
    || [...codes].some(code => code.startsWith('public_evidence_') && code.endsWith('_insufficient'))
  ) return 'public_evidence_insufficient';
  if (
    codes.has('species_evidence_unreviewed')
    || [...codes].some(code => code.startsWith('required_fact_') && code.endsWith('_missing'))
  ) return 'missing_species_fact';
  return 'missing_user_input';
};

const expectedOutcomeFor = (
  decision: CompatibilityDecision,
  verdict: BeginnerCompatibilityVerdict,
) => {
  if (verdict === 'add') {
    return '当前无需为兼容性额外调整；维持现有条件并持续观察，结论应保持“可以养”。';
  }
  if (verdict === 'add_with_conditions') {
    return '完成建议调整后重新评估；只有对应风险项解除，才把结果升级为“可以养”。';
  }
  if (verdict === 'do_not_mix') {
    return '当前不是“观察看看”即可解决；先消除阻断风险或更换/分隔冲突物种，重新评估通过后再考虑混养。';
  }
  if (verdict === 'wait') {
    return '先处理当前现实异常并重新评估；状态恢复稳定前不要继续扩大组合。';
  }
  if (decision.status === 'insufficient_data') {
    return '补齐缺失信息或证据后重新计算；在新结论生成前，不预测这组生物可以安全混养。';
  }
  return '完成建议后重新评估，再决定是否继续当前混养方案。';
};

export const buildCompatibilityDecisionPlan = (
  decision: CompatibilityDecision,
  mode: CompatibilityAssessmentMode = 'planned_addition',
): CompatibilityDecisionPlan => {
  const action = buildBeginnerCompatibilityAction(decision, mode);
  const readable = buildCompatibilityReadableConclusion(decision, {}, mode);
  const fullyInformed = isCompatibilityDecisionFullyInformed(decision);

  if (fullyInformed && decision.status === 'insufficient_data') {
    throw new Error('compatibility_invariant_fully_informed_cannot_be_unknown');
  }

  const nextSteps = unique([
    action.immediateAction,
    ...readable.howTo,
  ]).slice(0, 3);

  return {
    judgment: readable.judgment,
    verdict: action.verdict,
    fullyInformed,
    riskSummary: unique(readable.why).slice(0, 3),
    nextSteps,
    expectedAfterAdjustment: expectedOutcomeFor(decision, action.verdict),
    reviewCheckpoint: action.observeAfterAction || '调整后重新运行混养判断，并继续观察实际状态是否稳定。',
    stopCondition: action.stopCondition || '如果出现持续追逐、受伤、拒食、长期躲藏或呼吸异常，停止继续新增并重新评估。',
    unknownReason: unknownReasonFor(decision),
    evidence: {
      authorityLevel: action.authorityLevel,
      sourceRuleCodes: action.sourceRuleCodes,
      evidenceIds: action.evidenceIds,
    },
  };
};

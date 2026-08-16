import type { DiagnosisConflictEvidenceResult } from './diagnosisConflictEvidence';
import { buildDiagnosisConflictEvidence } from './diagnosisConflictEvidence';
import type { TankDecisionSupportResult } from './tankDecisionSupportOrchestrator';

export type QuickDiagnosisConflictAugmentationStatus =
  | 'not_applicable'
  | 'no_specific_conflict_evidence'
  | 'specific_conflict_evidence'
  | 'partial_specific_conflict_evidence'
  | 'community_identity_incomplete';

export type QuickDiagnosisConflictPriority = 'none' | 'attention' | 'high';

export type QuickDiagnosisConflictAugmentation = {
  status: QuickDiagnosisConflictAugmentationStatus;
  priority: QuickDiagnosisConflictPriority;
  headline: string | null;
  causeAdditions: string[];
  todayActionAdditions: string[];
  avoidActionAdditions: string[];
  evidenceAdditions: string[];
  limitations: string[];
  showInterventionComparison: boolean;
  interventionComparisonMode: 'available' | 'blocked_by_incomplete_identity' | 'not_needed';
  conflictEvidence: DiagnosisConflictEvidenceResult;
};

type BuildQuickDiagnosisConflictAugmentationInput = {
  issueType: string;
  decisionSupport: TankDecisionSupportResult;
  targetSpeciesIds?: string[];
  isEn?: boolean;
};

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const relationshipHeadline = (
  evidence: DiagnosisConflictEvidenceResult,
  isEn: boolean,
) => {
  const primary = evidence.relationships[0];
  if (!primary) return null;
  const arrow = primary.direction === 'one_way' ? '→' : '↔';
  if (primary.relation === 'predation') {
    return isEn
      ? `Known predation relationship: ${primary.sourceName} ${arrow} ${primary.targetName}`
      : `已发现明确捕食关系：${primary.sourceName} ${arrow} ${primary.targetName}`;
  }
  return isEn
    ? `Known behavior conflict: ${primary.sourceName} ${arrow} ${primary.targetName}`
    : `已发现具体行为冲突：${primary.sourceName} ${arrow} ${primary.targetName}`;
};

const buildActionAdditions = (
  evidence: DiagnosisConflictEvidenceResult,
  isEn: boolean,
) => {
  const actions: string[] = [];
  evidence.resolutionSignals.forEach(signal => {
    if (signal.mode === 'compare_relocation_options') {
      actions.push(isEn
        ? 'Compare the keep/relocation scenarios and check which blockers remain after each simulated change.'
        : '查看保留 / 移出方案比较，并确认每个模拟调整后还剩哪些阻断关系。');
    } else if (signal.mode === 'blocked_by_incomplete_identity') {
      actions.push(isEn
        ? 'Identify the unresolved current resident before generating a formal whole-community intervention plan.'
        : '先确认当前身份未明的缸内生物，再生成正式的全群落调整方案。');
    } else if (signal.mode === 'adjust_environment') {
      actions.push(isEn ? 'Review the specific environment condition linked to this relationship.' : '按该关系对应的具体环境条件逐项调整。');
    } else if (signal.mode === 'adjust_quantity') {
      actions.push(isEn ? 'Review the group-size or quantity condition before changing the community.' : '先核对群体数量 / 数量条件，再决定是否调整群落。');
    } else if (signal.mode === 'collect_more_data') {
      actions.push(isEn ? 'Collect the missing behavior or identity evidence before drawing a stronger conclusion.' : '先补齐缺失的行为或身份资料，再形成更强结论。');
    } else {
      actions.push(isEn
        ? 'Record whether the same aggressor and affected animal repeat the interaction, including injury and feeding access.'
        : '记录是否持续由同一追咬者针对同一对象，并观察损伤与进食受阻情况。');
    }
  });
  return unique(actions);
};

const buildAvoidAdditions = (
  evidence: DiagnosisConflictEvidenceResult,
  isEn: boolean,
) => {
  const avoids: string[] = [];
  if (evidence.relationships.some(item => item.relation === 'predation' && item.outcome === 'blocker')) {
    avoids.push(isEn
      ? 'Do not present added hiding places as proof that a reviewed predation/swallowing blocker has been removed.'
      : '不要把增加躲避物描述成已经消除了有审核证据的捕食 / 吞食阻断。');
  }
  if (evidence.resolutionSignals.some(signal => signal.mode === 'compare_relocation_options')) {
    avoids.push(isEn
      ? 'Do not decide which species to relocate before comparing the recomputed remaining conflicts for each option.'
      : '不要在比较各方案重算后的剩余冲突之前，直接替用户决定移出哪个物种。');
  }
  if (evidence.certainty === 'partial_known_community') {
    avoids.push(isEn
      ? 'Do not treat the known-subset conflict result as a complete whole-tank conclusion.'
      : '不要把已确认物种的局部冲突结果当成完整全缸结论。');
  }
  return unique(avoids);
};

export const buildQuickDiagnosisConflictAugmentation = ({
  issueType,
  decisionSupport,
  targetSpeciesIds = [],
  isEn = false,
}: BuildQuickDiagnosisConflictAugmentationInput): QuickDiagnosisConflictAugmentation => {
  const conflictEvidence = buildDiagnosisConflictEvidence({
    issueType,
    decisionSupport,
    targetSpeciesIds,
  });

  if (conflictEvidence.status === 'not_applicable') {
    return {
      status: 'not_applicable',
      priority: 'none',
      headline: null,
      causeAdditions: [],
      todayActionAdditions: [],
      avoidActionAdditions: [],
      evidenceAdditions: [],
      limitations: [],
      showInterventionComparison: false,
      interventionComparisonMode: 'not_needed',
      conflictEvidence,
    };
  }

  if (conflictEvidence.relationships.length === 0) {
    const identityIncomplete = conflictEvidence.status === 'insufficient_community_identity';
    return {
      status: identityIncomplete ? 'community_identity_incomplete' : 'no_specific_conflict_evidence',
      priority: 'none',
      headline: identityIncomplete
        ? (isEn ? 'Community identity is incomplete' : '当前群落身份信息不完整')
        : null,
      causeAdditions: [],
      todayActionAdditions: identityIncomplete
        ? [isEn ? 'Identify the unresolved current resident before relying on a whole-community behavior conclusion.' : '先确认当前身份未明的缸内生物，再依赖全群落行为结论。']
        : [],
      avoidActionAdditions: identityIncomplete
        ? [isEn ? 'Do not interpret “no known conflict” as “no conflict exists” while residents remain unresolved.' : '缸内仍有未确认生物时，不要把“已知部分未发现冲突”解释成“全缸不存在冲突”。']
        : [],
      evidenceAdditions: [],
      limitations: conflictEvidence.limitations,
      showInterventionComparison: false,
      interventionComparisonMode: identityIncomplete ? 'blocked_by_incomplete_identity' : 'not_needed',
      conflictEvidence,
    };
  }

  const hasHighBlocker = conflictEvidence.relationships.some(item => item.outcome === 'blocker' && item.severity === 'high');
  const partial = conflictEvidence.status === 'relevant_conflict_found_partial';
  const comparisonAvailable = conflictEvidence.formalInterventionAllowed
    && conflictEvidence.resolutionSignals.some(signal => signal.mode === 'compare_relocation_options');

  return {
    status: partial ? 'partial_specific_conflict_evidence' : 'specific_conflict_evidence',
    priority: hasHighBlocker ? 'high' : 'attention',
    headline: relationshipHeadline(conflictEvidence, isEn),
    causeAdditions: conflictEvidence.evidenceStatements,
    todayActionAdditions: buildActionAdditions(conflictEvidence, isEn),
    avoidActionAdditions: buildAvoidAdditions(conflictEvidence, isEn),
    evidenceAdditions: conflictEvidence.evidenceStatements,
    limitations: conflictEvidence.limitations,
    showInterventionComparison: comparisonAvailable,
    interventionComparisonMode: partial
      ? 'blocked_by_incomplete_identity'
      : comparisonAvailable ? 'available' : 'not_needed',
    conflictEvidence,
  };
};

import type { ConflictEdge } from './communityConflictGraph';
import type { TankDecisionSupportResult } from './tankDecisionSupportOrchestrator';

export type ConflictAwareDiagnosisIssue = 'aggression' | 'hiding' | 'death';

export type DiagnosisConflictStatus =
  | 'not_applicable'
  | 'relevant_conflict_found'
  | 'relevant_conflict_found_partial'
  | 'no_relevant_conflict_found'
  | 'insufficient_community_identity';

export type DiagnosisConflictRelationship = {
  conflictId: string;
  sourceSpeciesId: string;
  sourceName: string;
  targetSpeciesId: string;
  targetName: string;
  direction: ConflictEdge['direction'];
  relation: ConflictEdge['relation'];
  severity: ConflictEdge['severity'];
  outcome: ConflictEdge['outcome'];
  evidence: string;
  basis: ConflictEdge['basis'];
  confidence: ConflictEdge['confidence'];
  reviewStatus: ConflictEdge['reviewStatus'];
  citationCount: number;
};

export type DiagnosisConflictResolutionSignal = {
  conflictId: string;
  mode:
    | 'compare_relocation_options'
    | 'adjust_environment'
    | 'adjust_quantity'
    | 'collect_more_data'
    | 'monitor'
    | 'blocked_by_incomplete_identity';
  candidateSubjectSpeciesIds: string[];
  evidenceMode: 'counterfactual_recomputed' | 'rule_mapped' | 'unavailable';
};

export type DiagnosisConflictEvidenceResult = {
  status: DiagnosisConflictStatus;
  certainty: TankDecisionSupportResult['certainty'];
  formalInterventionAllowed: boolean;
  relationships: DiagnosisConflictRelationship[];
  resolutionSignals: DiagnosisConflictResolutionSignal[];
  evidenceStatements: string[];
  limitations: string[];
};

type BuildDiagnosisConflictEvidenceInput = {
  issueType: string;
  decisionSupport: TankDecisionSupportResult;
  targetSpeciesIds?: string[];
};

const relevantRelationsByIssue: Record<ConflictAwareDiagnosisIssue, Set<ConflictEdge['relation']>> = {
  aggression: new Set(['predation', 'aggression', 'fin_nipping', 'territorial']),
  hiding: new Set(['predation', 'aggression', 'fin_nipping', 'territorial']),
  death: new Set(['predation', 'aggression']),
};

const supportedIssue = (issueType: string): issueType is ConflictAwareDiagnosisIssue => (
  issueType === 'aggression' || issueType === 'hiding' || issueType === 'death'
);

const relationshipName = (
  decisionSupport: TankDecisionSupportResult,
  speciesId: string,
) => decisionSupport.knownSubsetActionPlan.graph.nodes.find(node => node.speciesId === speciesId)?.name || speciesId;

const toRelationship = (
  decisionSupport: TankDecisionSupportResult,
  edge: ConflictEdge,
): DiagnosisConflictRelationship => ({
  conflictId: edge.id,
  sourceSpeciesId: edge.sourceSpeciesId,
  sourceName: relationshipName(decisionSupport, edge.sourceSpeciesId),
  targetSpeciesId: edge.targetSpeciesId,
  targetName: relationshipName(decisionSupport, edge.targetSpeciesId),
  direction: edge.direction,
  relation: edge.relation,
  severity: edge.severity,
  outcome: edge.outcome,
  evidence: edge.evidence,
  basis: edge.basis,
  confidence: edge.confidence,
  reviewStatus: edge.reviewStatus,
  citationCount: edge.citations.length,
});

const resolutionSignalForEdge = (
  decisionSupport: TankDecisionSupportResult,
  edge: ConflictEdge,
): DiagnosisConflictResolutionSignal => {
  if (!decisionSupport.formalInterventionAllowed) {
    return {
      conflictId: edge.id,
      mode: 'blocked_by_incomplete_identity',
      candidateSubjectSpeciesIds: [],
      evidenceMode: 'unavailable',
    };
  }

  if (edge.fixability === 'relocation') {
    const candidateSubjectSpeciesIds = decisionSupport.knownSubsetActionPlan.relocationOptions
      .filter(option => option.resolvesBlockerIds.includes(edge.id))
      .flatMap(option => option.subjectSpeciesIds)
      .filter((id, index, list) => list.indexOf(id) === index)
      .sort();
    return {
      conflictId: edge.id,
      mode: 'compare_relocation_options',
      candidateSubjectSpeciesIds,
      evidenceMode: 'counterfactual_recomputed',
    };
  }

  const mapped = decisionSupport.knownSubsetActionPlan.conditionActions.find(action => action.conflictIds.includes(edge.id));
  if (!mapped) {
    return {
      conflictId: edge.id,
      mode: 'monitor',
      candidateSubjectSpeciesIds: [],
      evidenceMode: 'rule_mapped',
    };
  }

  return {
    conflictId: edge.id,
    mode: mapped.action === 'adjust_environment'
      ? 'adjust_environment'
      : mapped.action === 'adjust_quantity'
        ? 'adjust_quantity'
        : mapped.action === 'collect_more_data'
          ? 'collect_more_data'
          : 'monitor',
    candidateSubjectSpeciesIds: mapped.subjectSpeciesIds,
    evidenceMode: 'rule_mapped',
  };
};

export const buildDiagnosisConflictEvidence = ({
  issueType,
  decisionSupport,
  targetSpeciesIds = [],
}: BuildDiagnosisConflictEvidenceInput): DiagnosisConflictEvidenceResult => {
  if (!supportedIssue(issueType)) {
    return {
      status: 'not_applicable',
      certainty: decisionSupport.certainty,
      formalInterventionAllowed: decisionSupport.formalInterventionAllowed,
      relationships: [],
      resolutionSignals: [],
      evidenceStatements: [],
      limitations: [],
    };
  }

  const relevantRelations = relevantRelationsByIssue[issueType];
  const targetSet = new Set(targetSpeciesIds.filter(Boolean));
  const relevantEdges = decisionSupport.knownSubsetActionPlan.graph.edges
    .filter(edge => edge.outcome === 'blocker' || edge.outcome === 'warning')
    .filter(edge => relevantRelations.has(edge.relation))
    .filter(edge => targetSet.size === 0 || targetSet.has(edge.sourceSpeciesId) || targetSet.has(edge.targetSpeciesId));
  const relationships = relevantEdges.map(edge => toRelationship(decisionSupport, edge));
  const resolutionSignals = relevantEdges.map(edge => resolutionSignalForEdge(decisionSupport, edge));
  const partial = decisionSupport.certainty === 'partial_known_community';

  const evidenceStatements = relationships.map(relationship => {
    const arrow = relationship.direction === 'one_way' ? '→' : '↔';
    return `${relationship.sourceName} ${arrow} ${relationship.targetName}: ${relationship.evidence}`;
  });

  const limitations: string[] = [];
  if (partial) {
    limitations.push('当前鱼缸仍有身份未确认的生物；以下只代表已确认物种之间的冲突证据，不能视为完整全缸结论。');
  }
  if (relationships.some(item => item.confidence === 'unknown' || item.reviewStatus !== 'reviewed')) {
    limitations.push('部分行为关系缺少完整审核证据，不能据此宣称已证明的因果关系。');
  }

  const status: DiagnosisConflictStatus = relationships.length > 0
    ? partial ? 'relevant_conflict_found_partial' : 'relevant_conflict_found'
    : partial ? 'insufficient_community_identity' : 'no_relevant_conflict_found';

  return {
    status,
    certainty: decisionSupport.certainty,
    formalInterventionAllowed: decisionSupport.formalInterventionAllowed,
    relationships,
    resolutionSignals,
    evidenceStatements,
    limitations,
  };
};

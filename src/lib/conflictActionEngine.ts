import type { Fish } from '../types';
import {
  buildCommunityConflictGraph,
  type CommunityConflictGraph,
  type ConflictEdge,
  type ConflictFixability,
} from './communityConflictGraph';
import {
  simulateTankInterventions,
  type RelocationInterventionScenario,
  type TankInterventionSimulationResult,
} from './tankInterventionSimulator';

export type ConflictActionType =
  | 'relocate_species'
  | 'adjust_environment'
  | 'adjust_quantity'
  | 'collect_more_data'
  | 'monitor';

export type ConflictActionEffect =
  | 'removes_blocking_relationship'
  | 'addresses_condition'
  | 'reduces_uncertainty'
  | 'observe_only';

export type ConflictActionEvidenceMode = 'counterfactual_recomputed' | 'rule_mapped';

export type RelocationActionOption = {
  id: string;
  action: 'relocate_species';
  effect: 'removes_blocking_relationship';
  evidenceMode: 'counterfactual_recomputed';
  subjectSpeciesIds: string[];
  subjectName: string;
  quantity: number;
  strongestSingleChange: boolean;
  resolvesConflictIds: string[];
  resolvesBlockerIds: string[];
  remainingBlockerIds: string[];
  blockerReduction: number;
  warningReduction: number;
  evidenceGapReduction: number;
  scenario: RelocationInterventionScenario;
};

export type RuleMappedActionOption = {
  id: string;
  action: Exclude<ConflictActionType, 'relocate_species'>;
  effect: Exclude<ConflictActionEffect, 'removes_blocking_relationship'>;
  evidenceMode: 'rule_mapped';
  subjectSpeciesIds: string[];
  conflictIds: string[];
  title: string;
  rationale: string;
  sourceFixability: ConflictFixability;
  outcome: ConflictEdge['outcome'];
  severity: ConflictEdge['severity'];
  basis: ConflictEdge['basis'];
  confidence: ConflictEdge['confidence'];
  reviewStatus: ConflictEdge['reviewStatus'];
};

export type ConflictActionPlan = {
  graph: CommunityConflictGraph;
  intervention: TankInterventionSimulationResult;
  relocationOptions: RelocationActionOption[];
  conditionActions: RuleMappedActionOption[];
  strongestSingleChangeSpeciesIds: string[];
  unresolvedBlockerIds: string[];
  summary: {
    blockerCount: number;
    relocationOptionCount: number;
    conditionActionCount: number;
    evidenceGapActionCount: number;
  };
};

type ConflictActionInput = Array<{
  species: Fish;
  quantity?: number;
}>;

const actionForFixability = (fixability: ConflictFixability): RuleMappedActionOption['action'] | null => {
  if (fixability === 'environment_adjustment') return 'adjust_environment';
  if (fixability === 'quantity_adjustment') return 'adjust_quantity';
  if (fixability === 'more_data') return 'collect_more_data';
  if (fixability === 'monitor') return 'monitor';
  return null;
};

const effectForAction = (action: RuleMappedActionOption['action']): RuleMappedActionOption['effect'] => {
  if (action === 'collect_more_data') return 'reduces_uncertainty';
  if (action === 'monitor') return 'observe_only';
  return 'addresses_condition';
};

const blockerIdSet = (graph: CommunityConflictGraph) => new Set(
  graph.edges.filter(edge => edge.outcome === 'blocker').map(edge => edge.id),
);

const buildRelocationOption = (
  scenario: RelocationInterventionScenario,
  baselineGraph: CommunityConflictGraph,
  strongestIds: Set<string>,
): RelocationActionOption | null => {
  if (scenario.blockerReduction <= 0) return null;
  const baselineBlockers = blockerIdSet(baselineGraph);
  const remainingBlockers = blockerIdSet(scenario.afterGraph);
  const resolvesBlockerIds = scenario.resolvedConflictIds
    .filter(id => baselineBlockers.has(id))
    .sort();
  if (resolvesBlockerIds.length === 0) return null;

  return {
    id: `relocate__${scenario.subjectSpeciesId}`,
    action: 'relocate_species',
    effect: 'removes_blocking_relationship',
    evidenceMode: 'counterfactual_recomputed',
    subjectSpeciesIds: [scenario.subjectSpeciesId],
    subjectName: scenario.subjectName,
    quantity: scenario.removedQuantity,
    strongestSingleChange: strongestIds.has(scenario.subjectSpeciesId),
    resolvesConflictIds: scenario.resolvedConflictIds,
    resolvesBlockerIds,
    remainingBlockerIds: Array.from(remainingBlockers).sort(),
    blockerReduction: scenario.blockerReduction,
    warningReduction: scenario.warningReduction,
    evidenceGapReduction: scenario.evidenceGapReduction,
    scenario,
  };
};

const buildRuleMappedAction = (edge: ConflictEdge): RuleMappedActionOption | null => {
  const action = actionForFixability(edge.fixability);
  if (!action) return null;
  return {
    id: `${action}__${edge.id}`,
    action,
    effect: effectForAction(action),
    evidenceMode: 'rule_mapped',
    subjectSpeciesIds: edge.affectedSpeciesIds.length > 0
      ? [...edge.affectedSpeciesIds].sort()
      : [edge.sourceSpeciesId, edge.targetSpeciesId].sort(),
    conflictIds: [edge.id],
    title: edge.title,
    rationale: edge.evidence,
    sourceFixability: edge.fixability,
    outcome: edge.outcome,
    severity: edge.severity,
    basis: edge.basis,
    confidence: edge.confidence,
    reviewStatus: edge.reviewStatus,
  };
};

const dedupeRuleActions = (actions: RuleMappedActionOption[]) => {
  const seen = new Set<string>();
  return actions.filter(action => {
    const key = `${action.action}::${action.conflictIds.join(',')}::${action.rationale}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildConflictActionPlan = (input: ConflictActionInput): ConflictActionPlan => {
  const graph = buildCommunityConflictGraph(input);
  const intervention = simulateTankInterventions(input);
  const strongestIds = new Set(intervention.minimumChangeCandidateSpeciesIds);

  const relocationOptions = intervention.scenarios
    .map(scenario => buildRelocationOption(scenario, graph, strongestIds))
    .filter((option): option is RelocationActionOption => Boolean(option))
    .sort((left, right) => {
      if (right.blockerReduction !== left.blockerReduction) return right.blockerReduction - left.blockerReduction;
      return left.subjectSpeciesIds[0].localeCompare(right.subjectSpeciesIds[0]);
    });

  // Only non-relocation fixability is converted directly from rules. Relocation
  // options must come from the counterfactual simulator so the product never
  // claims that moving a species resolves a blocker without re-evaluating the
  // remaining community.
  const conditionActions = dedupeRuleActions([
    ...graph.edges.map(buildRuleMappedAction).filter((item): item is RuleMappedActionOption => Boolean(item)),
    ...graph.evidenceGaps.map(buildRuleMappedAction).filter((item): item is RuleMappedActionOption => Boolean(item)),
  ]).sort((left, right) => {
    const severityRank = { high: 3, medium: 2, low: 1, info: 0 } as const;
    const severityDelta = severityRank[right.severity] - severityRank[left.severity];
    if (severityDelta !== 0) return severityDelta;
    return left.id.localeCompare(right.id);
  });

  const unresolvedBlockerIds = graph.edges
    .filter(edge => edge.outcome === 'blocker')
    .filter(edge => {
      if (edge.fixability === 'relocation') {
        return !relocationOptions.some(option => option.resolvesBlockerIds.includes(edge.id));
      }
      return !conditionActions.some(action => action.conflictIds.includes(edge.id));
    })
    .map(edge => edge.id)
    .sort();

  return {
    graph,
    intervention,
    relocationOptions,
    conditionActions,
    strongestSingleChangeSpeciesIds: [...intervention.minimumChangeCandidateSpeciesIds],
    unresolvedBlockerIds,
    summary: {
      blockerCount: graph.summary.blockerCount,
      relocationOptionCount: relocationOptions.length,
      conditionActionCount: conditionActions.length,
      evidenceGapActionCount: conditionActions.filter(action => action.action === 'collect_more_data').length,
    },
  };
};

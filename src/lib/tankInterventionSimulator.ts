import type { Fish } from '../types';
import {
  buildCommunityConflictGraph,
  type CommunityConflictGraph,
  type ConflictEdge,
} from './communityConflictGraph';

export type InterventionScenarioStatus = 'improves' | 'no_change' | 'worsens';

export type InterventionRiskSummary = {
  blockerCount: number;
  warningCount: number;
  evidenceGapCount: number;
};

export type RelocationInterventionScenario = {
  action: 'relocate_species';
  subjectSpeciesId: string;
  subjectName: string;
  removedQuantity: number;
  status: InterventionScenarioStatus;
  before: InterventionRiskSummary;
  after: InterventionRiskSummary;
  blockerReduction: number;
  warningReduction: number;
  evidenceGapReduction: number;
  resolvedConflictIds: string[];
  remainingConflictIds: string[];
  resolvedEvidenceGapIds: string[];
  remainingEvidenceGapIds: string[];
  introducedConflictIds: string[];
  introducedEvidenceGapIds: string[];
  afterGraph: CommunityConflictGraph;
};

export type TankInterventionSimulationResult = {
  baselineGraph: CommunityConflictGraph;
  scenarios: RelocationInterventionScenario[];
  minimumChangeCandidateSpeciesIds: string[];
  summary: {
    hasBlockingConflict: boolean;
    bestSingleSpeciesBlockerReduction: number;
    candidateCount: number;
  };
};

type TankInterventionInput = Array<{
  species: Fish;
  quantity?: number;
}>;

const summarizeGraph = (graph: CommunityConflictGraph): InterventionRiskSummary => ({
  blockerCount: graph.summary.blockerCount,
  warningCount: graph.summary.warningCount,
  evidenceGapCount: graph.summary.evidenceGapCount,
});

const edgeIds = (edges: ConflictEdge[]) => new Set(edges.map(edge => edge.id));

const difference = (left: Set<string>, right: Set<string>) => Array.from(left)
  .filter(value => !right.has(value))
  .sort();

const compareScenarioStatus = (
  before: InterventionRiskSummary,
  after: InterventionRiskSummary,
): InterventionScenarioStatus => {
  const beforeVector = [before.blockerCount, before.warningCount, before.evidenceGapCount];
  const afterVector = [after.blockerCount, after.warningCount, after.evidenceGapCount];
  for (let index = 0; index < beforeVector.length; index += 1) {
    if (afterVector[index] < beforeVector[index]) return 'improves';
    if (afterVector[index] > beforeVector[index]) return 'worsens';
  }
  return 'no_change';
};

const normalizeInput = (input: TankInterventionInput) => {
  const byId = new Map<string, { species: Fish; quantity: number }>();
  input.forEach(item => {
    if (!item.species?.id) return;
    const parsed = Number(item.quantity);
    const quantity = Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : 1;
    const existing = byId.get(item.species.id);
    byId.set(item.species.id, {
      species: item.species,
      quantity: (existing?.quantity || 0) + quantity,
    });
  });
  return Array.from(byId.values()).sort((a, b) => a.species.id.localeCompare(b.species.id));
};

export const simulateTankInterventions = (
  input: TankInterventionInput,
): TankInterventionSimulationResult => {
  const normalized = normalizeInput(input);
  const baselineGraph = buildCommunityConflictGraph(normalized);
  const before = summarizeGraph(baselineGraph);
  const baselineConflictIds = edgeIds(baselineGraph.edges);
  const baselineEvidenceGapIds = edgeIds(baselineGraph.evidenceGaps);

  const scenarios = normalized.map(subject => {
    const remaining = normalized.filter(item => item.species.id !== subject.species.id);
    const afterGraph = buildCommunityConflictGraph(remaining);
    const after = summarizeGraph(afterGraph);
    const afterConflictIds = edgeIds(afterGraph.edges);
    const afterEvidenceGapIds = edgeIds(afterGraph.evidenceGaps);

    return {
      action: 'relocate_species' as const,
      subjectSpeciesId: subject.species.id,
      subjectName: subject.species.name,
      removedQuantity: subject.quantity,
      status: compareScenarioStatus(before, after),
      before,
      after,
      blockerReduction: before.blockerCount - after.blockerCount,
      warningReduction: before.warningCount - after.warningCount,
      evidenceGapReduction: before.evidenceGapCount - after.evidenceGapCount,
      resolvedConflictIds: difference(baselineConflictIds, afterConflictIds),
      remainingConflictIds: Array.from(afterConflictIds).sort(),
      resolvedEvidenceGapIds: difference(baselineEvidenceGapIds, afterEvidenceGapIds),
      remainingEvidenceGapIds: Array.from(afterEvidenceGapIds).sort(),
      introducedConflictIds: difference(afterConflictIds, baselineConflictIds),
      introducedEvidenceGapIds: difference(afterEvidenceGapIds, baselineEvidenceGapIds),
      afterGraph,
    } satisfies RelocationInterventionScenario;
  });

  const bestSingleSpeciesBlockerReduction = scenarios.reduce(
    (best, scenario) => Math.max(best, scenario.blockerReduction),
    0,
  );

  // "Minimum-change" here has a deliberately narrow meaning: among scenarios
  // that each relocate exactly one species group, surface every option that
  // removes the largest number of current blocker edges. Ties stay ties; this
  // layer does not invent keeper preference, animal value, or rehoming cost.
  const minimumChangeCandidateSpeciesIds = before.blockerCount > 0 && bestSingleSpeciesBlockerReduction > 0
    ? scenarios
      .filter(scenario => scenario.blockerReduction === bestSingleSpeciesBlockerReduction)
      .map(scenario => scenario.subjectSpeciesId)
      .sort()
    : [];

  return {
    baselineGraph,
    scenarios,
    minimumChangeCandidateSpeciesIds,
    summary: {
      hasBlockingConflict: before.blockerCount > 0,
      bestSingleSpeciesBlockerReduction,
      candidateCount: minimumChangeCandidateSpeciesIds.length,
    },
  };
};

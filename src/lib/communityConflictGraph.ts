import type { Fish } from '../types';
import { getReviewedCompatibilityProfile } from '../data/compatibilityEvidence';
import {
  evaluateTankCompatibility,
  type TankCompatibilityRule,
} from './tankCompatibilityEngine';

export type ConflictRelation =
  | 'predation'
  | 'aggression'
  | 'fin_nipping'
  | 'territorial'
  | 'water_type'
  | 'temperature'
  | 'water_parameters'
  | 'group_size'
  | 'behavior_evidence'
  | 'other';

export type ConflictDirection = 'one_way' | 'mutual';
export type ConflictFixability =
  | 'relocation'
  | 'environment_adjustment'
  | 'quantity_adjustment'
  | 'more_data'
  | 'monitor';
export type ConflictOutcome = 'blocker' | 'warning' | 'missing_evidence';

export type ConflictGraphNode = {
  speciesId: string;
  name: string;
  quantity: number;
};

export type ConflictEdge = {
  id: string;
  sourceSpeciesId: string;
  targetSpeciesId: string;
  affectedSpeciesIds: string[];
  relation: ConflictRelation;
  direction: ConflictDirection;
  outcome: ConflictOutcome;
  severity: TankCompatibilityRule['severity'];
  fixability: ConflictFixability;
  ruleCode: string;
  title: string;
  evidence: string;
  basis: TankCompatibilityRule['basis'];
  confidence: TankCompatibilityRule['confidence'];
  reviewStatus: TankCompatibilityRule['reviewStatus'];
  citations: TankCompatibilityRule['citations'];
};

export type CommunityConflictGraph = {
  status: 'blocker' | 'warning' | 'insufficient_data' | 'no_major_conflict_found';
  nodes: ConflictGraphNode[];
  edges: ConflictEdge[];
  evidenceGaps: ConflictEdge[];
  summary: {
    blockerCount: number;
    warningCount: number;
    evidenceGapCount: number;
    evaluatedPairCount: number;
  };
};

type BuildCommunityConflictGraphInput = Array<{
  species: Fish;
  quantity?: number;
}>;

const normalizeQuantity = (value?: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.max(1, Math.round(parsed)) : 1;
};

const getRelation = (rule: TankCompatibilityRule): ConflictRelation => {
  const code = rule.code.toLowerCase();
  if (code.includes('predation')) return 'predation';
  if (code.includes('fin_nipping') || code.includes('fin-nipping')) return 'fin_nipping';
  if (code.includes('territorial')) return 'territorial';
  if (code.includes('aggression') || code.includes('behavior_and_territory')) return 'aggression';
  if (code.includes('water_type')) return 'water_type';
  if (code.includes('temperature')) return 'temperature';
  if (code.includes('ph_') || code.includes('water_parameter')) return 'water_parameters';
  if (code.includes('group_size') || code.includes('school')) return 'group_size';
  if (code.includes('behavior_evidence')) return 'behavior_evidence';
  return 'other';
};

const getFixability = (relation: ConflictRelation, outcome: ConflictOutcome): ConflictFixability => {
  if (outcome === 'missing_evidence' || relation === 'behavior_evidence') return 'more_data';
  if (relation === 'water_parameters') return 'environment_adjustment';
  if (relation === 'group_size') return 'quantity_adjustment';
  if (
    relation === 'predation'
    || relation === 'aggression'
    || relation === 'fin_nipping'
    || relation === 'territorial'
    || relation === 'water_type'
    || relation === 'temperature'
  ) return 'relocation';
  return 'monitor';
};

const resolveDirection = (
  relation: ConflictRelation,
  left: Fish,
  right: Fish,
): { sourceSpeciesId: string; targetSpeciesId: string; direction: ConflictDirection } => {
  if (relation === 'predation') {
    const leftPredatory = getReviewedCompatibilityProfile(left.id)?.behaviorTraits.includes('predatory') || false;
    const rightPredatory = getReviewedCompatibilityProfile(right.id)?.behaviorTraits.includes('predatory') || false;
    if (leftPredatory !== rightPredatory) {
      return leftPredatory
        ? { sourceSpeciesId: left.id, targetSpeciesId: right.id, direction: 'one_way' }
        : { sourceSpeciesId: right.id, targetSpeciesId: left.id, direction: 'one_way' };
    }
  }
  return {
    sourceSpeciesId: left.id,
    targetSpeciesId: right.id,
    direction: 'mutual',
  };
};

const makeEdge = (
  left: Fish,
  right: Fish,
  rule: TankCompatibilityRule,
  outcome: ConflictOutcome,
): ConflictEdge => {
  const relation = getRelation(rule);
  const direction = resolveDirection(relation, left, right);
  const pairKey = [left.id, right.id].sort().join('__');
  return {
    id: `${pairKey}__${outcome}__${rule.code}`,
    ...direction,
    affectedSpeciesIds: Array.from(new Set(
      rule.affectedSpeciesIds.length > 0
        ? rule.affectedSpeciesIds
        : [left.id, right.id],
    )),
    relation,
    outcome,
    severity: rule.severity,
    fixability: getFixability(relation, outcome),
    ruleCode: rule.code,
    title: rule.title,
    evidence: rule.evidence,
    basis: rule.basis,
    confidence: rule.confidence,
    reviewStatus: rule.reviewStatus,
    citations: rule.citations,
  };
};

export const buildCommunityConflictGraph = (
  input: BuildCommunityConflictGraphInput,
): CommunityConflictGraph => {
  const byId = new Map<string, { species: Fish; quantity: number }>();
  input.forEach(item => {
    if (!item.species?.id) return;
    const quantity = normalizeQuantity(item.quantity);
    const existing = byId.get(item.species.id);
    byId.set(item.species.id, {
      species: item.species,
      quantity: (existing?.quantity || 0) + quantity,
    });
  });

  const entries = Array.from(byId.values()).sort((a, b) => a.species.id.localeCompare(b.species.id));
  const nodes: ConflictGraphNode[] = entries.map(item => ({
    speciesId: item.species.id,
    name: item.species.name,
    quantity: item.quantity,
  }));
  const edges: ConflictEdge[] = [];
  const evidenceGaps: ConflictEdge[] = [];
  let evaluatedPairCount = 0;

  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const left = entries[leftIndex];
      const right = entries[rightIndex];
      evaluatedPairCount += 1;
      const result = evaluateTankCompatibility({
        scope: 'species_only',
        existingSpecies: [{ species: left.species, record: { quantity: left.quantity } }],
        candidateSpecies: right.species,
        candidateQuantity: right.quantity,
      });

      result.blockingRules.forEach(rule => edges.push(makeEdge(left.species, right.species, rule, 'blocker')));
      result.warningRules.forEach(rule => edges.push(makeEdge(left.species, right.species, rule, 'warning')));
      result.missingData
        .filter(rule => rule.severity === 'medium' || rule.severity === 'high')
        .forEach(rule => evidenceGaps.push(makeEdge(left.species, right.species, rule, 'missing_evidence')));
    }
  }

  const dedupe = (items: ConflictEdge[]) => {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = `${item.id}::${item.evidence}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const finalEdges = dedupe(edges);
  const finalEvidenceGaps = dedupe(evidenceGaps);
  const blockerCount = finalEdges.filter(edge => edge.outcome === 'blocker').length;
  const warningCount = finalEdges.filter(edge => edge.outcome === 'warning').length;
  const evidenceGapCount = finalEvidenceGaps.length;
  const status: CommunityConflictGraph['status'] = blockerCount > 0
    ? 'blocker'
    : evidenceGapCount > 0
      ? 'insufficient_data'
      : warningCount > 0
        ? 'warning'
        : 'no_major_conflict_found';

  return {
    status,
    nodes,
    edges: finalEdges,
    evidenceGaps: finalEvidenceGaps,
    summary: {
      blockerCount,
      warningCount,
      evidenceGapCount,
      evaluatedPairCount,
    },
  };
};

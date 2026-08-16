import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium, Fish } from '../src/types';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { buildCommunityConflictGraph } from '../src/lib/communityConflictGraph';
import { buildTankDecisionSupport } from '../src/lib/tankDecisionSupportOrchestrator';
import { buildDiagnosisConflictEvidence } from '../src/lib/diagnosisConflictEvidence';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const makeTank = (id: string, livestock: Array<{ species: Fish; quantity: number }>): Aquarium => ({
  id,
  name: id,
  fishes: livestock.map((item, index) => ({
    id: `${id}-record-${index + 1}`,
    fishId: item.species.id,
    quantity: item.quantity,
    entryDate: '2026-08-16T00:00:00.000Z',
  })),
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

type ReviewedSevereCase = {
  id: string;
  left: Fish;
  leftQuantity: number;
  right: Fish;
  rightQuantity: number;
  expectedRelation: 'predation' | 'aggression';
  expectedDirection: 'one_way' | 'mutual';
  expectedSourceSpeciesId?: string;
  diagnosisIssue: 'aggression' | 'death';
};

const predator = byId('sp_0049');
const oscar = byId('sp_0451');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');
const territorialCichlid = byId('sp_0021');
const tigerBarb = byId('sp_0439');

const severeCases: ReviewedSevereCase[] = [
  {
    id: 'reviewed-predator-neon',
    left: predator,
    leftQuantity: 1,
    right: neon,
    rightQuantity: 5,
    expectedRelation: 'predation',
    expectedDirection: 'one_way',
    expectedSourceSpeciesId: predator.id,
    diagnosisIssue: 'aggression',
  },
  {
    id: 'reviewed-predator-cardinal',
    left: predator,
    leftQuantity: 1,
    right: cardinal,
    rightQuantity: 5,
    expectedRelation: 'predation',
    expectedDirection: 'one_way',
    expectedSourceSpeciesId: predator.id,
    diagnosisIssue: 'death',
  },
  {
    id: 'reviewed-oscar-neon-predation',
    left: oscar,
    leftQuantity: 1,
    right: neon,
    rightQuantity: 5,
    expectedRelation: 'predation',
    expectedDirection: 'one_way',
    expectedSourceSpeciesId: oscar.id,
    diagnosisIssue: 'death',
  },
  {
    id: 'reviewed-territory-behavior-conflict',
    left: territorialCichlid,
    leftQuantity: 1,
    right: tigerBarb,
    rightQuantity: 6,
    expectedRelation: 'aggression',
    expectedDirection: 'mutual',
    diagnosisIssue: 'aggression',
  },
];

const severeFailures: Array<{ caseId: string; layer: string; detail: string }> = [];

const requireLayer = (condition: boolean, caseId: string, layer: string, detail: string) => {
  if (!condition) severeFailures.push({ caseId, layer, detail });
};

for (const scenario of severeCases) {
  const pairCompatibility = evaluateTankCompatibility({
    existingSpecies: [{ species: scenario.left, record: { quantity: scenario.leftQuantity } }],
    candidateSpecies: scenario.right,
    candidateQuantity: scenario.rightQuantity,
    scope: 'species_only',
  });
  requireLayer(
    pairCompatibility.status === 'not_recommended',
    scenario.id,
    'pair_compatibility',
    `expected not_recommended, got ${pairCompatibility.status}`,
  );
  requireLayer(
    pairCompatibility.blockingRules.some(rule => rule.severity === 'high'),
    scenario.id,
    'pair_compatibility',
    'reviewed severe case lost its high-severity blocking rule',
  );

  const graph = buildCommunityConflictGraph([
    { species: scenario.left, quantity: scenario.leftQuantity },
    { species: scenario.right, quantity: scenario.rightQuantity },
  ]);
  const graphEdge = graph.edges.find(edge => edge.relation === scenario.expectedRelation && edge.outcome === 'blocker');
  requireLayer(Boolean(graphEdge), scenario.id, 'conflict_graph', `missing ${scenario.expectedRelation} blocker edge`);
  if (graphEdge) {
    requireLayer(graphEdge.severity === 'high', scenario.id, 'conflict_graph', `expected high severity, got ${graphEdge.severity}`);
    requireLayer(graphEdge.direction === scenario.expectedDirection, scenario.id, 'conflict_graph', `expected ${scenario.expectedDirection}, got ${graphEdge.direction}`);
    if (scenario.expectedSourceSpeciesId) {
      requireLayer(graphEdge.sourceSpeciesId === scenario.expectedSourceSpeciesId, scenario.id, 'conflict_graph', `expected source ${scenario.expectedSourceSpeciesId}, got ${graphEdge.sourceSpeciesId}`);
    }
    requireLayer(graphEdge.citations.length > 0, scenario.id, 'conflict_graph', 'reviewed severe blocker lost all citations');
  }

  const tank = makeTank(scenario.id, [
    { species: scenario.left, quantity: scenario.leftQuantity },
    { species: scenario.right, quantity: scenario.rightQuantity },
  ]);
  const decision = buildTankDecisionSupport({ aquarium: tank, catalog: fishData });
  requireLayer(decision.certainty === 'complete_known_community', scenario.id, 'decision_support', `unexpected certainty ${decision.certainty}`);
  requireLayer(decision.knownSubsetActionPlan.graph.summary.blockerCount > 0, scenario.id, 'decision_support', 'severe blocker disappeared from decision-support graph');
  requireLayer(decision.formalInterventionAllowed, scenario.id, 'decision_support', 'complete reviewed community unexpectedly blocked formal intervention');
  requireLayer(Boolean(decision.formalChoiceComparison), scenario.id, 'intervention', 'severe blocker did not produce a formal comparison model');
  requireLayer(
    decision.knownSubsetActionPlan.relocationOptions.some(option => option.blockerReduction > 0 && option.resolvesBlockerIds.length > 0),
    scenario.id,
    'intervention',
    'no counterfactually verified relocation option resolves the severe blocker',
  );

  const diagnosis = buildDiagnosisConflictEvidence({
    issueType: scenario.diagnosisIssue,
    decisionSupport: decision,
  });
  requireLayer(
    diagnosis.status === 'relevant_conflict_found',
    scenario.id,
    'diagnosis',
    `expected relevant_conflict_found, got ${diagnosis.status}`,
  );
  const diagnosisRelationship = diagnosis.relationships.find(item => item.relation === scenario.expectedRelation);
  requireLayer(Boolean(diagnosisRelationship), scenario.id, 'diagnosis', `diagnosis lost ${scenario.expectedRelation} source-target evidence`);
  if (diagnosisRelationship && scenario.expectedSourceSpeciesId) {
    requireLayer(
      diagnosisRelationship.sourceSpeciesId === scenario.expectedSourceSpeciesId,
      scenario.id,
      'diagnosis',
      `diagnosis changed source from ${scenario.expectedSourceSpeciesId} to ${diagnosisRelationship.sourceSpeciesId}`,
    );
  }
}

// Negative control 1: a reviewed caution relationship must not be promoted into a blocker/removal/aggression diagnosis.
const cautionPair = evaluateTankCompatibility({
  existingSpecies: [{ species: neon, record: { quantity: 5 } }],
  candidateSpecies: cardinal,
  candidateQuantity: 5,
  scope: 'species_only',
});
assert.notEqual(cautionPair.status, 'not_recommended', 'reviewed caution control must not become a severe blocker');
const cautionGraph = buildCommunityConflictGraph([
  { species: neon, quantity: 5 },
  { species: cardinal, quantity: 5 },
]);
assert.equal(cautionGraph.summary.blockerCount, 0, 'reviewed caution control must not become a graph blocker');
const cautionDecision = buildTankDecisionSupport({
  aquarium: makeTank('negative-control-caution', [
    { species: neon, quantity: 5 },
    { species: cardinal, quantity: 5 },
  ]),
  catalog: fishData,
});
assert.equal(cautionDecision.formalChoiceComparison?.options.length || 0, 0, 'warning-only control must not produce relocation comparison choices');
const cautionDiagnosis = buildDiagnosisConflictEvidence({ issueType: 'aggression', decisionSupport: cautionDecision });
assert.equal(cautionDiagnosis.status, 'no_relevant_conflict_found', 'group-size caution must not be rewritten as aggression diagnosis evidence');

// Negative control 2: missing reviewed behavior evidence must stay insufficient, never silently compatible.
const syntheticA: Fish = {
  ...neon,
  id: 'eval-synthetic-a',
  name: 'Eval Synthetic A',
  scientificName: 'Syntheticus evala',
};
const syntheticB: Fish = {
  ...cardinal,
  id: 'eval-synthetic-b',
  name: 'Eval Synthetic B',
  scientificName: 'Syntheticus evalb',
};
const unknownPair = evaluateTankCompatibility({
  existingSpecies: [{ species: syntheticA, record: { quantity: 3 } }],
  candidateSpecies: syntheticB,
  candidateQuantity: 3,
  scope: 'species_only',
});
assert.equal(unknownPair.status, 'insufficient_data', 'unreviewed behavior control must fail closed');
const unknownGraph = buildCommunityConflictGraph([
  { species: syntheticA, quantity: 3 },
  { species: syntheticB, quantity: 3 },
]);
assert.equal(unknownGraph.status, 'insufficient_data');
assert.ok(unknownGraph.evidenceGaps.some(edge => edge.relation === 'behavior_evidence'));

// Negative control 3: an unresolved source resident must not erase a known severe edge,
// but must prevent the known subset from being promoted into a complete intervention.
const partialTank = makeTank('negative-control-unresolved-source', [
  { species: predator, quantity: 1 },
  { species: neon, quantity: 5 },
]);
partialTank.fishes.push({
  id: 'unresolved-eval-record',
  fishId: 'unresolved:severe-risk-eval-resident',
  quantity: 1,
  entryDate: '2026-08-16T00:00:00.000Z',
});
const partialDecision = buildTankDecisionSupport({ aquarium: partialTank, catalog: fishData });
assert.equal(partialDecision.certainty, 'partial_known_community');
assert.ok(partialDecision.knownSubsetActionPlan.graph.edges.some(edge => edge.relation === 'predation' && edge.outcome === 'blocker'), 'known severe edge must remain visible in partial source community');
assert.equal(partialDecision.formalInterventionAllowed, false);
assert.equal(partialDecision.formalChoiceComparison, null);
const partialDiagnosis = buildDiagnosisConflictEvidence({ issueType: 'aggression', decisionSupport: partialDecision });
assert.equal(partialDiagnosis.status, 'relevant_conflict_found_partial');
assert.ok(partialDiagnosis.relationships.some(item => item.relation === 'predation'));
assert.ok(partialDiagnosis.resolutionSignals.every(signal => signal.mode === 'blocked_by_incomplete_identity'));

assert.deepEqual(
  severeFailures,
  [],
  `reviewed severe-risk regression detected false negatives:\n${severeFailures.map(item => `${item.caseId} / ${item.layer}: ${item.detail}`).join('\n')}`,
);

console.log(`reviewed severe-risk regression passed: ${severeCases.length} reviewed severe fixtures produced 0 cross-layer severe false negatives; caution, missing-evidence and unresolved-source controls also fail closed correctly`);

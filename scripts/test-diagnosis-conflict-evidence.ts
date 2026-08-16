import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import { buildTankDecisionSupport } from '../src/lib/tankDecisionSupportOrchestrator';
import { buildDiagnosisConflictEvidence } from '../src/lib/diagnosisConflictEvidence';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');

const makeTank = (id: string, fishes: Aquarium['fishes']): Aquarium => ({
  id,
  name: id,
  fishes,
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const completeSupport = buildTankDecisionSupport({
  aquarium: makeTank('diagnosis-complete', [
    { id: 'predator', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'neon', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'cardinal', fishId: cardinal.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});

const aggression = buildDiagnosisConflictEvidence({ issueType: 'aggression', decisionSupport: completeSupport });
assert.equal(aggression.status, 'relevant_conflict_found');
assert.equal(aggression.formalInterventionAllowed, true);
assert.equal(aggression.relationships.filter(item => item.relation === 'predation').length, 2);
assert.ok(aggression.relationships.every(item => item.sourceSpeciesId === predator.id));
assert.ok(aggression.relationships.every(item => item.direction === 'one_way'));
assert.ok(aggression.evidenceStatements.some(item => item.includes(`${predator.name} → ${neon.name}`)));
const neonConflict = aggression.relationships.find(item => item.targetSpeciesId === neon.id);
assert.ok(neonConflict);
const neonResolution = aggression.resolutionSignals.find(item => item.conflictId === neonConflict.conflictId);
assert.ok(neonResolution);
assert.equal(neonResolution.mode, 'compare_relocation_options');
assert.equal(neonResolution.evidenceMode, 'counterfactual_recomputed');
assert.deepEqual(neonResolution.candidateSubjectSpeciesIds, [predator.id, neon.id].sort());

const targeted = buildDiagnosisConflictEvidence({
  issueType: 'aggression',
  decisionSupport: completeSupport,
  targetSpeciesIds: [cardinal.id],
});
assert.equal(targeted.relationships.length, 1);
assert.equal(targeted.relationships[0].targetSpeciesId, cardinal.id);

const partialSupport = buildTankDecisionSupport({
  aquarium: makeTank('diagnosis-partial', [
    { id: 'predator-partial', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'neon-partial', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'unknown-partial', fishId: 'unresolved:diagnosis-resident', quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const partialAggression = buildDiagnosisConflictEvidence({ issueType: 'aggression', decisionSupport: partialSupport });
assert.equal(partialAggression.status, 'relevant_conflict_found_partial');
assert.equal(partialAggression.formalInterventionAllowed, false);
assert.ok(partialAggression.relationships.some(item => item.relation === 'predation'));
assert.ok(partialAggression.resolutionSignals.every(item => item.mode === 'blocked_by_incomplete_identity'));
assert.ok(partialAggression.limitations.some(item => item.includes('不能视为完整全缸结论')));

const warningOnlySupport = buildTankDecisionSupport({
  aquarium: makeTank('diagnosis-warning-only', [
    { id: 'neon-warning', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'cardinal-warning', fishId: cardinal.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const noAggressionEvidence = buildDiagnosisConflictEvidence({ issueType: 'aggression', decisionSupport: warningOnlySupport });
assert.equal(noAggressionEvidence.status, 'no_relevant_conflict_found');
assert.equal(noAggressionEvidence.relationships.length, 0, 'group-size caution must not be repackaged as aggression evidence');

const gasping = buildDiagnosisConflictEvidence({ issueType: 'gasping', decisionSupport: completeSupport });
assert.equal(gasping.status, 'not_applicable');
assert.equal(gasping.relationships.length, 0, 'behavior conflict adapter must not hijack unrelated water/oxygen diagnosis');

console.log('diagnosis conflict evidence passed: aggression/hiding/death can consume specific source-target behavior evidence, partial communities stay partial, target scope filters relationships, and unrelated diagnosis paths remain untouched');

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import { buildTankDecisionSupport } from '../src/lib/tankDecisionSupportOrchestrator';
import { buildQuickDiagnosisConflictAugmentation } from '../src/lib/quickDiagnosisConflictAugmentation';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing required catalog fixture ${id}`);
  return species;
};

const predator = byId('sp_0049');
const neon = byId('sp_0431');
const cardinal = byId('sp_0432');
const territorialCichlid = byId('sp_0021');
const tigerBarb = byId('sp_0439');

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

const predatorSupport = buildTankDecisionSupport({
  aquarium: makeTank('augmentation-predator', [
    { id: 'predator', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'neon', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const predatorAugmentation = buildQuickDiagnosisConflictAugmentation({
  issueType: 'aggression',
  decisionSupport: predatorSupport,
});
assert.equal(predatorAugmentation.status, 'specific_conflict_evidence');
assert.equal(predatorAugmentation.priority, 'high');
assert.ok(predatorAugmentation.headline?.includes(`${predator.name} → ${neon.name}`));
assert.ok(predatorAugmentation.causeAdditions.some(item => item.includes(`${predator.name} → ${neon.name}`)));
assert.ok(predatorAugmentation.todayActionAdditions.some(item => item.includes('保留 / 移出方案比较')));
assert.ok(predatorAugmentation.avoidActionAdditions.some(item => item.includes('躲避物') && item.includes('捕食')));
assert.ok(predatorAugmentation.avoidActionAdditions.some(item => item.includes('不要在比较各方案')));
assert.equal(predatorAugmentation.showInterventionComparison, true);
assert.equal(predatorAugmentation.interventionComparisonMode, 'available');

const partialSupport = buildTankDecisionSupport({
  aquarium: makeTank('augmentation-partial', [
    { id: 'predator-partial', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'neon-partial', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'unresolved-partial', fishId: 'unresolved:augmentation-resident', quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const partialAugmentation = buildQuickDiagnosisConflictAugmentation({
  issueType: 'aggression',
  decisionSupport: partialSupport,
});
assert.equal(partialAugmentation.status, 'partial_specific_conflict_evidence');
assert.equal(partialAugmentation.priority, 'high');
assert.equal(partialAugmentation.showInterventionComparison, false);
assert.equal(partialAugmentation.interventionComparisonMode, 'blocked_by_incomplete_identity');
assert.ok(partialAugmentation.todayActionAdditions.some(item => item.includes('身份未明')));
assert.ok(partialAugmentation.avoidActionAdditions.some(item => item.includes('完整全缸结论')));

const warningSupport = buildTankDecisionSupport({
  aquarium: makeTank('augmentation-warning', [
    { id: 'neon-warning', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'cardinal-warning', fishId: cardinal.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const warningAggression = buildQuickDiagnosisConflictAugmentation({ issueType: 'aggression', decisionSupport: warningSupport });
assert.equal(warningAggression.status, 'no_specific_conflict_evidence');
assert.equal(warningAggression.priority, 'none');
assert.equal(warningAggression.showInterventionComparison, false);
assert.deepEqual(warningAggression.causeAdditions, []);

const unrelatedIssue = buildQuickDiagnosisConflictAugmentation({ issueType: 'gasping', decisionSupport: predatorSupport });
assert.equal(unrelatedIssue.status, 'not_applicable');
assert.equal(unrelatedIssue.headline, null);
assert.deepEqual(unrelatedIssue.todayActionAdditions, []);
assert.deepEqual(unrelatedIssue.avoidActionAdditions, []);

const mutualSupport = buildTankDecisionSupport({
  aquarium: makeTank('augmentation-mutual', [
    { id: 'cichlid', fishId: territorialCichlid.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'barb', fishId: tigerBarb.id, quantity: 6, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const mutualAugmentation = buildQuickDiagnosisConflictAugmentation({ issueType: 'aggression', decisionSupport: mutualSupport });
assert.equal(mutualAugmentation.status, 'specific_conflict_evidence');
assert.ok(mutualAugmentation.headline?.includes('↔'));
assert.equal(mutualAugmentation.showInterventionComparison, true);

const targetFiltered = buildQuickDiagnosisConflictAugmentation({
  issueType: 'aggression',
  decisionSupport: buildTankDecisionSupport({
    aquarium: makeTank('augmentation-target', [
      { id: 'predator-target', fishId: predator.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
      { id: 'neon-target', fishId: neon.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
      { id: 'cardinal-target', fishId: cardinal.id, quantity: 5, entryDate: '2026-08-16T00:00:00.000Z' },
    ]),
    catalog: fishData,
  }),
  targetSpeciesIds: [cardinal.id],
});
assert.equal(targetFiltered.conflictEvidence.relationships.length, 1);
assert.equal(targetFiltered.conflictEvidence.relationships[0].targetSpeciesId, cardinal.id);
assert.ok(targetFiltered.headline?.includes(cardinal.name));

const unresolvedOnlySupport = buildTankDecisionSupport({
  aquarium: makeTank('augmentation-unknown-only', [
    { id: 'unknown', fishId: 'unresolved:only-augmentation-resident', quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
  ]),
  catalog: fishData,
});
const unresolvedOnly = buildQuickDiagnosisConflictAugmentation({ issueType: 'aggression', decisionSupport: unresolvedOnlySupport });
assert.equal(unresolvedOnly.status, 'community_identity_incomplete');
assert.equal(unresolvedOnly.priority, 'none');
assert.ok(unresolvedOnly.todayActionAdditions.some(item => item.includes('身份未明')));
assert.ok(unresolvedOnly.avoidActionAdditions.some(item => item.includes('全缸不存在冲突')));

console.log('Quick Diagnosis conflict augmentation passed: specific reviewed conflicts add exact evidence and truthful actions, partial communities block formal comparison, unrelated symptoms stay untouched, and no-conflict/unknown states are not overstated');

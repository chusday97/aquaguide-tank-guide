import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';

const base = {
  id: 'a',
  waterType: 'freshwater' as const,
  temperatureMinC: 22,
  temperatureMaxC: 26,
  phMin: 6,
  phMax: 8,
  minTankLiters: 30,
  reviewed: true,
};

const emptyPlan = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24 },
  existingSpecies: [],
  candidateSpecies: base,
});
assert.equal(emptyPlan.status, 'compatible');
assert.equal(emptyPlan.addPolicy, 'allow');
assert.equal(emptyPlan.decisionReadiness, 'reviewed');
assert.equal(emptyPlan.stockingGuidance.kind, 'screening_only');

const emptyFact = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [], candidateSpecies: base });
assert.equal(emptyFact.status, 'compatible');
assert.equal(emptyFact.addPolicy, 'allow');

const noTankPlan = evaluateCompatibility({
  intent: 'planned_addition',
  existingSpecies: [{ ...base, id: 'b' }],
  candidateSpecies: base,
});
assert.equal(noTankPlan.status, 'insufficient_data');
assert.equal(noTankPlan.addPolicy, 'complete_information');
assert.equal(noTankPlan.decisionReadiness, 'partial');
assert.ok(noTankPlan.ruleCodes.includes('tank_missing'));

const blocked = evaluateCompatibility({
  intent: 'planned_addition',
  existingSpecies: [{ ...base, id: 'b', waterType: 'saltwater' }],
  candidateSpecies: base,
});
assert.equal(blocked.status, 'not_recommended');
assert.equal(blocked.addPolicy, 'block');

const candidateWaterConflict = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'b' }],
  candidateSpecies: { ...base, waterType: 'saltwater' },
});
assert.equal(candidateWaterConflict.status, 'not_recommended');
assert.ok(candidateWaterConflict.ruleCodes.includes('candidate_tank_water_type_conflict'));

const temperatureConflict = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'cold-water', temperatureMinC: 14, temperatureMaxC: 18 }],
  candidateSpecies: { ...base, temperatureMinC: 25, temperatureMaxC: 29 },
});
assert.equal(temperatureConflict.status, 'not_recommended');
assert.equal(temperatureConflict.addPolicy, 'block');
assert.ok(temperatureConflict.ruleCodes.includes('temperature_range_conflict'));

const tankTemperatureConflict = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 18 },
  existingSpecies: [{ ...base, id: 'existing-reviewed' }],
  candidateSpecies: { ...base, temperatureMinC: 24, temperatureMaxC: 28 },
});
assert.equal(tankTemperatureConflict.status, 'not_recommended');
assert.ok(tankTemperatureConflict.ruleCodes.includes('tank_temperature_conflict'));

const phConflict = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'alkaline', phMin: 8.2, phMax: 9 }],
  candidateSpecies: { ...base, phMin: 6, phMax: 6.8 },
});
assert.equal(phConflict.status, 'caution');
assert.equal(phConflict.addPolicy, 'confirm');
assert.ok(phConflict.ruleCodes.includes('ph_range_conflict'));

const unknownCandidateWater = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'b' }],
  candidateSpecies: { ...base, waterType: 'unknown' },
});
assert.equal(unknownCandidateWater.status, 'insufficient_data');
assert.ok(unknownCandidateWater.ruleCodes.includes('candidate_water_type_missing'));

const missing = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'unknown' },
  existingSpecies: [{ ...base, id: 'b', reviewed: false }],
  candidateSpecies: base,
  explicitPairStatus: 'caution',
});
assert.equal(missing.status, 'insufficient_data');
assert.equal(missing.addPolicy, 'complete_information');
assert.equal(missing.decisionReadiness, 'unknown');
assert.deepEqual(missing.ruleCodes.slice(-1), ['reviewed_pair_rule']);

const territorialCaution = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'territorial-a', behaviorTraits: ['territorial'] }],
  candidateSpecies: { ...base, id: 'territorial-b', behaviorTraits: ['territorial'] },
});
assert.equal(territorialCaution.status, 'caution');
assert.equal(territorialCaution.addPolicy, 'confirm');
assert.ok(territorialCaution.ruleCodes.includes('territorial_conflict'));

const optionalPhMissing = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'ph-unknown', phMin: null, phMax: null }],
  candidateSpecies: { ...base, id: 'ph-optional', phMin: null, phMax: null },
});
assert.equal(optionalPhMissing.status, 'compatible');
assert.ok(!optionalPhMissing.ruleCodes.includes('ph_range_missing'));

const emergencyObservation = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24, observedSignals: { injuries: true } },
  existingSpecies: [{ ...base, id: 'observed-existing' }],
  candidateSpecies: base,
});
assert.equal(emergencyObservation.status, 'not_recommended');
assert.equal(emergencyObservation.observedStatus, 'emergency');

const miniParrot = {
  ...base,
  id: 'sp_0021',
  size: 'Medium',
  minTankLiters: 64,
  behaviorTraits: ['territorial', 'breeding_defense'],
  stockingGuidance: {
    kind: 'screening_only' as const,
    recommendedMin: null,
    recommendedMax: null,
    constraints: ['幼鱼阶段不代表成体长期安全上限'],
    confidence: 'medium' as const,
    evidenceIds: ['convict-cichlid-territory-study'],
  },
};
const miniParrotRecorded = evaluateCompatibility({
  intent: 'record_existing',
  tank: { waterType: 'freshwater', volumeLiters: 64, targetTemperatureC: 25 },
  existingSpecies: [],
  candidateSpecies: miniParrot,
  candidateQuantity: 4,
  candidateContext: { lifeStage: 'juvenile', reproductiveState: 'normal', averageLengthCm: 2.5 },
});
assert.equal(miniParrotRecorded.status, 'compatible');
assert.equal(miniParrotRecorded.addPolicy, 'allow');
assert.equal(miniParrotRecorded.stockingGuidance.kind, 'screening_only');

const miniParrotBreeding = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, targetTemperatureC: 25, observedSignals: { repeatedChasing: true } },
  existingSpecies: [miniParrot],
  candidateSpecies: miniParrot,
  candidateQuantity: 1,
  individualContexts: {
    [miniParrot.id]: { lifeStage: 'adult', reproductiveState: 'in_labor_or_spawning', guardingEggsOrFry: true },
  },
});
assert.equal(miniParrotBreeding.status, 'caution');
assert.equal(miniParrotBreeding.observedStatus, 'intervene');
assert.ok(miniParrotBreeding.ruleCodes.includes('breeding_territory_active'));

const miniParrotEmergency = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, targetTemperatureC: 25, observedSignals: { injuries: true } },
  existingSpecies: [miniParrot],
  candidateSpecies: miniParrot,
  individualContexts: {
    [miniParrot.id]: { lifeStage: 'adult', reproductiveState: 'normal' },
  },
});
assert.equal(miniParrotEmergency.status, 'not_recommended');
assert.equal(miniParrotEmergency.observedStatus, 'emergency');

console.log('domain compatibility policy verified: fail-closed precedence and record-existing allowance');

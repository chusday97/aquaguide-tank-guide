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

const oneSidedTerritorialPressure = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, targetTemperatureC: 25 },
  existingSpecies: [{ ...base, id: 'territorial-source', behaviorTraits: ['territorial'], territoriality: 'high' }],
  candidateSpecies: { ...base, id: 'peaceful-target', reviewed: true, territoriality: 'none' },
});
assert.equal(oneSidedTerritorialPressure.status, 'caution');
assert.ok(oneSidedTerritorialPressure.ruleCodes.includes('territorial_pressure_context'));
assert.ok(!oneSidedTerritorialPressure.ruleCodes.includes('territorial_conflict'));

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

// Recovery invariant: coarse size/volume screening is advisory only. A high
// screening ratio may require confirmation, but it must never be the sole
// reason to block a stocking plan because filtration, mature biomass, oxygen
// and maintenance stability are not represented by this coarse heuristic.
const highBioloadScreening = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 30, targetTemperatureC: 24 },
  existingSpecies: Array.from({ length: 4 }, (_, index) => ({ ...base, id: `load-${index}`, size: 'Large' })),
  existingQuantities: Object.fromEntries(Array.from({ length: 4 }, (_, index) => [`load-${index}`, 1])),
  candidateSpecies: { ...base, id: 'load-candidate', size: 'Large' },
  candidateQuantity: 1,
});
assert.equal(highBioloadScreening.status, 'caution');
assert.equal(highBioloadScreening.addPolicy, 'confirm');
assert.ok(highBioloadScreening.ruleCodes.includes('bioload_screening_high'));

// Aggression/territoriality is a behavior risk, not a waste-production
// multiplier. Behavior can still raise its own caution but cannot inflate the
// coarse bioload screening by itself.
const aggressionIsNotBioload = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'calm', size: 'Medium' }],
  candidateSpecies: { ...base, id: 'candidate', size: 'Medium' },
});
assert.equal(aggressionIsNotBioload.status, 'compatible');

assert.ok(!aggressionIsNotBioload.ruleCodes.some(code => code.startsWith('bioload_screening_')));

const stableContext = {
  establishedDays: 180,
  stableCoexistenceDays: 120,
  maintenanceConsistent: true,
  recentWaterQualityIncident: false,
};
const stableElevatedScreening = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 10, targetTemperatureC: 24, stabilityContext: stableContext },
  existingSpecies: [{ ...base, id: 'stable-a', size: 'Small', minTankLiters: 5 }],
  existingQuantities: { 'stable-a': 4 },
  candidateSpecies: { ...base, id: 'stable-b', size: 'Small', minTankLiters: 5 },
  candidateQuantity: 1,
});
assert.equal(stableElevatedScreening.status, 'compatible');
assert.ok(stableElevatedScreening.ruleCodes.includes('bioload_screening_elevated_stable_context'));

const stableHighScreening = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 10, targetTemperatureC: 24, stabilityContext: stableContext },
  existingSpecies: [{ ...base, id: 'stable-high-a', size: 'Small', minTankLiters: 5 }],
  existingQuantities: { 'stable-high-a': 5 },
  candidateSpecies: { ...base, id: 'stable-high-b', size: 'Small', minTankLiters: 5 },
  candidateQuantity: 1,
});
assert.equal(stableHighScreening.status, 'caution');
assert.ok(stableHighScreening.ruleCodes.includes('bioload_screening_high_stable_context'));

const stabilityCannotOverrideHardBlock = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24, stabilityContext: stableContext },
  existingSpecies: [{ ...base, id: 'stable-freshwater' }],
  candidateSpecies: { ...base, id: 'stable-saltwater', waterType: 'saltwater' },
});
assert.equal(stabilityCannotOverrideHardBlock.status, 'not_recommended');
assert.ok(stabilityCannotOverrideHardBlock.ruleCodes.includes('candidate_tank_water_type_conflict'));

const groupMinimum = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24 },
  existingSpecies: [],
  candidateSpecies: { ...base, id: 'shoaling-reviewed', minimumGroupSize: 8, socialMode: 'shoal' },
  candidateQuantity: 5,
});
assert.equal(groupMinimum.status, 'caution');
assert.equal(groupMinimum.addPolicy, 'confirm');
assert.equal(groupMinimum.stockingGuidance.recommendedMin, 8);
assert.ok(groupMinimum.ruleCodes.includes('minimum_group_not_met'));

const groupMinimumMet = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 60, targetTemperatureC: 24 },
  existingSpecies: [],
  candidateSpecies: { ...base, id: 'shoaling-reviewed-ok', minimumGroupSize: 8, socialMode: 'shoal' },
  candidateQuantity: 8,
});
assert.equal(groupMinimumMet.status, 'compatible');
assert.ok(!groupMinimumMet.ruleCodes.includes('minimum_group_not_met'));

const finNippingGroupPressure = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [],
  candidateSpecies: { ...base, id: 'reviewed-fin-nipper', minimumGroupSize: 8, socialMode: 'group', finNippingRisk: 'medium' },
  candidateQuantity: 4,
});
assert.equal(finNippingGroupPressure.status, 'caution');
assert.ok(finNippingGroupPressure.ruleCodes.includes('minimum_group_not_met'));
assert.ok(finNippingGroupPressure.ruleCodes.includes('fin_nipping_group_pressure'));

const finNippingGroupManaged = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [],
  candidateSpecies: { ...base, id: 'reviewed-fin-nipper-managed', minimumGroupSize: 8, socialMode: 'group', finNippingRisk: 'medium' },
  candidateQuantity: 8,
});
assert.equal(finNippingGroupManaged.status, 'compatible');
assert.ok(!finNippingGroupManaged.ruleCodes.includes('fin_nipping_group_pressure'));

const existingFinNippingGroupPressure = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'existing-fin-nipper', minimumGroupSize: 8, socialMode: 'group', finNippingRisk: 'high' }],
  existingQuantities: { 'existing-fin-nipper': 4 },
  candidateSpecies: { ...base, id: 'calm-candidate' },
  candidateQuantity: 1,
});
assert.equal(existingFinNippingGroupPressure.status, 'caution');
assert.ok(existingFinNippingGroupPressure.ruleCodes.includes('fin_nipping_group_pressure'));

const unknownExistingFinNippingQuantityDoesNotInventOne = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'existing-fin-nipper-unknown', minimumGroupSize: 8, socialMode: 'group', finNippingRisk: 'high' }],
  candidateSpecies: { ...base, id: 'calm-candidate-2' },
  candidateQuantity: 1,
});
assert.ok(!unknownExistingFinNippingQuantityDoesNotInventOne.ruleCodes.includes('fin_nipping_group_pressure'));

const finNippingTargetVulnerability = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'structured-fin-nipper', finNippingRisk: 'high' }],
  existingQuantities: { 'structured-fin-nipper': 8 },
  candidateSpecies: { ...base, id: 'structured-fin-vulnerable', finNipVulnerability: 'high' },
  candidateQuantity: 5,
});
assert.equal(finNippingTargetVulnerability.status, 'caution');
assert.equal(finNippingTargetVulnerability.addPolicy, 'confirm');
assert.ok(finNippingTargetVulnerability.ruleCodes.includes('fin_nipping_target_vulnerability'));

const sharedBottomZoneContext = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 100, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'bottom-a', swimmingZone: 'bottom' }],
  candidateSpecies: { ...base, id: 'bottom-b', swimmingZone: 'bottom' },
});
assert.equal(sharedBottomZoneContext.status, 'compatible');
assert.ok(sharedBottomZoneContext.ruleCodes.includes('shared_bottom_zone_context'));

const structuredTerritoriality = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'territorial-structured-a', territoriality: 'medium' }],
  candidateSpecies: { ...base, id: 'territorial-structured-b', territoriality: 'high' },
});
assert.equal(structuredTerritoriality.status, 'caution');
assert.ok(structuredTerritoriality.ruleCodes.includes('territorial_conflict'));

const structuredPredation = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'structured-predator', size: 'Large', predationRisk: 'high' }],
  candidateSpecies: { ...base, id: 'structured-prey', size: 'Small' },
});
assert.equal(structuredPredation.status, 'not_recommended');
assert.ok(structuredPredation.ruleCodes.includes('predation_risk'));

const ordinaryFishWithVulnerableShrimp = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'ordinary-fish', lifeType: 'fish', predationRisk: 'low' }],
  candidateSpecies: { ...base, id: 'vulnerable-shrimp', lifeType: 'invertebrate', predationVulnerability: 'high' },
});
assert.equal(ordinaryFishWithVulnerableShrimp.status, 'caution');
assert.ok(ordinaryFishWithVulnerableShrimp.ruleCodes.includes('predation_vulnerability_context'));
assert.ok(!ordinaryFishWithVulnerableShrimp.ruleCodes.includes('predation_risk'));

const predatorFishWithVulnerableShrimp = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'predator-fish', lifeType: 'fish', size: 'Large', predationRisk: 'high' }],
  candidateSpecies: { ...base, id: 'vulnerable-small-shrimp', lifeType: 'invertebrate', size: 'Small', predationVulnerability: 'high' },
});
assert.equal(predatorFishWithVulnerableShrimp.status, 'not_recommended');
assert.ok(predatorFishWithVulnerableShrimp.ruleCodes.includes('predation_risk'));

const vulnerableShrimpPair = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 120, lengthCm: 90, targetTemperatureC: 24 },
  existingSpecies: [{ ...base, id: 'shrimp-a', lifeType: 'invertebrate', predationVulnerability: 'high' }],
  candidateSpecies: { ...base, id: 'shrimp-b', lifeType: 'invertebrate', predationVulnerability: 'high' },
});
assert.equal(vulnerableShrimpPair.status, 'compatible');
assert.ok(!vulnerableShrimpPair.ruleCodes.includes('predation_vulnerability_context'));

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

console.log('domain compatibility policy verified: hard biological blocks + soft capacity screening + record-existing allowance');

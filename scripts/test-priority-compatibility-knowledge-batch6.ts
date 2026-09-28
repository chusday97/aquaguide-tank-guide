import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing ${id}`);
  return fish;
};
const tank = (length: number, width: number, height: number, temp: number): Aquarium => ({
  id: 'batch6', name: 'batch6', fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater', targetTemperature: String(temp),
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

for (const id of ['sp_0128', 'sp_0134', 'sp_0135', 'sp_0136']) {
  assert.ok(getReviewedSpeciesKnowledgeForFish(byId(id)), `${id} reviewed knowledge missing`);
  assert.ok(getReviewedCompatibilityProfileForFish(byId(id)), `${id} reviewed compatibility profile missing`);
}

const beaufortia = getReviewedSpeciesKnowledgeForFish(byId('sp_0128'))!;
const beaufortiaProfile = getReviewedCompatibilityProfileForFish(byId('sp_0128'))!;
assert.deepEqual(beaufortia.environment?.temperatureRangeC, { min: 16, max: 24 });
assert.deepEqual(beaufortia.environment?.phRange, { min: 6.5, max: 8 });
assert.deepEqual(beaufortia.environment?.hardnessDgh, { min: 2, max: 15 });
assert.equal(beaufortia.socialBehavior?.minimumGroupSize, 6);
assert.equal(beaufortia.socialBehavior?.territoriality, 'low');
assert.equal(beaufortia.spaceAndGrowth?.minVolumeLiters, 54);
assert.equal(beaufortia.spaceAndGrowth?.minTankLengthCm, 60);
assert.equal(beaufortiaProfile.minimumGroupSize, 6);
const beaufortiaSingle = evaluateTankCompatibility({ tank: tank(90, 40, 40, 20), candidateSpecies: byId('sp_0128'), candidateQuantity: 1 });
assert.equal(beaufortiaSingle.status, 'caution');
assert.ok(beaufortiaSingle.warningRules.some(rule => rule.code === 'minimum_group_not_met'));
const beaufortiaWarm = evaluateTankCompatibility({ tank: tank(90, 40, 40, 27), candidateSpecies: byId('sp_0128'), candidateQuantity: 6 });
assert.equal(beaufortiaWarm.status, 'not_recommended');
assert.ok(beaufortiaWarm.blockingRules.some(rule => rule.code === 'tank_temperature_conflict' || rule.code === 'temperature_mismatch'));

const threadfin = getReviewedSpeciesKnowledgeForFish(byId('sp_0134'))!;
const threadfinProfile = getReviewedCompatibilityProfileForFish(byId('sp_0134'))!;
assert.deepEqual(threadfin.environment?.temperatureRangeC, { min: 22, max: 30 });
assert.deepEqual(threadfin.environment?.phRange, { min: 5, max: 8 });
assert.equal(threadfin.socialBehavior?.minimumGroupSize, 6);
assert.equal(threadfin.socialBehavior?.recommendedGroupSize?.min, 10);
assert.equal(threadfin.socialBehavior?.finNipVulnerability, 'high');
assert.equal(threadfin.socialBehavior?.swimmingPace, 'slow');
assert.equal(threadfinProfile.minimumGroupSize, 6);
const threadfinWithTiger = evaluateTankCompatibility({
  tank: tank(90, 40, 40, 26),
  existingSpecies: [{ species: byId('sp_0439'), record: { quantity: 6 } }],
  candidateSpecies: byId('sp_0134'), candidateQuantity: 6,
});
assert.equal(threadfinWithTiger.status, 'caution');
assert.ok(threadfinWithTiger.warningRules.some(rule => rule.code === 'fin_nipping_target_vulnerability'));
assert.ok(!threadfinWithTiger.blockingRules.some(rule => rule.code.includes('predation')));

const forktail = getReviewedSpeciesKnowledgeForFish(byId('sp_0135'))!;
const forktailProfile = getReviewedCompatibilityProfileForFish(byId('sp_0135'))!;
assert.deepEqual(forktail.environment?.temperatureRangeC, { min: 24, max: 28 });
assert.deepEqual(forktail.environment?.phRange, { min: 7, max: 8 });
assert.deepEqual(forktail.environment?.hardnessDgh, { min: 15, max: 30 });
assert.equal(forktail.socialBehavior?.minimumGroupSize, 8);
assert.equal(forktail.socialBehavior?.recommendedGroupSize?.min, 10);
assert.equal(forktailProfile.minimumGroupSize, 8);
const forktailSeven = evaluateTankCompatibility({ tank: tank(90, 40, 40, 26), candidateSpecies: byId('sp_0135'), candidateQuantity: 7 });
assert.equal(forktailSeven.status, 'caution');
assert.ok(forktailSeven.warningRules.some(rule => rule.code === 'minimum_group_not_met'));
const forktailEight = evaluateTankCompatibility({ tank: tank(90, 40, 40, 26), candidateSpecies: byId('sp_0135'), candidateQuantity: 8 });
assert.equal(forktailEight.status, 'compatible');

const chocolate = getReviewedSpeciesKnowledgeForFish(byId('sp_0136'))!;
const chocolateProfile = getReviewedCompatibilityProfileForFish(byId('sp_0136'))!;
assert.deepEqual(chocolate.environment?.temperatureRangeC, { min: 26, max: 31 });
assert.deepEqual(chocolate.environment?.phRange, { min: 4, max: 6.5 });
assert.deepEqual(chocolate.environment?.hardnessDgh, { min: 0, max: 3 });
assert.equal(chocolate.socialBehavior?.minimumGroupSize, 6);
assert.equal(chocolate.socialBehavior?.swimmingPace, 'slow');
assert.equal(chocolateProfile.minimumGroupSize, 6);
const chocolateFive = evaluateTankCompatibility({ tank: tank(90, 40, 40, 28), candidateSpecies: byId('sp_0136'), candidateQuantity: 5 });
assert.equal(chocolateFive.status, 'caution');
assert.ok(chocolateFive.warningRules.some(rule => rule.code === 'minimum_group_not_met'));
const chocolateWithForktail = evaluateTankCompatibility({
  tank: tank(120, 45, 45, 27),
  existingSpecies: [{ species: byId('sp_0135'), record: { quantity: 8 } }],
  candidateSpecies: byId('sp_0136'), candidateQuantity: 6,
});
assert.equal(chocolateWithForktail.status, 'caution');
assert.ok(chocolateWithForktail.warningRules.some(rule => rule.code === 'ph_range_conflict' || rule.code === 'ph_range_gap'));

// Identity-sensitive trade material stays fail-closed rather than inheriting an exact-species care profile.
assert.equal(getReviewedSpeciesKnowledgeForFish(byId('sp_0127')), undefined, 'Botia almorhae trade identity is ambiguous and must stay fail-closed');
assert.equal(getReviewedCompatibilityProfileForFish(byId('sp_0127')), undefined, 'Botia almorhae must not receive reviewed runtime authority from ambiguous hobby material');

console.log('priority compatibility knowledge batch6 passed: hillstream temperature/group boundary + threadfin fin-nip vulnerability + forktail hard-water group + chocolate-gourami soft-water group; Botia almorhae remains fail-closed');

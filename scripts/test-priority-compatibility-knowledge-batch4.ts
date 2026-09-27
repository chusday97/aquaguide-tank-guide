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

const tank = (temperature: number, length = 220, width = 70, height = 60): Aquarium => ({
  id: 'batch4',
  name: 'batch4',
  fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater',
  targetTemperature: String(temperature),
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

for (const id of ['sp_0105', 'sp_0117', 'sp_0018']) {
  assert.ok(getReviewedSpeciesKnowledgeForFish(byId(id)), `${id} knowledge missing`);
  assert.ok(getReviewedCompatibilityProfileForFish(byId(id)), `${id} profile missing`);
}

const bichir = getReviewedSpeciesKnowledgeForFish(byId('sp_0105'))!;
const bichirProfile = getReviewedCompatibilityProfileForFish(byId('sp_0105'))!;
assert.equal(bichir.spaceAndGrowth?.adultLengthCm?.max, 60);
assert.equal(bichir.spaceAndGrowth?.adultLengthCm?.measurement, 'TL');
assert.equal(bichir.spaceAndGrowth?.minVolumeLiters, 648);
assert.equal(bichir.spaceAndGrowth?.minTankLengthCm, 180);
assert.ok(bichirProfile.behaviorTraits.includes('predatory'));
assert.ok(bichirProfile.predationTargets.includes('small_fish'));
assert.ok(!bichirProfile.behaviorTraits.includes('solitary_required'), 'ornate bichir must not be generalized into absolute solitary-only housing');
const bichirWithNeon = evaluateTankCompatibility({
  tank: tank(26, 200, 70, 60),
  existingSpecies: [{ species: byId('sp_0431'), record: { quantity: 10 } }],
  candidateSpecies: byId('sp_0105'),
  candidateQuantity: 1,
});
assert.equal(bichirWithNeon.status, 'not_recommended');
assert.ok(bichirWithNeon.blockingRules.some(rule => rule.code === 'predation_risk'));

const arowana = getReviewedSpeciesKnowledgeForFish(byId('sp_0117'))!;
const arowanaProfile = getReviewedCompatibilityProfileForFish(byId('sp_0117'))!;
assert.equal(arowana.spaceAndGrowth?.adultLengthCm?.max, 90);
assert.equal(arowana.spaceAndGrowth?.adultLengthCm?.measurement, 'TL');
assert.equal(arowana.spaceAndGrowth?.minVolumeLiters, undefined, 'legacy 800 L catalog copy must not become reviewed minimum without precise source authority');
assert.equal(arowana.spaceAndGrowth?.minTankLengthCm, undefined, 'no reviewed fixed tank length was sourced for silver arowana');
assert.ok(arowanaProfile.behaviorTraits.includes('solitary_required'));
assert.ok(arowanaProfile.predationTargets.includes('small_fish'));
const arowanaWithNeon = evaluateTankCompatibility({
  tank: tank(26, 300, 100, 80),
  existingSpecies: [{ species: byId('sp_0431'), record: { quantity: 10 } }],
  candidateSpecies: byId('sp_0117'),
  candidateQuantity: 1,
});
assert.equal(arowanaWithNeon.status, 'not_recommended');
assert.ok(arowanaWithNeon.blockingRules.some(rule => rule.code === 'predation_risk'));
const solitaryRules = arowanaWithNeon.blockingRules.filter(rule => rule.code === 'single_housing_required');
assert.equal(solitaryRules.length, 1, 'candidate-level single housing reason must not be duplicated by Domain + reviewed evidence bridges');
assert.deepEqual(solitaryRules[0]?.affectedSpeciesIds, ['sp_0117']);
assert.equal(solitaryRules[0]?.citations.some(source => source.id === 'seriouslyfish-osteoglossum-bicirrhosum'), true);

const socolofi = getReviewedSpeciesKnowledgeForFish(byId('sp_0018'))!;
const socolofiProfile = getReviewedCompatibilityProfileForFish(byId('sp_0018'))!;
assert.deepEqual(socolofi.environment?.temperatureRangeC, { min: 24, max: 28 });
assert.deepEqual(socolofi.environment?.phRange, { min: 7.6, max: 8.8 });
assert.equal(socolofi.spaceAndGrowth?.minVolumeLiters, 154);
assert.equal(socolofi.spaceAndGrowth?.minTankLengthCm, 90);
assert.equal(socolofi.socialBehavior?.mode, 'harem');
assert.equal(socolofi.socialBehavior?.minimumGroupSize, undefined, 'harem guidance must not be converted into a universal minimum group size');
assert.ok(socolofiProfile.behaviorTraits.includes('territorial'));
assert.equal(socolofiProfile.minimumGroupSize, undefined);
const socolofiSmallTank = evaluateTankCompatibility({
  tank: tank(26, 60, 30, 35),
  candidateSpecies: byId('sp_0018'),
  candidateQuantity: 1,
});
assert.equal(socolofiSmallTank.status, 'caution');
assert.ok(socolofiSmallTank.warningRules.some(rule => (
  rule.code === 'tank_volume_below_species_minimum' || rule.code === 'tank_length_below_species_minimum'
)));
assert.ok(!socolofiSmallTank.warningRules.some(rule => rule.code.includes('group')), 'single socolofi planning must not invent a fixed group-size rule');

console.log('priority compatibility knowledge batch4 passed: ornate bichir predation/space, silver arowana solitary/predation, Chindongo hard-water/territory, and singleton-rule dedupe');

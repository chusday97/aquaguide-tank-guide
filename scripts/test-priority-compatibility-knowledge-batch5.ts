import assert from 'node:assert/strict';
import { catalogSeedFishData, fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { buildSpeciesKnowledgeProfile, getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, `missing ${id}`);
  return fish;
};
const seedById = (id: string) => {
  const fish = catalogSeedFishData.find(item => item.id === id);
  assert.ok(fish, `missing seed ${id}`);
  return fish;
};
const tank = (length: number, width: number, height: number, temp = 26): Aquarium => ({
  id: 'batch5', name: 'batch5', fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater', targetTemperature: String(temp),
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

for (const id of ['sp_0054', 'sp_0057', 'sp_0058']) {
  assert.ok(getReviewedSpeciesKnowledgeForFish(byId(id)), `${id} knowledge missing`);
  assert.ok(getReviewedCompatibilityProfileForFish(byId(id)), `${id} profile missing`);
  assert.equal(byId(id).category, '慈鲷/斗鱼', `${id} runtime category must be corrected before Compatibility promotion`);
  assert.equal(buildSpeciesKnowledgeProfile(byId(id)).facts.waterType, 'freshwater');
}

// Historical local-fish-data-v1 rows remain immutable; runtime corrections are object-scoped.
assert.equal(seedById('sp_0054').category, '硬景/底床');
assert.equal(seedById('sp_0057').category, '海水鱼');
assert.equal(seedById('sp_0058').category, '海水鱼');

const jewel = getReviewedSpeciesKnowledgeForFish(byId('sp_0054'))!;
const jewelProfile = getReviewedCompatibilityProfileForFish(byId('sp_0054'))!;
assert.deepEqual(jewel.environment?.temperatureRangeC, { min: 22, max: 28 });
assert.deepEqual(jewel.environment?.phRange, { min: 6, max: 7.8 });
assert.equal(jewel.spaceAndGrowth?.minVolumeLiters, 108);
assert.equal(jewel.spaceAndGrowth?.minTankLengthCm, 120);
assert.equal(jewel.socialBehavior?.territoriality, 'high');
assert.ok(jewelProfile.behaviorTraits.includes('territorial'));
assert.ok(jewelProfile.behaviorTraits.includes('breeding_defense'));
const jewelVsTerritorial = evaluateTankCompatibility({
  tank: tank(150, 50, 50),
  existingSpecies: [{ species: byId('sp_0018'), record: { quantity: 1 } }],
  candidateSpecies: byId('sp_0054'), candidateQuantity: 1,
});
assert.equal(jewelVsTerritorial.status, 'caution');
assert.ok(jewelVsTerritorial.warningRules.some(rule => rule.code === 'territorial_conflict'));

const calvus = getReviewedSpeciesKnowledgeForFish(byId('sp_0057'))!;
const calvusProfile = getReviewedCompatibilityProfileForFish(byId('sp_0057'))!;
assert.deepEqual(calvus.environment?.temperatureRangeC, { min: 24, max: 27 });
assert.deepEqual(calvus.environment?.phRange, { min: 7.5, max: 9 });
assert.equal(calvus.spaceAndGrowth?.adultLengthCm?.max, 13.8);
assert.equal(calvus.spaceAndGrowth?.minVolumeLiters, undefined, 'legacy 120 L copy must not become reviewed minimum');
assert.equal(calvus.spaceAndGrowth?.minTankLengthCm, undefined, 'source does not establish a fixed reviewed tank length');
assert.ok(calvusProfile.behaviorTraits.includes('predatory'));
assert.ok(calvusProfile.predationTargets.includes('small_fish'));
assert.doesNotMatch(byId('sp_0057').tankSize, /\d+\s*升/, 'runtime copy must not leak legacy 120 L as a reviewed-looking number');
const calvusWithNeon = evaluateTankCompatibility({
  tank: tank(150, 50, 50),
  existingSpecies: [{ species: byId('sp_0431'), record: { quantity: 8 } }],
  candidateSpecies: byId('sp_0057'), candidateQuantity: 1,
});
assert.equal(calvusWithNeon.status, 'not_recommended');
assert.ok(calvusWithNeon.blockingRules.some(rule => rule.code === 'predation_risk'));
const calvusAloneSmallTank = evaluateTankCompatibility({
  tank: tank(80, 30, 35), candidateSpecies: byId('sp_0057'), candidateQuantity: 1,
});
assert.equal(calvusAloneSmallTank.status, 'compatible');
assert.ok(!calvusAloneSmallTank.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum' || rule.code === 'tank_length_below_species_minimum'));

const multi = getReviewedSpeciesKnowledgeForFish(byId('sp_0058'))!;
const multiProfile = getReviewedCompatibilityProfileForFish(byId('sp_0058'))!;
assert.deepEqual(multi.environment?.temperatureRangeC, { min: 24, max: 27 });
assert.deepEqual(multi.environment?.phRange, { min: 7.5, max: 9 });
assert.equal(multi.socialBehavior?.mode, 'colony');
assert.equal(multi.socialBehavior?.minimumGroupSize, undefined, 'colony guidance must not become a universal minimum group size');
assert.equal(multi.spaceAndGrowth?.minVolumeLiters, 40);
assert.equal(multi.spaceAndGrowth?.minTankLengthCm, 45);
assert.ok(multiProfile.behaviorTraits.includes('territorial'));
assert.equal(multiProfile.minimumGroupSize, undefined);
const multiSingle = evaluateTankCompatibility({
  tank: tank(60, 30, 30), candidateSpecies: byId('sp_0058'), candidateQuantity: 1,
});
assert.ok(!multiSingle.warningRules.some(rule => rule.code.includes('group')), 'single shell-dweller planning must not invent a group minimum');
const multiSmallTank = evaluateTankCompatibility({
  tank: tank(35, 25, 25), candidateSpecies: byId('sp_0058'), candidateQuantity: 1,
});
assert.equal(multiSmallTank.status, 'caution');
assert.ok(multiSmallTank.warningRules.some(rule => rule.code === 'tank_volume_below_species_minimum'));
assert.ok(multiSmallTank.warningRules.some(rule => rule.code === 'tank_length_below_species_minimum'));

console.log('priority compatibility knowledge batch5 passed: corrected freshwater cichlid identity + jewel territoriality + calvus predation without fake tank minimum + multifasciatus shell-territory boundary');

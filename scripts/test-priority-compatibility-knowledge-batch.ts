import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};
const tank = (temperature: number, length = 160, width = 50, height = 50): Aquarium => ({
  id: 'priority-knowledge-batch', name: 'priority knowledge batch', fishes: [],
  dimensions: { length: String(length), width: String(width), height: String(height) },
  waterType: 'Freshwater', targetTemperature: String(temperature),
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const promoted = ['sp_0015', 'sp_0059', 'sp_0199', 'sp_0200', 'sp_0019'];
for (const id of promoted) {
  const fish = byId(id);
  const knowledge = getReviewedSpeciesKnowledgeForFish(fish);
  const profile = getReviewedCompatibilityProfileForFish(fish);
  assert.ok(knowledge, id + ' must have runtime Species Knowledge after object-specific review');
  assert.ok(profile, id + ' must have reviewed Compatibility profile after object-specific review');
  assert.equal(knowledge?.environment?.evidence.reviewStatus, 'reviewed');
  assert.equal(knowledge?.socialBehavior?.evidence.reviewStatus, 'reviewed');
  assert.equal(knowledge?.spaceAndGrowth?.evidence.reviewStatus, 'reviewed');
}

assert.deepEqual(getReviewedSpeciesKnowledgeForFish(byId('sp_0059'))?.environment?.temperatureRangeC, { min: 10, max: 22 });
assert.equal(getReviewedSpeciesKnowledgeForFish(byId('sp_0015'))?.spaceAndGrowth?.minTankLengthCm, 150);
assert.equal(getReviewedSpeciesKnowledgeForFish(byId('sp_0199'))?.socialBehavior?.territoriality, 'high');
assert.equal(getReviewedSpeciesKnowledgeForFish(byId('sp_0200'))?.spaceAndGrowth?.minVolumeLiters, 41);
assert.deepEqual(getReviewedSpeciesKnowledgeForFish(byId('sp_0019'))?.environment?.phRange, { min: 4.8, max: 6.2 });

const altumWithNeon = evaluateTankCompatibility({
  tank: tank(29),
  existingSpecies: [{ species: byId('sp_0431'), record: { quantity: 10 } }],
  candidateSpecies: byId('sp_0019'), candidateQuantity: 1,
});
assert.equal(altumWithNeon.status, 'not_recommended');
assert.ok(altumWithNeon.blockingRules.some(rule => rule.code === 'predation_risk'));

const paradiseAtTropicalHeat = evaluateTankCompatibility({
  tank: tank(27, 100, 40, 40), candidateSpecies: byId('sp_0059'), candidateQuantity: 2,
});
assert.equal(paradiseAtTropicalHeat.status, 'not_recommended');
assert.ok(paradiseAtTropicalHeat.blockingRules.some(rule => rule.code.includes('temperature')));

const undersizedKissingGourami = evaluateTankCompatibility({
  tank: tank(26, 90, 35, 40), candidateSpecies: byId('sp_0015'), candidateQuantity: 1,
});
assert.notEqual(undersizedKissingGourami.status, 'compatible');
assert.ok(
  [...undersizedKissingGourami.warningRules, ...undersizedKissingGourami.blockingRules]
    .some(rule => /tank_(volume|length)|volume_too_small|space/.test(rule.code)),
  'kissing gourami must surface reviewed long-term space pressure in an undersized tank',
);

assert.equal(getReviewedSpeciesKnowledgeForFish(byId('sp_0234')), undefined);
assert.equal(getReviewedCompatibilityProfileForFish(byId('sp_0234')), undefined);

console.log('priority compatibility knowledge batch passed: 5 exact species promoted, direct risk behavior works, variants remain fail-closed');

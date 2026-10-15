import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews, getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { getSpeciesHousingAuthority } from '../src/modules/knowledge/speciesHousingAuthority';

const fish = fishData.find(item => item.id === 'sp_0042');
const tankmate = fishData.find(item => item.id === 'sp_0434');
assert.ok(fish);
assert.ok(tankmate);

const reviews = getApprovedCatalogFieldReviews('sp_0042');
const byField = new Map(reviews.map(item => [item.field, item]));
assert.equal(byField.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(byField.get('adult_size')?.proposedValue, { min: null, max: 12.5 });
assert.deepEqual(byField.get('social_behavior')?.proposedValue, { mode: 'variable', minimumGroupSize: null });
const breedingReview = getCatalogFieldReviews('sp_0042').find(item => item.field === 'breeding_behavior');
assert.equal(breedingReview?.resolution, 'unknown');
assert.equal(byField.has('breeding_behavior'), false);
for (const laterReviewed of ['temperature', 'ph', 'tank_size', 'territoriality', 'predation']) {
  assert.equal(byField.has(laterReviewed as any), true, 'later reviewed authority may extend the original next-wave profile: ' + laterReviewed);
}

const profile = getReviewedCompatibilityProfile('sp_0042');
assert.ok(profile);
assert.equal(profile?.waterType, 'freshwater');
assert.deepEqual(profile?.waterTypes, ['freshwater', 'brackish']);
assert.deepEqual(profile?.behaviorTraits, ['shoaling', 'breeding_defense']);
assert.deepEqual(profile?.predationTargets, ['fish_fry']);
for (const originalFact of ['water', 'adult_size', 'social_behavior', 'breeding_behavior'] as const) {
  assert.ok(profile?.requiredFacts.includes(originalFact), 'current profile must retain original next-wave fact: ' + originalFact);
}
for (const laterFact of ['temperature', 'ph', 'tank_size', 'territoriality', 'predation'] as const) {
  assert.ok(profile?.requiredFacts.includes(laterFact), 'current profile may include later reviewed fact: ' + laterFact);
}

const knowledge = getReviewedSpeciesKnowledgeForFish(fish!);
assert.ok(knowledge);
assert.equal(knowledge?.environment?.waterType, 'freshwater');
assert.deepEqual(knowledge?.environment?.waterTypes, ['freshwater', 'brackish']);
assert.equal(knowledge?.environment?.temperatureRangeC, undefined);
assert.equal(knowledge?.spaceAndGrowth?.adultLengthCm?.max, 12.5);
assert.equal(knowledge?.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(knowledge?.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(knowledge?.socialBehavior?.mode, 'variable');
assert.equal(knowledge?.socialBehavior?.territoriality, 'unknown');
assert.equal(knowledge?.socialBehavior?.predationRisk, 'unknown');
assert.equal(knowledge?.reproduction?.mode, 'substrate_spawner');
assert.equal(knowledge?.reproduction?.parentalCare, 'egg_guarding');

const housing = getSpeciesHousingAuthority(fish!);
assert.equal(housing.source, 'reviewed');
assert.equal(housing.communityCategory, '谨慎混养');
assert.equal(housing.solitaryRequired, false);

const normal = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: fish!,
  existingSpecies: [tankmate!],
  candidateContext: { lifeStage: 'adult', reproductiveState: 'normal', guardingEggsOrFry: false },
});
assert.equal(normal.warningRules.some(rule => rule.code === 'breeding_territory_active'), false);
assert.equal(normal.blockingRules.some(rule => rule.code === 'predation_risk'), false);

const breeding = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: fish!,
  existingSpecies: [tankmate!],
  candidateContext: { lifeStage: 'adult', reproductiveState: 'in_labor_or_spawning', guardingEggsOrFry: true },
});
assert.equal(breeding.warningRules.some(rule => rule.code === 'breeding_territory_active'), true);

console.log('next-wave freshwater authority verified: original multi-water/breeding semantics remain intact while later reviewed environment and fry-predation authority grows monotonically');

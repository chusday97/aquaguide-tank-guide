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
assert.equal(byField.has('temperature'), false);
assert.equal(byField.has('ph'), false);
assert.equal(byField.has('tank_size'), false);
assert.equal(byField.has('territoriality'), false);
assert.equal(byField.has('predation'), false);

const profile = getReviewedCompatibilityProfile('sp_0042');
assert.ok(profile);
assert.equal(profile?.waterType, 'freshwater');
assert.deepEqual(profile?.waterTypes, ['freshwater', 'brackish']);
assert.deepEqual(profile?.behaviorTraits, ['shoaling', 'breeding_defense']);
assert.deepEqual(profile?.predationTargets, []);
assert.deepEqual(profile?.requiredFacts, ['water', 'adult_size', 'social_behavior', 'breeding_behavior']);

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

console.log('next-wave freshwater authority verified: sp_0042 multi-water + context-dependent shoaling + breeding-only defense without generic small-fish overblock');

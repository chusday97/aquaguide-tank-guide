import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { getSpeciesHousingAuthority } from '../src/modules/knowledge/speciesHousingAuthority';

const id = 'sp_0038';
const fish = fishData.find(item => item.id === id);
assert.ok(fish);

const reviews = getApprovedCatalogFieldReviews(id);
const byField = new Map(reviews.map(item => [item.field, item]));
assert.equal(byField.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(byField.get('adult_size')?.proposedValue, { min: null, max: 26.1 });
assert.deepEqual(byField.get('social_behavior')?.proposedValue, { mode: 'variable', minimumGroupSize: null });
assert.deepEqual(byField.get('predation')?.proposedValue, { targets: ['small_fish'] });
assert.equal(byField.has('temperature'), false, 'ecological climate range must not silently become an aquarium temperature setpoint');
assert.equal(byField.has('ph'), false);
assert.equal(byField.has('tank_size'), false);

const profile = getReviewedCompatibilityProfile(id);
assert.ok(profile);
assert.equal(profile?.waterType, 'freshwater');
assert.deepEqual(profile?.predationTargets, ['small_fish']);
assert.ok(profile?.behaviorTraits.includes('predatory'));
assert.ok(profile?.behaviorTraits.includes('interspecific_aggression'));
assert.deepEqual(profile?.requiredFacts, ['water', 'adult_size', 'social_behavior', 'predation']);

const knowledge = getReviewedSpeciesKnowledgeForFish(fish!);
assert.ok(knowledge);
assert.equal(knowledge?.environment?.waterType, 'freshwater');
assert.equal(knowledge?.environment?.temperatureRangeC, undefined);
assert.equal(knowledge?.spaceAndGrowth?.adultLengthCm?.max, 26.1);
assert.equal(knowledge?.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(knowledge?.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(knowledge?.socialBehavior?.mode, 'variable');
assert.equal(knowledge?.socialBehavior?.predationRisk, 'medium');

const housing = getSpeciesHousingAuthority(fish!);
assert.equal(housing.source, 'reviewed');
assert.equal(housing.communityCategory, '谨慎混养');
assert.equal(housing.solitaryRequired, false, 'reviewed evidence supports caution, not a universal solitary-only rule');

const smallFish = fishData.find(item => item.id === 'sp_0431');
assert.ok(smallFish);
assert.equal(smallFish?.size, 'Small');
const pair = evaluateSpeciesCombination([fish!, smallFish!]);
assert.equal(pair.status, 'not_recommended', 'reviewed adult small-fish predation must block long-term small-fish cohabitation');

console.log('next-wave freshwater authority verified: sp_0038 reviewed freshwater + adult size + aggression/social boundary + size-scoped predation');

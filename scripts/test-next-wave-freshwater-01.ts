import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';

const id = 'sp_0018';
const reviews = getApprovedCatalogFieldReviews(id);
const byField = new Map(reviews.map(item => [item.field, item]));

assert.equal(byField.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(byField.get('temperature')?.proposedValue, { min: 24, max: 28 });
assert.deepEqual(byField.get('ph')?.proposedValue, { min: 7.6, max: 8.8 });
assert.deepEqual(byField.get('adult_size')?.proposedValue, { min: null, max: 11.5 });
assert.deepEqual(byField.get('tank_size')?.proposedValue, { liters: null, lengthCm: 90 });
assert.deepEqual(byField.get('social_behavior')?.proposedValue, { mode: 'variable', minimumGroupSize: null });
assert.deepEqual(byField.get('territoriality')?.proposedValue, { traits: ['territorial_males', 'rock_associated_territory'] });
assert.deepEqual(byField.get('predation')?.proposedValue, { targets: [] });
assert.equal(byField.has('breeding_behavior'), false);

const profile = getReviewedCompatibilityProfile(id);
assert.ok(profile);
assert.equal(profile?.waterType, 'freshwater');
assert.ok(profile?.behaviorTraits.includes('territorial_males'));
assert.ok(profile?.requiredFacts?.includes('tank_size'));
assert.ok(profile?.requiredFacts?.includes('territoriality'));
assert.ok(profile?.requiredFacts?.includes('predation'));

const fish = fishData.find(item => item.id === id);
assert.ok(fish);
const knowledge = getReviewedSpeciesKnowledgeForFish(fish!);
assert.ok(knowledge);
assert.equal(knowledge?.environment?.waterType, 'freshwater');
assert.deepEqual(knowledge?.environment?.temperatureRangeC, { min: 24, max: 28 });
assert.deepEqual(knowledge?.environment?.phRange, { min: 7.6, max: 8.8 });
assert.equal(knowledge?.spaceAndGrowth?.adultLengthCm?.max, 11.5);
assert.equal(knowledge?.spaceAndGrowth?.minTankLengthCm, 90);
assert.equal(knowledge?.socialBehavior?.mode, 'variable');

console.log('next-wave freshwater authority verified: sp_0018 reviewed environment + conservative size/space + territorial social boundary + neutral fish-predation authority');

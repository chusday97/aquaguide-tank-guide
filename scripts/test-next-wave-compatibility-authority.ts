import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

const altum = getReviewedSpeciesKnowledge('sp_0019');
assert.equal(altum?.environment?.waterType, 'freshwater');
assert.deepEqual(altum?.environment?.temperatureRangeC, { min: 27, max: 31 });
assert.deepEqual(altum?.environment?.phRange, { min: 4.8, max: 6.2 });
assert.equal(altum?.spaceAndGrowth?.adultLengthCm?.max, 18);
assert.equal(altum?.socialBehavior?.predationRisk, 'medium');

const altumProfile = getReviewedCompatibilityProfile('sp_0019');
assert.ok(altumProfile?.behaviorTraits.includes('small_fish_predation'));
assert.deepEqual(altumProfile?.predationTargets, ['very_small_fish']);

const pleco = getReviewedSpeciesKnowledge('sp_0026');
assert.deepEqual(pleco?.environment?.waterTypes, ['freshwater', 'brackish']);
assert.deepEqual(pleco?.environment?.temperatureRangeC, { min: 20, max: 28 });
assert.equal(pleco?.spaceAndGrowth?.adultLengthCm?.max, 25);
assert.equal(pleco?.socialBehavior?.mode, 'unknown');
assert.equal(pleco?.socialBehavior?.evidence.confidence, 'unknown');

const plecoProfile = getReviewedCompatibilityProfile('sp_0026');
assert.deepEqual(plecoProfile?.waterTypes, ['freshwater', 'brackish']);
assert.ok(plecoProfile?.behaviorTraits.includes('bottom_dwelling'));
assert.equal(plecoProfile?.behaviorTraits.includes('territorial'), false);

const roundtail = getReviewedSpeciesKnowledge('sp_0043');
assert.deepEqual(roundtail?.environment?.temperatureRangeC, { min: 10, max: 22 });
assert.equal(roundtail?.spaceAndGrowth?.minVolumeLiters, 72);
assert.equal(roundtail?.spaceAndGrowth?.minTankLengthCm, 80);
assert.equal(roundtail?.socialBehavior?.mode, 'variable');
assert.equal(roundtail?.socialBehavior?.territoriality, 'medium');

const roundtailProfile = getReviewedCompatibilityProfile('sp_0043');
assert.ok(roundtailProfile?.behaviorTraits.includes('breeding_defense'));
assert.ok(roundtailProfile?.behaviorTraits.includes('territorial'));

const smallFish = fishData.find(fish => fish.id === 'sp_0431');
const altumFish = fishData.find(fish => fish.id === 'sp_0019');
assert.ok(smallFish && altumFish);
const predation = evaluateSpeciesCombination([altumFish, smallFish]);
assert.notEqual(predation.status, 'compatible', 'Altum + very small fish must not be treated as unconditionally compatible');

console.log('next-wave compatibility authority passed: altum + common pleco + roundtail paradise fish');

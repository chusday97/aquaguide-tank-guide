import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  getReviewedCompatibilityProfile,
  getReviewedCompatibilityProfileForFish,
} from '../src/data/compatibilityEvidence';
import { evaluateSpeciesCombination } from '../src/lib/tankCompatibilityEngine';

const goldRam = fishData.find(fish => fish.id === 'sp_0016');
assert.ok(goldRam, 'gold ram catalog object must exist');

const directProfile = getReviewedCompatibilityProfile('sp_0016');
assert.ok(directProfile, 'gold ram must have a direct reviewed Compatibility profile');
assert.equal(directProfile.waterType, 'freshwater');
assert.ok(directProfile.behaviorTraits.includes('peaceful'));
assert.ok(directProfile.behaviorTraits.includes('breeding_defense'));
assert.equal(directProfile.predationTargets.length, 0);
assert.ok(directProfile.citations.some(source => source.id === 'seriouslyfish-mikrogeophagus-ramirezi'));
assert.ok(directProfile.citations.some(source => source.id === 'fishbase-mikrogeophagus-ramirezi'));

assert.equal(
  getReviewedCompatibilityProfileForFish(goldRam)?.speciesId,
  'sp_0016',
  'gold ram must resolve exact reviewed authority before any base-species lookup',
);

const platinum = fishData.find(fish => fish.id === 'sp_0146');
assert.ok(platinum, 'platinum ram catalog object must exist');
assert.equal(
  getReviewedCompatibilityProfile('sp_0146'),
  undefined,
  'adding direct gold-ram authority must not silently grant direct authority to other ornamental variants',
);

const pandaCory = fishData.find(fish => fish.id === 'sp_0443');
assert.ok(pandaCory, 'panda cory catalog object must exist');
const decision = evaluateSpeciesCombination([goldRam, pandaCory]);
assert.notEqual(
  decision.status,
  'insufficient_data',
  'gold ram + panda cory must no longer fail only because gold ram lacked reviewed Compatibility authority',
);

console.log('gold ram Compatibility authority passed: direct reviewed profile and no silent variant promotion');

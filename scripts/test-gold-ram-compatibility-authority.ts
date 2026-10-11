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
const platinumProfile = getReviewedCompatibilityProfile('sp_0146');
assert.ok(platinumProfile, 'explicitly reviewed Platinum Ram bridge must resolve direct Compatibility authority');
assert.ok(
  platinumProfile.citations.some(source => source.id === 'batch10-fishbase-mikrogeophagus-ramirezi-platinum'),
  'Platinum Ram bridge must carry its own reviewed variant identity citation',
);

const blue = fishData.find(fish => fish.id === 'sp_0157');
assert.ok(blue, 'blue ram catalog object must exist');
const blueProfile = getReviewedCompatibilityProfile('sp_0157');
assert.ok(blueProfile, 'explicitly reviewed Blue Ram bridge must resolve direct Compatibility authority');
assert.ok(
  blueProfile.citations.some(source => source.id === 'batch10-fishbase-mikrogeophagus-ramirezi-blue'),
  'Blue Ram bridge must carry its own reviewed variant identity citation',
);

assert.equal(
  getReviewedCompatibilityProfile('sp_0219'),
  undefined,
  'unreviewed balloon Ramirezi variants must not receive direct Compatibility authority by base-species inheritance',
);

const pandaCory = fishData.find(fish => fish.id === 'sp_0443');
assert.ok(pandaCory, 'panda cory catalog object must exist');
const decision = evaluateSpeciesCombination([goldRam, pandaCory]);
assert.notEqual(
  decision.status,
  'insufficient_data',
  'gold ram + panda cory must no longer fail only because gold ram lacked reviewed Compatibility authority',
);

console.log('gold ram Compatibility authority passed: explicit reviewed variant bridges plus no silent promotion for unreviewed balloon variants');

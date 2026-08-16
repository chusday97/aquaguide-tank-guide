import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { getLifeType, getSpeciesWaterType } from '../src/modules/species/species.service';

const lionfish = fishData.find(item => item.id === 'sp_0130');
assert.ok(lionfish, 'missing lionfish catalog fixture sp_0130');
assert.equal(lionfish.scientificName, 'Pterois volitans');
assert.equal(getSpeciesWaterType(lionfish), 'saltwater');

const marineSmallFish = fishData.find(item => (
  item.scientificName === 'Amphiprion ocellaris'
  && getLifeType(item) === 'fish'
  && getSpeciesWaterType(item) === 'saltwater'
));
assert.ok(marineSmallFish, 'missing same-water Amphiprion ocellaris fixture');
assert.equal(marineSmallFish.size, 'Small');

const profile = getReviewedCompatibilityProfile(lionfish.id);
assert.ok(profile, 'lionfish must resolve a reviewed deterministic compatibility profile');
assert.equal(profile.reviewStatus, 'reviewed');
assert.equal(profile.confidence, 'medium');
assert.ok(profile.behaviorTraits.includes('predatory'));
assert.ok(profile.predationTargets.includes('small_fish'));
assert.ok(profile.citations.some(source => source.id === 'lionfish-prey-risk-experiment'));
assert.ok(profile.citations.some(source => source.url.includes('10.1371/journal.pone.0068259')));

const result = evaluateTankCompatibility({
  existingSpecies: [{ species: lionfish, record: { quantity: 1 } }],
  candidateSpecies: marineSmallFish,
  candidateQuantity: 1,
  scope: 'species_only',
});
assert.equal(result.status, 'not_recommended');
const predationBlock = result.blockingRules.find(rule => rule.code === 'predation_risk');
assert.ok(predationBlock, 'same-water small marine fish must receive the reviewed predation blocker');
assert.equal(predationBlock.severity, 'high');
assert.deepEqual(predationBlock.affectedSpeciesIds, [lionfish.id]);
assert.ok(predationBlock.citations.some(source => source.id === 'lionfish-prey-risk-experiment'));
assert.match(predationBlock.evidence, new RegExp(lionfish.name));
assert.match(predationBlock.evidence, new RegExp(marineSmallFish.name));

console.log(`lionfish reviewed evidence passed: ${lionfish.name} -> ${marineSmallFish.name} remains a same-water high predation blocker with reviewed citation provenance`);

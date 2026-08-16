import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';
import { getLifeType, getSpeciesWaterType } from '../src/modules/species/species.service';
import { resolveCanonicalSpeciesId } from '../src/modules/species/speciesAliases';

const lionfish = fishData.find(item => item.id === 'sp_0453');
assert.ok(lionfish, 'missing canonical lionfish catalog fixture sp_0453');
assert.equal(lionfish.scientificName, 'Pterois volitans');
assert.equal(lionfish.category, '海水鱼');
assert.equal(getSpeciesWaterType(lionfish), 'saltwater');

// sp_0130 is a legacy duplicate ID for Opsariichthys bidens/马口鱼, not lionfish.
// Reviewed lionfish evidence must never be rebound to that removed identity.
assert.equal(resolveCanonicalSpeciesId('sp_0130'), 'sp_0038');
assert.equal(getReviewedCompatibilityProfile('sp_0130'), undefined);

// Use one fixed, audited marine control instead of scanning for the first record that happens
// to satisfy derived water/category fields. This prevents unrelated catalog-classification bugs
// from making the lionfish evidence test pass with a freshwater species.
const marineSmallFish = fishData.find(item => item.id === 'sp_0297');
assert.ok(marineSmallFish, 'missing audited Small marine control sp_0297');
assert.equal(marineSmallFish.category, '海水鱼');
assert.match(marineSmallFish.scientificName, /^Pseudochromis\b/i);
assert.equal(getLifeType(marineSmallFish), 'fish');
assert.equal(getSpeciesWaterType(marineSmallFish), 'saltwater');
assert.equal(marineSmallFish.size, 'Small');

const profile = getReviewedCompatibilityProfile(lionfish.id);
assert.ok(profile, 'lionfish must resolve a reviewed deterministic compatibility profile');
assert.equal(profile.speciesId, 'sp_0453');
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
assert.ok(predationBlock.evidence.includes(lionfish.name));
assert.ok(predationBlock.evidence.includes(marineSmallFish.name));

console.log(`lionfish reviewed evidence passed: ${lionfish.name} (${lionfish.id}) -> ${marineSmallFish.name} (${marineSmallFish.id}) remains a same-water Small-target high predation blocker with reviewed citation provenance; control is fixed/audited; legacy sp_0130 remains mapped to non-lionfish canonical identity`);

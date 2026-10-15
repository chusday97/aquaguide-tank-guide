import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getApprovedCatalogFieldReviews, getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledgeForFish } from '../src/modules/knowledge/speciesKnowledge';
import { getKnowledgeEvidenceCeiling } from '../src/data/knowledgeEvidenceCeilings';
import { nextWaveFreshwater04FieldReviews } from '../src/data/catalogReviewBatches/next-wave-freshwater-04';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';

const ids = ['sp_0047','sp_0048','sp_0050','sp_0051','sp_0054','sp_0056','sp_0057','sp_0058'] as const;
const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing fish ' + id);
  return fish;
};

for (const id of ids) {
  const batchReviews = nextWaveFreshwater04FieldReviews.filter(item => item.speciesId === id);
  assert.equal(batchReviews.length, 10, id + ' historical batch must retain all ten terminal field reviews');
  assert.ok(batchReviews.every(item => item.status === 'reviewed' && item.resolution !== null));
  const reviews = getCatalogFieldReviews(id);
  assert.ok(reviews.length >= batchReviews.length, id + ' current authority may add later additive reviews but must not lose historical batch reviews');
  assert.ok(getApprovedCatalogFieldReviews(id).length > 0);
  assert.ok(getReviewedSpeciesKnowledgeForFish(byId(id)), id + ' direct runtime Species Knowledge must be visible');
}

assert.equal(getReviewedCompatibilityProfile('sp_0047'), undefined, 'yellow catfish must remain fail-closed without a stable social/prey-size authority');
assert.equal(getKnowledgeEvidenceCeiling('sp_0047', 'social')?.researchDisposition, 'terminal_unknown_hold');

for (const id of ['sp_0048','sp_0050','sp_0051','sp_0054','sp_0056','sp_0057','sp_0058']) {
  assert.ok(getReviewedCompatibilityProfile(id), id + ' must have direct reviewed Compatibility authority');
}

const barca = byId('sp_0050');
const largeOther = byId('sp_0451');
const barcaHetero = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: barca,
  existingSpecies: [largeOther],
});
assert.equal(barcaHetero.status, 'not_recommended');
assert.ok(barcaHetero.blockingRules.some(rule => rule.code === 'species_tank_required'));

const acrossocheilus = byId('sp_0051');
const platy = byId('sp_0011');
const acrossPair = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: acrossocheilus,
  existingSpecies: [platy],
});
assert.equal(acrossPair.metadata.domainRuleCodes.includes('public_evidence_temperature_insufficient'), true, 'targeted review must distinguish a terminal all-stage temperature evidence ceiling from an ordinary pending search');
assert.equal(acrossPair.metadata.domainRuleCodes.includes('temperature_range_conflict'), false, 'stage-specific or production temperatures must not create a false hard conflict');
assert.equal(acrossPair.status, 'insufficient_data');
assert.equal(acrossPair.metadata.decisionReadiness, 'partial');
assert.equal(getKnowledgeEvidenceCeiling('sp_0051', 'environment')?.code, 'species_temperature_husbandry_not_established');
assert.equal(getKnowledgeEvidenceCeiling('sp_0051', 'territoriality')?.code, 'species_territoriality_not_established');
assert.equal(getKnowledgeEvidenceCeiling('sp_0051', 'predation')?.code, 'species_fish_predation_not_established');

for (const id of ['sp_0057','sp_0058']) {
  const result = evaluateTankCompatibility({
    scope: 'species_only',
    candidateSpecies: byId(id),
    existingSpecies: [platy],
  });
  assert.equal(result.metadata.domainRuleCodes.includes('water_type_conflict'), false, id + ' reviewed freshwater authority must override legacy category noise');
}

const shellDweller = byId('sp_0058');
const underGroup = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: shellDweller,
  existingSpecies: [platy],
  candidateQuantity: 2,
});
assert.ok(underGroup.warningRules.some(rule => rule.code === 'minimum_group_not_met'));
const fullGroup = evaluateTankCompatibility({
  scope: 'species_only',
  candidateSpecies: shellDweller,
  existingSpecies: [platy],
  candidateQuantity: 5,
});
assert.equal(fullGroup.warningRules.some(rule => rule.code === 'minimum_group_not_met'), false);

const jewel = getReviewedSpeciesKnowledgeForFish(byId('sp_0054'));
assert.deepEqual(jewel?.environment?.waterTypes, ['freshwater', 'brackish']);
assert.equal(jewel?.spaceAndGrowth?.minTankLengthCm, 100);

const eel = getReviewedSpeciesKnowledgeForFish(byId('sp_0048'));
assert.deepEqual(eel?.environment?.waterTypes, ['freshwater', 'brackish']);
assert.equal(eel?.spaceAndGrowth?.minVolumeLiters, 432);
assert.equal(eel?.socialBehavior?.predationRisk, 'high');

console.log('next-wave freshwater 04 batch verified: historical reviews stay immutable while later Acrossocheilus pH authority and field-specific terminal evidence ceilings refine runtime decisions without reviving stale catalog values');

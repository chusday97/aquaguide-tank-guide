import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  getCompatibilityEvidenceAudit,
  getConditionalBehaviorEvidenceAudit,
  getReviewedCompatibilityProfile,
  getReviewedConditionalBehaviorEvidence,
} from '../src/data/compatibilityEvidence';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';

const byId = (id: string) => {
  const species = fishData.find(item => item.id === id);
  assert.ok(species, `missing catalog fixture ${id}`);
  return species;
};

const oscar = byId('sp_0451');
const neon = byId('sp_0431');
const oscarProfile = getReviewedCompatibilityProfile(oscar.id);
assert.ok(oscarProfile, 'standard Oscar must have a direct reviewed deterministic profile');
assert.ok(oscarProfile.behaviorTraits.includes('predatory'));
assert.ok(oscarProfile.predationTargets.includes('small_fish'));
assert.equal(oscarProfile.reviewStatus, 'reviewed');
assert.ok(oscarProfile.citations.length > 0, 'direct predation profile must retain the reviewed primary citation');

const oscarPair = evaluateTankCompatibility({
  existingSpecies: [{ species: oscar, record: { quantity: 1 } }],
  candidateSpecies: neon,
  candidateQuantity: 5,
  scope: 'species_only',
});
assert.equal(oscarPair.status, 'not_recommended');
assert.ok(
  oscarPair.blockingRules.some(rule => rule.code === 'predation_risk' && rule.affectedSpeciesIds.includes(oscar.id)),
  'reviewed Oscar predation evidence must feed the existing deterministic predation blocker',
);

const bettaIds = ['sp_0258', 'sp_0259', 'sp_0260', 'sp_0261', 'sp_0262', 'sp_0389', 'sp_0390', 'sp_0391'];
const angelfishIds = ['sp_0175', 'sp_0176', 'sp_0177', 'sp_0178', 'sp_0240', 'sp_0241', 'sp_0247', 'sp_0272', 'sp_0388', 'sp_0446'];

for (const id of bettaIds) {
  const species = byId(id);
  assert.match(species.scientificName, /Betta splendens/i, `${id} must remain an explicit Betta splendens catalog assignment`);
  const evidence = getReviewedConditionalBehaviorEvidence(id);
  assert.ok(evidence, `${id} must resolve the shared reviewed Betta contextual evidence`);
  assert.equal(evidence.evidenceKey, 'betta_splendens_contextual_aggression');
  assert.equal(evidence.reviewStatus, 'reviewed');
  assert.ok(evidence.citations.length >= 2);
  assert.ok(evidence.behaviorTraits.some(item => item.trait === 'territorial' && /reproductive|intruder/i.test(item.context)));
  assert.ok(evidence.behaviorTraits.some(item => item.trait === 'intraspecific_aggression' && /environment|isolation|rearing/i.test(item.context)));
  assert.equal(
    getReviewedCompatibilityProfile(id),
    undefined,
    `${id} contextual evidence must not become an unconditional deterministic compatibility profile`,
  );
}

for (const id of angelfishIds) {
  const species = byId(id);
  assert.match(species.scientificName, /Pterophyllum scalare/i, `${id} must remain an explicit Pterophyllum scalare catalog assignment`);
  const evidence = getReviewedConditionalBehaviorEvidence(id);
  assert.ok(evidence, `${id} must resolve the shared reviewed angelfish contextual evidence`);
  assert.equal(evidence.evidenceKey, 'pterophyllum_scalare_breeding_territory');
  assert.equal(evidence.reviewStatus, 'reviewed');
  assert.ok(evidence.behaviorTraits.some(item => item.trait === 'territorial' && /breeding|reproductive|mate/i.test(item.context)));
  assert.ok(evidence.behaviorTraits.some(item => item.trait === 'breeding_defense'));
  assert.equal(
    getReviewedCompatibilityProfile(id),
    undefined,
    `${id} breeding-context evidence must not become an unconditional territorial blocker`,
  );
}

const bettaLeft = byId('sp_0259');
const bettaRight = byId('sp_0260');
const contextualOnlyPair = evaluateTankCompatibility({
  existingSpecies: [{ species: bettaLeft, record: { quantity: 1 } }],
  candidateSpecies: bettaRight,
  candidateQuantity: 1,
  scope: 'species_only',
});
assert.equal(
  contextualOnlyPair.blockingRules.some(rule => rule.code === 'territorial_conflict'),
  false,
  'contextual Betta evidence must not be consumed as an unconditional territorial blocker',
);
assert.equal(
  contextualOnlyPair.status,
  'insufficient_data',
  'without direct deterministic profiles, the pair must still fail closed rather than be promoted to compatible',
);
assert.ok(contextualOnlyPair.missingData.some(rule => rule.code === 'behavior_evidence_unreviewed'));

const standardAngel = byId('sp_0446');
const angelVariant = byId('sp_0175');
const angelPair = evaluateTankCompatibility({
  existingSpecies: [{ species: standardAngel, record: { quantity: 1 } }],
  candidateSpecies: angelVariant,
  candidateQuantity: 1,
  scope: 'species_only',
});
assert.equal(
  angelPair.blockingRules.some(rule => rule.code === 'territorial_conflict'),
  false,
  'breeding-context angelfish evidence must not create an always-on territorial blocker',
);
assert.equal(angelPair.status, 'insufficient_data');

const conditionalAudit = getConditionalBehaviorEvidenceAudit();
for (const [speciesId, evidenceKey] of Object.entries(conditionalAudit.assignments)) {
  assert.ok(fishData.some(item => item.id === speciesId), `conditional evidence assignment references missing catalog species ${speciesId}`);
  assert.ok(conditionalAudit.evidence[evidenceKey], `conditional evidence assignment ${speciesId} references missing key ${evidenceKey}`);
}
assert.equal(new Set(Object.values(conditionalAudit.assignments).filter(key => key === 'betta_splendens_contextual_aggression')).size, 1);
assert.equal(new Set(Object.values(conditionalAudit.assignments).filter(key => key === 'pterophyllum_scalare_breeding_territory')).size, 1);

const audit = getCompatibilityEvidenceAudit();
assert.ok(audit.reviewedSpeciesIds.includes(oscar.id));
assert.ok(audit.conditionalEvidenceKeys.includes('betta_splendens_contextual_aggression'));
assert.ok(audit.conditionalEvidenceKeys.includes('pterophyllum_scalare_breeding_territory'));

console.log(`contextual compatibility evidence passed: Oscar is deterministic predator evidence; ${bettaIds.length} Betta and ${angelfishIds.length} angelfish catalog entities share reviewed contextual evidence without becoming unconditional blockers`);

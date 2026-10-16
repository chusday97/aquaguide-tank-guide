import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfileForFish } from '../src/data/compatibilityEvidence';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getLifeType } from '../src/modules/species/species.service';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { buildCompatibilityCoreFieldCoverage, buildCompatibilityFastLaneResearchPackets, buildCompatibilityTaxonResearchPlan } from '../src/services/compatibility/compatibility-field-coverage.service';

const { rows, summary, backlog } = buildCompatibilityCoreFieldCoverage();
const fastLanePackets = buildCompatibilityFastLaneResearchPackets();
const taxonResearchPlan = buildCompatibilityTaxonResearchPlan();
const fields = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS];
assert.equal(rows.length, fishData.length);
assert.equal(rows.length, 486);
assert.deepEqual(summary.coreFields, fields);
assert.ok(summary.runtimeReviewedProfileSpecies >= 101);
assert.ok(summary.coreFieldCompleteSpecies >= summary.genericOnboardingReadySpecies);
assert.ok(summary.oneFieldGapSpecies > 0);
assert.ok(summary.genericOnboardingReadySpecies >= 43, 'High-yield source-first coverage should preserve at least 43 fully sourced generic-ready profiles');
for (const speciesId of ['sp_0017','sp_0018','sp_0020','sp_0045','sp_0048','sp_0050','sp_0053','sp_0056','sp_0057','sp_0058','sp_0114','sp_0126','sp_0131','sp_0133','sp_0140','sp_0181','sp_0184','sp_0197','sp_0202','sp_0214','sp_0218','sp_0440','sp_0443','sp_0446','sp_0447','sp_0448','sp_0449','sp_0451','sp_0469']) {
  const row = rows.find(item => item.speciesId === speciesId);
  const fish = fishData.find(item => item.id === speciesId);
  const profile = fish ? getReviewedCompatibilityProfileForFish(fish) : undefined;
  assert.equal(row?.genericOnboardingReady, true, `${speciesId} should be promoted only from already-reviewed 8/8 field authority`);
  assert.ok(profile);
  const citationIds = new Set(profile.citations.map(source => source.id));
  for (const field of fields) {
    assert.ok(row?.fields[field].evidenceIds.length, `${speciesId}/${field} must retain field-level provenance`);
    assert.ok(row?.fields[field].evidenceIds.every(id => citationIds.has(id)), `${speciesId}/${field} evidence must already be contained in the reviewed Profile citations before requiredFacts sync`);
  }
}
assert.equal(rows.find(row => row.speciesId === 'sp_0015')?.fields.predation.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0059')?.fields.predation.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0441')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rows.find(row => row.speciesId === 'sp_0450')?.fields.predation.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0050')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rows.find(row => row.speciesId === 'sp_0214')?.fields.predation.status, 'reviewed_neutral_or_negative');
for (const speciesId of ['sp_0018','sp_0056','sp_0058','sp_0121','sp_0122','sp_0123','sp_0181','sp_0200','sp_0202','sp_0440','sp_0449']) {
  assert.equal(rows.find(row => row.speciesId === speciesId)?.fields.predation.status, 'reviewed_neutral_or_negative', `${speciesId} should only close predation from reviewed diet + tankmate/community evidence`);
}
const rowOf = (speciesId: string) => rows.find(row => row.speciesId === speciesId);
assert.equal(rowOf('sp_0014')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0014')?.fields.social_behavior.status, 'reviewed_supported');
assert.equal(rowOf('sp_0443')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0443')?.fields.social_behavior.status, 'reviewed_supported');
assert.equal(rowOf('sp_0443')?.fields.territoriality.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0443')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0444')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0446')?.fields.adult_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0446')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0446')?.fields.predation.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0197')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0197')?.genericOnboardingReady, true);
for (const field of ['ph', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const) assert.equal(rowOf('sp_0451')?.fields[field].status, 'reviewed_supported');
assert.equal(rowOf('sp_0451')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0140')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0140')?.fields.ph.status, 'reviewed_supported');
assert.equal(rowOf('sp_0140')?.fields.predation.status, 'reviewed_supported');
assert.equal(rowOf('sp_0181')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0449')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0012')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0468')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0139')?.fields.predation.status, 'reviewed_supported');
assert.equal(rowOf('sp_0184')?.genericOnboardingReady, true);
for (const field of ['temperature', 'ph', 'adult_size', 'predation'] as const) assert.ok(['reviewed_supported', 'reviewed_neutral_or_negative'].includes(rowOf('sp_0184')?.fields[field].status ?? ''));
assert.equal(rowOf('sp_0218')?.genericOnboardingReady, true);
assert.equal(rowOf('sp_0218')?.fields.territoriality.status, 'reviewed_supported');
assert.equal(rowOf('sp_0218')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0187')?.fields.adult_size.status, 'reviewed_supported', 'Chrysiptera adult size may close only from the reviewed exact-taxon Fishipedia page, not the older AI-generated migration page');
assert.equal(rowOf('sp_0187')?.fields.tank_size.status, 'reviewed_supported', 'Chrysiptera tank size may close only from the reviewed exact-taxon Fishipedia maintenance recommendation, not the older AI-generated migration page');
assert.equal(rowOf('sp_0187')?.genericOnboardingReady, true, 'Chrysiptera becomes generic-ready only after both verified numeric gaps are source-reviewed');
assert.equal(rowOf('sp_0057')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0057')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0057')?.authoritativeFieldCount, 8);
for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  assert.equal(rowOf(speciesId)?.fields.tank_size.status, 'reviewed_supported', `${speciesId} should inherit only the exact reviewed 200 cm base-taxon tank-length minimum`);
  assert.equal(rowOf(speciesId)?.fields.territoriality.status, 'reviewed_supported', `${speciesId} territoriality must require the new explicit Scleropages territoriality source plus its reviewed taxon/variant bridge`);
}
assert.equal(rowOf('sp_0447')?.fields.social_behavior.status, 'reviewed_supported');
assert.equal(rowOf('sp_0447')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0013')?.fields.social_behavior.status, 'reviewed_supported', 'later reviewed Otocinclus group evidence must supersede the older field-level reviewed_unknown');
assert.equal(rowOf('sp_0013')?.fields.social_behavior.authoritySource, 'catalog_field_review');
assert.equal(rowOf('sp_0013')?.fields.territoriality.status, 'reviewed_neutral_or_negative', 'explicit reviewed non-territorial Otocinclus evidence must supersede the older reviewed_unknown');
assert.equal(rowOf('sp_0013')?.fields.territoriality.authoritySource, 'catalog_field_review');
assert.equal(rowOf('sp_0013')?.fields.predation.status, 'reviewed_neutral_or_negative', 'exact Otocinclus tankmate-harm evidence must close fish predation without relying on diet inference');

const approvedValue = (speciesId: string, field: string) => getApprovedCatalogFieldReviews(speciesId).find(review => review.field === field)?.proposedValue;
assert.deepEqual(approvedValue('sp_0014', 'tank_size'), { liters: 72, lengthCm: 80 });
assert.deepEqual(approvedValue('sp_0014', 'social_behavior'), { mode: 'group', minimumGroupSize: 4 });
assert.deepEqual(approvedValue('sp_0443', 'social_behavior'), { mode: 'group', minimumGroupSize: 6 });
assert.deepEqual(approvedValue('sp_0443', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0446', 'territoriality'), { traits: ['breeding_male_territoriality'] });
assert.deepEqual(approvedValue('sp_0451', 'tank_size'), { liters: 540, lengthCm: 150 });
assert.deepEqual(approvedValue('sp_0181', 'social_behavior'), { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(approvedValue('sp_0062', 'social_behavior'), { mode: 'group', minimumGroupSize: 6 });
assert.deepEqual(approvedValue('sp_0184', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0184', 'ph'), { min: 8.1, max: 8.4 });
assert.deepEqual(approvedValue('sp_0184', 'adult_size'), { min: null, max: 10 });
assert.deepEqual(approvedValue('sp_0187', 'adult_size'), { min: null, max: 8 });
assert.deepEqual(approvedValue('sp_0187', 'tank_size'), { liters: 200, lengthCm: null });
assert.deepEqual(approvedValue('sp_0218', 'social_behavior'), { mode: 'group', minimumGroupSize: 8 });
assert.deepEqual(approvedValue('sp_0057', 'tank_size'), { liters: 250, lengthCm: null });
assert.deepEqual(approvedValue('sp_0057', 'predation'), { targets: [] });
assert.deepEqual(approvedValue('sp_0156', 'predation'), { targets: [] });
assert.equal(rowOf('sp_0156')?.genericOnboardingReady, true);
for (const speciesId of ['sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  assert.deepEqual(approvedValue(speciesId, 'tank_size'), { liters: null, lengthCm: 200 }, `${speciesId} must not invent a tank-volume minimum`);
}
assert.deepEqual(approvedValue('sp_0447', 'social_behavior'), { mode: 'group', minimumGroupSize: null });
assert.deepEqual(approvedValue('sp_0447', 'predation'), { targets: [] });
assert.deepEqual(approvedValue('sp_0447', 'territoriality'), { traits: ['breeding_territoriality'] });
assert.deepEqual(approvedValue('sp_0451', 'territoriality'), { traits: ['territorial', 'territory_defense'] });
assert.deepEqual(approvedValue('sp_0197', 'predation'), { targets: [] });
assert.deepEqual(approvedValue('sp_0438', 'territoriality'), { traits: ['male_conspecific_territoriality'] });
assert.equal(rowOf('sp_0438')?.genericOnboardingReady, true, 'reviewed swordtail territoriality plus existing reviewed tank-size/predation authority should complete the generic onboarding contract');
assert.deepEqual(
  resolveKnowledgeSources([
    'australian-government-xiphophorus-hellerii-territoriality',
    'fishbase-xiphophorus-hellerii-male-aggression',
  ]).map(source => source.id).sort(),
  [
    'australian-government-xiphophorus-hellerii-territoriality',
    'fishbase-xiphophorus-hellerii-male-aggression',
  ].sort(),
  'new exact-taxon swordtail territoriality evidence must resolve to source metadata',
);
assert.deepEqual(approvedValue('sp_0013', 'tank_size'), { liters: 60, lengthCm: null });
assert.deepEqual(approvedValue('sp_0013', 'social_behavior'), { mode: 'group', minimumGroupSize: 6 });
assert.deepEqual(approvedValue('sp_0013', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0013', 'predation'), { targets: [] }, 'direct exact-taxon tankmate-harm evidence must close Otocinclus fish-predation authority');
assert.equal(rowOf('sp_0013')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0013')?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(rowOf('sp_0013')?.actionableGapCount, 0);
assert.equal(rowOf('sp_0013')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0013')?.genericOnboardingReady, true);
assert.deepEqual(
  resolveKnowledgeSources(['fishipedia-otocinclus-vittatus-direct-husbandry']).map(source => source.id),
  ['fishipedia-otocinclus-vittatus-direct-husbandry'],
  'new exact-taxon Otocinclus evidence must resolve to source metadata',
);
assert.deepEqual(approvedValue('sp_0112', 'tank_size'), { liters: 50, lengthCm: null });
assert.deepEqual(approvedValue('sp_0115', 'temperature'), { min: 24, max: 27 });
assert.deepEqual(approvedValue('sp_0115', 'ph'), { min: 5.3, max: 6.5 });
assert.deepEqual(approvedValue('sp_0115', 'tank_size'), { liters: 50, lengthCm: null });
assert.deepEqual(approvedValue('sp_0362', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0362', 'ph'), { min: 6, max: 6.5 });
assert.deepEqual(approvedValue('sp_0362', 'adult_size'), { min: null, max: 5 });
assert.deepEqual(approvedValue('sp_0362', 'tank_size'), { liters: 80, lengthCm: null });
assert.equal(approvedValue('sp_0362', 'water'), undefined, 'Hemigrammus rodwayi freshwater authority must remain unresolved until the exact source states it directly');
assert.deepEqual(approvedValue('sp_0134', 'water'), 'freshwater');
assert.deepEqual(approvedValue('sp_0134', 'temperature'), { min: 26, max: 30 });
assert.deepEqual(approvedValue('sp_0134', 'ph'), { min: 5.5, max: 7.5 });
assert.deepEqual(approvedValue('sp_0134', 'adult_size'), { min: null, max: 5 });
assert.deepEqual(approvedValue('sp_0134', 'tank_size'), { liters: 60, lengthCm: null });
assert.deepEqual(approvedValue('sp_0458', 'water'), 'freshwater');
assert.deepEqual(approvedValue('sp_0458', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0458', 'ph'), { min: 6.8, max: 7.2 });
assert.deepEqual(approvedValue('sp_0458', 'adult_size'), { min: null, max: 14 });
assert.deepEqual(approvedValue('sp_0458', 'tank_size'), { liters: 250, lengthCm: null });
assert.deepEqual(approvedValue('sp_0473', 'temperature'), { min: 24, max: 26 });
assert.deepEqual(approvedValue('sp_0473', 'ph'), { min: 6, max: 6.8 });
assert.deepEqual(approvedValue('sp_0473', 'adult_size'), { min: null, max: 6.5 }, 'Nannostomus beckfordi adult size must conservatively retain the larger exact-page maximum');
assert.deepEqual(approvedValue('sp_0473', 'tank_size'), { liters: 80, lengthCm: null });
assert.deepEqual(approvedValue('sp_0473', 'water'), 'freshwater', 'water-direct-wave29 exact-taxon review must expose Nannostomus beckfordi freshwater authority');
const numericWave1SourceIds = [
  'fishipedia-poropanchax-normani-numeric-husbandry',
  'fishipedia-hyphessobrycon-amapaensis-numeric-husbandry',
  'fishipedia-hemigrammus-rodwayi-numeric-husbandry',
  'fishipedia-iriatherina-werneri-numeric-husbandry',
  'fishipedia-kryptopterus-vitreolus-numeric-husbandry',
  'fishipedia-nannostomus-beckfordi-numeric-husbandry',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave1SourceIds).map(source => source.id).sort(),
  [...numericWave1SourceIds].sort(),
  'numeric wave1 exact-taxon evidence must resolve to reviewed source metadata',
);
assert.deepEqual(approvedValue('sp_0041', 'temperature'), { min: 16, max: 24 });
assert.deepEqual(approvedValue('sp_0041', 'ph'), { min: 6, max: 8 });
assert.deepEqual(approvedValue('sp_0041', 'adult_size'), { min: null, max: 15 });
assert.deepEqual(approvedValue('sp_0041', 'tank_size'), { liters: 304, lengthCm: 150 });
assert.equal(approvedValue('sp_0041', 'water'), undefined);
assert.deepEqual(approvedValue('sp_0037', 'temperature'), { min: 14, max: 22 });
assert.deepEqual(approvedValue('sp_0037', 'ph'), { min: 6, max: 8 });
assert.deepEqual(approvedValue('sp_0037', 'adult_size'), { min: null, max: 27.5 });
assert.deepEqual(approvedValue('sp_0037', 'tank_size'), { liters: 648, lengthCm: 180 });
assert.equal(approvedValue('sp_0037', 'water'), undefined);
assert.deepEqual(approvedValue('sp_0128', 'temperature'), { min: 16, max: 24 });
assert.deepEqual(approvedValue('sp_0128', 'ph'), { min: 6.5, max: 8 });
assert.deepEqual(approvedValue('sp_0128', 'adult_size'), { min: null, max: 7.5 });
assert.deepEqual(approvedValue('sp_0128', 'tank_size'), { liters: 54, lengthCm: 60 });
assert.deepEqual(approvedValue('sp_0128', 'water'), 'freshwater', 'sp_0128 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');
assert.deepEqual(approvedValue('sp_0113', 'temperature'), { min: 20, max: 26 });
assert.deepEqual(approvedValue('sp_0113', 'ph'), { min: 4, max: 7 });
assert.deepEqual(approvedValue('sp_0113', 'adult_size'), { min: null, max: 3.5 });
assert.deepEqual(approvedValue('sp_0113', 'tank_size'), { liters: 41, lengthCm: 45 });
assert.deepEqual(approvedValue('sp_0113', 'water'), 'freshwater', 'sp_0113 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');
assert.deepEqual(approvedValue('sp_0470', 'temperature'), { min: 20, max: 28 });
assert.deepEqual(approvedValue('sp_0470', 'ph'), { min: 5, max: 7.5 });
assert.deepEqual(approvedValue('sp_0470', 'adult_size'), { min: null, max: 3.5 });
assert.deepEqual(approvedValue('sp_0470', 'tank_size'), { liters: 72, lengthCm: 80 });
assert.deepEqual(approvedValue('sp_0470', 'water'), 'freshwater', 'sp_0470 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');
assert.deepEqual(approvedValue('sp_0467', 'temperature'), { min: 20, max: 28 });
assert.deepEqual(approvedValue('sp_0467', 'ph'), { min: 5, max: 7 });
assert.deepEqual(approvedValue('sp_0467', 'adult_size'), { min: null, max: 3.6 });
assert.deepEqual(approvedValue('sp_0467', 'tank_size'), { liters: 72, lengthCm: 80 });
assert.deepEqual(approvedValue('sp_0467', 'water'), 'freshwater', 'sp_0467 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');
const numericWave2SourceIds = [
  'seriouslyfish-abbottina-rivularis-numeric-husbandry',
  'seriouslyfish-acheilognathus-macropterus-numeric-husbandry',
  'seriouslyfish-beaufortia-kweichowensis-numeric-husbandry',
  'seriouslyfish-epiplatys-annulatus-numeric-husbandry',
  'seriouslyfish-hyphessobrycon-herbertaxelrodi-numeric-husbandry',
  'seriouslyfish-hyphessobrycon-megalopterus-numeric-husbandry',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave2SourceIds).map(source => source.id).sort(),
  [...numericWave2SourceIds].sort(),
  'numeric wave2 exact-taxon evidence must resolve to reviewed source metadata',
);
assert.deepEqual(approvedValue('sp_0135', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0135', 'ph'), { min: 7, max: 8 });
assert.deepEqual(approvedValue('sp_0135', 'adult_size'), { min: null, max: 6 });
assert.deepEqual(approvedValue('sp_0135', 'tank_size'), { liters: 54, lengthCm: 60 });
assert.deepEqual(approvedValue('sp_0135', 'water'), 'freshwater', 'sp_0135 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');

assert.deepEqual(approvedValue('sp_0111', 'temperature'), { min: 18, max: 22 });
assert.deepEqual(approvedValue('sp_0111', 'ph'), { min: 6, max: 8 });
assert.deepEqual(approvedValue('sp_0111', 'adult_size'), { min: null, max: 3.5 });
assert.deepEqual(approvedValue('sp_0111', 'tank_size'), { liters: 54, lengthCm: 60 });
assert.deepEqual(approvedValue('sp_0111', 'water'), 'freshwater', 'sp_0111 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');

assert.deepEqual(approvedValue('sp_0132', 'water'), 'freshwater');
assert.deepEqual(approvedValue('sp_0132', 'temperature'), { min: 20, max: 30 });
assert.deepEqual(approvedValue('sp_0132', 'ph'), { min: 6.5, max: 8 });
assert.deepEqual(approvedValue('sp_0132', 'adult_size'), { min: null, max: 8 });
assert.deepEqual(approvedValue('sp_0132', 'tank_size'), { liters: 72, lengthCm: 80 });

assert.deepEqual(approvedValue('sp_0471', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0471', 'ph'), { min: 5.5, max: 7 });
assert.deepEqual(approvedValue('sp_0471', 'adult_size'), { min: null, max: 6 });
assert.deepEqual(approvedValue('sp_0471', 'tank_size'), { liters: 68, lengthCm: 60 });
assert.deepEqual(approvedValue('sp_0471', 'water'), 'freshwater', 'sp_0471 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');

for (const chocolateId of ['sp_0060', 'sp_0136']) {
  assert.deepEqual(approvedValue(chocolateId, 'temperature'), { min: 26, max: 31 });
  assert.deepEqual(approvedValue(chocolateId, 'ph'), { min: 4, max: 6.5 });
  assert.deepEqual(approvedValue(chocolateId, 'adult_size'), { min: null, max: 5 });
  assert.deepEqual(approvedValue(chocolateId, 'tank_size'), { liters: 54, lengthCm: 60 });
  assert.deepEqual(approvedValue(chocolateId, 'water'), 'freshwater', chocolateId + ' historical water unknown is superseded only by Wave27 direct FishBase evidence');
}

const numericWave3SourceIds = [
  'seriouslyfish-pseudomugil-furcatus-numeric-husbandry',
  'seriouslyfish-sawbwa-resplendens-numeric-husbandry',
  'seriouslyfish-chanda-ranga-numeric-husbandry',
  'seriouslyfish-makunaima-pittieri-numeric-husbandry',
  'seriouslyfish-sphaerichthys-osphromenoides-numeric-husbandry',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave3SourceIds).map(source => source.id).sort(),
  [...numericWave3SourceIds].sort(),
  'numeric wave3 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave4SpeciesBindings: Array<[string, string]> = [
  ['sp_0106', 'Erpetoichthys calabaricus'],
  ['sp_0061', 'Semaprochilodus insignis'],
  ['sp_0137', 'Semaprochilodus insignis'],
  ['sp_0107', 'Semaprochilodus taeniurus'],
  ['sp_0472', 'Thayeria boehlkei'],
];
for (const [speciesId, expectedScientificName] of wave4SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave4 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0106', 'temperature'), { min: 23, max: 30 });
assert.deepEqual(approvedValue('sp_0106', 'ph'), { min: 6, max: 7.5 });
assert.deepEqual(approvedValue('sp_0106', 'adult_size'), { min: null, max: 90 });
assert.deepEqual(approvedValue('sp_0106', 'tank_size'), { liters: 540, lengthCm: 150 });
assert.deepEqual(approvedValue('sp_0106', 'water'), 'freshwater', 'sp_0106 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');

for (const insignisId of ['sp_0061', 'sp_0137']) {
  assert.deepEqual(approvedValue(insignisId, 'temperature'), { min: 23, max: 29 });
  assert.deepEqual(approvedValue(insignisId, 'ph'), { min: 5.5, max: 7.2 });
  assert.deepEqual(approvedValue(insignisId, 'adult_size'), { min: null, max: 35 });
  assert.deepEqual(approvedValue(insignisId, 'tank_size'), { liters: 540, lengthCm: 150 });
  assert.deepEqual(approvedValue(insignisId, 'water'), 'freshwater', insignisId + ' historical water unknown is superseded only by Wave27 direct Fishipedia evidence');
}

assert.deepEqual(approvedValue('sp_0107', 'temperature'), { min: 23, max: 29 });
assert.deepEqual(approvedValue('sp_0107', 'ph'), { min: 5.5, max: 7.5 });
assert.deepEqual(approvedValue('sp_0107', 'adult_size'), { min: null, max: 30 });
assert.deepEqual(approvedValue('sp_0107', 'tank_size'), { liters: 540, lengthCm: 150 });
assert.deepEqual(approvedValue('sp_0107', 'water'), 'freshwater', 'sp_0107 historical water unknown is superseded only by Wave27 direct exact-taxon freshwater evidence');

assert.deepEqual(approvedValue('sp_0472', 'temperature'), { min: 22, max: 28 });
assert.deepEqual(approvedValue('sp_0472', 'adult_size'), { min: null, max: 3.6 });
assert.deepEqual(approvedValue('sp_0472', 'tank_size'), { liters: 68, lengthCm: 60 });
assert.deepEqual(approvedValue('sp_0472', 'ph'), { min: 6, max: 8 }, 'Thayeria historical pH unknown is superseded only by Wave28 concordant exact-taxon direct evidence');
assert.deepEqual(approvedValue('sp_0472', 'water'), 'freshwater', 'Thayeria historical water unknown is superseded only by Wave28 direct exact-taxon freshwater evidence');

const numericWave4SourceIds = [
  'seriouslyfish-erpetoichthys-calabaricus-numeric-husbandry',
  'seriouslyfish-semaprochilodus-insignis-numeric-husbandry',
  'seriouslyfish-semaprochilodus-taeniurus-numeric-husbandry',
  'seriouslyfish-thayeria-boehlkei-numeric-husbandry',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave4SourceIds).map(source => source.id).sort(),
  [...numericWave4SourceIds].sort(),
  'numeric wave4 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave5SpeciesBindings: Array<[string, string]> = [
  ['sp_0186', 'Chaetodon auriga'],
  ['sp_0025', 'Pterapogon kauderni'],
];
for (const [speciesId, expectedScientificName] of wave5SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave5 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0186', 'water'), 'saltwater');
assert.deepEqual(approvedValue('sp_0186', 'temperature'), { min: 23, max: 27 });
assert.deepEqual(approvedValue('sp_0186', 'adult_size'), { min: null, max: 23 });
assert.equal(approvedValue('sp_0186', 'ph'), undefined, 'Chaetodon auriga aquarium pH must remain unresolved without direct species-specific authority');
assert.equal(approvedValue('sp_0186', 'tank_size'), undefined, 'Chaetodon auriga minimum tank size must remain unresolved without direct species-specific authority');

assert.deepEqual(approvedValue('sp_0025', 'water'), 'saltwater');
assert.deepEqual(approvedValue('sp_0025', 'temperature'), { min: 25, max: 28 });
assert.deepEqual(approvedValue('sp_0025', 'ph'), { min: 8.2, max: 8.4 });
assert.deepEqual(approvedValue('sp_0025', 'adult_size'), { min: null, max: 8 });
assert.deepEqual(approvedValue('sp_0025', 'tank_size'), { liters: 150, lengthCm: null });

const numericWave5SourceIds = [
  'fishipedia-chaetodon-auriga-numeric-husbandry',
  'fishipedia-pterapogon-kauderni-numeric-husbandry',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave5SourceIds).map(source => source.id).sort(),
  [...numericWave5SourceIds].sort(),
  'numeric wave5 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave6SpeciesBindings: Array<[string, string]> = [
  ['sp_0042', 'Pseudorasbora parva'],
  ['sp_0052', 'Corydoras hastatus'],
];
for (const [speciesId, expectedScientificName] of wave6SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave6 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0042', 'temperature'), { min: 5, max: 22 });
assert.deepEqual(approvedValue('sp_0042', 'ph'), { min: 6, max: 7 });
assert.deepEqual(approvedValue('sp_0042', 'tank_size'), { liters: 200, lengthCm: null });
assert.deepEqual(approvedValue('sp_0042', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0042', 'predation'), { targets: ['fish_fry'] }, 'later peer-reviewed evidence may close Pseudorasbora predation only at the narrow fish-fry scope');
assert.ok(!(approvedValue('sp_0042', 'predation') as { targets: string[] }).targets.includes('small_fish'), 'fish-egg/fry evidence must never be widened to generic small-fish predation');

assert.deepEqual(approvedValue('sp_0052', 'tank_size'), { liters: 54, lengthCm: 60 });
assert.deepEqual(approvedValue('sp_0052', 'territoriality'), { traits: [] }, 'Corydoras hastatus may close territoriality only from direct exact-taxon non-territorial evidence');
assert.deepEqual(approvedValue('sp_0052', 'predation'), { targets: ['fish_fry'] }, 'Corydoras hastatus must not close predation from diet wording alone, but later direct peer-reviewed fry-consumption evidence may close the narrow fish-fry scope');

const numericWave6SourceIds = [
  'fishipedia-pseudorasbora-parva-wave6',
  'seriouslyfish-gastrodermus-hastatus-wave6',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave6SourceIds).map(source => source.id).sort(),
  [...numericWave6SourceIds].sort(),
  'numeric wave6 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave7SpeciesBindings: Array<[string, string]> = [
  ['sp_0118', 'Osteoglossum ferreirai'],
];
for (const [speciesId, expectedScientificName] of wave7SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave7 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0118', 'tank_size'), { liters: 4500, lengthCm: 500 });
assert.deepEqual(approvedValue('sp_0118', 'territoriality'), { traits: [] });
assert.equal(rowOf('sp_0118')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0118')?.genericOnboardingReady, true, 'Osteoglossum ferreirai must become generic-ready once all 8 reviewed core facts are declared');

const numericWave7SourceIds = [
  'fishipedia-osteoglossum-ferreirai-wave7',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave7SourceIds).map(source => source.id).sort(),
  [...numericWave7SourceIds].sort(),
  'numeric wave7 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave8SpeciesBindings: Array<[string, string]> = [
  ['sp_0026', 'Hypostomus plecostomus'],
];
for (const [speciesId, expectedScientificName] of wave8SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave8 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0026', 'tank_size'), { liters: 600, lengthCm: null });
assert.deepEqual(approvedValue('sp_0026', 'social_behavior'), { mode: 'variable', minimumGroupSize: null });
assert.deepEqual(approvedValue('sp_0026', 'territoriality'), { traits: ['male_conspecific_territoriality'] });
assert.deepEqual(approvedValue('sp_0026', 'predation'), { targets: [] });
assert.equal(rowOf('sp_0026')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0026')?.genericOnboardingReady, true, 'Hypostomus plecostomus must become generic-ready after the four exact-taxon Wave8 gaps close');

const numericWave8SourceIds = [
  'fishipedia-hypostomus-plecostomus-wave8',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave8SourceIds).map(source => source.id).sort(),
  [...numericWave8SourceIds].sort(),
  'numeric wave8 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave9SpeciesBindings: Array<[string, string]> = [
  ['sp_0019', 'Pterophyllum altum'],
];
for (const [speciesId, expectedScientificName] of wave9SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave9 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0019', 'tank_size'), { liters: 600, lengthCm: null });
assert.deepEqual(approvedValue('sp_0019', 'territoriality'), { traits: ['territorial', 'breeding_territoriality'] });
assert.equal(rowOf('sp_0019')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0019')?.genericOnboardingReady, true, 'Pterophyllum altum must become generic-ready after the final two exact-taxon gaps close');

const numericWave9SourceIds = [
  'fishipedia-pterophyllum-altum-wave9',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave9SourceIds).map(source => source.id).sort(),
  [...numericWave9SourceIds].sort(),
  'numeric wave9 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave10SpeciesBindings: Array<[string, string]> = [
  ['sp_0453', 'Pterois volitans'],
];
for (const [speciesId, expectedScientificName] of wave10SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave10 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0453', 'temperature'), { min: 22, max: 26 });
assert.deepEqual(approvedValue('sp_0453', 'ph'), { min: 8.2, max: 8.4 });
assert.deepEqual(approvedValue('sp_0453', 'tank_size'), { liters: 1200, lengthCm: null });
assert.deepEqual(approvedValue('sp_0453', 'territoriality'), { traits: [] });
assert.equal(rowOf('sp_0453')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0453')?.genericOnboardingReady, true, 'Pterois volitans must become generic-ready after the four exact-taxon Wave10 gaps close');

const numericWave10SourceIds = [
  'fishipedia-pterois-volitans-wave10',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave10SourceIds).map(source => source.id).sort(),
  [...numericWave10SourceIds].sort(),
  'numeric wave10 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave11SpeciesBindings: Array<[string, string]> = [
  ['sp_0183', 'Xanthichthys mento'],
];
for (const [speciesId, expectedScientificName] of wave11SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave11 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0183', 'temperature'), { min: 22.2, max: 25.6 });
assert.deepEqual(approvedValue('sp_0183', 'ph'), { min: 8.1, max: 8.4 });
assert.deepEqual(approvedValue('sp_0183', 'tank_size'), { liters: 681, lengthCm: null });
assert.deepEqual(approvedValue('sp_0183', 'territoriality'), { traits: ['breeding_territoriality'] });
assert.equal(rowOf('sp_0183')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0183')?.genericOnboardingReady, true, 'Xanthichthys mento must become generic-ready after the four exact-taxon Wave11 gaps close');

const numericWave11SourceIds = [
  'saltcorner-xanthichthys-mento-wave11',
  'liveaquaria-xanthichthys-mento-wave11',
  'kawase-2003-xanthichthys-mento-spawning-territory',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave11SourceIds).map(source => source.id).sort(),
  [...numericWave11SourceIds].sort(),
  'numeric wave11 evidence must resolve to reviewed source metadata',
);
const wave12SpeciesBindings: Array<[string, string]> = [
  ['sp_0013', 'Otocinclus vittatus'],
];
for (const [speciesId, expectedScientificName] of wave12SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave12 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0013', 'predation'), { targets: [] });
assert.equal(rowOf('sp_0013')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0013')?.genericOnboardingReady, true);

const numericWave12SourceIds = [
  'aquainfo-otocinclus-vittatus-wave12',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave12SourceIds).map(source => source.id).sort(),
  [...numericWave12SourceIds].sort(),
  'numeric wave12 exact-taxon evidence must resolve to reviewed source metadata',
);
const wave13SpeciesBindings: Array<[string, string]> = [
  ['sp_0042', 'Pseudorasbora parva'],
];
for (const [speciesId, expectedScientificName] of wave13SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave13 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0042', 'predation'), { targets: ['fish_fry'] });
assert.equal(rowOf('sp_0042')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0042')?.genericOnboardingReady, true, 'Pseudorasbora parva must become generic-ready once fry-only predation scope is reviewed');

const numericWave13SourceIds = [
  'wiley-pseudorasbora-parva-fry-predation-wave13',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave13SourceIds).map(source => source.id).sort(),
  [...numericWave13SourceIds].sort(),
  'numeric wave13 peer-reviewed predation evidence must resolve to reviewed source metadata',
);
const wave14SpeciesBindings: Array<[string, string]> = [
  ['sp_0022', 'Lutjanus kasmira'],
];
for (const [speciesId, expectedScientificName] of wave14SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave14 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0022', 'temperature'), { min: 22.2, max: 25.6 });
assert.deepEqual(approvedValue('sp_0022', 'ph'), { min: 8.1, max: 8.4 });
assert.deepEqual(approvedValue('sp_0022', 'tank_size'), { liters: 1136, lengthCm: null });
assert.deepEqual(approvedValue('sp_0022', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0022', 'predation'), { targets: ['small_fish'] });
assert.equal(rowOf('sp_0022')?.authoritativeFieldCount, 8);
assert.equal(rowOf('sp_0022')?.genericOnboardingReady, true, 'Lutjanus kasmira must become generic-ready after the five exact-taxon Wave14 gaps close');

const numericWave14SourceIds = [
  'fishipedia-lutjanus-kasmira-wave14',
  'liveaquaria-lutjanus-kasmira-wave14',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave14SourceIds).map(source => source.id).sort(),
  [...numericWave14SourceIds].sort(),
  'numeric wave14 exact-taxon evidence must resolve to reviewed source metadata',
);
const numericWave15SpeciesBindings: Array<[string, string]> = [
  ['sp_0052', 'Corydoras hastatus'],
  ['sp_0062', 'Moenkhausia sanctaefilomenae'],
  ['sp_0125', 'Hypancistrus inspector'],
];
for (const [speciesId, expectedScientificName] of numericWave15SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'numeric wave15 speciesId must stay bound to the exact reviewed taxon: ' + speciesId,
  );
}

assert.deepEqual(approvedValue('sp_0052', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0062', 'territoriality'), { traits: [] });
assert.deepEqual(approvedValue('sp_0125', 'territoriality'), { traits: ['territorial'] });
for (const speciesId of ['sp_0062', 'sp_0125']) {
  assert.equal(approvedValue(speciesId, 'predation'), undefined, speciesId + ' predation must remain fail-closed without direct fish-prey authority');
  assert.equal(rowOf(speciesId)?.authoritativeFieldCount, 7, speciesId + ' must remain 7/8 while predation is unresolved');
  assert.equal(rowOf(speciesId)?.genericOnboardingReady, false, speciesId + ' must not become generic-ready while predation remains unresolved');
}
const numericWave15SourceIds = [
  'fishipedia-corydoras-hastatus-wave15',
  'fishipedia-moenkhausia-sanctaefilomenae-wave15',
  'fishipedia-hypancistrus-inspector-wave15',
];
assert.deepEqual(
  resolveKnowledgeSources(numericWave15SourceIds).map(source => source.id).sort(),
  [...numericWave15SourceIds].sort(),
  'numeric wave15 exact-taxon territoriality evidence must resolve to reviewed source metadata',
);
const predationWave16SpeciesBindings: Array<[string, string]> = [
  ['sp_0052', 'Corydoras hastatus'],
  ['sp_0151', 'Gymnocorymbus ternetzi var. Color morph'],
];
for (const [speciesId, expectedScientificName] of predationWave16SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'predation wave16 speciesId must stay bound to the reviewed exact taxon/catalog morph: ' + speciesId,
  );
}
assert.deepEqual(approvedValue('sp_0052', 'predation'), { targets: ['fish_fry'] });
assert.deepEqual(approvedValue('sp_0151', 'predation'), { targets: ['fish_fry'] });
for (const speciesId of ['sp_0052', 'sp_0151']) {
  assert.equal(rowOf(speciesId)?.authoritativeFieldCount, 8, speciesId + ' must become 8/8 after narrow fry-predation authority closes the final gap');
  assert.equal(rowOf(speciesId)?.genericOnboardingReady, true, speciesId + ' must become generic-ready after the final reviewed field closes');
}
assert.deepEqual(
  approvedValue('sp_0011', 'predation'),
  { targets: [] },
  'sp_0011 historical Wave16 unknown may be superseded only by the later Wave26 direct no-fry-predation authority',
);
assert.equal(rowOf('sp_0011')?.authoritativeFieldCount, 8, 'sp_0011 must become 8/8 only after the later direct predation review');
assert.equal(rowOf('sp_0011')?.genericOnboardingReady, true, 'sp_0011 may enter generic onboarding only after all eight reviewed facts are declared');
for (const speciesId of ['sp_0062', 'sp_0125', 'sp_0433']) {
  assert.equal(approvedValue(speciesId, 'predation'), undefined, speciesId + ' predation must remain fail-closed because direct scope is still conflicting or incomplete');
  assert.equal(rowOf(speciesId)?.authoritativeFieldCount, 7, speciesId + ' must remain exactly 7/8');
  assert.equal(rowOf(speciesId)?.genericOnboardingReady, false, speciesId + ' must stay out of generic onboarding until predation is directly resolved');
}
const predationWave16SourceIds = [
  'jaalas-corydoras-hastatus-fry-predation-wave16',
  'tfh-gymnocorymbus-ternetzi-fry-predation-wave16',
];
assert.deepEqual(
  resolveKnowledgeSources(predationWave16SourceIds).map(source => source.id).sort(),
  [...predationWave16SourceIds].sort(),
  'predation wave16 fry-scoped evidence must resolve to reviewed source metadata',
);
const highImpactWave17SpeciesBindings: Array<[string, string]> = [
  ['sp_0069', 'Cyprinus carpio var.'],
  ['sp_0070', 'Cyprinus carpio var. Longfin'],
];
for (const [speciesId, expectedScientificName] of highImpactWave17SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'high-impact wave17 catalog object must retain its reviewed ornamental Cyprinus identity: ' + speciesId,
  );
  assert.deepEqual(approvedValue(speciesId, 'temperature'), { min: 17.8, max: 23.9 });
  assert.deepEqual(approvedValue(speciesId, 'ph'), { min: 7, max: 8.6 });
  assert.deepEqual(approvedValue(speciesId, 'adult_size'), { min: null, max: 91.4 });
  assert.deepEqual(approvedValue(speciesId, 'territoriality'), { traits: [] });
  assert.deepEqual(approvedValue(speciesId, 'predation'), { targets: ['small_fish'] });
  assert.equal(rowOf(speciesId)?.authoritativeFieldCount, 8, speciesId + ' must become 8/8 after the reviewed koi variant bridge closes all five remaining fields');
  assert.equal(rowOf(speciesId)?.genericOnboardingReady, true, speciesId + ' must become generic-ready after Wave17');
}
const highImpactWave17SourceIds = [
  'petmd-koi-husbandry-wave17',
  'fishipedia-cyprinus-carpio-wave17',
  'plos-cyprinus-carpio-small-fish-predation-wave17',
];
assert.deepEqual(
  resolveKnowledgeSources(highImpactWave17SourceIds).map(source => source.id).sort(),
  [...highImpactWave17SourceIds].sort(),
  'high-impact wave17 koi husbandry, territoriality and rare small-fish predation evidence must resolve to reviewed source metadata',
);
const highImpactWave18SpeciesBindings: Array<[string, string]> = [
  ['sp_0038', 'Opsariichthys bidens'],
  ['sp_0130', 'Opsariichthys bidens'],
];
for (const [speciesId, expectedScientificName] of highImpactWave18SpeciesBindings) {
  assert.equal(
    fishData.find(fish => fish.id === speciesId)?.scientificName,
    expectedScientificName,
    'high-impact wave18 duplicate catalog object must remain bound to exact Opsariichthys bidens: ' + speciesId,
  );
  assert.deepEqual(approvedValue(speciesId, 'temperature'), { min: 18, max: 25 });
  assert.deepEqual(approvedValue(speciesId, 'ph'), { min: 7, max: 8 });
  assert.equal(approvedValue(speciesId, 'tank_size'), undefined, speciesId + ' must not invent a household tank minimum from production or experimental vessel dimensions');
  assert.equal(approvedValue(speciesId, 'territoriality'), undefined, speciesId + ' must not translate aggression or dominance hierarchy into territoriality');
  const row = rowOf(speciesId);
  assert.equal(row?.authoritativeFieldCount, 6);
  assert.equal(row?.actionableGapCount, 0);
  assert.equal(row?.terminalGapCount, 2);
  assert.equal(row?.genericOnboardingReady, false);
  assert.equal(row?.fields.tank_size.disposition, 'terminal_hold');
  assert.equal(row?.fields.tank_size.authoritySource, 'evidence_ceiling');
  assert.equal(row?.fields.tank_size.reasonCode, 'species_space_minimum_not_established');
  assert.equal(row?.fields.territoriality.disposition, 'terminal_hold');
  assert.equal(row?.fields.territoriality.authoritySource, 'evidence_ceiling');
  assert.equal(row?.fields.territoriality.reasonCode, 'species_territoriality_not_established');
  assert.equal(backlog.some(item => item.speciesId === speciesId), false, speciesId + ' must leave ordinary research backlog after all remaining gaps become terminal evidence holds');
}
const highImpactWave18SourceIds = ['cnipa-opsariichthys-bidens-parent-culture-wave18'];
assert.deepEqual(
  resolveKnowledgeSources(highImpactWave18SourceIds).map(source => source.id).sort(),
  [...highImpactWave18SourceIds].sort(),
  'high-impact wave18 exact-taxon managed husbandry evidence must resolve to reviewed source metadata',
);
assert.equal(fishData.find(fish => fish.id === 'sp_0051')?.scientificName, 'Acrossocheilus fasciatus');
assert.deepEqual(approvedValue('sp_0051', 'ph'), { min: 7.2, max: 7.8 });
for (const field of ['temperature', 'tank_size', 'territoriality', 'predation'] as const) {
  assert.equal(approvedValue('sp_0051', field), undefined, 'sp_0051 must not force-promote terminally unresolved field ' + field);
}
const acrossocheilusRow = rowOf('sp_0051');
assert.equal(acrossocheilusRow?.authoritativeFieldCount, 4);
assert.equal(acrossocheilusRow?.actionableGapCount, 0);
assert.equal(acrossocheilusRow?.terminalGapCount, 4);
assert.equal(acrossocheilusRow?.genericOnboardingReady, false);
assert.equal(acrossocheilusRow?.fields.temperature.reasonCode, 'species_temperature_husbandry_not_established');
assert.equal(acrossocheilusRow?.fields.tank_size.reasonCode, 'species_space_minimum_not_established');
assert.equal(acrossocheilusRow?.fields.territoriality.reasonCode, 'species_territoriality_not_established');
assert.equal(acrossocheilusRow?.fields.predation.reasonCode, 'species_fish_predation_not_established');
for (const field of ['temperature', 'tank_size', 'territoriality', 'predation'] as const) {
  assert.equal(acrossocheilusRow?.fields[field].disposition, 'terminal_hold');
  assert.equal(acrossocheilusRow?.fields[field].authoritySource, 'evidence_ceiling');
}
assert.equal(backlog.some(item => item.speciesId === 'sp_0051'), false, 'sp_0051 must leave ordinary backlog after all unresolved fields receive explicit evidence ceilings');
assert.equal(taxonResearchPlan.find(item => item.baseScientificName === 'Acrossocheilus fasciatus'), undefined, 'Acrossocheilus fasciatus must leave the actionable taxon plan after targeted evidence review reaches terminal boundaries');
const highImpactWave19SourceIds = [
  'cnipa-acrossocheilus-fasciatus-growout-wave19',
  'cnipa-acrossocheilus-fasciatus-breeding-wave19',
  'jwas-acrossocheilus-fasciatus-temperature-wave19',
  'dlou-acrossocheilus-fasciatus-diet-wave19',
];
assert.deepEqual(
  resolveKnowledgeSources(highImpactWave19SourceIds).map(source => source.id).sort(),
  [...highImpactWave19SourceIds].sort(),
  'high-impact wave19 grow-out, breeding, temperature-study and diet evidence must resolve to reviewed source metadata',
);
assert.deepEqual(approvedValue('sp_0173', 'temperature'), { min: 22, max: 28 });
assert.deepEqual(approvedValue('sp_0173', 'ph'), { min: 6, max: 7.5 });
assert.deepEqual(approvedValue('sp_0173', 'tank_size'), { liters: null, lengthCm: 610 });
assert.equal(approvedValue('sp_0173', 'territoriality'), undefined, 'sp_0173 aggression must not be translated into territoriality without direct territory evidence');
const salminusRow = rowOf('sp_0173');
assert.equal(salminusRow?.authoritativeFieldCount, 7);
assert.equal(salminusRow?.actionableGapCount, 0);
assert.equal(salminusRow?.terminalGapCount, 1);
assert.equal(salminusRow?.genericOnboardingReady, false);
assert.equal(salminusRow?.fields.territoriality.disposition, 'terminal_hold');
assert.equal(salminusRow?.fields.territoriality.authoritySource, 'evidence_ceiling');
assert.equal(salminusRow?.fields.territoriality.reasonCode, 'species_territoriality_not_established');
assert.equal(backlog.some(item => item.speciesId === 'sp_0173'), false, 'sp_0173 must leave ordinary backlog after the final unresolved field is terminally classified');
assert.equal(taxonResearchPlan.find(item => item.baseScientificName === 'Salminus brasiliensis'), undefined, 'Salminus brasiliensis must leave the actionable taxon plan after Wave20');
const highImpactWave20SourceIds = [
  'wave05-seriouslyfish-salminus-brasiliensis',
  'wave05-fishbase-salminus-brasiliensis',
  'aquaculture-international-salminus-aggression-wave20',
];
assert.deepEqual(
  resolveKnowledgeSources(highImpactWave20SourceIds).map(source => source.id).sort(),
  [...highImpactWave20SourceIds].sort(),
  'high-impact wave20 husbandry plus peer-reviewed aggression evidence must resolve to reviewed source metadata',
);
const newSourceIds = ['animaldiversity-astronotus-ocellatus-behavior', 'icar-cifa-channa-stewartii-live-fish'];
assert.deepEqual(resolveKnowledgeSources(newSourceIds).map(source => source.id).sort(), [...newSourceIds].sort(), 'new Fast Lane evidence must resolve to source metadata');
for (const field of fields) {
  assert.equal(Object.values(summary.fieldCounts[field]).reduce((sum, value) => sum + value, 0), rows.length);
}
for (const row of rows) {
  assert.equal(Object.keys(row.fields).length, fields.length);
  if (row.genericOnboardingReady) {
    assert.equal(row.lifeType, 'fish');
    assert.notEqual(row.reviewedProfile, 'none');
    assert.equal(row.authoritativeFieldCount, fields.length);
    assert.ok(fields.every(field => ['reviewed_supported', 'reviewed_neutral_or_negative'].includes(row.fields[field].status)));
  }
  if (row.lifeType === 'hardscape') assert.ok(fields.every(field => row.fields[field].status === 'not_applicable'));
  else if (row.lifeType !== 'fish') {
    assert.ok(fields.every(field => row.fields[field].status === 'missing_identity_or_domain'));
    assert.equal(row.genericOnboardingReady, false);
  }
}
assert.ok(backlog.length > 0);
assert.ok(backlog.every(item => ['reviewed_unknown', 'needs_research'].includes(item.status)));
assert.ok(backlog.every(item => rows.find(row => row.speciesId === item.speciesId)?.fields[item.field].disposition === 'targeted_source_expansion'));
assert.ok(backlog.every((item, index) => item.rank === index + 1));
assert.ok(!backlog.some(item => getLifeType(fishData.find(fish => fish.id === item.speciesId)!) !== 'fish'));
assert.ok(summary.fieldActionableGaps.every((item, index, all) => index === 0 || all[index - 1].count >= item.count));
assert.equal(taxonResearchPlan.length, 18, '99 actionable field gaps should collapse to 18 current taxon research jobs after terminalized variant evidence gaps are excluded');
const plannedCatalogObjects = new Set(taxonResearchPlan.flatMap(item => item.catalogObjects.map(object => object.speciesId)));
assert.equal(plannedCatalogObjects.size, 28, 'terminalized variant evidence gaps must leave only currently actionable catalog objects in the taxon research plan');
const plannedGapKeys = taxonResearchPlan.flatMap(item => item.catalogObjects.flatMap(object => object.gaps.map(field => `${object.speciesId}:${field}`))).sort();
const backlogGapKeys = backlog.map(item => `${item.speciesId}:${item.field}`).sort();
assert.deepEqual(plannedGapKeys, backlogGapKeys, 'taxon research plan must represent every actionable field gap exactly once');
assert.ok(taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).every(item => item.promotionPolicy.includes('must never auto-promote')), 'variant-bearing taxon jobs must explicitly forbid automatic authority inheritance');
assert.ok(taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).every(item => item.researchDisposition === 'base_taxon_candidate_research_with_variant_bridge'));
assert.ok(taxonResearchPlan.filter(item => item.unresolvedObjectCount > 0).every(item => item.researchDisposition === 'identity_resolution_required' && item.baseScientificName === null));
for (const closedVariantTaxon of ['Carassius auratus', 'Betta splendens', 'Channa argus', 'Channa asiatica', 'Crossocheilus langei', 'Danio rerio', 'Melanotaenia praecox', 'Pangio kuhlii', 'Synchiropus splendidus', 'Trichopodus leerii']) {
  assert.equal(taxonResearchPlan.find(item => item.baseScientificName === closedVariantTaxon), undefined, `${closedVariantTaxon} must not re-enter ordinary research after reviewed variant evidence ceiling`);
}
const opsariichthysTaxonJob = taxonResearchPlan.find(item => item.baseScientificName === 'Opsariichthys bidens');
assert.equal(opsariichthysTaxonJob, undefined, 'Opsariichthys bidens must leave the actionable taxon research plan once its supported fields are promoted and the two remaining fields are terminally classified');

const koiBetta = rowOf('sp_0258');
assert.equal(koiBetta?.fields.tank_size.disposition, 'terminal_hold');
assert.equal(koiBetta?.fields.tank_size.authoritySource, 'variant_evidence_ceiling');
assert.equal(koiBetta?.fields.tank_size.reasonCode, 'variant_field_bridge_research_exhausted');
const platinumChanna = rowOf('sp_0224');
assert.equal(platinumChanna?.actionableGapCount, 0);
assert.equal(platinumChanna?.fields.ph.authoritySource, 'variant_evidence_ceiling');
assert.equal(platinumChanna?.fields.tank_size.authoritySource, 'variant_evidence_ceiling');
for (const terminalVariantId of ['sp_0295', 'sp_0413', 'sp_0419']) {
  assert.equal(rowOf(terminalVariantId)?.actionableGapCount, 0, `${terminalVariantId} variant identity ceiling must suppress repeated ordinary research`);
}

const matrixArtifact = JSON.parse(readFileSync('docs/compatibility_core_field_coverage.json', 'utf8')) as Record<string, unknown> & { rows: unknown[] };
const backlogArtifact = JSON.parse(readFileSync('docs/compatibility_core_field_backlog.json', 'utf8')) as Record<string, unknown> & { items: unknown[] };
const fastLaneArtifact = JSON.parse(readFileSync('docs/compatibility_fast_lane_research_packets.json', 'utf8')) as Record<string, unknown> & { packets: unknown[] };
const taxonResearchArtifact = JSON.parse(readFileSync('docs/compatibility_taxon_research_plan.json', 'utf8')) as Record<string, unknown> & { items: unknown[] };
assert.equal(matrixArtifact.generatedAt, undefined);
assert.equal(backlogArtifact.generatedAt, undefined);
assert.equal(fastLaneArtifact.generatedAt, undefined);
assert.equal(taxonResearchArtifact.generatedAt, undefined);
assert.equal(matrixArtifact.speciesCount, summary.speciesCount);
assert.equal(matrixArtifact.coreFieldCompleteSpecies, summary.coreFieldCompleteSpecies);
assert.equal(matrixArtifact.genericOnboardingReadySpecies, summary.genericOnboardingReadySpecies);
assert.deepEqual(matrixArtifact.fieldActionableGaps, summary.fieldActionableGaps);
assert.deepEqual(matrixArtifact.rows, rows, 'source-controlled core-field matrix must be regenerated with current authority');
assert.equal(backlogArtifact.totalItems, backlog.length);
assert.deepEqual(backlogArtifact.items, backlog, 'source-controlled field backlog must be regenerated with current authority');
assert.equal(fastLaneArtifact.totalPackets, fastLanePackets.length);
assert.deepEqual(fastLaneArtifact.packets, fastLanePackets, 'Fast Lane research packets must be regenerated with current authority');
assert.equal(taxonResearchArtifact.totalResearchJobs, taxonResearchPlan.length);
assert.equal(taxonResearchArtifact.catalogObjects, plannedCatalogObjects.size);
assert.deepEqual(taxonResearchArtifact.items, taxonResearchPlan, 'source-controlled taxon research plan must be regenerated with current actionable backlog');
assert.ok(fastLanePackets.every(packet => packet.existingEvidenceIds.length > 0), 'near-ready research packet must preserve existing provenance');
assert.ok(fastLanePackets.every(packet => packet.existingSources.length > 0), 'near-ready research packet must resolve existing field provenance to source metadata');
const channaDiplogramma = rowOf('sp_0198');
assert.ok(channaDiplogramma, 'sp_0198 coverage row must exist');
assert.equal(channaDiplogramma.fields.tank_size.status, 'reviewed_unknown');
assert.equal(channaDiplogramma.fields.tank_size.disposition, 'terminal_hold');
assert.equal(channaDiplogramma.fields.tank_size.authoritySource, 'evidence_ceiling');
assert.equal(channaDiplogramma.fields.tank_size.reasonCode, 'species_space_minimum_conflicted');
assert.equal(fastLanePackets.find(item => item.speciesId === 'sp_0198'), undefined, 'sp_0198 must leave Fast Lane after its exact-taxon numeric minimum is classified as a terminal evidence conflict');
assert.equal(backlog.find(item => item.speciesId === 'sp_0198' && item.field === 'tank_size'), undefined, 'terminal evidence conflict must not be repeatedly queued as ordinary actionable research');

for (const speciesId of ['sp_0105', 'sp_0468', 'sp_0197', 'sp_0447', 'sp_0451', 'sp_0054', 'sp_0012', 'sp_0103', 'sp_0104', 'sp_0116', 'sp_0283']) {
  assert.equal(fastLanePackets.find(item => item.speciesId === speciesId), undefined, `${speciesId} must leave Fast Lane only after its final core field is resolved or terminally classified`);
  if (speciesId !== 'sp_0198') assert.equal(rowOf(speciesId)?.authoritativeFieldCount, 8, `${speciesId} must have 8/8 authoritative core fields after Fast Lane closure`);
}
assert.deepEqual(
  fastLanePackets.map(packet => [packet.speciesId, packet.missingField]),
  [
    ['sp_0023', 'predation'],
    ['sp_0062', 'predation'],
    ['sp_0125', 'predation'],
    ['sp_0433', 'predation'],
    ['sp_0475', 'predation'],
  ],
  'Fast Lane must retain only currently unresolved one-field predation cases after Pomacanthus annularis pH is closed by reviewed exact-taxon ADW evidence',
);
console.log(`Compatibility core-field coverage PASS: ${rows.length} catalog objects × ${fields.length} fields; ${summary.genericOnboardingReadySpecies} generic-ready; ${backlog.length} actionable field gaps; terminal/domain holds excluded.`);

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
assert.equal(rowOf('sp_0187')?.fields.adult_size.status, 'reviewed_unknown', 'do not promote new Chrysiptera adult-size authority from the migration-owned AI-generated page');
assert.equal(rowOf('sp_0187')?.fields.tank_size.status, 'reviewed_unknown', 'do not promote new Chrysiptera tank-size authority from the migration-owned AI-generated page');
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
assert.equal(rowOf('sp_0013')?.fields.predation.status, 'reviewed_unknown', 'predation vulnerability must not be treated as evidence that Otocinclus preys on tankmates');

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
assert.equal(approvedValue('sp_0013', 'predation'), undefined, 'Otocinclus fish-predation authority must remain unresolved until direct prey-risk evidence exists');
assert.equal(rowOf('sp_0013')?.fields.tank_size.status, 'reviewed_supported');
assert.equal(rowOf('sp_0013')?.fields.predation.status, 'reviewed_unknown');
assert.equal(rowOf('sp_0013')?.actionableGapCount, 1);
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
assert.equal(approvedValue('sp_0473', 'water'), undefined, 'Nannostomus beckfordi freshwater authority must remain unresolved until the exact source states it directly');
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
assert.equal(approvedValue('sp_0128', 'water'), undefined);
assert.deepEqual(approvedValue('sp_0113', 'temperature'), { min: 20, max: 26 });
assert.deepEqual(approvedValue('sp_0113', 'ph'), { min: 4, max: 7 });
assert.deepEqual(approvedValue('sp_0113', 'adult_size'), { min: null, max: 3.5 });
assert.deepEqual(approvedValue('sp_0113', 'tank_size'), { liters: 41, lengthCm: 45 });
assert.equal(approvedValue('sp_0113', 'water'), undefined);
assert.deepEqual(approvedValue('sp_0470', 'temperature'), { min: 20, max: 28 });
assert.deepEqual(approvedValue('sp_0470', 'ph'), { min: 5, max: 7.5 });
assert.deepEqual(approvedValue('sp_0470', 'adult_size'), { min: null, max: 3.5 });
assert.deepEqual(approvedValue('sp_0470', 'tank_size'), { liters: 72, lengthCm: 80 });
assert.equal(approvedValue('sp_0470', 'water'), undefined);
assert.deepEqual(approvedValue('sp_0467', 'temperature'), { min: 20, max: 28 });
assert.deepEqual(approvedValue('sp_0467', 'ph'), { min: 5, max: 7 });
assert.deepEqual(approvedValue('sp_0467', 'adult_size'), { min: null, max: 3.6 });
assert.deepEqual(approvedValue('sp_0467', 'tank_size'), { liters: 72, lengthCm: 80 });
assert.equal(approvedValue('sp_0467', 'water'), undefined);
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
assert.equal(approvedValue('sp_0135', 'water'), undefined);

assert.deepEqual(approvedValue('sp_0111', 'temperature'), { min: 18, max: 22 });
assert.deepEqual(approvedValue('sp_0111', 'ph'), { min: 6, max: 8 });
assert.deepEqual(approvedValue('sp_0111', 'adult_size'), { min: null, max: 3.5 });
assert.deepEqual(approvedValue('sp_0111', 'tank_size'), { liters: 54, lengthCm: 60 });
assert.equal(approvedValue('sp_0111', 'water'), undefined);

assert.deepEqual(approvedValue('sp_0132', 'water'), 'freshwater');
assert.deepEqual(approvedValue('sp_0132', 'temperature'), { min: 20, max: 30 });
assert.deepEqual(approvedValue('sp_0132', 'ph'), { min: 6.5, max: 8 });
assert.deepEqual(approvedValue('sp_0132', 'adult_size'), { min: null, max: 8 });
assert.deepEqual(approvedValue('sp_0132', 'tank_size'), { liters: 72, lengthCm: 80 });

assert.deepEqual(approvedValue('sp_0471', 'temperature'), { min: 24, max: 28 });
assert.deepEqual(approvedValue('sp_0471', 'ph'), { min: 5.5, max: 7 });
assert.deepEqual(approvedValue('sp_0471', 'adult_size'), { min: null, max: 6 });
assert.deepEqual(approvedValue('sp_0471', 'tank_size'), { liters: 68, lengthCm: 60 });
assert.equal(approvedValue('sp_0471', 'water'), undefined);

for (const chocolateId of ['sp_0060', 'sp_0136']) {
  assert.deepEqual(approvedValue(chocolateId, 'temperature'), { min: 26, max: 31 });
  assert.deepEqual(approvedValue(chocolateId, 'ph'), { min: 4, max: 6.5 });
  assert.deepEqual(approvedValue(chocolateId, 'adult_size'), { min: null, max: 5 });
  assert.deepEqual(approvedValue(chocolateId, 'tank_size'), { liters: 54, lengthCm: 60 });
  assert.equal(approvedValue(chocolateId, 'water'), undefined);
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
assert.equal(approvedValue('sp_0106', 'water'), undefined);

for (const insignisId of ['sp_0061', 'sp_0137']) {
  assert.deepEqual(approvedValue(insignisId, 'temperature'), { min: 23, max: 29 });
  assert.deepEqual(approvedValue(insignisId, 'ph'), { min: 5.5, max: 7.2 });
  assert.deepEqual(approvedValue(insignisId, 'adult_size'), { min: null, max: 35 });
  assert.deepEqual(approvedValue(insignisId, 'tank_size'), { liters: 540, lengthCm: 150 });
  assert.equal(approvedValue(insignisId, 'water'), undefined);
}

assert.deepEqual(approvedValue('sp_0107', 'temperature'), { min: 23, max: 29 });
assert.deepEqual(approvedValue('sp_0107', 'ph'), { min: 5.5, max: 7.5 });
assert.deepEqual(approvedValue('sp_0107', 'adult_size'), { min: null, max: 30 });
assert.deepEqual(approvedValue('sp_0107', 'tank_size'), { liters: 540, lengthCm: 150 });
assert.equal(approvedValue('sp_0107', 'water'), undefined);

assert.deepEqual(approvedValue('sp_0472', 'temperature'), { min: 22, max: 28 });
assert.deepEqual(approvedValue('sp_0472', 'adult_size'), { min: null, max: 3.6 });
assert.deepEqual(approvedValue('sp_0472', 'tank_size'), { liters: 68, lengthCm: 60 });
assert.equal(approvedValue('sp_0472', 'ph'), undefined, 'conflicting/not-recorded Thayeria pH must remain unresolved');
assert.equal(approvedValue('sp_0472', 'water'), undefined);

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
assert.equal(taxonResearchPlan.length, 63, '404 actionable field gaps should collapse to 63 base-taxon research jobs at this checkpoint');
const plannedCatalogObjects = new Set(taxonResearchPlan.flatMap(item => item.catalogObjects.map(object => object.speciesId)));
assert.equal(plannedCatalogObjects.size, 108, 'all actionable catalog objects must appear in the taxon research plan exactly by species id');
const plannedGapKeys = taxonResearchPlan.flatMap(item => item.catalogObjects.flatMap(object => object.gaps.map(field => `${object.speciesId}:${field}`))).sort();
const backlogGapKeys = backlog.map(item => `${item.speciesId}:${item.field}`).sort();
assert.deepEqual(plannedGapKeys, backlogGapKeys, 'taxon research plan must represent every actionable field gap exactly once');
assert.ok(taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).every(item => item.promotionPolicy.includes('must never auto-promote')), 'variant-bearing taxon jobs must explicitly forbid automatic authority inheritance');
assert.ok(taxonResearchPlan.filter(item => item.requiresVariantBridgeReview).every(item => item.researchDisposition === 'base_taxon_candidate_research_with_variant_bridge'));
assert.ok(taxonResearchPlan.filter(item => item.unresolvedObjectCount > 0).every(item => item.researchDisposition === 'identity_resolution_required' && item.baseScientificName === null));
const goldfishTaxonJob = taxonResearchPlan.find(item => item.baseScientificName === 'Carassius auratus');
assert.ok(goldfishTaxonJob);
assert.equal(goldfishTaxonJob.catalogObjectCount, 12);
assert.equal(goldfishTaxonJob.variantObjectCount, 12);
assert.equal(goldfishTaxonJob.exactObjectCount, 0);
const opsariichthysTaxonJob = taxonResearchPlan.find(item => item.baseScientificName === 'Opsariichthys bidens');
assert.ok(opsariichthysTaxonJob);
assert.deepEqual(opsariichthysTaxonJob.catalogObjects.map(item => item.speciesId), ['sp_0038', 'sp_0130']);
assert.equal(opsariichthysTaxonJob.requiresVariantBridgeReview, false);

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
    ['sp_0011', 'predation'],
    ['sp_0013', 'predation'],
    ['sp_0151', 'predation'],
    ['sp_0433', 'predation'],
  ],
  'Fast Lane must expose the exact 7/8 species after historical reviewed_unknown records stop masking later reviewed authority',
);
console.log(`Compatibility core-field coverage PASS: ${rows.length} catalog objects × ${fields.length} fields; ${summary.genericOnboardingReadySpecies} generic-ready; ${backlog.length} actionable field gaps; terminal/domain holds excluded.`);

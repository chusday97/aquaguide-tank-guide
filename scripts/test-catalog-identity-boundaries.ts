import assert from 'node:assert/strict';
import { getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { catalogIdentityBoundaries, getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { fishData } from '../src/data/fishData';

assert.deepEqual(Object.keys(catalogIdentityBoundaries).sort(), ['sp_0002','sp_0021','sp_0055','sp_0065','sp_0066','sp_0067','sp_0068','sp_0077','sp_0089','sp_0110','sp_0120','sp_0124','sp_0127','sp_0141','sp_0142','sp_0143','sp_0144','sp_0145','sp_0154','sp_0155','sp_0158','sp_0159','sp_0160','sp_0162','sp_0163','sp_0167','sp_0170','sp_0175','sp_0176','sp_0177','sp_0178','sp_0179','sp_0182','sp_0201','sp_0204','sp_0205','sp_0206','sp_0208','sp_0210','sp_0211','sp_0212','sp_0216','sp_0217','sp_0219','sp_0220','sp_0221','sp_0225','sp_0226','sp_0227','sp_0228','sp_0229','sp_0230','sp_0231','sp_0232','sp_0234','sp_0235','sp_0236','sp_0240','sp_0241','sp_0242','sp_0243','sp_0244','sp_0245','sp_0246','sp_0247','sp_0248','sp_0255','sp_0256','sp_0257','sp_0263','sp_0264','sp_0265','sp_0266','sp_0268','sp_0269','sp_0270','sp_0271','sp_0272','sp_0273','sp_0280','sp_0281','sp_0282','sp_0284','sp_0285','sp_0286','sp_0287','sp_0288','sp_0294','sp_0296','sp_0297','sp_0334','sp_0338','sp_0339','sp_0340','sp_0341','sp_0358','sp_0359','sp_0360','sp_0361','sp_0365','sp_0366','sp_0372','sp_0373','sp_0374','sp_0375','sp_0376','sp_0388','sp_0392','sp_0393','sp_0394','sp_0399','sp_0407','sp_0408','sp_0409','sp_0410','sp_0411','sp_0412','sp_0414','sp_0415','sp_0416','sp_0417','sp_0418','sp_0420','sp_0421','sp_0428','sp_0442','sp_0445','sp_0474']);

const crystal = getCatalogIdentityBoundary('sp_0002');
assert.equal(crystal?.code, 'trade_name_taxon_ambiguous');
assert.equal(crystal?.resolvedGranularity, 'trade_name_only');
assert.equal(crystal?.researchDisposition, 'terminal_unknown_hold');
assert.ok(crystal?.candidateTaxa.includes('Caridina logemanni'));

const zebra = getCatalogIdentityBoundary('sp_0428');
assert.equal(zebra?.code, 'accepted_taxon_alias_trade_ambiguous');
assert.equal(zebra?.resolvedGranularity, 'accepted_taxon_alias_only');
assert.equal(zebra?.researchDisposition, 'terminal_unknown_hold');
assert.ok(zebra?.candidateTaxa.includes('Vittina natalensis'));

const mini = getCatalogIdentityBoundary('sp_0021');
assert.equal(mini?.code, 'commercial_hybrid_identity_unresolved');
assert.equal(mini?.resolvedGranularity, 'commercial_lineage_only');
assert.equal(mini?.researchDisposition, 'terminal_unknown_hold');
assert.ok(mini?.sourceIds.includes('biology-2026-mini-parrot-taxonomy-boundary'));


const parrotHybrid = getCatalogIdentityBoundary('sp_0055');
assert.equal(parrotHybrid?.code, 'commercial_hybrid_identity_unresolved');
assert.equal(parrotHybrid?.resolvedGranularity, 'commercial_lineage_only');
assert.equal(parrotHybrid?.researchDisposition, 'terminal_unknown_hold');

const unresolvedSnakehead = getCatalogIdentityBoundary('sp_0110');
assert.equal(unresolvedSnakehead?.code, 'catalog_scientific_name_unresolved');
assert.equal(unresolvedSnakehead?.resolvedGranularity, 'scientific_name_unresolved');
assert.equal(unresolvedSnakehead?.researchDisposition, 'terminal_unknown_hold');

const goldenKuhli = getCatalogIdentityBoundary('sp_0210');
assert.equal(goldenKuhli?.code, 'catalog_scientific_name_unresolved');
assert.equal(goldenKuhli?.researchDisposition, 'terminal_unknown_hold');
assert.ok(goldenKuhli?.candidateTaxa.some(item => item.includes('Pangio kuhlii')));
assert.ok(goldenKuhli?.candidateTaxa.some(item => item.includes('Pangio anguillaris')));
assert.ok(goldenKuhli?.sourceIds.includes('phase2-15-incopesca-golden-kuhli'));
assert.match(goldenKuhli?.note || '', /conflict|conflicts/i);

const redAppleSwordtail = getCatalogIdentityBoundary('sp_0158');
assert.equal(redAppleSwordtail?.code, 'catalog_scientific_name_unresolved');
assert.ok(redAppleSwordtail?.candidateTaxa.some(item => item.includes('Xiphophorus hellerii ornamental')));
assert.ok(redAppleSwordtail?.candidateTaxa.some(item => item.includes('Xiphophorus maculatus')));
assert.ok(redAppleSwordtail?.sourceIds.includes('phase2-15-usgs-red-swordtail-hybrid'));
assert.equal(getReviewedCompatibilityProfile('sp_0158'), undefined);

const balloonMolly = getCatalogIdentityBoundary('sp_0142');
assert.equal(balloonMolly?.code, 'catalog_scientific_name_unresolved');
assert.ok(balloonMolly?.candidateTaxa.some(item => item.includes('Poecilia sphenops-like')));
assert.ok(balloonMolly?.candidateTaxa.some(item => item.includes('breeding complex')));
assert.ok(balloonMolly?.sourceIds.includes('phase2-15-aquarium-glaser-molly-trade-complex'));
assert.match(balloonMolly?.note || '', /prohibit automatic P\. sphenops Compatibility inheritance/i);
assert.equal(getReviewedCompatibilityProfile('sp_0142'), undefined);

const historicalElectricEelMismatch = catalogIdentityBoundaries.sp_0120;
assert.equal(historicalElectricEelMismatch?.code, 'catalog_common_name_identity_mismatch');
assert.equal(historicalElectricEelMismatch?.resolvedGranularity, 'catalog_name_mismatch');
assert.ok(historicalElectricEelMismatch?.candidateTaxa.includes('Gymnotus carapo'));
const gymnotusCorrection = getCatalogFieldReviews('sp_0120').filter(review => review.field === 'identity').at(-1);
assert.equal(gymnotusCorrection?.resolution, 'supported');
assert.deepEqual(gymnotusCorrection?.proposedValue, { scientificName: 'Gymnotus carapo' });
assert.ok(gymnotusCorrection?.citationIds.includes('fishbase-gymnotus-carapo-phase2-04'));
assert.ok(gymnotusCorrection?.citationIds.includes('sinica-fishdb-gymnotus-carapo-phase2-04'));
assert.equal(getCatalogIdentityBoundary('sp_0120'), undefined, 'reviewed direct taxon/name correction must supersede the historical 电鳗 common-name mismatch');
assert.equal(fishData.find(item => item.id === 'sp_0120')?.name, '圭亚那裸背电鳗');
assert.ok(getReviewedCompatibilityProfile('sp_0120'), 'resolved exact Gymnotus carapo catalog object must have a direct reviewed Compatibility Profile');

const historicalAnemoneTypeMismatch = catalogIdentityBoundaries.sp_0334;
assert.equal(historicalAnemoneTypeMismatch?.code, 'catalog_object_type_mismatch');
assert.equal(historicalAnemoneTypeMismatch?.resolvedGranularity, 'object_type_mismatch');
assert.ok(historicalAnemoneTypeMismatch?.candidateTaxa.some(value => value.includes('Stichodactyla gigantea')));
assert.equal(getCatalogIdentityBoundary('sp_0334'), undefined, 'corrected sea-anemone object type must supersede the historical marine-fish mismatch at runtime');

const pakistaniLoach = getCatalogIdentityBoundary('sp_0127');
assert.equal(pakistaniLoach?.code, 'trade_name_taxon_ambiguous');
assert.equal(pakistaniLoach?.resolvedGranularity, 'trade_name_only');
assert.equal(pakistaniLoach?.researchDisposition, 'terminal_unknown_hold');
assert.ok(pakistaniLoach?.candidateTaxa.includes('Botia almorhae sensu stricto'));
assert.ok(pakistaniLoach?.candidateTaxa.includes('Botia lohachata'));
assert.ok(pakistaniLoach?.sourceIds.includes('seriouslyfish-botia-almorhae-trade-boundary'));

const historicalMarbleMismatch = catalogIdentityBoundaries.sp_0176;
assert.equal(historicalMarbleMismatch?.code, 'catalog_category_mismatch');
assert.equal(historicalMarbleMismatch?.resolvedGranularity, 'catalog_category_mismatch');
const marbleCorrection = getCatalogFieldReviews('sp_0176').filter(review => review.field === 'identity').at(-1);
assert.equal(marbleCorrection?.resolution, 'supported');
assert.deepEqual(marbleCorrection?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Marble',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Marble',
});
assert.ok(marbleCorrection?.citationIds.includes('ifrj-pterophyllum-scalare-marble-identity-wave21'));
assert.equal(getCatalogIdentityBoundary('sp_0176'), undefined, 'a later explicit reviewed object-level identity correction must supersede the historical category mismatch at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0176'), 'resolved Marble angelfish must have an explicit same-species Compatibility bridge');


const historicalBloodRedHold = catalogIdentityBoundaries.sp_0407;
assert.equal(historicalBloodRedHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalBloodRedHold?.resolvedGranularity, 'variant_identity_unresolved');
const bloodRedCorrection = getCatalogFieldReviews('sp_0407').filter(review => review.field === 'identity').at(-1);
assert.equal(bloodRedCorrection?.resolution, 'supported');
assert.deepEqual(bloodRedCorrection?.proposedValue, {
  scientificName: 'Scleropages formosus var. Blood Red A',
  baseSpeciesKey: 'Scleropages formosus',
  variantKey: 'Blood Red A',
});
assert.ok(bloodRedCorrection?.citationIds.includes('aquaculture-research-scleropages-blood-red-identity-wave22'));
assert.ok(bloodRedCorrection?.citationIds.includes('kkp-scleropages-blood-red-first-grade-wave22'));
assert.equal(getCatalogIdentityBoundary('sp_0407'), undefined, 'reviewed Blood Red + first-grade evidence must supersede the historical variant hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0407'), 'resolved Blood Red A arowana must have an explicit same-species Compatibility bridge');
const goldHeadCorrection = getCatalogFieldReviews('sp_0408').filter(review => review.field === 'identity').at(-1);
assert.equal(goldHeadCorrection?.resolution, 'supported');
assert.deepEqual(goldHeadCorrection?.proposedValue, {
  scientificName: 'Scleropages formosus var. Gold Head',
  baseSpeciesKey: 'Scleropages formosus',
  variantKey: 'Golden Head / Golden Crossback phenotype',
});
assert.ok(goldHeadCorrection?.citationIds.includes('sunbeam-scleropages-formosus-golden-head-phase2-01'));
assert.ok(goldHeadCorrection?.citationIds.includes('ijms-scleropages-formosus-color-variants-phase2-01'));
assert.equal(getCatalogIdentityBoundary('sp_0408'), undefined, 'reviewed Golden Head identity evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0408'), 'resolved Golden Head arowana must have an explicit same-species Compatibility bridge');


const historicalAlbinoRedHold = catalogIdentityBoundaries.sp_0236;
assert.equal(historicalAlbinoRedHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalAlbinoRedHold?.resolvedGranularity, 'variant_identity_unresolved');
const albinoRedCorrection = getCatalogFieldReviews('sp_0236').filter(review => review.field === 'identity').at(-1);
assert.equal(albinoRedCorrection?.resolution, 'supported');
assert.deepEqual(albinoRedCorrection?.proposedValue, {
  scientificName: 'Xiphophorus hellerii var. Albino Red',
  baseSpeciesKey: 'Xiphophorus hellerii',
  variantKey: 'Albino Red',
});
assert.ok(albinoRedCorrection?.citationIds.includes('pcmr-xiphophorus-hellerii-red-albino-wave23'));
assert.ok(albinoRedCorrection?.citationIds.includes('txstate-xgsc-xiphophorus-hellerii-albino-wave23'));
assert.equal(getCatalogIdentityBoundary('sp_0236'), undefined, 'reviewed Red albino X. hellerii evidence must supersede the historical Albino Red variant hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0236'), 'resolved Albino Red swordtail must have an explicit same-species Compatibility bridge');
assert.equal(getCatalogIdentityBoundary('sp_0415')?.code, 'catalog_variant_identity_unresolved', 'High Fin must remain fail-closed because the extra fin-form identity is not covered by the Albino Red correction');


const historicalAlbinoGyrinocheilusHold = catalogIdentityBoundaries.sp_0229;
assert.equal(historicalAlbinoGyrinocheilusHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalAlbinoGyrinocheilusHold?.resolvedGranularity, 'variant_identity_unresolved');
const albinoGyrinocheilusCorrection = getCatalogFieldReviews('sp_0229').filter(review => review.field === 'identity').at(-1);
assert.equal(albinoGyrinocheilusCorrection?.resolution, 'supported');
assert.deepEqual(albinoGyrinocheilusCorrection?.proposedValue, {
  scientificName: 'Gyrinocheilus aymonieri var. Albino',
  baseSpeciesKey: 'Gyrinocheilus aymonieri',
  variantKey: 'Albino',
});
assert.ok(albinoGyrinocheilusCorrection?.citationIds.includes('seriouslyfish-gyrinocheilus-aymonieri'));
assert.ok(albinoGyrinocheilusCorrection?.citationIds.includes('tetra-gyrinocheilus-aymonieri-albino-wave24'));
assert.equal(getCatalogIdentityBoundary('sp_0229'), undefined, 'reviewed exact-species Albino strain evidence must supersede the historical Gyrinocheilus variant hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0229'), 'resolved Albino Gyrinocheilus must have an explicit same-species Compatibility bridge');
const historicalChineseAlgaeEaterHold = catalogIdentityBoundaries.sp_0442;
assert.equal(historicalChineseAlgaeEaterHold?.code, 'catalog_scientific_name_unresolved');
const chineseAlgaeEaterCorrection = getCatalogFieldReviews('sp_0442').filter(review => review.field === 'identity').at(-1);
assert.equal(chineseAlgaeEaterCorrection?.resolution, 'supported');
assert.deepEqual(chineseAlgaeEaterCorrection?.proposedValue, {
  scientificName: 'Gyrinocheilus aymonieri',
  baseSpeciesKey: 'Gyrinocheilus aymonieri',
  variantKey: 'same taxon / Chinese Algae Eater catalog alias',
});
assert.ok(chineseAlgaeEaterCorrection?.citationIds.includes('aquariumfishsale-gyrinocheilus-aymonieri-chinese-phase2-08'));
assert.ok(chineseAlgaeEaterCorrection?.citationIds.includes('aquariumfishsale-gyrinocheilus-aymonieri-gold-phase2-08'));
assert.equal(getCatalogIdentityBoundary('sp_0442'), undefined, 'reviewed exact-taxon Chinese Algae Eater evidence must supersede the legacy blank-variety hold');
assert.ok(getReviewedCompatibilityProfile('sp_0442'), 'resolved Chinese Algae Eater alias must inherit the reviewed Gyrinocheilus aymonieri Compatibility authority');


const historicalFireRedAgassiziiHold = catalogIdentityBoundaries.sp_0221;
assert.equal(historicalFireRedAgassiziiHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalFireRedAgassiziiHold?.resolvedGranularity, 'variant_identity_unresolved');
const fireRedAgassiziiCorrection = getCatalogFieldReviews('sp_0221').filter(review => review.field === 'identity').at(-1);
assert.equal(fireRedAgassiziiCorrection?.resolution, 'supported');
assert.deepEqual(fireRedAgassiziiCorrection?.proposedValue, {
  scientificName: 'Apistogramma agassizii var. Fire Red',
  baseSpeciesKey: 'Apistogramma agassizii',
  variantKey: 'Fire Red',
});
assert.ok(fireRedAgassiziiCorrection?.citationIds.includes('aquarium-glaser-apistogramma-agassizii-fire-red-wave25'));
assert.ok(fireRedAgassiziiCorrection?.citationIds.includes('aquarium-coop-apistogramma-fire-red-wave25'));
assert.equal(getCatalogIdentityBoundary('sp_0221'), undefined, 'reviewed Fire Red colour-strain evidence must supersede the historical Agassizii variant hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0221'), 'resolved Fire Red Agassizii must have an explicit same-species Compatibility bridge');


const historicalBlueDiamondHold = catalogIdentityBoundaries.sp_0177;
assert.equal(historicalBlueDiamondHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalBlueDiamondHold?.resolvedGranularity, 'variant_identity_unresolved');
const blueDiamondCorrection = getCatalogFieldReviews('sp_0177').filter(review => review.field === 'identity').at(-1);
assert.equal(blueDiamondCorrection?.resolution, 'supported');
assert.deepEqual(blueDiamondCorrection?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Blue Diamond',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Blue Diamond',
});
assert.ok(blueDiamondCorrection?.citationIds.includes('aquatic-arts-pterophyllum-scalare-blue-diamond-wave26'));
assert.ok(blueDiamondCorrection?.citationIds.includes('swelluk-pterophyllum-scalare-blue-diamond-wave26'));
assert.equal(getCatalogIdentityBoundary('sp_0177'), undefined, 'reviewed Blue Diamond evidence must supersede the historical blue-lineage hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0177'), 'resolved Blue Diamond angelfish must have an explicit same-species Compatibility bridge');


const historicalPandaAngelfishHold = catalogIdentityBoundaries.sp_0178;
assert.equal(historicalPandaAngelfishHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalPandaAngelfishHold?.resolvedGranularity, 'variant_identity_unresolved');
const pandaAngelfishCorrection = getCatalogFieldReviews('sp_0178').filter(review => review.field === 'identity').at(-1);
assert.equal(pandaAngelfishCorrection?.resolution, 'supported');
assert.deepEqual(pandaAngelfishCorrection?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Panda',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Panda',
});
assert.ok(pandaAngelfishCorrection?.citationIds.includes('aquatic-arts-pterophyllum-scalare-panda-wave27'));
assert.ok(pandaAngelfishCorrection?.citationIds.includes('aquapets-pterophyllum-scalare-panda-wave27'));
assert.equal(getCatalogIdentityBoundary('sp_0178'), undefined, 'reviewed Panda angelfish evidence must supersede the historical Panda lineage hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0178'), 'resolved Panda angelfish must have an explicit same-species Compatibility bridge');


const historicalSuperRedAngelfishHold = catalogIdentityBoundaries.sp_0388;
assert.equal(historicalSuperRedAngelfishHold?.code, 'catalog_variant_identity_unresolved');
assert.equal(historicalSuperRedAngelfishHold?.resolvedGranularity, 'variant_identity_unresolved');
const superRedAngelfishCorrection = getCatalogFieldReviews('sp_0388').filter(review => review.field === 'identity').at(-1);
assert.equal(superRedAngelfishCorrection?.resolution, 'supported');
assert.deepEqual(superRedAngelfishCorrection?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Super Red',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Super Red / Red Devil',
});
assert.ok(superRedAngelfishCorrection?.citationIds.includes('aquatic-arts-pterophyllum-scalare-red-devil-wave28'));
assert.ok(superRedAngelfishCorrection?.citationIds.includes('garage-aquatics-pterophyllum-scalare-super-red-wave28'));
assert.equal(getCatalogIdentityBoundary('sp_0388'), undefined, 'reviewed Super Red / Red Devil evidence must supersede the historical Super Red lineage hold at runtime');
assert.ok(getReviewedCompatibilityProfile('sp_0388'), 'resolved Super Red angelfish must have an explicit same-species Compatibility bridge');
assert.equal(getCatalogIdentityBoundary('sp_0175')?.code, 'catalog_variant_identity_unresolved', 'generic Red angelfish must remain fail-closed because Red is broader than the reviewed Super Red / Red Devil trade line');

const parentTaxonHold = getCatalogIdentityBoundary('sp_0217');
assert.equal(parentTaxonHold?.code, 'catalog_parent_taxon_unresolved');
assert.equal(parentTaxonHold?.resolvedGranularity, 'parent_taxon_unresolved');

for (const speciesId of ['sp_0241','sp_0271']) {
  const boundary = getCatalogIdentityBoundary(speciesId);
  assert.equal(boundary?.code, 'catalog_variant_identity_unresolved');
  assert.equal(boundary?.resolvedGranularity, 'variant_identity_unresolved');
  assert.equal(boundary?.researchDisposition, 'terminal_unknown_hold');
}

const wave06Hybrid = getCatalogIdentityBoundary('sp_0243');
assert.equal(wave06Hybrid?.code, 'commercial_hybrid_identity_unresolved');
assert.equal(wave06Hybrid?.researchDisposition, 'terminal_unknown_hold');

const wave06Malformed = getCatalogIdentityBoundary('sp_0265');
assert.equal(wave06Malformed?.code, 'catalog_scientific_name_unresolved');
assert.equal(wave06Malformed?.researchDisposition, 'terminal_unknown_hold');

const goldCalvusCorrection = getCatalogFieldReviews('sp_0266').filter(review => review.field === 'identity').at(-1);
assert.equal(goldCalvusCorrection?.resolution, 'supported');
assert.deepEqual(goldCalvusCorrection?.proposedValue, {
  scientificName: 'Altolamprologus calvus var. Gold',
  baseSpeciesKey: 'Altolamprologus calvus',
  variantKey: 'Gold / Nkamba Bay',
});
assert.ok(goldCalvusCorrection?.citationIds.includes('france-cichlid-altolamprologus-calvus-gold-phase2-01'));
assert.equal(getCatalogIdentityBoundary('sp_0266'), undefined, 'reviewed Gold/Nkamba Bay identity evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0266'));

const albinoArowanaCorrection = getCatalogFieldReviews('sp_0242').filter(review => review.field === 'identity').at(-1);
assert.equal(albinoArowanaCorrection?.resolution, 'supported');
assert.deepEqual(albinoArowanaCorrection?.proposedValue, {
  scientificName: 'Scleropages formosus var. Albino',
  baseSpeciesKey: 'Scleropages formosus',
  variantKey: 'Albino / Albino Silver',
});
assert.ok(albinoArowanaCorrection?.citationIds.includes('konelayan-sabah-scleropages-formosus-albino-silver-phase2-01'));
assert.equal(getCatalogIdentityBoundary('sp_0242'), undefined, 'Sabah reviewed farm identity evidence must supersede the historical Albino Arowana hold');
assert.ok(getReviewedCompatibilityProfile('sp_0242'));

for (const speciesId of ['sp_0372','sp_0373','sp_0416']) {
  assert.equal(getCatalogIdentityBoundary(speciesId)?.code, 'catalog_variant_identity_unresolved');
}
for (const speciesId of ['sp_0297','sp_0414']) {
  assert.equal(getCatalogIdentityBoundary(speciesId)?.code, 'catalog_parent_taxon_unresolved');
}
assert.equal(getCatalogIdentityBoundary('sp_0296')?.code, 'catalog_scientific_name_unresolved');

const superRedReview = getCatalogFieldReviews('sp_0283').find(review => review.field === 'identity');
assert.equal(superRedReview?.resolution, 'supported');
assert.equal(getCatalogIdentityBoundary('sp_0283'), undefined);
assert.ok(getReviewedCompatibilityProfile('sp_0283'));

const darioGoldCorrection = getCatalogFieldReviews('sp_0234').filter(review => review.field === 'identity').at(-1);
assert.equal(darioGoldCorrection?.resolution, 'supported');
assert.deepEqual(darioGoldCorrection?.proposedValue, {
  scientificName: 'Dario dario var. Gold',
  baseSpeciesKey: 'Dario dario',
  variantKey: 'Gold color form / catalog trade label',
});
assert.deepEqual(
  getCatalogFieldReviews('sp_0234').filter(review => review.status === 'reviewed' && review.resolution === 'supported').map(review => review.field),
  ['identity'],
  'Phase2-03 must prove identity-only canonical onboarding rather than copying eight base facts',
);
assert.ok(darioGoldCorrection?.citationIds.includes('liveaquaria-dario-dario-gold-red-phase2-03'));
assert.ok(darioGoldCorrection?.citationIds.includes('baybridge-dario-dario-gold-red-phase2-03'));
assert.equal(getCatalogIdentityBoundary('sp_0234'), undefined, 'reviewed Dario dario Gold color-form evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0234'));

const goldPeckoltiaCorrection = getCatalogFieldReviews('sp_0257').filter(review => review.field === 'identity').at(-1);
assert.equal(goldPeckoltiaCorrection?.resolution, 'supported');
assert.deepEqual(goldPeckoltiaCorrection?.proposedValue, {
  scientificName: 'Peckoltia compta var. Gold',
  baseSpeciesKey: 'Peckoltia compta',
  variantKey: 'Gold',
});
assert.ok(goldPeckoltiaCorrection?.citationIds.includes('suedamerikafans-peckoltia-compta-gold-phase2-02'));
assert.equal(getCatalogIdentityBoundary('sp_0257'), undefined, 'reviewed Peckoltia compta Gold evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0257'));

const platinumArowanaCorrection = getCatalogFieldReviews('sp_0284').filter(review => review.field === 'identity').at(-1);
assert.equal(platinumArowanaCorrection?.resolution, 'supported');
assert.deepEqual(platinumArowanaCorrection?.proposedValue, {
  scientificName: 'Scleropages formosus var. Silver Platinum',
  baseSpeciesKey: 'Scleropages formosus',
  variantKey: 'Platinum / Silver Platinum',
});
assert.ok(platinumArowanaCorrection?.citationIds.includes('fishcollection-scleropages-formosus-platinum-phase2-02'));
assert.ok(platinumArowanaCorrection?.citationIds.includes('ijms-scleropages-formosus-color-variants-phase2-01'));
assert.equal(getCatalogIdentityBoundary('sp_0284'), undefined, 'reviewed Platinum Arowana evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0284'));

const historicalAlbinoPandaHold = catalogIdentityBoundaries.sp_0231;
assert.equal(historicalAlbinoPandaHold?.code, 'catalog_variant_identity_unresolved');
const albinoPandaCorrection = getCatalogFieldReviews('sp_0231').filter(review => review.field === 'identity').at(-1);
assert.equal(albinoPandaCorrection?.resolution, 'supported');
assert.deepEqual(albinoPandaCorrection?.proposedValue, {
  scientificName: 'Corydoras panda var. Albino',
  baseSpeciesKey: 'Corydoras panda',
  variantKey: 'Albino / Hoplisoma panda albino strain',
});
assert.ok(albinoPandaCorrection?.citationIds.includes('aquagroup-hoplisoma-panda-albino-phase2-06'));
assert.ok(albinoPandaCorrection?.citationIds.includes('nicks-aquarium-hoplisoma-panda-albino-phase2-06'));
assert.ok(albinoPandaCorrection?.citationIds.includes('maidenhead-hoplisoma-panda-albino-phase2-06'));
assert.equal(getCatalogIdentityBoundary('sp_0231'), undefined, 'reviewed Albino Panda exact-object identity evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0231'));

const historicalKarbiAnglongHold = catalogIdentityBoundaries.sp_0411;
assert.equal(historicalKarbiAnglongHold?.code, 'catalog_variant_identity_unresolved');
const karbiAnglongCorrection = getCatalogFieldReviews('sp_0411').filter(review => review.field === 'identity').at(-1);
assert.equal(karbiAnglongCorrection?.resolution, 'supported');
assert.deepEqual(karbiAnglongCorrection?.proposedValue, {
  scientificName: 'Channa stewartii var. Karbi Anglong',
  baseSpeciesKey: 'Channa stewartii',
  variantKey: 'Karbi Anglong',
});
assert.ok(karbiAnglongCorrection?.citationIds.includes('fishbook-channa-stewartii-karbi-anglong-phase2-07'));
assert.ok(karbiAnglongCorrection?.citationIds.includes('golden-aquaria-channa-stewartii-karbi-anglong-phase2-07'));
assert.equal(getCatalogIdentityBoundary('sp_0411'), undefined, 'reviewed Karbi Anglong locality identity evidence must supersede the historical variant hold');
assert.ok(getReviewedCompatibilityProfile('sp_0411'));

for (const [speciesId, variantKey] of [
  ['sp_0065', 'Butterfly Tail'],
  ['sp_0162', 'Red Grass Goldfish'],
] as const) {
  const historicalHold = catalogIdentityBoundaries[speciesId];
  assert.equal(historicalHold?.code, 'catalog_scientific_name_unresolved');
  const correction = getCatalogFieldReviews(speciesId).filter(review => review.field === 'identity').at(-1);
  assert.equal(correction?.resolution, 'supported');
  assert.deepEqual(correction?.proposedValue, {
    scientificName: 'Carassius auratus',
    baseSpeciesKey: 'Carassius auratus',
    variantKey,
  });
  assert.equal(getCatalogIdentityBoundary(speciesId), undefined, `${speciesId} reviewed exact goldfish identity must supersede the historical blank-var hold`);
  assert.equal(getReviewedCompatibilityProfile(speciesId), undefined, `${speciesId} identity-only correction must not manufacture a Compatibility Profile`);
}

const goldenCobraCorrection = getCatalogFieldReviews('sp_0216').filter(review => review.field === 'identity').at(-1);
assert.equal(goldenCobraCorrection?.resolution, 'supported');
assert.deepEqual(goldenCobraCorrection?.proposedValue, {
  scientificName: 'Channa aurantimaculata',
  baseSpeciesKey: 'Channa aurantimaculata',
  variantKey: null,
});
assert.equal(getCatalogIdentityBoundary('sp_0216'), undefined, 'reviewed Golden Cobra same-taxon trade-name evidence must supersede the historical blank-var hold');
assert.ok(getReviewedCompatibilityProfile('sp_0216'));

for (const speciesId of ['sp_0163','sp_0175','sp_0179','sp_0182','sp_0201','sp_0208','sp_0219','sp_0220','sp_0227','sp_0228','sp_0235','sp_0247','sp_0248','sp_0256','sp_0263','sp_0264','sp_0268','sp_0269','sp_0270','sp_0273','sp_0282','sp_0285','sp_0286','sp_0288','sp_0294']) {
  const boundary = getCatalogIdentityBoundary(speciesId);
  assert.equal(boundary?.code, 'catalog_variant_identity_unresolved');
  assert.equal(boundary?.resolvedGranularity, 'variant_identity_unresolved');
  assert.equal(boundary?.researchDisposition, 'terminal_unknown_hold');
}

const koiReview = getCatalogFieldReviews('sp_0258').find(review => review.field === 'identity');
assert.equal(koiReview?.resolution, 'supported');
assert.equal(getCatalogIdentityBoundary('sp_0258'), undefined);

for (const boundary of Object.values(catalogIdentityBoundaries)) {
  assert.ok(boundary.note.length > 20);
  assert.ok(boundary.sourceIds.length > 0);
  assert.ok(boundary.candidateTaxa.length > 0);
}

console.log('catalog identity boundaries passed: unresolved trade identities stay fail-closed while explicit reviewed identity corrections can supersede historical holds');

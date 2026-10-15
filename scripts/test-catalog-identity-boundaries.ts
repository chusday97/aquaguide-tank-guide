import assert from 'node:assert/strict';
import { getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { catalogIdentityBoundaries, getCatalogIdentityBoundary } from '../src/data/catalogIdentityBoundaries';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';

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

const electricEelMismatch = getCatalogIdentityBoundary('sp_0120');
assert.equal(electricEelMismatch?.code, 'catalog_common_name_identity_mismatch');
assert.equal(electricEelMismatch?.resolvedGranularity, 'catalog_name_mismatch');
assert.ok(electricEelMismatch?.candidateTaxa.includes('Gymnotus carapo'));

const anemoneTypeMismatch = getCatalogIdentityBoundary('sp_0334');
assert.equal(anemoneTypeMismatch?.code, 'catalog_object_type_mismatch');
assert.equal(anemoneTypeMismatch?.resolvedGranularity, 'object_type_mismatch');
assert.ok(anemoneTypeMismatch?.candidateTaxa.some(value => value.includes('Stichodactyla gigantea')));

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
assert.equal(getCatalogIdentityBoundary('sp_0408')?.code, 'catalog_variant_identity_unresolved', 'Gold Head must remain fail-closed without equivalent object-level identity evidence');


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
assert.equal(getCatalogIdentityBoundary('sp_0442')?.code, 'catalog_scientific_name_unresolved', 'blank-variety Gyrinocheilus must remain fail-closed without an exact object-level identity bridge');


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

const parentTaxonHold = getCatalogIdentityBoundary('sp_0217');
assert.equal(parentTaxonHold?.code, 'catalog_parent_taxon_unresolved');
assert.equal(parentTaxonHold?.resolvedGranularity, 'parent_taxon_unresolved');

for (const speciesId of ['sp_0241','sp_0266','sp_0271']) {
  const boundary = getCatalogIdentityBoundary(speciesId);
  assert.equal(boundary?.code, 'catalog_category_mismatch');
  assert.equal(boundary?.resolvedGranularity, 'catalog_category_mismatch');
  assert.equal(boundary?.researchDisposition, 'terminal_unknown_hold');
}

const wave06Hybrid = getCatalogIdentityBoundary('sp_0243');
assert.equal(wave06Hybrid?.code, 'commercial_hybrid_identity_unresolved');
assert.equal(wave06Hybrid?.researchDisposition, 'terminal_unknown_hold');

const wave06Malformed = getCatalogIdentityBoundary('sp_0265');
assert.equal(wave06Malformed?.code, 'catalog_scientific_name_unresolved');
assert.equal(wave06Malformed?.researchDisposition, 'terminal_unknown_hold');

for (const speciesId of ['sp_0372','sp_0373','sp_0411','sp_0416']) {
  assert.equal(getCatalogIdentityBoundary(speciesId)?.code, 'catalog_category_mismatch');
}
for (const speciesId of ['sp_0297','sp_0414']) {
  assert.equal(getCatalogIdentityBoundary(speciesId)?.code, 'catalog_parent_taxon_unresolved');
}
assert.equal(getCatalogIdentityBoundary('sp_0296')?.code, 'catalog_scientific_name_unresolved');

const superRedReview = getCatalogFieldReviews('sp_0283').find(review => review.field === 'identity');
assert.equal(superRedReview?.resolution, 'supported');
assert.equal(getCatalogIdentityBoundary('sp_0283'), undefined);
assert.ok(getReviewedCompatibilityProfile('sp_0283'));

for (const speciesId of ['sp_0158','sp_0163','sp_0175','sp_0177','sp_0178','sp_0179','sp_0182','sp_0201','sp_0208','sp_0216','sp_0219','sp_0220','sp_0227','sp_0228','sp_0234','sp_0235','sp_0240','sp_0242','sp_0247','sp_0248','sp_0256','sp_0257','sp_0263','sp_0264','sp_0268','sp_0269','sp_0270','sp_0272','sp_0273','sp_0282','sp_0284','sp_0285','sp_0286','sp_0288','sp_0294']) {
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

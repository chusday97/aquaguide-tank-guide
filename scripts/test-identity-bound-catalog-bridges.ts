import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews, getCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

const miniIdentity = getCatalogFieldReviews('sp_0021').find(review => review.field === 'identity');
assert.equal(miniIdentity?.resolution, 'unknown');
const miniApproved = new Map(getApprovedCatalogFieldReviews('sp_0021').map(review => [review.field, review]));
assert.deepEqual(miniApproved.get('adult_size')?.proposedValue, { min: null, max: 10 });
const mini = getReviewedSpeciesKnowledge('sp_0021');
assert.equal(mini?.spaceAndGrowth?.adultLengthCm?.max, 10);
assert.equal(mini?.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(mini?.spaceAndGrowth?.minTankLengthCm, undefined);
assert.equal(mini?.spaceAndGrowth?.evidence.reviewStatus, 'reviewed');
assert.notEqual(mini?.spaceAndGrowth?.evidence.confidence, 'unknown');
assert.equal(mini?.environment?.evidence.confidence, 'unknown');
assert.equal(mini?.socialBehavior?.evidence.confidence, 'unknown');

const koiIdentity = getCatalogFieldReviews('sp_0258').find(review => review.field === 'identity');
assert.equal(koiIdentity?.resolution, 'supported');
assert.deepEqual(koiIdentity?.proposedValue, {
  scientificName: 'Betta splendens var. Koi',
  baseSpeciesKey: 'Betta splendens',
  variantKey: 'Koi',
});
assert.deepEqual(koiIdentity?.citationIds, ['batch03-sciadv-betta-mosaic-koi']);
const koiApproved = new Map(getApprovedCatalogFieldReviews('sp_0258').map(review => [review.field, review]));
assert.equal(koiApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(koiApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(koiApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(koiApproved.get('adult_size')?.proposedValue, { min: null, max: 6.5 });

const koi = getReviewedSpeciesKnowledge('sp_0258');
assert.equal(koi?.environment?.waterType, 'freshwater');
assert.deepEqual(koi?.environment?.temperatureRangeC, { min: 24, max: 30 });
assert.deepEqual(koi?.environment?.phRange, { min: 6, max: 8 });
assert.equal(koi?.environment?.evidence.reviewStatus, 'reviewed');
assert.notEqual(koi?.environment?.evidence.confidence, 'unknown');
assert.equal(koi?.spaceAndGrowth?.adultLengthCm?.max, 6.5);
assert.equal(koi?.spaceAndGrowth?.minVolumeLiters, undefined);
assert.equal(koi?.spaceAndGrowth?.minTankLengthCm, undefined);
assert.notEqual(koi?.spaceAndGrowth?.evidence.confidence, 'unknown');
assert.equal(koi?.socialBehavior?.evidence.confidence, 'unknown');

const marbleIdentity = getCatalogFieldReviews('sp_0176').filter(review => review.field === 'identity').at(-1);
assert.equal(marbleIdentity?.resolution, 'supported');
assert.deepEqual(marbleIdentity?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Marble',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Marble',
});
const marbleApproved = new Map(getApprovedCatalogFieldReviews('sp_0176').map(review => [review.field, review]));
assert.deepEqual(marbleApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(marbleApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(marbleApproved.get('adult_size')?.proposedValue, { min: null, max: 15 });
assert.deepEqual(marbleApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 100 });
assert.deepEqual(marbleApproved.get('territoriality')?.proposedValue, { traits: ['breeding_male_territoriality'] });
assert.deepEqual(marbleApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });


const bloodRedIdentity = getCatalogFieldReviews('sp_0407').filter(review => review.field === 'identity').at(-1);
assert.equal(bloodRedIdentity?.resolution, 'supported');
assert.deepEqual(bloodRedIdentity?.proposedValue, {
  scientificName: 'Scleropages formosus var. Blood Red A',
  baseSpeciesKey: 'Scleropages formosus',
  variantKey: 'Blood Red A',
});
const bloodRedApproved = new Map(getApprovedCatalogFieldReviews('sp_0407').map(review => [review.field, review]));
assert.equal(bloodRedApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(bloodRedApproved.get('temperature')?.proposedValue, { min: 22, max: 28 });
assert.deepEqual(bloodRedApproved.get('ph')?.proposedValue, { min: 5, max: 8 });
assert.deepEqual(bloodRedApproved.get('adult_size')?.proposedValue, { min: null, max: 90 });
assert.deepEqual(bloodRedApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 200 });
assert.deepEqual(bloodRedApproved.get('social_behavior')?.proposedValue, { mode: 'variable', minimumGroupSize: null });
assert.deepEqual(bloodRedApproved.get('territoriality')?.proposedValue, { traits: ['territorial'] });
assert.deepEqual(bloodRedApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });


const albinoRedIdentity = getCatalogFieldReviews('sp_0236').filter(review => review.field === 'identity').at(-1);
assert.equal(albinoRedIdentity?.resolution, 'supported');
assert.deepEqual(albinoRedIdentity?.proposedValue, {
  scientificName: 'Xiphophorus hellerii var. Albino Red',
  baseSpeciesKey: 'Xiphophorus hellerii',
  variantKey: 'Albino Red',
});
const albinoRedApproved = new Map(getApprovedCatalogFieldReviews('sp_0236').map(review => [review.field, review]));
assert.equal(albinoRedApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(albinoRedApproved.get('temperature')?.proposedValue, { min: 16, max: 28 });
assert.deepEqual(albinoRedApproved.get('ph')?.proposedValue, { min: 7, max: 8 });
assert.deepEqual(albinoRedApproved.get('adult_size')?.proposedValue, { min: null, max: 14 });
assert.deepEqual(albinoRedApproved.get('tank_size')?.proposedValue, { liters: 108, lengthCm: 120 });
assert.deepEqual(albinoRedApproved.get('social_behavior')?.proposedValue, { mode: 'group', minimumGroupSize: null });
assert.deepEqual(albinoRedApproved.get('territoriality')?.proposedValue, { traits: ['male_conspecific_territoriality'] });
assert.deepEqual(albinoRedApproved.get('predation')?.proposedValue, { targets: [] });


const albinoGyrinocheilusIdentity = getCatalogFieldReviews('sp_0229').filter(review => review.field === 'identity').at(-1);
assert.equal(albinoGyrinocheilusIdentity?.resolution, 'supported');
assert.deepEqual(albinoGyrinocheilusIdentity?.proposedValue, {
  scientificName: 'Gyrinocheilus aymonieri var. Albino',
  baseSpeciesKey: 'Gyrinocheilus aymonieri',
  variantKey: 'Albino',
});
const albinoGyrinocheilusApproved = new Map(getApprovedCatalogFieldReviews('sp_0229').map(review => [review.field, review]));
assert.equal(albinoGyrinocheilusApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(albinoGyrinocheilusApproved.get('temperature')?.proposedValue, { min: 22, max: 26 });
assert.deepEqual(albinoGyrinocheilusApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(albinoGyrinocheilusApproved.get('adult_size')?.proposedValue, { min: null, max: 28 });
assert.deepEqual(albinoGyrinocheilusApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 150 });
assert.deepEqual(albinoGyrinocheilusApproved.get('social_behavior')?.proposedValue, { mode: 'variable', minimumGroupSize: null });
assert.deepEqual(albinoGyrinocheilusApproved.get('territoriality')?.proposedValue, { traits: ['age_increasing_territoriality', 'similar_fish_aggression', 'bottom_dweller_aggression'] });
assert.deepEqual(albinoGyrinocheilusApproved.get('predation')?.proposedValue, { targets: [] });


const fireRedAgassiziiIdentity = getCatalogFieldReviews('sp_0221').filter(review => review.field === 'identity').at(-1);
assert.equal(fireRedAgassiziiIdentity?.resolution, 'supported');
assert.deepEqual(fireRedAgassiziiIdentity?.proposedValue, {
  scientificName: 'Apistogramma agassizii var. Fire Red',
  baseSpeciesKey: 'Apistogramma agassizii',
  variantKey: 'Fire Red',
});
const fireRedAgassiziiApproved = new Map(getApprovedCatalogFieldReviews('sp_0221').map(review => [review.field, review]));
assert.equal(fireRedAgassiziiApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(fireRedAgassiziiApproved.get('temperature')?.proposedValue, { min: 22, max: 29 });
assert.deepEqual(fireRedAgassiziiApproved.get('ph')?.proposedValue, { min: 5, max: 7 });
assert.deepEqual(fireRedAgassiziiApproved.get('adult_size')?.proposedValue, { min: null, max: 7.5 });
assert.deepEqual(fireRedAgassiziiApproved.get('tank_size')?.proposedValue, { liters: 54, lengthCm: 60 });
assert.deepEqual(fireRedAgassiziiApproved.get('social_behavior')?.proposedValue, { mode: 'variable', minimumGroupSize: null });
assert.deepEqual(fireRedAgassiziiApproved.get('territoriality')?.proposedValue, { traits: ['breeding_defense'] });
assert.deepEqual(fireRedAgassiziiApproved.get('predation')?.proposedValue, { targets: [] });


const blueDiamondIdentity = getCatalogFieldReviews('sp_0177').filter(review => review.field === 'identity').at(-1);
assert.equal(blueDiamondIdentity?.resolution, 'supported');
assert.deepEqual(blueDiamondIdentity?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Blue Diamond',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Blue Diamond',
});
const blueDiamondApproved = new Map(getApprovedCatalogFieldReviews('sp_0177').map(review => [review.field, review]));
assert.equal(blueDiamondApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(blueDiamondApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(blueDiamondApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(blueDiamondApproved.get('adult_size')?.proposedValue, { min: null, max: 15 });
assert.deepEqual(blueDiamondApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 100 });
assert.deepEqual(blueDiamondApproved.get('social_behavior')?.proposedValue, { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(blueDiamondApproved.get('territoriality')?.proposedValue, { traits: ['breeding_male_territoriality'] });
assert.deepEqual(blueDiamondApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });


const pandaAngelfishIdentity = getCatalogFieldReviews('sp_0178').filter(review => review.field === 'identity').at(-1);
assert.equal(pandaAngelfishIdentity?.resolution, 'supported');
assert.deepEqual(pandaAngelfishIdentity?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Panda',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Panda',
});
const pandaAngelfishApproved = new Map(getApprovedCatalogFieldReviews('sp_0178').map(review => [review.field, review]));
assert.equal(pandaAngelfishApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(pandaAngelfishApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(pandaAngelfishApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(pandaAngelfishApproved.get('adult_size')?.proposedValue, { min: null, max: 15 });
assert.deepEqual(pandaAngelfishApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 100 });
assert.deepEqual(pandaAngelfishApproved.get('social_behavior')?.proposedValue, { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(pandaAngelfishApproved.get('territoriality')?.proposedValue, { traits: ['breeding_male_territoriality'] });
assert.deepEqual(pandaAngelfishApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });


const superRedAngelfishIdentity = getCatalogFieldReviews('sp_0388').filter(review => review.field === 'identity').at(-1);
assert.equal(superRedAngelfishIdentity?.resolution, 'supported');
assert.deepEqual(superRedAngelfishIdentity?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Super Red',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Super Red / Red Devil',
});
const superRedAngelfishApproved = new Map(getApprovedCatalogFieldReviews('sp_0388').map(review => [review.field, review]));
assert.equal(superRedAngelfishApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(superRedAngelfishApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(superRedAngelfishApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(superRedAngelfishApproved.get('adult_size')?.proposedValue, { min: null, max: 15 });
assert.deepEqual(superRedAngelfishApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 100 });
assert.deepEqual(superRedAngelfishApproved.get('social_behavior')?.proposedValue, { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(superRedAngelfishApproved.get('territoriality')?.proposedValue, { traits: ['breeding_male_territoriality'] });
assert.deepEqual(superRedAngelfishApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });


const platinumLongfinIdentity = getCatalogFieldReviews('sp_0240').filter(review => review.field === 'identity').at(-1);
assert.equal(platinumLongfinIdentity?.resolution, 'supported');
assert.deepEqual(platinumLongfinIdentity?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Platinum Longfin',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Platinum Veiltail / Longfin',
});
const platinumLongfinApproved = new Map(getApprovedCatalogFieldReviews('sp_0240').map(review => [review.field, review]));
assert.equal(platinumLongfinApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(platinumLongfinApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(platinumLongfinApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(platinumLongfinApproved.get('adult_size')?.proposedValue, { min: null, max: 15 });
assert.deepEqual(platinumLongfinApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 100 });
assert.deepEqual(platinumLongfinApproved.get('social_behavior')?.proposedValue, { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(platinumLongfinApproved.get('territoriality')?.proposedValue, { traits: ['breeding_male_territoriality'] });
assert.deepEqual(platinumLongfinApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });

const blackLongfinIdentity = getCatalogFieldReviews('sp_0272').filter(review => review.field === 'identity').at(-1);
assert.equal(blackLongfinIdentity?.resolution, 'supported');
assert.deepEqual(blackLongfinIdentity?.proposedValue, {
  scientificName: 'Pterophyllum scalare var. Black Longfin',
  baseSpeciesKey: 'Pterophyllum scalare',
  variantKey: 'Black Veil / Longfin',
});
const blackLongfinApproved = new Map(getApprovedCatalogFieldReviews('sp_0272').map(review => [review.field, review]));
assert.equal(blackLongfinApproved.get('water')?.proposedValue, 'freshwater');
assert.deepEqual(blackLongfinApproved.get('temperature')?.proposedValue, { min: 24, max: 30 });
assert.deepEqual(blackLongfinApproved.get('ph')?.proposedValue, { min: 6, max: 8 });
assert.deepEqual(blackLongfinApproved.get('adult_size')?.proposedValue, { min: null, max: 15 });
assert.deepEqual(blackLongfinApproved.get('tank_size')?.proposedValue, { liters: null, lengthCm: 100 });
assert.deepEqual(blackLongfinApproved.get('social_behavior')?.proposedValue, { mode: 'group', minimumGroupSize: 5 });
assert.deepEqual(blackLongfinApproved.get('territoriality')?.proposedValue, { traits: ['breeding_male_territoriality'] });
assert.deepEqual(blackLongfinApproved.get('predation')?.proposedValue, { targets: ['small_fish'] });


console.log('Identity-bound catalog bridges passed: unresolved variants stay bounded while reviewed Marble, Blood Red A, Albino Red, Albino Gyrinocheilus, Fire Red Agassizii, and Blue Diamond, Panda, Super Red, Platinum Longfin, and Black Longfin angelfish corrections inherit only explicit same-species authority');

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

console.log('Identity-bound catalog bridges passed: unresolved variants stay bounded while reviewed Marble, Blood Red A, and Albino Red corrections inherit only explicit same-species authority');

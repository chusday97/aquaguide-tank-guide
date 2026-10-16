import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityResearchDirectWave25AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/research-direct-wave25-20261016';

const latestField = (speciesId: string, field: string) => (
  [...getApprovedCatalogFieldReviews(speciesId)].reverse().find(review => review.field === field)
);

assert.deepEqual(latestField('sp_0475', 'territoriality')?.proposedValue, { traits: [] });
assert.deepEqual(latestField('sp_0452', 'territoriality')?.proposedValue, { traits: ['territorial'] });
assert.deepEqual(latestField('sp_0129', 'territoriality')?.proposedValue, { traits: [] });
assert.deepEqual(latestField('sp_0024', 'temperature')?.proposedValue, { min: 23, max: 27 });
assert.deepEqual(latestField('sp_0024', 'tank_size')?.proposedValue, { liters: 1000, lengthCm: null });
assert.deepEqual(latestField('sp_0024', 'territoriality')?.proposedValue, { traits: [] });
assert.deepEqual(latestField('sp_0023', 'temperature')?.proposedValue, { min: 23, max: 27 });
assert.deepEqual(latestField('sp_0023', 'ph')?.proposedValue, { min: 8.2, max: 8.4 });
assert.deepEqual(latestField('sp_0023', 'tank_size')?.proposedValue, { liters: 600, lengthCm: null });
assert.deepEqual(latestField('sp_0023', 'territoriality')?.proposedValue, { traits: [] });

const rhodeus = getReviewedCompatibilityProfile('sp_0475');
const amphiprion = getReviewedCompatibilityProfile('sp_0452');
const zacco = getReviewedCompatibilityProfile('sp_0129');
const paracanthurus = getReviewedCompatibilityProfile('sp_0024');
const zebrasoma = getReviewedCompatibilityProfile('sp_0023');
assert.ok(rhodeus?.requiredFacts.includes('territoriality'));
assert.equal(rhodeus?.behaviorTraits.includes('territorial'), false);
assert.ok(amphiprion?.requiredFacts.includes('territoriality'));
assert.ok(amphiprion?.behaviorTraits.includes('territorial'));
assert.ok(zacco?.requiredFacts.includes('territoriality'));
assert.equal(zacco?.behaviorTraits.includes('territorial'), false);
assert.deepEqual(zacco?.predationTargets, ['small_fish'], 'territoriality review must not alter existing Zacco predation authority');
assert.ok(paracanthurus?.requiredFacts.includes('temperature'));
assert.ok(paracanthurus?.requiredFacts.includes('tank_size'));
assert.ok(paracanthurus?.requiredFacts.includes('territoriality'));
assert.equal(paracanthurus?.requiredFacts.includes('ph'), false);
assert.equal(paracanthurus?.requiredFacts.includes('predation'), false);
assert.equal(paracanthurus?.behaviorTraits.includes('territorial'), false);
assert.deepEqual(paracanthurus?.predationTargets, [], 'diet/ecology must not be promoted into predation scope');
assert.ok(zebrasoma?.requiredFacts.includes('temperature'));
assert.ok(zebrasoma?.requiredFacts.includes('ph'));
assert.ok(zebrasoma?.requiredFacts.includes('tank_size'));
assert.ok(zebrasoma?.requiredFacts.includes('territoriality'));
assert.equal(zebrasoma?.requiredFacts.includes('predation'), false);
assert.equal(zebrasoma?.behaviorTraits.includes('territorial'), false);
assert.deepEqual(zebrasoma?.predationTargets, [], 'herbivory must not be converted into a predation-safety claim');

const rows = buildCompatibilityCoreFieldCoverage().rows;
const coverage = (id: string) => rows.find(row => row.speciesId === id)!;
assert.equal(coverage('sp_0475').fields.territoriality.status, 'reviewed_neutral_or_negative');
assert.equal(coverage('sp_0475').fields.predation.status, 'reviewed_unknown');
assert.equal(coverage('sp_0452').fields.territoriality.status, 'reviewed_supported');
assert.equal(coverage('sp_0452').fields.ph.status, 'reviewed_unknown');
assert.equal(coverage('sp_0452').fields.predation.status, 'reviewed_unknown');
assert.equal(coverage('sp_0129').fields.territoriality.status, 'reviewed_neutral_or_negative');
assert.equal(coverage('sp_0129').fields.ph.status, 'reviewed_unknown');
assert.equal(coverage('sp_0129').fields.tank_size.status, 'reviewed_unknown');
assert.equal(coverage('sp_0024').fields.temperature.status, 'reviewed_supported');
assert.equal(coverage('sp_0024').fields.tank_size.status, 'reviewed_supported');
assert.equal(coverage('sp_0024').fields.territoriality.status, 'reviewed_neutral_or_negative');
assert.equal(coverage('sp_0024').fields.ph.status, 'reviewed_unknown');
assert.equal(coverage('sp_0024').fields.predation.status, 'reviewed_unknown');
assert.equal(coverage('sp_0023').fields.temperature.status, 'reviewed_supported');
assert.equal(coverage('sp_0023').fields.ph.status, 'reviewed_supported');
assert.equal(coverage('sp_0023').fields.tank_size.status, 'reviewed_supported');
assert.equal(coverage('sp_0023').fields.territoriality.status, 'reviewed_neutral_or_negative');
assert.equal(coverage('sp_0023').fields.predation.status, 'reviewed_unknown');

assert.equal(compatibilityResearchDirectWave25AuthorityPatch.promotedFieldCount, 10);
assert.equal(compatibilityResearchDirectWave25AuthorityPatch.writesProductionAuthority, false);
console.log('Compatibility research direct Wave25 PASS: ten exact-taxon direct husbandry fields are promoted; pH/predation evidence boundaries remain fail-closed.');

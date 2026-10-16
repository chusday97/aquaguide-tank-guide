import assert from 'node:assert/strict';
import { catalogContentVerifiedSourceIds, getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityPredationNegativeWave26AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-negative-wave26-20261016';

const predation = [...getApprovedCatalogFieldReviews('sp_0011')].reverse().find(review => review.field === 'predation');
assert.ok(catalogContentVerifiedSourceIds.has('seriouslyfish-xiphophorus-maculatus'));
assert.deepEqual(predation?.proposedValue, { targets: [] });
assert.deepEqual(predation?.citationIds, ['seriouslyfish-xiphophorus-maculatus']);
assert.ok(predation?.conflictNotes.some(note => note.includes('adult fish will not eat their young')));

const profile = getReviewedCompatibilityProfile('sp_0011');
assert.deepEqual(profile?.predationTargets, []);
assert.ok(profile?.requiredFacts.includes('predation'));
assert.equal(profile?.requiredFacts.length, 8, 'Wave26 should make Xiphophorus maculatus a complete 8/8 reviewed runtime profile');

const row = buildCompatibilityCoreFieldCoverage().rows.find(item => item.speciesId === 'sp_0011');
assert.equal(row?.fields.predation.status, 'reviewed_neutral_or_negative');
assert.equal(row?.actionableGapCount, 0);
assert.equal(row?.genericOnboardingReady, true);

assert.equal(compatibilityPredationNegativeWave26AuthorityPatch.promotedFieldCount, 1);
assert.equal(compatibilityPredationNegativeWave26AuthorityPatch.newEvidenceSourceCount, 0);
assert.equal(compatibilityPredationNegativeWave26AuthorityPatch.writesProductionAuthority, false);
console.log('Compatibility predation-negative Wave26 PASS: Xiphophorus maculatus closes predation from direct no-fry-predation evidence while reusing the existing reviewed source.');

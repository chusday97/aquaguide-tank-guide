import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityWaterDirectWave27AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/water-direct-wave27-20261016';

const promoted = ['sp_0470','sp_0471','sp_0111','sp_0113','sp_0135','sp_0060','sp_0136','sp_0106','sp_0061','sp_0137','sp_0107','sp_0128','sp_0467'];
const multiWaterNotFreshwaterOnly = ['sp_0037','sp_0041'];
const laterPromoted = ['sp_0473'];
const coverage = buildCompatibilityCoreFieldCoverage();
const rowOf = (speciesId: string) => coverage.rows.find(row => row.speciesId === speciesId);
const supportedWater = (speciesId: string) => [...getApprovedCatalogFieldReviews(speciesId)].reverse().find(review => review.field === 'water' && review.resolution === 'supported');

for (const speciesId of promoted) {
  assert.equal(supportedWater(speciesId)?.proposedValue, 'freshwater', `${speciesId} must have direct reviewed freshwater authority in Wave27`);
  assert.equal(rowOf(speciesId)?.fields.water.status, 'reviewed_supported', `${speciesId} water must become reviewed_supported`);
  assert.equal(rowOf(speciesId)?.fields.water.disposition, 'ready', `${speciesId} water must leave targeted research`);
}
for (const speciesId of multiWaterNotFreshwaterOnly) {
  assert.equal(supportedWater(speciesId), undefined, `${speciesId} must not gain a freshwater-only CatalogFieldReview from Wave27`);
  assert.equal(rowOf(speciesId)?.fields.water.status, 'reviewed_supported', `${speciesId} must preserve reviewed multi-water authority`);
  assert.equal(rowOf(speciesId)?.fields.water.disposition, 'ready', `${speciesId} multi-water authority must not be downgraded to targeted research`);
  assert.equal(rowOf(speciesId)?.fields.water.authoritySource, 'species_knowledge');
}
for (const speciesId of laterPromoted) {
  assert.equal(supportedWater(speciesId)?.proposedValue, 'freshwater', `${speciesId} may be promoted by a later exact-taxon water review`);
  assert.equal(rowOf(speciesId)?.fields.water.disposition, 'ready', `${speciesId} current cumulative authority must reflect the later promotion`);
}
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.promotedFieldCount, 13);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.uniqueEvidencePageCount, 11);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.reusedEvidenceSourceCount, 4);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.newEvidenceSourceCount, 7);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.writesProductionAuthority, false);
console.log('Compatibility direct-water Wave27 PASS: 13 exact catalog rows gain explicit freshwater authority; pre-existing multi-water authority stays multi-water, and later exact-taxon promotions are respected by cumulative runtime tests.');

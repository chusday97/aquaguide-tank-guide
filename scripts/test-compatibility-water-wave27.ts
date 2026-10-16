import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityWaterDirectWave27AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/water-direct-wave27-20261016';

const promoted = ['sp_0470','sp_0471','sp_0111','sp_0113','sp_0135','sp_0060','sp_0136','sp_0106','sp_0061','sp_0137','sp_0107','sp_0128','sp_0467'];
const rejected = ['sp_0037','sp_0041','sp_0473'];
const coverage = buildCompatibilityCoreFieldCoverage();
const rowOf = (speciesId: string) => coverage.rows.find(row => row.speciesId === speciesId);
const supportedWater = (speciesId: string) => [...getApprovedCatalogFieldReviews(speciesId)].reverse().find(review => review.field === 'water' && review.resolution === 'supported');

for (const speciesId of promoted) {
  assert.equal(supportedWater(speciesId)?.proposedValue, 'freshwater', `${speciesId} must have direct reviewed freshwater authority in Wave27`);
  assert.equal(rowOf(speciesId)?.fields.water.status, 'reviewed_supported', `${speciesId} water must become reviewed_supported`);
  assert.equal(rowOf(speciesId)?.fields.water.disposition, 'ready', `${speciesId} water must leave targeted research`);
}
for (const speciesId of rejected) {
  assert.equal(supportedWater(speciesId), undefined, `${speciesId} must remain without a supported freshwater-only review`);
  assert.equal(rowOf(speciesId)?.fields.water.disposition, 'targeted_source_expansion', `${speciesId} must remain fail-closed for water`);
}
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.promotedFieldCount, 13);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.uniqueEvidencePageCount, 11);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.reusedEvidenceSourceCount, 4);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.newEvidenceSourceCount, 7);
assert.equal(compatibilityWaterDirectWave27AuthorityPatch.writesProductionAuthority, false);
console.log('Compatibility direct-water Wave27 PASS: 13 exact catalog rows gain explicit freshwater authority; multi-water and template-only cases remain fail-closed.');

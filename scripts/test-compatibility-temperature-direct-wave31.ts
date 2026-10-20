import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import {
  compatibilityTemperatureDirectWave31FieldReviews,
  compatibilityTemperatureDirectWave31ProfilePatches,
  compatibilityTemperatureDirectWave31VerifiedSourceIds,
} from '../src/data/compatibilityAuthorityPatches/temperature-direct-wave31-20261020';
import { getCompatibilityCoreFieldCoverageRow } from '../src/services/compatibility/compatibility-field-coverage.service';

const species = fishData.find(item => item.id === 'sp_0051');
assert.ok(species, 'sp_0051 must exist');
assert.equal(compatibilityTemperatureDirectWave31FieldReviews.length, 1);
assert.equal(compatibilityTemperatureDirectWave31ProfilePatches.length, 0, 'wave31 must not create a profile shortcut');
assert.equal(compatibilityTemperatureDirectWave31VerifiedSourceIds.length, 2);

const review = getApprovedCatalogFieldReviews('sp_0051').find(item => item.field === 'temperature');
assert.ok(review, 'sp_0051 temperature must be visible through the unified approved field-review registry');
assert.deepEqual(review?.proposedValue, { min: 12, max: 28 });
assert.equal(review?.confidence, 'medium');
assert.ok(review?.citationIds.every(id => compatibilityTemperatureDirectWave31VerifiedSourceIds.includes(id)));

const coverage = getCompatibilityCoreFieldCoverageRow(species!);
assert.equal(coverage.fields.temperature.status, 'reviewed_supported');
assert.equal(coverage.fields.temperature.disposition, 'ready');
assert.equal(coverage.fields.temperature.authoritySource, 'catalog_field_review');
assert.deepEqual(coverage.fields.temperature.evidenceIds.sort(), [...compatibilityTemperatureDirectWave31VerifiedSourceIds].sort());

console.log('Compatibility temperature wave31 PASS: sp_0051 exact-taxon 12-28 C authority is registered in the unified runtime review registry, with no profile/pair shortcut added.');

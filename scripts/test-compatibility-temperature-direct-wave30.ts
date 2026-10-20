import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  applyApprovedCatalogFieldReviews,
  getApprovedCatalogFieldReviews,
} from '../src/data/catalogFieldReviews';
import { getCompatibilityFieldResearchCeiling } from '../src/data/compatibilityFieldResearchCeilings';
import {
  compatibilityTemperatureDirectWave30FieldReviews,
  compatibilityTemperatureDirectWave30ProfilePatches,
  compatibilityTemperatureDirectWave30VerifiedSourceIds,
} from '../src/data/compatibilityAuthorityPatches/temperature-direct-wave30-20261020';
import { speciesProfileFromFish } from '../src/services/catalog/species-profile.adapter';
import { getCompatibilityCoreFieldCoverageRow } from '../src/services/compatibility/compatibility-field-coverage.service';

const species = fishData.find(item => item.id === 'sp_0046');
assert.ok(species, 'sp_0046 must exist');

assert.equal(compatibilityTemperatureDirectWave30FieldReviews.length, 1);
assert.equal(compatibilityTemperatureDirectWave30ProfilePatches.length, 0, 'wave30 must not create a profile shortcut');
assert.equal(compatibilityTemperatureDirectWave30VerifiedSourceIds.length, 2);

const review = getApprovedCatalogFieldReviews('sp_0046').find(item => item.field === 'temperature');
assert.ok(review, 'sp_0046 temperature must be an approved source-controlled field review');
assert.deepEqual(review?.proposedValue, { min: 19, max: 25 });
assert.equal(review?.confidence, 'medium');
assert.ok(review?.citationIds.every(id => compatibilityTemperatureDirectWave30VerifiedSourceIds.includes(id)));

const applied = applyApprovedCatalogFieldReviews(speciesProfileFromFish(species!));
assert.equal(applied.waterTemperatureMinC, 19);
assert.equal(applied.waterTemperatureMaxC, 25);

const coverage = getCompatibilityCoreFieldCoverageRow(species!);
assert.equal(coverage.fields.temperature.status, 'reviewed_supported');
assert.equal(coverage.fields.temperature.disposition, 'ready');
assert.equal(coverage.fields.temperature.authoritySource, 'catalog_field_review');
assert.deepEqual(coverage.fields.temperature.evidenceIds.sort(), [...compatibilityTemperatureDirectWave30VerifiedSourceIds].sort());

assert.equal(
  getCompatibilityFieldResearchCeiling('sp_0046', 'temperature'),
  null,
  'new exact-taxon authority must retire the old terminal temperature research ceiling',
);
assert.ok(getCompatibilityFieldResearchCeiling('sp_0046', 'ph'));
assert.ok(getCompatibilityFieldResearchCeiling('sp_0046', 'tank_size'));

console.log('Compatibility temperature wave30 PASS: sp_0046 exact-taxon 19-25 C authority is ready, old temperature ceiling retired, no profile/pair shortcut added.');

import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityResearchCoverageWave21Sources } from '../src/data/compatibilityAuthorityPatches/research-coverage-wave21-20261015';
import { compatibilityResearchCoverageWave23AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/research-coverage-wave23-20261016';

const sourceId = compatibilityResearchCoverageWave21Sources.fishipedia_chrysiptera_cyanea.id;
const reviews = getApprovedCatalogFieldReviews('sp_0187');
const adult = [...reviews].reverse().find(review => review.field === 'adult_size');
const tank = [...reviews].reverse().find(review => review.field === 'tank_size');
assert.deepEqual(adult?.proposedValue, { min: null, max: 8 });
assert.deepEqual(tank?.proposedValue, { liters: 200, lengthCm: null });
assert.deepEqual(adult?.citationIds, [sourceId]);
assert.deepEqual(tank?.citationIds, [sourceId]);
assert.equal(adult?.status, 'reviewed');
assert.equal(tank?.status, 'reviewed');
assert.equal(adult?.resolution, 'supported');
assert.equal(tank?.resolution, 'supported');

const coverage = buildCompatibilityCoreFieldCoverage().rows.find(row => row.speciesId === 'sp_0187');
assert.ok(coverage);
assert.equal(coverage?.authoritativeFieldCount, 8);
assert.equal(coverage?.actionableGapCount, 0);
assert.equal(coverage?.terminalGapCount, 0);
assert.equal(coverage?.genericOnboardingReady, true);
assert.deepEqual(compatibilityResearchCoverageWave23AuthorityPatch.speciesIds, ['sp_0187']);
assert.equal(compatibilityResearchCoverageWave23AuthorityPatch.promotedFieldCount, 2);
assert.equal(compatibilityResearchCoverageWave23AuthorityPatch.writesProductionAuthority, false);
console.log('Compatibility research coverage wave23 PASS: Chrysiptera cyanea closes only adult_size and tank_size from the existing reviewed exact-taxon Fishipedia source and reaches 8/8 generic readiness.');

import assert from 'node:assert/strict';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityEnvironmentDirectWave28AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/environment-direct-wave28-20261016';

const coverage = buildCompatibilityCoreFieldCoverage();
const row = coverage.rows.find(item => item.speciesId === 'sp_0472');
const latest = (field: 'water' | 'ph') => [...getApprovedCatalogFieldReviews('sp_0472')]
  .reverse()
  .find(review => review.field === field && review.resolution === 'supported');

assert.equal(latest('water')?.proposedValue, 'freshwater');
assert.deepEqual(latest('ph')?.proposedValue, { min: 6, max: 8 });
assert.equal(row?.fields.water.status, 'reviewed_supported');
assert.equal(row?.fields.water.disposition, 'ready');
assert.equal(row?.fields.ph.status, 'reviewed_supported');
assert.equal(row?.fields.ph.disposition, 'ready');
assert.equal(row?.actionableGapCount, 0, 'later Wave36 evidence ceilings must remove repetitive predation research without retroactively changing Wave28 environment authority');
assert.equal(row?.fields.predation.status, 'reviewed_unknown');
assert.equal(row?.fields.predation.disposition, 'terminal_hold');
assert.equal(row?.fields.predation.authoritySource, 'evidence_ceiling');
assert.equal(row?.fields.predation.reasonCode, 'species_fish_predation_not_established');
assert.equal(row?.genericOnboardingReady, false, 'terminal social and predation evidence ceilings still prevent 8/8 generic readiness');
assert.equal(compatibilityEnvironmentDirectWave28AuthorityPatch.promotedFieldCount, 2);
assert.equal(compatibilityEnvironmentDirectWave28AuthorityPatch.reusedEvidenceSourceCount, 1);
assert.equal(compatibilityEnvironmentDirectWave28AuthorityPatch.newEvidenceSourceCount, 1);
assert.equal(compatibilityEnvironmentDirectWave28AuthorityPatch.writesProductionAuthority, false);
console.log('Compatibility environment Wave28 PASS: exact Thayeria boehlkei freshwater + pH 6–8 authority remains intact while later Wave36 predation evidence ceiling monotonically terminalizes repetitive research; terminal social/predation holds remain fail-closed.');

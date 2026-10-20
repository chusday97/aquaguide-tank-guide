import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { compatibilityAuthorityPatchManifests } from '../src/data/compatibilityAuthorityPatches';
import { compatibilityPredationRiskDiscoveryWave32AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave32-20261020';
import { compatibilityPredationRiskDiscoveryWave33AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave33-20261020';
import { buildReviewedCompatibilityProfileFromCatalogFields } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const predation = [...getApprovedCatalogFieldReviews('sp_0135')].reverse().find(review => review.field === 'predation');
assert.deepEqual(predation?.proposedValue, { targets: ['fish_fry'] });
assert.equal(predation?.status, 'reviewed');
assert.equal(predation?.resolution, 'supported');
assert.equal(predation?.confidence, 'high');
assert.deepEqual(predation?.citationIds, ['seriouslyfish-pseudomugil-furcatus-numeric-husbandry']);

const coverage = buildCompatibilityCoreFieldCoverage();
const row = coverage.rows.find(item => item.speciesId === 'sp_0135');
assert.equal(row?.fields.predation.status, 'reviewed_supported');
assert.equal(row?.fields.predation.disposition, 'ready');
assert.equal(row?.fields.predation.authoritySource, 'catalog_field_review');
assert.equal(row?.authoritativeFieldCount, 6);
assert.equal(row?.genericOnboardingReady, false, 'two independent social/territorial evidence ceilings must stay fail-closed');
assert.equal(coverage.backlog.some(item => item.speciesId === 'sp_0135' && item.field === 'predation'), false);
assert.equal(buildReviewedCompatibilityProfileFromCatalogFields('sp_0135'), undefined, '6/8 authority must remain below the generic 8/8 runtime gate');

const base = {
  waterType: 'freshwater' as const,
  temperatureMinC: 24,
  temperatureMaxC: 28,
  phMin: 7,
  phMax: 8,
  minTankLiters: 54,
  reviewed: true,
  requiredFacts: ['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'] as const,
};
const predator = { ...base, id: 'pseudomugil-furcatus', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: ['fish_fry'] };
const prey = { ...base, id: 'prey', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: [] as string[] };
const fryDecision = evaluateCompatibility({
  intent: 'record_existing',
  existingSpecies: [predator],
  candidateSpecies: prey,
  candidateContext: { lifeStage: 'fry', reproductiveState: 'unknown' },
});
assert.ok(fryDecision.ruleCodes.includes('fry_predation_risk'));
const adultDecision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [predator], candidateSpecies: prey });
assert.equal(adultDecision.ruleCodes.includes('fry_predation_risk'), false, 'fish_fry authority must not widen to adult small fish');

const manifestIds = new Set(compatibilityAuthorityPatchManifests.map(item => item.patchId));
assert.ok(manifestIds.has(compatibilityPredationRiskDiscoveryWave32AuthorityPatch.patchId), 'wave32 source-controlled authority must be auditable through the aggregate manifest');
assert.ok(manifestIds.has(compatibilityPredationRiskDiscoveryWave33AuthorityPatch.patchId), 'wave33 source-controlled authority must be auditable through the aggregate manifest');
assert.equal(compatibilityPredationRiskDiscoveryWave33AuthorityPatch.promotedFieldCount, 1);
assert.equal(compatibilityPredationRiskDiscoveryWave33AuthorityPatch.writesProductionAuthority, false);

console.log('Compatibility predation risk-discovery Wave33 PASS: Pseudomugil furcatus closes only fry predation from exact-taxon breeding evidence; adult small-fish risk remains unpromoted and wave32/wave33 manifests are auditable.');

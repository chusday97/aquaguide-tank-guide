import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { compatibilityAuthorityPatchManifests } from '../src/data/compatibilityAuthorityPatches';
import { compatibilityPredationRiskDiscoveryWave35AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave35-20261021';
import { buildReviewedCompatibilityProfileFromCatalogFields } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const expected = new Map([
  ['sp_0467', 'aquaticcommunity-hyphessobrycon-megalopterus-fry-predation-wave35'],
  ['sp_0470', 'aquariumindustries-hyphessobrycon-herbertaxelrodi-fry-predation-wave35'],
  ['sp_0025', 'noaa-pterapogon-kauderni-guppy-fry-predation-wave35'],
  ['sp_0060', 'seriouslyfish-sphaerichthys-osphromenoides-numeric-husbandry'],
  ['sp_0136', 'seriouslyfish-sphaerichthys-osphromenoides-numeric-husbandry'],
]);

for (const [speciesId, sourceId] of expected) {
  const review = [...getApprovedCatalogFieldReviews(speciesId)].reverse().find(item => item.field === 'predation');
  assert.deepEqual(review?.proposedValue, { targets: ['fish_fry'] });
  assert.ok(review?.citationIds.includes(sourceId), `${speciesId} must cite its exact reviewed fry-predation source`);
}

const coverage = buildCompatibilityCoreFieldCoverage();
for (const speciesId of expected.keys()) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.equal(row?.fields.predation.status, 'reviewed_supported');
  assert.equal(row?.fields.predation.disposition, 'ready');
  assert.equal(row?.fields.predation.authoritySource, 'catalog_field_review');
  assert.equal(coverage.backlog.some(item => item.speciesId === speciesId && item.field === 'predation'), false);
  assert.equal(row?.genericOnboardingReady, false, `${speciesId} must keep independent evidence ceilings fail-closed`);
  assert.equal(buildReviewedCompatibilityProfileFromCatalogFields(speciesId), undefined, `${speciesId} must not build a generic profile below 8/8 reviewed authority`);
}

const base = {
  waterType: 'freshwater' as const,
  temperatureMinC: 24,
  temperatureMaxC: 26,
  phMin: 6,
  phMax: 7,
  minTankLiters: 80,
  reviewed: true,
  requiredFacts: ['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'] as const,
};
const prey = { ...base, id: 'prey', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: [] as string[] };

for (const predatorId of ['hyphessobrycon-megalopterus','hyphessobrycon-herbertaxelrodi','pterapogon-kauderni','sphaerichthys-osphromenoides']) {
  const predator = { ...base, id: predatorId, lifeType: 'fish' as const, size: 'Small' as const, predationTargets: ['fish_fry'] };
  const fryDecision = evaluateCompatibility({
    intent: 'record_existing',
    existingSpecies: [predator],
    candidateSpecies: prey,
    candidateContext: { lifeStage: 'fry', reproductiveState: 'unknown' },
  });
  assert.ok(fryDecision.ruleCodes.includes('fry_predation_risk'), `${predatorId} must surface reviewed fry predation`);
  const adultDecision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [predator], candidateSpecies: prey });
  assert.equal(adultDecision.ruleCodes.includes('fry_predation_risk'), false, `${predatorId} fry authority must not widen to adult small fish`);
}

const manifestIds = new Set(compatibilityAuthorityPatchManifests.map(item => item.patchId));
assert.ok(manifestIds.has(compatibilityPredationRiskDiscoveryWave35AuthorityPatch.patchId));
assert.equal(compatibilityPredationRiskDiscoveryWave35AuthorityPatch.promotedFieldCount, 5);
assert.equal(compatibilityPredationRiskDiscoveryWave35AuthorityPatch.newEvidenceSourceCount, 3);
assert.equal(compatibilityPredationRiskDiscoveryWave35AuthorityPatch.writesProductionAuthority, false);

console.log('Compatibility predation risk-discovery Wave35 PASS: two tetra taxa, Banggai cardinalfish, and two exact Sphaerichthys catalog objects gain bounded fish_fry authority without widening to adult small fish.');

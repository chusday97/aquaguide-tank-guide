import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { buildReviewedCompatibilityProfileFromCatalogFields, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { compatibilityPredationRiskDiscoveryWave32AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave32-20261020';

const reedfish = [...getApprovedCatalogFieldReviews('sp_0106')].reverse().find(review => review.field === 'predation');
const glassCatfish = [...getApprovedCatalogFieldReviews('sp_0458')].reverse().find(review => review.field === 'predation');

assert.deepEqual(reedfish?.proposedValue, { targets: ['small_fish'] });
assert.equal(reedfish?.status, 'reviewed');
assert.equal(reedfish?.resolution, 'supported');
assert.equal(reedfish?.confidence, 'high');

assert.deepEqual(glassCatfish?.proposedValue, { targets: ['fish_fry'] });
assert.equal(glassCatfish?.status, 'reviewed');
assert.equal(glassCatfish?.resolution, 'supported');
assert.equal(glassCatfish?.confidence, 'medium');

assert.equal(getReviewedCompatibilityProfile('sp_0106'), undefined, 'wave32 must not create a direct profile shortcut');
assert.equal(getReviewedCompatibilityProfile('sp_0458'), undefined, 'wave32 must not create a direct profile shortcut');
assert.equal(buildReviewedCompatibilityProfileFromCatalogFields('sp_0106'), undefined, '6/8 reviewed facts must remain below generic 8/8 runtime gate');
assert.equal(buildReviewedCompatibilityProfileFromCatalogFields('sp_0458'), undefined, '6/8 reviewed facts must remain below generic 8/8 runtime gate');

const coverage = buildCompatibilityCoreFieldCoverage();
for (const speciesId of ['sp_0106', 'sp_0458']) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.equal(row?.fields.predation.status, 'reviewed_supported');
  assert.equal(row?.fields.predation.disposition, 'ready');
  assert.equal(row?.fields.predation.authoritySource, 'catalog_field_review');
  assert.equal(row?.authoritativeFieldCount, 6);
  assert.equal(coverage.backlog.some(item => item.speciesId === speciesId && item.field === 'predation'), false);
}

const base = {
  waterType: 'freshwater' as const,
  temperatureMinC: 24,
  temperatureMaxC: 26,
  phMin: 6.5,
  phMax: 7.5,
  minTankLiters: 500,
  reviewed: true,
  requiredFacts: ['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'] as const,
};
const smallFishPredator = { ...base, id: 'reedfish', lifeType: 'fish' as const, size: 'Large' as const, predationTargets: ['small_fish'] };
const smallFish = { ...base, id: 'small-prey', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: [] as string[] };
const mediumFish = { ...base, id: 'medium-prey', lifeType: 'fish' as const, size: 'Medium' as const, predationTargets: [] as string[] };
const smallDecision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [smallFishPredator], candidateSpecies: smallFish });
assert.ok(smallDecision.ruleCodes.includes('predation_risk'));
const mediumDecision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [smallFishPredator], candidateSpecies: mediumFish });
assert.equal(mediumDecision.ruleCodes.includes('predation_risk'), false, 'small_fish authority must not widen to medium fish');

const fryPredator = { ...base, id: 'glass-catfish', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: ['fish_fry'] };
const adultPrey = { ...base, id: 'adult-prey', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: [] as string[] };
const fryDecision = evaluateCompatibility({
  intent: 'record_existing',
  existingSpecies: [fryPredator],
  candidateSpecies: adultPrey,
  candidateContext: { lifeStage: 'fry', reproductiveState: 'unknown' },
});
assert.ok(fryDecision.ruleCodes.includes('fry_predation_risk'));
const adultDecision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [fryPredator], candidateSpecies: adultPrey });
assert.equal(adultDecision.ruleCodes.includes('fry_predation_risk'), false, 'fish_fry authority must not widen to adult small fish');

assert.equal(compatibilityPredationRiskDiscoveryWave32AuthorityPatch.promotedFieldCount, 2);
assert.equal(compatibilityPredationRiskDiscoveryWave32AuthorityPatch.writesProductionAuthority, false);

console.log('Compatibility predation risk-discovery Wave32 PASS: reedfish is bounded to small-fish predation and glass catfish to fry predation; neither target widens beyond direct exact-taxon evidence.');

import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { compatibilityAuthorityPatchManifests } from '../src/data/compatibilityAuthorityPatches';
import { compatibilityPredationRiskDiscoveryWave34AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-risk-discovery-wave34-20261020';
import { buildReviewedCompatibilityProfileFromCatalogFields } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const latestPredation = (speciesId: string) => (
  [...getApprovedCatalogFieldReviews(speciesId)].reverse().find(review => review.field === 'predation')
);

const epiplatys = latestPredation('sp_0113');
assert.deepEqual(epiplatys?.proposedValue, { targets: [] });
assert.equal(epiplatys?.confidence, 'medium');
assert.deepEqual(epiplatys?.citationIds, ['seriouslyfish-epiplatys-annulatus-numeric-husbandry']);

const nannostomus = latestPredation('sp_0473');
assert.deepEqual(nannostomus?.proposedValue, { targets: ['fish_fry'] });
assert.equal(nannostomus?.confidence, 'medium');
assert.deepEqual(nannostomus?.citationIds, ['seriouslyfish-nannostomus-beckfordi-water-wave29']);

const iriatherina = latestPredation('sp_0134');
assert.deepEqual(iriatherina?.proposedValue, { targets: ['fish_fry'] });
assert.equal(iriatherina?.confidence, 'high');
assert.deepEqual(iriatherina?.citationIds, ['seriouslyfish-iriatherina-werneri-predation-wave34']);

const coverage = buildCompatibilityCoreFieldCoverage();
for (const speciesId of ['sp_0113', 'sp_0473', 'sp_0134']) {
  const row = coverage.rows.find(item => item.speciesId === speciesId);
  const expectedPredationStatus = speciesId === 'sp_0113' ? 'reviewed_neutral_or_negative' : 'reviewed_supported';
  assert.equal(row?.fields.predation.status, expectedPredationStatus);
  assert.equal(row?.fields.predation.disposition, 'ready');
  assert.equal(row?.fields.predation.authoritySource, 'catalog_field_review');
  assert.equal(row?.authoritativeFieldCount, 6);
  assert.equal(row?.genericOnboardingReady, false, `${speciesId} must keep social/territorial evidence ceilings fail-closed`);
  assert.equal(coverage.backlog.some(item => item.speciesId === speciesId && item.field === 'predation'), false);
  assert.equal(buildReviewedCompatibilityProfileFromCatalogFields(speciesId), undefined, `${speciesId} 6/8 authority must remain below the generic 8/8 runtime gate`);
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

for (const predatorId of ['nannostomus-beckfordi', 'iriatherina-werneri']) {
  const predator = { ...base, id: predatorId, lifeType: 'fish' as const, size: 'Small' as const, predationTargets: ['fish_fry'] };
  const fryDecision = evaluateCompatibility({
    intent: 'record_existing',
    existingSpecies: [predator],
    candidateSpecies: prey,
    candidateContext: { lifeStage: 'fry', reproductiveState: 'unknown' },
  });
  assert.ok(fryDecision.ruleCodes.includes('fry_predation_risk'), `${predatorId} must surface the reviewed fry risk`);
  const adultDecision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [predator], candidateSpecies: prey });
  assert.equal(adultDecision.ruleCodes.includes('fry_predation_risk'), false, `${predatorId} fry authority must not widen to adult small fish`);
}

const epiplatysPredator = { ...base, id: 'epiplatys-annulatus', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: [] as string[] };
const epiplatysFryDecision = evaluateCompatibility({
  intent: 'record_existing',
  existingSpecies: [epiplatysPredator],
  candidateSpecies: prey,
  candidateContext: { lifeStage: 'fry', reproductiveState: 'unknown' },
});
assert.equal(epiplatysFryDecision.ruleCodes.includes('fry_predation_risk'), false, 'adult Epiplatys negative offspring-predation authority must not emit a fry risk');

const manifestIds = new Set(compatibilityAuthorityPatchManifests.map(item => item.patchId));
assert.ok(manifestIds.has(compatibilityPredationRiskDiscoveryWave34AuthorityPatch.patchId));
assert.equal(compatibilityPredationRiskDiscoveryWave34AuthorityPatch.promotedFieldCount, 3);
assert.equal(compatibilityPredationRiskDiscoveryWave34AuthorityPatch.newEvidenceSourceCount, 1);
assert.equal(compatibilityPredationRiskDiscoveryWave34AuthorityPatch.writesProductionAuthority, false);

console.log('Compatibility predation risk-discovery Wave34 PASS: Epiplatys adult offspring-predation stays negative, Nannostomus keeps bounded low-frequency fry risk, and Iriatherina gets direct fry-predation authority without widening to adult small fish.');

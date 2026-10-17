import assert from 'node:assert/strict';
import { evaluateCompatibility } from '../packages/domain-rules/src';
import { getApprovedCatalogFieldReviews } from '../src/data/catalogFieldReviews';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { buildBeginnerCompatibilityAction } from '../src/services/compatibility/compatibility-action.service';
import { applyCanonicalCompatibilityDecision } from '../src/lib/compatibility/canonical-result.adapter';
import { compatibilityPredationWave24AuthorityPatch } from '../src/data/compatibilityAuthorityPatches/predation-wave24-20261016';

const predation = [...getApprovedCatalogFieldReviews('sp_0185')].reverse().find(review => review.field === 'predation');
assert.deepEqual(predation?.proposedValue, { targets: ['fish_unspecified_size'] });
assert.equal(predation?.resolution, 'supported');
assert.equal(predation?.status, 'reviewed');

const profile = getReviewedCompatibilityProfile('sp_0185');
assert.ok(profile);
assert.deepEqual(profile?.predationTargets, ['fish_unspecified_size']);
assert.ok(profile?.requiredFacts.includes('predation'));
assert.equal(profile?.requiredFacts.includes('ph'), false, 'Wave24 must not fake pH readiness from an optimum single point');

const coverage = buildCompatibilityCoreFieldCoverage().rows.find(row => row.speciesId === 'sp_0185');
assert.ok(coverage);
assert.equal(coverage?.authoritativeFieldCount, 7);
assert.equal(coverage?.actionableGapCount, 0);
assert.equal(coverage?.terminalGapCount, 1);
assert.equal(coverage?.genericOnboardingReady, false);
assert.deepEqual(coverage?.fields.ph.status, 'reviewed_unknown');
assert.equal(coverage?.fields.ph.disposition, 'terminal_hold');
assert.equal(coverage?.fields.ph.reasonCode, 'species_ph_husbandry_range_not_established');
assert.deepEqual(coverage?.fields.predation.status, 'reviewed_supported');
assert.equal(compatibilityPredationWave24AuthorityPatch.promotedFieldCount, 1);
assert.equal(compatibilityPredationWave24AuthorityPatch.writesProductionAuthority, false);

const base = {
  waterType: 'saltwater' as const,
  temperatureMinC: 24,
  temperatureMaxC: 28,
  phMin: 8.1,
  phMax: 8.4,
  minTankLiters: 200,
  reviewed: true,
  requiredFacts: ['water','temperature','ph','adult_size','tank_size','social_behavior','territoriality','predation'] as const,
};
const predator = { ...base, id: 'predator', lifeType: 'fish' as const, size: 'Large' as const, predationTargets: ['fish_unspecified_size'] };
const smallFish = { ...base, id: 'small-fish', lifeType: 'fish' as const, size: 'Small' as const, predationTargets: [] as string[] };
const mediumFish = { ...base, id: 'medium-fish', lifeType: 'fish' as const, size: 'Medium' as const, predationTargets: [] as string[] };
for (const prey of [smallFish, mediumFish]) {
  const decision = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [predator], candidateSpecies: prey });
  assert.equal(decision.status, 'caution');
  assert.ok(decision.ruleCodes.includes('predation_scope_uncertain'));
  assert.equal(decision.ruleCodes.includes('predation_risk'), false);
  const canonical = applyCanonicalCompatibilityDecision({
    status: 'compatible',
    riskLevel: 'none',
    summary: 'legacy fixture',
    passedRules: [],
    warningRules: [],
    blockingRules: [],
    missingData: [],
    suggestions: [],
    metadata: {
      ruleVersion: 'wave24-test',
      speciesDataVersion: 'wave24-test',
      calculatedAt: '2026-10-16T13:56:00+08:00',
      scope: 'pair',
      intent: 'record_existing',
      catalogVersion: 'wave24-test',
      domainRuleCodes: decision.ruleCodes,
      domainStatus: decision.status,
      decisionReadiness: decision.decisionReadiness,
      authorityVersion: 'wave24-test',
    },
  } as any, decision);
  assert.equal(canonical.status, 'caution');
  assert.ok(canonical.warningRules.some(rule => rule.code === 'predation_scope_uncertain'));
  assert.equal(canonical.blockingRules.some(rule => rule.code === 'predation_risk'), false);
  const action = buildBeginnerCompatibilityAction(canonical as any);
  assert.equal(action.verdict, 'add_with_conditions');
  assert.match(action.headline, /体型/);
  assert.match(action.immediateAction, /明显更小|成体体型|口裂/);
}
const sameSpecies = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [predator], candidateSpecies: { ...predator } });
assert.equal(sameSpecies.ruleCodes.includes('predation_scope_uncertain'), false, 'generic fish-prey evidence must not invent conspecific predation');

console.log('Compatibility predation wave24 PASS: direct fish-prey evidence is represented without guessing prey size; runtime emits caution, not a blanket hard block, and Pomacanthus remains 7/8 with the unresolved pH range held at an explicit evidence ceiling.');

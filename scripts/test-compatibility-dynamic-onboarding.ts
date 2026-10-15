import assert from 'node:assert/strict';

import type { DomainSpeciesFact } from '../packages/domain-rules/src';
import { fishData } from '../src/data/fishData';
import {
  getCompatibilityEvidenceAudit,
  getReviewedCompatibilityProfile,
  getReviewedPairRule,
  getReviewedStageRiskProfile,
  type ReviewedCompatibilityProfile,
} from '../src/data/compatibilityEvidence';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { buildCompatibilityDecisionPlan, isCompatibilityDecisionFullyInformed } from '../src/services/compatibility/compatibility-decision-plan.service';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import type { CompatibilityEvidenceProvider } from '../src/services/compatibility/compatibility.service';
import type { Aquarium, Fish } from '../src/types';

const syntheticId = 'sp_dynamic_unregistered_fixture';
const syntheticScientificName = 'Fixtureus dynamicus';

assert.equal(fishData.some(item => item.id === syntheticId), false, 'synthetic species must not exist in the catalog');
assert.equal(
  fishData.some(item => item.scientificName.toLowerCase() === syntheticScientificName.toLowerCase()),
  false,
  'synthetic species scientific identity must not exist in the catalog',
);
assert.equal(getReviewedCompatibilityProfile(syntheticId), undefined, 'synthetic species must not exist in static Compatibility authority');

const syntheticFish: Fish = {
  id: syntheticId,
  name: '动态接入测试鱼',
  scientificName: syntheticScientificName,
  category: '鱼类',
  waterType: 'freshwater',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: 'Dynamic onboarding fixture; not persisted in catalog authority.',
  diet: '杂食',
  tankSize: '至少 60 升 / 60 cm',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};

const allCoreFacts = [
  'water',
  'temperature',
  'ph',
  'adult_size',
  'tank_size',
  'social_behavior',
  'territoriality',
  'predation',
] as const;

const readyDispositions = Object.fromEntries(allCoreFacts.map(field => [field, 'ready'])) as DomainSpeciesFact['compatibilityFactDispositions'];

const syntheticFact: DomainSpeciesFact = {
  id: syntheticId,
  waterType: 'freshwater',
  temperatureMinC: 24,
  temperatureMaxC: 28,
  phMin: 6.5,
  phMax: 7.5,
  minTankLiters: 60,
  minTankLengthCm: 60,
  reviewed: true,
  compatibilityRequiredFacts: [...allCoreFacts],
  compatibilityFactDispositions: readyDispositions,
  adultLengthMinCm: 3,
  adultLengthMaxCm: 5,
  socialMode: 'group',
  minimumGroupSize: 6,
  evidenceIds: ['dynamic-reviewed-source'],
  behaviorTraits: ['group_social'],
  territoriality: 'none',
  finNippingRisk: 'none',
  finNipVulnerability: 'low',
  swimmingPace: 'moderate',
  predationRisk: 'none',
  predationTargets: [],
  predationVulnerability: 'low',
  lifeType: 'fish',
  size: 'Small',
};

const syntheticProfile: ReviewedCompatibilityProfile = {
  speciesId: syntheticId,
  waterType: 'freshwater',
  behaviorTraits: ['group_social'],
  minimumGroupSize: 6,
  predationTargets: [],
  confidence: 'high',
  reviewStatus: 'reviewed',
  requiredFacts: [...allCoreFacts],
  citations: [{
    id: 'dynamic-reviewed-source',
    title: 'Dynamic onboarding reviewed fixture',
    publisher: 'AquaGuide Test Authority',
    url: 'https://example.invalid/dynamic-reviewed-source',
    sourceType: 'peer_reviewed',
    reviewStatus: 'reviewed',
  }],
};

const evidenceProvider: CompatibilityEvidenceProvider = {
  getProfile: speciesId => speciesId === syntheticId ? syntheticProfile : getReviewedCompatibilityProfile(speciesId),
  getPairRule: (leftId, rightId) => {
    if (leftId === syntheticId || rightId === syntheticId) return undefined;
    return getReviewedPairRule(leftId, rightId);
  },
  getStageRisks: speciesId => {
    const rule = getReviewedStageRiskProfile(speciesId);
    return rule ? [rule] : [];
  },
  getReviewedSpeciesFact: species => species.id === syntheticId ? syntheticFact : undefined,
  authorityVersion: 'dynamic-onboarding-test-v1',
};

const coverage = buildCompatibilityCoreFieldCoverage();
const readyIds = new Set(coverage.rows.filter(row => row.genericOnboardingReady).map(row => row.speciesId));
const readySpecies = fishData.filter(item => readyIds.has(item.id));
assert.ok(readySpecies.length >= 76, 'fixture requires the current reviewed-ready cohort');

const pairRuleCountBefore = getCompatibilityEvidenceAudit().reviewedPairRules.length;
const statuses: Record<string, number> = {
  compatible: 0,
  caution: 0,
  not_recommended: 0,
  insufficient_data: 0,
};

const tank: Aquarium = {
  id: 'dynamic-onboarding-tank',
  name: 'Dynamic onboarding tank',
  fishes: [],
  dimensions: { length: '500', width: '200', height: '100' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

let evaluated = 0;
for (const existing of readySpecies) {
  assert.equal(getReviewedPairRule(syntheticId, existing.id), undefined, 'synthetic onboarding must not pre-create Pair Rules');

  const decision = evaluateCompatibilityDecision({
    tank,
    items: [
      { species: existing, quantity: 10, origin: 'existing' },
      { species: syntheticFish, quantity: 6, origin: 'candidate' },
    ],
    evidenceProvider,
  });

  evaluated += 1;
  statuses[decision.status] = (statuses[decision.status] || 0) + 1;

  assert.equal(
    isCompatibilityDecisionFullyInformed(decision),
    true,
    'runtime-reviewed synthetic species must remain fully informed against ' + existing.id,
  );
  assert.notEqual(
    decision.status,
    'insufficient_data',
    'runtime-reviewed synthetic species must not require a precomputed pair against ' + existing.id,
  );
  assert.equal(decision.metadata.decisionReadiness, 'reviewed');
  assert.ok(!decision.metadata.domainRuleCodes.includes('reviewed_pair_rule'));

  const plan = buildCompatibilityDecisionPlan(decision);
  assert.notEqual(plan.judgment, '暂时无法判断');
  assert.ok(plan.nextSteps.length > 0, 'dynamic result must include next steps for ' + existing.id);
  assert.ok(plan.reviewCheckpoint.length > 0, 'dynamic result must include a recheck point for ' + existing.id);
  assert.ok(plan.stopCondition.length > 0, 'dynamic result must include a stop condition for ' + existing.id);
}

assert.equal(evaluated, readySpecies.length);
assert.equal(statuses.insufficient_data, 0);
assert.equal(getCompatibilityEvidenceAudit().reviewedPairRules.length, pairRuleCountBefore, 'dynamic onboarding must not mutate Pair Rule authority');

const wholeTankReferences = readySpecies.slice(0, 4);
assert.equal(wholeTankReferences.length, 4, 'whole-tank fixture requires four reviewed catalog species');
const wholeTankDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    ...wholeTankReferences.map(species => ({ species, quantity: 10, origin: 'existing' as const })),
    { species: syntheticFish, quantity: 6, origin: 'candidate' as const },
  ],
  evidenceProvider,
});
assert.equal(wholeTankDecision.pairResults.length, 10, 'five-species whole tank must evaluate every unique pair dynamically');
assert.ok(wholeTankDecision.tankAggregateResult, 'five-species whole tank must produce aggregate evaluation');
assert.equal(isCompatibilityDecisionFullyInformed(wholeTankDecision), true);
assert.notEqual(wholeTankDecision.status, 'insufficient_data');
assert.equal(wholeTankDecision.metadata.decisionReadiness, 'reviewed');
for (const pair of wholeTankDecision.pairResults.filter(pair => pair.speciesA.id === syntheticId || pair.speciesB.id === syntheticId)) {
  assert.ok(!pair.rawResult.metadata.domainRuleCodes.includes('reviewed_pair_rule'), 'synthetic whole-tank pairs must remain generic-rule decisions');
}
const wholeTankPlan = buildCompatibilityDecisionPlan(wholeTankDecision);
assert.notEqual(wholeTankPlan.judgment, '暂时无法判断');
assert.ok(wholeTankPlan.nextSteps.length > 0);
assert.ok(wholeTankPlan.reviewCheckpoint.length > 0);
assert.ok(wholeTankPlan.stopCondition.length > 0);

const incompleteProvider: CompatibilityEvidenceProvider = {
  ...evidenceProvider,
  getReviewedSpeciesFact: species => species.id === syntheticId
    ? { ...syntheticFact, phMax: null }
    : undefined,
};
const freshwaterReference = readySpecies.find(item => String(item.waterType || '').toLowerCase() === 'freshwater') || readySpecies[0];
assert.ok(freshwaterReference);
const incompleteDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    { species: freshwaterReference, quantity: 10, origin: 'existing' },
    { species: syntheticFish, quantity: 6, origin: 'candidate' },
  ],
  evidenceProvider: incompleteProvider,
});
assert.equal(incompleteDecision.status, 'insufficient_data');
assert.ok(incompleteDecision.metadata.domainRuleCodes.includes('required_fact_ph_missing'));

console.log(JSON.stringify({
  syntheticSpecies: syntheticId,
  catalogPersisted: false,
  profilePersisted: false,
  precomputedPairRulesAdded: 0,
  existingReadySpecies: readySpecies.length,
  evaluatedDynamicPairs: evaluated,
  statuses,
  insufficientData: statuses.insufficient_data,
  wholeTankSpecies: 5,
  wholeTankPairs: wholeTankDecision.pairResults.length,
  wholeTankStatus: wholeTankDecision.status,
  invariant: 'unregistered species + reviewed 8/8 runtime facts => generic Compatibility decision without pair precomputation',
}, null, 2));

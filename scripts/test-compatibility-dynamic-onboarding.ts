import assert from 'node:assert/strict';

import type { DomainSpeciesFact } from '../packages/domain-rules/src';
import { fishData } from '../src/data/fishData';
import {
  getCompatibilityEvidenceAudit,
  getReviewedCompatibilityProfile,
  getReviewedPairRule,
  getReviewedStageRiskProfile,
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

const decisionFacts = ['water', 'temperature', 'adult_size'] as const;
const softRiskFacts = ['ph', 'tank_size', 'social_behavior', 'territoriality', 'predation'] as const;
const partialRiskDispositions = {
  ...Object.fromEntries(decisionFacts.map(field => [field, 'ready'])),
  ...Object.fromEntries(softRiskFacts.map(field => [field, 'research_pending'])),
} as DomainSpeciesFact['compatibilityFactDispositions'];

const syntheticFact: DomainSpeciesFact = {
  id: syntheticId,
  waterType: 'freshwater',
  temperatureMinC: 24,
  temperatureMaxC: 28,
  reviewed: false,
  compatibilityRequiredFacts: [...decisionFacts],
  compatibilityFactDispositions: partialRiskDispositions,
  compatibilityReviewedFacts: [...decisionFacts],
  adultLengthMinCm: 3,
  adultLengthMaxCm: 5,
  evidenceIds: ['dynamic-reviewed-source'],
  behaviorTraits: [],
  predationTargets: [],
  lifeType: 'fish',
  size: 'Small',
};

const evidenceProvider: CompatibilityEvidenceProvider = {
  getProfile: speciesId => speciesId === syntheticId ? undefined : getReviewedCompatibilityProfile(speciesId),
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
    false,
    'minimal decision-ready species must keep soft risk coverage explicitly partial against ' + existing.id,
  );
  assert.notEqual(
    decision.status,
    'insufficient_data',
    'minimal decision-ready synthetic species must not require a full profile or precomputed pair against ' + existing.id,
  );
  assert.equal(decision.metadata.decisionReadiness, 'partial');
  assert.ok(decision.metadata.domainRuleCodes.includes('risk_coverage_partial'));
  assert.ok(!decision.metadata.domainRuleCodes.includes('species_review_pending'));
  assert.ok(!decision.metadata.domainRuleCodes.includes('species_evidence_ceiling'));
  assert.ok(!decision.metadata.domainRuleCodes.includes('evidence_ceiling_ph'));
  assert.ok(!decision.metadata.domainRuleCodes.includes('reviewed_pair_rule'));

  const plan = buildCompatibilityDecisionPlan(decision);
  assert.notEqual(plan.judgment, '需要关键信息');
  assert.ok(plan.nextSteps.length > 0, 'dynamic result must include next steps for ' + existing.id);
  assert.ok(plan.reviewCheckpoint.length > 0, 'dynamic result must include a recheck point for ' + existing.id);
  assert.ok(plan.stopCondition.length > 0, 'dynamic result must include a stop condition for ' + existing.id);
  assert.ok(
    plan.riskSummary.every(text => !text.includes('有一项已审核条件需要继续确认')),
    'dynamic result must not degrade to a generic reviewed-condition placeholder for ' + existing.id,
  );
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
assert.equal(isCompatibilityDecisionFullyInformed(wholeTankDecision), false);
assert.notEqual(wholeTankDecision.status, 'insufficient_data');
assert.equal(wholeTankDecision.metadata.decisionReadiness, 'partial');
assert.ok(wholeTankDecision.metadata.domainRuleCodes.includes('risk_coverage_partial'));
assert.ok(!wholeTankDecision.metadata.domainRuleCodes.includes('species_review_pending'));
for (const pair of wholeTankDecision.pairResults.filter(pair => pair.speciesA.id === syntheticId || pair.speciesB.id === syntheticId)) {
  assert.ok(!pair.rawResult.metadata.domainRuleCodes.includes('reviewed_pair_rule'), 'synthetic whole-tank pairs must remain generic-rule decisions');
}
const wholeTankPlan = buildCompatibilityDecisionPlan(wholeTankDecision);
assert.notEqual(wholeTankPlan.judgment, '需要关键信息');
assert.ok(wholeTankPlan.nextSteps.length > 0);
assert.ok(wholeTankPlan.reviewCheckpoint.length > 0);
assert.ok(wholeTankPlan.stopCondition.length > 0);

const incompleteProvider: CompatibilityEvidenceProvider = {
  ...evidenceProvider,
  getReviewedSpeciesFact: species => species.id === syntheticId
    ? {
      ...syntheticFact,
      adultLengthMinCm: null,
      adultLengthMaxCm: null,
      compatibilityFactDispositions: {
        ...syntheticFact.compatibilityFactDispositions,
        adult_size: 'public_evidence_insufficient',
      },
    }
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
assert.ok(incompleteDecision.metadata.domainRuleCodes.includes('species_public_evidence_insufficient'));

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
  invariant: 'unregistered fish + reviewed identity/water/temperature/adult-size => usable generic Compatibility decision; soft risk gaps stay explicit without pair precomputation',
}, null, 2));

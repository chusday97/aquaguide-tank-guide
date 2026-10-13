import assert from 'node:assert/strict';
import {
  GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS,
  type ReviewedCompatibilityProfileDto,
} from '../packages/contracts/src';
import {
  evaluateCompatibility,
  getCompatibilityTraitReadiness,
  type DomainSpeciesFact,
} from '../packages/domain-rules/src/compatibility';
import { fishData } from '../src/data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile, getReviewedPairRule } from '../src/data/compatibilityEvidence';
import {
  applyReviewedCompatibilityBootstrap,
  resetRuntimeCompatibilityEvidenceForTest,
} from '../src/data/runtimeCompatibilityEvidence';
import { getCompatibilityProfileAuthorityGeneration } from '../src/data/compatibilityAuthorityRollout';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import { buildBeginnerCompatibilityAction } from '../src/services/compatibility/compatibility-action.service';
import type { Aquarium } from '../src/types';

const audit = getCompatibilityEvidenceAudit();
const toCitation = (source: (typeof audit.reviewedProfiles)[number]['citations'][number]) => ({
  id: source.id,
  title: source.title,
  publisher: source.publisher,
  url: source.url,
  sourceType: source.sourceType,
  reviewStatus: 'reviewed' as const,
  version: 1,
});
const stageRiskRulesFor = (catalogKey: string) => audit.reviewedStageRiskProfiles
  .filter(rule => rule.speciesId === catalogKey)
  .map(rule => ({
    ruleKey: `${rule.speciesId}:${rule.riskType}`,
    youngerStages: [...rule.youngerStages],
    olderStages: [...rule.olderStages],
    verdict: rule.verdict,
    riskType: rule.riskType,
    reason: rule.reason,
    mitigation: [...rule.mitigation],
    basis: rule.basis,
    confidence: rule.confidence,
    reviewStatus: 'reviewed' as const,
    citations: rule.citations.map(toCitation),
  }));

const staticProfiles = audit.reviewedProfiles.map(profile => ({
  catalogKey: profile.speciesId,
  behaviorTraits: [...profile.behaviorTraits],
  minimumGroupSize: profile.minimumGroupSize,
  predationTargets: [...profile.predationTargets],
  confidence: profile.confidence,
  reviewStatus: 'reviewed' as const,
  citations: profile.citations.map(toCitation),
  requiredFacts: [...(profile.requiredFacts || [])],
  ...(profile.stockingGuidance ? {
    stockingGuidance: {
      ...profile.stockingGuidance,
      constraints: [...profile.stockingGuidance.constraints],
      evidenceIds: [...profile.stockingGuidance.evidenceIds],
    },
  } : {}),
  stageRiskRules: stageRiskRulesFor(profile.speciesId),
  version: 1,
}));
const staticPairRules = audit.reviewedPairRules.map(rule => ({
  catalogKeys: [...rule.speciesIds].sort() as [string, string],
  verdict: rule.verdict,
  riskType: rule.riskType,
  reason: rule.reason,
  mitigation: [...rule.mitigation],
  basis: rule.basis,
  confidence: rule.confidence,
  reviewStatus: 'reviewed' as const,
  citations: rule.citations.map(toCitation),
  version: 1,
}));

const futureCatalogKey = 'sp_future_generic';
const firstProfile = staticProfiles[0];
assert.ok(firstProfile?.citations.length, 'fixture requires one reviewed profile citation');

const futureProfile: ReviewedCompatibilityProfileDto = {
  ...firstProfile,
  catalogKey: futureCatalogKey,
  behaviorTraits: [],
  minimumGroupSize: null,
  predationTargets: [],
  requiredFacts: [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS],
  stockingGuidance: undefined,
  stageRiskRules: [],
  version: 1,
};

assert.equal(
  getCompatibilityProfileAuthorityGeneration(
    [...staticProfiles.map(profile => profile.catalogKey), futureCatalogKey],
    staticProfiles.map(profile => profile.catalogKey),
  ),
  'post-target-superset',
  'full reviewed baseline must allow monotonic Profile growth without a new rollout generation',
);

resetRuntimeCompatibilityEvidenceForTest();
const acceptedStatus = applyReviewedCompatibilityBootstrap({
  authority: 'reviewed-db',
  counts: { profiles: staticProfiles.length + 1, pairRules: staticPairRules.length },
  profiles: [...staticProfiles, futureProfile],
  pairRules: staticPairRules,
});
assert.equal(acceptedStatus.source, 'reviewed-db');
assert.equal(acceptedStatus.profiles, staticProfiles.length + 1);
assert.equal(acceptedStatus.pairRules, staticPairRules.length, 'new reviewed species must not require a new Pair Rule');

const missingPredationProfile: ReviewedCompatibilityProfileDto = {
  ...futureProfile,
  requiredFacts: futureProfile.requiredFacts.filter(fact => fact !== 'predation'),
};
const rejectedStatus = applyReviewedCompatibilityBootstrap({
  authority: 'reviewed-db',
  counts: { profiles: staticProfiles.length + 1, pairRules: staticPairRules.length },
  profiles: [...staticProfiles, missingPredationProfile],
  pairRules: staticPairRules,
});
assert.equal(rejectedStatus.source, 'static-fallback', 'new Profile missing one generic onboarding fact family must fail closed');
resetRuntimeCompatibilityEvidenceForTest();

const coreRequiredFacts = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS];
const genericSpecies = (id: string): DomainSpeciesFact => ({
  id,
  waterType: 'freshwater',
  temperatureMinC: 22,
  temperatureMaxC: 26,
  phMin: 6.5,
  phMax: 7.5,
  minTankLiters: 40,
  minTankLengthCm: 60,
  reviewed: true,
  compatibilityRequiredFacts: coreRequiredFacts,
  adultLengthMaxCm: 6,
  socialMode: 'group',
  territoriality: 'none',
  predationRisk: 'none',
  predationTargets: [],
  predationVulnerability: 'low',
  finNippingRisk: 'none',
  finNipVulnerability: 'none',
  swimmingPace: 'moderate',
  lifeType: 'fish',
  size: 'Small',
  evidenceIds: [`evidence-${id}`],
});

const genericExisting = genericSpecies('future-existing');
const genericCandidate = genericSpecies('future-candidate');
assert.equal(getCompatibilityTraitReadiness(genericCandidate).ready, true);

const genericCompatible = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 300, lengthCm: 120, targetTemperatureC: 24 },
  existingSpecies: [genericExisting],
  existingQuantities: { [genericExisting.id]: 1 },
  candidateSpecies: genericCandidate,
  candidateQuantity: 1,
});
assert.equal(genericCompatible.status, 'compatible');
assert.equal(genericCompatible.decisionReadiness, 'reviewed');
assert.ok(!genericCompatible.ruleCodes.includes('reviewed_pair_rule'), 'generic trait result must not depend on a Pair Rule');

const genericTemperatureBlock = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 300, lengthCm: 120, targetTemperatureC: 25 },
  existingSpecies: [{ ...genericExisting, temperatureMinC: 18, temperatureMaxC: 20 }],
  existingQuantities: { [genericExisting.id]: 1 },
  candidateSpecies: genericCandidate,
  candidateQuantity: 1,
});
assert.equal(genericTemperatureBlock.status, 'not_recommended');
assert.ok(genericTemperatureBlock.ruleCodes.includes('temperature_range_conflict'));
assert.ok(!genericTemperatureBlock.ruleCodes.includes('reviewed_pair_rule'));

const missingTemperatureCandidate = { ...genericCandidate, temperatureMaxC: null };
const incompleteReadiness = getCompatibilityTraitReadiness(missingTemperatureCandidate);
assert.equal(incompleteReadiness.ready, false);
assert.deepEqual(incompleteReadiness.missingFacts, ['temperature']);
const genericMissingFact = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'freshwater', volumeLiters: 300, lengthCm: 120, targetTemperatureC: 24 },
  existingSpecies: [genericExisting],
  existingQuantities: { [genericExisting.id]: 1 },
  candidateSpecies: missingTemperatureCandidate,
  candidateQuantity: 1,
});
assert.equal(genericMissingFact.status, 'insufficient_data');
assert.equal(genericMissingFact.decisionReadiness, 'partial');
assert.ok(genericMissingFact.ruleCodes.includes('required_fact_temperature_missing'));

const quantityFor = (id: string) => Math.max(1, getReviewedCompatibilityProfile(id)?.minimumGroupSize || 1);
const existingId = 'sp_0010';
const candidateId = 'sp_0012';
assert.equal(getReviewedPairRule(existingId, candidateId), undefined, 'fixture must have no reviewed Pair Rule');
const aquarium: Aquarium = {
  id: 'generic-onboarding-action-tank',
  name: 'Generic onboarding action tank',
  fishes: [{
    id: 'existing-generic-action',
    fishId: existingId,
    quantity: quantityFor(existingId),
    entryDate: '2026-10-01T00:00:00.000Z',
  }],
  dimensions: { length: '200', width: '70', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};
const productReview = reviewSpeciesAdditions({
  aquarium,
  items: [{ fishId: candidateId, quantity: quantityFor(candidateId) }],
  speciesCatalog: fishData,
});
assert.ok(productReview);
assert.equal(productReview.decision.metadata.decisionReadiness, 'reviewed');
const action = buildBeginnerCompatibilityAction(productReview.decision);
assert.ok(action.immediateAction.length > 0);
assert.ok(action.observeAfterAction?.length);
assert.ok(action.stopCondition?.length);
assert.ok(action.evidenceIds.length > 0, 'action must expose reviewed provenance');
assert.ok(action.sourceRuleCodes.length > 0);
assert.ok(!action.sourceRuleCodes.includes('reviewed_pair_rule'), 'action must be derivable without a Pair Rule');
assert.doesNotMatch(
  [action.immediateAction, action.observeAfterAction, action.stopCondition].filter(Boolean).join(' '),
  /3\s*[–-]\s*7\s*天/,
  'generic Action Contract must not invent an unsourced 3–7 day biological threshold',
);

console.log(
  'generic species onboarding PASS: future reviewed Profile joins authority without a Pair Rule; missing core traits fail closed; generic rules produce reviewed verdicts and sourced executable actions.',
);

import assert from 'node:assert/strict';

import { fishData } from '../src/data/fishData';
import { assessCompatibilitySpeciesResearchPacket, buildReviewedCompatibilityOnboardingAuthority, buildReviewReadyCompatibilityPreviewFact, type CompatibilitySpeciesResearchPacket } from '../src/services/compatibility/species-onboarding-research.service';
import { createReviewedOnboardingEvidenceProvider } from '../src/services/compatibility/reviewed-onboarding-runtime.service';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import { buildCompatibilityDecisionPlan } from '../src/services/compatibility/compatibility-decision-plan.service';
import type { Aquarium, Fish } from '../src/types';

const catalogKey = 'sp_reviewed_dynamic_candidate';
const packet: CompatibilitySpeciesResearchPacket = {
  packetId: 'approval-packet',
  providerId: 'approval-provider',
  catalogKey,
  commonName: 'Reviewed dynamic candidate',
  scientificName: 'Fixtureus approvatus',
  identityStatus: 'verified',
  sources: [
    {
      id: 'approval-source-a',
      title: 'Approval exact-taxon husbandry source',
      publisher: 'Approval Fixture',
      url: 'https://example.invalid/approval-source-a',
      sourceType: 'curated_husbandry',
      reviewStatus: 'draft',
      contentVerified: true,
    },
    {
      id: 'approval-source-b',
      title: 'Approval exact-taxon biological source',
      publisher: 'Approval Fixture',
      url: 'https://example.invalid/approval-source-b',
      sourceType: 'peer_reviewed',
      reviewStatus: 'draft',
      contentVerified: true,
    },
  ],
  claims: [
    { field: 'water', proposedValue: 'freshwater', sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'high' },
    { field: 'temperature', proposedValue: { min: 24, max: 28 }, sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'ph', proposedValue: { min: 6.5, max: 7.5 }, sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'adult_size', proposedValue: { min: 3, max: 5 }, sourceId: 'approval-source-b', evidenceKind: 'direct', confidence: 'high' },
    { field: 'tank_size', proposedValue: { liters: 60, lengthCm: 60 }, sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 6 }, sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Normal husbandry guidance recommends a stable group of at least six.' },
    { field: 'territoriality', proposedValue: { traits: [] }, sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'The species is explicitly described as non-territorial in normal husbandry.' },
    { field: 'predation', proposedValue: { targets: [] }, sourceId: 'approval-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Community guidance states similarly sized fish are not treated as prey.' },
  ],
};

const assessment = assessCompatibilitySpeciesResearchPacket(packet);
assert.equal(assessment.status, 'ready_for_review');
assert.ok(assessment.candidateProfile);
assert.equal(buildReviewReadyCompatibilityPreviewFact(assessment).reviewed, false);

const approvedAt = '2026-10-15T12:00:00.000Z';
const approvedFieldReviews = assessment.draftFieldReviews.map(review => ({
  ...review,
  status: 'reviewed' as const,
  resolution: 'supported' as const,
  reviewedAt: approvedAt,
}));

assert.throws(() => buildReviewedCompatibilityOnboardingAuthority(assessment, {
  fieldReviews: assessment.draftFieldReviews,
  reviewedSourceIds: ['approval-source-a', 'approval-source-b'],
  approvedAt,
}), /missing an exact reviewed field decision/);

assert.throws(() => buildReviewedCompatibilityOnboardingAuthority(assessment, {
  fieldReviews: approvedFieldReviews.filter(review => review.field !== 'ph'),
  reviewedSourceIds: ['approval-source-a', 'approval-source-b'],
  approvedAt,
}), /missing an exact reviewed field decision for: ph/);

const tamperedReviews = approvedFieldReviews.map(review => review.field === 'temperature'
  ? { ...review, proposedValue: { min: 18, max: 20 } }
  : review);
assert.throws(() => buildReviewedCompatibilityOnboardingAuthority(assessment, {
  fieldReviews: tamperedReviews,
  reviewedSourceIds: ['approval-source-a', 'approval-source-b'],
  approvedAt,
}), /missing an exact reviewed field decision for: temperature/);

const authority = buildReviewedCompatibilityOnboardingAuthority(assessment, {
  fieldReviews: approvedFieldReviews,
  reviewedSourceIds: ['approval-source-a', 'approval-source-b'],
  approvedAt,
});
assert.equal(authority.fact.reviewed, true);
assert.equal(authority.reviewedFieldReviews.length, 8);
assert.equal(authority.profile.reviewStatus, 'reviewed');
assert.ok(authority.profile.citations.every(source => source.reviewStatus === 'reviewed'));

const provider = createReviewedOnboardingEvidenceProvider([authority], 'approval-test-v1');
const candidateFish: Fish = {
  id: catalogKey,
  name: '审核后动态测试鱼',
  scientificName: packet.scientificName,
  category: '鱼类',
  waterType: 'freshwater',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: 'Reviewed onboarding candidate.',
  diet: '杂食',
  tankSize: '至少 60 升 / 60 cm',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};
assert.equal(fishData.some(fish => fish.id === candidateFish.id), false);

const coverage = buildCompatibilityCoreFieldCoverage();
const readyIds = new Set(coverage.rows.filter(row => row.genericOnboardingReady).map(row => row.speciesId));
const reference = fishData.find(fish => readyIds.has(fish.id) && String(fish.waterType || '').toLowerCase() === 'freshwater')
  || fishData.find(fish => readyIds.has(fish.id));
assert.ok(reference, 'approval test requires one existing reviewed-ready reference species');

const aquarium: Aquarium = {
  id: 'reviewed-onboarding-product-tank',
  name: 'Reviewed onboarding product tank',
  fishes: [{ id: 'existing-reference', fishId: reference.id, quantity: 6, entryDate: '2026-10-01T00:00:00.000Z' }],
  dimensions: { length: '180', width: '60', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const review = reviewSpeciesAdditions({
  aquarium,
  items: [{ fishId: candidateFish.id, quantity: 6 }],
  speciesCatalog: [...fishData, candidateFish],
  evidenceProvider: provider,
});
assert.ok(review);
assert.notEqual(review.status, 'insufficient_data');
assert.equal(review.decision.metadata.decisionReadiness, 'reviewed');
assert.ok(!review.decision.metadata.domainRuleCodes.includes('reviewed_pair_rule'));
const plan = buildCompatibilityDecisionPlan(review.decision);
assert.notEqual(plan.judgment, '需要关键信息');
assert.ok(plan.nextSteps.length > 0);
assert.ok(plan.reviewCheckpoint.length > 0);
assert.ok(plan.stopCondition.length > 0);

console.log(JSON.stringify({
  researchStatus: assessment.status,
  previewReviewed: false,
  approvedFields: authority.reviewedFieldReviews.length,
  runtimeReviewed: authority.fact.reviewed,
  productStatus: review.status,
  decisionReadiness: review.decision.metadata.decisionReadiness,
  usesPrecomputedPairRule: review.decision.metadata.domainRuleCodes.includes('reviewed_pair_rule'),
  invariant: 'research-ready draft cannot become runtime authority until all 8 facts are explicitly reviewed and source-matched',
}, null, 2));

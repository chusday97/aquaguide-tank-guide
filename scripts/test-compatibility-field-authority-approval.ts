import assert from 'node:assert/strict';

import { fishData } from '../src/data/fishData';
import {
  assessCompatibilitySpeciesResearchPacket,
  buildReviewedCompatibilityFieldAuthority,
  type CompatibilitySpeciesResearchPacket,
} from '../src/services/compatibility/species-onboarding-research.service';
import { createReviewedOnboardingEvidenceProvider } from '../src/services/compatibility/reviewed-onboarding-runtime.service';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import type { Aquarium, Fish } from '../src/types';

const catalogKey = 'sp_field_authority_candidate';
const sourceId = 'field-authority-source';
const packet: CompatibilitySpeciesResearchPacket = {
  packetId: 'field-authority-packet',
  providerId: 'field-authority-provider',
  catalogKey,
  commonName: 'Field authority candidate',
  scientificName: 'Fixtureus fieldready',
  identityStatus: 'verified',
  sources: [{
    id: sourceId,
    title: 'Exact species hard-fact source',
    publisher: 'Fixture University',
    url: 'https://example.invalid/field-authority',
    sourceType: 'university',
    reviewStatus: 'draft',
    contentVerified: true,
  }],
  claims: [
    { field: 'water', proposedValue: 'freshwater', sourceId, evidenceKind: 'direct', confidence: 'high' },
    { field: 'temperature', proposedValue: { min: 22, max: 28 }, sourceId, evidenceKind: 'direct', confidence: 'high' },
    { field: 'adult_size', proposedValue: { min: 4, max: 7 }, sourceId, evidenceKind: 'direct', confidence: 'high' },
  ],
};

const assessment = assessCompatibilitySpeciesResearchPacket(packet);
assert.equal(assessment.status, 'research_pending');
assert.equal(assessment.candidateProfile, null);
assert.equal(assessment.sources.length, 1);
assert.equal(assessment.sources[0]?.contentVerified, true);
assert.deepEqual(
  assessment.draftFieldReviews.map(review => review.field).sort(),
  ['adult_size', 'temperature', 'water'],
);

const approvedAt = '2026-10-22T12:00:00.000Z';
const approvedHardReviews = assessment.draftFieldReviews.map(review => ({
  ...review,
  status: 'reviewed' as const,
  resolution: 'supported' as const,
  reviewedAt: approvedAt,
}));

const authority = buildReviewedCompatibilityFieldAuthority(assessment, {
  fieldReviews: approvedHardReviews,
  reviewedSourceIds: [sourceId],
  approvedAt,
});
assert.equal(authority.decisionReady, true);
assert.equal(authority.fullAuthorityReady, false);
assert.equal(authority.profile, undefined);
assert.equal(authority.fact.reviewed, false);
assert.deepEqual(authority.approvedFields.sort(), ['adult_size', 'temperature', 'water']);
assert.equal(authority.fact.compatibilityFactDispositions?.water, 'ready');
assert.equal(authority.fact.compatibilityFactDispositions?.temperature, 'ready');
assert.equal(authority.fact.compatibilityFactDispositions?.adult_size, 'ready');
assert.equal(authority.fact.compatibilityFactDispositions?.territoriality, 'research_pending');
assert.equal(authority.fact.compatibilityFactDispositions?.predation, 'research_pending');

const twoFieldAuthority = buildReviewedCompatibilityFieldAuthority(assessment, {
  fieldReviews: approvedHardReviews.filter(review => review.field !== 'adult_size'),
  reviewedSourceIds: [sourceId],
  approvedAt,
});
assert.equal(twoFieldAuthority.decisionReady, false);

const tampered = approvedHardReviews.map(review => review.field === 'temperature'
  ? { ...review, proposedValue: { min: 10, max: 12 } }
  : review);
assert.throws(() => buildReviewedCompatibilityFieldAuthority(assessment, {
  fieldReviews: tampered,
  reviewedSourceIds: [sourceId],
  approvedAt,
}), /exact reviewed decision for: temperature/);

const provider = createReviewedOnboardingEvidenceProvider([authority], 'field-authority-runtime-v1');
const candidateFish: Fish = {
  id: catalogKey,
  name: '字段权威测试鱼',
  scientificName: packet.scientificName,
  category: '淡水观赏鱼',
  waterType: 'freshwater',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '22-28°C',
  phLevel: '',
  waterChangeCycle: 7,
  description: 'Field-authority candidate.',
  diet: '杂食',
  tankSize: '',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
};

const coverage = buildCompatibilityCoreFieldCoverage();
const readyIds = new Set(coverage.rows.filter(row => row.genericOnboardingReady).map(row => row.speciesId));
const reference = fishData.find(fish => (
  readyIds.has(fish.id)
  && String(fish.waterType || '').toLowerCase() === 'freshwater'
  && /22|23|24|25|26|27|28/.test(fish.waterTemperature || '')
)) || fishData.find(fish => readyIds.has(fish.id) && String(fish.waterType || '').toLowerCase() === 'freshwater');
assert.ok(reference);

const aquarium: Aquarium = {
  id: 'field-authority-tank',
  name: 'Field authority tank',
  fishes: [{ id: 'existing-reference', fishId: reference.id, quantity: 1, entryDate: '2026-10-01T00:00:00.000Z' }],
  dimensions: { length: '180', width: '60', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const review = reviewSpeciesAdditions({
  aquarium,
  items: [{ fishId: candidateFish.id, quantity: 1 }],
  speciesCatalog: [...fishData, candidateFish],
  evidenceProvider: provider,
});
assert.ok(review);
assert.notEqual(review.status, 'insufficient_data');
assert.equal(review.decision.metadata.decisionReadiness, 'partial');
assert.ok(review.decision.metadata.domainRuleCodes.includes('risk_coverage_partial'));
assert.equal(review.decision.metadata.domainRuleCodes.includes('reviewed_pair_rule'), false);

console.log('PASS research-pending assessment can approve supported fields independently');
console.log('PASS water + temperature + adult_size reviewed field authority is decision-ready without a full profile');
console.log('PASS unresolved soft fields remain research_pending and produce partial risk coverage');
console.log('PASS field-authority runtime reaches compatibility judgment without pair rules');

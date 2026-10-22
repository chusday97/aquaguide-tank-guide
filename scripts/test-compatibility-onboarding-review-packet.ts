import assert from 'node:assert/strict';

import {
  assessCompatibilitySpeciesResearchPacket,
  type CompatibilitySpeciesResearchPacket,
} from '../src/services/compatibility/species-onboarding-research.service';
import {
  buildCompatibilityOnboardingReviewPacket,
  buildCompatibilityOnboardingReviewWorkItem,
} from '../src/services/compatibility/onboarding-review-packet.service';

const base: CompatibilitySpeciesResearchPacket = {
  packetId: 'review-packet-ready',
  providerId: 'review-packet-provider',
  catalogKey: 'sp_review_packet_fixture',
  commonName: 'Review packet fixture',
  scientificName: 'Fixtureus reviewus',
  identityStatus: 'verified',
  sources: [
    {
      id: 'review-source-a', title: 'Review source A', publisher: 'Fixture',
      url: 'https://example.invalid/review-source-a', sourceType: 'curated_husbandry',
      reviewStatus: 'draft', contentVerified: true,
    },
    {
      id: 'review-source-b', title: 'Review source B', publisher: 'Fixture',
      url: 'https://example.invalid/review-source-b', sourceType: 'peer_reviewed',
      reviewStatus: 'draft', contentVerified: true,
    },
  ],
  claims: [
    { field: 'water', proposedValue: 'freshwater', sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'high' },
    { field: 'temperature', proposedValue: { min: 24, max: 28 }, sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'ph', proposedValue: { min: 6.5, max: 7.5 }, sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'adult_size', proposedValue: { min: 3, max: 5 }, sourceId: 'review-source-b', evidenceKind: 'direct', confidence: 'high' },
    { field: 'tank_size', proposedValue: { liters: 60, lengthCm: 60 }, sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'medium' },
    { field: 'social_behavior', proposedValue: { mode: 'group', minimumGroupSize: 6 }, sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Normal husbandry recommends a stable group of at least six.' },
    { field: 'territoriality', proposedValue: { traits: [] }, sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Explicitly described as non-territorial in normal husbandry.' },
    { field: 'predation', proposedValue: { targets: [] }, sourceId: 'review-source-a', evidenceKind: 'direct', confidence: 'medium', note: 'Similarly sized community fish are not treated as prey.' },
  ],
};

const readyAssessment = assessCompatibilitySpeciesResearchPacket(base);
assert.equal(readyAssessment.status, 'ready_for_review');
const readyPacket = buildCompatibilityOnboardingReviewPacket(readyAssessment);
assert.equal(readyPacket.gate, 'manual_review_required');
assert.equal(readyPacket.readyFieldCount, 8);
assert.equal(readyPacket.requiredFieldCount, 8);
assert.equal(readyPacket.reviewableFieldCount, 8);
assert.equal(readyPacket.canReviewSupportedFields, true);
assert.equal(readyPacket.decisionReadyFieldCount, 3);
assert.equal(readyPacket.decisionFieldSetReady, true);
assert.equal(readyPacket.fullAuthorityReady, true);
assert.equal(readyPacket.canApprove, true);
assert.equal(readyPacket.writesAuthority, false);
assert.equal(readyPacket.fields.length, 8);
assert.equal(readyPacket.fields.every(field => field.status === 'supported' && field.draftReview?.status === 'draft'), true);
const readyItem = buildCompatibilityOnboardingReviewWorkItem(readyPacket, base.commonName);
assert.equal(readyItem.severity, 'decision');
assert.equal(readyItem.authority, 'compatibility');
assert.match(readyItem.title, /Compatibility 字段待审核/);
assert.match(readyItem.href, /kind=onboarding/);
assert.match(readyItem.nextStep, /字段可独立批准/);
assert.match(readyItem.nextStep, /decision-ready/);

const incompleteAssessment = assessCompatibilitySpeciesResearchPacket({
  ...base,
  packetId: 'review-packet-incomplete',
  claims: base.claims.filter(claim => claim.field !== 'tank_size'),
});
assert.equal(incompleteAssessment.status, 'research_pending');
const incompletePacket = buildCompatibilityOnboardingReviewPacket(incompleteAssessment);
assert.equal(incompletePacket.gate, 'research_incomplete');
assert.equal(incompletePacket.canApprove, false);
assert.equal(incompletePacket.reviewableFieldCount, 7);
assert.equal(incompletePacket.canReviewSupportedFields, true);
assert.equal(incompletePacket.decisionReadyFieldCount, 3);
assert.equal(incompletePacket.decisionFieldSetReady, true);
assert.equal(incompletePacket.fullAuthorityReady, false);
assert.ok(incompletePacket.unresolvedFields.includes('tank_size'));
const incompleteItem = buildCompatibilityOnboardingReviewWorkItem(incompletePacket, base.commonName);
assert.equal(incompleteItem.severity, 'attention');
assert.match(incompleteItem.nextStep, /先审核 supported 字段/);
assert.match(incompleteItem.verificationNote, /审核通过后可进入 decision-ready/);

const transportAssessment = assessCompatibilitySpeciesResearchPacket({
  ...base,
  packetId: 'review-packet-transport',
  claims: [],
  diagnostics: {
    extractionStatus: 'transport_unavailable',
    verifiedSourceCount: 2,
    transportErrorCode: 'retryable_network_error',
  },
});
assert.equal(transportAssessment.status, 'research_pending');
assert.ok(transportAssessment.reasonCodes.includes('provider_extraction_transport_unavailable'));
const transportPacket = buildCompatibilityOnboardingReviewPacket(transportAssessment);
assert.equal(transportPacket.gate, 'research_incomplete');
const transportItem = buildCompatibilityOnboardingReviewWorkItem(transportPacket, base.commonName);
assert.equal(transportItem.severity, 'attention');
assert.match(transportItem.title, /extraction 暂不可用/);
assert.match(transportItem.nextStep, /重试已验证来源的结构化 extraction/);
assert.doesNotMatch(transportItem.nextStep, /补缺失字段/);

const holdAssessment = assessCompatibilitySpeciesResearchPacket({
  ...base,
  packetId: 'review-packet-hold',
  identityStatus: 'ambiguous',
});
assert.equal(holdAssessment.status, 'terminal_hold');
const holdPacket = buildCompatibilityOnboardingReviewPacket(holdAssessment);
assert.equal(holdPacket.gate, 'terminal_hold');
assert.equal(holdPacket.canApprove, false);
assert.equal(holdPacket.canReviewSupportedFields, false);
assert.equal(holdPacket.fullAuthorityReady, false);
const holdItem = buildCompatibilityOnboardingReviewWorkItem(holdPacket, base.commonName);
assert.equal(holdItem.severity, 'blocker');
assert.match(holdItem.nextStep, /先解决身份或公开证据冲突/);

console.log(JSON.stringify({
  ready: { gate: readyPacket.gate, fields: readyPacket.readyFieldCount, workItem: readyItem.severity },
  incomplete: { gate: incompletePacket.gate, unresolved: incompletePacket.unresolvedFields, workItem: incompleteItem.severity },
  transport: { gate: transportPacket.gate, workItem: transportItem.severity, nextStep: transportItem.nextStep },
  hold: { gate: holdPacket.gate, workItem: holdItem.severity },
  invariant: 'research preview supports independent field review; hard-3 enables decision-ready after approval while 8/8 remains full authority-ready',
}, null, 2));

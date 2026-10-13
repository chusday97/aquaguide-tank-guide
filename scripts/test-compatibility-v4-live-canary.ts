import assert from 'node:assert/strict';
import { ProviderError } from '../apps/api/src/ai/provider';
import {
  runCompatibilityV4LiveCanary,
  type CompatibilityV4LiveCanaryReport,
} from './compatibility-v4-live-canary';

const unavailable = await runCompatibilityV4LiveCanary({
  providerConfigured: false,
  generatedAt: '2026-10-13T00:00:00.000Z',
  provider: async () => {
    throw new ProviderError('not_configured', 'fixture provider is intentionally unavailable');
  },
});

assert.equal(unavailable.outcome, 'blocked_not_configured');
assert.equal(unavailable.summary.totalCases, 4);
assert.equal(unavailable.summary.providerCalls, 3, 'insufficient-data fixture must skip provider invocation');
assert.equal(unavailable.summary.unavailableAi, 3);
assert.equal(unavailable.summary.skippedAi, 1);
assert.equal(unavailable.summary.finalDecisionMutations, 0);
assert.equal(
  unavailable.cases.find(item => item.caseId === 'V4-LIVE-3SP-INSUFFICIENT')?.ai.providerCalls,
  0,
);

const fixtureProvider = async ({ user }: { system: string; user: string }) => {
  const parsed = JSON.parse(user) as {
    deterministicAuthority?: { finalDecision?: { status?: string } };
    allowedRuleCodes?: string[];
    allowedEvidenceIds?: string[];
  };
  const deterministicStatus = parsed.deterministicAuthority?.finalDecision?.status;
  const ruleCode = parsed.allowedRuleCodes?.[0] || 'compatibility_clear';
  return {
    model: 'v4-live-canary-fixture',
    output: {
      suggestedVerdict: deterministicStatus,
      reasons: [{ text: 'Grounded fixture canary response.', ruleCodes: [ruleCode] }],
      adjustments: [],
      uncertainties: [],
      confidence: 'medium',
      evidenceIds: parsed.allowedEvidenceIds || [],
    },
  };
};

const configured = await runCompatibilityV4LiveCanary({
  providerConfigured: true,
  generatedAt: '2026-10-13T00:00:00.000Z',
  provider: fixtureProvider,
});

assert.equal(configured.outcome, 'pass_guarded');
assert.equal(configured.summary.acceptedAi, 3);
assert.equal(configured.summary.skippedAi, 1);
assert.equal(configured.summary.unavailableAi, 0);
assert.equal(configured.summary.acceptedReviewedCases, 3);
assert.equal(configured.summary.finalDecisionMutations, 0);
assert.deepEqual(
  configured.cases.map(item => item.finalDecision.status),
  configured.cases.map(item => item.deterministic.status),
);

const assertNoSecretField = (report: CompatibilityV4LiveCanaryReport) => {
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes('apiKey'), false);
  assert.equal(serialized.includes('Authorization'), false);
};
assertNoSecretField(unavailable);
assertNoSecretField(configured);

console.log('Compatibility V4 live canary PASS: no-provider blocking and configured guarded-provider paths preserve deterministic authority across four 3-species cases.');

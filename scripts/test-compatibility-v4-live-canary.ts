import assert from 'node:assert/strict';
import { classifyProviderHttpFailure, ProviderError, textJsonRequestExtrasForModel } from '../apps/api/src/ai/provider';
import type { CompatibilityAiReasoningProvider } from '../apps/api/src/compatibility-ai-reasoner';
import {
  runCompatibilityV4LiveCanary,
  type CompatibilityV4LiveCanaryReport,
} from './compatibility-v4-live-canary';

let unavailableProviderCalls = 0;
const unavailableProvider: CompatibilityAiReasoningProvider = Object.assign(
  async () => {
    unavailableProviderCalls += 1;
    throw new Error('unconfigured provider must never be invoked');
  },
  {
    readiness: () => ({
      configured: false,
      host: 'api.fixture.invalid',
      model: 'fixture-unconfigured',
      fallbackModels: [],
      timeoutMs: 1,
    }),
  },
);

const unavailable = await runCompatibilityV4LiveCanary({
  providerConfigured: false,
  generatedAt: '2026-10-13T00:00:00.000Z',
  provider: unavailableProvider,
});

assert.equal(unavailable.outcome, 'blocked_not_configured');
assert.equal(unavailable.summary.totalCases, 4);
assert.equal(unavailable.summary.providerCalls, 0, 'unconfigured provider must be preflighted before invocation');
assert.equal(unavailableProviderCalls, 0);
assert.equal(unavailable.summary.unavailableAi, 3);
assert.equal(unavailable.summary.skippedAi, 1);
assert.equal(unavailable.summary.finalDecisionMutations, 0);

assert.equal(
  classifyProviderHttpFailure(403, { error: { code: 'AllocationQuota.FreeTierOnly' } }),
  'quota_exhausted',
);
assert.equal(classifyProviderHttpFailure(403, { error: { code: 'access_denied' } }), 'access_denied');
assert.equal(classifyProviderHttpFailure(429, { error: { code: 'rate_limit' } }), 'rate_limited');
assert.deepEqual(textJsonRequestExtrasForModel('qwen3.7-flash-2026-07-15'), { enable_thinking: false });
assert.deepEqual(textJsonRequestExtrasForModel('qwen3.8-27b'), { enable_thinking: false });
assert.deepEqual(textJsonRequestExtrasForModel('deepseek-v4.1-flash'), { enable_thinking: false });
assert.deepEqual(textJsonRequestExtrasForModel('kimi-k3'), {});

const quotaBlocked = await runCompatibilityV4LiveCanary({
  providerConfigured: true,
  generatedAt: '2026-10-13T00:00:00.000Z',
  provider: async () => {
    throw new ProviderError('quota_exhausted', 'fixture quota exhausted', 403);
  },
});
assert.equal(quotaBlocked.outcome, 'blocked_provider_quota');
assert.equal(quotaBlocked.summary.unavailableAi, 3);
assert.equal(quotaBlocked.summary.skippedAi, 1);
assert.equal(quotaBlocked.summary.finalDecisionMutations, 0);
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
      adjustments: deterministicStatus === 'compatible'
        ? []
        : [{ text: 'Grounded fixture action.', ruleCodes: [ruleCode] }],
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
assert.equal(configured.summary.reviewedCasesWithReasons, 3);
assert.equal(configured.summary.reviewedRiskCasesWithAdjustments, 2);
assert.equal(configured.summary.providerCalls, 3);
assert.deepEqual(configured.summary.modelsUsed, ['v4-live-canary-fixture']);
assert.deepEqual(
  configured.cases.filter(item => item.ai.status === 'accepted').map(item => item.ai.model),
  ['v4-live-canary-fixture', 'v4-live-canary-fixture', 'v4-live-canary-fixture'],
);
assert.equal(configured.cases.every(item => item.ai.repairCount === 0), true);
assert.deepEqual(
  configured.cases.map(item => item.finalDecision.status),
  configured.cases.map(item => item.deterministic.status),
);
const configuredReviewed = configured.cases.filter(item => item.deterministic.decisionReadiness === 'reviewed');
assert.equal(configuredReviewed.every(item => item.ai.reasons.length > 0), true);
assert.equal(
  configuredReviewed
    .filter(item => item.deterministic.status === 'caution' || item.deterministic.status === 'not_recommended')
    .every(item => item.ai.adjustments.length > 0),
  true,
);

const assertNoSecretField = (report: CompatibilityV4LiveCanaryReport) => {
  const serialized = JSON.stringify(report);
  assert.equal(serialized.includes('apiKey'), false);
  assert.equal(serialized.includes('Authorization'), false);
};
assertNoSecretField(unavailable);
assertNoSecretField(configured);

console.log('Compatibility V4 live canary PASS: no-provider blocking and configured guarded-provider paths preserve deterministic authority across four 3-species cases.');

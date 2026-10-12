import assert from 'node:assert/strict';
import { compatibilityAiReasoningRequestSchema, type CompatibilityAiReasoning, type CompatibilityAiReasoningRequest } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import { getReviewedPairRule } from '../src/data/compatibilityEvidence';
import {
  evaluateSpeciesCombinationWithAi,
  type CompatibilityAiReasoner,
} from '../src/services/compatibility/compatibility-ai.service';
import { requestCompatibilityReasoning, validateCompatibilityReasoningOutput, ProviderError } from '../apps/api/src/ai/provider';
import { apiConfig, buildApiConfig } from '../apps/api/src/config';
import { evaluateCompatibilityDecisionWithAi } from '../src/modules/knowledge/compatibilityKnowledge';

const fish = (id: string) => {
  const found = fishData.find(item => item.id === id);
  assert.ok(found, `missing test species ${id}`);
  return found;
};

const modelResult = (
  request: CompatibilityAiReasoningRequest,
  verdict: CompatibilityAiReasoning['verdict'] = 'caution',
  evidenceIds = request.allowedEvidenceIds.slice(0, 2),
): CompatibilityAiReasoning => ({
  verdict,
  reasons: ['基于已审核物种事实，对当前组合进行动态综合判断。'],
  adjustments: ['按确定性规则要求管理群体数量、空间与行为压力。'],
  uncertainties: [],
  confidence: 'medium',
  evidenceIds,
  provenance: {
    mode: 'ai_assisted',
    model: 'mock-compatibility-model',
    authorityVersion: request.authorityVersion,
    speciesIds: request.species.map(item => item.speciesId),
  },
});

const blackSkirt = fish('sp_0010');
const platy = fish('sp_0011');
const cherryBarb = fish('sp_0012');
const altum = fish('sp_0019');
const neon = fish('sp_0431');
const cardinal = fish('sp_0432');
const platinumSnakehead = fish('sp_0224');
const kissingGourami = fish('sp_0015');

assert.equal(getReviewedPairRule(blackSkirt.id, platy.id), undefined, 'baseline pair must not have a pre-authored pair rule');

let pairCalls = 0;
const pairReasoner: CompatibilityAiReasoner = async request => {
  pairCalls += 1;
  assert.deepEqual(request.species.map(item => item.speciesId).sort(), [blackSkirt.id, platy.id].sort());
  assert.ok(request.allowedEvidenceIds.length > 0, 'AI must receive reviewed evidence ids');
  assert.equal(compatibilityAiReasoningRequestSchema.safeParse(request).success, true, 'generated V4 request must satisfy the real API contract');
  assert.ok(request.species.every(item => item.spaceAndGrowth.adultLengthCm?.measurement), 'reviewed length measurement metadata must be preserved in the V4 contract');
  assert.ok(request.species.every(item => (
    item.environment.evidenceIds.length > 0
    && item.socialBehavior.evidenceIds.length > 0
    && item.spaceAndGrowth.evidenceIds.length > 0
  )), 'AI must receive reviewed environment/social/space blocks');
  return modelResult(request, 'compatible');
};
const pairResult = await evaluateSpeciesCombinationWithAi([blackSkirt, platy], pairReasoner);
assert.equal(pairCalls, 1, 'AI should run without a pre-authored pair rule');
assert.equal(pairResult.provenance.mode, 'ai_assisted');
assert.equal(pairResult.verdict, 'caution', 'AI cannot lower an existing deterministic caution to compatible');

let multiCalls = 0;
const multiReasoner: CompatibilityAiReasoner = async request => {
  multiCalls += 1;
  assert.equal(request.species.length, 3, '3+ species context must reach the AI reasoner');
  assert.deepEqual(
    request.species.map(item => item.speciesId).sort(),
    [blackSkirt.id, platy.id, cherryBarb.id].sort(),
  );
  return modelResult(request, 'caution');
};
const multiResult = await evaluateCompatibilityDecisionWithAi({
  tank: {
    id: 'compatibility-v4-test-tank',
    name: 'Compatibility V4 test tank',
    fishes: [],
    waterType: 'Freshwater',
    targetTemperature: '24',
    dimensions: { length: '120', width: '50', height: '50' },
    plants: ['plant-a', 'plant-b'],
    hardscape: ['rock-a'],
  },
  items: [
    { species: blackSkirt, quantity: 1 },
    { species: platy, quantity: 1 },
    { species: cherryBarb, quantity: 1 },
  ],
}, multiReasoner);
assert.equal(multiCalls, 1);
assert.equal(multiResult.reasoning.provenance.mode, 'ai_assisted');
assert.equal(multiResult.reasoning.provenance.speciesIds.length, 3);
assert.equal(multiResult.deterministicDecision.pairResults.length, 3, 'knowledge-layer V4 entry must retain pairwise diagnostics');

let hardBlockCalls = 0;
const hardBlockResult = await evaluateSpeciesCombinationWithAi(
  [blackSkirt, altum],
  async request => {
    hardBlockCalls += 1;
    return modelResult(request);
  },
);
assert.equal(hardBlockCalls, 0, 'deterministic hard block must bypass AI');
assert.equal(hardBlockResult.verdict, 'not_recommended');
assert.equal(hardBlockResult.provenance.mode, 'deterministic_only');
assert.ok(hardBlockResult.deterministic.blockingRules.some(rule => rule.code === 'temperature_range_conflict'));

assert.ok(getReviewedPairRule(neon.id, cardinal.id), 'test pair must have an explicit reviewed pair rule');
let pairRuleCalls = 0;
const pairRuleResult = await evaluateSpeciesCombinationWithAi(
  [neon, cardinal],
  async request => {
    pairRuleCalls += 1;
    return modelResult(request, 'compatible');
  },
);
assert.equal(pairRuleCalls, 0, 'explicit reviewed pair rules must remain authoritative');
assert.equal(pairRuleResult.provenance.mode, 'deterministic_only');

const providerFailureResult = await evaluateSpeciesCombinationWithAi(
  [blackSkirt, platy],
  async () => {
    throw new Error('provider unavailable');
  },
);
assert.equal(providerFailureResult.verdict, 'insufficient_data', 'provider failure must fail closed');
assert.equal(providerFailureResult.provenance.mode, 'fallback');
assert.equal(providerFailureResult.reasons[0], '动态混养判断服务暂时不可用；已审核的明确风险仍然有效。');
assert.equal(providerFailureResult.adjustments[0], '暂时不要新增；稍后重试动态判断。');

const malformedResult = await evaluateSpeciesCombinationWithAi(
  [blackSkirt, platy],
  async () => ({ verdict: 'compatible' } as CompatibilityAiReasoning),
);
assert.equal(malformedResult.verdict, 'insufficient_data', 'invalid model output must fail closed');
assert.equal(malformedResult.provenance.mode, 'fallback');
assert.equal(malformedResult.reasons[0], '动态判断暂时未能生成可靠结果。');
assert.equal(malformedResult.adjustments[0], '暂时不要新增；稍后重新判断。');

const unsupportedEvidenceResult = await evaluateSpeciesCombinationWithAi(
  [blackSkirt, platy],
  async request => modelResult(request, 'compatible', ['not-an-allowed-evidence-id']),
);
assert.equal(unsupportedEvidenceResult.verdict, 'insufficient_data', 'unsupported evidence ids must fail closed');
assert.equal(unsupportedEvidenceResult.provenance.mode, 'fallback');
assert.equal(unsupportedEvidenceResult.reasons[0], '动态判断结果未通过证据校验，系统已拒绝使用。');

let inadequateCalls = 0;
const inadequateResult = await evaluateSpeciesCombinationWithAi(
  [platinumSnakehead, kissingGourami],
  async request => {
    inadequateCalls += 1;
    return modelResult(request);
  },
);
assert.equal(inadequateCalls, 0, 'inadequate reviewed fact blocks must not call AI');
assert.equal(inadequateResult.verdict, 'insufficient_data');
assert.equal(inadequateResult.provenance.mode, 'fallback');
assert.equal(inadequateResult.reasons[0], '当前缺少足够的已审核物种资料，系统不会猜测。');
assert.equal(inadequateResult.adjustments[0], '暂时不要新增；先补齐或核对物种资料后再判断。');

const providerValidated = validateCompatibilityReasoningOutput({
  verdict: 'caution',
  reasons: ['reviewed facts require caution'],
  adjustments: [],
  uncertainties: [],
  confidence: 'medium',
  evidenceIds: ['evidence-a'],
}, ['evidence-a']);
assert.equal(providerValidated.verdict, 'caution');

assert.throws(
  () => validateCompatibilityReasoningOutput({
    verdict: 'compatible',
    reasons: ['unsupported citation'],
    adjustments: [],
    uncertainties: [],
    confidence: 'medium',
    evidenceIds: ['hallucinated-source'],
  }, ['evidence-a']),
  error => error instanceof ProviderError && error.reason === 'invalid_response',
  'server provider boundary must reject evidence ids outside the allowed reviewed set',
);

const fallbackDisabled = buildApiConfig({ VISION_API_KEY: 'vision-only-key' });
assert.equal(fallbackDisabled.aiFallbackApiKey, '', 'Vision credentials must not be borrowed unless explicitly enabled');
const fallbackEnabled = buildApiConfig({
  VISION_API_KEY: 'vision-only-key',
  AI_FALLBACK_USE_VISION_CREDENTIALS: 'true',
  AI_FALLBACK_MODEL: 'glm-4.7-flash',
});
assert.equal(fallbackEnabled.aiFallbackApiKey, 'vision-only-key');
assert.equal(fallbackEnabled.aiFallbackModel, 'glm-4.7-flash');
const oidcFallbackEnabled = buildApiConfig({
  VERCEL_OIDC_TOKEN: 'vercel-oidc-token',
  AI_FALLBACK_USE_VERCEL_OIDC: 'true',
  AI_FALLBACK_BASE_URL: 'https://ai-gateway.vercel.sh/v1',
  AI_FALLBACK_MODEL: 'zai/glm-4.6v-flash',
});
assert.equal(oidcFallbackEnabled.aiFallbackApiKey, 'vercel-oidc-token');
assert.equal(oidcFallbackEnabled.aiFallbackBaseUrl, 'https://ai-gateway.vercel.sh/v1');
assert.equal(oidcFallbackEnabled.aiFallbackModel, 'zai/glm-4.6v-flash');
assert.equal(oidcFallbackEnabled.aiFallbackUseVercelOidc, true);
const explicitFallbackWins = buildApiConfig({
  AI_FALLBACK_API_KEY: 'explicit-fallback-key',
  VERCEL_OIDC_TOKEN: 'vercel-oidc-token',
  AI_FALLBACK_USE_VERCEL_OIDC: 'true',
  AI_FALLBACK_MODEL: 'zai/glm-4.6v-flash',
});
assert.equal(explicitFallbackWins.aiFallbackApiKey, 'explicit-fallback-key', 'explicit fallback credentials must win over OIDC');

let capturedPairRequest: CompatibilityAiReasoningRequest | null = null;
await evaluateSpeciesCombinationWithAi([blackSkirt, platy], async request => {
  capturedPairRequest = request;
  return modelResult(request, 'caution');
});
assert.ok(capturedPairRequest);
const originalProviderConfig = {
  aiApiKey: apiConfig.aiApiKey,
  aiBaseUrl: apiConfig.aiBaseUrl,
  aiModel: apiConfig.aiModel,
  aiTimeoutMs: apiConfig.aiTimeoutMs,
  aiFallbackApiKey: apiConfig.aiFallbackApiKey,
  aiFallbackBaseUrl: apiConfig.aiFallbackBaseUrl,
  aiFallbackModel: apiConfig.aiFallbackModel,
  aiFallbackTimeoutMs: apiConfig.aiFallbackTimeoutMs,
};
const originalFetch = globalThis.fetch;
let providerCalls = 0;
try {
  Object.assign(apiConfig, {
    aiApiKey: 'primary-key',
    aiBaseUrl: 'https://primary.example.test',
    aiModel: 'primary-model',
    aiTimeoutMs: 1000,
    aiFallbackApiKey: 'fallback-key',
    aiFallbackBaseUrl: 'https://fallback.example.test',
    aiFallbackModel: 'glm-4.7-flash',
    aiFallbackTimeoutMs: 1000,
  });
  globalThis.fetch = async (input, init) => {
    providerCalls += 1;
    const url = String(input);
    if (url.startsWith('https://primary.example.test')) {
      return new Response(JSON.stringify({ error: 'payment required' }), { status: 402 });
    }
    assert.match(url, /^https:\/\/fallback\.example\.test\/chat\/completions$/);
    const fallbackRequest = JSON.parse(String(init?.body || '{}'));
    assert.deepEqual(fallbackRequest.thinking, { type: 'disabled' }, 'GLM-4.7 fallback must disable thinking for bounded JSON synthesis latency');
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            verdict: 'caution',
            reasons: ['fallback provider returned reviewed-fact synthesis'],
            adjustments: ['keep the reviewed caution controls'],
            uncertainties: [],
            confidence: 'medium',
            evidenceIds: capturedPairRequest!.allowedEvidenceIds.slice(0, 1),
          }),
        },
      }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const fallbackResult = await requestCompatibilityReasoning(capturedPairRequest);
  assert.equal(providerCalls, 2, 'HTTP 402 from the primary provider must try the explicitly configured fallback once');
  assert.equal(fallbackResult.modelName, 'glm-4.7-flash');
  assert.equal(fallbackResult.payload.verdict, 'caution');
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(apiConfig, originalProviderConfig);
}

let oidcProviderCalls = 0;
try {
  Object.assign(apiConfig, {
    aiApiKey: 'primary-key',
    aiBaseUrl: 'https://primary.example.test',
    aiModel: 'primary-model',
    aiTimeoutMs: 1000,
    aiFallbackApiKey: '',
    aiFallbackBaseUrl: 'https://ai-gateway.vercel.sh/v1',
    aiFallbackModel: 'zai/glm-4.6v-flash',
    aiFallbackTimeoutMs: 1000,
  });
  globalThis.fetch = async (input, init) => {
    oidcProviderCalls += 1;
    const url = String(input);
    if (url.startsWith('https://primary.example.test')) {
      return new Response(JSON.stringify({ error: 'payment required' }), { status: 402 });
    }
    assert.equal(url, 'https://ai-gateway.vercel.sh/v1/chat/completions');
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer request-oidc-token');
    const gatewayRequest = JSON.parse(String(init?.body || '{}'));
    assert.equal(gatewayRequest.model, 'zai/glm-4.6v-flash');
    return new Response(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({
            verdict: 'caution',
            reasons: ['request-scoped OIDC fallback returned reviewed-fact synthesis'],
            adjustments: ['keep the reviewed caution controls'],
            uncertainties: [],
            confidence: 'medium',
            evidenceIds: capturedPairRequest!.allowedEvidenceIds.slice(0, 1),
          }),
        },
      }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const oidcResult = await requestCompatibilityReasoning(capturedPairRequest, {
    fallbackApiKey: 'request-oidc-token',
  });
  assert.equal(oidcProviderCalls, 2, 'request-scoped OIDC must be used only after the primary provider fails');
  assert.equal(oidcResult.modelName, 'zai/glm-4.6v-flash');
  assert.equal(oidcResult.payload.verdict, 'caution');
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(apiConfig, originalProviderConfig);
}

try {
  Object.assign(apiConfig, {
    aiApiKey: 'primary-key',
    aiBaseUrl: 'https://primary.example.test',
    aiModel: 'primary-model',
    aiTimeoutMs: 1000,
    aiFallbackApiKey: '',
    aiFallbackBaseUrl: 'https://ai-gateway.vercel.sh/v1',
    aiFallbackModel: 'zai/glm-4.6v-flash',
    aiFallbackTimeoutMs: 1000,
  });
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.startsWith('https://primary.example.test')) {
      return new Response(JSON.stringify({ error: { type: 'billing_error' } }), { status: 402 });
    }
    return new Response(JSON.stringify({
      error: {
        type: 'forbidden',
        code: 'model_policy_denied',
        message: 'this message must not be copied into ProviderError metadata',
      },
    }), { status: 403, headers: { 'content-type': 'application/json' } });
  };
  await assert.rejects(
    () => requestCompatibilityReasoning(capturedPairRequest!, { fallbackApiKey: 'request-oidc-token' }),
    error => {
      assert.ok(error instanceof ProviderError);
      assert.equal(error.statusCode, 403);
      assert.equal(error.providerErrorType, 'forbidden');
      assert.equal(error.providerErrorCode, 'model_policy_denied');
      assert.doesNotMatch(error.message, /this message must not be copied/);
      return true;
    },
  );
} finally {
  globalThis.fetch = originalFetch;
  Object.assign(apiConfig, originalProviderConfig);
}

console.log('Compatibility V4 AI reasoner PASS: dynamic no-pair reasoning, 3+ species context, deterministic precedence, fail-closed provider behavior, and evidence allowlisting verified.');

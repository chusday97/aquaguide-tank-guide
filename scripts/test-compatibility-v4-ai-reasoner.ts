import assert from 'node:assert/strict';
import type { CompatibilityAiReasoning, CompatibilityAiReasoningRequest } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import { getReviewedPairRule } from '../src/data/compatibilityEvidence';
import {
  evaluateSpeciesCombinationWithAi,
  type CompatibilityAiReasoner,
} from '../src/services/compatibility/compatibility-ai.service';
import { validateCompatibilityReasoningOutput, ProviderError } from '../apps/api/src/ai/provider';
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

const malformedResult = await evaluateSpeciesCombinationWithAi(
  [blackSkirt, platy],
  async () => ({ verdict: 'compatible' } as CompatibilityAiReasoning),
);
assert.equal(malformedResult.verdict, 'insufficient_data', 'invalid model output must fail closed');
assert.equal(malformedResult.provenance.mode, 'fallback');

const unsupportedEvidenceResult = await evaluateSpeciesCombinationWithAi(
  [blackSkirt, platy],
  async request => modelResult(request, 'compatible', ['not-an-allowed-evidence-id']),
);
assert.equal(unsupportedEvidenceResult.verdict, 'insufficient_data', 'unsupported evidence ids must fail closed');
assert.equal(unsupportedEvidenceResult.provenance.mode, 'fallback');

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

console.log('Compatibility V4 AI reasoner PASS: dynamic no-pair reasoning, 3+ species context, deterministic precedence, fail-closed provider behavior, and evidence allowlisting verified.');

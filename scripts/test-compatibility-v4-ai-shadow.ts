import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import { evaluateTankCompatibility } from '../src/services/compatibility/compatibility.service';
import {
  COMPATIBILITY_AI_PROMPT_VERSION,
  buildCompatibilityAiProviderReadiness,
  createCompatibilityAiShadowAssessment,
  type CompatibilityAiReasoningProvider,
} from '../apps/api/src/compatibility-ai-reasoner';
import { ProviderError } from '../apps/api/src/ai/provider';

const fish = (id: string) => {
  const value = fishData.find(item => item.id === id);
  assert.ok(value, 'missing fixture species ' + id);
  return value;
};

const cory = fish('sp_0052');
const topmouth = fish('sp_0042');
const reviewedA = fish('sp_0431');
const reviewedB = fish('sp_0432');
const normanLampEye = fish('sp_0112');

const configuredReadiness = buildCompatibilityAiProviderReadiness({
  aiApiKey: 'fixture-secret-never-returned',
  aiBaseUrl: 'https://api.fixture.example/v1',
  aiModel: 'fixture-model',
  aiTimeoutMs: 4321,
});
assert.deepEqual(configuredReadiness, {
  configured: true,
  host: 'api.fixture.example',
  model: 'fixture-model',
  timeoutMs: 4321,
});
assert.equal(JSON.stringify(configuredReadiness).includes('fixture-secret-never-returned'), false);

const unconfiguredReadiness = buildCompatibilityAiProviderReadiness({
  aiApiKey: '',
  aiBaseUrl: 'https://api.fixture.example/v1',
  aiModel: 'fixture-model',
  aiTimeoutMs: 4321,
});
assert.equal(unconfiguredReadiness.configured, false);

const tank: Aquarium = {
  id: 'v4-shadow-tank',
  name: 'V4 shadow tank',
  fishes: [],
  dimensions: { length: '60', width: '35', height: '35' },
  waterType: 'Freshwater',
  targetTemperature: '24',
};

const reviewedCaution = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: reviewedA, record: { quantity: 5 } }],
  candidateSpecies: reviewedB,
  candidateQuantity: 1,
  intent: 'planned_addition',
});
assert.equal(reviewedCaution.metadata.domainStatus, 'caution');
assert.equal(reviewedCaution.metadata.decisionReadiness, 'reviewed');

let capturedSystem = '';
let capturedUser = '';
const acceptedProvider: CompatibilityAiReasoningProvider = async ({ system, user }) => {
  capturedSystem = system;
  capturedUser = user;
  return {
    model: 'fixture-model',
    output: {
      suggestedVerdict: 'not_recommended',
      reasons: [{ text: 'AI 可以提出更保守的 shadow 风险判断，但不能覆盖确定性 caution 结论。', ruleCodes: ['reviewed_pair_rule'] }],
      adjustments: [{ text: '先满足群体数量与共享水体窗口，再继续观察同缸状态。', ruleCodes: ['minimum_group_not_met'] }],
      uncertainties: [],
      confidence: 'medium',
      evidenceIds: reviewedCaution.evidenceIds || [],
    },
  };
};

const accepted = await createCompatibilityAiShadowAssessment({
  deterministicResult: reviewedCaution,
  tank,
  existingSpecies: [{ species: reviewedA, quantity: 5 }],
  candidateSpecies: reviewedB,
}, acceptedProvider);

assert.equal(accepted.mode, 'shadow');
assert.equal(accepted.ai.status, 'accepted');
assert.equal(accepted.ai.suggestedVerdict, 'not_recommended');
assert.equal(accepted.finalDecision.status, 'caution', 'shadow AI must never mutate deterministic final decision');
assert.equal(accepted.provenance.model, 'fixture-model');
assert.equal(accepted.provenance.promptVersion, COMPATIBILITY_AI_PROMPT_VERSION);
assert.match(capturedSystem, /Use ONLY facts, rules, evidence IDs and tank context included in INPUT/);
assert.match(capturedUser, /sp_0431/);
assert.match(capturedUser, /reviewed_pair_rule/);

const blocked = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: cory, record: { quantity: 6 } }],
  candidateSpecies: topmouth,
  candidateQuantity: 6,
  intent: 'planned_addition',
});
assert.equal(blocked.metadata.domainStatus, 'not_recommended');
assert.equal(blocked.metadata.decisionReadiness, 'reviewed');
assert.ok(blocked.blockingRules.length > 0);

const optimisticProvider: CompatibilityAiReasoningProvider = async () => ({
  model: 'fixture-model',
  output: {
    suggestedVerdict: 'compatible',
    reasons: [{ text: '错误地尝试弱化硬阻断。', ruleCodes: [blocked.blockingRules[0]!.code] }],
    adjustments: [],
    uncertainties: [],
    confidence: 'high',
    evidenceIds: blocked.evidenceIds || [],
  },
});

const rejectedOptimism = await createCompatibilityAiShadowAssessment({
  deterministicResult: blocked,
  tank,
  existingSpecies: [{ species: cory, quantity: 6 }],
  candidateSpecies: topmouth,
}, optimisticProvider);

assert.equal(rejectedOptimism.ai.status, 'rejected');
assert.equal(rejectedOptimism.ai.reason, 'provider_output_conflicts_with_deterministic_authority');
assert.equal(rejectedOptimism.finalDecision.status, 'not_recommended');

const inventedEvidenceProvider: CompatibilityAiReasoningProvider = async () => ({
  model: 'fixture-model',
  output: {
    suggestedVerdict: 'caution',
    reasons: [{ text: '引用了不存在的来源。', ruleCodes: ['reviewed_pair_rule'] }],
    adjustments: [],
    uncertainties: [],
    confidence: 'low',
    evidenceIds: ['invented-source-id'],
  },
});

const rejectedEvidence = await createCompatibilityAiShadowAssessment({
  deterministicResult: reviewedCaution,
  tank,
  existingSpecies: [{ species: reviewedA, quantity: 5 }],
  candidateSpecies: reviewedB,
}, inventedEvidenceProvider);
assert.equal(rejectedEvidence.ai.status, 'rejected');
assert.equal(rejectedEvidence.ai.reason, 'provider_output_uses_unknown_authority');
assert.equal(rejectedEvidence.finalDecision.status, 'caution');

const incomplete = evaluateTankCompatibility({
  tank,
  existingSpecies: [{ species: cory, record: { quantity: 6 } }],
  candidateSpecies: normanLampEye,
  intent: 'planned_addition',
});
assert.notEqual(incomplete.metadata.decisionReadiness, 'reviewed');
let incompleteProviderCalls = 0;
const shouldNotRunProvider: CompatibilityAiReasoningProvider = async () => {
  incompleteProviderCalls += 1;
  throw new Error('provider must not run');
};
const skipped = await createCompatibilityAiShadowAssessment({
  deterministicResult: incomplete,
  tank,
  existingSpecies: [{ species: cory, quantity: 6 }],
  candidateSpecies: normanLampEye,
}, shouldNotRunProvider);
assert.equal(skipped.ai.status, 'skipped');
assert.equal(skipped.ai.reason, 'deterministic_decision_not_fully_reviewed');
assert.equal(incompleteProviderCalls, 0, 'AI provider must not run when deterministic authority is incomplete');

const unavailable = await createCompatibilityAiShadowAssessment({
  deterministicResult: reviewedCaution,
  tank,
  existingSpecies: [{ species: reviewedA, quantity: 5 }],
  candidateSpecies: reviewedB,
}, async () => {
  throw new ProviderError('timeout', 'fixture timeout');
});
assert.equal(unavailable.ai.status, 'unavailable');
assert.equal(unavailable.ai.reason, 'timeout');
assert.equal(unavailable.finalDecision.status, 'caution');

const routeSource = readFileSync('apps/api/src/routes/aquariums.ts', 'utf8');
assert.match(routeSource, /compatibility-ai-shadow/);
assert.match(routeSource, /compatibility-ai-readiness/);
assert.match(routeSource, /getCompatibilityAiProviderReadiness/);
assert.match(routeSource, /readPublishedCatalogCompatibilityContext/);
assert.match(routeSource, /createCompatibilityAiShadowAssessment/);

console.log('Compatibility V4 AI shadow PASS: reviewed combinations can be assisted; hard blocks, incomplete authority, invented evidence and provider failure cannot change deterministic decisions.');

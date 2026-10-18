import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import {
  buildCompatibilityResolutionTargets,
} from '../src/services/compatibility/compatibility-decision-plan.service';
import {
  createCompatibilityAiCombinationAssessment,
  type CompatibilityAiReasoningProvider,
} from '../apps/api/src/compatibility-ai-reasoner';
import { buildCompatibilityProductAssessment } from '../apps/api/src/compatibility-ai-product';
import type { Aquarium } from '../src/types';

const byId = (id: string) => {
  const value = fishData.find(item => item.id === id);
  assert.ok(value, `missing fixture fish ${id}`);
  return value;
};

const tankAt = (temperature: string): Aquarium => ({
  id: `ai-resolution-${temperature}`,
  name: 'AI resolution grounding',
  fishes: [],
  dimensions: { length: '200', width: '70', height: '60' },
  waterType: 'Freshwater',
  targetTemperature: temperature,
});

const providerFor = (
  expectedMode: string,
  verifyPayload: (payload: any) => void,
  outputFor: (payload: any) => any,
): CompatibilityAiReasoningProvider => async ({ user }) => {
  const payload = JSON.parse(user);
  assert.equal(payload.assessmentMode, expectedMode);
  verifyPayload(payload);
  return { model: 'ai-resolution-grounding-fixture', output: outputFor(payload) };
};

// Hard predation: AI sees structural clearance and may only restate separation/replacement.
const oscar = byId('sp_0451');
const zebrafish = byId('sp_0435');
const predationDecision = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [
    { species: oscar, quantity: 1, origin: 'existing' },
    { species: zebrafish, quantity: 8, origin: 'candidate' },
  ],
});
assert.equal(predationDecision.status, 'not_recommended');
const predationTargets = buildCompatibilityResolutionTargets(predationDecision, 'planned_addition');
assert.equal(predationTargets[0]?.riskFamily, 'predation');
assert.equal(predationTargets[0]?.resolutionMode, 'deterministic_clearance');
const predationShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: predationDecision.aggregateResult,
  tank: tankAt('23'),
  items: [
    { species: oscar, quantity: 1, origin: 'existing' },
    { species: zebrafish, quantity: 8, origin: 'planned' },
  ],
  assessmentMode: 'planned_addition',
  resolutionTargets: predationTargets,
}, providerFor('planned_addition', payload => {
  assert.deepEqual(payload.resolutionTargets, predationTargets);
  assert.match(payload.resolutionTargets[0].criterion, /不再直接接触|分隔|替换/);
}, payload => ({
  suggestedVerdict: 'not_recommended',
  reasons: [{ text: '地图鱼与斑马鱼存在明确捕食风险。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  adjustments: [{ text: '不要继续这个组合；把地图鱼与斑马鱼分隔或替换后再重新评估。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  uncertainties: [],
  confidence: 'high',
  evidenceIds: [],
})));
assert.equal(predationShadow.ai.status, 'accepted');
assert.equal(buildCompatibilityProductAssessment(predationDecision, predationShadow).details.explanation.source, 'ai_grounded');

// Group size: AI receives the measured >=8 criterion, not a generic "add more" instruction.
const groupDecision = evaluateCompatibilityDecision({
  tank: tankAt('23'),
  items: [{ species: zebrafish, quantity: 7, origin: 'candidate' }],
});
assert.equal(groupDecision.status, 'caution');
const groupTargets = buildCompatibilityResolutionTargets(groupDecision, 'planned_addition');
assert.equal(groupTargets[0]?.resolutionMode, 'parameter_recheck');
assert.match(groupTargets[0]?.criterion || '', /至少 8/);
const groupShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: groupDecision.aggregateResult,
  tank: tankAt('23'),
  items: [{ species: zebrafish, quantity: 7, origin: 'planned' }],
  assessmentMode: 'planned_addition',
  resolutionTargets: groupTargets,
}, providerFor('planned_addition', payload => {
  assert.match(payload.resolutionTargets[0].criterion, /至少 8/);
}, payload => ({
  suggestedVerdict: 'caution',
  reasons: [{ text: '斑马鱼当前计划群体数量不足。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  adjustments: [{ text: '把斑马鱼计划数量补足到至少 8 条，再重新评估。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  uncertainties: [],
  confidence: 'high',
  evidenceIds: [],
})));
assert.equal(groupShadow.ai.status, 'accepted');

// Tank temperature: AI receives a parameter recheck target and cannot replace it with a structural claim.
const temperatureDecision = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: [{ species: zebrafish, quantity: 8, origin: 'candidate' }],
});
assert.equal(temperatureDecision.status, 'not_recommended');
const temperatureTargets = buildCompatibilityResolutionTargets(temperatureDecision, 'planned_addition');
assert.equal(temperatureTargets[0]?.riskFamily, 'temperature');
assert.equal(temperatureTargets[0]?.resolutionMode, 'parameter_recheck');
const temperatureShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: temperatureDecision.aggregateResult,
  tank: tankAt('25'),
  items: [{ species: zebrafish, quantity: 8, origin: 'planned' }],
  assessmentMode: 'planned_addition',
  resolutionTargets: temperatureTargets,
}, providerFor('planned_addition', payload => {
  assert.match(payload.resolutionTargets[0].criterion, /目标温度|tank_temperature_conflict/);
}, payload => ({
  suggestedVerdict: 'not_recommended',
  reasons: [{ text: '当前鱼缸目标水温不适合斑马鱼。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  adjustments: [{ text: '调整鱼缸目标温度到已审核适温范围，再重新评估温度风险。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  uncertainties: [],
  confidence: 'high',
  evidenceIds: [],
})));
assert.equal(temperatureShadow.ai.status, 'accepted');

// Behavioral caution: claiming the risk is already resolved is rejected at the reasoner boundary.
const currentItems = [
  { species: byId('sp_0114'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0469'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0013'), quantity: 1, origin: 'existing' as const },
  { species: byId('sp_0431'), quantity: 10, origin: 'existing' as const },
];
const behavioralDecision = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: currentItems,
});
assert.equal(behavioralDecision.status, 'caution');
const behavioralTargets = buildCompatibilityResolutionTargets(behavioralDecision, 'current_tank');
assert.equal(behavioralTargets[0]?.resolutionMode, 'behavioral_recheck');
const badBehaviorShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: behavioralDecision.aggregateResult,
  tank: tankAt('25'),
  items: currentItems,
  assessmentMode: 'current_tank',
  resolutionTargets: behavioralTargets,
}, providerFor('current_tank', payload => {
  assert.equal(payload.resolutionTargets[0].resolutionMode, 'behavioral_recheck');
}, payload => ({
  suggestedVerdict: 'caution',
  reasons: [{ text: '当前存在被捕食脆弱性，需要继续观察。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  adjustments: [{ text: '风险已解除，现在可以安全混养。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  uncertainties: [],
  confidence: 'medium',
  evidenceIds: [],
})));
assert.equal(badBehaviorShadow.ai.status, 'rejected');
assert.equal(badBehaviorShadow.ai.reason, 'provider_output_conflicts_with_resolution_target');
const badBehaviorProduct = buildCompatibilityProductAssessment(behavioralDecision, badBehaviorShadow, 'current_tank');
assert.equal(badBehaviorProduct.details.explanation.source, 'deterministic_fallback');
assert.equal(badBehaviorProduct.details.explanation.narrativeAccepted, false);
assert.doesNotMatch(badBehaviorProduct.main.howTo.join(' '), /风险已解除|安全混养/);

const goodBehaviorShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: behavioralDecision.aggregateResult,
  tank: tankAt('25'),
  items: currentItems,
  assessmentMode: 'current_tank',
  resolutionTargets: behavioralTargets,
}, providerFor('current_tank', () => {}, payload => ({
  suggestedVerdict: 'caution',
  reasons: [{ text: '当前存在被捕食脆弱性，需要继续观察实际状态。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  adjustments: [{ text: '继续观察追食、躲藏、受伤和进食；出现持续异常立即分隔并重新评估。', ruleCodes: [payload.allowedRuleCodes[0]] }],
  uncertainties: [],
  confidence: 'medium',
  evidenceIds: [],
})));
assert.equal(goodBehaviorShadow.ai.status, 'accepted');
assert.equal(buildCompatibilityProductAssessment(behavioralDecision, goodBehaviorShadow, 'current_tank').details.explanation.source, 'ai_grounded');

// Product-layer defense must also reject a forged accepted shadow that bypassed the reasoner.
const forgedBehaviorShadow = {
  ...goodBehaviorShadow,
  ai: {
    ...goodBehaviorShadow.ai,
    status: 'accepted' as const,
    reasons: [{
      text: '捕食风险已解除，现在可以安全混养。',
      ruleCodes: [behavioralTargets[0]!.sourceRuleCode],
    }],
    adjustments: [{
      text: '继续观察追食、躲藏、受伤和进食；出现持续异常立即分隔。',
      ruleCodes: [behavioralTargets[0]!.sourceRuleCode],
    }],
  },
};
const forgedBehaviorProduct = buildCompatibilityProductAssessment(behavioralDecision, forgedBehaviorShadow, 'current_tank');
assert.equal(forgedBehaviorProduct.details.explanation.source, 'deterministic_fallback');
assert.equal(forgedBehaviorProduct.details.explanation.narrativeAccepted, false);
assert.doesNotMatch(forgedBehaviorProduct.main.why.join(' '), /风险已解除|安全混养/);

// Information-required decisions stay fail-closed before the provider can narrate a guess.
const insufficientDecision = evaluateCompatibilityDecision({
  tank: tankAt('25'),
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0065'), quantity: 1, origin: 'candidate' },
  ],
});
assert.equal(insufficientDecision.status, 'insufficient_data');
const insufficientTargets = buildCompatibilityResolutionTargets(insufficientDecision, 'planned_addition');
assert.ok(insufficientTargets.length > 0);
assert.ok(insufficientTargets.every(target => target.resolutionMode === 'information_required'));
let insufficientProviderCalls = 0;
const insufficientProvider = Object.assign(async () => {
  insufficientProviderCalls += 1;
  throw new Error('provider must not run for incomplete deterministic authority');
}, { readiness: () => ({ configured: true, host: 'fixture', model: 'fixture', fallbackModels: [], timeoutMs: 1000 }) });
const insufficientShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: insufficientDecision.aggregateResult,
  tank: tankAt('25'),
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0065'), quantity: 1, origin: 'planned' },
  ],
  assessmentMode: 'planned_addition',
  resolutionTargets: insufficientTargets,
}, insufficientProvider);
assert.equal(insufficientProviderCalls, 0);
assert.equal(insufficientShadow.ai.status, 'skipped');
assert.equal(buildCompatibilityProductAssessment(insufficientDecision, insufficientShadow).details.explanation.source, 'deterministic_fallback');

console.log('Compatibility AI resolution grounding PASS: AI receives deterministic resolution criteria, structural/parameter actions stay grounded, behavioral clearance claims are rejected with deterministic fallback, and insufficient authority never reaches the provider.');

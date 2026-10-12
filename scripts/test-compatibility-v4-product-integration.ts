import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { Aquarium } from '../src/types';
import type { CompatibilityAiReasoning, CompatibilityAiReasoningRequest } from '../packages/contracts/src';
import { fishData } from '../src/data/fishData';
import {
  reviewSpeciesAdditionsWithAi,
} from '../src/services/aquarium/species-addition.service';
import type { CompatibilityAiReasoner } from '../src/services/compatibility/compatibility-ai.service';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getCompatibilityPresentationWithAi } from '../src/services/compatibility/compatibility-presentation.service';

const fish = (id: string) => {
  const found = fishData.find(item => item.id === id);
  assert.ok(found, `missing test species ${id}`);
  return found;
};

const blackSkirt = fish('sp_0010');
const platy = fish('sp_0011');
const altum = fish('sp_0019');

const aquarium: Aquarium = {
  id: 'v4-product-integration-tank',
  name: 'V4 Product Integration Tank',
  waterType: 'Freshwater',
  targetTemperature: '24',
  dimensions: { length: '120', width: '50', height: '50' },
  substrate: '河沙',
  plants: ['plant-a', 'plant-b'],
  hardscape: ['rock-a'],
  fishes: [{
    id: 'existing-black-skirt',
    fishId: blackSkirt.id,
    quantity: 6,
    entryDate: '2026-10-01',
  }],
} as Aquarium;

const modelResult = (
  request: CompatibilityAiReasoningRequest,
  verdict: CompatibilityAiReasoning['verdict'],
): CompatibilityAiReasoning => ({
  verdict,
  reasons: ['动态综合后发现该组合存在额外行为压力。'],
  adjustments: ['先调整群体数量与空间，再重新评估。'],
  uncertainties: [],
  confidence: 'medium',
  evidenceIds: request.allowedEvidenceIds.slice(0, 2),
  provenance: {
    mode: 'ai_assisted',
    model: 'mock-v4-product-model',
    authorityVersion: request.authorityVersion,
    speciesIds: request.species.map(item => item.speciesId),
  },
});

let stricterCalls = 0;
const stricterReasoner: CompatibilityAiReasoner = async request => {
  stricterCalls += 1;
  assert.deepEqual(
    request.species.map(item => item.speciesId).sort(),
    [blackSkirt.id, platy.id].sort(),
    'submit-time V4 review must include current tank livestock and the candidate',
  );
  return modelResult(request, 'not_recommended');
};

const stricterReview = await reviewSpeciesAdditionsWithAi({
  aquarium,
  items: [{ fishId: platy.id, quantity: 4 }],
  speciesCatalog: fishData,
}, stricterReasoner);

assert.ok(stricterReview);
assert.equal(stricterCalls, 1, 'planned addition without a reviewed Pair Rule must reach V4 reasoning');
assert.equal(stricterReview.status, 'not_recommended');
assert.equal(stricterReview.policy, 'block', 'AI may raise risk and submit-time policy must block');
assert.equal(stricterReview.runtimeReasoning.provenance.mode, 'ai_assisted');
assert.ok(stricterReview.evaluations.length > 0, 'deterministic evaluations must remain available as authority evidence');

const deterministicDecision = evaluateCompatibilityDecision({
  tank: aquarium,
  items: [
    { species: blackSkirt, quantity: 6, origin: 'existing' },
    { species: platy, quantity: 4, origin: 'candidate' },
  ],
});
const runtimePresentation = getCompatibilityPresentationWithAi(
  deterministicDecision,
  stricterReview.runtimeReasoning,
);
assert.equal(runtimePresentation.headline, '不建议');
assert.equal(runtimePresentation.primaryReason, '动态综合后发现该组合存在额外行为压力。');
assert.equal(runtimePresentation.primaryActionText, '先调整群体数量与空间，再重新评估。');
assert.ok(
  deterministicDecision.warningRules.length + deterministicDecision.blockingRules.length + deterministicDecision.passedRules.length > 0,
  'AI presentation must sit on top of deterministic evidence rather than replacing it',
);

const fallbackReview = await reviewSpeciesAdditionsWithAi({
  aquarium,
  items: [{ fishId: platy.id, quantity: 4 }],
  speciesCatalog: fishData,
}, async () => {
  throw new Error('provider unavailable');
});
assert.ok(fallbackReview);
assert.equal(fallbackReview.status, 'insufficient_data', 'provider failure must fail closed at submit time');
assert.equal(fallbackReview.policy, 'complete_information');
assert.equal(fallbackReview.runtimeReasoning.provenance.mode, 'fallback');

let hardBlockCalls = 0;
const hardBlockReview = await reviewSpeciesAdditionsWithAi({
  aquarium,
  items: [{ fishId: altum.id, quantity: 1 }],
  speciesCatalog: fishData,
}, async request => {
  hardBlockCalls += 1;
  return modelResult(request, 'compatible');
});
assert.ok(hardBlockReview);
assert.equal(hardBlockCalls, 0, 'deterministic hard block must bypass AI even in the submit-time wrapper');
assert.equal(hardBlockReview.status, 'not_recommended');
assert.equal(hardBlockReview.policy, 'block');
assert.equal(hardBlockReview.runtimeReasoning.provenance.mode, 'deterministic_only');

const calculatorSource = readFileSync('src/components/CompatibilityRiskCalculator.tsx', 'utf8');
assert.match(calculatorSource, /evaluateCompatibilityDecisionWithAi\(/, 'calculator must call the async V4 entry');
assert.match(calculatorSource, /runtimeReasoning,\s*\n\s*\}\);/, 'calculator visual result must receive runtime reasoning');
assert.match(calculatorSource, /actionPending=\{isAddingToAquarium \|\| isRuntimeReasoningPending\}/, 'calculator must block mutation while V4 reasoning is pending');
assert.match(calculatorSource, /if \(isAddingToAquarium \|\| isRuntimeReasoningPending\) return;/, 'actual add handler must reject mutation while V4 reasoning is pending');
assert.match(calculatorSource, /综合判断中…/, 'calculator must expose a bounded pending state');

const speciesDetailSource = readFileSync('src/components/SpeciesDetailDialog.tsx', 'utf8');
assert.match(speciesDetailSource, /evaluateCompatibilityDecisionWithAi\(compatibilityDecisionInput\)/, 'species detail compatibility panel must call V4');
assert.match(speciesDetailSource, /runtimeReasoning: compatibilityRuntimeReasoning/, 'species detail visual result must receive V4 reasoning');

for (const path of [
  'src/pages/Compatibility.tsx',
  'src/pages/Aquarium.tsx',
  'src/pages/Encyclopedia.tsx',
]) {
  const source = readFileSync(path, 'utf8');
  assert.match(
    source,
    /await reviewSpeciesAdditionsWithAi\(/,
    `${path} must revalidate the actual write through V4 before saving livestock`,
  );
}

console.log('Compatibility V4 product integration PASS: calculator/detail display and all three real livestock-write paths use deterministic-first V4 reasoning with pending and fail-closed guards.');

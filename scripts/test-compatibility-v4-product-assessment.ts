import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import type { Aquarium } from '../src/types';
import {
  createCompatibilityAiCombinationAssessment,
  type CompatibilityAiReasoningProvider,
  type CompatibilityAiShadowResult,
} from '../apps/api/src/compatibility-ai-reasoner';
import { buildCompatibilityProductAssessment } from '../apps/api/src/compatibility-ai-product';
import {
  parseCompatibilityPlannedItems,
  readPublishedCatalogCombinationContext,
} from '../apps/api/src/routes/aquariums';
import { LOCAL_CATALOG_VERSION } from '../src/data/catalogVersion';

const byId = (id: string) => {
  const fish = fishData.find(item => item.id === id);
  assert.ok(fish, 'missing catalog fish ' + id);
  return fish;
};

const tank: Aquarium = {
  id: 'compatibility-product-assessment',
  name: 'Compatibility Product Assessment',
  fishes: [],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};

const cautionItems = [
  { species: byId('sp_0114'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0469'), quantity: 8, origin: 'existing' as const },
  { species: byId('sp_0013'), quantity: 1, origin: 'planned' as const },
];
const cautionDecision = evaluateCompatibilityDecision({
  tank,
  items: cautionItems.map(item => ({
    species: item.species,
    quantity: item.quantity,
    origin: item.origin === 'planned' ? 'candidate' as const : 'existing' as const,
  })),
});
assert.equal(cautionDecision.status, 'caution');
assert.equal(cautionDecision.metadata.decisionReadiness, 'reviewed');

let providerCalls = 0;
const provider: CompatibilityAiReasoningProvider = async ({ user }) => {
  providerCalls += 1;
  const payload = JSON.parse(user);
  assert.equal(payload.species.length, 3);
  assert.equal(payload.quantities.length, 3);
  assert.deepEqual(
    payload.quantities.map((item: any) => item.origin),
    ['existing', 'existing', 'planned'],
  );
  const ruleCode = cautionDecision.aggregateResult.warningRules[0]?.code
    || cautionDecision.aggregateResult.metadata.domainRuleCodes[0];
  assert.ok(ruleCode);
  return {
    model: 'product-fixture-model',
    output: {
      suggestedVerdict: 'caution',
      reasons: [{ text: '整缸组合存在需要关注的已审核风险。', ruleCodes: [ruleCode] }],
      adjustments: [{ text: '先按该风险项调整混养计划，再决定是否加入。', ruleCodes: [ruleCode] }],
      uncertainties: [],
      confidence: 'high',
      evidenceIds: cautionDecision.aggregateResult.evidenceIds || [],
    },
  };
};

const cautionShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: cautionDecision.aggregateResult,
  tank,
  items: cautionItems,
}, provider);
assert.equal(providerCalls, 1);
assert.equal(cautionShadow.ai.status, 'accepted');
assert.equal(cautionShadow.finalDecision.status, 'caution');

const product = buildCompatibilityProductAssessment(cautionDecision, cautionShadow);
assert.equal(product.main.judgment, '有条件可以');
assert.ok(product.main.why.length > 0);
assert.ok(product.main.howTo.length > 0);
assert.equal(product.details.label, '查看依据');
assert.equal(product.details.explanation.source, 'ai_grounded');
assert.equal(product.details.explanation.narrativeAccepted, true);
assert.equal(product.details.authority.finalSource, 'deterministic');
assert.equal(product.details.authority.status, 'caution');
assert.ok(product.details.reasons.length > 0);
assert.ok(product.details.adjustments.length > 0);

const conservativeShadow: CompatibilityAiShadowResult = {
  ...cautionShadow,
  ai: {
    ...cautionShadow.ai,
    status: 'accepted',
    suggestedVerdict: 'not_recommended',
    reasons: [{ text: 'AI 更保守，但不能覆盖最终判断。', ruleCodes: cautionDecision.aggregateResult.metadata.domainRuleCodes.slice(0, 1) }],
    adjustments: [{ text: 'AI 建议停止计划。', ruleCodes: cautionDecision.aggregateResult.metadata.domainRuleCodes.slice(0, 1) }],
    uncertainties: [],
  },
};
const conservativeProduct = buildCompatibilityProductAssessment(cautionDecision, conservativeShadow);
assert.equal(conservativeProduct.main.judgment, '有条件可以');
assert.equal(conservativeProduct.details.explanation.source, 'deterministic_fallback');
assert.equal(conservativeProduct.details.explanation.narrativeAccepted, false);
assert.notEqual(conservativeProduct.details.reasons[0]?.text, 'AI 更保守，但不能覆盖最终判断。');
assert.equal(conservativeProduct.main.why.includes('AI 更保守，但不能覆盖最终判断。'), false);

const insufficientDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0112'), quantity: 1, origin: 'candidate' },
  ],
});
assert.equal(insufficientDecision.status, 'insufficient_data');
let skippedProviderCalls = 0;
const skippedShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: insufficientDecision.aggregateResult,
  tank,
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0112'), quantity: 1, origin: 'planned' },
  ],
}, Object.assign(async () => {
  skippedProviderCalls += 1;
  throw new Error('provider must not run for insufficient deterministic authority');
}, { readiness: () => ({ configured: true, host: 'fixture', model: 'fixture', fallbackModels: [], timeoutMs: 1000 }) }));
assert.equal(skippedProviderCalls, 0);
assert.equal(skippedShadow.ai.status, 'skipped');
const insufficientProduct = buildCompatibilityProductAssessment(insufficientDecision, skippedShadow);
assert.equal(insufficientProduct.main.judgment, '暂时无法判断');
assert.equal(insufficientProduct.details.explanation.source, 'deterministic_fallback');
assert.equal(insufficientProduct.details.authority.finalSource, 'deterministic');
assert.ok(insufficientProduct.details.uncertainties.length > 0);
assert.ok(insufficientProduct.main.why.some(text => /资料|确认|缺少|审核/.test(text)));
assert.ok(insufficientProduct.main.howTo.length > 0);

assert.deepEqual(
  parseCompatibilityPlannedItems(['sp_0013:1', 'sp_0469:4', 'sp_0469:2']),
  [
    { speciesCatalogKey: 'sp_0013', quantity: 1 },
    { speciesCatalogKey: 'sp_0469', quantity: 6 },
  ],
);
assert.deepEqual(parseCompatibilityPlannedItems('sp_0012'), [{ speciesCatalogKey: 'sp_0012', quantity: 1 }]);
assert.throws(() => parseCompatibilityPlannedItems('sp_0012:0'));

type Result = { data: any; error: any };
const query = (result: Result) => {
  const chain: Record<string, any> = {};
  for (const method of ['select', 'eq', 'is', 'maybeSingle']) chain[method] = () => chain;
  chain.then = (resolve: (value: Result) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return chain;
};
type CombinationClient = Parameters<typeof readPublishedCatalogCombinationContext>[0]['client'];
const fakeClient = {
  from: (table: string) => {
    assert.equal(table, 'aquariums');
    return query({
      data: {
        water_type: 'Freshwater',
        length_cm: 120,
        width_cm: 50,
        height_cm: 50,
        target_temperature_c: 25,
        aquarium_species: [
          { species_catalog_key: 'sp_0114', quantity: 8, deleted_at: null },
        ],
      },
      error: null,
    });
  },
} as unknown as CombinationClient;

const combinationContext = await readPublishedCatalogCombinationContext({
  client: fakeClient,
  aquariumId: 'tank-fixture',
  catalogVersion: LOCAL_CATALOG_VERSION,
  plannedItems: [
    { speciesCatalogKey: 'sp_0469', quantity: 8 },
    { speciesCatalogKey: 'sp_0013', quantity: 1 },
  ],
});
assert.equal(combinationContext.items.length, 3);
assert.equal(combinationContext.decision.pairResults.length, 3);
assert.equal(combinationContext.decision.status, 'caution');

const routeSource = readFileSync(new URL('../apps/api/src/routes/aquariums.ts', import.meta.url), 'utf8');
const productRouteStart = routeSource.indexOf("aquariumsRouter.get('/aquariums/:id/compatibility-assessment'");
const productRouteEnd = routeSource.indexOf("aquariumsRouter.patch('/aquariums/:id'", productRouteStart);
assert.ok(productRouteStart >= 0 && productRouteEnd > productRouteStart);
const productRouteSource = routeSource.slice(productRouteStart, productRouteEnd);
assert.match(productRouteSource, /createCompatibilityAiCombinationAssessment/);
assert.match(productRouteSource, /buildCompatibilityProductAssessment/);
assert.doesNotMatch(productRouteSource, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);

console.log('Compatibility V4 product assessment PASS: on-demand whole-tank aggregation, grounded AI explanation, deterministic authority fallback, fail-closed unknowns and read-only API contract.');

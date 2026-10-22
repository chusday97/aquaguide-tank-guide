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
import { COMPATIBILITY_PRODUCT_SCHEMA_VERSION } from '../src/services/compatibility/compatibility-product-contract';
import { getCompatibilityDataLimitationCodes } from '../src/services/compatibility/compatibility-decision-plan.service';
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
      reasons: [{ text: '组合里有更容易被追食的一方，需要先确认实际捕食风险。', ruleCodes: [ruleCode] }],
      adjustments: [{ text: '先观察实际追食、躲藏和进食；若持续异常就立即分隔，再决定是否加入。', ruleCodes: [ruleCode] }],
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
assert.equal(product.schemaVersion, COMPATIBILITY_PRODUCT_SCHEMA_VERSION);
assert.equal(product.assessmentMode, 'planned_addition');
assert.equal(product.main.judgment, '条件混养');
assert.ok(product.main.why.length > 0);
assert.ok(product.main.howTo.length > 0);
assert.equal(product.main.why[0], '组合里有更容易被追食的一方，需要先确认实际捕食风险。');
assert.equal(product.main.howTo[0], '先观察实际追食、躲藏和进食；若持续异常就立即分隔，再决定是否加入。');
assert.equal(product.details.label, '查看依据');
assert.equal(product.details.explanation.source, 'ai_grounded');
assert.equal(product.details.explanation.narrativeAccepted, true);
assert.equal(product.details.authority.finalSource, 'deterministic');
assert.equal(product.details.authority.status, 'caution');
assert.ok(product.details.reasons.length > 0);
assert.ok(product.details.adjustments.length > 0);
assert.deepEqual(
  product.details.reasons.slice(0, product.main.why.length).map(item => item.text),
  product.main.why,
  'cloud product details must preserve the exact visible reason order before exposing evidence',
);

assert.throws(
  () => buildCompatibilityProductAssessment(
    { ...cautionDecision, status: 'compatible' },
    cautionShadow,
  ),
  /COMPATIBILITY_AUTHORITY_STATUS_MISMATCH/,
  'product builder must fail closed if wrapper status diverges from canonical aggregate authority',
);

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
assert.equal(conservativeProduct.main.judgment, '条件混养');
assert.equal(conservativeProduct.details.explanation.source, 'deterministic_fallback');
assert.equal(conservativeProduct.details.explanation.narrativeAccepted, false);
assert.notEqual(conservativeProduct.details.reasons[0]?.text, 'AI 更保守，但不能覆盖最终判断。');
assert.equal(conservativeProduct.main.why.includes('AI 更保守，但不能覆盖最终判断。'), false);

const insufficientDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0004'), quantity: 1, origin: 'candidate' },
  ],
});
assert.equal(insufficientDecision.status, 'insufficient_data');
assert.equal(
  insufficientDecision.missingData.some(rule => rule.code === 'missing_ph' || rule.code === 'missing_hardness'),
  false,
  'optional pH/GH measurements must not be promoted into decision-limiting missing data when another authority gap makes the result insufficient',
);
let skippedProviderCalls = 0;
const skippedShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: insufficientDecision.aggregateResult,
  tank,
  items: [
    { species: byId('sp_0114'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0469'), quantity: 8, origin: 'existing' },
    { species: byId('sp_0004'), quantity: 1, origin: 'planned' },
  ],
}, Object.assign(async () => {
  skippedProviderCalls += 1;
  throw new Error('provider must not run for insufficient deterministic authority');
}, { readiness: () => ({ configured: true, host: 'fixture', model: 'fixture', fallbackModels: [], timeoutMs: 1000 }) }));
assert.equal(skippedProviderCalls, 0);
assert.equal(skippedShadow.ai.status, 'skipped');
const insufficientProduct = buildCompatibilityProductAssessment(insufficientDecision, skippedShadow);
assert.equal(insufficientProduct.main.judgment, '需要关键信息');
assert.equal(insufficientProduct.details.explanation.source, 'deterministic_fallback');
assert.equal(insufficientProduct.details.authority.finalSource, 'deterministic');
assert.ok(insufficientProduct.details.uncertainties.length > 0);
assert.ok(insufficientProduct.main.why.some(text => /资料|确认|缺少|审核/.test(text)));
assert.ok(insufficientProduct.main.howTo.length > 0);

const blockedWithUnknownDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    { species: byId('sp_0001'), quantity: 6, origin: 'existing' },
    { species: byId('sp_0019'), quantity: 6, origin: 'existing' },
    { species: byId('sp_0004'), quantity: 1, origin: 'candidate' },
  ],
});
assert.equal(blockedWithUnknownDecision.status, 'not_recommended');
assert.ok(blockedWithUnknownDecision.blockingRules.length > 0);
assert.ok(blockedWithUnknownDecision.missingData.length > 0, 'hard-blocked combinations can still contain independent unknown evidence boundaries');
const blockedWithUnknownShadow: CompatibilityAiShadowResult = {
  ...cautionShadow,
  ai: {
    status: 'skipped',
    reason: 'mixed-authority regression fixture',
    reasons: [],
    adjustments: [],
    uncertainties: [],
  },
};
const blockedWithUnknownProduct = buildCompatibilityProductAssessment(blockedWithUnknownDecision, blockedWithUnknownShadow);
assert.equal(blockedWithUnknownProduct.main.judgment, '不建议混养');
assert.equal(blockedWithUnknownProduct.details.authority.status, 'not_recommended');
assert.ok(blockedWithUnknownProduct.details.uncertainties.length > 0, 'a stronger hard-block verdict must not erase independent missing-data boundaries');
const blockedWithUnknownLimitationCodes = new Set(getCompatibilityDataLimitationCodes(blockedWithUnknownDecision));
assert.ok(
  blockedWithUnknownProduct.details.uncertainties.every(item => item.ruleCodes.every(code => blockedWithUnknownLimitationCodes.has(code))),
  'mixed-status uncertainties must remain grounded only in deterministic data-limitation authority',
);

const mixedBoundaryTank = {
  ...tank,
  id: 'compatibility-product-mixed-boundary',
  dimensions: { length: '300', width: '100', height: '80' },
  targetTemperature: '22',
};
const blockedWithPublicEvidence = evaluateCompatibilityDecision({
  tank: mixedBoundaryTank,
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0049'), quantity: 1, origin: 'existing' },
    { species: byId('sp_0039'), quantity: 6, origin: 'candidate' },
  ],
});
assert.equal(blockedWithPublicEvidence.status, 'not_recommended');
const blockedWithPublicEvidenceProduct = buildCompatibilityProductAssessment(blockedWithPublicEvidence, blockedWithUnknownShadow);
assert.equal(blockedWithPublicEvidenceProduct.main.judgment, '不建议混养');
assert.ok(
  blockedWithPublicEvidenceProduct.details.uncertainties.some(item => item.ruleCodes.includes('species_public_evidence_insufficient')),
  'mixed hard blocks must surface the public-evidence ceiling itself, not only secondary unreviewed behavior rows',
);
assert.ok(blockedWithPublicEvidenceProduct.details.uncertainties.some(item => /公开.*证据|公开可靠资料/.test(item.text)));

const blockedWithIdentity = evaluateCompatibilityDecision({
  tank: mixedBoundaryTank,
  items: [
    { species: byId('sp_0431'), quantity: 10, origin: 'existing' },
    { species: byId('sp_0049'), quantity: 1, origin: 'existing' },
    { species: byId('sp_0474'), quantity: 6, origin: 'candidate' },
  ],
});
assert.equal(blockedWithIdentity.status, 'not_recommended');
const blockedWithIdentityProduct = buildCompatibilityProductAssessment(blockedWithIdentity, blockedWithUnknownShadow);
assert.equal(blockedWithIdentityProduct.main.judgment, '不建议混养');
assert.ok(blockedWithIdentityProduct.details.uncertainties.some(item => item.ruleCodes.includes('species_identity_unresolved')));
assert.ok(blockedWithIdentityProduct.details.uncertainties.some(item => /身份|商品名|明确物种/.test(item.text)));

const partialEvidenceDecision = evaluateCompatibilityDecision({
  tank: mixedBoundaryTank,
  items: [
    { species: byId('sp_0010'), quantity: 6, origin: 'existing' },
    { species: byId('sp_0066'), quantity: 6, origin: 'candidate' },
  ],
});
assert.equal(partialEvidenceDecision.status, 'caution');
const partialEvidenceProduct = buildCompatibilityProductAssessment(partialEvidenceDecision, blockedWithUnknownShadow);
assert.ok(partialEvidenceProduct.details.uncertainties.some(item => item.ruleCodes.includes('species_evidence_ceiling')));
assert.ok(partialEvidenceProduct.details.uncertainties.some(item => /公开证据|缺证据/.test(item.text)));

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
assert.match(productRouteSource, /assessmentMode/);
assert.doesNotMatch(productRouteSource, /\.insert\(|\.update\(|\.delete\(|\.upsert\(/);

console.log('Compatibility V4 product assessment PASS: on-demand whole-tank aggregation, grounded AI explanation, deterministic authority fallback, fail-closed unknowns and read-only API contract.');

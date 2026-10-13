import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { reviewSpeciesAdditions } from '../src/services/aquarium/species-addition.service';
import {
  getCompatibilityRuleFamily,
} from '../src/services/compatibility/compatibility-action.service';
import { buildCompatibilityReadableConclusion } from '../src/services/compatibility/compatibility-readable-copy.service';
import { getCompatibilityDecision } from '../src/services/compatibility/compatibility.service';
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

const quantityFor = (id: string) => Math.max(1, getReviewedCompatibilityProfile(id)?.minimumGroupSize || 1);

const tankFor = (existingIds: string[], dimensions = { length: '200', width: '70', height: '60' }): Aquarium => ({
  id: 'complex-whole-tank',
  name: 'Complex Whole Tank',
  fishes: existingIds.map((fishId, index) => ({
    id: 'existing-' + index,
    fishId,
    quantity: quantityFor(fishId),
    entryDate: '2026-10-01T00:00:00.000Z',
  })),
  dimensions,
  waterType: 'Freshwater',
  targetTemperature: '25',
});

const reviewCase = (
  existingIds: string[],
  plannedIds: string[],
  dimensions?: { length: string; width: string; height: string },
) => {
  const review = reviewSpeciesAdditions({
    aquarium: tankFor(existingIds, dimensions),
    items: plannedIds.map(fishId => ({ fishId, quantity: quantityFor(fishId) })),
    speciesCatalog: fishData,
  });
  assert.ok(review);
  return review;
};

const compatible = reviewCase(['sp_0010', 'sp_0012'], ['sp_0014', 'sp_0020']);
assert.equal(compatible.status, 'compatible');
assert.equal(compatible.decision.pairResults.length, 6);
assert.equal(buildCompatibilityReadableConclusion(compatible.decision).judgment, '可以养');

const caution = reviewCase(['sp_0001', 'sp_0012'], ['sp_0014', 'sp_0431']);
assert.equal(caution.status, 'caution');
assert.equal(caution.decision.pairResults.length, 6);
assert.ok(caution.keyRules.length >= 1);
assert.equal(
  new Set(caution.keyRules.map(rule => getCompatibilityRuleFamily(rule.code))).size,
  caution.keyRules.length,
  'caution key rules should not repeat the same risk family',
);

const insufficient = reviewCase(['sp_0010', 'sp_0012'], ['sp_0004', 'sp_0014'], {
  length: '120',
  width: '50',
  height: '50',
});
assert.equal(insufficient.status, 'insufficient_data');
assert.equal(insufficient.decision.pairResults.length, 6);
assert.equal(insufficient.decision.metadata.decisionReadiness, 'unknown');

const blockedAquarium: Aquarium = {
  id: 'complex-blocked',
  name: 'Complex Blocked',
  fishes: [
    { id: 'existing-neon', fishId: 'sp_0431', quantity: 10, entryDate: '2026-10-01T00:00:00.000Z' },
    { id: 'existing-zebra', fishId: 'sp_0435', quantity: 8, entryDate: '2026-10-01T00:00:00.000Z' },
  ],
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
};
const blocked = reviewSpeciesAdditions({
  aquarium: blockedAquarium,
  items: [
    { fishId: 'sp_0453', quantity: 1 },
    { fishId: 'sp_0258', quantity: 1 },
    { fishId: 'sp_0448', quantity: 1 },
  ],
  speciesCatalog: fishData,
});
assert.ok(blocked);
assert.equal(blocked.status, 'not_recommended');
assert.equal(blocked.decision.pairResults.length, 10, 'five distinct species must evaluate all ten pairs');

const keyFamilies = blocked.keyRules.map(rule => getCompatibilityRuleFamily(rule.code));
assert.deepEqual(
  keyFamilies.slice(0, 4),
  ['water_type', 'predation', 'housing', 'temperature'],
  'complex blocking evidence should surface distinct risk families in deterministic priority order',
);

const finalDecision = getCompatibilityDecision(blocked.decision.aggregateResult, 'planned_addition');
const genericAiShadow = {
  mode: 'shadow',
  finalDecision,
  ai: {
    status: 'accepted',
    suggestedVerdict: 'not_recommended',
    reasons: [{
      text: '这组生物存在多项风险，需要谨慎处理。',
      ruleCodes: finalDecision.ruleCodes.slice(0, 1),
    }],
    adjustments: [{
      text: '先处理风险后再决定是否加入。',
      ruleCodes: finalDecision.ruleCodes.slice(0, 1),
    }],
    uncertainties: [],
    confidence: 'high',
  },
  provenance: {
    promptVersion: 'complex-whole-tank-fixture',
    authorityVersion: blocked.decision.aggregateResult.metadata.authorityVersion,
    catalogVersion: blocked.decision.aggregateResult.metadata.catalogVersion,
    ruleVersion: blocked.decision.aggregateResult.metadata.ruleVersion,
    evidenceIds: finalDecision.evidenceIds,
    model: 'fixture-model',
    repairCount: 0,
  },
} as CompatibilityAiShadowResult;

const blockedMain = buildCompatibilityReadableConclusion(blocked.decision, {
  reasons: genericAiShadow.ai.reasons,
  adjustments: genericAiShadow.ai.adjustments,
});
assert.deepEqual(blockedMain.why, [
  '这些生物需要的水体类型不同，长期放在同一缸不合适。',
  '体型和捕食关系存在明显风险，较小的一方可能被追逐或吞食。',
]);
assert.match(blockedMain.howTo[0] || '', /淡水|海水|同一缸/);
assert.match(blockedMain.howTo[1] || '', /捕食|体型|混养/);
assert.equal(blockedMain.howTo.length, 2);

const blockedProduct = buildCompatibilityProductAssessment(blocked.decision, genericAiShadow);
const productFamilies = blockedProduct.details.reasons
  .slice(0, 4)
  .map(item => getCompatibilityRuleFamily(item.ruleCodes[0] || ''));
assert.deepEqual(productFamilies, ['water_type', 'predation', 'housing', 'temperature']);
assert.equal(new Set(productFamilies).size, 4);
assert.equal(blockedProduct.main.why.includes('这组生物存在多项风险，需要谨慎处理。'), false);

assert.throws(
  () => parseCompatibilityPlannedItems(['sp_0012:500', 'sp_0012:1']),
  /合计数量不能超过 500/,
);

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

const mixedContext = await readPublishedCatalogCombinationContext({
  client: fakeClient,
  aquariumId: 'mixed-source-tank',
  catalogVersion: LOCAL_CATALOG_VERSION,
  plannedItems: [
    { speciesCatalogKey: 'sp_0114', quantity: 2 },
    { speciesCatalogKey: 'sp_0469', quantity: 8 },
    { speciesCatalogKey: 'sp_0013', quantity: 1 },
  ],
});
assert.equal(mixedContext.items.length, 3);
assert.equal(mixedContext.decision.pairResults.length, 3);
const mixedItem = mixedContext.items.find(item => item.species.id === 'sp_0114');
assert.ok(mixedItem);
assert.deepEqual(
  {
    quantity: mixedItem.quantity,
    origin: mixedItem.origin,
    existingQuantity: mixedItem.existingQuantity,
    plannedQuantity: mixedItem.plannedQuantity,
  },
  { quantity: 10, origin: 'mixed', existingQuantity: 8, plannedQuantity: 2 },
);

let capturedPrompt: any;
const mixedProvider: CompatibilityAiReasoningProvider = async ({ user }) => {
  capturedPrompt = JSON.parse(user);
  const ruleCode = mixedContext.decision.aggregateResult.warningRules[0]?.code
    || mixedContext.decision.aggregateResult.metadata.domainRuleCodes[0];
  assert.ok(ruleCode);
  return {
    model: 'mixed-source-fixture',
    output: {
      suggestedVerdict: mixedContext.decision.status,
      reasons: [{ text: '按整缸已审核风险解释。', ruleCodes: [ruleCode] }],
      adjustments: [{ text: '先按风险项调整计划。', ruleCodes: [ruleCode] }],
      uncertainties: [],
      confidence: 'high',
      evidenceIds: mixedContext.decision.aggregateResult.evidenceIds || [],
    },
  };
};
const mixedShadow = await createCompatibilityAiCombinationAssessment({
  deterministicResult: mixedContext.decision.aggregateResult,
  tank: mixedContext.tank,
  items: mixedContext.items,
}, mixedProvider);
assert.equal(mixedShadow.ai.status, 'accepted');
const promptMixed = capturedPrompt.quantities.find((item: any) => item.catalogKey === 'sp_0114');
assert.deepEqual(promptMixed, {
  catalogKey: 'sp_0114',
  quantity: 10,
  origin: 'mixed',
  existingQuantity: 8,
  plannedQuantity: 2,
});

console.log('Compatibility complex whole-tank PASS: compatible/caution/block/unknown 4–5 species cases, distinct risk-family priority, two-step hard-block actions, deterministic-first main copy, bounded planned quantity, and exact existing/planned provenance all hold.');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fishData } from '../src/data/fishData';
import { careTopicsData } from '../src/data/careTopicsData';
import {
  hydratePublishedContentCatalog,
  runtimeCareTopicsData,
  runtimeFishData,
} from '../src/data/runtimeContentCatalog';

const speciesId = 'sp_0001';
const careId = 'guide_new_fish_acclimation';
const seedFish = fishData.find(item => item.id === speciesId);
const seedCare = careTopicsData.find(item => item.id === careId);
assert.ok(seedFish && seedCare);
const fishBefore = structuredClone(seedFish);
const careBefore = structuredClone(seedCare);
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response(JSON.stringify({
  data: {
    species: [{
      id: '11111111-1111-4111-8111-111111111111',
      catalogKey: speciesId,
      name: '发布态隔离测试极火虾',
      scientificName: seedFish.scientificName,
      category: seedFish.category,
      difficulty: 'Hard',
      waterTemperatureText: '30-31°C',
      phLevelText: '8.5-9.0',
      waterChangeCycleDays: 2,
      description: '只允许进入 runtime Product 视图。',
      diet: seedFish.diet,
      tankSizeText: seedFish.tankSize,
      temperament: 'Aggressive',
      sizeClass: seedFish.size,
      assets: [],
    }],
    careArticles: [{
      id: '22222222-2222-4222-8222-222222222222',
      catalogKey: careId,
      title: '发布态隔离测试养护',
      category: seedCare.category,
      urgency: seedCare.urgency,
      summary: '只允许进入 runtime Care 视图。',
      symptoms: [...seedCare.symptoms],
      steps: [{ id: '33333333-3333-4333-8333-333333333333', position: 1, instruction: '测试步骤。', actionKind: 'immediate' }],
      avoidActions: [...seedCare.avoid],
      observeItems: [...seedCare.observe],
      diagnoseWhen: [...seedCare.diagnoseWhen],
      nextStep: seedCare.nextStep,
      keywords: [...seedCare.keywords],
      assets: [],
    }],
    authority: 'publication-snapshot',
    publicationCounts: { species: 1, care: 1 },
  },
  requestId: 'published-isolation-test',
}), { status: 200, headers: { 'Content-Type': 'application/json' } });
try {
  await hydratePublishedContentCatalog('zh-CN');
  const runtimeFish = runtimeFishData.find(item => item.id === speciesId);
  const runtimeCare = runtimeCareTopicsData.find(item => item.id === careId);
  assert.ok(runtimeFish && runtimeCare);
  assert.equal(runtimeFish.name, '发布态隔离测试极火虾');
  assert.equal(runtimeFish.temperament, 'Aggressive');
  assert.equal(runtimeCare.title, '发布态隔离测试养护');
  assert.deepEqual(fishData.find(item => item.id === speciesId), fishBefore,
    'Published Product hydration must not mutate static compatibility seed data');
  assert.deepEqual(careTopicsData.find(item => item.id === careId), careBefore,
    'Published Care hydration must not mutate the static seed catalog');

  const compatibilitySource = readFileSync(resolve('src/components/CompatibilityRiskCalculator.tsx'), 'utf8');
  assert.match(compatibilitySource, /import \{ fishData \} from '\.\.\/data\/fishData';/);
  assert.doesNotMatch(compatibilitySource, /runtimeContentCatalog/,
    'Compatibility authority must not be bypassed by Product runtime hydration');

  console.log('published content isolation verified: runtime changes do not mutate compatibility/static authorities');
} finally {
  globalThis.fetch = originalFetch;
}

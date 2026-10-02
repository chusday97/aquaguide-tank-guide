import assert from 'node:assert/strict';

process.env.VISION_API_KEY = 'test-key';
process.env.VISION_BASE_URL = 'https://vision.example/v4';
process.env.VISION_MODEL = 'glm-4.6v-flash';
process.env.VISION_FALLBACK_MODEL = 'glm-4v-flash';
process.env.VISION_TIMEOUT_MS = '10';

const { buildApiConfig } = await import('../apps/api/src/config.ts');

const defaults = buildApiConfig({});
assert.equal(defaults.visionModel, 'glm-4.6v-flash');
assert.equal(defaults.visionFallbackModel, 'glm-4v-flash');
assert.equal(defaults.visionBaseUrl, 'https://open.bigmodel.cn/api/paas/v4');
assert.equal(defaults.visionApiKey, '');

const legacyConfig = buildApiConfig({
  GLM_API_KEY: 'legacy-test-key',
  GLM_BASE_URL: 'https://legacy.example/v4/',
  GLM_MODEL: 'legacy-primary',
  GLM_FALLBACK_MODEL: 'legacy-fallback',
  GLM_TIMEOUT_MS: '3210',
});
assert.deepEqual(
  {
    key: legacyConfig.visionApiKey,
    baseUrl: legacyConfig.visionBaseUrl,
    model: legacyConfig.visionModel,
    fallback: legacyConfig.visionFallbackModel,
    timeout: legacyConfig.visionTimeoutMs,
  },
  {
    key: 'legacy-test-key',
    baseUrl: 'https://legacy.example/v4',
    model: 'legacy-primary',
    fallback: 'legacy-fallback',
    timeout: 3210,
  },
);

const scopedConfig = buildApiConfig({
  VISION_API_KEY: 'scoped-test-key',
  GLM_API_KEY: 'legacy-test-key',
  VISION_MODEL: 'scoped-primary',
  GLM_MODEL: 'legacy-primary',
});
assert.equal(scopedConfig.visionApiKey, 'scoped-test-key');
assert.equal(scopedConfig.visionModel, 'scoped-primary');

const { fishData } = await import('../src/data/fishData.ts');
const { mapVisionCandidateToCatalog } = await import('../src/lib/speciesRecognition.ts');
const silverArowanaConflict = mapVisionCandidateToCatalog({
  commonName: '银龙鱼',
  scientificName: 'Arapaima',
  confidenceBand: 'high',
  visualEvidence: ['测试冲突'],
}, fishData);
assert.equal(silverArowanaConflict.matchType, 'fuzzy', 'conflicting scientific/common names must never become an exact catalog match');
assert.equal(silverArowanaConflict.fish?.scientificName, 'Osteoglossum bicirrhosum', 'common-name suggestion may remain visible only as a fuzzy candidate');
const consistentGuppy = mapVisionCandidateToCatalog({
  commonName: '孔雀鱼',
  scientificName: 'Poecilia reticulata',
  confidenceBand: 'high',
  visualEvidence: ['测试一致'],
}, fishData);
assert.equal(consistentGuppy.matchType, 'exact', 'consistent scientific identity must retain exact catalog matching');
const catalogKeyGuppy = mapVisionCandidateToCatalog({
  catalogKey: consistentGuppy.fish!.id,
  commonName: '模型可能写错的名字',
  confidenceBand: 'medium',
  visualEvidence: ['目录 key 测试'],
}, fishData);
assert.equal(catalogKeyGuppy.fish?.scientificName, 'Poecilia reticulata', 'valid catalogKey must resolve directly to catalog authority');
assert.equal(catalogKeyGuppy.matchType, 'exact');
const { deriveUnreconciledRecognitionStatus, reconcileVisionCandidatesToCatalog, recognitionCatalogSizeForCategory } = await import('../apps/api/src/routes/species-ai.ts');
assert.equal(deriveUnreconciledRecognitionStatus([]), 'unmatched');
assert.equal(deriveUnreconciledRecognitionStatus([{ confidenceBand: 'high' }]), 'ambiguous', 'provider confidence alone must never claim a catalog match');
const reconciled = reconcileVisionCandidatesToCatalog([
  { catalogKey: consistentGuppy.fish!.id, commonName: '错误模型名', scientificName: 'Wrong species', confidenceBand: 'medium', visualEvidence: ['尾鳍'] },
  { catalogKey: 'sp_not_real', commonName: '伪造物种', confidenceBand: 'high', visualEvidence: ['无'] },
  { commonName: '目录外自由文本', confidenceBand: 'high', visualEvidence: ['无'] },
]);
assert.equal(reconciled.length, 1, 'server must discard invented or missing catalog keys');
assert.equal(reconciled[0].commonName, consistentGuppy.fish!.name, 'server must canonicalize model names from catalog authority');
assert.equal(reconciled[0].scientificName, 'Poecilia reticulata');
assert.equal(reconciled[0].matchType, 'exact');
assert.equal(recognitionCatalogSizeForCategory('灯科鱼') > 0, true);
assert.equal(recognitionCatalogSizeForCategory('灯科鱼') < 100, true, 'stage two must use a bounded category shortlist instead of the full catalog');
assert.equal(recognitionCatalogSizeForCategory('鱼类') < fishData.length, true, 'largest category must still be smaller than the full catalog');

const calls: Array<{ model?: string; stream?: unknown; response_format?: unknown; messages?: unknown }> = [];
let failureMode: '429' | '5xx' | 'timeout' | 'invalid_response' = '429';
const originalFetch = globalThis.fetch;

globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body || '{}')) as { model?: string; stream?: unknown; response_format?: unknown; messages?: unknown };
  calls.push(body);
  if (body.model === 'glm-4.6v-flash') {
    if (failureMode === 'timeout') {
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      });
    }
    if (failureMode === 'invalid_response') {
      return new Response(JSON.stringify({ choices: [{ message: { content: 'not valid JSON' } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: { code: '1305' } }), { status: failureMode === '429' ? 429 : 503, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ candidates: [{ catalogKey: consistentGuppy.fish!.id, commonName: '孔雀鱼', scientificName: 'Poecilia reticulata', confidenceBand: 'high', visualEvidence: ['尾鳍特征'] }] }) } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;

try {
  const { requestVisionCandidates } = await import('../apps/api/src/ai/provider.ts');
  for (const mode of ['429', '5xx', 'timeout', 'invalid_response'] as const) {
    failureMode = mode;
    calls.length = 0;
    const result = await requestVisionCandidates('data:image/webp;base64,AA==', 'zh-CN', `${consistentGuppy.fish!.id}|孔雀鱼|Poecilia reticulata|鱼类`);
    assert.equal(result.modelName, 'glm-4v-flash');
    assert.deepEqual(result.payload, { candidates: [{ catalogKey: consistentGuppy.fish!.id, commonName: '孔雀鱼', scientificName: 'Poecilia reticulata', confidenceBand: 'high', visualEvidence: ['尾鳍特征'] }] });
    assert.deepEqual(calls.map(call => call.model), ['glm-4.6v-flash', 'glm-4v-flash'], 'vision stages must not retry the same failing model before fallback');
    assert.equal(calls.every(call => call.stream === false), true);
    assert.deepEqual(calls.slice(0, 1).map(call => call.response_format), [{ type: 'json_object' }]);
    assert.equal(calls[1].response_format, undefined, 'legacy GLM-4V fallback stays on prompt-enforced JSON for compatibility');
    assert.equal(calls.every(call => Array.isArray(call.messages) && (call.messages as unknown[]).some(message => JSON.stringify(message).includes('image_url'))), true);
    assert.equal(calls.every(call => JSON.stringify(call.messages).includes(consistentGuppy.fish!.id)), true, 'every vision model attempt must receive the constrained Aqua catalog');
  }
  failureMode = '429';
  calls.length = 0;
  const { requestVisionCatalogCategory } = await import('../apps/api/src/ai/provider.ts');
  const originalCategoryFetch = globalThis.fetch;
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body || '{}')) as { model?: string; stream?: unknown; response_format?: unknown; messages?: unknown };
    calls.push(body);
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ category: '鱼类' }) } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  const categoryResult = await requestVisionCatalogCategory('data:image/webp;base64,AA==', 'zh-CN', ['鱼类', '灯科鱼']);
  assert.equal(categoryResult.payload.category, '鱼类');
  assert.equal(calls.length, 1, 'category stage should use one primary call when valid');
  assert.equal(JSON.stringify(calls[0].messages).includes('鱼类 | 灯科鱼'), true);
  globalThis.fetch = originalCategoryFetch;
  console.log('vision provider/config contract verified without real credentials: defaults, GLM aliases, multimodal payload, and 429/5xx/timeout fallback');
} finally {
  globalThis.fetch = originalFetch;
}

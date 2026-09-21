import assert from 'node:assert/strict';

process.env.VISION_API_KEY = 'test-key';
process.env.VISION_BASE_URL = 'https://vision.example/v4';
process.env.VISION_MODEL = 'glm-primary';
process.env.VISION_FALLBACK_MODEL = 'glm-fallback';
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

const calls: Array<{ model?: string; stream?: unknown; response_format?: unknown; messages?: unknown }> = [];
let failureMode: '429' | '5xx' | 'timeout' = '429';
const originalFetch = globalThis.fetch;

globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body || '{}')) as { model?: string; stream?: unknown; response_format?: unknown; messages?: unknown };
  calls.push(body);
  if (body.model === 'glm-primary') {
    if (failureMode === 'timeout') {
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      });
    }
    return new Response(JSON.stringify({ error: { code: '1305' } }), { status: failureMode === '429' ? 429 : 503, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ candidates: [{ commonName: '孔雀鱼', scientificName: 'Poecilia reticulata', confidenceBand: 'high', visualEvidence: ['尾鳍特征'] }] }) } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;

try {
  const { requestVisionCandidates } = await import('../apps/api/src/ai/provider.ts');
  for (const mode of ['429', '5xx', 'timeout'] as const) {
    failureMode = mode;
    calls.length = 0;
    const result = await requestVisionCandidates('data:image/webp;base64,AA==', 'zh-CN');
    assert.equal(result.modelName, 'glm-fallback');
    assert.deepEqual(result.payload, { candidates: [{ commonName: '孔雀鱼', scientificName: 'Poecilia reticulata', confidenceBand: 'high', visualEvidence: ['尾鳍特征'] }] });
    assert.deepEqual(calls.map(call => call.model), ['glm-primary', 'glm-primary', 'glm-fallback']);
    assert.equal(calls.every(call => call.stream === false), true);
    assert.equal(calls.every(call => call.response_format === undefined), true);
    assert.equal(calls.every(call => Array.isArray(call.messages) && (call.messages as unknown[]).some(message => JSON.stringify(message).includes('image_url'))), true);
  }
  console.log('vision provider/config contract verified without real credentials: defaults, GLM aliases, multimodal payload, and 429/5xx/timeout fallback');
} finally {
  globalThis.fetch = originalFetch;
}

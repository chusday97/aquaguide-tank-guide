import assert from 'node:assert/strict';

process.env.VISION_API_KEY = 'test-key';
process.env.VISION_BASE_URL = 'https://vision.example/v4';
process.env.VISION_MODEL = 'glm-primary';
process.env.VISION_FALLBACK_MODEL = 'glm-fallback';
process.env.VISION_TIMEOUT_MS = '1000';

const calls: Array<{ model?: string; stream?: unknown; response_format?: unknown }> = [];
const originalFetch = globalThis.fetch;

globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body || '{}')) as { model?: string; stream?: unknown; response_format?: unknown };
  calls.push(body);
  if (body.model === 'glm-primary') {
    return new Response(JSON.stringify({ error: { code: '1305' } }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ candidates: [{ commonName: '孔雀鱼', scientificName: 'Poecilia reticulata', confidenceBand: 'high', visualEvidence: ['尾鳍特征'] }] }) } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}) as typeof fetch;

try {
  const { requestVisionCandidates } = await import('../apps/api/src/ai/provider.ts');
  const result = await requestVisionCandidates('data:image/webp;base64,AA==', 'zh-CN');
  assert.equal(result.modelName, 'glm-fallback');
  assert.deepEqual(result.payload, { candidates: [{ commonName: '孔雀鱼', scientificName: 'Poecilia reticulata', confidenceBand: 'high', visualEvidence: ['尾鳍特征'] }] });
  assert.deepEqual(calls.map(call => call.model), ['glm-primary', 'glm-primary', 'glm-fallback']);
  assert.equal(calls.every(call => call.stream === false), true);
  assert.equal(calls.every(call => (call.response_format as { type?: string })?.type === 'json_object'), true);
  console.log('vision provider fallback verified: 429 retries primary once, then uses glm fallback with strict JSON request');
} finally {
  globalThis.fetch = originalFetch;
}

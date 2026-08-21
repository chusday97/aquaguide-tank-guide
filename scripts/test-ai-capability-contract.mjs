import assert from 'node:assert/strict';
import vercelHealth from '../api/health.js';
import vercelChat from '../api/ai/chat.js';
import { onRequestGet as pagesHealth } from '../functions/api/health.js';
import { onRequestPost as pagesChat } from '../functions/api/ai/chat.js';

const envKeys = ['AI_API_KEY', 'DEEPSEEK_API_KEY', 'AI_BASE_URL', 'DEEPSEEK_BASE_URL', 'AI_MODEL', 'DEEPSEEK_MODEL', 'VISION_API_KEY', 'VISION_BASE_URL', 'VISION_MODEL'];

const withProcessEnv = async (env, callback) => {
  const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  for (const key of envKeys) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try {
    return await callback();
  } finally {
    for (const key of envKeys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
};

const runVercelHealth = (env) => withProcessEnv(env, async () => {
  let payload;
  vercelHealth({ method: 'GET' }, {
    status: () => ({ json: body => { payload = body; } }),
    setHeader: () => {},
  });
  return payload;
});

const mockProviderResponse = (content) => new Response(JSON.stringify({
  choices: [{ message: { content: JSON.stringify(content) } }],
  model: 'mock-model',
}), { status: 200 });

const withMockFetch = async (fetchImpl, callback) => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    return await callback();
  } finally {
    globalThis.fetch = previousFetch;
  }
};

const runVercelChat = (env, body, fetchImpl) => withProcessEnv(env, () => withMockFetch(fetchImpl, async () => {
  let statusCode = 200;
  let payload;
  await vercelChat({ method: 'POST', body, headers: {}, socket: {} }, {
    setHeader: () => {},
    status: code => {
      statusCode = code;
      return { json: response => { payload = response; return response; } };
    },
    json: response => { payload = response; return response; },
  });
  return { statusCode, payload };
}));

const runPagesChat = (env, body, fetchImpl) => withMockFetch(fetchImpl, async () => {
  const request = new Request('https://example.test/api/ai/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': crypto.randomUUID() },
    body: JSON.stringify(body),
  });
  const response = await pagesChat({ request, env });
  return { statusCode: response.status, payload: await response.json() };
});

const configured = { AI_API_KEY: 'test-key', AI_BASE_URL: 'https://provider.example', AI_MODEL: 'mock-model' };
const buildBody = { task: 'build_tank_copilot', context: { goal: '新手社区缸' } };
const dailyBody = { task: 'tank_daily_check_interpretation', context: { deterministicResult: { priority: 'watch' }, candidateArticles: [] } };
const buildResult = { goalUnderstanding: '适合先从稳定环境开始。', missingQuestions: [], planSummary: '先确认水体与容积。', recommendedActions: [], selectedCandidateIds: [], blockedExplanation: [] };
const dailyResult = { summary: '先观察水面与呼吸。', priority: 'watch', reasoning: ['结构化巡检提示需要观察'], recommendedArticleIds: [], clarifyingQuestions: [], disclaimer: '' };

const placeholder = await runVercelHealth({ AI_API_KEY: 'MY_AI_API_KEY', DEEPSEEK_API_KEY: '', VISION_API_KEY: '', VISION_BASE_URL: '', VISION_MODEL: '' });
assert.equal(placeholder.text.configured, false, 'placeholder keys must not appear configured');
assert.equal(placeholder.vision.mode, 'manual_confirmation');

const fallbackKey = await runVercelHealth({ AI_API_KEY: 'MY_AI_API_KEY', DEEPSEEK_API_KEY: 'test-key', VISION_API_KEY: '', VISION_BASE_URL: '', VISION_MODEL: '' });
assert.equal(fallbackKey.text.configured, true, 'a configured fallback text key must be reported as available');

const pagesHealthResponse = await pagesHealth({ env: { AI_API_KEY: 'MY_AI_API_KEY', DEEPSEEK_API_KEY: 'test-key', VISION_API_KEY: 'vision-key', VISION_BASE_URL: 'https://vision.example', VISION_MODEL: 'vision-model' } });
const pagesHealthPayload = await pagesHealthResponse.json();
assert.equal(pagesHealthPayload.text.configured, true);
assert.deepEqual(pagesHealthPayload.vision, { configured: true, mode: 'model' });

for (const [name, invoke] of [['vercel', runVercelChat], ['pages', runPagesChat]]) {
  const build = await invoke(configured, buildBody, async () => mockProviderResponse(buildResult));
  assert.equal(build.statusCode, 200, `${name} build task should succeed`);
  assert.equal(build.payload.source, 'model');
  assert.ok(build.payload.generatedAt);

  const daily = await invoke(configured, dailyBody, async () => mockProviderResponse(dailyResult));
  assert.equal(daily.statusCode, 200, `${name} daily task should succeed`);
  assert.equal(daily.payload.source, 'model');
  assert.ok(daily.payload.generatedAt);

  const invalidJson = await invoke(configured, buildBody, async () => mockProviderResponse(null));
  assert.equal(invalidJson.statusCode, 500, `${name} invalid model JSON must fail`);
  assert.equal(invalidJson.payload.failureReason, 'invalid_json');

  const unconfigured = await invoke({}, buildBody, async () => mockProviderResponse(buildResult));
  assert.equal(unconfigured.statusCode, 503, `${name} missing key must fail clearly`);
  assert.equal(unconfigured.payload.failureReason, 'not_configured');

  const network = await invoke(configured, buildBody, async () => { throw new Error('network unavailable'); });
  assert.equal(network.statusCode, 500, `${name} network failure must be surfaced`);
  assert.equal(network.payload.failureReason, 'network');
}

console.log('AI capability and deployment handler contracts passed');

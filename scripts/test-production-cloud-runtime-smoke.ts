import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApiApp } from '../apps/api/src/app.js';

const app = createApiApp();
const server = app.listen(0, '127.0.0.1');

try {
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const healthResponse = await fetch(`${baseUrl}/api/v1/business-health`);
  assert.equal(healthResponse.status, 200);
  assert.match(healthResponse.headers.get('content-type') || '', /application\/json/i);
  assert.match(JSON.stringify(await healthResponse.json()), /web-api-supabase/);

  const capabilityResponse = await fetch(`${baseUrl}/api/v1/health`);
  const capability = await capabilityResponse.json() as { text?: unknown; vision?: unknown };
  assert.equal(capabilityResponse.status, 200);
  assert.ok(capability.text, 'versioned health must expose text capability status');
  assert.ok(capability.vision, 'versioned health must expose vision capability status');

  const previousAiKeyForFallback = process.env.AI_API_KEY;
  const previousDeepseekKeyForFallback = process.env.DEEPSEEK_API_KEY;
  process.env.AI_API_KEY = 'MY_AI_API_KEY';
  process.env.DEEPSEEK_API_KEY = 'valid-fallback-key';
  try {
    const fallbackCapabilityResponse = await fetch(`${baseUrl}/api/v1/health`);
    const fallbackCapability = await fallbackCapabilityResponse.json() as { configured?: boolean; text?: { configured?: boolean } };
    assert.equal(fallbackCapability.configured, true, 'a valid fallback text key must override a placeholder primary key');
    assert.equal(fallbackCapability.text?.configured, true);
  } finally {
    if (previousAiKeyForFallback === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previousAiKeyForFallback;
    if (previousDeepseekKeyForFallback === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previousDeepseekKeyForFallback;
  }

  const previousAiKey = process.env.AI_API_KEY;
  const previousDeepseekKey = process.env.DEEPSEEK_API_KEY;
  process.env.AI_API_KEY = 'MY_AI_API_KEY';
  process.env.DEEPSEEK_API_KEY = 'MY_DEEPSEEK_API_KEY';
  try {
    const aiResponse = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ task: 'build_tank_copilot', context: {} }),
    });
    const aiPayload = await aiResponse.json() as { failureReason?: string };
    assert.equal(aiResponse.status, 503, 'unconfigured V1 AI must preserve explicit not_configured fallback');
    assert.equal(aiPayload.failureReason, 'not_configured');
  } finally {
    if (previousAiKey === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = previousAiKey;
    if (previousDeepseekKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previousDeepseekKey;
  }

  const missingResponse = await fetch(`${baseUrl}/api/v1/__runtime_missing_route__`);
  assert.equal(missingResponse.status, 404);
  assert.match(missingResponse.headers.get('content-type') || '', /application\/json/i);

  const namespaceResponse = await fetch(`${baseUrl}/api/v1`);
  assert.equal(namespaceResponse.status, 404, 'the V1 namespace root must remain an API JSON boundary');
  assert.match(namespaceResponse.headers.get('content-type') || '', /application\/json/i);

  const legacyHealthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(legacyHealthResponse.status, 200);
  assert.match(legacyHealthResponse.headers.get('content-type') || '', /application\/json/i);

  console.log('Production Cloud Runtime smoke passed: canonical V1 routes and JSON 404/health boundaries are reachable.');
} finally {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

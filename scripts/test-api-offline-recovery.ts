import assert from 'node:assert/strict';
import { apiRequest, AquaGuideApiError } from '../src/services/api/api-client';

let online = false;
let fetchCalls = 0;
let appliedEffects = 0;
const seenKeys = new Set<string>();

Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { get onLine() { return online; } },
});

const originalFetch = globalThis.fetch;
globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
  fetchCalls += 1;
  const key = new Headers(init?.headers).get('Idempotency-Key') || '';
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    appliedEffects += 1;
  }
  return new Response(JSON.stringify({ data: { ok: true }, requestId: 'req-1' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}) as typeof fetch;

await assert.rejects(
  () => apiRequest('/offline-probe', { authenticated: false, method: 'POST', body: { x: 1 }, idempotencyKey: 'offline-op-1' }),
  (error: unknown) => error instanceof AquaGuideApiError && error.code === 'DEPENDENCY_UNAVAILABLE',
);
assert.equal(fetchCalls, 0, 'explicit browser offline state must fail before sending a request');

online = true;
await apiRequest('/offline-probe', { authenticated: false, method: 'POST', body: { x: 1 }, idempotencyKey: 'offline-op-1' });
await apiRequest('/offline-probe', { authenticated: false, method: 'POST', body: { x: 1 }, idempotencyKey: 'offline-op-1' });
assert.equal(fetchCalls, 2);
assert.equal(appliedEffects, 1, 'recovery retries with the same operation key must converge to one server effect');

globalThis.fetch = originalFetch;
console.log('API offline recovery passed: offline fail-closed and stable idempotency identity after reconnect');

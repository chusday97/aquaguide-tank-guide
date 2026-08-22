import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApiApp } from '../apps/api/src/app';

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
  assert.equal(healthResponse.status, 200, 'business-health must be reachable through the canonical /api/v1 router');
  assert.match(healthResponse.headers.get('content-type') || '', /application\/json/i, 'business-health must return JSON, not SPA HTML');
  const healthBody = await healthResponse.json() as unknown;
  assert.match(JSON.stringify(healthBody), /web-api-supabase/, 'business-health must identify the web-api-supabase architecture');

  const missingResponse = await fetch(`${baseUrl}/api/v1/__rc1_missing_route__`);
  assert.equal(missingResponse.status, 404, 'unknown V1 API routes must fail as API 404s');
  assert.match(missingResponse.headers.get('content-type') || '', /application\/json/i, 'unknown V1 API routes must return JSON, not index.html');

  console.log('Production Cloud Runtime smoke passed: canonical Express /api/v1 returns business JSON and JSON 404 boundaries.');
} finally {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
}

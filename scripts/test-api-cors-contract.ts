import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createBusinessApiApp } from '../apps/api/src/business-app';

const app = createBusinessApiApp();
const server = app.listen(0, '127.0.0.1');

try {
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const officialOrigin = 'https://aquaguide.chusday.dpdns.org';

  const getResponse = await fetch(`${baseUrl}/api/v1/business-health`, {
    headers: { Origin: officialOrigin },
  });
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.headers.get('access-control-allow-origin'), officialOrigin);
  assert.match(getResponse.headers.get('vary') || '', /Origin/i);

  const preflight = await fetch(`${baseUrl}/api/v1/ai/species-recognition`, {
    method: 'OPTIONS',
    headers: {
      Origin: officialOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,authorization,x-aquaguide-locale,idempotency-key',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), officialOrigin);
  assert.match(preflight.headers.get('access-control-allow-methods') || '', /POST/);
  assert.match(preflight.headers.get('access-control-allow-headers') || '', /Authorization/i);
  assert.match(preflight.headers.get('access-control-allow-headers') || '', /X-AquaGuide-Locale/i);

  const rejectedPreflight = await fetch(`${baseUrl}/api/v1/ai/species-recognition`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://evil.example',
      'Access-Control-Request-Method': 'POST',
    },
  });
  assert.equal(rejectedPreflight.status, 403);
  assert.equal(rejectedPreflight.headers.get('access-control-allow-origin'), null);

  console.log('API CORS contract verified: official origin allowed, preflight explicit, unknown origin rejected');
} finally {
  if (server.listening) {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

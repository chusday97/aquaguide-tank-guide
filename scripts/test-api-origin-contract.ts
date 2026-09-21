import assert from 'node:assert/strict';
import { resolveApiBaseUrl, resolveApiV1Url } from '../src/services/api/api-origin.ts';

assert.equal(
  resolveApiV1Url('/ai/species-recognition', { hostname: 'aquaguide.chusday.dpdns.org' }),
  'https://aqua-tank-guide.vercel.app/api/v1/ai/species-recognition',
);

assert.equal(
  resolveApiV1Url('/catalog/releases/current', { hostname: 'aqua-tank-guide.vercel.app' }),
  '/api/v1/catalog/releases/current',
);

assert.equal(
  resolveApiV1Url('/aquariums', { hostname: 'localhost' }),
  '/api/v1/aquariums',
);

assert.equal(
  resolveApiV1Url('/aquariums', { hostname: 'preview.example.test' }),
  '/api/v1/aquariums',
);

assert.equal(
  resolveApiV1Url('/api/v1/aquariums', {
    explicitBaseUrl: 'https://api.example.test/',
    hostname: 'aquaguide.chusday.dpdns.org',
  }),
  'https://api.example.test/api/v1/aquariums',
);

assert.equal(
  resolveApiBaseUrl({
    explicitBaseUrl: 'https://api.example.test///',
    hostname: 'aquaguide.chusday.dpdns.org',
  }),
  'https://api.example.test',
);

assert.equal(
  resolveApiV1Url('/local-admin/status', { hostname: 'aquaguide.chusday.dpdns.org' }),
  '/api/v1/local-admin/status',
);

console.log('API origin contract verified: custom production host, overrides, same-origin defaults, and local-admin isolation');

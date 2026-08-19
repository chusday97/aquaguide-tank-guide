import assert from 'node:assert/strict';

const rawBaseUrl = process.env.AQUAGUIDE_BASE_URL || '';
if (!rawBaseUrl) {
  throw new Error('AQUAGUIDE_BASE_URL is required, for example https://aqua.example.com');
}
const baseUrl = rawBaseUrl.replace(/\/$/, '');

const root = await fetch(`${baseUrl}/`);
assert.equal(root.status, 200, 'deployed frontend root must return 200');
assert.match(root.headers.get('content-type') || '', /text\/html/i, 'frontend root must return HTML');

const health = await fetch(`${baseUrl}/api/v1/business-health`);
assert.equal(health.status, 200, 'deployed /api/v1/business-health must return 200');
assert.match(health.headers.get('content-type') || '', /application\/json/i, 'business-health must return JSON, not SPA HTML');
const healthBody = await health.json();
const serializedHealth = JSON.stringify(healthBody);
assert.match(serializedHealth, /web-api-supabase/, 'deployed API must report web-api-supabase architecture');
assert.match(serializedHealth, /"databaseConfigured":true/, 'production business database must be configured; local fallback is not acceptable for RC1 release');

const missing = await fetch(`${baseUrl}/api/v1/__rc1_missing_route__`);
assert.equal(missing.status, 404, 'unknown deployed V1 API route must return API 404');
assert.match(missing.headers.get('content-type') || '', /application\/json/i, 'unknown deployed V1 route must return JSON rather than index.html');

console.log(`RC1 post-deploy smoke PASS for ${baseUrl}: frontend HTML + configured business API + JSON API 404 boundary.`);

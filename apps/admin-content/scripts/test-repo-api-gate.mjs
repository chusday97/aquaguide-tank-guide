import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const root = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-repo-api-'));
const storePath = path.join(root, 'store.json');
process.env.ADMIN_REPO_LOCAL_FILE = storePath;
process.env.ADMIN_REPO_LOCAL_STAGING_FILE = path.join(root, 'staging.json');
process.env.ADMIN_REPO_EMAIL = 'api-admin@aquaguide.test';
process.env.ADMIN_REPO_PASSWORD = 'Api-Test-Only-42!';
process.env.ADMIN_REPO_SESSION_SECRET = 'api-test-session-secret-0123456789abcdef';
await writeFile(storePath, JSON.stringify({ schema_version: 1, updated_at: null, species_seo: [], species_seo_groups: [], species_data_reviews: [], content_revisions: [] }), 'utf8');

const sessionHandler = (await import('../../../api/admin-content/session.js')).default;
const queryHandler = (await import('../../../api/admin-content/query.js')).default;
const translateHandler = (await import('../api/translate.js')).default;

function response() {
  const state = { statusCode: 200, headers: {}, body: null };
  return {
    state,
    setHeader(key, value) { state.headers[String(key).toLowerCase()] = value; },
    status(code) { state.statusCode = code; return this; },
    json(value) { state.body = value; return this; },
  };
}

let res = response();
await queryHandler({ method: 'POST', headers: {}, body: { action: 'select', table: 'species_seo', filters: [] } }, res);
assert.equal(res.state.statusCode, 401, 'Repo query must reject unauthenticated requests.');

res = response();
await sessionHandler({ method: 'POST', headers: {}, body: { email: 'api-admin@aquaguide.test', password: 'Api-Test-Only-42!' } }, res);
assert.equal(res.state.statusCode, 200);
const setCookie = res.state.headers['set-cookie'];
assert.match(setCookie, /aquaguide_admin_session=/);
assert.match(setCookie, /HttpOnly/);
const cookie = setCookie.split(';')[0];

res = response();
await queryHandler({
  method: 'POST', headers: { cookie },
  body: { action: 'select', table: 'user_roles', filters: [{ type: 'eq', column: 'user_id', value: 'repo-admin' }], singleMode: 'maybeSingle' },
}, res);
assert.equal(res.state.statusCode, 200);
assert.equal(res.state.body.data.role, 'admin');

res = response();
await queryHandler({
  method: 'POST', headers: { cookie, host: 'admin.aquaguide.test', origin: 'https://evil.example' },
  body: { action: 'select', table: 'species_seo', filters: [] },
}, res);
assert.equal(res.state.statusCode, 403, 'Cross-origin Repo mutations must be blocked even with a valid session cookie.');

res = response();
await queryHandler({
  method: 'POST', headers: { cookie },
  body: { action: 'upsert', table: 'species_seo', values: { catalog_key: 'sp_api', locale: 'en', localized_name: 'API Fish', h1: 'API H1', status: 'published' }, singleMode: 'single' },
}, res);
assert.equal(res.state.statusCode, 200);
assert.equal(res.state.body.data.status, 'draft', 'Repo API must fail closed from Published to Draft.');
assert.equal(res.state.body.data.review_state, 'editing');

res = response();
await translateHandler({ method: 'POST', headers: {}, body: { scope: 'variant', source: {} } }, res);
assert.equal(res.state.statusCode, 401, 'Translation must reject requests without the shared Repo Admin session.');

res = response();
await sessionHandler({ method: 'DELETE', headers: { cookie } }, res);
assert.equal(res.state.statusCode, 200);
assert.match(res.state.headers['set-cookie'], /Max-Age=0/);

console.log(JSON.stringify({ gate: 'PASS', api: 'repo-admin', cookie_auth: true, unauthenticated_blocked: true, cross_origin_blocked: true, published_blocked: true }));
await rm(root, { recursive: true, force: true });

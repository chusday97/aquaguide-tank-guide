import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { assertAuthIdentityMatches, validateStagingAdminIdentity, validateStagingAdminProvisionConfig } from './business-admin-staging-admin.mjs';

const userId = '11111111-1111-4111-8111-111111111111';
assert.deepEqual(validateStagingAdminIdentity({ userId, expectedEmail: ' Admin@Example.com ' }), { userId, expectedEmail: 'admin@example.com' });
assert.throws(() => validateStagingAdminIdentity({ userId: 'not-a-uuid', expectedEmail: 'admin@example.com' }), /valid UUID/);
assert.throws(() => validateStagingAdminIdentity({ userId, expectedEmail: '' }), /EXPECTED_EMAIL/);
assert.equal(assertAuthIdentityMatches({ id: userId, email: 'ADMIN@example.com' }, { userId, expectedEmail: 'admin@example.com' }), true);
assert.throws(() => assertAuthIdentityMatches({ id: userId, email: 'other@example.com' }, { userId, expectedEmail: 'admin@example.com' }), /does not match/);

const fixture = {
  STAGING_SUPABASE_URL: 'https://fixturestaging.supabase.co', STAGING_SUPABASE_SECRET_KEY: 'sb_secret_fixture',
  STAGING_SUPABASE_PROJECT_REF: 'fixturestaging', PRODUCTION_SUPABASE_PROJECT_REF: 'fixtureproduction',
  STAGING_ADMIN_USER_ID: userId, STAGING_ADMIN_EXPECTED_EMAIL: 'admin@example.com',
};
assert.equal(validateStagingAdminProvisionConfig(fixture).actualProjectRef, 'fixturestaging');
assert.throws(() => validateStagingAdminProvisionConfig({ ...fixture, PRODUCTION_SUPABASE_PROJECT_REF: 'fixturestaging' }), /Production Supabase project/);

const root = resolve(import.meta.dirname, '../../..');
const productionRefusal = spawnSync(process.execPath, ['scripts/provision-business-admin-staging.mjs'], {
  cwd: root,
  encoding: 'utf8',
  env: { ...process.env, ...fixture, PRODUCTION_SUPABASE_PROJECT_REF: 'fixturestaging' },
});
assert.notEqual(productionRefusal.status, 0);
assert.match(`${productionRefusal.stdout}
${productionRefusal.stderr}`, /Production Supabase project/);

console.log('Business Admin staging identity contract verified: existing Auth user only, identity match, Production refusal.');

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  buildBusinessAdminStagingCompatibilityArgs,
  buildBusinessAdminStagingImportArgs,
  resolveBusinessAdminStagingSeedConfig,
} from './business-admin-staging-seed.mjs';

const root = resolve(import.meta.dirname, '../../..');
assert.deepEqual(buildBusinessAdminStagingImportArgs(), [
  '--import', 'tsx', 'scripts/content-import/import-catalog.ts', '--metadata-only',
]);
assert.deepEqual(buildBusinessAdminStagingImportArgs({ commit: true }), [
  '--import', 'tsx', 'scripts/content-import/import-catalog.ts', '--metadata-only', '--commit',
]);
assert.deepEqual(buildBusinessAdminStagingCompatibilityArgs(), [
  '--import', 'tsx', 'scripts/content-import/seed-staging-compatibility.ts',
]);
assert.deepEqual(buildBusinessAdminStagingCompatibilityArgs({ commit: true }), [
  '--import', 'tsx', 'scripts/content-import/seed-staging-compatibility.ts', '--commit',
]);

const safe = resolveBusinessAdminStagingSeedConfig({
  STAGING_SUPABASE_URL: 'https://stagingref.supabase.co',
  STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
  STAGING_SUPABASE_PROJECT_REF: 'stagingref',
  PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
});
assert.equal(safe.targetProjectRef, 'stagingref');
assert.equal(safe.childEnv.SUPABASE_URL, 'https://stagingref.supabase.co');
assert.equal(safe.childEnv.SUPABASE_SERVICE_ROLE_KEY, 'sb_secret_test');

assert.throws(() => resolveBusinessAdminStagingSeedConfig({
  STAGING_SUPABASE_URL: 'https://productionref.supabase.co',
  STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
  STAGING_SUPABASE_PROJECT_REF: 'productionref',
  PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
}), /Refusing to use the Production Supabase project as staging/);

const productionRefusal = spawnSync(process.execPath, ['scripts/seed-business-admin-staging.mjs', '--commit'], {
  cwd: root, encoding: 'utf8',
  env: {
    ...process.env,
    STAGING_SUPABASE_URL: 'https://productionref.supabase.co',
    STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
    STAGING_SUPABASE_PROJECT_REF: 'productionref',
    PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
  },
});
assert.notEqual(productionRefusal.status, 0);
assert.match(`${productionRefusal.stdout}${productionRefusal.stderr}`, /Refusing to use the Production Supabase project as staging/);

const unsupported = spawnSync(process.execPath, ['scripts/seed-business-admin-staging.mjs', '--draft'], {
  cwd: root, encoding: 'utf8',
  env: {
    ...process.env,
    STAGING_SUPABASE_URL: 'https://stagingref.supabase.co',
    STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
    STAGING_SUPABASE_PROJECT_REF: 'stagingref',
    PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
  },
});
assert.notEqual(unsupported.status, 0);
assert.match(`${unsupported.stdout}${unsupported.stderr}`, /Unsupported staging seed option/);

const compatibilityDryRun = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/content-import/seed-staging-compatibility.ts'], {
  cwd: root, encoding: 'utf8',
  env: {
    ...process.env,
    STAGING_SUPABASE_URL: 'https://stagingref.supabase.co',
    STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
    STAGING_SUPABASE_PROJECT_REF: 'stagingref',
    PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
  },
});
assert.equal(compatibilityDryRun.status, 0, compatibilityDryRun.stderr);
assert.match(compatibilityDryRun.stdout, /"reviewed_evidence": (?:2[5-9]|[3-9][0-9]|[1-9][0-9]{2,})/);
assert.match(compatibilityDryRun.stdout, /"reviewed_profiles": (?:1[4-9]|[2-9][0-9]|[1-9][0-9]{2,})/);
assert.match(compatibilityDryRun.stdout, /"reviewed_pair_rules": (?:[5-9]|[1-9][0-9]+)/);

const compatibilityProductionRefusal = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/content-import/seed-staging-compatibility.ts', '--commit'], {
  cwd: root, encoding: 'utf8',
  env: {
    ...process.env,
    STAGING_SUPABASE_URL: 'https://productionref.supabase.co',
    STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
    STAGING_SUPABASE_PROJECT_REF: 'productionref',
    PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
  },
});
assert.notEqual(compatibilityProductionRefusal.status, 0);
assert.match(`${compatibilityProductionRefusal.stdout}${compatibilityProductionRefusal.stderr}`, /Refusing to use the Production Supabase project as staging/);

console.log('Business Admin staging seed contract verified: metadata-only, explicit commit, Production refusal.');

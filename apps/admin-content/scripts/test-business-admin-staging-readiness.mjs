import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  BUSINESS_ADMIN_ACCEPTANCE_DATA_REQUIREMENTS,
  evaluateBusinessAdminStagingReadiness,
  flattenBusinessAdminSchemaTables,
} from './business-admin-staging-readiness.mjs';

const allTables = Object.fromEntries(flattenBusinessAdminSchemaTables().map(table => [table, 'ready']));
const allCounts = Object.fromEntries(BUSINESS_ADMIN_ACCEPTANCE_DATA_REQUIREMENTS.map(item => [item.key, item.minimum]));
const ready = evaluateBusinessAdminStagingReadiness({ tableStates: allTables, counts: allCounts });
assert.equal(ready.schemaReady, true);
assert.equal(ready.representativeDataReady, true);
assert.equal(ready.acceptanceReady, true);

const missingPublication = evaluateBusinessAdminStagingReadiness({
  tableStates: { ...allTables, content_publications: 'schema_not_ready' },
  counts: allCounts,
});
assert.equal(missingPublication.schemaReady, false);
assert.equal(missingPublication.acceptanceReady, false);
assert.deepEqual(missingPublication.groups.productCare.missing, ['content_publications']);
assert.deepEqual(missingPublication.schemaMissing, ['content_publications']);

const noData = evaluateBusinessAdminStagingReadiness({ tableStates: allTables, counts: {} });
assert.equal(noData.schemaReady, true);
assert.equal(noData.representativeDataReady, false);
assert.equal(noData.acceptanceReady, false);
assert.equal(noData.dataGaps.length, BUSINESS_ADMIN_ACCEPTANCE_DATA_REQUIREMENTS.length);

const sourceFailure = evaluateBusinessAdminStagingReadiness({
  tableStates: { ...allTables, user_roles: 'unavailable' }, counts: allCounts,
});
assert.equal(sourceFailure.groups.access.ready, false);
assert.deepEqual(sourceFailure.schemaUnavailable, ['user_roles']);

const root = resolve(import.meta.dirname, '../../..');
const productionRefusal = spawnSync(process.execPath, ['scripts/check-business-admin-staging-readiness.mjs'], {
  cwd: root, encoding: 'utf8',
  env: {
    ...process.env,
    STAGING_SUPABASE_URL: 'https://productionref.supabase.co',
    STAGING_SUPABASE_SECRET_KEY: 'sb_secret_test',
    STAGING_SUPABASE_PROJECT_REF: 'productionref',
    PRODUCTION_SUPABASE_PROJECT_REF: 'productionref',
  },
});
assert.notEqual(productionRefusal.status, 0, 'Business Admin staging preflight must refuse Production before querying it.');
assert.match(`${productionRefusal.stdout}${productionRefusal.stderr}`, /Refusing to use the Production Supabase project as staging/);

console.log('Business Admin staging readiness contract verified: schema + representative data required, no empty environment may pass acceptance.');

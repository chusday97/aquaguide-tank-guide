import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  BUSINESS_ADMIN_ACCEPTANCE_DATA_REQUIREMENTS,
  BUSINESS_ADMIN_STAGING_MIGRATIONS,
  evaluateBusinessAdminStagingReadiness,
  flattenBusinessAdminSchemaTables,
} from './business-admin-staging-readiness.mjs';

const root = resolve(import.meta.dirname, '../../..');
const migrationDir = resolve(root, 'supabase/migrations');
const migrationNames = readdirSync(migrationDir).filter(name => name.endsWith('.sql')).sort();
for (const migration of BUSINESS_ADMIN_STAGING_MIGRATIONS) {
  assert.ok(migrationNames.includes(migration), `required Business Admin migration missing: ${migration}`);
}
assert.deepEqual([...BUSINESS_ADMIN_STAGING_MIGRATIONS].sort(), BUSINESS_ADMIN_STAGING_MIGRATIONS, 'Business Admin migration plan must remain chronological.');
const firstAdminMigration = BUSINESS_ADMIN_STAGING_MIGRATIONS[0];
const baseMigrationText = migrationNames
  .filter(name => name < firstAdminMigration)
  .map(name => readFileSync(resolve(migrationDir, name), 'utf8'))
  .join('\n');
const prerequisites = [
  ['species', /create table(?: if not exists)? public\.species\b/i],
  ['care_articles', /create table(?: if not exists)? public\.care_articles\b/i],
  ['evidence_sources', /create table(?: if not exists)? public\.evidence_sources\b/i],
  ['compatibility profiles', /create table(?: if not exists)? public\.species_compatibility_profiles\b/i],
  ['compatibility pair rules', /create table(?: if not exists)? public\.species_pair_compatibility_rules\b/i],
  ['profile evidence links', /create table(?: if not exists)? public\.species_compatibility_profile_sources\b/i],
  ['pair evidence links', /create table(?: if not exists)? public\.species_pair_compatibility_rule_sources\b/i],
  ['user_roles', /create table(?: if not exists)? public\.user_roles\b/i],
  ['idempotency_records', /create table(?: if not exists)? public\.idempotency_records\b/i],
  ['is_admin()', /function public\.is_admin\s*\(/i],
  ['set_updated_at_and_version()', /function public\.set_updated_at_and_version\s*\(/i],
];
for (const [label, pattern] of prerequisites) assert.match(baseMigrationText, pattern, `Admin staging migration prerequisite missing before ${firstAdminMigration}: ${label}`);

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

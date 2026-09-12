import { createClient } from '@supabase/supabase-js';
import {
  AQUAGUIDE_LIVE_MIGRATION_BASELINE,
  BUSINESS_ADMIN_AUTHORITY_MIGRATIONS,
  BUSINESS_ADMIN_STAGING_UPGRADE_MIGRATIONS,
  BUSINESS_ADMIN_SCHEMA_COLUMN_PROBES,
  evaluateBusinessAdminStagingReadiness,
  flattenBusinessAdminSchemaTables,
} from '../apps/admin-content/scripts/business-admin-staging-readiness.mjs';
import { validateStagingSupabaseConfig } from '../apps/admin-content/scripts/staging-publishing-config.mjs';

const config = validateStagingSupabaseConfig({
  supabaseUrl: process.env.STAGING_SUPABASE_URL,
  secretKey: process.env.STAGING_SUPABASE_SECRET_KEY,
  expectedProjectRef: process.env.STAGING_SUPABASE_PROJECT_REF,
  productionProjectRef: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
});
const client = createClient(config.supabaseUrl, process.env.STAGING_SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const classifyError = (error, table) => {
  if (!error) return 'ready';
  const code = String(error.code || '');
  const message = String(error.message || '');
  if (['42P01', 'PGRST205'].includes(code) || (message.toLowerCase().includes(table.toLowerCase()) && /not found|does not exist|schema cache/i.test(message))) return 'schema_not_ready';
  return 'unavailable';
};
const countTable = async (table, configure = query => query) => {
  const query = configure(client.from(table).select('*', { count: 'exact', head: true }));
  const { count, error } = await query;
  return { state: classifyError(error, table), count: Number(count || 0), errorCode: error?.code || undefined };
};

const probes = Object.fromEntries(await Promise.all(flattenBusinessAdminSchemaTables().map(async table => [table, await countTable(table)])));
const columnProbes = Object.fromEntries(await Promise.all(Object.entries(BUSINESS_ADMIN_SCHEMA_COLUMN_PROBES).map(async ([table, columns]) => {
  const { error } = await client.from(table).select(columns.join(','), { head: true }).limit(1);
  return [table, { state: classifyError(error, table), columns, errorCode: error?.code || undefined }];
})));
const tableStates = Object.fromEntries(Object.entries(probes).map(([table, probe]) => [table, probe.state]));
for (const [table, probe] of Object.entries(columnProbes)) if (probe.state !== 'ready') tableStates[table] = probe.state;
const counts = {
  admin_roles: (await countTable('user_roles', query => query.eq('role', 'admin').is('deleted_at', null))).count,
  species: (await countTable('species', query => query.is('deleted_at', null))).count,
  care_articles: (await countTable('care_articles', query => query.is('deleted_at', null))).count,
  reviewed_profiles: (await countTable('species_compatibility_profiles', query => query.eq('review_status', 'reviewed').is('deleted_at', null))).count,
  reviewed_pair_rules: (await countTable('species_pair_compatibility_rules', query => query.eq('review_status', 'reviewed').is('deleted_at', null))).count,
  reviewed_evidence: (await countTable('evidence_sources', query => query.eq('review_status', 'reviewed').is('deleted_at', null))).count,
};
const readiness = evaluateBusinessAdminStagingReadiness({
  tableStates,
  counts,
});
const output = {
  project_ref: config.actualProjectRef,
  production_refused: config.actualProjectRef !== process.env.PRODUCTION_SUPABASE_PROJECT_REF,
  schema_ready: readiness.schemaReady,
  representative_data_ready: readiness.representativeDataReady,
  acceptance_ready: readiness.acceptanceReady,
  groups: readiness.groups,
  counts,
  schema_missing: readiness.schemaMissing,
  source_unavailable: readiness.schemaUnavailable,
  schema_column_probes: columnProbes,
  data_gaps: readiness.dataGaps,
  upgrade_from_migration: AQUAGUIDE_LIVE_MIGRATION_BASELINE,
  expected_upgrade_migrations: BUSINESS_ADMIN_STAGING_UPGRADE_MIGRATIONS,
  business_admin_authority_migrations: BUSINESS_ADMIN_AUTHORITY_MIGRATIONS,
};
console.log(JSON.stringify(output, null, 2));
if (!readiness.acceptanceReady) process.exitCode = 1;

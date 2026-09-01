import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { parseStagingCatalogKeys, validateStagingSupabaseConfig } from './staging-publishing-config.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');

const VARIANT_SELECT = [
  'catalog_key','locale','localized_name','seo_title','meta_description','h1','intro','image_alt',
  'canonical_path','focus_keyword','index_strategy','canonical_catalog_key','status','published_at',
  'review_state','reviewed_at','updated_at','deleted_at','version',
].join(',');

const GROUP_SELECT = [
  'group_key','locale','seo_title_template','meta_description_template','h1_template','shared_intro',
  'status','published_at','review_state','reviewed_at','updated_at','deleted_at','version',
].join(',');

async function verifyReleaseGateSchema(client) {
  const { data, error } = await client.rpc('species_seo_release_gate_status');
  if (error) throw new Error(`Staging schema readiness probe failed: ${error.message}`);
  const required = ['species_seo_ready', 'group_seo_ready', 'revision_history_ready', 'data_review_ready', 'data_review_resolution_rpc_ready', 'restore_rpc_ready', 'localized_name_ready', 'index_strategy_ready', 'editorial_review_ready', 'server_export_ready'];
  if (!data || Number(data.schema_version) < 8 || required.some((key) => data[key] !== true)) {
    throw new Error(`Staging Species SEO schema is not release-ready: ${JSON.stringify(data || null)}`);
  }
  return data;
}

async function fetchApprovedDraftRows({ client, table, select, keyColumn, keys }) {
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq('status', 'draft')
    .eq('review_state', 'approved')
    .not('reviewed_at', 'is', null)
    .is('deleted_at', null)
    .in(keyColumn, keys)
    .order('updated_at', { ascending: true });
  if (error) throw new Error(`Staging ${table} export failed: ${error.message}`);
  if (!Array.isArray(data)) throw new Error(`Staging ${table} export did not return an array.`);
  return data;
}

async function resolveSelectedGroupKeys(selectedCatalogKeys) {
  const groupData = JSON.parse(await readFile(path.join(appRoot, 'src/species-groups.generated.json'), 'utf8'));
  const groupByCatalog = new Map();
  for (const group of groupData.groups || []) {
    for (const member of group.members || []) groupByCatalog.set(member.catalog_key, group.group_key);
  }
  const unknown = selectedCatalogKeys.filter((key) => !groupByCatalog.has(key));
  if (unknown.length) throw new Error(`STAGING_CATALOG_KEYS contains unknown catalog key(s): ${unknown.join(', ')}`);
  return [...new Set(selectedCatalogKeys.map((key) => groupByCatalog.get(key)))];
}

export async function exportStagingSpeciesSnapshot(config) {
  const { supabaseUrl, actualProjectRef } = validateStagingSupabaseConfig(config);
  const selectedCatalogKeys = parseStagingCatalogKeys(config.selectedCatalogKeys);
  const selectedGroupKeys = await resolveSelectedGroupKeys(selectedCatalogKeys);
  const client = createClient(supabaseUrl, config.secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const schemaProbe = await verifyReleaseGateSchema(client);
  const [speciesSeo, speciesSeoGroups, resolutionsResult] = await Promise.all([
    fetchApprovedDraftRows({ client, table: 'species_seo', select: VARIANT_SELECT, keyColumn: 'catalog_key', keys: selectedCatalogKeys }),
    fetchApprovedDraftRows({ client, table: 'species_seo_groups', select: GROUP_SELECT, keyColumn: 'group_key', keys: selectedGroupKeys }),
    client.from('species_data_reviews')
      .select('issue_key,issue_type,group_key,decision,canonical_catalog_key')
      .order('issue_key', { ascending: true }),
  ]);
  if (resolutionsResult.error) throw new Error(`Staging review-resolution export failed: ${resolutionsResult.error.message}`);
  const dataReviewResolutions = Array.isArray(resolutionsResult.data) ? resolutionsResult.data : [];
  return {
    environment: 'staging',
    source_label: config.sourceLabel || `supabase:${actualProjectRef}`,
    source_project_ref: actualProjectRef,
    schema_probe: schemaProbe,
    exported_at: new Date().toISOString(),
    selected_catalog_keys: selectedCatalogKeys,
    species_seo: speciesSeo,
    species_seo_groups: speciesSeoGroups,
    data_review_resolutions: dataReviewResolutions,
  };
}

async function cli() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const outPath = outIndex >= 0 ? args[outIndex + 1] : null;
  if (!outPath) throw new Error('Usage: node export-staging-species-snapshot.mjs --out <snapshot.json>');
  const snapshot = await exportStagingSpeciesSnapshot({
    supabaseUrl: process.env.STAGING_SUPABASE_URL,
    secretKey: process.env.STAGING_SUPABASE_SECRET_KEY,
    expectedProjectRef: process.env.STAGING_SUPABASE_PROJECT_REF,
    productionProjectRef: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
    sourceLabel: process.env.STAGING_SOURCE_LABEL,
    selectedCatalogKeys: process.env.STAGING_CATALOG_KEYS,
  });
  const resolved = path.resolve(outPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ out: resolved, project_ref: snapshot.source_project_ref, variants: snapshot.species_seo.length, groups: snapshot.species_seo_groups.length }));
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  cli().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

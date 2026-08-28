import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { validateStagingSupabaseConfig } from './staging-publishing-config.mjs';

const VARIANT_SELECT = [
  'catalog_key','locale','localized_name','seo_title','meta_description','h1','intro','image_alt',
  'canonical_path','focus_keyword','index_strategy','canonical_catalog_key','status','published_at',
  'review_state','reviewed_by','reviewed_at','updated_at','deleted_at','version',
].join(',');

const GROUP_SELECT = [
  'group_key','locale','seo_title_template','meta_description_template','h1_template','shared_intro',
  'status','published_at','review_state','reviewed_by','reviewed_at','updated_at','deleted_at','version',
].join(',');

async function verifyReleaseGateSchema(client) {
  const { data, error } = await client.rpc('species_seo_release_gate_status');
  if (error) throw new Error(`Staging schema readiness probe failed: ${error.message}`);
  const required = ['species_seo_ready', 'group_seo_ready', 'revision_history_ready', 'data_review_ready', 'data_review_resolution_rpc_ready', 'restore_rpc_ready', 'localized_name_ready', 'index_strategy_ready', 'editorial_review_ready'];
  if (!data || Number(data.schema_version) < 7 || required.some((key) => data[key] !== true)) {
    throw new Error(`Staging Species SEO schema is not release-ready: ${JSON.stringify(data || null)}`);
  }
  return data;
}

async function fetchPublishedRows({ client, table, select }) {
  const { data, error } = await client
    .from(table)
    .select(select)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('updated_at', { ascending: true });
  if (error) throw new Error(`Staging ${table} export failed: ${error.message}`);
  if (!Array.isArray(data)) throw new Error(`Staging ${table} export did not return an array.`);
  return data;
}

export async function exportStagingSpeciesSnapshot(config) {
  const { supabaseUrl, actualProjectRef } = validateStagingSupabaseConfig(config);
  const client = createClient(supabaseUrl, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const schemaProbe = await verifyReleaseGateSchema(client);
  const [speciesSeo, speciesSeoGroups, resolutionsResult] = await Promise.all([
    fetchPublishedRows({ client, table: 'species_seo', select: VARIANT_SELECT }),
    fetchPublishedRows({ client, table: 'species_seo_groups', select: GROUP_SELECT }),
    client.rpc('species_seo_public_review_resolutions'),
  ]);
  if (resolutionsResult.error) throw new Error(`Staging review-resolution export failed: ${resolutionsResult.error.message}`);
  const dataReviewResolutions = Array.isArray(resolutionsResult.data) ? resolutionsResult.data : [];
  return {
    environment: 'staging',
    source_label: config.sourceLabel || `supabase:${actualProjectRef}`,
    source_project_ref: actualProjectRef,
    schema_probe: schemaProbe,
    exported_at: new Date().toISOString(),
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
    publishableKey: process.env.STAGING_SUPABASE_PUBLISHABLE_KEY,
    expectedProjectRef: process.env.STAGING_SUPABASE_PROJECT_REF,
    productionProjectRef: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
    sourceLabel: process.env.STAGING_SOURCE_LABEL,
  });
  const resolved = path.resolve(outPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ out: resolved, project_ref: snapshot.source_project_ref, variants: snapshot.species_seo.length, groups: snapshot.species_seo_groups.length }));
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  cli().catch((error) => { console.error(error.message); process.exitCode = 1; });
}

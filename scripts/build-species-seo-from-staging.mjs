import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { exportStagingSpeciesSnapshot } from '../apps/admin-content/scripts/export-staging-species-snapshot.mjs';
import { validateStagingSiteUrl } from '../apps/admin-content/scripts/staging-publishing-config.mjs';
import { buildSpeciesSeoArtifact } from './build-species-seo-artifact.mjs';

const config = {
  supabaseUrl: process.env.STAGING_SUPABASE_URL,
  secretKey: process.env.STAGING_SUPABASE_SECRET_KEY,
  expectedProjectRef: process.env.STAGING_SUPABASE_PROJECT_REF,
  productionProjectRef: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
  sourceLabel: process.env.STAGING_SOURCE_LABEL,
};

const siteUrl = validateStagingSiteUrl(
  process.env.STAGING_PUBLIC_SITE_URL,
  process.env.PRODUCTION_PUBLIC_SITE_URL,
);
const productionSiteUrl = process.env.PRODUCTION_PUBLIC_SITE_URL;

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-staging-snapshot-'));
try {
  const snapshot = await exportStagingSpeciesSnapshot(config);
  const snapshotPath = path.join(tempDir, 'published-snapshot.json');
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  const result = await buildSpeciesSeoArtifact({
    snapshotPath,
    siteUrl,
    productionSiteUrl,
  });
  console.log(JSON.stringify({
    source: snapshot.source_label,
    project_ref: snapshot.source_project_ref,
    schema_version: snapshot.schema_probe?.schema_version,
    generated_pages: result.receipt?.generated_pages || 0,
    indexable_pages: result.manifest?.indexable_pages || 0,
    site_url: siteUrl,
  }));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

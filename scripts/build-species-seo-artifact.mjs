import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generatePublicSpecies } from '../apps/admin-content/scripts/generate-public-species.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');

async function mergeGeneratedOutput(sourceDir, distDir) {
  await mkdir(distDir, { recursive: true });
  const entries = ['species', 'zh', 'sitemap-species.xml', 'species-pages.manifest.json'];
  for (const entry of entries) {
    const source = path.join(sourceDir, entry);
    try {
      await cp(source, path.join(distDir, entry), { recursive: true, force: true });
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
}

export async function buildSpeciesSeoArtifact({
  snapshotPath,
  siteUrl,
  productionSiteUrl,
  distDir = path.join(repoRoot, 'dist'),
} = {}) {
  if (!snapshotPath) {
    console.log('Species SEO artifact: skipped (SPECIES_SEO_SNAPSHOT_PATH is not configured).');
    return { skipped: true, reason: 'snapshot-not-configured' };
  }
  if (!siteUrl) throw new Error('SPECIES_SEO_SITE_URL is required when SPECIES_SEO_SNAPSHOT_PATH is configured.');

  const resolvedSnapshot = path.resolve(repoRoot, snapshotPath);
  const snapshot = JSON.parse(await readFile(resolvedSnapshot, 'utf8'));
  if (snapshot.environment === 'production') {
    throw new Error('Refusing a Production Species SEO snapshot in the root build integration.');
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-root-species-'));
  try {
    const result = await generatePublicSpecies({
      snapshot,
      outDir: tempDir,
      siteUrl,
      productionSiteUrl,
      mode: 'release',
    });
    await mergeGeneratedOutput(tempDir, distDir);
    const receipt = {
      integrated_at: new Date().toISOString(),
      source_snapshot: path.relative(repoRoot, resolvedSnapshot) || path.basename(resolvedSnapshot),
      site_url: siteUrl,
      environment: snapshot.environment,
      generated_pages: result.manifest.generated_pages,
      indexable_pages: result.manifest.indexable_pages,
      output: path.relative(repoRoot, distDir) || 'dist',
    };
    await writeFile(path.join(distDir, 'species-pages.integration.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
    console.log(`Species SEO artifact: merged ${receipt.generated_pages} static pages into ${receipt.output}.`);
    return { skipped: false, ...result, receipt };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function cli() {
  await buildSpeciesSeoArtifact({
    snapshotPath: process.env.SPECIES_SEO_SNAPSHOT_PATH,
    siteUrl: process.env.SPECIES_SEO_SITE_URL,
    productionSiteUrl: process.env.PRODUCTION_PUBLIC_SITE_URL,
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  cli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

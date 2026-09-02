import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generatePublicSpecies } from '../apps/admin-content/scripts/generate-public-species.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const REPO_STAGING_SNAPSHOT = 'content/species-seo/staging-snapshot.json';
const SEO_STAGING_BRANCH = 'feature/admin-content-v0';

function currentCommitSubject() {
  if (process.env.VERCEL_GIT_COMMIT_MESSAGE) return process.env.VERCEL_GIT_COMMIT_MESSAGE.split(/\r?\n/)[0].trim();
  try {
    return execFileSync('git', ['show', '-s', '--format=%s', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function currentChangedFiles() {
  if (process.env.VERCEL_CHANGED_FILES) {
    return process.env.VERCEL_CHANGED_FILES.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }
  try {
    return execFileSync('git', ['show', '--pretty=', '--name-only', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' })
      .split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function resolveBuildInputs({ snapshotPath, siteUrl, productionSiteUrl } = {}) {
  const isSeoStagingPreview = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === SEO_STAGING_BRANCH;
  const previewHost = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const commitSubject = currentCommitSubject();
  const changedFiles = currentChangedFiles();
  const isExplicitStagingPublishCommit = isSeoStagingPreview
    && /^content\(seo\): publish staging\b/.test(commitSubject)
    && changedFiles.length === 1
    && changedFiles[0] === REPO_STAGING_SNAPSHOT;
  const repoSnapshotAvailable = isExplicitStagingPublishCommit && existsSync(path.join(repoRoot, REPO_STAGING_SNAPSHOT));
  const automaticSnapshot = repoSnapshotAvailable ? REPO_STAGING_SNAPSHOT : '';
  return {
    snapshotPath: snapshotPath || automaticSnapshot,
    siteUrl: siteUrl || (repoSnapshotAvailable && previewHost ? `https://${previewHost}` : ''),
    productionSiteUrl: productionSiteUrl || (productionHost ? `https://${productionHost}` : 'https://aqua-tank-guide.vercel.app'),
    source: snapshotPath ? 'explicit' : repoSnapshotAvailable ? 'vercel-explicit-staging-publish' : 'none',
    commitSubject,
    changedFiles,
  };
}

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
  mode = 'auto',
} = {}) {
  const inputs = resolveBuildInputs({ snapshotPath, siteUrl, productionSiteUrl });
  snapshotPath = inputs.snapshotPath;
  siteUrl = inputs.siteUrl;
  productionSiteUrl = inputs.productionSiteUrl;
  if (!snapshotPath) {
    console.log('Species SEO artifact: skipped (normal code build; no explicit Staging publish input).');
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
    const effectiveMode = mode === 'auto'
      ? snapshot.delivery_mode === 'staging_release' ? 'staging_release' : 'release'
      : mode;
    const result = await generatePublicSpecies({
      snapshot,
      outDir: tempDir,
      siteUrl,
      productionSiteUrl,
      mode: effectiveMode,
    });
    await mergeGeneratedOutput(tempDir, distDir);
    const receipt = {
      integrated_at: new Date().toISOString(),
      source_snapshot: path.relative(repoRoot, resolvedSnapshot) || path.basename(resolvedSnapshot),
      build_input_source: inputs.source,
      site_url: siteUrl,
      environment: snapshot.environment,
      delivery_mode: effectiveMode,
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

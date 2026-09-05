import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import {
  buildCareSeoAlternates,
  careSeoPublicPath,
  careSeoStagingSnapshotSchema,
  type CareSeoEditorialSnapshotRecord,
  type CareSeoStagingSnapshot,
  type SupportedLocale,
} from '../packages/contracts/src/index';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const REPO_STAGING_SNAPSHOT = 'content/care-seo/staging-snapshot.json';
const CARE_SEO_STAGING_BRANCH = 'feature/admin-content-v0';
const PRODUCTION_SITE_HOSTS = new Set(['aqua-tank-guide.vercel.app']);

const currentCommitSubject = () => {
  if (process.env.VERCEL_GIT_COMMIT_MESSAGE) return process.env.VERCEL_GIT_COMMIT_MESSAGE.split(/\r?\n/)[0].trim();
  try { return execFileSync('git', ['show', '-s', '--format=%s', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim(); } catch { return ''; }
};
const currentChangedFiles = () => {
  if (process.env.VERCEL_CHANGED_FILES) return process.env.VERCEL_CHANGED_FILES.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  try {
    return execFileSync('git', ['show', '--pretty=', '--name-only', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' })
      .split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  } catch { return []; }
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const trimSiteUrl = (value: string) => value.replace(/\/+$/, '');
const absoluteUrl = (siteUrl: string, publicPath: string) => `${trimSiteUrl(siteUrl)}${publicPath}`;

const hygieneMarkers = [
  /\bacceptance(?:\s+test)?\b/i,
  /\btest(?:ing)?\s+(?:copy|content|title|h1)\b/i,
  /\bqa\s*(?:only|test)\b/i,
  /\bplaceholder\b/i,
  /验收(?:文案|测试|用|版)?|仅供测试|测试(?:文案|内容|标题|H1|用)/i,
];
const assertCleanPublicCopy = (record: CareSeoEditorialSnapshotRecord) => {
  const values = [
    record.editorial.seoTitle, record.editorial.metaDescription, record.editorial.h1, record.editorial.focusKeyword,
    record.projection.sourceFacts.category, record.projection.sourceFacts.urgency, record.projection.sourceFacts.summary,
    ...record.projection.sourceFacts.immediateActions, ...record.projection.sourceFacts.avoidActions,
    ...record.projection.sourceFacts.observeItems, record.projection.sourceFacts.nextStep,
  ];
  if (values.some(value => hygieneMarkers.some(marker => marker.test(String(value || ''))))) {
    throw new Error(`Care SEO content hygiene failed: ${record.projection.sourceCareCatalogKey}/${record.projection.locale}`);
  }
};

export const resolveCareSeoBuildInputs = ({ snapshotPath, siteUrl, productionSiteUrl }: {
  snapshotPath?: string; siteUrl?: string; productionSiteUrl?: string;
} = {}) => {
  const isPreview = process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === CARE_SEO_STAGING_BRANCH;
  const commitSubject = currentCommitSubject();
  const changedFiles = currentChangedFiles();
  const explicitPublishCommit = isPreview
    && /^content\(care-seo\): publish staging\b/.test(commitSubject)
    && changedFiles.length === 1
    && changedFiles[0] === REPO_STAGING_SNAPSHOT;
  const previewHost = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return {
    snapshotPath: snapshotPath || (explicitPublishCommit ? REPO_STAGING_SNAPSHOT : ''),
    siteUrl: siteUrl || (explicitPublishCommit && previewHost ? `https://${previewHost}` : ''),
    productionSiteUrl: productionSiteUrl || (productionHost ? `https://${productionHost}` : 'https://aqua-tank-guide.vercel.app'),
    source: snapshotPath ? 'explicit' : explicitPublishCommit ? 'vercel-explicit-care-staging-publish' : 'none',
    commitSubject, changedFiles,
  };
};
const assertRouteContract = (record: CareSeoEditorialSnapshotRecord) => {
  const { projection } = record;
  const expectedPath = careSeoPublicPath(projection.sourceCareCatalogKey, projection.locale);
  const expectedAlternates = buildCareSeoAlternates(projection.sourceCareCatalogKey);
  if (projection.route.candidateUrl !== expectedPath || projection.route.pathname !== expectedPath) {
    throw new Error(`Care SEO route drift: ${projection.sourceCareCatalogKey}/${projection.locale}`);
  }
  if (JSON.stringify(projection.route.alternates) !== JSON.stringify(expectedAlternates)) {
    throw new Error(`Care SEO alternate drift: ${projection.sourceCareCatalogKey}/${projection.locale}`);
  }
  if (projection.route.topicParam !== projection.sourceCareCatalogKey) {
    throw new Error(`Care SEO topic identity drift: ${projection.sourceCareCatalogKey}/${projection.locale}`);
  }
};

const validateReleaseScope = (snapshot: CareSeoStagingSnapshot) => {
  if (snapshot.environment === 'production') {
    throw new Error('Refusing a Production Care SEO snapshot in the root build integration.');
  }
  if (snapshot.sourceEnvironment === 'production' || /production|prod\b/i.test(snapshot.sourceLabel)) {
    throw new Error('Refusing a Production Care SEO source for Staging handoff.');
  }
  const groups = new Map<string, CareSeoEditorialSnapshotRecord[]>();
  for (const record of snapshot.records) {
    assertRouteContract(record);
    assertCleanPublicCopy(record);
    if (record.editorial.reviewState !== 'approved') {
      throw new Error(`Care SEO record is not approved: ${record.projection.sourceCareCatalogKey}/${record.projection.locale}`);
    }
    const key = record.projection.sourceCareCatalogKey;
    groups.set(key, [...(groups.get(key) || []), record]);
  }
  for (const [catalogKey, records] of groups) {
    const locales = new Set(records.map(record => record.projection.locale));
    if (records.length !== 2 || !locales.has('en') || !locales.has('zh-CN')) {
      throw new Error(`Care SEO bilingual pair required: ${catalogKey}`);
    }
    const versions = new Set(records.map(record => record.projection.sourceCareVersion));
    const sourceIds = new Set(records.map(record => record.projection.sourceCareId));
    const strategies = new Set(records.map(record => record.editorial.indexStrategy));
    if (versions.size !== 1 || sourceIds.size !== 1) {
      throw new Error(`Care SEO source version mismatch: ${catalogKey}`);
    }
    if (strategies.size !== 1) {
      throw new Error(`Care SEO locale index-strategy mismatch: ${catalogKey}`);
    }
  }
  return groups;
};

const renderList = (title: string, items: string[]) => items.length === 0 ? '' : `
<section><h2>${escapeHtml(title)}</h2><ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`;

const localizedLabels = (locale: SupportedLocale) => locale === 'zh-CN'
  ? { actions: '现在先做', avoid: '暂时不要做', observe: '继续观察', next: '下一步', interactive: '打开交互式养护指南', browse: '返回养护百科' }
  : { actions: 'Do this now', avoid: 'Avoid for now', observe: 'Keep observing', next: 'Next step', interactive: 'Open interactive care guide', browse: 'Browse Care' };
const renderPage = (record: CareSeoEditorialSnapshotRecord, siteUrl: string) => {
  const { projection, editorial } = record;
  const labels = localizedLabels(projection.locale);
  const robots = editorial.indexStrategy === 'index' ? 'index,follow' : 'noindex,follow';
  const canonicalPath = careSeoPublicPath(projection.sourceCareCatalogKey, projection.locale);
  const alternates = buildCareSeoAlternates(projection.sourceCareCatalogKey);
  const source = projection.sourceFacts;
  const interactiveHref = `/care?topic=${encodeURIComponent(projection.sourceCareCatalogKey)}&source=seo-care`;
  return `<!doctype html>
<html lang="${projection.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(editorial.seoTitle)}</title><meta name="description" content="${escapeHtml(editorial.metaDescription)}">
<meta name="robots" content="${robots}"><meta name="aquaguide:care-source-version" content="${projection.sourceCareVersion}"><meta name="aquaguide:care-source-key" content="${escapeHtml(projection.sourceCareCatalogKey)}"><link rel="canonical" href="${escapeHtml(absoluteUrl(siteUrl, canonicalPath))}">
<link rel="alternate" hreflang="en" href="${escapeHtml(absoluteUrl(siteUrl, alternates.en))}"><link rel="alternate" hreflang="zh-CN" href="${escapeHtml(absoluteUrl(siteUrl, alternates['zh-CN']))}"><link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(siteUrl, alternates['x-default']))}">
<style>body{margin:0;background:#f4f7f5;color:#17211c;font:16px/1.65 system-ui,sans-serif}main{max-width:820px;margin:auto;padding:32px 20px 64px}article{background:#fff;border:1px solid #e5ebe7;border-radius:24px;padding:28px}h1{font-size:32px;line-height:1.2;margin:0 0 16px}h2{font-size:18px;margin:28px 0 8px}ul{padding-left:22px}.meta{font-size:13px;color:#647068}.cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}.cta a{padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:700;background:#146b4b;color:white}.cta a.secondary{background:#eef5f1;color:#146b4b}</style></head><body><main><article data-care-source-version="${projection.sourceCareVersion}" data-care-source-key="${escapeHtml(projection.sourceCareCatalogKey)}">
<div class="meta">${escapeHtml(source.category)} · ${escapeHtml(source.urgency)}</div><h1>${escapeHtml(editorial.h1)}</h1><p>${escapeHtml(source.summary)}</p>
${renderList(labels.actions, source.immediateActions)}${renderList(labels.avoid, source.avoidActions)}${renderList(labels.observe, source.observeItems)}
<section><h2>${escapeHtml(labels.next)}</h2><p>${escapeHtml(source.nextStep)}</p></section>
<div class="cta"><a href="${escapeHtml(interactiveHref)}">${escapeHtml(labels.interactive)}</a><a class="secondary" href="/care">${escapeHtml(labels.browse)}</a></div>
</article></main></body></html>`;
};
const writePublicPath = async (outDir: string, publicPath: string, html: string) => {
  const relative = publicPath.replace(/^\/+/, '');
  const target = path.join(outDir, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, 'utf8');
};

const renderSitemap = (siteUrl: string, records: CareSeoEditorialSnapshotRecord[]) => {
  const urls = records
    .filter(record => record.editorial.indexStrategy === 'index')
    .map(record => `  <url><loc>${escapeHtml(absoluteUrl(siteUrl, record.projection.route.candidateUrl))}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

export const buildCareSeoArtifact = async ({
  snapshotPath,
  siteUrl,
  productionSiteUrl,
  distDir = path.join(repoRoot, 'dist'),
}: {
  snapshotPath?: string;
  siteUrl?: string;
  productionSiteUrl?: string;
  distDir?: string;
} = {}) => {
  const inputs = resolveCareSeoBuildInputs({ snapshotPath, siteUrl, productionSiteUrl });
  snapshotPath = inputs.snapshotPath;
  siteUrl = inputs.siteUrl;
  productionSiteUrl = inputs.productionSiteUrl;
  if (!snapshotPath) {
    console.log('Care SEO artifact: skipped (normal code build; no explicit Staging snapshot input).');
    return { skipped: true as const, reason: 'snapshot-not-configured' };
  }
  if (!siteUrl) throw new Error('CARE_SEO_SITE_URL is required when CARE_SEO_SNAPSHOT_PATH is configured.');
  const normalizedSite = trimSiteUrl(siteUrl);
  const normalizedProduction = productionSiteUrl ? trimSiteUrl(productionSiteUrl) : '';
  let siteHost = '';
  let productionHost = '';
  try { siteHost = new URL(normalizedSite).hostname; } catch { throw new Error(`Invalid CARE_SEO_SITE_URL: ${normalizedSite}`); }
  if (normalizedProduction) {
    try { productionHost = new URL(normalizedProduction).hostname; } catch { throw new Error(`Invalid PRODUCTION_PUBLIC_SITE_URL: ${normalizedProduction}`); }
  }
  if (PRODUCTION_SITE_HOSTS.has(siteHost) || (productionHost && siteHost === productionHost)) {
    throw new Error('Refusing to publish a Care SEO staging artifact to the Production site URL.');
  }
  const resolvedSnapshot = path.resolve(repoRoot, snapshotPath);
  const raw = JSON.parse(await readFile(resolvedSnapshot, 'utf8'));
  const snapshot = careSeoStagingSnapshotSchema.parse(raw);
  const groups = validateReleaseScope(snapshot);
  await mkdir(distDir, { recursive: true });

  for (const record of snapshot.records) {
    await writePublicPath(distDir, record.projection.route.candidateUrl, renderPage(record, normalizedSite));
  }
  await writeFile(path.join(distDir, 'sitemap-care.xml'), renderSitemap(normalizedSite, snapshot.records), 'utf8');
  const indexablePages = snapshot.records.filter(record => record.editorial.indexStrategy === 'index').length;
  const manifest = {
    schema_version: 1,
    environment: snapshot.environment,
    source_label: snapshot.sourceLabel,
    generated_at: new Date().toISOString(),
    generated_pages: snapshot.records.length,
    indexable_pages: indexablePages,
    catalog_keys: Array.from(groups.entries()).map(([catalogKey, records]) => ({
      catalog_key: catalogKey,
      source_version: records[0].projection.sourceCareVersion,
      index_strategy: records[0].editorial.indexStrategy,
      locales: records.map(record => record.projection.locale).sort(),
    })),
  };
  await writeFile(path.join(distDir, 'care-pages.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  const receipt = {
    integrated_at: new Date().toISOString(),
    source_snapshot: path.relative(repoRoot, resolvedSnapshot) || path.basename(resolvedSnapshot),
    site_url: normalizedSite,
    environment: snapshot.environment,
    source_environment: snapshot.sourceEnvironment,
    build_input_source: inputs.source,
    generated_pages: snapshot.records.length,
    indexable_pages: indexablePages,
    output: path.relative(repoRoot, distDir) || 'dist',
  };
  await writeFile(path.join(distDir, 'care-pages.integration.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(`Care SEO artifact: merged ${snapshot.records.length} static pages into ${receipt.output}.`);
  return { skipped: false as const, snapshot, manifest, receipt };
};

const cli = async () => buildCareSeoArtifact({
  snapshotPath: process.env.CARE_SEO_SNAPSHOT_PATH,
  siteUrl: process.env.CARE_SEO_SITE_URL,
  productionSiteUrl: process.env.PRODUCTION_PUBLIC_SITE_URL,
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  cli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

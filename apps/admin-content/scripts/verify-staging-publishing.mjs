import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { exportStagingSpeciesSnapshot } from './export-staging-species-snapshot.mjs';
import { generatePublicSpecies } from './generate-public-species.mjs';
import { validateStagingSiteUrl } from './staging-publishing-config.mjs';

function startStaticServer(root) {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '');
      const target = path.resolve(root, pathname || 'index.html');
      if (!target.startsWith(path.resolve(root) + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
      const body = await readFile(target);
      res.writeHead(200, { 'content-type': target.endsWith('.xml') ? 'application/xml' : 'text/html; charset=utf-8' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not Found');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function findBilingualIndexPair(pages) {
  const indexed = pages.filter((page) => page.routeMeta.robots === 'index,follow' && page.routeMeta.selfPath === page.routeMeta.canonicalPath);
  const byCatalog = new Map();
  for (const page of indexed) {
    const key = page.row.catalog_key;
    if (!byCatalog.has(key)) byCatalog.set(key, {});
    byCatalog.get(key)[page.row.locale] = page;
  }
  for (const pair of byCatalog.values()) if (pair.en && pair['zh-CN']) return pair;
  return null;
}

function assertRenderedHtml(html, { locale, siteUrl, selfPath, alternatePath }) {
  assert.match(html, new RegExp(`<html lang="${locale === 'en' ? 'en' : 'zh-CN'}">`));
  assert.match(html, /<meta name="robots" content="index,follow">/);
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}${selfPath}"`), 'Canonical must use the staging site host.');
  assert.ok(html.includes(`hreflang="${locale === 'en' ? 'zh-CN' : 'en'}" href="${siteUrl}${alternatePath}"`), 'Reciprocal hreflang must exist.');
  assert.ok(html.includes(`hreflang="x-default"`), 'x-default must exist.');
}

export async function verifyStagingPublishing(config) {
  const siteUrl = validateStagingSiteUrl(config.siteUrl, config.productionSiteUrl);
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-staging-publish-'));
  const snapshot = await exportStagingSpeciesSnapshot(config);
  let server;
  try {
    const { manifest, pages } = await generatePublicSpecies({ snapshot, outDir, siteUrl, productionSiteUrl: config.productionSiteUrl });
    if (manifest.generated_pages < 2) throw new Error('Staging must contain at least one bilingual Published Species pair.');
    const pair = findBilingualIndexPair(pages);
    if (!pair) throw new Error('Staging must include at least one bilingual self-canonical Index pair.');
    server = await startStaticServer(outDir);
    const address = server.address();
    const localBase = `http://127.0.0.1:${address.port}`;
    const [enResponse, zhResponse, sitemapResponse] = await Promise.all([
      fetch(`${localBase}${pair.en.routeMeta.selfPath}`),
      fetch(`${localBase}${pair['zh-CN'].routeMeta.selfPath}`),
      fetch(`${localBase}/sitemap-species.xml`),
    ]);
    assert.equal(enResponse.status, 200);
    assert.equal(zhResponse.status, 200);
    assert.equal(sitemapResponse.status, 200);
    const [enHtml, zhHtml, sitemap] = await Promise.all([enResponse.text(), zhResponse.text(), sitemapResponse.text()]);
    assertRenderedHtml(enHtml, { locale: 'en', siteUrl, selfPath: pair.en.routeMeta.selfPath, alternatePath: pair['zh-CN'].routeMeta.selfPath });
    assertRenderedHtml(zhHtml, { locale: 'zh-CN', siteUrl, selfPath: pair['zh-CN'].routeMeta.selfPath, alternatePath: pair.en.routeMeta.selfPath });
    assert.ok(sitemap.includes(`${siteUrl}${pair.en.routeMeta.selfPath}`), 'English staging URL must appear in sitemap.');
    assert.ok(sitemap.includes(`${siteUrl}${pair['zh-CN'].routeMeta.selfPath}`), 'Chinese staging URL must appear in sitemap.');
    return { project_ref: snapshot.source_project_ref, ...manifest, verified_pair: pair.en.row.catalog_key };
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await rm(outDir, { recursive: true, force: true });
  }
}

async function cli() {
  const result = await verifyStagingPublishing({
    supabaseUrl: process.env.STAGING_SUPABASE_URL,
    publishableKey: process.env.STAGING_SUPABASE_PUBLISHABLE_KEY,
    expectedProjectRef: process.env.STAGING_SUPABASE_PROJECT_REF,
    productionProjectRef: process.env.PRODUCTION_SUPABASE_PROJECT_REF,
    sourceLabel: process.env.STAGING_SOURCE_LABEL,
    siteUrl: process.env.STAGING_PUBLIC_SITE_URL,
    productionSiteUrl: process.env.PRODUCTION_PUBLIC_SITE_URL,
  });
  console.log(`Staging Species publishing verified: ${JSON.stringify(result)}`);
}

cli().catch((error) => {
  console.error(`Staging Species publishing blocked: ${error.message}`);
  process.exitCode = 1;
});

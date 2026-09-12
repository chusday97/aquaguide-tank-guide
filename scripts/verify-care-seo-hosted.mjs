import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { careSeoHostedAcceptanceEvidenceSchema, careSeoStagingSnapshotSchema } from '../packages/contracts/src/index.ts';

const baseUrl = String(process.env.CARE_SEO_ACCEPTANCE_BASE_URL || '').replace(/\/+$/, '');
const snapshotPath = process.env.CARE_SEO_ACCEPTANCE_SNAPSHOT_PATH;
const productionUrl = String(process.env.PRODUCTION_PUBLIC_SITE_URL || 'https://aqua-tank-guide.vercel.app').replace(/\/+$/, '');
const canonicalBaseUrl = String(process.env.CARE_SEO_ACCEPTANCE_CANONICAL_BASE_URL || baseUrl).replace(/\/+$/, '');
const acceptanceCookie = String(process.env.CARE_SEO_ACCEPTANCE_COOKIE || '').trim();
const evidencePath = String(process.env.CARE_SEO_ACCEPTANCE_EVIDENCE_PATH || '').trim();
const deploymentId = String(process.env.CARE_SEO_ACCEPTANCE_DEPLOYMENT_ID || '').trim();
const snapshotGitSha = String(process.env.CARE_SEO_ACCEPTANCE_GIT_SHA || '').trim();
if (!baseUrl) throw new Error('CARE_SEO_ACCEPTANCE_BASE_URL is required.');
if (!snapshotPath) throw new Error('CARE_SEO_ACCEPTANCE_SNAPSHOT_PATH is required.');

const base = new URL(baseUrl);
const canonicalBase = new URL(canonicalBaseUrl);
const production = new URL(productionUrl);
if (base.hostname === production.hostname || base.hostname === 'aqua-tank-guide.vercel.app'
  || canonicalBase.hostname === production.hostname || canonicalBase.hostname === 'aqua-tank-guide.vercel.app') {
  throw new Error('Refusing hosted Care SEO acceptance against Production.');
}

const snapshotRaw = await readFile(path.resolve(snapshotPath), 'utf8');
const raw = JSON.parse(snapshotRaw);
const snapshot = careSeoStagingSnapshotSchema.parse(raw);
assert.equal(snapshot.environment, 'staging');
assert.equal(snapshot.sourceEnvironment, 'staging');

const decode = value => String(value || '')
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attr = (html, pattern, label) => {
  const match = html.match(pattern);
  assert.ok(match, `${label} missing`);
  return decode(match[1]);
};
const hygiene = /\bacceptance(?:\s+test)?\b|\btest(?:ing)?\s+(?:copy|content|title|h1)\b|\bqa\s*(?:only|test)\b|\bplaceholder\b|验收(?:文案|测试|用|版)?|仅供测试|测试(?:文案|内容|标题|H1|用)/i;

const byKey = new Map();
for (const record of snapshot.records) {
  assert.equal(record.editorial.reviewState, 'approved');
  assert.equal(record.editorial.indexStrategy, 'noindex');
  const key = record.projection.sourceCareCatalogKey;
  byKey.set(key, [...(byKey.get(key) || []), record]);
}
for (const [key, records] of byKey) {
  assert.equal(records.length, 2, `${key}: bilingual pair required`);
  assert.deepEqual(new Set(records.map(item => item.projection.locale)), new Set(['en', 'zh-CN']));
  assert.equal(new Set(records.map(item => item.projection.sourceCareVersion)).size, 1, `${key}: source version mismatch`);
}

let checked = 0;
for (const record of snapshot.records) {
  const { projection, editorial } = record;
  const pageUrl = `${baseUrl}${projection.route.candidateUrl}`;
  const response = await fetch(pageUrl, {
    redirect: 'follow',
    ...(acceptanceCookie ? { headers: { Cookie: acceptanceCookie } } : {}),
  });
  assert.equal(response.status, 200, `${pageUrl}: HTTP ${response.status}`);
  const html = await response.text();
  assert.doesNotMatch(html, hygiene, `${pageUrl}: test/acceptance/placeholder content leaked`);
  const xRobots = response.headers.get('x-robots-tag');
  if (xRobots) assert.match(xRobots, /noindex/i, `${pageUrl}: deployment X-Robots-Tag must remain noindex`);

  assert.equal(attr(html, /<title>([\s\S]*?)<\/title>/i, 'title'), editorial.seoTitle, `${pageUrl}: title drift`);
  assert.equal(attr(html, /<meta\s+name="description"\s+content="([^"]*)"/i, 'meta description'), editorial.metaDescription, `${pageUrl}: meta description drift`);
  assert.equal(attr(html, /<h1>([\s\S]*?)<\/h1>/i, 'H1'), editorial.h1, `${pageUrl}: H1 drift`);
  assert.equal(attr(html, /<meta\s+name="robots"\s+content="([^"]*)"/i, 'robots'), 'noindex,follow', `${pageUrl}: robots drift`);
  assert.equal(Number(attr(html, /<meta\s+name="aquaguide:care-source-version"\s+content="([^"]*)"/i, 'source version')), projection.sourceCareVersion, `${pageUrl}: source version drift`);
  const canonical = attr(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i, 'canonical');
  assert.equal(canonical, `${canonicalBaseUrl}${projection.route.candidateUrl}`, `${pageUrl}: canonical drift`);
  for (const [lang, pathname] of Object.entries(projection.route.alternates)) {
    const escapedLang = lang.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`<link\\s+rel="alternate"\\s+hreflang="${escapedLang}"\\s+href="([^"]*)"`, 'i');
    assert.equal(attr(html, pattern, `hreflang=${lang}`), `${canonicalBaseUrl}${pathname}`, `${pageUrl}: hreflang ${lang} drift`);
  }
  checked += 1;
}

if (evidencePath) {
  if (!deploymentId || !snapshotGitSha) throw new Error('Acceptance evidence requires deployment ID and snapshot Git SHA.');
  const evidence = careSeoHostedAcceptanceEvidenceSchema.parse({
    schemaVersion: 1,
    environment: 'staging',
    snapshotSha256: createHash('sha256').update(snapshotRaw).digest('hex'),
    snapshotGitSha,
    acceptedAt: new Date().toISOString(),
    deployment: { provider: 'vercel', deploymentId, deploymentUrl: baseUrl, canonicalBaseUrl },
    verification: {
      pagesChecked: checked,
      bilingualPairsChecked: byKey.size,
      http200: true,
      metadataMatched: true,
      canonicalHreflangMatched: true,
      sourceVersionMatched: true,
      noindexRetained: true,
      hygienePassed: true,
    },
  });
  await writeFile(path.resolve(evidencePath), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
}
console.log(`Care SEO hosted acceptance PASS: ${checked}/${snapshot.records.length} pages · ${byKey.size} bilingual pair(s) · noindex retained`);

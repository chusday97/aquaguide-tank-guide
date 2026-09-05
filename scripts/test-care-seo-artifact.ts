import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { careSeoStagingSnapshotSchema, type CareArticleDetailDto, type SupportedLocale } from '../packages/contracts/src/index';
import { buildCareSeoProjection } from '../apps/api/src/care-seo-projection';
import { buildCareSeoArtifact } from './build-care-seo-artifact';

const publishedAt = '2026-09-05T04:00:00.000Z';
const detailFor = (catalogKey: string, locale: SupportedLocale): CareArticleDetailDto => ({
  id: `id-${catalogKey}`,
  catalogKey,
  title: locale === 'en' ? `Safe care for ${catalogKey}` : `${catalogKey} 安全养护`,
  category: locale === 'en' ? 'Water quality' : '水质',
  urgency: '日常',
  summary: locale === 'en' ? 'Use stable water and observe the fish before taking further action.' : '保持水质稳定，并先观察鱼只状态再继续处理。',
  keywords: locale === 'en' ? ['water care'] : ['水质养护'],
  symptoms: locale === 'en' ? ['stress'] : ['应激'],
  avoidActions: locale === 'en' ? ['Avoid unnecessary medication'] : ['不要随意下药'],
  observeItems: locale === 'en' ? ['breathing'] : ['呼吸'],
  diagnoseWhen: locale === 'en' ? ['symptoms persist'] : ['异常持续'],
  nextStep: locale === 'en' ? 'Escalate if the condition worsens.' : '如情况恶化，进一步排查。',
  steps: [{
    id: `step-${catalogKey}`,
    position: 1,
    instruction: locale === 'en' ? 'Observe before changing parameters.' : '调整参数前先观察。',
    actionTitle: locale === 'en' ? 'Observe first' : '先观察',
    actionKind: 'immediate',
  }],
  references: [],
  assets: [],
  updatedAt: publishedAt,
  localization: { requestedLocale: locale, resolvedLocale: locale, usedFallback: false },
});

const recordFor = (catalogKey: string, locale: SupportedLocale, version: number, indexStrategy: 'index' | 'noindex') => {
  const projection = buildCareSeoProjection(detailFor(catalogKey, locale), version, publishedAt, 'publication-snapshot', locale);
  return {
    projection,
    editorial: {
      reviewState: 'approved' as const,
      indexStrategy,
      seoTitle: projection.suggestedEditorial.seoTitle,
      metaDescription: projection.suggestedEditorial.metaDescription,
      h1: projection.suggestedEditorial.h1,
      focusKeyword: projection.suggestedEditorial.focusKeyword,
    },
  };
};
const snapshot = careSeoStagingSnapshotSchema.parse({
  schemaVersion: 1,
  environment: 'staging',
  sourceEnvironment: 'staging',
  sourceLabel: 'care-seo-contract-test',
  generatedAt: '2026-09-05T05:00:00.000Z',
  records: [
    recordFor('care_index', 'en', 3, 'index'),
    recordFor('care_index', 'zh-CN', 3, 'index'),
    recordFor('care_noindex', 'en', 5, 'noindex'),
    recordFor('care_noindex', 'zh-CN', 5, 'noindex'),
  ],
});

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-care-seo-test-'));
const snapshotPath = path.join(tempRoot, 'snapshot.json');
const distDir = path.join(tempRoot, 'dist');
const siteUrl = 'https://staging.aquaguide.test';
const productionSiteUrl = 'https://aqua-tank-guide.vercel.app';

try {
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  const result = await buildCareSeoArtifact({ snapshotPath, siteUrl, productionSiteUrl, distDir });
  assert.equal(result.skipped, false);
  if (result.skipped) throw new Error('Care SEO artifact unexpectedly skipped.');
  assert.equal(result.manifest.generated_pages, 4);
  assert.equal(result.manifest.indexable_pages, 2);
  const [enIndex, zhIndex, enNoindex, sitemap] = await Promise.all([
    readFile(path.join(distDir, 'care/care_index.html'), 'utf8'),
    readFile(path.join(distDir, 'zh/care/care_index.html'), 'utf8'),
    readFile(path.join(distDir, 'care/care_noindex.html'), 'utf8'),
    readFile(path.join(distDir, 'sitemap-care.xml'), 'utf8'),
  ]);
  assert.match(enIndex, /<html lang="en">/);
  assert.match(enIndex, /<meta name="robots" content="index,follow">/);
  assert.match(enIndex, /<meta name="aquaguide:care-source-version" content="3">/);
  assert.match(enIndex, /href="https:\/\/staging\.aquaguide\.test\/zh\/care\/care_index\.html"/);
  assert.match(enIndex, /<h1>Safe care for care_index<\/h1>/);
  assert.match(zhIndex, /<html lang="zh-CN">/);
  assert.match(zhIndex, /<h1>care_index 安全养护<\/h1>/);
  assert.match(enNoindex, /<meta name="robots" content="noindex,follow">/);
  assert.match(sitemap, /\/care\/care_index\.html/);
  assert.match(sitemap, /\/zh\/care\/care_index\.html/);
  assert.doesNotMatch(sitemap, /care_noindex/);

  const versionMismatch = structuredClone(snapshot);
  versionMismatch.records[1].projection.sourceCareVersion = 4;
  const mismatchPath = path.join(tempRoot, 'version-mismatch.json');
  await writeFile(mismatchPath, JSON.stringify(versionMismatch), 'utf8');
  await assert.rejects(
    buildCareSeoArtifact({ snapshotPath: mismatchPath, siteUrl, productionSiteUrl, distDir: path.join(tempRoot, 'bad-version') }),
    /source version mismatch/,
  );
  const unapproved = structuredClone(snapshot);
  unapproved.records[0].editorial.reviewState = 'draft';
  const unapprovedPath = path.join(tempRoot, 'unapproved.json');
  await writeFile(unapprovedPath, JSON.stringify(unapproved), 'utf8');
  await assert.rejects(
    buildCareSeoArtifact({ snapshotPath: unapprovedPath, siteUrl, productionSiteUrl, distDir: path.join(tempRoot, 'bad-review') }),
    /not approved/,
  );

  const productionSource = structuredClone(snapshot);
  productionSource.sourceEnvironment = 'production';
  const productionSourcePath = path.join(tempRoot, 'production-source.json');
  await writeFile(productionSourcePath, JSON.stringify(productionSource), 'utf8');
  await assert.rejects(
    buildCareSeoArtifact({ snapshotPath: productionSourcePath, siteUrl, productionSiteUrl, distDir: path.join(tempRoot, 'bad-production-source') }),
    /Production Care SEO source/,
  );

  const dirtyCopy = structuredClone(snapshot);
  dirtyCopy.records[0].editorial.seoTitle = 'QA test content title';
  const dirtyCopyPath = path.join(tempRoot, 'dirty-copy.json');
  await writeFile(dirtyCopyPath, JSON.stringify(dirtyCopy), 'utf8');
  await assert.rejects(
    buildCareSeoArtifact({ snapshotPath: dirtyCopyPath, siteUrl, productionSiteUrl, distDir: path.join(tempRoot, 'bad-hygiene') }),
    /content hygiene failed/,
  );

  const productionSnapshot = structuredClone(snapshot);
  productionSnapshot.environment = 'production';
  const productionPath = path.join(tempRoot, 'production.json');
  await writeFile(productionPath, JSON.stringify(productionSnapshot), 'utf8');
  await assert.rejects(
    buildCareSeoArtifact({ snapshotPath: productionPath, siteUrl, productionSiteUrl, distDir: path.join(tempRoot, 'bad-production') }),
    /Production Care SEO snapshot/,
  );

  await assert.rejects(
    buildCareSeoArtifact({ snapshotPath, siteUrl: productionSiteUrl, productionSiteUrl, distDir: path.join(tempRoot, 'bad-host') }),
    /Production site URL/,
  );
  console.log('Care SEO static artifact: bilingual pairing + source-version gate + review/index safety PASS');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}

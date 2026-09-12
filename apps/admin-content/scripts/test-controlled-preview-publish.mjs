import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildControlledPreviewPublish, validatePreviewOutputDir } from './build-controlled-preview.mjs';

const groupKey = 'base:neocaridina-davidi';
const catalogKey = 'sp_0030';
const siteUrl = 'http://127.0.0.1:4020';
const snapshot = {
  environment: 'preview',
  delivery_mode: 'controlled_preview',
  source_label: 'controlled-preview-test',
  selected_catalog_keys: [catalogKey],
  species_seo_groups: [
    { group_key: groupKey, locale: 'en', status: 'draft', review_state: 'approved', seo_title_template: '{{name}} Care Guide | AquaGuide', meta_description_template: 'Learn care essentials for {{name}} ({{base_species}}).', h1_template: '{{name}} Care Guide', shared_intro: 'Approved English preview intro.' },
    { group_key: groupKey, locale: 'zh-CN', status: 'draft', review_state: 'approved', seo_title_template: '{{name}}饲养指南 | AquaGuide', meta_description_template: '了解{{name}}（{{base_species}}）的饲养重点。', h1_template: '{{name}}饲养指南', shared_intro: '已审核中文预览简介。' },
  ],
  species_seo: [
    { catalog_key: catalogKey, locale: 'en', localized_name: 'Yellow Cherry Shrimp', status: 'draft', review_state: 'approved', image_alt: 'Yellow Cherry Shrimp', index_strategy: 'index', canonical_catalog_key: '' },
    { catalog_key: catalogKey, locale: 'zh-CN', localized_name: '', status: 'draft', review_state: 'approved', image_alt: '黄金米虾', index_strategy: 'index', canonical_catalog_key: '' },
  ],
  data_review_resolutions: [],
};

const outDir = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-controlled-preview-'));
try {
  const result = await buildControlledPreviewPublish({ snapshot, outDir, siteUrl, productionSiteUrl: 'https://aqua-tank-guide.vercel.app' });
  assert.equal(result.manifest.delivery_mode, 'preview');
  assert.equal(result.manifest.preview_only, true);
  assert.equal(result.manifest.generated_pages, 2);
  assert.equal(result.manifest.planned_indexable_pages, 2);
  assert.equal(result.manifest.indexable_pages, 0, 'Preview output must never be reported as actually indexable');
  assert.equal(result.manifest.rendered_robots, 'noindex,nofollow');

  const [en, zh, robots, index] = await Promise.all([
    readFile(path.join(outDir, 'species/neocaridina-davidi/sp-0030.html'), 'utf8'),
    readFile(path.join(outDir, 'zh/species/neocaridina-davidi/sp-0030.html'), 'utf8'),
    readFile(path.join(outDir, 'robots.txt'), 'utf8'),
    readFile(path.join(outDir, 'index.html'), 'utf8'),
  ]);
  assert.match(en, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(zh, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(en, /PREVIEW ONLY/);
  assert.match(en, /intended robots: index,follow/);
  assert.match(en, /rel="canonical" href="http:\/\/127\.0\.0\.1:4020\/species\/neocaridina-davidi\/sp-0030\.html"/);
  assert.match(en, /hreflang="zh-CN"/);
  assert.equal(robots, 'User-agent: *\nDisallow: /\n');
  assert.match(index, /planned indexable: 2/);
  await assert.rejects(access(path.join(outDir, 'sitemap-species.xml')), /ENOENT/, 'Preview output must not emit the release sitemap');

  const unapproved = structuredClone(snapshot);
  unapproved.species_seo[0].review_state = 'ready_for_review';
  await assert.rejects(
    buildControlledPreviewPublish({ snapshot: unapproved, outDir: `${outDir}-blocked`, siteUrl, productionSiteUrl: 'https://aqua-tank-guide.vercel.app' }),
    /eligible en counterpart|Approved|zero pages|generation blocked/i,
  );

  assert.throws(() => validatePreviewOutputDir(path.resolve('public/species-preview')), /refuses deployable output directory/);
  await assert.rejects(
    buildControlledPreviewPublish({ snapshot, outDir: `${outDir}-prod`, siteUrl: 'https://aqua-tank-guide.vercel.app', productionSiteUrl: 'https://aqua-tank-guide.vercel.app' }),
    /Refusing production canonical host/,
  );
} finally {
  await rm(outDir, { recursive: true, force: true });
  await rm(`${outDir}-blocked`, { recursive: true, force: true });
  await rm(`${outDir}-prod`, { recursive: true, force: true });
}
console.log('Controlled Preview Publish verified: approved Draft only, forced noindex, deployable output refused');

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { generatePublicSpecies } from './generate-public-species.mjs';

const siteUrl = 'https://preview.aquaguide.test';
const outDir = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-species-pages-'));

const baseRows = [
  {
    group_key: 'base:neocaridina-davidi', locale: 'en', status: 'published', review_state: 'approved',
    seo_title_template: '{{name}} Care Guide | AquaGuide',
    meta_description_template: 'Learn water, tank and compatibility essentials for {{name}} ({{base_species}}).',
    h1_template: '{{name}} Care Guide',
    shared_intro: 'A practical care overview grounded in AquaGuide catalog facts.',
  },
  {
    group_key: 'base:neocaridina-davidi', locale: 'zh-CN', status: 'published', review_state: 'approved',
    seo_title_template: '{{name}}饲养指南 | AquaGuide',
    meta_description_template: '了解{{name}}（{{base_species}}）的水温、鱼缸环境与饲养重点。',
    h1_template: '{{name}}饲养指南',
    shared_intro: '基于 AquaGuide 现有物种事实数据整理的饲养概览。',
  },
];

const rows = [
  { catalog_key: 'sp_0030', locale: 'en', localized_name: 'Yellow Cherry Shrimp', status: 'published', review_state: 'approved', index_strategy: 'index', canonical_catalog_key: '' },
  { catalog_key: 'sp_0030', locale: 'zh-CN', localized_name: '', status: 'published', review_state: 'approved', index_strategy: 'index', canonical_catalog_key: '' },
  { catalog_key: 'sp_0031', locale: 'en', localized_name: 'Blue Velvet Shrimp', status: 'published', review_state: 'approved', index_strategy: 'canonical_to_sibling', canonical_catalog_key: 'sp_0030' },
  { catalog_key: 'sp_0164', locale: 'en', localized_name: 'Black Cherry Shrimp', status: 'published', review_state: 'approved', index_strategy: 'noindex', canonical_catalog_key: '' },
];

const snapshot = {
  environment: 'test',
  source_label: 'generator-contract-fixture',
  species_seo_groups: baseRows,
  species_seo: rows,
};

try {
  const { manifest } = await generatePublicSpecies({ snapshot, outDir, siteUrl });
  assert.equal(manifest.generated_pages, 4);
  assert.equal(manifest.indexable_pages, 2);
  assert.equal(manifest.canonical_pages, 1);
  assert.equal(manifest.noindex_pages, 1);

  const englishPath = path.join(outDir, 'species/neocaridina-davidi/sp-0030.html');
  const chinesePath = path.join(outDir, 'zh/species/neocaridina-davidi/sp-0030.html');
  const canonicalPath = path.join(outDir, 'species/neocaridina-davidi/sp-0031.html');
  const noindexPath = path.join(outDir, 'species/neocaridina-davidi/sp-0164.html');
  const [english, chinese, canonical, noindex, sitemap] = await Promise.all([
    readFile(englishPath, 'utf8'), readFile(chinesePath, 'utf8'), readFile(canonicalPath, 'utf8'),
    readFile(noindexPath, 'utf8'), readFile(path.join(outDir, 'sitemap-species.xml'), 'utf8'),
  ]);

  assert.match(english, /<html lang="en">/);
  assert.match(english, /<title>Yellow Cherry Shrimp Care Guide \| AquaGuide<\/title>/);
  assert.match(english, /<meta name="description" content="Learn water, tank and compatibility essentials for Yellow Cherry Shrimp \(Neocaridina davidi\)\.">/);
  assert.match(english, /<meta name="robots" content="index,follow">/);
  assert.match(english, /rel="canonical" href="https:\/\/preview\.aquaguide\.test\/species\/neocaridina-davidi\/sp-0030\.html"/);
  assert.match(english, /hreflang="en" href="https:\/\/preview\.aquaguide\.test\/species\/neocaridina-davidi\/sp-0030\.html"/);
  assert.match(english, /hreflang="zh-CN" href="https:\/\/preview\.aquaguide\.test\/zh\/species\/neocaridina-davidi\/sp-0030\.html"/);
  assert.match(english, /hreflang="x-default" href="https:\/\/preview\.aquaguide\.test\/species\/neocaridina-davidi\/sp-0030\.html"/);
  assert.match(english, /<h1>Yellow Cherry Shrimp Care Guide<\/h1>/);
  assert.match(english, /At least 30 L/);
  assert.match(english, /href="\/encyclopedia\?mode=compatibility&amp;species=sp_0030&amp;source=seo-species"/);
  assert.match(english, /href="\/aquarium\?action=plan-species&amp;species=sp_0030&amp;source=seo-species"/);

  assert.match(chinese, /<html lang="zh-CN">/);
  assert.match(chinese, /<title>黄金米虾饲养指南 \| AquaGuide<\/title>/);
  assert.match(chinese, /<meta name="robots" content="index,follow">/);
  assert.match(chinese, /\/zh\/species\/neocaridina-davidi\/sp-0030\.html/);

  assert.match(canonical, /<meta name="robots" content="index,follow">/);
  assert.match(canonical, /rel="canonical" href="https:\/\/preview\.aquaguide\.test\/species\/neocaridina-davidi\/sp-0030\.html"/);
  assert.match(noindex, /<meta name="robots" content="noindex,follow">/);

  assert.match(sitemap, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(sitemap, /\/species\/neocaridina-davidi\/sp-0030\.html/);
  assert.match(sitemap, /\/zh\/species\/neocaridina-davidi\/sp-0030\.html/);
  assert.doesNotMatch(sitemap, /sp-0031\.html/);
  assert.doesNotMatch(sitemap, /sp-0164\.html/);
  assert.match(sitemap, /hreflang="x-default"/);

  await assert.rejects(
    generatePublicSpecies({ snapshot, outDir: `${outDir}-missing-site` }),
    /siteUrl is required/,
  );

  await assert.rejects(
    generatePublicSpecies({ snapshot, outDir: `${outDir}-production-host`, siteUrl: 'https://aqua-tank-guide.vercel.app' }),
    /Refusing production canonical host/,
  );

  await assert.rejects(
    generatePublicSpecies({ snapshot: { ...snapshot, environment: 'staging' }, outDir: `${outDir}-staging-missing-prod`, siteUrl }),
    /productionSiteUrl is required/,
  );

  const stagingResult = await generatePublicSpecies({
    snapshot: { ...snapshot, environment: 'staging' },
    outDir: `${outDir}-staging-ok`,
    siteUrl,
    productionSiteUrl: 'https://aqua-tank-guide.vercel.app',
  });
  assert.equal(stagingResult.manifest.generated_pages, 4);

  const reviewedAt = '2026-09-01T00:00:00.000Z';
  const approvedDraftSnapshot = structuredClone(snapshot);
  approvedDraftSnapshot.environment = 'staging';
  approvedDraftSnapshot.selected_catalog_keys = ['sp_0030'];
  for (const row of approvedDraftSnapshot.species_seo) {
    row.status = 'draft';
    row.review_state = 'approved';
    row.reviewed_at = reviewedAt;
    row.published_at = null;
  }
  for (const row of approvedDraftSnapshot.species_seo_groups) {
    row.status = 'draft';
    row.review_state = 'approved';
    row.reviewed_at = reviewedAt;
    row.published_at = null;
  }
  const stagingDraftResult = await generatePublicSpecies({
    snapshot: approvedDraftSnapshot,
    outDir: `${outDir}-approved-draft-staging`,
    siteUrl,
    productionSiteUrl: 'https://aqua-tank-guide.vercel.app',
    mode: 'staging_release',
  });
  assert.equal(stagingDraftResult.manifest.generated_pages, 2);
  assert.equal(stagingDraftResult.manifest.indexable_pages, 2);
  assert.equal(stagingDraftResult.manifest.published_input_rows, 0);
  assert.equal(stagingDraftResult.manifest.staging_approved_input_rows, 2);
  const stagingDraftHtml = await readFile(path.join(`${outDir}-approved-draft-staging`, 'species/neocaridina-davidi/sp-0030.html'), 'utf8');
  const stagingDraftSitemap = await readFile(path.join(`${outDir}-approved-draft-staging`, 'sitemap-species.xml'), 'utf8');
  assert.match(stagingDraftHtml, /<meta name="robots" content="index,follow">/);
  assert.doesNotMatch(stagingDraftHtml, /PREVIEW ONLY/);
  assert.match(stagingDraftSitemap, /sp-0030\.html/);

  await assert.rejects(
    generatePublicSpecies({
      snapshot: { ...approvedDraftSnapshot, selected_catalog_keys: [] },
      outDir: `${outDir}-staging-no-selection`, siteUrl,
      productionSiteUrl: 'https://aqua-tank-guide.vercel.app', mode: 'staging_release',
    }),
    /Staging release requires at least one explicit selected catalog key/,
  );

  const releaseFromDraft = await generatePublicSpecies({
    snapshot: approvedDraftSnapshot,
    outDir: `${outDir}-draft-release-refused`, siteUrl,
    productionSiteUrl: 'https://aqua-tank-guide.vercel.app', mode: 'release',
  });
  assert.equal(releaseFromDraft.manifest.generated_pages, 0, 'Production-style release must ignore Approved Draft rows.');

  await assert.rejects(
    generatePublicSpecies({ snapshot: { ...snapshot, environment: 'production' }, outDir: `${outDir}-production`, siteUrl }),
    /Refusing publication snapshot environment: production/,
  );

  const unapprovedSnapshot = structuredClone(snapshot);
  unapprovedSnapshot.species_seo.find((row) => row.catalog_key === 'sp_0030' && row.locale === 'en').review_state = 'ready_for_review';
  await assert.rejects(
    generatePublicSpecies({ snapshot: unapprovedSnapshot, outDir: `${outDir}-unapproved`, siteUrl }),
    /Variant editorial review is not Approved/,
  );

  const draftBaseSnapshot = structuredClone(snapshot);
  draftBaseSnapshot.species_seo_groups.find((row) => row.locale === 'en').status = 'draft';
  await assert.rejects(
    generatePublicSpecies({ snapshot: draftBaseSnapshot, outDir: `${outDir}-draft-base`, siteUrl }),
    /Base Species base:neocaridina-davidi is not Published for en/,
  );

  const brokenCanonicalSnapshot = structuredClone(snapshot);
  brokenCanonicalSnapshot.species_seo.find((row) => row.catalog_key === 'sp_0030' && row.locale === 'en').index_strategy = 'noindex';
  await assert.rejects(
    generatePublicSpecies({ snapshot: brokenCanonicalSnapshot, outDir: `${outDir}-broken-canonical`, siteUrl }),
    /canonical sibling must be an independently indexed target/,
  );

  const malformedIdentitySnapshot = {
    environment: 'test', source_label: 'malformed-source-identity-fixture',
    species_seo_groups: [{
      group_key: 'base:cyprinus-carpio', locale: 'zh-CN', status: 'published', review_state: 'approved',
      seo_title_template: '{{name}}饲养指南 | AquaGuide', meta_description_template: '了解{{name}}的基础饲养要求。',
      h1_template: '{{name}}饲养指南', shared_intro: '基础饲养简介。',
    }],
    species_seo: [{
      catalog_key: 'sp_0069', locale: 'zh-CN', status: 'published', review_state: 'approved',
      index_strategy: 'noindex', canonical_catalog_key: '', image_alt: '红白锦鲤',
    }],
  };
  await assert.rejects(
    generatePublicSpecies({ snapshot: malformedIdentitySnapshot, outDir: `${outDir}-malformed-identity`, siteUrl }),
    /source identity scientific_name is incomplete_suffix: Cyprinus carpio var\./,
  );

  console.log(`Public Species generator verified: ${manifest.generated_pages} pages, ${manifest.indexable_pages} sitemap candidates, production input refused`);
} finally {
  await rm(outDir, { recursive: true, force: true });
  await rm(`${outDir}-missing-site`, { recursive: true, force: true });
  await rm(`${outDir}-production-host`, { recursive: true, force: true });
  await rm(`${outDir}-staging-missing-prod`, { recursive: true, force: true });
  await rm(`${outDir}-staging-ok`, { recursive: true, force: true });
  await rm(`${outDir}-approved-draft-staging`, { recursive: true, force: true });
  await rm(`${outDir}-staging-no-selection`, { recursive: true, force: true });
  await rm(`${outDir}-draft-release-refused`, { recursive: true, force: true });
  await rm(`${outDir}-production`, { recursive: true, force: true });
  await rm(`${outDir}-unapproved`, { recursive: true, force: true });
  await rm(`${outDir}-draft-base`, { recursive: true, force: true });
  await rm(`${outDir}-broken-canonical`, { recursive: true, force: true });
  await rm(`${outDir}-malformed-identity`, { recursive: true, force: true });
}

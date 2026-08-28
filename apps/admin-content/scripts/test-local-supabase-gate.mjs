import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { generatePublicSpecies } from './generate-public-species.mjs';

const statusPath = process.argv[process.argv.indexOf('--status') + 1];
const projectId = process.argv[process.argv.indexOf('--project-id') + 1];
if (!statusPath || !projectId) throw new Error('Usage: node test-local-supabase-gate.mjs --status <supabase-status.json> --project-id <local-project-id>');
const status = JSON.parse(await readFile(statusPath, 'utf8'));
const url = status.API_URL;
const publishableKey = status.PUBLISHABLE_KEY || status.ANON_KEY;
const serviceRoleKey = status.SERVICE_ROLE_KEY;
assert.ok(url && publishableKey && serviceRoleKey, 'Local Supabase status must expose API URL and local-only keys');

const service = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const anonymous = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = `Ci-${stamp}-Aa1!`;
const adminEmail = `admin-${stamp}@aquaguide.test`;
const userEmail = `user-${stamp}@aquaguide.test`;

async function createUser(email) {
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return data.user;
}
async function signIn(email) {
  const client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

const adminUser = await createUser(adminEmail);
const regularUser = await createUser(userEmail);
execFileSync('docker', ['exec', `supabase_db_${projectId}`, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', `update public.user_roles set role='admin' where user_id='${adminUser.id}'::uuid;`], { stdio: 'ignore' });
const admin = await signIn(adminEmail);
const regular = await signIn(userEmail);

const { data: readiness, error: readinessError } = await anonymous.rpc('species_seo_release_gate_status');
if (readinessError) throw readinessError;
assert.equal(readiness.schema_version, 7);
assert.equal(readiness.editorial_review_ready, true);
assert.equal(readiness.data_review_ready, true);
assert.equal(readiness.data_review_resolution_rpc_ready, true);
assert.equal(readiness.revision_history_ready, true);
assert.equal(readiness.restore_rpc_ready, true);

const { error: anonRevisionError } = await anonymous.from('content_revisions').select('id').limit(1);
assert.ok(anonRevisionError, 'Anonymous clients must not read content revisions');
const reviewIssueKey = `ci-review:${stamp}`;
let reviewResult = await regular.from('species_data_reviews').select('*');
if (reviewResult.error) throw reviewResult.error;
assert.equal(reviewResult.data.length, 0, 'Regular users must not read data-review decisions');
reviewResult = await regular.from('species_data_reviews').insert({
  issue_key: reviewIssueKey, issue_type: 'category_conflict', group_key: `ci-review-group:${stamp}`, decision: 'accepted_as_is',
});
assert.ok(reviewResult.error, 'Regular users must not write data-review decisions');
reviewResult = await admin.from('species_data_reviews').insert({
  issue_key: reviewIssueKey, issue_type: 'category_conflict', group_key: `ci-review-group:${stamp}`, decision: 'accepted_as_is', notes: 'CI only',
}).select('*').single();
if (reviewResult.error) throw reviewResult.error;
assert.equal(reviewResult.data.decision, 'accepted_as_is');
const { data: publicResolutions, error: publicResolutionError } = await anonymous.rpc('species_seo_public_review_resolutions');
if (publicResolutionError) throw publicResolutionError;
assert.ok(publicResolutions.some((row) => row.issue_key === reviewIssueKey));
assert.ok(!Object.hasOwn(publicResolutions.find((row) => row.issue_key === reviewIssueKey), 'notes'), 'Public review resolution must not expose notes');

const reviewCatalogKey = `sp_review_${stamp}`;
let reviewStateResult = await admin.from('species_seo').insert({
  catalog_key: reviewCatalogKey, locale: 'en', localized_name: 'Review Fish', seo_title: 'Review Fish',
  meta_description: 'Review meta', h1: 'Review H1', intro: 'Review intro', review_state: 'approved', status: 'draft',
}).select('*').single();
if (reviewStateResult.error) throw reviewStateResult.error;
assert.equal(reviewStateResult.data.review_state, 'editing', 'New content must not enter Approved directly');
reviewStateResult = await admin.from('species_seo').update({ review_state: 'ready_for_review' }).eq('catalog_key', reviewCatalogKey).eq('locale', 'en').select('*').single();
if (reviewStateResult.error) throw reviewStateResult.error;
assert.equal(reviewStateResult.data.review_state, 'ready_for_review');
reviewStateResult = await admin.from('species_seo').update({ review_state: 'approved' }).eq('catalog_key', reviewCatalogKey).eq('locale', 'en').select('*').single();
if (reviewStateResult.error) throw reviewStateResult.error;
assert.equal(reviewStateResult.data.review_state, 'approved');
assert.equal(reviewStateResult.data.reviewed_by, adminUser.id);
assert.ok(reviewStateResult.data.reviewed_at);
reviewStateResult = await admin.from('species_seo').update({ seo_title: 'Review Fish changed' }).eq('catalog_key', reviewCatalogKey).eq('locale', 'en').select('*').single();
if (reviewStateResult.error) throw reviewStateResult.error;
assert.equal(reviewStateResult.data.review_state, 'editing', 'Content changes must invalidate approval');

const syntheticGroupKey = `ci:base:${stamp}`;
const syntheticCatalogKey = `sp_ci_${stamp}`;
let { error } = await admin.from('species_seo_groups').insert({
  group_key: syntheticGroupKey,
  locale: 'en',
  seo_title_template: '{{name}} v1',
  meta_description_template: '{{name}} meta v1',
  h1_template: '{{name}} H1 v1',
  shared_intro: 'Base intro v1',
  status: 'draft',
});
if (error) throw error;
({ error } = await admin.from('species_seo').insert({
  catalog_key: syntheticCatalogKey,
  locale: 'en',
  localized_name: 'CI Fish',
  seo_title: 'CI Fish v1',
  meta_description: 'CI meta v1',
  h1: 'CI H1 v1',
  intro: 'Variant intro v1',
  status: 'draft',
}));
if (error) throw error;
let result = await regular.from('species_seo').select('catalog_key').eq('catalog_key', syntheticCatalogKey);
if (result.error) throw result.error;
assert.equal(result.data.length, 0, 'Regular users must not read Draft Species SEO');
result = await regular.from('species_seo').insert({ catalog_key: `${syntheticCatalogKey}_blocked`, locale: 'en' });
assert.ok(result.error, 'Regular users must not insert Species SEO');

({ error } = await admin.from('species_seo').update({
  seo_title: 'CI Fish v2', status: 'published', published_at: new Date().toISOString(),
}).eq('catalog_key', syntheticCatalogKey).eq('locale', 'en'));
if (error) throw error;
({ error } = await admin.from('species_seo_groups').update({
  seo_title_template: '{{name}} v2', status: 'published', published_at: new Date().toISOString(),
}).eq('group_key', syntheticGroupKey).eq('locale', 'en'));
if (error) throw error;

const { data: variantRevisions, error: variantRevisionError } = await admin
  .from('content_revisions').select('*')
  .eq('resource_type', 'species_seo').eq('resource_key', syntheticCatalogKey)
  .order('version', { ascending: true });
if (variantRevisionError) throw variantRevisionError;
assert.equal(variantRevisions.length, 2);
const variantV1 = variantRevisions[0];
const { data: groupRevisions, error: groupRevisionError } = await admin
  .from('content_revisions').select('*')
  .eq('resource_type', 'species_seo_group').eq('resource_key', syntheticGroupKey)
  .order('version', { ascending: true });
if (groupRevisionError) throw groupRevisionError;
assert.equal(groupRevisions.length, 2);
const groupV1 = groupRevisions[0];

result = await regular.from('content_revisions').select('id').eq('resource_key', syntheticCatalogKey);
if (result.error) throw result.error;
assert.equal(result.data.length, 0, 'Regular users must not read revision history');
result = await regular.rpc('restore_species_seo_revision', { p_revision_id: variantV1.id });
assert.ok(result.error, 'Regular users must not restore revisions');
assert.match(result.error.message, /Admin role required/);

const variantRollback = await admin.rpc('restore_species_seo_revision', { p_revision_id: variantV1.id });
if (variantRollback.error) throw variantRollback.error;
assert.equal(variantRollback.data.status, 'draft');
assert.equal(variantRollback.data.published_at, null);
assert.equal(variantRollback.data.seo_title, 'CI Fish v1');
assert.equal(variantRollback.data.review_state, 'editing');
const groupRollback = await admin.rpc('restore_species_seo_revision', { p_revision_id: groupV1.id });
if (groupRollback.error) throw groupRollback.error;
assert.equal(groupRollback.data.status, 'draft');
assert.equal(groupRollback.data.published_at, null);
assert.equal(groupRollback.data.seo_title_template, '{{name}} v1');
assert.equal(groupRollback.data.review_state, 'editing');

const { data: rollbackRevisions, error: rollbackRevisionError } = await admin
  .from('content_revisions').select('resource_type,resource_key,operation,source_revision_id')
  .in('resource_key', [syntheticCatalogKey, syntheticGroupKey])
  .eq('operation', 'rollback');
if (rollbackRevisionError) throw rollbackRevisionError;
assert.equal(rollbackRevisions.length, 2);
assert.ok(rollbackRevisions.some((row) => row.source_revision_id === variantV1.id));
assert.ok(rollbackRevisions.some((row) => row.source_revision_id === groupV1.id));

// Build one real bilingual publication fixture from the same database.
const realGroupKey = 'base:neocaridina-davidi';
const realCatalogKey = 'sp_0030';
const publishedAt = new Date().toISOString();
const baseFixtures = [
  {
    group_key: realGroupKey, locale: 'en', status: 'published', published_at: publishedAt,
    seo_title_template: '{{name}} Care Guide | AquaGuide',
    meta_description_template: 'Learn water, tank and compatibility essentials for {{name}} ({{base_species}}).',
    h1_template: '{{name}} Care Guide',
    shared_intro: 'A practical care overview grounded in AquaGuide catalog facts.',
  },
  {
    group_key: realGroupKey, locale: 'zh-CN', status: 'published', published_at: publishedAt,
    seo_title_template: '{{name}}饲养指南 | AquaGuide',
    meta_description_template: '了解{{name}}（{{base_species}}）的水温、鱼缸环境与饲养重点。',
    h1_template: '{{name}}饲养指南',
    shared_intro: '基于 AquaGuide 现有物种事实数据整理的饲养概览。',
  },
];
({ error } = await admin.from('species_seo_groups').insert(baseFixtures));
if (error) throw error;
const variantFixtures = [
  {
    catalog_key: realCatalogKey, locale: 'en', localized_name: 'Yellow Cherry Shrimp',
    status: 'published', published_at: publishedAt, index_strategy: 'index', canonical_catalog_key: '',
  },
  {
    catalog_key: realCatalogKey, locale: 'zh-CN', localized_name: '',
    status: 'published', published_at: publishedAt, index_strategy: 'index', canonical_catalog_key: '',
  },
];
({ error } = await admin.from('species_seo').insert(variantFixtures));
if (error) throw error;
({ error } = await admin.from('species_seo_groups').update({ review_state: 'approved' }).eq('group_key', realGroupKey));
if (error) throw error;
({ error } = await admin.from('species_seo').update({ review_state: 'approved' }).eq('catalog_key', realCatalogKey));
if (error) throw error;

const { data: publicVariants, error: publicVariantError } = await anonymous
  .from('species_seo').select('*').eq('catalog_key', realCatalogKey).order('locale');
if (publicVariantError) throw publicVariantError;
assert.equal(publicVariants.length, 2, 'Published bilingual Variant rows must be publicly readable');
const { data: publicGroups, error: publicGroupError } = await anonymous
  .from('species_seo_groups').select('*').eq('group_key', realGroupKey).order('locale');
if (publicGroupError) throw publicGroupError;
assert.equal(publicGroups.length, 2, 'Published bilingual Base rows must be publicly readable');
const outDir = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-admin-ci-pages-'));
try {
  const snapshot = {
    environment: 'test',
    source_label: 'ephemeral-supabase-ci',
    species_seo: publicVariants,
    species_seo_groups: publicGroups,
    data_review_resolutions: publicResolutions,
  };
  const { manifest } = await generatePublicSpecies({
    snapshot,
    outDir,
    siteUrl: 'https://ci-preview.aquaguide.test',
  });
  assert.equal(manifest.generated_pages, 2);
  assert.equal(manifest.indexable_pages, 2);
  const [english, chinese, sitemap] = await Promise.all([
    readFile(path.join(outDir, 'species/neocaridina-davidi/sp-0030.html'), 'utf8'),
    readFile(path.join(outDir, 'zh/species/neocaridina-davidi/sp-0030.html'), 'utf8'),
    readFile(path.join(outDir, 'sitemap-species.xml'), 'utf8'),
  ]);
  assert.match(english, /<html lang="en">/);
  assert.match(english, /Yellow Cherry Shrimp Care Guide/);
  assert.match(english, /ci-preview\.aquaguide\.test/);
  assert.match(english, /hreflang="zh-CN"/);
  assert.match(chinese, /<html lang="zh-CN">/);
  assert.match(chinese, /黄金米虾饲养指南/);
  assert.match(sitemap, /sp-0030\.html/);
} finally {
  await rm(outDir, { recursive: true, force: true });
}
console.log(JSON.stringify({
  gate: 'PASS',
  schema_version: readiness.schema_version,
  regular_draft_visibility: 0,
  rollback_revisions: rollbackRevisions.length,
  generated_pages: 2,
  indexable_pages: 2,
}));

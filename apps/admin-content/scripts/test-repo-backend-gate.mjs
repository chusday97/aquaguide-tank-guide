import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { generatePublicSpecies } from './generate-public-species.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'aquaguide-repo-admin-'));
const storePath = path.join(root, 'admin-store.json');
const stagingPath = path.join(root, 'staging-snapshot.json');
const outputPath = path.join(root, 'pages');
process.env.ADMIN_REPO_LOCAL_FILE = storePath;
process.env.ADMIN_REPO_LOCAL_STAGING_FILE = stagingPath;
process.env.ADMIN_REPO_EMAIL = 'repo-admin@aquaguide.test';
process.env.ADMIN_REPO_PASSWORD = 'Repo-Test-Only-42!';
process.env.ADMIN_REPO_SESSION_SECRET = 'repo-test-session-secret-0123456789abcdef';

await writeFile(storePath, `${JSON.stringify({
  schema_version: 1, updated_at: null, species_seo: [], species_seo_groups: [], species_data_reviews: [], content_revisions: [], admin_activity_log: [],
}, null, 2)}\n`, 'utf8');

const { authenticateCredentials, createSessionToken, readSessionToken } = await import('../../../server/admin-repo/auth.mjs');
const { executeRepoOperation, publishRepoStagingSelection } = await import('../../../server/admin-repo/store.mjs');

const auth = authenticateCredentials('repo-admin@aquaguide.test', 'Repo-Test-Only-42!');
assert.equal(auth.ok, true);
assert.equal(readSessionToken(createSessionToken(auth.user))?.user?.email, 'repo-admin@aquaguide.test');
assert.equal(authenticateCredentials('repo-admin@aquaguide.test', 'wrong').ok, false);

const groupKey = 'base:apistogramma-cacatuoides';
const catalogKey = 'sp_0273';
const baseRows = [
  { group_key: groupKey, locale: 'en', seo_title_template: '{{name}} Care Guide | AquaGuide', meta_description_template: '{{name}} aquarium care guide.', h1_template: '{{name}} Care Guide', shared_intro: 'Repository-backed Base intro.', status: 'draft', review_state: 'editing' },
  { group_key: groupKey, locale: 'zh-CN', seo_title_template: '{{name}}饲养指南 | AquaGuide', meta_description_template: '{{name}}水族饲养指南。', h1_template: '{{name}}饲养指南', shared_intro: 'Repo 内容源 Base 简介。', status: 'draft', review_state: 'editing' },
];
const variants = [
  { catalog_key: catalogKey, locale: 'en', localized_name: 'Cockatoo Dwarf Cichlid', seo_title: '', meta_description: '', h1: 'Initial Repo H1', intro: 'English repo Variant intro.', image_alt: 'Cockatoo Dwarf Cichlid', index_strategy: 'index', canonical_catalog_key: '', status: 'draft', review_state: 'editing' },
  { catalog_key: catalogKey, locale: 'zh-CN', localized_name: '', seo_title: '', meta_description: '', h1: '', intro: '中文 Repo Variant 简介。', image_alt: '血钻短鲷', index_strategy: 'index', canonical_catalog_key: '', status: 'draft', review_state: 'editing' },
];

let result = await executeRepoOperation({ action: 'upsert', table: 'species_seo_groups', values: baseRows });
assert.equal(result.error, null);
result = await executeRepoOperation({ action: 'update', table: 'species_seo_groups', values: { review_state: 'approved' }, filters: [{ type: 'eq', column: 'group_key', value: groupKey }] });
assert.equal(result.data.every((row) => row.review_state === 'approved' && row.status === 'draft'), true);
result = await executeRepoOperation({ action: 'upsert', table: 'species_seo', values: variants });
assert.equal(result.error, null);
result = await executeRepoOperation({ action: 'update', table: 'species_seo', values: { review_state: 'approved' }, filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }] });
assert.equal(result.data.every((row) => row.review_state === 'approved' && row.status === 'draft'), true);

result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { h1: 'Repo-backed H1 Changed' },
  filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }, { type: 'eq', column: 'locale', value: 'en' }],
  singleMode: 'single',
});
assert.equal(result.data.review_state, 'editing', 'Content edits must invalidate approval in repo mode.');
assert.equal(result.data.status, 'draft', 'Repo Admin must never unlock Production Published.');
await assert.rejects(
  publishRepoStagingSelection({ catalogKeys: [catalogKey], groupKeys: [groupKey] }),
  /both zh-CN and en/,
);

result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { review_state: 'approved' },
  filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }, { type: 'eq', column: 'locale', value: 'en' }],
  singleMode: 'single',
});
assert.equal(result.data.review_state, 'approved');
assert.ok(result.data.reviewed_at);

result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { h1: 'Red Cherry Shrimp Care Guide | Dual-Repo Staging' },
  filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }, { type: 'eq', column: 'locale', value: 'en' }], singleMode: 'single',
});
assert.equal(result.error, null);
assert.equal(result.data.review_state, 'editing');
result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { review_state: 'approved' },
  filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }, { type: 'eq', column: 'locale', value: 'en' }], singleMode: 'single',
});
assert.match(result.error?.message || '', /Content hygiene blocked review/, 'Repo API must reject approving acceptance/test copy.');
const legacyDirtyStore = JSON.parse(await readFile(storePath, 'utf8'));
const legacyDirtyRow = legacyDirtyStore.species_seo.find((row) => row.catalog_key === catalogKey && row.locale === 'en');
legacyDirtyRow.review_state = 'approved';
legacyDirtyRow.reviewed_at = new Date().toISOString();
legacyDirtyRow.reviewed_by = 'legacy-fixture';
await writeFile(storePath, `${JSON.stringify(legacyDirtyStore, null, 2)}\n`, 'utf8');
await assert.rejects(
  publishRepoStagingSelection({ catalogKeys: [catalogKey], groupKeys: [groupKey] }),
  /Staging blocked by test\/acceptance wording/,
  'Staging must reject legacy Approved rows containing acceptance/test copy.',
);
result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { h1: 'Repo-backed H1 Changed' },
  filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }, { type: 'eq', column: 'locale', value: 'en' }], singleMode: 'single',
});
assert.equal(result.error, null);
result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { review_state: 'approved' },
  filters: [{ type: 'eq', column: 'catalog_key', value: catalogKey }, { type: 'eq', column: 'locale', value: 'en' }], singleMode: 'single',
});
assert.equal(result.error, null);
assert.equal(result.data.review_state, 'approved');

const duplicateA = 'sp_test_duplicate_a';
const duplicateB = 'sp_test_duplicate_b';
result = await executeRepoOperation({ action: 'upsert', table: 'species_seo', values: [
  { catalog_key: duplicateA, locale: 'en', localized_name: 'Duplicate A', image_alt: 'Duplicate A', index_strategy: 'noindex', canonical_catalog_key: '', status: 'draft', review_state: 'approved' },
  { catalog_key: duplicateB, locale: 'en', localized_name: 'Duplicate B', image_alt: 'Duplicate B', index_strategy: 'noindex', canonical_catalog_key: '', status: 'draft', review_state: 'approved' },
] });
assert.equal(result.error, null);
const activityBeforeDuplicate = (await executeRepoOperation({ action: 'select', table: 'admin_activity_log', filters: [] })).data.length;
result = await executeRepoOperation({ action: 'rpc', rpc: 'resolve_species_duplicate_review', args: {
  p_issue_key: 'duplicate:test-pair', p_group_key: 'base:test-pair', p_decision: 'duplicate_records',
  p_canonical_catalog_key: duplicateA, p_member_ids: [duplicateA, duplicateB], p_notes: 'contract fixture',
} });
assert.equal(result.error, null);
assert.equal(result.data.review.decision, 'duplicate_records');
assert.equal(result.data.seo_rows.find((row) => row.catalog_key === duplicateA).index_strategy, 'index');
assert.equal(result.data.seo_rows.find((row) => row.catalog_key === duplicateB).index_strategy, 'canonical_to_sibling');
assert.equal(result.data.seo_rows.find((row) => row.catalog_key === duplicateB).canonical_catalog_key, duplicateA);
const activityAfterDuplicate = (await executeRepoOperation({ action: 'select', table: 'admin_activity_log', filters: [] })).data;
assert.equal(activityAfterDuplicate.length, activityBeforeDuplicate + 1, 'One duplicate-review action must create exactly one activity record.');
assert.equal(activityAfterDuplicate.at(-1).kind, 'duplicate_review');

const bulkPairs = [
  ['sp_test_bulk_a', 'sp_test_bulk_b', 'duplicate:test-bulk-1', 'base:test-bulk-1'],
  ['sp_test_bulk_c', 'sp_test_bulk_d', 'duplicate:test-bulk-2', 'base:test-bulk-2'],
];
result = await executeRepoOperation({ action: 'upsert', table: 'species_seo', values: bulkPairs.flatMap(([a, b]) => [
  { catalog_key: a, locale: 'en', localized_name: a, image_alt: a, index_strategy: 'noindex', canonical_catalog_key: '', status: 'draft', review_state: 'editing' },
  { catalog_key: b, locale: 'en', localized_name: b, image_alt: b, index_strategy: 'noindex', canonical_catalog_key: '', status: 'draft', review_state: 'editing' },
]) });
assert.equal(result.error, null);
const activityBeforeBulkReview = (await executeRepoOperation({ action: 'select', table: 'admin_activity_log', filters: [] })).data.length;
result = await executeRepoOperation({ action: 'rpc', rpc: 'resolve_species_duplicate_reviews_bulk', args: { p_reviews: bulkPairs.map(([a, b, issue, group]) => ({
  p_issue_key: issue, p_group_key: group, p_decision: 'duplicate_records', p_canonical_catalog_key: a, p_member_ids: [a, b], p_notes: 'bulk contract fixture',
})) } });
assert.equal(result.error, null);
assert.equal(result.data.reviews.length, 2, 'Bulk duplicate review must resolve every selected issue.');
assert.equal(result.data.seo_rows.filter((row) => row.index_strategy === 'canonical_to_sibling').length, 2, 'Bulk duplicate review must align duplicate sibling canonical policies.');
const activityAfterBulkReview = (await executeRepoOperation({ action: 'select', table: 'admin_activity_log', filters: [] })).data;
assert.equal(activityAfterBulkReview.length, activityBeforeBulkReview + 1, 'One bulk duplicate-review action must create exactly one activity record.');
assert.equal(activityAfterBulkReview.at(-1).kind, 'duplicate_review_bulk');
const reviewCountBeforeInvalidBulk = (await executeRepoOperation({ action: 'select', table: 'species_data_reviews', filters: [] })).data.length;
result = await executeRepoOperation({ action: 'rpc', rpc: 'resolve_species_duplicate_reviews_bulk', args: { p_reviews: [
  { p_issue_key: 'duplicate:atomic-valid', p_group_key: 'base:atomic-valid', p_decision: 'distinct_records', p_canonical_catalog_key: '', p_member_ids: ['atomic_a', 'atomic_b'], p_notes: '' },
  { p_issue_key: 'duplicate:atomic-invalid', p_group_key: 'base:atomic-invalid', p_decision: 'duplicate_records', p_canonical_catalog_key: 'missing', p_member_ids: ['atomic_c', 'atomic_d'], p_notes: '' },
] } });
assert.match(result.error?.message || '', /Canonical Species must belong/, 'Invalid issue must fail the whole bulk duplicate-review operation.');
const reviewCountAfterInvalidBulk = (await executeRepoOperation({ action: 'select', table: 'species_data_reviews', filters: [] })).data.length;
assert.equal(reviewCountAfterInvalidBulk, reviewCountBeforeInvalidBulk, 'Failed bulk duplicate review must be atomic and persist no partial decisions.');

const editorialGroup = 'base:test-editorial-bulk';
const editorialPages = ['sp_test_editorial_a', 'sp_test_editorial_b'];
result = await executeRepoOperation({ action: 'upsert', table: 'species_seo_groups', values: {
  group_key: editorialGroup, locale: 'zh-CN', seo_title_template: '{{name}}饲养指南', meta_description_template: '{{name}}水族饲养指南',
  h1_template: '{{name}}饲养指南', shared_intro: '干净的批量审核基础模板。', status: 'draft', review_state: 'editing',
} });
assert.equal(result.error, null);
result = await executeRepoOperation({ action: 'upsert', table: 'species_seo', values: editorialPages.map((catalog_key) => ({
  catalog_key, locale: 'zh-CN', localized_name: '', seo_title: `${catalog_key} SEO`, meta_description: `${catalog_key} 描述`, h1: `${catalog_key} 饲养指南`,
  intro: `${catalog_key} 页面简介`, image_alt: `${catalog_key} 图片`, index_strategy: 'noindex', canonical_catalog_key: '', status: 'draft', review_state: 'editing',
})) });
assert.equal(result.error, null);
const editorialItems = [
  ...editorialPages.map((resource_key) => ({ resource_type: 'species_seo', resource_key, locale: 'zh-CN' })),
  { resource_type: 'species_seo_groups', resource_key: editorialGroup, locale: 'zh-CN' },
];
const activityBeforeEditorial = (await executeRepoOperation({ action: 'select', table: 'admin_activity_log', filters: [] })).data.length;
result = await executeRepoOperation({ action: 'rpc', rpc: 'transition_editorial_reviews_bulk', args: { p_target_state: 'ready_for_review', p_items: editorialItems } });
assert.equal(result.error, null);
assert.equal(result.data.species_seo.length, 2);
assert.ok(result.data.species_seo.every((row) => row.review_state === 'ready_for_review'));
assert.equal(result.data.species_seo_groups[0].review_state, 'ready_for_review');
const activityAfterEditorialSubmit = (await executeRepoOperation({ action: 'select', table: 'admin_activity_log', filters: [] })).data;
assert.equal(activityAfterEditorialSubmit.length, activityBeforeEditorial + 1, 'Bulk editorial submit must create exactly one activity record.');
assert.equal(activityAfterEditorialSubmit.at(-1).kind, 'editorial_review_bulk');

result = await executeRepoOperation({ action: 'rpc', rpc: 'transition_editorial_reviews_bulk', args: { p_target_state: 'approved', p_items: editorialItems } });
assert.equal(result.error, null);
assert.ok(result.data.species_seo.every((row) => row.review_state === 'approved'));
assert.equal(result.data.species_seo_groups[0].review_state, 'approved');
const editorialApprovedBeforeAtomicFailure = (await executeRepoOperation({ action: 'select', table: 'species_seo', filters: [{ type: 'eq', column: 'catalog_key', value: editorialPages[0] }] })).data[0];
result = await executeRepoOperation({ action: 'rpc', rpc: 'transition_editorial_reviews_bulk', args: { p_target_state: 'editing', p_items: [
  { resource_type: 'species_seo', resource_key: editorialPages[0], locale: 'zh-CN' },
  { resource_type: 'species_seo', resource_key: 'sp_missing_editorial', locale: 'zh-CN' },
] } });
assert.match(result.error?.message || '', /resource not found/, 'Invalid bulk editorial item must fail the entire operation.');
const editorialAfterAtomicFailure = (await executeRepoOperation({ action: 'select', table: 'species_seo', filters: [{ type: 'eq', column: 'catalog_key', value: editorialPages[0] }] })).data[0];
assert.equal(editorialAfterAtomicFailure.review_state, editorialApprovedBeforeAtomicFailure.review_state, 'Failed bulk editorial review must persist no partial review-state changes.');
result = await executeRepoOperation({ action: 'rpc', rpc: 'transition_editorial_reviews_bulk', args: { p_target_state: 'editing', p_items: editorialItems } });
assert.equal(result.error, null);
result = await executeRepoOperation({ action: 'update', table: 'species_seo', values: { h1: 'Temporary acceptance test copy' }, filters: [
  { type: 'eq', column: 'catalog_key', value: editorialPages[1] }, { type: 'eq', column: 'locale', value: 'zh-CN' },
], singleMode: 'single' });
assert.equal(result.error, null);
result = await executeRepoOperation({ action: 'rpc', rpc: 'transition_editorial_reviews_bulk', args: { p_target_state: 'ready_for_review', p_items: editorialItems } });
assert.match(result.error?.message || '', /Content hygiene blocked review/, 'Bulk editorial submit must preserve the content-hygiene gate.');
const cleanEditorialAfterDirtyFailure = (await executeRepoOperation({ action: 'select', table: 'species_seo', filters: [{ type: 'eq', column: 'catalog_key', value: editorialPages[0] }] })).data[0];
assert.equal(cleanEditorialAfterDirtyFailure.review_state, 'editing', 'A dirty row must fail the whole bulk submit without advancing clean siblings.');

result = await executeRepoOperation({
  action: 'upsert', table: 'species_seo', values: {
    catalog_key: duplicateB, locale: 'en', localized_name: 'Attempted bypass', image_alt: 'Attempted bypass',
    index_strategy: 'index', canonical_catalog_key: '', status: 'draft', review_state: 'editing',
  }, singleMode: 'single',
});
assert.equal(result.error, null);
assert.equal(result.data.index_strategy, 'canonical_to_sibling', 'Generic Repo writes must not bypass a resolved duplicate policy.');
assert.equal(result.data.canonical_catalog_key, duplicateA);
result = await executeRepoOperation({
  action: 'update', table: 'species_seo', values: { index_strategy: 'noindex', canonical_catalog_key: '' },
  filters: [{ type: 'eq', column: 'catalog_key', value: duplicateA }], singleMode: 'single',
});
assert.equal(result.data.index_strategy, 'index', 'Canonical source policy must remain authoritative on generic updates.');

result = await executeRepoOperation({ action: 'rpc', rpc: 'resolve_species_duplicate_review', args: {
  p_issue_key: 'duplicate:test-pair', p_group_key: 'base:test-pair', p_decision: 'distinct_records',
  p_canonical_catalog_key: '', p_member_ids: [duplicateA, duplicateB], p_notes: 'changed decision',
} });
assert.equal(result.error, null);
assert.ok(result.data.seo_rows.every((row) => row.index_strategy === 'noindex' && !row.canonical_catalog_key), 'Changing to distinct records must clear stale canonical policy fail-closed.');

const published = await publishRepoStagingSelection({ catalogKeys: [catalogKey], groupKeys: [groupKey] });
assert.equal(published.snapshot.delivery_mode, 'staging_release');
assert.deepEqual(published.snapshot.selected_catalog_keys, [catalogKey]);
assert.equal(published.snapshot.species_seo.length, 2);
assert.ok(published.snapshot.species_seo.every((row) => !Object.hasOwn(row, 'reviewed_by')));
const diskSnapshot = JSON.parse(await readFile(stagingPath, 'utf8'));
assert.equal(diskSnapshot.species_seo.find((row) => row.locale === 'en').h1, 'Repo-backed H1 Changed');

const generated = await generatePublicSpecies({
  snapshot: diskSnapshot,
  outDir: outputPath,
  siteUrl: 'https://repo-preview.aquaguide.test',
  productionSiteUrl: 'https://aqua-tank-guide.vercel.app',
  mode: 'staging_release',
});
assert.equal(generated.manifest.generated_pages, 2);
assert.equal(generated.manifest.indexable_pages, 2);
const englishPage = generated.pages.find((page) => page.row.locale === 'en');
const englishHtml = await readFile(path.join(outputPath, englishPage.routeMeta.selfPath.replace(/^\//, '')), 'utf8');
assert.match(englishHtml, /<h1>Repo-backed H1 Changed<\/h1>/);
assert.match(englishHtml, /source=seo-species/);

const releaseOutput = path.join(root, 'production-style-release');
const productionStyle = await generatePublicSpecies({
  snapshot: { ...diskSnapshot, environment: 'test' }, outDir: releaseOutput,
  siteUrl: 'https://repo-preview.aquaguide.test', mode: 'release',
});
assert.equal(productionStyle.manifest.generated_pages, 0, 'Approved Draft must remain invisible to Production-style release mode.');

const persisted = JSON.parse(await readFile(storePath, 'utf8'));
assert.equal(persisted.schema_version, 2, 'Repo store must migrate activity logging to schema v2 on the next write.');
assert.ok(persisted.content_revisions.length >= 6, 'Repo store must retain revision snapshots.');
assert.ok(persisted.admin_activity_log.length >= 5, 'Repo store must retain admin operation history without a second logging write.');
assert.ok(persisted.admin_activity_log.some((row) => row.kind === 'review_approved'), 'Review actions must be represented in the operation log.');
assert.ok(persisted.species_seo.every((row) => row.status === 'draft'));
console.log(JSON.stringify({ gate: 'PASS', backend: 'github-repo', supabase_started: false, staging_pages: generated.manifest.generated_pages, revisions: persisted.content_revisions.length }));
await rm(root, { recursive: true, force: true });

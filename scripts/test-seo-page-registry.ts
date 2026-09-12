import assert from 'node:assert/strict';
import {
  buildCareRegistryEntries,
  buildSpeciesRegistryEntries,
  deriveSeoHealth,
  summarizeSeoRegistry,
} from '../src/services/admin/seo-page-registry.service';

const speciesRows = [
  { catalog_key: 'sp_0001', locale: 'zh-CN' as const, review_state: 'approved' as const, index_strategy: 'index' as const },
  { catalog_key: 'sp_0001', locale: 'en' as const, review_state: 'approved' as const, index_strategy: 'noindex' as const },
];
const speciesGroupRows = [
  { group_key: 'base:neocaridina-davidi', locale: 'zh-CN' as const, review_state: 'approved' as const },
  { group_key: 'base:neocaridina-davidi', locale: 'en' as const, review_state: 'approved' as const },
];
const species = buildSpeciesRegistryEntries(speciesRows, speciesGroupRows);

assert.equal(species.length, 972, '486 Species must register one zh-CN and one EN page candidate');
assert.equal(new Set(species.map(item => item.pageKey)).size, species.length, 'SEO page keys must be unique');
const zh = species.find(item => item.pageKey === 'species:sp_0001:zh-CN');
assert.equal(zh?.editorialState, 'approved');
assert.equal(zh?.indexStrategy, 'index');
assert.equal(zh?.health.severity, 'healthy', 'Inherited Base SEO must count as effective Meta/H1 content instead of being falsely marked missing');
assert.deepEqual(zh?.health.issues, []);
assert.match(zh?.editorHref || '', /\/admin\/seo\/\?species=sp_0001&locale=zh-CN/);

const missingPair = buildSpeciesRegistryEntries(
  [speciesRows[0]],
  [speciesGroupRows[0]],
).find(item => item.pageKey === 'species:sp_0001:zh-CN');
assert.ok(missingPair?.health.issues.includes('missing_bilingual_pair'), 'Index page without an approved bilingual pair must be flagged');
assert.equal(missingPair?.health.severity, 'blocked');

const canonicalConflict = buildSpeciesRegistryEntries(
  [{ ...speciesRows[0], index_strategy: 'canonical_to_sibling' as const, canonical_catalog_key: 'sp_0001' }],
  speciesGroupRows,
).find(item => item.pageKey === 'species:sp_0001:zh-CN');
assert.ok(canonicalConflict?.health.issues.includes('canonical_conflict'), 'Self-referencing canonical target must be blocked');
assert.equal(canonicalConflict?.health.severity, 'blocked');

const whitespaceHealth = deriveSeoHealth({
  pageKey: 'species:test:en', pageType: 'species', locale: 'en', label: 'Test', sourceAuthority: 'product_catalog',
  sourceKey: 'test', editorialAuthority: 'species_seo_repo', editorialState: 'approved', indexStrategy: 'noindex', editorHref: '',
  editorialContentKnown: true, meta_title: '   ', meta_description: '\n', h1: '\t',
});
assert.deepEqual(whitespaceHealth.issues, ['missing_meta_title', 'missing_meta_description', 'missing_h1']);
assert.equal(whitespaceHealth.severity, 'blocked');

const careArticle = {
  id: '11111111-1111-1111-1111-111111111111',
  catalogKey: 'care_demo', title: 'Demo Care', category: 'health', urgency: '日常', summary: 'summary',
  symptoms: [], avoidActions: [], observeItems: [], diagnoseWhen: [], nextStep: '', keywords: [],
  status: 'draft', version: 3, careArticleSteps: [],
} as any;
const careEditorial = (locale: 'zh-CN' | 'en', sourceDrift = false) => ({
  id: locale === 'zh-CN' ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' : 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  sourceCareId: careArticle.id,
  sourceCareCatalogKey: careArticle.catalogKey,
  sourceCareVersion: sourceDrift ? 1 : 2,
  locale,
  revisionNumber: 1,
  version: 1,
  reviewState: 'approved' as const,
  indexStrategy: 'noindex' as const,
  seoTitle: locale === 'zh-CN' ? '白点病处理指南' : 'Ich Care Guide',
  metaDescription: locale === 'zh-CN' ? '白点病护理与观察重点。' : 'Care and observation guidance for ich.',
  h1: locale === 'zh-CN' ? '白点病处理指南' : 'Ich Care Guide',
  focusKeyword: locale === 'zh-CN' ? '白点病' : 'ich care',
  sourceDrift,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
});
const careHealthIndex = (['zh-CN', 'en'] as const).map(locale => ({
  sourceCareId: careArticle.id,
  sourceCareCatalogKey: careArticle.catalogKey,
  sourceCareVersion: 2,
  sourceAuthority: 'publication-snapshot' as const,
  locale,
  persistenceAvailable: true,
  editorial: careEditorial(locale),
}));
const care = buildCareRegistryEntries([careArticle], careHealthIndex);

assert.equal(care.length, 2, 'Care must register one page per supported locale');
assert.ok(care.every(item => item.sourceAuthority === 'published_care'));
assert.ok(care.every(item => item.editorialAuthority === 'care_seo_editorial'));
assert.ok(care.every(item => item.editorialState === 'approved'));
assert.ok(care.every(item => item.indexStrategy === 'noindex'), 'Current Care SEO release decision must remain noindex');
assert.ok(care.every(item => item.health.severity === 'healthy'));
assert.ok(care.every(item => !item.health.issues.includes('source_not_published')), 'Editable Care may be Draft while the immutable Published snapshot remains authoritative');
assert.match(care[1]?.editorHref || '', /type=care/);
assert.match(care[1]?.editorHref || '', /seo=1/);

const missingCarePair = buildCareRegistryEntries([careArticle], [
  careHealthIndex[0],
  { ...careHealthIndex[1], editorial: null },
]);
assert.ok(missingCarePair[0]?.health.issues.includes('missing_bilingual_pair'));
assert.equal(missingCarePair[0]?.health.severity, 'attention', 'Noindex Care bilingual incompleteness is actionable but not an index blocker');

const unavailableCareCounterpart = buildCareRegistryEntries([careArticle], [
  careHealthIndex[0],
  { ...careHealthIndex[1], persistenceAvailable: false, editorial: null },
]);
assert.equal(unavailableCareCounterpart[0]?.health.issues.includes('missing_bilingual_pair'), false, 'An unavailable counterpart authority must not create a fake bilingual completion task.');

const driftedCare = buildCareRegistryEntries([careArticle], [
  { ...careHealthIndex[0], editorial: careEditorial('zh-CN', true) },
  careHealthIndex[1],
]);
assert.ok(driftedCare[0]?.health.issues.includes('source_drift'));
assert.equal(driftedCare[0]?.health.severity, 'blocked');

const legacyCare = buildCareRegistryEntries([careArticle], careHealthIndex.map(row => ({ ...row, sourceAuthority: 'legacy-published' as const })));
assert.ok(legacyCare.every(item => item.health.issues.includes('source_not_snapshot')));
assert.ok(legacyCare.every(item => item.health.severity === 'blocked'));

const unpublishedCare = buildCareRegistryEntries([{
  ...careArticle,
  id: '22222222-2222-2222-2222-222222222222',
  catalogKey: 'care_draft',
}], []);
assert.ok(unpublishedCare.every(item => item.health.issues.includes('source_not_published')));
assert.ok(unpublishedCare.every(item => item.health.severity === 'blocked'));

const unknownCare = buildCareRegistryEntries([careArticle], null);
assert.ok(unknownCare.every(item => item.health.severity === 'unknown'));

const summary = summarizeSeoRegistry([...species.slice(0, 4), ...unknownCare]);
assert.equal(summary.total, 6);
assert.equal(summary.byType.species, 4);
assert.equal(summary.byType.care, 2);
assert.equal(summary.needsAttention, 2, 'Unknown Care state must not be misreported as actionable editorial work');
assert.equal(summary.healthCounts.healthy, 2);
assert.equal(summary.healthCounts.unknown, 2);
assert.equal(summary.priorityQueue.healthy, 0, 'Priority queue excludes healthy rows by design');
assert.equal(summary.priorityQueue.unknown, 2);

const futureTypes = ['compatibility', 'product_feature', 'guide', 'category'];
assert.equal(futureTypes.length, 4, 'Registry reserves future page types without inventing rows');

console.log(JSON.stringify({
  gate: 'PASS',
  speciesCandidates: species.length,
  careCandidates: care.length,
  uniqueKeys: new Set(species.map(item => item.pageKey)).size,
}));

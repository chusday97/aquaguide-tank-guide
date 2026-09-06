import assert from 'node:assert/strict';
import {
  buildCareRegistryEntries,
  buildSpeciesRegistryEntries,
  summarizeSeoRegistry,
} from '../src/services/admin/seo-page-registry.service';

const species = buildSpeciesRegistryEntries([
  { catalog_key: 'sp_0001', locale: 'zh-CN', review_state: 'approved', index_strategy: 'index' },
  { catalog_key: 'sp_0001', locale: 'en', review_state: 'ready_for_review', index_strategy: 'noindex' },
]);

assert.equal(species.length, 972, '486 Species must register one zh-CN and one EN page candidate');
assert.equal(new Set(species.map(item => item.pageKey)).size, species.length, 'SEO page keys must be unique');
const zh = species.find(item => item.pageKey === 'species:sp_0001:zh-CN');
assert.equal(zh?.editorialState, 'approved');
assert.equal(zh?.indexStrategy, 'index');
assert.match(zh?.editorHref || '', /\/admin\/seo\/\?species=sp_0001&locale=zh-CN/);

const care = buildCareRegistryEntries([{
  id: '11111111-1111-1111-1111-111111111111',
  catalogKey: 'care_demo', title: 'Demo Care', category: 'health', urgency: '日常', summary: 'summary',
  symptoms: [], avoidActions: [], observeItems: [], diagnoseWhen: [], nextStep: '', keywords: [],
  status: 'published', version: 2, careArticleSteps: [],
} as any]);

assert.equal(care.length, 2, 'Care must register one page per supported locale');
assert.ok(care.every(item => item.sourceAuthority === 'published_care'));
assert.ok(care.every(item => item.editorialAuthority === 'care_seo_editorial'));
assert.ok(care.every(item => item.indexStrategy === 'noindex'), 'Current Care SEO release decision must remain noindex');
assert.match(care[1]?.editorHref || '', /type=care/);
assert.match(care[1]?.editorHref || '', /seo=1/);

const summary = summarizeSeoRegistry([...species.slice(0, 4), ...care]);
assert.equal(summary.total, 6);
assert.equal(summary.byType.species, 4);
assert.equal(summary.byType.care, 2);
assert.equal(summary.needsAttention, 3, 'Unknown Care state must not be misreported as actionable editorial work');

const futureTypes = ['compatibility', 'product_feature', 'guide', 'category'];
assert.equal(futureTypes.length, 4, 'Registry reserves future page types without inventing rows');

console.log(JSON.stringify({
  gate: 'PASS',
  speciesCandidates: species.length,
  careCandidates: care.length,
  uniqueKeys: new Set(species.map(item => item.pageKey)).size,
}));

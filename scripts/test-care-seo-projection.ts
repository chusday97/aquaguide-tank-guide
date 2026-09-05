import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CareArticleDetailDto } from '../packages/contracts/src/index';
import { buildCareSeoProjection } from '../apps/api/src/care-seo-projection';

const detail: CareArticleDetailDto = {
  id: 'be1732a3-27d0-4820-986c-2e932990f571',
  catalogKey: 'care_demo',
  title: '换水后鱼只异常怎么办',
  category: '水质',
  urgency: '尽快处理',
  summary: '换水后先观察呼吸、游姿和水温，不要立即叠加药物处理。',
  keywords: ['换水应激', '鱼只异常'],
  symptoms: ['呼吸急促'],
  avoidActions: ['不要立即加药'],
  observeItems: ['呼吸', '游姿'],
  diagnoseWhen: ['持续异常超过 30 分钟'],
  nextStep: '持续异常时进入进一步诊断。',
  steps: [{ id: 'step-1', position: 1, instruction: '先观察 10 分钟', actionTitle: '观察状态', actionKind: 'immediate' }],
  references: [{ id: 'ref-1', supportSummary: 'support', source: { id: 'src-1', title: 'Care source', publisher: 'Aqua', url: 'https://example.test/care', sourceType: 'curated_husbandry', reviewStatus: 'reviewed' } }],
  assets: [],
  updatedAt: '2026-09-05T00:00:00.000Z',
  localization: { requestedLocale: 'zh-CN', resolvedLocale: 'zh-CN', usedFallback: false },
};
const projection = buildCareSeoProjection(
  detail,
  7,
  '2026-09-05T01:00:00.000Z',
  'publication-snapshot',
  'zh-CN',
);

assert.equal(projection.sourceCareCatalogKey, 'care_demo');
assert.equal(projection.sourceCareVersion, 7);
assert.equal(projection.sourceAuthority, 'publication-snapshot');
assert.equal(projection.route.candidateUrl, '/care/care_demo');
assert.equal(projection.route.readiness, 'blocked');
assert.equal(projection.publishReady, false);
assert.ok(projection.route.blockers.some(item => item.includes('noindex')));
assert.ok(projection.route.blockers.some(item => item.includes('static SEO artifact')));
assert.deepEqual(projection.editableFields, ['seoTitle', 'metaDescription', 'h1', 'focusKeyword']);
assert.ok(projection.protectedSourceFields.includes('symptoms'));
assert.ok(projection.protectedSourceFields.includes('steps'));
assert.ok(projection.protectedSourceFields.includes('references'));
assert.equal(projection.sourceFacts.immediateActions[0], '观察状态');
assert.equal(projection.sourceFacts.evidenceCount, 1);
assert.equal(projection.suggestedEditorial.h1, detail.title);
assert.equal(projection.suggestedEditorial.focusKeyword, '换水应激');
const root = resolve(import.meta.dirname, '..');
const adminRoute = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const contract = readFileSync(resolve(root, 'packages/contracts/src/care-seo.ts'), 'utf8');
const page = readFileSync(resolve(root, 'src/pages/AdminContent.tsx'), 'utf8');
const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
const carePage = readFileSync(resolve(root, 'src/pages/CareEncyclopedia.tsx'), 'utf8');

assert.match(adminRoute, /care-articles\/:id\/seo-projection/);
assert.match(adminRoute, /from\('content_publications'\)/);
assert.match(adminRoute, /source_version/);
assert.match(adminRoute, /publication-snapshot/);
assert.match(adminRoute, /eq\('status', 'published'\)/);
assert.match(adminRoute, /legacy-published/);
assert.match(contract, /protectedSourceFields/);
assert.match(contract, /publishReady: boolean/);
assert.match(page, /CareSeoProjectionPreview/);
assert.doesNotMatch(page, /saveCareSeo|publishCareSeo|createCareSeo/);
assert.match(app, /path="\/care\/:topicId"/);
assert.match(carePage, /care-canonical-topic-page/);
assert.match(carePage, /meta\[name="robots"\]/);
assert.match(carePage, /noindex,follow/);
assert.match(carePage, /link\[rel="canonical"\]/);
assert.match(carePage, /standalone[\s\S]*<h1/);

console.log('care SEO projection: published-source binding + protected Care facts + route lock PASS');

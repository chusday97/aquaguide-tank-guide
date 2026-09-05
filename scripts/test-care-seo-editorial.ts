import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  careSeoEditorialDraftMutationSchema,
  careSeoEditorialTransitionMutationSchema,
} from '../packages/contracts/src/index';

const draft = careSeoEditorialDraftMutationSchema.parse({
  locale: 'zh-CN',
  sourceCareVersion: 7,
  indexStrategy: 'noindex',
  seoTitle: '换水后鱼只异常处理 | AquaGuide',
  metaDescription: '基于已发布养护知识的搜索摘要。',
  h1: '换水后鱼只异常怎么办',
  focusKeyword: '换水应激',
});
assert.equal(draft.sourceCareVersion, 7);
assert.equal(draft.locale, 'zh-CN');
assert.equal(draft.indexStrategy, 'noindex');

assert.equal(careSeoEditorialDraftMutationSchema.safeParse({ ...draft, editorialId: crypto.randomUUID() }).success, false);
const transition = careSeoEditorialTransitionMutationSchema.parse({
  locale: 'en',
  sourceCareVersion: 8,
  editorialId: crypto.randomUUID(),
  revisionVersion: 2,
});
assert.equal(transition.sourceCareVersion, 8);

const root = resolve(import.meta.dirname, '..');
const migration = readFileSync(resolve(root, 'supabase/migrations/202609050004_care_seo_editorial_revisions.sql'), 'utf8');
const api = readFileSync(resolve(root, 'apps/api/src/care-seo-editorial.ts'), 'utf8');
const route = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const component = readFileSync(resolve(root, 'src/components/admin/CareSeoProjectionPreview.tsx'), 'utf8');
const artifact = readFileSync(resolve(root, 'scripts/build-care-seo-artifact.ts'), 'utf8');

assert.match(migration, /care_seo_editorial_revisions/);
assert.match(migration, /source_care_version/);
assert.match(migration, /review_state/);
assert.match(migration, /index_strategy/);
assert.match(migration, /submitted_by/);
assert.match(migration, /approved_by/);
for (const protectedField of ['symptoms', 'immediate_actions', 'avoid_actions', 'observe_items', 'diagnose_when', 'next_step', 'evidence', 'snapshot']) {
  assert.doesNotMatch(migration, new RegExp(`\\b${protectedField}\\b`, 'i'), `Editorial persistence must not copy protected Care field ${protectedField}`);
}

assert.match(api, /source_care_version !== currentSourceVersion/);
assert.match(api, /Published Care 已更新/);
assert.match(api, /source drift/);
assert.match(api, /assertIndexLocked/);
assert.match(api, /indexStrategy !== 'noindex'/);
assert.match(api, /review_state: 'ready_for_review'/);
assert.match(api, /review_state: 'approved'/);
assert.doesNotMatch(api, /publish_content_snapshot/);
assert.doesNotMatch(api, /\.from\('care_articles'\)\s*\.update/);
assert.doesNotMatch(api, /\.from\('care_article_steps'\)\s*\.update/);

assert.match(route, /care-articles\/:id\/seo-editorial\/draft/);
assert.match(route, /care-articles\/:id\/seo-editorial\/submit-review/);
assert.match(route, /care-articles\/:id\/seo-editorial\/approve/);
assert.match(route, /adminRouter\.use\(requireAuth, requireAdmin\)/);
assert.match(component, /Source drift/);
assert.match(component, /人工批准/);
assert.match(component, /noindex locked/);
assert.match(component, /Production \/ Index 未开放/);
assert.doesNotMatch(component, /publishCareSeo|发布到 Production/);
assert.match(artifact, /reviewState !== 'approved'/);
assert.match(artifact, /Care SEO bilingual pair required/);
assert.match(artifact, /Care SEO source version mismatch/);

console.log('care SEO editorial: source binding + human review + protected authority + index lock PASS');

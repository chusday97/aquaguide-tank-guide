import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CareSeoEditorialWorkspaceDto } from '../packages/contracts/src/index';
import {
  createCareSeoAiAssistFromWorkspace,
  openAiCompatibleCareSeoProvider,
  type CareSeoAiProvider,
} from '../apps/api/src/care-seo-ai';

const workspace: CareSeoEditorialWorkspaceDto = {
  persistenceAvailable: true,
  projection: {
    sourceCareId: '00000000-0000-4000-8000-000000000001',
    sourceCareCatalogKey: 'care_water_quality',
    sourceCareVersion: 7,
    sourcePublishedAt: '2026-09-05T08:00:00+00:00',
    sourceAuthority: 'publication-snapshot',
    locale: 'en',
    route: {
      pathname: '/care/care_water_quality.html', topicParam: 'care_water_quality', candidateUrl: '/care/care_water_quality.html',
      alternates: { en: '/care/care_water_quality.html', 'zh-CN': '/zh/care/care_water_quality.html', 'x-default': '/care/care_water_quality.html' },
      readiness: 'blocked', blockers: [],
    },
    sourceFacts: {
      title: 'Stable water first steps', category: 'Water quality', urgency: 'Routine', summary: 'Keep water parameters stable and observe the fish.',
      symptoms: ['rapid breathing'], immediateActions: ['Observe before changing parameters.'], avoidActions: ['Avoid unnecessary medication.'],
      observeItems: ['Breathing'], diagnoseWhen: ['Symptoms persist'], nextStep: 'Retest water parameters.', evidenceCount: 0,
    },
    suggestedEditorial: {
      seoTitle: 'Stable water first steps | AquaGuide', metaDescription: 'Keep water parameters stable and observe the fish.', h1: 'Stable water first steps', focusKeyword: 'stable aquarium water',
    },
    editableFields: ['seoTitle', 'metaDescription', 'h1', 'focusKeyword'],
    protectedSourceFields: ['title', 'summary', 'symptoms', 'steps', 'avoidActions', 'observeItems', 'diagnoseWhen', 'nextStep', 'references'],
    publishReady: false,
  },
  editorial: null,
};

let providerCalls = 0;
const provider: CareSeoAiProvider = async () => {
  providerCalls += 1;
  return {
    model: 'mock-care-seo-model',
    output: {
      sourceExtraction: {
        primaryTopic: 'Stable aquarium water troubleshooting',
        searchIntent: 'Find safe first steps when water parameters shift',
        keyTerms: ['water stability', 'rapid breathing'],
        safetyBoundaries: ['Do not invent medication or diagnosis advice.'],
      },
      conflicts: [],
      impactExplanation: {
        summary: 'Reframes the approved Care facts for search without changing the Care authority.',
        changedEditorialFields: [],
      },
      draft: {
        seoTitle: 'Aquarium Water Stability: Safe First Steps',
        metaDescription: 'Learn safe first steps for aquarium water instability and what to observe next.',
        h1: 'Aquarium Water Stability: Safe First Steps',
        focusKeyword: 'aquarium water stability',
        indexStrategy: 'noindex',
      },
      reviewWarnings: ['Human reviewer should confirm the wording stays within Published Care.'],
      protectedSourceRewrite: { symptoms: ['MALICIOUS_PROTECTED_REWRITE'] },
    },
  };
};

const result = await createCareSeoAiAssistFromWorkspace(workspace, { locale: 'en', sourceCareVersion: 7 }, provider);
assert.equal(providerCalls, 1);
assert.equal(result.sourceBinding.sourceAuthority, 'publication-snapshot');
assert.equal(result.sourceBinding.sourceCareVersion, 7);
assert.equal(result.draft.indexStrategy, 'noindex');
assert.equal(JSON.stringify(result).includes('MALICIOUS_PROTECTED_REWRITE'), false);
assert.ok(result.conflicts.some(item => item.type === 'source_gap' && item.field === 'evidence'));
assert.deepEqual(new Set(result.impactExplanation.changedEditorialFields), new Set(['seoTitle', 'metaDescription', 'h1', 'focusKeyword']));

providerCalls = 0;
await assert.rejects(
  createCareSeoAiAssistFromWorkspace(workspace, { locale: 'en', sourceCareVersion: 6 }, provider),
  /Published Care 已从 v6 变化为 v7/,
);
assert.equal(providerCalls, 0, 'stale source version must fail before invoking AI');

await assert.rejects(
  createCareSeoAiAssistFromWorkspace({ ...workspace, projection: { ...workspace.projection, sourceAuthority: 'legacy-published' } }, { locale: 'en', sourceCareVersion: 7 }, provider),
  /legacy source 被拒绝/,
);

const indexProvider: CareSeoAiProvider = async () => ({
  model: 'unsafe-model',
  output: {
    sourceExtraction: { primaryTopic: 'x', searchIntent: 'x', keyTerms: [], safetyBoundaries: [] },
    conflicts: [], impactExplanation: { summary: 'x', changedEditorialFields: [] },
    draft: { seoTitle: 'x', metaDescription: 'x', h1: 'x', focusKeyword: 'x', indexStrategy: 'index' },
    reviewWarnings: [],
  },
});
await assert.rejects(
  createCareSeoAiAssistFromWorkspace(workspace, { locale: 'en', sourceCareVersion: 7 }, indexProvider),
  /安全结构校验/,
);

const driftWorkspace: CareSeoEditorialWorkspaceDto = {
  ...workspace,
  editorial: {
    id: '00000000-0000-4000-8000-000000000099', sourceCareId: workspace.projection.sourceCareId, sourceCareCatalogKey: workspace.projection.sourceCareCatalogKey,
    sourceCareVersion: 6, locale: 'en', revisionNumber: 1, version: 1, reviewState: 'draft', indexStrategy: 'noindex',
    seoTitle: 'Old', metaDescription: 'Old', h1: 'Old', focusKeyword: 'old', sourceDrift: true,
    createdAt: '2026-09-05T07:00:00.000Z', updatedAt: '2026-09-05T07:00:00.000Z',
  },
};
const driftResult = await createCareSeoAiAssistFromWorkspace(driftWorkspace, { locale: 'en', sourceCareVersion: 7 }, provider);
assert.ok(driftResult.conflicts.some(item => item.type === 'source_drift' && item.severity === 'blocking'));

const envKeys = ['AQUAGUIDE_AI_API_KEY', 'AI_API_KEY', 'DEEPSEEK_API_KEY', 'OPENAI_API_KEY'] as const;
const previous = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
for (const key of envKeys) delete process.env[key];
await assert.rejects(openAiCompatibleCareSeoProvider({ workspace }), /AI provider 尚未配置/);
for (const key of envKeys) {
  if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
}

const root = resolve(import.meta.dirname, '..');
const route = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const component = readFileSync(resolve(root, 'src/components/admin/CareSeoProjectionPreview.tsx'), 'utf8');
assert.match(route, /seo-editorial\/ai-assist/);
assert.match(route, /createCareSeoAiAssist/);
assert.match(component, /AI 分析并建议草稿/);
assert.match(component, /应用到本地表单（不保存）/);
assert.match(component, /不能修改 Care facts、审批或发布/);

console.log('Care SEO AI assist: Published-only source binding + conflict/impact + noindex Draft suggestion + no auto-write PASS');

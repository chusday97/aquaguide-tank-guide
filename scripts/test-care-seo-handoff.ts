import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { careSeoStagingSnapshotSchema, type CareSeoEditorialWorkspaceDto } from '../packages/contracts/src/index';
import { createCareSeoStagingHandoff, sanitizeCareSeoWorkspaceRecord } from '../apps/api/src/care-seo-handoff';

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
      pathname: '/care/care_water_quality.html',
      topicParam: 'care_water_quality',
      candidateUrl: '/care/care_water_quality.html',
      alternates: {
        en: '/care/care_water_quality.html',
        'zh-CN': '/zh/care/care_water_quality.html',
        'x-default': '/care/care_water_quality.html',
      },
      readiness: 'ready',
      blockers: [],
    },
    sourceFacts: {
      title: 'PROTECTED_TITLE_SENTINEL',
      category: 'Water quality',
      urgency: 'Routine',
      summary: 'Keep water parameters stable.',
      symptoms: ['PROTECTED_SYMPTOM_SENTINEL'],
      immediateActions: ['Observe before changing parameters.'],
      avoidActions: ['Avoid unnecessary medication.'],
      observeItems: ['Breathing'],
      diagnoseWhen: ['PROTECTED_DIAGNOSIS_SENTINEL'],
      nextStep: 'Escalate if the condition worsens.',
      evidenceCount: 99,
    },
    suggestedEditorial: {
      seoTitle: 'Suggested title',
      metaDescription: 'Suggested description',
      h1: 'Suggested H1',
      focusKeyword: 'water care',
    },
    editableFields: ['seoTitle', 'metaDescription', 'h1', 'focusKeyword'],
    protectedSourceFields: ['symptoms', 'diagnoseWhen', 'evidence'],
    publishReady: true,
  },
  editorial: {
    id: '00000000-0000-4000-8000-000000000099',
    sourceCareId: '00000000-0000-4000-8000-000000000001',
    sourceCareCatalogKey: 'care_water_quality',
    sourceCareVersion: 7,
    locale: 'en',
    revisionNumber: 4,
    version: 4,
    reviewState: 'approved',
    indexStrategy: 'noindex',
    seoTitle: 'Stable aquarium water care',
    metaDescription: 'Practical water-care guidance from the reviewed AquaGuide Care source.',
    h1: 'Stable aquarium water care',
    focusKeyword: 'aquarium water care',
    sourceDrift: false,
    createdAt: '2026-09-05T08:10:00.000Z',
    updatedAt: '2026-09-05T08:20:00.000Z',
    submittedAt: '2026-09-05T08:15:00.000Z',
    approvedAt: '2026-09-05T08:20:00.000Z',
  },
};

const sanitized = sanitizeCareSeoWorkspaceRecord(workspace);
assert.deepEqual(Object.keys(sanitized.projection.sourceFacts).sort(), [
  'avoidActions', 'category', 'immediateActions', 'nextStep', 'observeItems', 'summary', 'urgency',
].sort());
const serialized = JSON.stringify(sanitized);
for (const forbidden of [
  'PROTECTED_TITLE_SENTINEL', 'PROTECTED_SYMPTOM_SENTINEL', 'PROTECTED_DIAGNOSIS_SENTINEL',
  workspace.editorial.id, 'revisionNumber', 'approvedAt', 'submittedAt', 'evidenceCount',
]) assert.equal(serialized.includes(String(forbidden)), false, `Staging handoff leaked ${forbidden}`);
assert.equal(sanitized.editorial.reviewState, 'approved');
assert.equal(sanitized.editorial.indexStrategy, 'noindex');
careSeoStagingSnapshotSchema.parse({
  schemaVersion: 1,
  environment: 'staging',
  sourceEnvironment: 'staging',
  sourceLabel: 'ephemeral-aquaguide-care',
  generatedAt: '2026-09-05T08:30:00.000Z',
  records: [sanitized, { ...sanitized, projection: { ...sanitized.projection, locale: 'zh-CN', route: { ...sanitized.projection.route, pathname: '/zh/care/care_water_quality.html', candidateUrl: '/zh/care/care_water_quality.html' } } }],
});

assert.throws(
  () => sanitizeCareSeoWorkspaceRecord({ ...workspace, editorial: { ...workspace.editorial!, reviewState: 'draft' } }),
  /尚未 Approved/,
);
assert.throws(
  () => sanitizeCareSeoWorkspaceRecord({ ...workspace, projection: { ...workspace.projection, sourceAuthority: 'legacy-published' } }),
  /immutable Published Care snapshot/,
);
assert.throws(
  () => sanitizeCareSeoWorkspaceRecord({ ...workspace, editorial: { ...workspace.editorial!, sourceCareCatalogKey: 'wrong_key' } }),
  /source identity/,
);
assert.throws(
  () => sanitizeCareSeoWorkspaceRecord({ ...workspace, editorial: { ...workspace.editorial!, sourceDrift: true } }),
  /source drift/,
);
assert.throws(
  () => sanitizeCareSeoWorkspaceRecord({ ...workspace, editorial: { ...workspace.editorial!, indexStrategy: 'index' } }),
  /必须保持 noindex/,
);

await assert.rejects(
  createCareSeoStagingHandoff(workspace.projection.sourceCareId, 'production', 'safe-source'),
  /只允许从显式 Staging source/,
);
await assert.rejects(
  createCareSeoStagingHandoff(workspace.projection.sourceCareId, 'staging', 'production-copy'),
  /指向 Production/,
);

const root = resolve(import.meta.dirname, '..');
const route = readFileSync(resolve(root, 'apps/api/src/routes/admin.ts'), 'utf8');
const contract = readFileSync(resolve(root, 'packages/contracts/src/care-seo.ts'), 'utf8');
assert.match(route, /seo-editorial\/staging-handoff/);
assert.match(route, /CARE_SEO_SOURCE_ENVIRONMENT/);
assert.match(route, /CARE_SEO_STAGING_SOURCE_LABEL/);
assert.match(contract, /sourceEnvironment: z\.enum\(\['staging', 'production'\]\)/);

console.log('care SEO Staging handoff: approved-only + bilingual source binding + exact sanitization + production-source lock PASS');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCompatibilityWorkItems, buildContentWorkItems, buildSeoWorkItems, classifyOperationsReadResults, selectOperationsHomeQueueItems, sortOperationsWorkItems } from '../src/services/admin/operations-work-item.service';
import { AquaGuideApiError } from '../src/services/api/api-client';

const authRequired = new AquaGuideApiError(401, 'AUTH_REQUIRED', '请先登录。');
const forbidden = new AquaGuideApiError(403, 'FORBIDDEN', '没有内容管理权限。');
const serviceFailure = new AquaGuideApiError(503, 'INTERNAL_ERROR', '来源暂不可用。');
assert.equal(classifyOperationsReadResults([]), 'unavailable', 'An empty read set must never imply a healthy authority.');
assert.equal(classifyOperationsReadResults([{ status: 'fulfilled' }, { status: 'fulfilled' }]), 'ready');
assert.equal(classifyOperationsReadResults([{ status: 'fulfilled' }, { status: 'rejected', reason: authRequired }]), 'partial');
assert.equal(classifyOperationsReadResults([{ status: 'rejected', reason: authRequired }, { status: 'rejected', reason: authRequired }]), 'auth_required', '401 Business Admin reads must not be mislabeled as service unavailable.');
assert.equal(classifyOperationsReadResults([{ status: 'rejected', reason: forbidden }, { status: 'rejected', reason: forbidden }]), 'forbidden', '403 admin-role failures must not be mislabeled as service unavailable.');
assert.equal(classifyOperationsReadResults([{ status: 'rejected', reason: serviceFailure }, { status: 'rejected', reason: serviceFailure }]), 'unavailable', 'Actual source failures must remain unavailable.');

const seo = buildSeoWorkItems({
  entries: [
    { pageKey: 'species:a:zh', sourceKey: 'a', label: 'A', locale: 'zh-CN', editorHref: '/admin/seo/?catalogKey=a', health: { severity: 'blocked', issues: ['index_strategy_unknown', 'missing_h1'] }, editorialState: 'editing' },
    { pageKey: 'species:b:en', sourceKey: 'b', label: 'B', locale: 'en', editorHref: '/admin/seo/?catalogKey=b', health: { severity: 'attention', issues: ['missing_editorial_review'] }, editorialState: 'ready_for_review' },
    { pageKey: 'species:c:zh', sourceKey: 'c', label: 'C', locale: 'zh-CN', editorHref: '/admin/seo/?catalogKey=c', health: { severity: 'unknown', issues: ['source_state_unknown'] }, editorialState: 'unknown' },
    { pageKey: 'species:d:zh', sourceKey: 'd', label: 'D', locale: 'zh-CN', editorHref: '/admin/seo/?catalogKey=d', health: { severity: 'attention', issues: ['index_strategy_unknown'] }, editorialState: 'editing' },
  ] as any,
  sources: [],
});
assert.equal(seo.length, 3, 'Unknown source state must not become a work item.');
assert.equal(seo[0]?.id, 'seo:species:a:zh:blocked');
assert.equal(seo[0]?.href, '/admin/seo/?catalogKey=a');
assert.equal(seo[0]?.gateLabel, '缺少 H1', 'Blocked SEO must surface the actual hard blocker before softer issues.');
assert.match(seo[0]?.nextStep || '', /补齐 H1/);
assert.equal(seo[0]?.actionLabel, '补齐 H1', 'SEO action copy must name the exact blocker instead of a generic page action.');
assert.equal(seo[1]?.actionLabel, '开始人工审核', 'SEO review WorkItem must name the human-review action explicitly.');
assert.equal(seo[2]?.actionLabel, '设置 Index 策略', 'SEO attention WorkItem must name the exact policy action explicitly.');
const unpublishedCareSeo = buildSeoWorkItems({
  entries: [{ pageKey: 'care:guide-a:zh-CN', pageType: 'care', sourceKey: 'guide-a', label: 'Care A', locale: 'zh-CN', editorHref: '/admin/product-content?type=care&id=local-care-a&seo=1&locale=zh-CN', health: { severity: 'blocked', issues: ['source_not_published'] }, editorialState: 'source_not_published' }],
  sources: [],
} as any);
assert.equal(unpublishedCareSeo[0]?.actionLabel, '先发布 Care 源内容');
assert.equal(unpublishedCareSeo[0]?.href, '/admin/product-content?type=care&id=local-care-a&locale=zh-CN', 'Source-not-published Care tasks must return to Product/Care source editing instead of auto-focusing downstream SEO.');
const legacyCareSeo = buildSeoWorkItems({
  entries: [{ pageKey: 'care:guide-b:zh-CN', pageType: 'care', sourceKey: 'guide-b', label: 'Care B', locale: 'zh-CN', editorHref: '/admin/product-content?type=care&id=local-care-b&seo=1&locale=zh-CN', health: { severity: 'blocked', issues: ['source_not_snapshot'] }, editorialState: 'editing' }],
  sources: [],
} as any);
assert.equal(legacyCareSeo[0]?.actionLabel, '生成 Published Snapshot');
assert.equal(legacyCareSeo[0]?.href, '/admin/product-content?type=care&id=local-care-b&locale=zh-CN&snapshot=1', 'Legacy Care publication tasks must land in Product/Care with an explicit snapshot-repair context, not downstream SEO.');
assert.equal(seo[1]?.severity, 'decision');
assert.equal(seo[2]?.severity, 'attention');

const content = buildContentWorkItems(
  [{ id: 'sp1', status: 'draft', version: 1, catalogKey: 'goldfish', name: '金鱼' } as any, { id: 'sp2', status: 'published', version: 1 } as any],
  [{ id: 'care1', status: 'draft', version: 2, catalogKey: 'fin-rot', title: '烂尾处理' } as any],
);
assert.equal(content.length, 2);
assert.equal(content[0]?.id, 'product:sp1:draft');
assert.equal(content[0]?.href, '/admin/product-content?type=species&id=sp1');
assert.equal(content[1]?.href, '/admin/product-content?type=care&id=care1');

const readyChecks = {
  impactReport: { changedFields: ['confidence'] },
  regressionReport: { evaluatedScenarios: 3 },
  citationSnapshots: [{ sourceKey: 's1' }],
  evidenceResolution: [{ sourceKey: 's1', sourceId: 'e1', version: 1 }],
};
const compatibility = buildCompatibilityWorkItems(
  [
    { id: 'r1', status: 'pending_review', revisionNumber: 2, species: { catalogKey: 'guppy', name: '孔雀鱼' }, ...readyChecks } as any,
    { id: 'r2', status: 'draft', revisionNumber: 3, species: { catalogKey: 'tetra', name: '灯鱼' }, citationSnapshots: [] } as any,
  ],
  [
    { id: 'p1', status: 'approved', revisionNumber: 4, riskType: 'predation', speciesA: { catalogKey: 'guppy', name: '孔雀鱼' }, speciesB: { catalogKey: 'shrimp', name: '米虾' }, ...readyChecks } as any,
    { id: 'p2', status: 'approved', revisionNumber: 5, riskType: 'evidence-gap', speciesA: { catalogKey: 'tetra', name: '灯鱼' }, speciesB: { catalogKey: 'shrimp', name: '米虾' }, impactReport: { changedFields: ['reason'] }, regressionReport: undefined, citationSnapshots: [{ sourceKey: 's1' }], evidenceResolution: [] } as any,
  ],
);
assert.equal(compatibility.length, 4);
assert.equal(compatibility[0]?.href, '/admin/compatibility?kind=profile&revision=r1');
assert.equal(compatibility[2]?.href, '/admin/compatibility?kind=pair&revision=p1');
assert.equal(compatibility[2]?.severity, 'attention', 'Approved revision with checks still needs live publish-gate verification.');
assert.equal(compatibility[3]?.severity, 'blocker', 'Missing regression/evidence must become a blocker.');
assert.match(compatibility[3]?.gateLabel || '', /Regression/);
assert.equal(compatibility[3]?.actionLabel, '修复发布前检查', 'Missing Compatibility review artifacts must point to the explicit repair action, not a disabled approval flow.');
assert.match(compatibility[3]?.nextStep || '', /恢复.*Regression.*Canonical Evidence/, 'Compatibility repair WorkItem must name the missing review artifacts.');

const repeatedSeoAttention = Array.from({ length: 8 }, (_, index) => ({
  id: `seo-repeat-${index}`, authority: 'seo' as const, severity: 'attention' as const,
  title: `SEO ${index}`, detail: 'same gate', count: 1, resourceKey: `seo-${index}`, resourceLabel: `SEO ${index}`, reason: 'Index 策略尚未确认', gateLabel: 'Index 策略尚未确认', nextStep: 'fix', verificationNote: 'verify', actionLabel: '完善', href: `/seo/${index}`,
}));
const queueSample = selectOperationsHomeQueueItems(sortOperationsWorkItems(repeatedSeoAttention), null, 10, 3);
assert.equal(queueSample.length, 3, 'Repeated low-priority attention rows with the same authority/gate must be capped on Operations Home.');
assert.equal(queueSample.every(item => item.authority === 'seo'), true);

const sorted = sortOperationsWorkItems([...content, ...compatibility, ...seo]);
assert.equal(sorted[0]?.severity, 'blocker');
const firstDecision = sorted.findIndex(item => item.severity === 'decision');
const firstAttention = sorted.findIndex(item => item.severity === 'attention');
assert.ok(firstDecision > 0 && firstAttention > firstDecision, 'WorkItems must sort blocker → decision → attention.');
const firstProductAttention = sorted.findIndex(item => item.severity === 'attention' && item.authority === 'product_care');
const firstSeoAttention = sorted.findIndex(item => item.severity === 'attention' && item.authority === 'seo');
assert.ok(firstProductAttention >= 0 && firstSeoAttention > firstProductAttention, 'Active Product/Care Drafts must stay ahead of generic SEO attention work.');

const serviceSource = fs.readFileSync(new URL('../src/services/admin/operations-work-item.service.ts', import.meta.url), 'utf8');
assert.doesNotMatch(serviceSource, /\.(create|update|submit|approve|publish)[A-Z][A-Za-z]+\(/, 'Operations WorkItem aggregation must remain read-only.');
const adminHubSource = fs.readFileSync(new URL('../src/pages/AdminHub.tsx', import.meta.url), 'utf8');
assert.match(adminHubSource, /source\.availability !== 'ready'/, 'Ready sources must not repeat diagnostic detail on Operations Home.');
assert.match(adminHubSource, /snapshot\.recentEvents\[0\]/, 'Operations Home must show only the latest release handoff instead of duplicating the Publish Center timeline.');
assert.doesNotMatch(adminHubSource, /recentEvents\.slice\(0, 5\)/, 'Operations Home must not render a second five-event release timeline.');
assert.match(adminHubSource, /grid grid-cols-2 xl:grid-cols-4/, 'Authority workspaces must stay compact as a 2x2 mobile grid.');
assert.match(adminHubSource, /item\.gateLabel/, 'Operations Home must render the current task gate.');
assert.match(adminHubSource, /item\.nextStep/, 'Operations Home must render the exact next operator step.');
assert.match(adminHubSource, /item\.verificationNote/, 'Operations Home must preserve authority verification notes.');
const compatibilitySource = fs.readFileSync(new URL('../src/pages/CompatibilityAdmin.tsx', import.meta.url), 'utf8');
assert.match(compatibilitySource, /deepLinkParams\.get\('kind'\)/, 'Compatibility editor must accept WorkItem kind deep-links.');
assert.match(compatibilitySource, /deepLinkParams\.get\('revision'\)/, 'Compatibility editor must accept exact revision deep-links.');

const operationsHomeSource = fs.readFileSync('src/pages/AdminHub.tsx', 'utf8');
const standaloneSeoAdminSource = fs.readFileSync('apps/admin-content/src/App.jsx', 'utf8');
assert.match(operationsHomeSource, /returnTo[\s\S]*returnTask[\s\S]*returnTitle/, 'Standalone SEO task handoff must carry a return contract.');
assert.match(standaloneSeoAdminSource, /data-testid="return-to-operations-task"/, 'Standalone Species SEO must expose a contextual return action when launched from Operations.');
assert.match(standaloneSeoAdminSource, /target\.hostname !== window\.location\.hostname[\s\S]*target\.pathname !== '\/admin\/content'/, 'Standalone return target must be constrained to the same hostname and Operations path.');
console.log(JSON.stringify({ gate: 'PASS', workItems: sorted.length, first: sorted[0]?.id }));

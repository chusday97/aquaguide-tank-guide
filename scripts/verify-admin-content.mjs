import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { getCompatibilityEvidenceAudit } from '../src/data/compatibilityEvidence.ts';

const repoRoot = resolve(import.meta.dirname, '..');
const rootPackage = JSON.parse(await readFile(resolve(repoRoot, 'package.json'), 'utf8'));
const vercelConfig = JSON.parse(await readFile(resolve(repoRoot, 'vercel.json'), 'utf8'));
assert.match(rootPackage.scripts.build, /build:seo-admin/, 'Root AquaGuide build must include the Species SEO Admin subapp.');
assert.match(rootPackage.scripts.build, /build:species-pages/, 'Root AquaGuide build must include the Species static-page integration step.');
assert.match(rootPackage.scripts['build:species-pages'], /build-species-seo-artifact/, 'Root Species page integration must use the guarded build wrapper.');
assert.match(rootPackage.scripts['build:seo-admin'], /--base=\/admin\/seo\//, 'Species SEO Admin build must target /admin/seo/.');
assert.ok(vercelConfig.rewrites.some(item => item.source === '/admin/seo' && item.destination === '/admin/seo/index.html'), 'Vercel must route the stable /admin/seo entry to the SEO Admin subapp.');

const supabaseUrl = 'http://127.0.0.1:54321';
process.env.VITE_SUPABASE_URL = supabaseUrl;
process.env.VITE_SUPABASE_ANON_KEY = 'admin-ui-test-anon-key';
const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
const fakeSession = {
  access_token: 'admin-ui-test-token',
  refresh_token: 'admin-ui-test-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: '8b3f71bd-a1be-4a18-b7f8-5478cf55dc61',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'admin-ui-test@example.com',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  },
};

const baseRecord = {
  id: 'ae1732a3-27d0-4820-986c-2e932990f570',
  catalogKey: 'sp_demo',
  name: '测试灯鱼',
  scientificName: 'Demo tetra',
  category: '小型鱼',
  difficulty: 'Easy',
  waterTemperatureText: '22-26°C',
  phLevelText: '6.5-7.5',
  waterChangeCycleDays: 7,
  description: '用于验证管理员内容表单。',
  diet: '少量多次喂食。',
  tankSizeText: '至少 30 升',
  temperament: 'Peaceful',
  sizeClass: 'Small',
  isCustom: false,
  searchTerms: [],
  status: 'draft',
  version: 1,
  speciesAssets: [],
};

const fishDataForTest = catalogKey => ({
  catalogKey,
  name: catalogKey === 'sp_0439' ? '虎皮鱼' : catalogKey === 'sp_0021' ? '迷你鹦鹉鱼' : catalogKey,
  scientificName: catalogKey === 'sp_0439' ? 'Puntigrus tetrazona' : catalogKey === 'sp_0021' ? 'Amatitlania nigrofasciata' : catalogKey,
});

const baseCareRecord = {
  id: 'be1732a3-27d0-4820-986c-2e932990f571',
  catalogKey: 'care_demo', title: '换水后观察', category: '水质', urgency: '日常', summary: '先观察鱼只状态。',
  symptoms: ['应激'], avoidActions: ['不要立即加药'], observeItems: ['呼吸'], diagnoseWhen: ['持续异常'],
  nextStep: '必要时进一步诊断', keywords: ['换水'], status: 'draft', version: 1,
  careArticleSteps: [{ id: 'ce1732a3-27d0-4820-986c-2e932990f572', position: 0, instruction: '先观察', durationLabel: '10 分钟' }],
  careArticleAssets: [],
};

const compatibilityAudit = getCompatibilityEvidenceAudit();
const reviewedCatalogKeys = compatibilityAudit.reviewedProfiles.map(profile => profile.speciesId);
const reviewedPairKeys = compatibilityAudit.reviewedPairRules.map(rule => [...rule.speciesIds].sort().join('__'));
const sourceIdFor = sourceKey => {
  let hash = 0;
  for (const char of sourceKey) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `00000000-0000-4000-8000-${hash.toString(16).padStart(12, '0').slice(-12)}`;
};
const toRuntimeCitation = source => ({
  id: source.id, title: source.title, publisher: source.publisher, url: source.url,
  sourceType: source.sourceType, reviewStatus: 'reviewed', version: 1,
});
const createCompatibilityBootstrap = () => ({
  authority: 'reviewed-db',
  counts: { profiles: compatibilityAudit.reviewedProfiles.length, pairRules: compatibilityAudit.reviewedPairRules.length },
  profiles: compatibilityAudit.reviewedProfiles.map(profile => ({
    catalogKey: profile.speciesId, behaviorTraits: [...profile.behaviorTraits], minimumGroupSize: profile.minimumGroupSize,
    predationTargets: [...profile.predationTargets], confidence: profile.confidence, reviewStatus: 'reviewed',
    citations: profile.citations.map(toRuntimeCitation), version: 1,
  })),
  pairRules: compatibilityAudit.reviewedPairRules.map(rule => ({
    catalogKeys: [...rule.speciesIds].sort(), verdict: rule.verdict, riskType: rule.riskType, reason: rule.reason,
    mitigation: [...rule.mitigation], basis: rule.basis, confidence: rule.confidence, reviewStatus: 'reviewed',
    citations: rule.citations.map(toRuntimeCitation), version: 1,
  })),
});

const vite = await createServer({
  root: repoRoot,
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'silent',
});
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address === 'object');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewportSize: viewport });
    await page.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
      key: authStorageKey,
      session: fakeSession,
    });
    let savedName = '';
    let currentRecord = { ...baseRecord };
    let currentCare = { ...baseCareRecord };
    let compatibilityRevisions = [];
    let pairRuleRevisions = [];
    let compatibilityBootstrap = createCompatibilityBootstrap();
    let authoritySequence = 1;
    await page.route('**/api/v1/compatibility-bootstrap**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: compatibilityBootstrap, requestId: 'test-compat-bootstrap' }) });
    });
    await page.route('**/api/v1/admin/compatibility/profile-revisions**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { revisions: compatibilityRevisions, writableCatalogKeys: reviewedCatalogKeys }, requestId: 'test-compat-list' }) });
        return;
      }
      const body = request.postDataJSON();
      if (method === 'POST' && url.pathname.endsWith('/submit')) {
        const current = compatibilityRevisions[0];
        compatibilityRevisions = [{ ...current, status: 'pending_review', version: current.version + 1, impactReport: { kind: 'profile', baselineVersion: 1, changedFields: ['behavior_traits', 'minimum_group_size'], changes: [] }, impactCheckedAt: new Date().toISOString(), evidenceResolution: current.citationSnapshots.map(source => ({ sourceKey: source.sourceKey, sourceId: sourceIdFor(source.sourceKey), version: 1 })), regressionReport: { kind: 'profile', targetKey: current.species.catalogKey, baselineVersion: 1, authoritySequence, evaluatedScenarios: 18, changedScenarios: 1, generatedAt: new Date().toISOString(), changes: [{ scenario: 'species_only', species: [current.species.catalogKey, 'sp_0021'], before: { status: 'caution', riskLevel: 'medium', blocking: [], warning: ['before'], missing: [] }, after: { status: 'not_recommended', riskLevel: 'high', blocking: ['after'], warning: [], missing: [] } }] } }];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: compatibilityRevisions[0], requestId: 'test-compat-submit' }) });
        return;
      }
      if (method === 'POST' && url.pathname.endsWith('/review')) {
        const current = compatibilityRevisions[0];
        compatibilityRevisions = [{ ...current, status: body.decision === 'approve' ? 'approved' : 'rejected', version: current.version + 1, reviewNote: body.note || null }];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: compatibilityRevisions[0], requestId: 'test-compat-review' }) });
        return;
      }
      if (method === 'POST' && url.pathname.endsWith('/publish')) {
        const current = compatibilityRevisions[0];
        compatibilityRevisions = [{ ...current, status: 'published', version: current.version + 1 }];
        authoritySequence += 1;
        compatibilityBootstrap = {
          ...compatibilityBootstrap,
          profiles: compatibilityBootstrap.profiles.map(profile => profile.catalogKey === current.species.catalogKey ? {
            ...profile, behaviorTraits: [...current.behaviorTraits], minimumGroupSize: current.minimumGroupSize,
            predationTargets: [...current.predationTargets], confidence: current.confidence, version: profile.version + 1,
          } : profile),
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: compatibilityRevisions[0], requestId: 'test-compat-publish' }) });
        return;
      }
      if (method === 'POST') {
        const fish = fishDataForTest(body.catalogKey);
        const created = { id: 'de1732a3-27d0-4820-986c-2e932990f573', speciesId: 'fe1732a3-27d0-4820-986c-2e932990f574', revisionNumber: 1, baseProfileVersion: 1, behaviorTraits: body.behaviorTraits, minimumGroupSize: body.minimumGroupSize, predationTargets: body.predationTargets, confidence: body.confidence, status: 'draft', citationSnapshots: body.citations, version: 1, species: fish };
        compatibilityRevisions = [created];
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: created, requestId: 'test-compat-create' }) });
        return;
      }
      if (method === 'PATCH') {
        const current = compatibilityRevisions[0];
        const updated = { ...current, ...body, version: current.version + 1 };
        delete updated.catalogKey;
        compatibilityRevisions = [updated];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: updated, requestId: 'test-compat-update' }) });
        return;
      }
      await route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'unsupported test route' } }) });
    });
    await page.route('**/api/v1/admin/compatibility/pair-rule-revisions**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { revisions: pairRuleRevisions, writablePairKeys: reviewedPairKeys }, requestId: 'test-pair-list' }) });
        return;
      }
      const body = request.postDataJSON();
      if (method === 'POST' && url.pathname.endsWith('/submit')) {
        const current = pairRuleRevisions[0];
        pairRuleRevisions = [{ ...current, status: 'pending_review', version: current.version + 1, impactReport: { kind: 'pair_rule', baselineVersion: 1, changedFields: ['verdict', 'risk_type', 'reason', 'mitigation'], changes: [] }, impactCheckedAt: new Date().toISOString(), evidenceResolution: current.citationSnapshots.map(source => ({ sourceKey: source.sourceKey, sourceId: sourceIdFor(source.sourceKey), version: 1 })), regressionReport: { kind: 'pair_rule', targetKey: [current.speciesA.catalogKey, current.speciesB.catalogKey].sort().join('__'), baselineVersion: 1, authoritySequence, evaluatedScenarios: 3, changedScenarios: 2, generatedAt: new Date().toISOString(), changes: [{ scenario: 'species_only', species: [current.speciesA.catalogKey, current.speciesB.catalogKey], before: { status: 'not_recommended', riskLevel: 'high', blocking: ['before'], warning: [], missing: [] }, after: { status: 'caution', riskLevel: 'medium', blocking: [], warning: ['after'], missing: [] } }] } }];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: pairRuleRevisions[0], requestId: 'test-pair-submit' }) });
        return;
      }
      if (method === 'POST' && url.pathname.endsWith('/review')) {
        const current = pairRuleRevisions[0];
        pairRuleRevisions = [{ ...current, status: body.decision === 'approve' ? 'approved' : 'rejected', version: current.version + 1, reviewNote: body.note || null }];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: pairRuleRevisions[0], requestId: 'test-pair-review' }) });
        return;
      }
      if (method === 'POST' && url.pathname.endsWith('/publish')) {
        const current = pairRuleRevisions[0];
        pairRuleRevisions = [{ ...current, status: 'published', version: current.version + 1 }];
        const currentKey = [current.speciesA.catalogKey, current.speciesB.catalogKey].sort().join('__');
        compatibilityBootstrap = {
          ...compatibilityBootstrap,
          pairRules: compatibilityBootstrap.pairRules.map(rule => rule.catalogKeys.join('__') === currentKey ? {
            ...rule, verdict: current.verdict, riskType: current.riskType, reason: current.reason,
            mitigation: [...current.mitigation], basis: current.basis, confidence: current.confidence, version: rule.version + 1,
          } : rule),
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: pairRuleRevisions[0], requestId: 'test-pair-publish' }) });
        return;
      }
      if (method === 'POST') {
        const created = {
          id: 'ee1732a3-27d0-4820-986c-2e932990f575', speciesAId: 'aa1732a3-27d0-4820-986c-2e932990f576', speciesBId: 'bb1732a3-27d0-4820-986c-2e932990f577',
          revisionNumber: 1, baseRuleVersion: 1, verdict: body.verdict, riskType: body.riskType, reason: body.reason, mitigation: body.mitigation,
          basis: body.basis, confidence: body.confidence, status: 'draft', citationSnapshots: body.citations, version: 1,
          speciesA: fishDataForTest(body.catalogKeyA), speciesB: fishDataForTest(body.catalogKeyB),
        };
        pairRuleRevisions = [created];
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: created, requestId: 'test-pair-create' }) });
        return;
      }
      if (method === 'PATCH') {
        const current = pairRuleRevisions[0];
        const updated = { ...current, ...body, version: current.version + 1 };
        pairRuleRevisions = [updated];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: updated, requestId: 'test-pair-update' }) });
        return;
      }
      await route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'unsupported pair test route' } }) });
    });
    await page.route('**/api/v1/admin/species', async route => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        currentRecord = { ...baseRecord, ...body };
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: currentRecord, requestId: 'test-create' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [currentRecord], requestId: 'test-list' }) });
    });
    await page.route('**/api/v1/admin/species/*', async route => {
      const body = route.request().postDataJSON();
      savedName = body.name;
      currentRecord = { ...currentRecord, ...body, status: 'draft', version: currentRecord.version + 1 };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: currentRecord, requestId: 'test-update' }) });
    });
    await page.route('**/api/v1/species/sp_demo*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { ...baseRecord, assets: [], updatedAt: new Date().toISOString(), localization: {} }, requestId: 'test-public-species' }),
    }));

    await page.route('**/api/v1/admin/care-articles', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [currentCare], requestId: 'test-care-list' }),
    }));
    await page.route('**/api/v1/admin/care-articles/*/seo-projection**', async route => {
      const projection = {
        sourceCareId: baseCareRecord.id, sourceCareCatalogKey: baseCareRecord.catalogKey, sourceCareVersion: 1,
        sourcePublishedAt: '2026-09-05T01:00:00.000Z', sourceAuthority: 'publication-snapshot', locale: 'zh-CN',
        route: { pathname: '/care', topicParam: baseCareRecord.catalogKey, candidateUrl: '/care/care_demo', readiness: 'blocked', blockers: ['Canonical Care topic route 已建立，但当前默认 noindex，尚未开放 SEO publication。', 'Care topic 仍由 SPA client render；static SEO artifact / hosted handoff 尚未建立。', 'Locale-specific hreflang URL contract 尚未建立。'] },
        sourceFacts: { title: baseCareRecord.title, category: baseCareRecord.category, urgency: baseCareRecord.urgency, summary: baseCareRecord.summary, symptoms: baseCareRecord.symptoms, immediateActions: ['先观察'], avoidActions: baseCareRecord.avoidActions, observeItems: baseCareRecord.observeItems, diagnoseWhen: baseCareRecord.diagnoseWhen, nextStep: baseCareRecord.nextStep, evidenceCount: 0 },
        suggestedEditorial: { seoTitle: `${baseCareRecord.title} | AquaGuide`, metaDescription: baseCareRecord.summary, h1: baseCareRecord.title, focusKeyword: baseCareRecord.keywords[0] },
        editableFields: ['seoTitle', 'metaDescription', 'h1', 'focusKeyword'], protectedSourceFields: ['title', 'summary', 'symptoms', 'steps', 'avoidActions', 'observeItems', 'diagnoseWhen', 'nextStep', 'references'], publishReady: false,
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: projection, requestId: 'test-care-seo-projection' }) });
    });
    await page.route('**/api/v1/admin/care-articles/*', async route => {
      const request = route.request();
      const body = request.postDataJSON();
      const { steps = [], ...fields } = body;
      currentCare = {
        ...currentCare, ...fields, status: 'draft', version: currentCare.version + 1,
        careArticleSteps: steps.map((step, index) => ({ id: `care-step-${index}`, position: index, instruction: step.instruction, durationLabel: step.durationLabel })),
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: currentCare, requestId: 'test-care-update' }) });
    });
    await page.route('**/api/v1/care-articles/care_demo*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {
        id: baseCareRecord.id, catalogKey: baseCareRecord.catalogKey, title: baseCareRecord.title, category: baseCareRecord.category,
        urgency: baseCareRecord.urgency, summary: baseCareRecord.summary, keywords: baseCareRecord.keywords,
        symptoms: baseCareRecord.symptoms, avoidActions: baseCareRecord.avoidActions, observeItems: baseCareRecord.observeItems,
        diagnoseWhen: baseCareRecord.diagnoseWhen, nextStep: baseCareRecord.nextStep,
        steps: baseCareRecord.careArticleSteps.map(step => ({ ...step, actionKind: 'immediate' })), references: [], assets: [],
        updatedAt: new Date().toISOString(), localization: {},
      }, requestId: 'test-public-care' }),
    }));

    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: '管理后台' }).waitFor();
    assert.equal(await page.getByRole('heading', { name: '管理后台' }).isVisible(), true);
    assert.equal(await page.getByRole('link', { name: /Species SEO/ }).isVisible(), true);
    assert.equal(await page.getByRole('button', { name: /Product Truth 与养护内容/ }).isVisible(), true);
    assert.equal(await page.getByRole('button', { name: /Compatibility 规则/ }).isVisible(), true);
    await page.getByRole('button', { name: /Compatibility 规则/ }).click();
    await page.waitForURL('**/admin/compatibility');
    await page.getByRole('heading', { name: 'Compatibility Admin' }).waitFor();
    await page.getByRole('heading', { name: 'Species Behavior Profiles' }).waitFor();
    await page.getByRole('heading', { name: 'Reviewed Pair Rules' }).waitFor();
    assert.match(await page.locator('body').innerText(), /Reviewed Profiles[\s\S]*7[\s\S]*Reviewed Pair Rules[\s\S]*4/);
    await page.getByText('Profile / Pair Draft 已启用', { exact: true }).waitFor();
    await page.getByRole('button', { name: '创建 Profile Draft' }).first().click();
    const draftEditor = page.getByTestId('compatibility-draft-editor');
    await draftEditor.waitFor();
    assert.match(await draftEditor.innerText(), /behavior profile revision #1[\s\S]*虎皮鱼[\s\S]*reviewed evidence/i);
    await draftEditor.getByLabel(/Behavior traits/).fill('shoaling\nfin_nipping\nforaging');
    await draftEditor.getByLabel('最低群体数量').fill('8');
    await draftEditor.getByRole('button', { name: '保存 Draft' }).click();
    await page.getByText('Compatibility Draft 已保存', { exact: true }).waitFor();
    assert.match(await draftEditor.getByLabel(/Behavior traits/).inputValue(), /foraging/);
    page.once('dialog', dialog => dialog.accept());
    await draftEditor.getByRole('button', { name: '提交审核' }).click();
    await page.getByText('Compatibility revision 已提交审核', { exact: true }).waitFor();
    await draftEditor.getByText('待审核', { exact: true }).waitFor();
    assert.equal(await draftEditor.getByLabel(/Behavior traits/).isDisabled(), true);
    await draftEditor.getByTestId('profile-impact-report').waitFor();
    assert.match(await draftEditor.getByTestId('profile-impact-report').innerText(), /behavior_traits[\s\S]*minimum_group_size/);
    await draftEditor.getByTestId('profile-regression-report').waitFor();
    assert.match(await draftEditor.getByTestId('profile-regression-report').innerText(), /18 个场景[\s\S]*结果变化 1 个[\s\S]*caution → not_recommended/);
    await draftEditor.getByRole('button', { name: '批准 revision（不发布）' }).click();
    await page.getByText('Profile revision 已批准；尚未发布', { exact: true }).waitFor();
    await draftEditor.getByText('已批准', { exact: true }).waitFor();
    assert.match(await draftEditor.innerText(), /Canonical Evidence：1\/1/);
    page.once('dialog', dialog => dialog.accept());
    await draftEditor.getByRole('button', { name: '发布 reviewed version' }).click();
    await page.getByText('Profile reviewed version 已发布', { exact: true }).waitFor();
    await draftEditor.getByText('已发布', { exact: true }).waitFor();
    await page.getByText('foraging', { exact: true }).waitFor();

    await page.getByRole('button', { name: '创建 Pair Draft' }).first().click();
    const pairDraftEditor = page.getByTestId('compatibility-pair-draft-editor');
    await pairDraftEditor.waitFor();
    assert.match(await pairDraftEditor.innerText(), /pair rule revision #1[\s\S]*reviewed evidence/i);
    await pairDraftEditor.getByLabel('Verdict').selectOption('caution');
    await pairDraftEditor.getByLabel('Risk Type').fill('behavior_conflict_review');
    await pairDraftEditor.getByLabel('判断依据').fill('测试 revised pair reasoning，仍需人工审核。');
    await pairDraftEditor.getByLabel(/Mitigation/).fill('分缸优先\n持续观察');
    await pairDraftEditor.getByRole('button', { name: '保存 Pair Draft' }).click();
    await page.getByText('Pair Rule Draft 已保存', { exact: true }).waitFor();
    assert.equal(await pairDraftEditor.getByLabel('Risk Type').inputValue(), 'behavior_conflict_review');
    page.once('dialog', dialog => dialog.accept());
    await pairDraftEditor.getByRole('button', { name: '提交 Pair 审核' }).click();
    await page.getByText('Pair Rule revision 已提交审核', { exact: true }).waitFor();
    await pairDraftEditor.getByText('待审核', { exact: true }).waitFor();
    assert.equal(await pairDraftEditor.getByLabel('Risk Type').isDisabled(), true);
    await pairDraftEditor.getByTestId('pair-impact-report').waitFor();
    await pairDraftEditor.getByTestId('pair-regression-report').waitFor();
    assert.match(await pairDraftEditor.getByTestId('pair-regression-report').innerText(), /authority seq 2[\s\S]*3 个场景[\s\S]*结果变化 2 个[\s\S]*not_recommended → caution/);
    assert.match(await pairDraftEditor.getByTestId('pair-impact-report').innerText(), /verdict[\s\S]*risk_type/);
    await pairDraftEditor.getByRole('button', { name: '批准 Pair revision（不发布）' }).click();
    await page.getByText('Pair Rule revision 已批准；尚未发布', { exact: true }).waitFor();
    await pairDraftEditor.getByText('已批准', { exact: true }).waitFor();
    assert.match(await pairDraftEditor.innerText(), /Canonical Evidence：2\/2/);
    page.once('dialog', dialog => dialog.accept());
    await pairDraftEditor.getByRole('button', { name: '发布 Pair reviewed version' }).click();
    await page.getByText('Pair Rule reviewed version 已发布', { exact: true }).waitFor();
    await pairDraftEditor.getByText('已发布', { exact: true }).waitFor();
    await page.getByText('behavior_conflict_review', { exact: true }).waitFor();

    const compatibilityOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(compatibilityOverflow, false, `${viewport.width}px Compatibility Admin should not overflow horizontally`);
    await page.getByRole('button', { name: '返回管理后台' }).click();
    await page.waitForURL('**/admin/content');
    await page.getByRole('button', { name: /Product Truth 与养护内容/ }).click();
    await page.waitForURL('**/admin/product-content');
    await page.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
    assert.equal(await page.getByRole('button', { name: '物种产品数据' }).isVisible(), true);
    await page.getByText('测试灯鱼', { exact: true }).waitFor();
    await page.getByText('测试灯鱼', { exact: true }).click();
    await page.getByLabel(/中文名/).fill('测试灯鱼已更新');
    await page.getByLabel(/温度范围/).fill('5-8°C');
    await page.getByLabel(/换水周期/).fill('5');
    const impactPreview = page.getByTestId('content-impact-preview');
    await impactPreview.getByText('展示内容', { exact: true }).first().waitFor();
    assert.match(await impactPreview.innerText(), /发布后直接更新[\s\S]*Encyclopedia/);
    assert.match(await impactPreview.innerText(), /需单独复核[\s\S]*Search \/ Collection[\s\S]*SEO/);
    const beforeAfter = page.getByTestId('product-before-after-preview');
    await beforeAfter.getByText('Encyclopedia Before / After', { exact: true }).waitFor();
    assert.match(await beforeAfter.innerText(), /当前已发布[\s\S]*22-26°C[\s\S]*约 7 天[\s\S]*准备发布[\s\S]*5-8°C[\s\S]*约 5 天/);
    assert.equal(await beforeAfter.locator('[data-preview-field="waterChangeCycleDays"]').count(), 2);
    assert.equal(await beforeAfter.locator('[data-preview-field="waterTemperatureText"]').count(), 2);
    await page.getByRole('button', { name: '保存修改' }).click();
    await page.getByText('内容已保存', { exact: true }).waitFor();
    assert.equal(savedName, '测试灯鱼已更新');
    assert.match(await impactPreview.innerText(), /当前草稿相对已发布版本/);
    const compatibilityRegression = page.getByTestId('compatibility-regression-preview');
    await compatibilityRegression.getByText('Compatibility 回归（模拟）', { exact: true }).waitFor();
    assert.match(await compatibilityRegression.innerText(), /个组合有变化/);
    await page.getByRole('button', { name: '发布', exact: true }).click();
    const publishDialog = page.getByRole('dialog');
    await publishDialog.getByRole('heading', { name: '确认发布' }).waitFor();
    assert.match(await publishDialog.innerText(), /Encyclopedia/);
    assert.match(await publishDialog.innerText(), /Search \/ Collection/);
    assert.match(await publishDialog.innerText(), /Compatibility 模拟：[\s\S]*组合结果\/规则发生变化/);
    await publishDialog.getByRole('button', { name: '取消' }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
    await page.getByRole('button', { name: /测试灯鱼已更新/ }).click();
    const persistedImpact = page.getByTestId('content-impact-preview');
    await persistedImpact.getByText('展示内容', { exact: true }).first().waitFor();
    assert.match(await persistedImpact.innerText(), /当前草稿相对已发布版本/);
    assert.match(await persistedImpact.innerText(), /测试灯鱼[\s\S]*测试灯鱼已更新/);
    const persistedBeforeAfter = page.getByTestId('product-before-after-preview');
    assert.match(await persistedBeforeAfter.innerText(), /22-26°C[\s\S]*5-8°C/);
    assert.match(await persistedBeforeAfter.innerText(), /约 7 天[\s\S]*约 5 天/);
    await page.getByTestId('compatibility-regression-preview').getByText('Compatibility 回归（模拟）', { exact: true }).waitFor();
    await page.getByRole('button', { name: '养护文章' }).click();
    await page.getByRole('button', { name: /换水后观察/ }).waitFor();
    await page.getByRole('button', { name: /换水后观察/ }).click();
    const careSeoProjection = page.getByTestId('care-seo-projection');
    await careSeoProjection.waitFor();
    const initialCareSeoText = await careSeoProjection.innerText();
    assert.match(initialCareSeoText, /Published v1/i);
    assert.match(initialCareSeoText, /Route 未就绪/i);
    assert.match(initialCareSeoText, /换水后观察 \| AquaGuide/);
    await page.getByLabel('标题').fill('换水后观察草稿修改');
    await page.getByLabel('优先级').selectOption('高优先级');
    const careImpact = page.getByTestId('content-impact-preview');
    await careImpact.getByText('Care 流程', { exact: true }).first().waitFor();
    assert.match(await careImpact.innerText(), /发布后直接更新[\s\S]*Care Guide[\s\S]*Aquarium[\s\S]*Identify/);
    await page.getByRole('button', { name: '保存修改' }).click();
    await page.getByText('内容已保存', { exact: true }).waitFor();
    assert.match(await careImpact.innerText(), /当前草稿相对已发布版本/);
    const persistedCareSeoProjection = await careSeoProjection.innerText();
    assert.match(persistedCareSeoProjection, /Published v1[\s\S]*换水后观察 \| AquaGuide/);
    assert.doesNotMatch(persistedCareSeoProjection, /换水后观察草稿修改/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, `${viewport.width}px should not overflow horizontally`);
    await page.close();
  }

  const forbiddenPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await forbiddenPage.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), {
    key: authStorageKey,
    session: fakeSession,
  });
  await forbiddenPage.route('**/api/v1/admin/species', route => route.fulfill({
    status: 403,
    contentType: 'application/json',
    body: JSON.stringify({ error: { code: 'FORBIDDEN', message: '没有内容管理权限。' }, requestId: 'test-forbidden' }),
  }));
  await forbiddenPage.goto(`${baseUrl}/admin/product-content`, { waitUntil: 'networkidle' });
  await forbiddenPage.getByText('没有内容管理权限。', { exact: true }).waitFor();
  assert.equal(await forbiddenPage.getByRole('button', { name: '重新加载' }).isVisible(), true);
  await forbiddenPage.close();
  console.log('admin authority UI verified: hub routing, Product/Care edit/save, forbidden state and 390/1280px layout');
} finally {
  await browser.close();
  await vite.close();
}

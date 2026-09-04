import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

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

const baseCareRecord = {
  id: 'be1732a3-27d0-4820-986c-2e932990f571',
  catalogKey: 'care_demo', title: '换水后观察', category: '水质', urgency: '日常', summary: '先观察鱼只状态。',
  symptoms: ['应激'], avoidActions: ['不要立即加药'], observeItems: ['呼吸'], diagnoseWhen: ['持续异常'],
  nextStep: '必要时进一步诊断', keywords: ['换水'], status: 'draft', version: 1,
  careArticleSteps: [{ id: 'ce1732a3-27d0-4820-986c-2e932990f572', position: 0, instruction: '先观察', durationLabel: '10 分钟' }],
  careArticleAssets: [],
};

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
    await page.route('**/api/v1/admin/care-articles/*', async route => {
      const body = route.request().postDataJSON();
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
    assert.equal(await page.getByRole('heading', { name: '管理后台' }).isVisible(), true);
    assert.equal(await page.getByRole('link', { name: /Species SEO/ }).isVisible(), true);
    assert.equal(await page.getByRole('button', { name: /Product Truth 与养护内容/ }).isVisible(), true);
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
    await page.getByLabel('优先级').selectOption('高优先级');
    const careImpact = page.getByTestId('content-impact-preview');
    await careImpact.getByText('Care 流程', { exact: true }).first().waitFor();
    assert.match(await careImpact.innerText(), /发布后直接更新[\s\S]*Care Guide[\s\S]*Aquarium[\s\S]*Identify/);
    await page.getByRole('button', { name: '保存修改' }).click();
    await page.getByText('内容已保存', { exact: true }).waitFor();
    assert.match(await careImpact.innerText(), /当前草稿相对已发布版本/);
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

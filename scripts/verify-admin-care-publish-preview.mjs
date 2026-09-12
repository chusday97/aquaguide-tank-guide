import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const repoRoot = resolve(import.meta.dirname, '..');
const supabaseUrl = 'http://127.0.0.1:54321';
process.env.VITE_SUPABASE_URL = supabaseUrl;
process.env.VITE_SUPABASE_ANON_KEY = 'care-publish-preview-test-anon-key';
const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
const aquariumStateJson = JSON.stringify({
  version: 1, currentAquariumId: '', aquariums: [], wishlist: [], dismissedRecommendations: [],
  diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [],
  careEvents: [], riskReminderState: {}, updatedAt: '2026-09-04T00:00:00.000Z',
});
const fakeSession = {
  access_token: 'care-publish-preview-test-token',
  refresh_token: 'care-publish-preview-test-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: 'f9a24e73-bdf4-4a9b-85cf-c0dfbcf37c0d',
    aud: 'authenticated', role: 'authenticated',
    email: 'admin-care-preview@example.com',
    app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString(),
  },
};
const oldPublishedTitle = '发布前新鱼入缸指南';
const nextPublishedTitle = '发布后新鱼入缸指南';
let publishedTitle = oldPublishedTitle;
let adminRecord = {
  id: '2d8d0f4b-5d2e-4f29-8bc3-989e7eac04b7',
  catalogKey: 'guide_new_fish_acclimation',
  title: oldPublishedTitle,
  category: '新鱼入缸', urgency: '日常',
  summary: '发布边界测试养护文章。',
  symptoms: ['新鱼刚入缸'],
  avoidActions: ['不要直接倒入运输水'],
  observeItems: ['呼吸与游姿'],
  diagnoseWhen: ['持续异常时进一步判断'],
  nextStep: '保持环境稳定并观察。',
  keywords: ['新鱼', '过水'],
  status: 'published', version: 1,
  careArticleSteps: [{ id: 'step-1', position: 1, instruction: '缓慢过温过水。' }],
  careArticleAssets: [],
};

const publicCare = () => ({
  id: adminRecord.id, catalogKey: adminRecord.catalogKey, title: publishedTitle,
  category: adminRecord.category, urgency: adminRecord.urgency, summary: adminRecord.summary,
  symptoms: adminRecord.symptoms,
  steps: adminRecord.careArticleSteps.map(step => ({ id: step.id, position: step.position, instruction: step.instruction })),
  avoidActions: adminRecord.avoidActions,
  observeItems: adminRecord.observeItems,
  diagnoseWhen: adminRecord.diagnoseWhen,
  nextStep: adminRecord.nextStep,
  keywords: adminRecord.keywords,
  assets: [],
});

const attachRoutes = async (page) => {
  await page.route('**/api/v1/content-bootstrap?*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      data: {
        species: [], careArticles: [publicCare()],
        authority: 'publication-snapshot', publicationCounts: { species: 0, care: 1 },
      },
      requestId: 'care-publish-preview-bootstrap',
    }),
  }));
  await page.route('**/api/v1/admin/species', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ data: [], requestId: 'care-publish-preview-species-list' }),
  }));
};
const attachAdminRoutes = async (page) => {
  await page.route('**/api/v1/admin/care-articles', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ data: [adminRecord], requestId: 'care-publish-preview-list' }),
  }));
  await page.route('**/api/v1/admin/care-articles/*', async route => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    const body = route.request().postDataJSON();
    adminRecord = {
      ...adminRecord,
      ...body,
      careArticleSteps: (body.steps || []).map((step, index) => ({
        id: `step-${index + 1}`, position: index + 1, instruction: step.instruction, durationLabel: step.durationLabel,
      })),
      status: 'draft',
      version: adminRecord.version + 1,
    };
    delete adminRecord.steps;
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: adminRecord, requestId: 'care-publish-preview-save' }),
    });
  });
  await page.route('**/api/v1/admin/content/care/*/publish', async route => {
    publishedTitle = adminRecord.title;
    adminRecord = { ...adminRecord, status: 'published', version: adminRecord.version + 1 };
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: adminRecord, requestId: 'care-publish-preview-publish' }),
    });
  });
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

const newPreviewPage = async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(({ state }) => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('aquarium_app_state_v1', state);
  }, { state: aquariumStateJson });
  await attachRoutes(page);
  return page;
};
try {
  const adminPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await adminPage.addInitScript(({ key, session, state }) => {
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem('aquarium_app_state_v1', state);
  }, {
    key: authStorageKey,
    session: fakeSession,
    state: aquariumStateJson,
  });
  await attachRoutes(adminPage);
  await attachAdminRoutes(adminPage);

  await adminPage.goto(`${baseUrl}/admin/product-content`, { waitUntil: 'domcontentloaded' });
  await adminPage.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
  await adminPage.getByRole('button', { name: '养护文章', exact: true }).click();
  await adminPage.getByText(oldPublishedTitle, { exact: true }).waitFor();
  await adminPage.getByText(oldPublishedTitle, { exact: true }).click();
  await adminPage.getByLabel('标题').fill(nextPublishedTitle);
  await adminPage.getByRole('button', { name: '保存修改' }).click();
  await adminPage.getByText('内容已保存', { exact: true }).waitFor();
  await adminPage.getByText('草稿', { exact: true }).first().waitFor();
  assert.equal(adminRecord.status, 'draft');
  assert.equal(publishedTitle, oldPublishedTitle, 'Save must not advance the public Care version');
  const beforePublish = await newPreviewPage();
  await beforePublish.goto(`${baseUrl}/care`, { waitUntil: 'domcontentloaded' });
  const beforeInput = beforePublish.locator('#care-search [role="combobox"]');
  await beforeInput.waitFor({ state: 'visible' });
  await beforeInput.fill(oldPublishedTitle);
  await beforePublish.locator('#care-results').getByText(oldPublishedTitle, { exact: true }).first().waitFor();
  assert.equal(await beforePublish.getByText(nextPublishedTitle, { exact: true }).count(), 0,
    'Draft Care title must remain invisible in user Preview before Publish');
  assert.equal(await beforePublish.evaluate(() => localStorage.getItem('aquarium_app_state_v1')), aquariumStateJson);
  await beforePublish.close();

  await adminPage.getByRole('button', { name: '发布', exact: true }).click();
  await adminPage.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
  await adminPage.getByText('内容已发布', { exact: true }).waitFor();
  assert.equal(adminRecord.status, 'published');
  assert.equal(publishedTitle, nextPublishedTitle);

  const afterPublish = await newPreviewPage();
  await afterPublish.goto(`${baseUrl}/care`, { waitUntil: 'domcontentloaded' });
  const afterInput = afterPublish.locator('#care-search [role="combobox"]');
  await afterInput.waitFor({ state: 'visible' });
  await afterInput.fill(nextPublishedTitle);
  await afterPublish.locator('#care-results').getByText(nextPublishedTitle, { exact: true }).first().waitFor();
  assert.equal(await afterPublish.getByText(oldPublishedTitle, { exact: true }).count(), 0,
    'Published Care title must replace the previous public version in Preview');
  assert.equal(await afterPublish.evaluate(() => localStorage.getItem('aquarium_app_state_v1')), aquariumStateJson);
  assert.equal(await adminPage.evaluate(() => localStorage.getItem('aquarium_app_state_v1')), aquariumStateJson);
  await afterPublish.close();
  await adminPage.close();

  console.log('admin Care publish preview verified: Save stays private; Publish advances Care runtime');
} finally {
  await browser.close();
  await vite.close();
}

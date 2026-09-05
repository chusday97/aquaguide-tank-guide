import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const repoRoot = resolve(import.meta.dirname, '..');
const supabaseUrl = 'http://127.0.0.1:54321';
process.env.VITE_SUPABASE_URL = supabaseUrl;
process.env.VITE_SUPABASE_ANON_KEY = 'publish-preview-test-anon-key';
const authStorageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
const aquariumStateJson = JSON.stringify({
  version: 1, currentAquariumId: '', aquariums: [], wishlist: [], dismissedRecommendations: [],
  diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [],
  careEvents: [], riskReminderState: {}, updatedAt: '2026-09-04T00:00:00.000Z',
});
const fakeSession = {
  access_token: 'publish-preview-test-token',
  refresh_token: 'publish-preview-test-refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: '8b3f71bd-a1be-4a18-b7f8-5478cf55dc61',
    aud: 'authenticated', role: 'authenticated',
    email: 'admin-publish-preview@example.com',
    app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString(),
  },
};
const oldPublishedName = '发布前极火虾';
const nextPublishedName = '发布后极火虾';
let publishedName = oldPublishedName;
let adminRecord = {
  id: 'ae1732a3-27d0-4820-986c-2e932990f570',
  catalogKey: 'sp_0001',
  name: oldPublishedName,
  scientificName: 'Neocaridina davidi',
  category: '虾螺蟹', difficulty: 'Easy',
  waterTemperatureText: '20-26°C', phLevelText: '6.5-8.0',
  waterChangeCycleDays: 7,
  description: '发布边界测试物种。', diet: '杂食。', tankSizeText: '至少 20 升',
  temperament: 'Peaceful', sizeClass: 'Small',
  housingMode: '适合混养', housingReason: '温和。',
  isCustom: false, searchTerms: [], status: 'published', version: 1,
  speciesAssets: [],
};

const publicSpecies = () => ({
  id: adminRecord.id, catalogKey: adminRecord.catalogKey, name: publishedName,
  scientificName: adminRecord.scientificName, category: adminRecord.category,
  difficulty: adminRecord.difficulty, waterTemperatureText: adminRecord.waterTemperatureText,
  phLevelText: adminRecord.phLevelText,
  waterChangeCycleDays: adminRecord.waterChangeCycleDays,
  description: adminRecord.description, diet: adminRecord.diet,
  tankSizeText: adminRecord.tankSizeText, temperament: adminRecord.temperament,
  sizeClass: adminRecord.sizeClass, housingMode: adminRecord.housingMode,
  housingReason: adminRecord.housingReason,
  assets: [],
});

const attachRoutes = async (page) => {
  await page.route('**/api/v1/content-bootstrap?*', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      data: {
        species: [publicSpecies()], careArticles: [],
        authority: 'publication-snapshot', publicationCounts: { species: 1, care: 0 },
      },
      requestId: 'publish-preview-bootstrap',
    }),
  }));
  await page.route('**/api/v1/admin/species', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ data: [adminRecord], requestId: 'publish-preview-list' }),
  }));
};
const attachAdminMutations = async (page) => {
  await page.route('**/api/v1/admin/species/*', async route => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    const body = route.request().postDataJSON();
    adminRecord = {
      ...adminRecord,
      ...body,
      status: 'draft',
      version: adminRecord.version + 1,
    };
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: adminRecord, requestId: 'publish-preview-save' }),
    });
  });
  await page.route('**/api/v1/admin/content/species/*/publish', async route => {
    publishedName = adminRecord.name;
    adminRecord = { ...adminRecord, status: 'published', version: adminRecord.version + 1 };
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ data: adminRecord, requestId: 'publish-preview-publish' }),
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
  await attachAdminMutations(adminPage);
  await adminPage.goto(`${baseUrl}/admin/product-content`, { waitUntil: 'domcontentloaded' });
  await adminPage.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
  await adminPage.getByText(oldPublishedName, { exact: true }).click();
  await adminPage.getByLabel(/中文名/).fill(nextPublishedName);
  await adminPage.getByRole('button', { name: '保存修改' }).click();
  await adminPage.getByText('内容已保存', { exact: true }).waitFor();
  await adminPage.getByText('草稿', { exact: true }).first().waitFor();
  assert.equal(adminRecord.status, 'draft');
  assert.equal(publishedName, oldPublishedName, 'Save must not advance the public Product version');

  const beforePublish = await newPreviewPage();
  await beforePublish.goto(`${baseUrl}/encyclopedia?species=sp_0001`, { waitUntil: 'domcontentloaded' });
  await beforePublish.getByText(oldPublishedName, { exact: true }).first().waitFor();
  assert.equal(await beforePublish.getByText(nextPublishedName, { exact: true }).count(), 0,
    'Draft Product value must remain invisible in user Preview before Publish');
  assert.equal(await beforePublish.evaluate(() => localStorage.getItem('aquarium_app_state_v1')), aquariumStateJson);
  await beforePublish.close();

  await adminPage.getByRole('button', { name: '发布', exact: true }).click();
  await adminPage.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
  await adminPage.getByText('内容已发布', { exact: true }).waitFor();
  assert.equal(adminRecord.status, 'published');
  assert.equal(publishedName, nextPublishedName);

  const afterPublish = await newPreviewPage();
  await afterPublish.goto(`${baseUrl}/encyclopedia?species=sp_0001`, { waitUntil: 'domcontentloaded' });
  await afterPublish.getByText(nextPublishedName, { exact: true }).first().waitFor();
  assert.equal(await afterPublish.getByText(oldPublishedName, { exact: true }).count(), 0,
    'Published Product value must replace the previous public version in Preview');
  assert.equal(await afterPublish.evaluate(() => localStorage.getItem('aquarium_app_state_v1')), aquariumStateJson);
  assert.equal(await adminPage.evaluate(() => localStorage.getItem('aquarium_app_state_v1')), aquariumStateJson);
  await afterPublish.close();
  await adminPage.close();

  console.log('admin Product publish preview verified: Save stays private; Publish advances Encyclopedia runtime');
} finally {
  await browser.close();
  await vite.close();
}

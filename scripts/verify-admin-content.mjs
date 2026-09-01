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
    await page.route('**/api/v1/admin/species', async route => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { ...baseRecord, ...body }, requestId: 'test-create' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [baseRecord], requestId: 'test-list' }) });
    });
    await page.route('**/api/v1/admin/species/*', async route => {
      const body = route.request().postDataJSON();
      savedName = body.name;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { ...baseRecord, ...body, version: 2 }, requestId: 'test-update' }) });
    });

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
    await page.getByRole('button', { name: '保存修改' }).click();
    await page.getByText('内容已保存', { exact: true }).waitFor();
    assert.equal(savedName, '测试灯鱼已更新');
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

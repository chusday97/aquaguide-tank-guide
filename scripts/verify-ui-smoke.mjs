import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'zh-CN',
  isMobile: true,
  hasTouch: true,
  acceptDownloads: true,
});
await context.addInitScript(() => {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('aquaguide_locale', 'zh-CN');
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify({
    version: 1,
    currentAquariumId: 'smoke-tank',
    aquariums: [{
      id: 'smoke-tank', name: 'Smoke Test Tank',
      fishes: [{ id: 'smoke-stock', fishId: 'sp_0001', quantity: 3, entryDate: today }],
      dimensions: { length: '60', width: '40', height: '40' }, waterType: 'Freshwater', targetTemperature: '25',
      equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' }, plants: [], hardscape: [],
      waterChangeHistory: [],
    }],
    wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
    onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
    updatedAt: new Date().toISOString(),
  }));
});
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });

const page = await context.newPage();
page.setDefaultTimeout(30_000);
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

const open = async path => {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  assert.ok((await page.locator('body').innerText()).trim().length > 0, `${path} must render visible content`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `${path} must not overflow horizontally`);
};

try {
  for (const path of ['/aquarium', '/encyclopedia', '/encyclopedia?mode=browse', '/care', '/collection', '/settings', '/welcome']) {
    await open(path);
  }

  await open('/encyclopedia?mode=browse');
  const search = page.locator('input[aria-label="搜索鱼、虾、螺、水草或用途"]');
  await search.fill('草');
  await page.getByRole('button', { name: '搜索', exact: true }).last().click();
  await page.waitForTimeout(200);
  assert.ok(await page.locator('[data-species-card]').count() > 0, 'browse search must return species cards');
  await search.fill('不存在关键词xyz');
  await page.getByRole('button', { name: '搜索', exact: true }).last().click();
  assert.match(await page.locator('body').innerText(), /没有找到相关条目/, 'empty search must explain the empty state');

  await open('/encyclopedia');
  const scene = page.locator('.interactive-tank-shell');
  assert.equal(await scene.locator('[data-scene-node]').count(), 6, 'interactive atlas must show six scene species');
  assert.equal(await page.locator('#aquarium-discovery').count(), 0, 'encyclopedia must not expose the retired homepage queue');

  await open('/aquarium');
  assert.equal(await page.locator('[data-tank-species-entry]').count(), 1, 'aquarium must expose one livestock entry');
  assert.equal(await page.locator('#aquarium-discovery').count(), 0, 'aquarium must not duplicate encyclopedia discovery');
  assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  console.log('canonical UI smoke passed: routes, browse search, interactive atlas and aquarium ownership');
} finally {
  await context.close();
  await browser.close();
}

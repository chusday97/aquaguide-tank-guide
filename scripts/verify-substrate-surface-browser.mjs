import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const seededAquarium = {
  id: 'substrate-browser-tank',
  name: '底砂回归鱼缸',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '35' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  plants: [],
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  startedAt: '2026-08-01',
  startedAtSource: 'created',
};

const seededState = {
  version: 1,
  currentAquariumId: seededAquarium.id,
  aquariums: [seededAquarium],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'skipped', viewedSpecies: false, taskCardDismissed: false },
  updatedAt: new Date().toISOString(),
};

const ensureThreeLoaded = async page => {
  const marker = page.locator('[data-substrate]').first();
  try {
    await marker.waitFor({ state: 'attached', timeout: 5_000 });
  } catch {
    const loadButton = page.getByRole('button', { name: '加载 3D 鱼缸' });
    if (await loadButton.isVisible().catch(() => false)) await loadButton.click();
    await marker.waitFor({ state: 'attached', timeout: 10_000 });
  }
  return marker;
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(state => {
    localStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, seededState);
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const initialMarker = await ensureThreeLoaded(page);
  assert.equal(await initialMarker.getAttribute('data-substrate'), 'none', 'bare-bottom aquarium must not render an invented default substrate');

  await page.getByRole('button', { name: '鱼缸设置' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('鱼缸设置', { exact: true }).waitFor();
  await dialog.getByRole('button', { name: /底砂/ }).first().click();
  await dialog.getByRole('button', { name: /黑金沙/ }).click();
  await dialog.getByRole('button', { name: '保存设置' }).click();

  await page.waitForFunction(() => {
    const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
    return state.aquariums?.find(item => item.id === 'substrate-browser-tank')?.substrate === '黑金沙';
  });

  const renderedMarker = page.locator('[data-substrate="黑金沙"]').first();
  await renderedMarker.waitFor({ state: 'attached' });
  assert.equal(await renderedMarker.getAttribute('data-substrate'), '黑金沙', '3D aquarium must consume the substrate saved by the settings flow');
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);

  console.log('Substrate browser regression PASS: bare bottom -> choose 黑金沙 -> repository save -> 3D scene consumes 黑金沙.');
} finally {
  await browser.close();
}

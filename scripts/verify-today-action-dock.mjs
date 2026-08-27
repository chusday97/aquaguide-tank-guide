import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || process.env.AQUAGUIDE_URL || 'http://127.0.0.1:4317';
const browser = await chromium.launch({ headless: true });
const state = {
  version: 1,
  onboarding: { status: 'skipped' },
  currentAquariumId: 'today-action-e2e',
  aquariums: [{ id: 'today-action-e2e', name: '今日行动验收缸', fishes: [], dimensions: { length: '60', width: '35', height: '40' }, waterType: 'Freshwater', targetTemperature: '25', equipment: {} }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: [], updatedAt: new Date().toISOString(),
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await context.addInitScript((seed) => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(seed));
    localStorage.setItem('aquariums', JSON.stringify(seed.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'networkidle', timeout: 30_000 });
  const handle = page.locator('[data-today-action-handle]');
  await handle.waitFor();
  const dock = page.locator('[data-daily-action]');
  assert.equal(await dock.getAttribute('data-panel-level'), 'collapsed');
  await handle.click();
  assert.equal(await dock.getAttribute('data-panel-level'), 'expanded');
  assert.equal(await handle.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await dock.getAttribute('data-panel-level'), 'collapsed');
  await handle.click();
  const box = await handle.boundingBox();
  assert.ok(box);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 40);
  await page.mouse.up();
  assert.equal(await dock.getAttribute('data-panel-level'), 'half');
  await context.close();
  console.log('today action dock: click, Escape, and drag snap states passed');
} finally {
  await browser.close();
}

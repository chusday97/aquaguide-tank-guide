import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
const today = new Date().toISOString().slice(0, 10);

const state = {
  version: 1,
  currentAquariumId: 'runtime-matrix-tank',
  aquariums: [{
    id: 'runtime-matrix-tank', name: 'Runtime matrix tank',
    fishes: [{ id: 'matrix-stock-1', fishId: 'sp_0439', quantity: 5, entryDate: today }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater', targetTemperature: '25', substrate: '水草泥', plants: ['sp_0076'], hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
  }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [],
  feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const routes = [
  ['/aquarium', '#aquarium-tank'],
  ['/encyclopedia', '.encyclopedia-workspace .interactive-tank-shell'],
  ['/care', '.care-workspace-shell .interactive-care-scene'],
  ['/collection', '[data-collection-focus]'],
  ['/identify', 'input[type="file"]'],
  ['/settings', '[data-settings-workspace]'],
  ['/search?q=孔雀鱼', 'main [role="combobox"]'],
];
const seedPage = page => page.addInitScript(saved => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
}, state);

const results = [];
try {
  for (const width of [1440, 1024, 768, 390]) {
    for (const [route, anchor] of routes) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await seedPage(page);
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(route === '/aquarium' ? 900 : 450);
      const primary = page.locator(anchor).first();
      await primary.waitFor({ state: 'attached', timeout: 10_000 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const openDialogs = await page.locator('[data-dialog-surface][data-open]').count();
      const bodyLocked = await page.evaluate(() => document.body.classList.contains('modal-open'));
      assert.ok(overflow <= 1, `${width}px ${route} horizontal overflow: ${overflow}px`);
      assert.equal(openDialogs, 0, `${width}px ${route} must not open a dialog on initial load`);
      assert.equal(bodyLocked, false, `${width}px ${route} must not lock body on initial load`);
      assert.deepEqual(errors, [], `${width}px ${route} page errors: ${errors.join(' | ')}`);
      results.push({ width, route, status: 'PASS' });
      await page.close();
    }
  }
  console.log(`Page runtime matrix: ${results.length}/${routes.length * 4} PASS`);
} finally {
  await browser.close();
}

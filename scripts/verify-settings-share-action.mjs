import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const today = new Date().toISOString().slice(0, 10);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
await context.addInitScript((date) => {
  localStorage.setItem('aquaguide_locale', 'zh-CN');
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify({
    version: 1,
    currentAquariumId: 'settings-share-test-tank',
    aquariums: [{
      id: 'settings-share-test-tank',
      name: 'Settings share test tank',
      fishes: [],
      dimensions: { length: '60', width: '40', height: '40' },
      waterType: 'Freshwater',
      targetTemperature: '25',
      equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
      plants: [], hardscape: [], waterChangeHistory: [date],
    }],
    wishlist: [], careFavorites: {}, dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [],
    deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
    onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
    updatedAt: new Date().toISOString(),
  }));
}, today);

try {
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  await page.goto(`${baseUrl}/settings`, { waitUntil: 'networkidle' });
  const section = page.locator('#shared-reports');
  assert.equal(await section.getByText('已分享报告', { exact: true }).count(), 1, 'Settings must expose the sharing section');
  const action = section.getByRole('button', { name: '打开导出与分享', exact: true });
  assert.equal(await action.count(), 1, 'Settings sharing section must expose its real destination');
  await action.click();
  await page.waitForURL(/\/aquarium\?action=exports/);
  await page.getByText('导出与分享', { exact: true }).waitFor({ state: 'visible' });
  assert.equal(await page.getByText('导出与分享', { exact: true }).count(), 1, 'sharing CTA must land on the export/share center');
  console.log('Settings share action regression: PASS');
} finally {
  await context.close();
  await browser.close();
}

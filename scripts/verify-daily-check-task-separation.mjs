import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1,
  currentAquariumId: 'tank-daily-separation',
  aquariums: [{
    id: 'tank-daily-separation',
    name: '巡检语义测试缸',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0001',
      quantity: 6,
      entryDate: today,
      lastWaterChangeDate: today,
      batches: [{
        id: 'batch-1',
        quantity: 6,
        entryDate: today,
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: new Date().toISOString(),
      }],
    }],
    lastWaterChangeDate: today,
    waterChangeHistory: [today],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  onboarding: {
    version: 1,
    status: 'completed',
    goal: 'build_tank',
    viewedSpecies: true,
    aquariumConfigured: true,
    taskCardDismissed: true,
  },
  updatedAt: new Date().toISOString(),
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const todayTask = page.locator('[data-daily-action="daily_check"]');
  await todayTask.waitFor();
  const scope = todayTask.locator('[data-daily-check-scope="records-today"]');
  await scope.waitFor();
  const scopeText = (await scope.textContent()) || '';
  assert.match(scopeText, /写入今天的巡检记录/, 'Daily Tank Check must say that it writes today’s patrol record.');
  assert.match(scopeText, /快速检查只用于症状排查，不会完成今日巡检/, 'Care Quick Check must be visibly separated from today’s patrol task.');

  const startToday = todayTask.getByRole('button', { name: '开始今日检查', exact: true });
  await startToday.waitFor();
  await startToday.click();

  const dailyDialog = page.getByRole('dialog').filter({ hasText: '每日鱼缸检查' });
  await dailyDialog.waitFor();
  assert.equal(
    await page.evaluate(() => (JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}').diagnosisRecords || []).length),
    0,
    'opening Daily Tank Check must not mark it complete before the user finishes and saves.',
  );
  await page.keyboard.press('Escape');

  // Care Quick Check is a detail-level diagnosis action, not a root /care#care-search control.
  // Use the same topic deep-link contract exercised elsewhere in the Care browser regressions.
  await page.goto(`${baseUrl}/care?topic=guide_water_deteriorate`, { waitUntil: 'domcontentloaded' });
  const careDialog = page.getByRole('dialog').filter({ hasText: '水质变差怎么办？' });
  await careDialog.waitFor();
  await careDialog.getByRole('button', { name: '开始快速检查', exact: true }).waitFor();
  assert.equal(
    await careDialog.locator('[data-daily-check-scope="records-today"]').count(),
    0,
    'Care symptom Quick Check must not present itself as the record-producing Daily Tank Check.',
  );
  assert.equal(
    await page.evaluate(() => (JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}').diagnosisRecords || []).length),
    0,
    'visiting Care Quick Check must not complete today’s aquarium patrol record.',
  );
  assert.deepEqual(pageErrors, [], `daily-check separation path must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('Daily-check separation browser path passed: today task is record-producing; Care Quick Check remains symptom troubleshooting.');
} finally {
  await browser.close();
}

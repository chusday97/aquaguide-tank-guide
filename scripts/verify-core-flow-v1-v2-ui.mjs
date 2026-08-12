import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const pad = value => String(value).padStart(2, '0');
const localDateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const baseState = {
  version: 1,
  currentAquariumId: 'tank-1',
  aquariums: [{
    id: 'tank-1',
    name: '核心流程测试缸',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: '2026-07-20',
      batches: [{ id: 'batch-1', quantity: 4, entryDate: '2026-07-20', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: '2026-07-20T00:00:00.000Z' }],
    }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
    waterChangeHistory: [],
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, taskCardDismissed: false, aquariumConfigured: true },
  updatedAt: new Date().toISOString(),
};

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, baseState);

  await page.goto(`${baseUrl}/aquarium?action=water-change`, { waitUntil: 'domcontentloaded' });
  const dialog = page.getByRole('dialog').filter({ hasText: '换水记录' });
  await dialog.waitFor();

  const nextMonth = dialog.getByRole('button', { name: '下个月' });
  assert.equal(await nextMonth.isDisabled(), true, 'current-month water log must not navigate into a future month');

  const clock = await page.evaluate(() => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12);
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 12);
    const twoDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 12);
    return {
      todayMonth: today.getMonth(),
      tomorrowMonth: tomorrow.getMonth(),
      tomorrowDay: tomorrow.getDate(),
      yesterdayDay: yesterday.getDate(),
      yesterdayKey: `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`,
      twoDaysAgoDay: twoDaysAgo.getDate(),
      twoDaysAgoKey: `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`,
    };
  });
  assert.equal(clock.tomorrowMonth, clock.todayMonth, 'browser regression assumes a non-month-end current date');

  const tomorrowButton = dialog.getByRole('button', { name: String(clock.tomorrowDay), exact: true });
  assert.equal(await tomorrowButton.isDisabled(), true, 'tomorrow must be visibly disabled in the water-change calendar');

  await dialog.getByRole('button', { name: String(clock.yesterdayDay), exact: true }).click();
  await dialog.getByRole('button', { name: '记录这天换水' }).click();
  await dialog.getByText(/已记录换水/).waitFor();

  const afterSave = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1')));
  const savedTank = afterSave.aquariums.find(item => item.id === 'tank-1');
  assert.ok(savedTank.waterChangeHistory.includes(clock.yesterdayKey), 'saved past date must enter real waterChangeHistory');
  assert.equal(savedTank.lastWaterChangeDate.slice(0, 10), clock.yesterdayKey, 'aquarium lastWaterChangeDate must derive from the latest real history item');
  assert.ok(savedTank.fishes.every(item => item.lastWaterChangeDate?.slice(0, 10) === clock.yesterdayKey), 'all livestock water-change dates must stay synchronized with the aquarium');

  await dialog.getByRole('button', { name: String(clock.twoDaysAgoDay), exact: true }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function patchedSetItem(key, value) {
      if (key === 'aquarium_app_state_v1') throw new Error('RAW_STORAGE_SECRET should never reach the user');
      return original.call(this, key, value);
    };
  });
  await dialog.getByRole('button', { name: '记录这天换水' }).click();
  const error = dialog.getByRole('alert');
  await error.waitFor();
  assert.equal((await error.textContent())?.trim(), '换水记录没有保存成功，请重试。');
  assert.equal((await dialog.textContent()).includes('RAW_STORAGE_SECRET'), false, 'raw storage failures must never be rendered in the UI');

  console.log('Core-flow browser regression passed: water task deep-link, future-date guard, synchronized success state, and sanitized persistence failure.');
  await page.close();
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });

const state = {
  version: 1,
  currentAquariumId: 'tank-1',
  aquariums: [{
    id: 'tank-1', name: '时间线测试缸', startedAt: '2026-07-01T08:00:00.000Z', startedAtSource: 'user', startedAtConfirmedAt: '2026-07-01T08:00:00.000Z',
    fishes: [{ id: 'stock-1', fishId: 'sp_0001', quantity: 2, entryDate: '2026-07-02T08:00:00.000Z', lastWaterChangeDate: '2026-07-03T08:00:00.000Z', batches: [{ id: 'batch-1', quantity: 2, entryDate: '2026-07-02T08:00:00.000Z', lifeStage: 'adult', reproductiveState: 'normal', stateUpdatedAt: '2026-07-02T08:00:00.000Z' }] }],
    waterChangeHistory: ['2026-07-03'], dimensions: { length: '60', width: '40', height: '40' }, waterType: 'Freshwater', targetTemperature: '25', equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  }],
  wishlist: [], dismissedRecommendations: [], compatibilityRecords: [], deceasedRecords: [], observationRecords: [], riskReminderState: {},
  feedingRecords: [{ id: 'feed-1', aquariumId: 'tank-1', createdAt: '2026-07-04T09:00:00.000Z', type: 'feeding', note: '喂食记录' }],
  diagnosisRecords: [{ diagnosisId: 'check-1', aquariumId: 'tank-1', createdAt: '2026-07-04T10:00:00.000Z', problemType: '巡检', answers: {}, resultSummary: '状态正常', riskLevel: '低风险', suggestedActions: [], missingInfo: [], followUpNotes: [] }],
  careEvents: [{ id: 'state-1', aquariumId: 'tank-1', eventType: 'life_stage_updated', title: '调整缸内物种体态', label: '已保存数量与体态变化', payload: {}, occurredAt: '2026-07-05T08:00:00.000Z', sourceType: 'livestock_state', sourceId: 'state-1', isInferred: false }],
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false }, updatedAt: new Date().toISOString(),
};

const seed = async page => page.addInitScript(saved => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
  localStorage.setItem('aqua_care_reminders', '[]');
}, state);

try {
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await seed(desktop);
  const errors = [];
  desktop.on('pageerror', error => errors.push(error.message));
  await desktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await desktop.getByRole('button', { name: '鱼缸记录' }).click();
  await desktop.waitForURL('**/aquarium?action=timeline&tank=tank-1');
  await desktop.getByRole('heading', { name: '操作时间线' }).waitFor();
  await desktop.getByText('调整缸内物种体态', { exact: true }).waitFor();
  await desktop.getByText('由旧记录整理', { exact: true }).first().waitFor();
  assert.equal(await desktop.getByText('调整缸内物种体态', { exact: true }).locator('xpath=ancestor::li').getByText('由旧记录整理').count(), 0, 'new explicit events must not be marked inferred');

  const waterCycle = desktop.getByText('换水', { exact: true }).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]');
  await waterCycle.getByRole('button', { name: '7 天' }).click();
  await desktop.getByText('已设置“换水计划”每 7 天循环。', { exact: true }).waitFor();
  await desktop.getByText('已开启循环', { exact: true }).waitFor();
  await desktop.getByRole('button', { name: '关闭循环' }).click();
  await desktop.getByText('已关闭循环，历史记录仍会保留。', { exact: true }).waitFor();
  await desktop.getByRole('button', { name: '返回我的鱼缸' }).click();
  await desktop.waitForURL('**/aquarium');
  assert.deepEqual(errors, []);
  await desktop.close();

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' });
  await seed(phone);
  await phone.goto(`${baseUrl}/aquarium?action=timeline&tank=tank-1`, { waitUntil: 'domcontentloaded' });
  await phone.getByRole('heading', { name: '操作时间线' }).waitFor();
  assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '390px timeline must not overflow');
  await phone.getByRole('button', { name: '返回我的鱼缸' }).click();
  await phone.waitForURL('**/aquarium');
  await phone.getByRole('button', { name: '鱼缸记录' }).click();
  await phone.waitForURL('**/aquarium?action=timeline&tank=tank-1');
  console.log('care timeline UI verified: direct route, inferred labels, recurrence controls, back action and mobile layout');
} finally {
  await browser.close();
}

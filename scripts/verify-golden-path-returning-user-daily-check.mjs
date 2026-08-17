import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

const state = {
  version: 1,
  currentAquariumId: 'tank-gp003',
  aquariums: [{
    id: 'tank-gp003',
    name: '回访测试缸',
    fishes: [{
      id: 'stock-gp003',
      fishId: 'sp_0001',
      quantity: 6,
      entryDate: today,
      lastWaterChangeDate: today,
      batches: [{
        id: 'batch-gp003',
        quantity: 6,
        entryDate: today,
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: now,
      }],
    }],
    lastWaterChangeDate: today,
    waterChangeHistory: [today],
    dimensions: { length: '60', width: '30', height: '30' },
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
  updatedAt: now,
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const todayTask = page.locator('[data-daily-action="daily_check"]');
  await todayTask.waitFor();
  await todayTask.getByRole('button', { name: '开始今日检查', exact: true }).click();

  const dialog = page.getByRole('dialog').filter({ hasText: '每日鱼缸检查' });
  await dialog.waitFor();

  const answer = async (label) => {
    const button = dialog.getByRole('button', { name: label, exact: true });
    await button.waitFor();
    await button.click();
    await page.waitForTimeout(280);
  };

  await answer('正常');
  await answer('清澈');
  await answer('没有泡沫或油膜');
  await answer('没有异味');
  await answer('正常游动和进食');
  await answer('没有特别操作');

  const generate = dialog.getByRole('button', { name: '生成检查结果', exact: true });
  await generate.waitFor();
  assert.equal(await generate.isEnabled(), true, 'Daily Check result generation must enable after all required questions are answered.');
  await generate.click();

  // Daily Check primary actions share one contract: save first, then optionally open a remedy article.
  // Depending on the deterministic result/candidate article set, the label can be one of these states.
  const primary = dialog.getByRole('button', { name: /^(保存今天记录|更新今天记录|查看补救步骤)$/ });
  await primary.waitFor();
  await primary.click();

  await page.waitForFunction(() => {
    const raw = localStorage.getItem('aquarium_app_state_v1');
    if (!raw) return false;
    try {
      const saved = JSON.parse(raw);
      return (saved.diagnosisRecords || []).some(record => record.problemType === '巡检');
    } catch {
      return false;
    }
  });

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const patrolRecords = persisted.diagnosisRecords.filter(record => record.problemType === '巡检');
  assert.equal(patrolRecords.length, 1, 'Completing GP-003 must persist exactly one Daily Check record.');
  assert.equal(patrolRecords[0].aquariumId, 'tank-gp003', 'Daily Check must persist against the active aquarium.');
  assert.equal(patrolRecords[0].answers.breathing, '正常');
  assert.equal(patrolRecords[0].answers.waterLook, '清澈');
  assert.equal(patrolRecords[0].answers.surfaceLook, '没有泡沫或油膜');
  assert.equal(patrolRecords[0].answers.odor, '没有异味');
  assert.equal(patrolRecords[0].answers.behavior, '正常游动和进食');
  assert.equal(patrolRecords[0].answers.recentAction, '没有特别操作');

  // If a remedy article opened after the save, close it first; then close the Daily Check result surface.
  await page.keyboard.press('Escape');
  if (await dialog.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
  }
  await dialog.waitFor({ state: 'detached' });

  await page.getByText('今日已检查', { exact: true }).first().waitFor();
  assert.equal(
    await page.locator('[data-daily-action="daily_check"]').count(),
    0,
    'After a successful Daily Check save, the Today primary task must update instead of still asking for the same check.',
  );
  assert.deepEqual(pageErrors, [], `GP-003 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-003 continuous E2E passed: returning user → Today Daily Check → complete required answers → persist patrol → Today status updates.');
} finally {
  await browser.close();
}

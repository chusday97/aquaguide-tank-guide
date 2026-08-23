import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4213';
const now = new Date();
const today = now.toISOString().slice(0, 10);
const oldDate = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const nowIso = now.toISOString();

const state = {
  version: 1,
  currentAquariumId: 'tank-water-overdue',
  aquariums: [{
    id: 'tank-water-overdue',
    name: 'tank-water-overdue',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0021',
      quantity: 2,
      entryDate: oldDate,
      batches: [{ id: 'batch-1', quantity: 2, entryDate: oldDate, lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: nowIso }],
    }],
    dimensions: { length: '80', width: '35', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    lastWaterChangeDate: `${oldDate}T12:00:00.000Z`,
    waterChangeHistory: [oldDate],
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [{
    diagnosisId: 'normal-water-check',
    id: 'normal-water-check',
    createdAt: nowIso,
    aquariumId: 'tank-water-overdue',
    source: { type: 'home' },
    problemType: '巡检',
    answers: {
      breathing: '正常', waterLook: '清澈', surfaceLook: '没有泡沫或油膜', odor: '没有异味',
      behavior: '正常游动和进食', recentAction: '没有特别操作',
    },
    resultSummary: '当前结构化巡检未发现明显异常，可以正常观察。',
    riskLevel: '低风险', riskCode: 'low', suggestedActions: ['正常观察'], avoidActions: [], observeItems: [], missingInfo: [], followUpNotes: [],
  }],
  compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: nowIso,
};

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 900, 1600]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'zh-CN' });
    await context.addInitScript(saved => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    }, state);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const action = page.locator('[data-daily-action="water_change"]');
    await action.waitFor();
    const text = (await action.textContent()) || '';
    assert.match(text, /今天完成|记录本次换水/);
    assert.match(text, /仅逾期不代表鱼缸当前处于紧急状态/);
    assert.doesNotMatch(text, /优先处理|当前异常|高危/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `viewport ${width}px has ${overflow}px horizontal overflow`);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `/tmp/aquaguide-water-${width}.png`, fullPage: false });
    await context.close();
    console.log(`PASS BC-WATER-001 at ${width}px`);
  }
  console.log('P0 Water Change browser regression: 390/900/1600 PASS');
} finally {
  await browser.close();
}

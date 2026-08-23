import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4213';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

const normalPatrol = (aquariumId, id) => ({
  diagnosisId: id,
  id,
  createdAt: now,
  aquariumId,
  source: { type: 'home' },
  problemType: '巡检',
  answers: {
    breathing: '正常',
    waterLook: '清澈',
    surfaceLook: '没有泡沫或油膜',
    odor: '没有异味',
    behavior: '正常游动和进食',
    recentAction: '没有特别操作',
  },
  resultSummary: '当前结构化巡检未发现明显异常，可以正常观察。',
  riskLevel: '低风险',
  riskCode: 'low',
  suggestedActions: ['正常观察'],
  avoidActions: ['不要无症状盲目下药'],
  observeItems: [],
  missingInfo: [],
  followUpNotes: [],
});

const makeState = ({ id, fishes, dimensions = { length: '40', width: '25', height: '30' }, waterType = 'Freshwater' }) => ({
  version: 1,
  currentAquariumId: id,
  aquariums: [{
    id,
    name: id,
    fishes: fishes.map((item, index) => ({
      id: `${id}-stock-${index}`,
      fishId: item.fishId,
      quantity: item.quantity,
      entryDate: '2026-08-01',
      batches: [{ id: `${id}-batch-${index}`, quantity: item.quantity, entryDate: '2026-08-01', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: now }],
    })),
    dimensions,
    waterType,
    targetTemperature: '25',
    lastWaterChangeDate: today,
    waterChangeHistory: [today],
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [normalPatrol(id, `${id}-check`)],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: now,
});

const browser = await chromium.launch({ headless: true });
try {
  const run = async (name, state, verify) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
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
    await page.locator('[data-daily-action]').waitFor();
    await verify(page);
    assert.deepEqual(errors, [], `${name} emitted page errors: ${errors.join('; ')}`);
    await context.close();
    console.log(`PASS ${name}`);
  };

  await run(
    '40cm + 2 mini parrots + normal patrol stays stable',
    makeState({ id: 'tank-mini', fishes: [{ fishId: 'sp_0021', quantity: 2 }] }),
    async page => {
      const action = page.locator('[data-daily-action="routine"]');
      await action.waitFor();
      assert.match((await action.textContent()) || '', /今天没有必须处理/);
      const body = (await page.locator('body').innerText()) || '';
      assert.doesNotMatch(body, /先处理缸内混养风险|空间需求偏紧|动物负载超过当前水体|动物负载接近上限|升级缸体/);
    },
  );

  await run(
    'reviewed tiger-barb + mini-parrot prior + normal patrol does not become current conflict',
    makeState({ id: 'tank-prior', fishes: [{ fishId: 'sp_0021', quantity: 1 }, { fishId: 'sp_0439', quantity: 1 }], dimensions: { length: '80', width: '35', height: '40' } }),
    async page => {
      const action = page.locator('[data-daily-action="routine"]');
      await action.waitFor();
      assert.match((await action.textContent()) || '', /今天没有必须处理/);
      assert.doesNotMatch((await page.locator('body').innerText()) || '', /优先移除攻击性生物|先处理缸内混养风险/);
    },
  );

  await run(
    'freshwater + marine hard constraint remains current urgent',
    makeState({ id: 'tank-hard', fishes: [{ fishId: 'sp_0021', quantity: 1 }, { fishId: 'sp_0022', quantity: 1 }], dimensions: { length: '100', width: '45', height: '45' }, waterType: 'Freshwater' }),
    async page => {
      const action = page.locator('[data-daily-action="current_state_review"]');
      await action.waitFor();
      const text = (await action.textContent()) || '';
      assert.match(text, /当前鱼缸硬约束|当前状态依据/);
      assert.doesNotMatch(text, /今天没有必须处理/);
    },
  );

  console.log('P0 Existing Tank Authority browser regression: 3/3 PASS');
} finally {
  await browser.close();
}

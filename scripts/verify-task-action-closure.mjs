import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_PREVIEW_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });

const state = {
  version: 1,
  currentAquariumId: 'closure-tank',
  aquariums: [{
    id: 'closure-tank',
    name: '闭环测试缸',
    fishes: [{
      id: 'resident-1',
      fishId: 'sp_0001',
      quantity: 2,
      entryDate: '2026-07-01',
      batches: [{
        id: 'batch-1',
        quantity: 2,
        entryDate: '2026-07-01',
        lifeStage: 'adult',
        reproductiveState: 'normal',
        stateUpdatedAt: '2026-07-01T00:00:00.000Z',
      }],
    }],
    dimensions: { length: '60', width: '35', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    waterChangeHistory: [],
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
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const open = async (path, width = 1200) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  return { page, errors };
};

try {
  const taskCases = [
    ['/aquarium?action=add-species', '添加生物'],
    ['/aquarium?action=daily-check', '一次完成今天检查'],
    ['/aquarium?action=livestock', '缸内物种'],
    ['/aquarium?action=water-change', '换水记录'],
  ];

  for (const [path, expected] of taskCases) {
    const { page, errors } = await open(path);
    const target = page.getByText(expected, { exact: true }).last();
    await target.waitFor();
    if (path.includes('livestock')) {
      const dialog = page.getByRole('dialog').filter({ hasText: expected });
      await dialog.waitFor();
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('dialog').filter({ hasText: expected }).waitFor();
    }
    assert.equal(errors.length, 0, `${path} page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/encyclopedia?mode=compatibility');
    await page.getByText('混养风险计算', { exact: true }).first().waitFor();
    assert.equal(errors.length, 0, `compatibility page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/missing-task-page');
    await page.getByRole('heading', { name: '没有找到这个页面' }).waitFor();
    assert.equal(await page.getByRole('button', { name: '返回我的鱼缸' }).count(), 1);
    assert.equal(errors.length, 0, `not-found page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/care?topic=guide_water_deteriorate', 390);
    await page.getByRole('button', { name: '开始问题自查', exact: true }).click();
    const panel = page.locator('section').filter({ hasText: '问题自查' }).last();
    const normalOptions = panel.getByRole('button', { name: '没有', exact: true });
    for (let index = (await normalOptions.count()) - 1; index >= 0; index -= 1) {
      await normalOptions.nth(index).click();
    }
    await panel.getByRole('button', { name: '查看自查结果', exact: true }).click();
    const nextAction = panel.getByRole('button', { name: /查看.+步骤|查看观察清单|查看需要补充的检查/ });
    await nextAction.waitFor();
    assert.equal(await page.getByRole('button', { name: '开始问题自查', exact: true }).count(), 0, 'stale footer action remains after assessment starts');
    await nextAction.click();
    await panel.locator('[data-care-assessment-next]').waitFor();
    await panel.getByRole('button', { name: '设置一次复查提醒', exact: true }).click();
    await page.getByText('设置养护提醒', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, 'mobile care assessment overflowed horizontally');
    assert.equal(errors.length, 0, `care assessment page errors: ${errors.join('; ')}`);
    await page.close();
  }

  console.log('任务动作闭环浏览器验收通过。');
} finally {
  await browser.close();
}

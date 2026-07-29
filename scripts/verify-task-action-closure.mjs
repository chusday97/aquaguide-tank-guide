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
    fishes: [
      {
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
      },
      {
        id: 'resident-2',
        fishId: 'sp_0002',
        quantity: 1,
        entryDate: '2026-07-02',
        batches: [{
          id: 'batch-2',
          quantity: 1,
          entryDate: '2026-07-02',
          lifeStage: 'juvenile',
          reproductiveState: 'normal',
          stateUpdatedAt: '2026-07-02T00:00:00.000Z',
        }],
      },
    ],
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
      await dialog.getByRole('button', { name: '关闭', exact: true }).click();
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
    const nextAction = panel.getByRole('button', { name: /查看复查要点|查看需要补充的检查/ });
    await nextAction.waitFor();
    await panel.getByText('检查过滤出水和进水口是否通畅', { exact: true }).waitFor();
    const secondWaterAction = panel.locator('li').filter({ hasText: '清理可见残饵和腐败物' });
    const firstWaterAvoid = panel.locator('li').filter({ hasText: '不要一次性清洗全部滤材' });
    await secondWaterAction.waitFor();
    await firstWaterAvoid.waitFor();
    assert.equal(await panel.getByText('保持环境稳定', { exact: true }).count(), 0, 'water assessment must provide a concrete first action');
    assert.equal(await page.getByRole('button', { name: '开始问题自查', exact: true }).count(), 0, 'stale footer action remains after assessment starts');
    await nextAction.click();
    await panel.locator('[data-care-assessment-next]').waitFor();
    assert.equal(await panel.getByText('检查过滤出水和进水口是否通畅', { exact: true }).count(), 1, 'the visual first action must not repeat inside expanded steps');
    assert.equal(await secondWaterAction.count(), 1, 'direct action steps must not repeat in follow-up checks');
    assert.equal(await firstWaterAvoid.count(), 1, 'safety actions must remain direct and unique');
    assert.equal(await panel.getByText('是否持续浮头', { exact: true }).count(), 0, 'water assessment must not reuse gasping follow-up semantics');
    await panel.getByText('水体是否继续变浑或发绿', { exact: true }).waitFor();
    await panel.getByRole('button', { name: '设置一次复查提醒', exact: true }).click();
    await page.getByText('设置养护提醒', { exact: true }).waitFor();
    await page.getByRole('button', { name: '确认设置', exact: true }).click();
    await panel.getByRole('status').filter({ hasText: '养护提醒已设置' }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, 'mobile care assessment overflowed horizontally');
    assert.equal(errors.length, 0, `care assessment page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/care?topic=guide_water_deteriorate', 390);
    await page.getByRole('button', { name: '开始问题自查', exact: true }).click();
    const panel = page.locator('section').filter({ hasText: '问题自查' }).last();
    await panel.getByRole('button', { name: '追咬打架', exact: true }).click();
    const targetPanel = panel.getByText('哪些生物出现了这个情况？', { exact: true }).locator('..');
    await targetPanel.getByRole('button', { name: '多种生物', exact: true }).click();
    const speciesTargets = targetPanel.locator('button:has(img)');
    assert.equal(await speciesTargets.count(), 2, 'multi-species scope must show every distinct resident species');
    await speciesTargets.nth(0).click();
    await speciesTargets.nth(1).click();
    const normalOptions = panel.getByRole('button', { name: '没有', exact: true });
    for (let index = 0; index < await normalOptions.count(); index += 1) {
      await normalOptions.nth(index).click();
    }
    await panel.getByRole('button', { name: '查看自查结果', exact: true }).click();
    const multiSpeciesFocus = panel.locator('.visual-result-focus');
    await multiSpeciesFocus.getByText(/所选 2 种生物/).waitFor();
    await multiSpeciesFocus.getByText(/多种生物/).waitFor();
    await panel.getByText('增加水草、沉木或石缝作为躲避区', { exact: true }).waitFor();
    await panel.locator('li').filter({ hasText: '不要频繁追捞所有生物' }).waitFor();
    await panel.getByRole('button', { name: '查看复查要点', exact: true }).click();
    await panel.getByText('是否固定追咬同一对象', { exact: true }).waitFor();
    assert.equal(await panel.getByText('全缸检查', { exact: true }).count(), 0, 'multi-species result must not claim whole-tank scope');
    assert.equal(errors.length, 0, `multi-species care assessment page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/care?topic=guide_water_deteriorate', 390);
    await page.getByRole('button', { name: '开始问题自查', exact: true }).click();
    const panel = page.locator('section').filter({ hasText: '问题自查' }).last();
    await panel.getByRole('button', { name: '追咬打架', exact: true }).click();
    const targetPanel = panel.getByText('哪些生物出现了这个情况？', { exact: true }).locator('..');
    assert.equal(await targetPanel.getByRole('button', { name: '全缸都这样', exact: true }).getAttribute('aria-pressed'), 'true', 'behavior checks must default to the whole tank');
    await targetPanel.getByRole('button', { name: '某一种生物', exact: true }).click();
    await panel.getByRole('button', { name: '请先选择检查对象', exact: true }).waitFor();
    const speciesTargets = targetPanel.locator('button:has(img)');
    assert.equal(await speciesTargets.count(), 2, 'single-species scope must show every distinct resident species');
    await speciesTargets.first().click();
    const unknownOptions = panel.getByRole('button', { name: '不确定', exact: true });
    assert.equal(await unknownOptions.count(), 2, '追咬自查应显示两道有效问题');
    for (let index = 0; index < 2; index += 1) {
      await unknownOptions.nth(index).click();
    }
    await panel.getByRole('button', { name: '查看自查结果', exact: true }).click();
    await panel.getByText('资料不足', { exact: true }).waitFor();
    await panel.getByText(/重点观察/).waitFor();
    await panel.getByRole('button', { name: '查看需要补充的检查', exact: true }).click();
    assert.equal(await panel.getByRole('button', { name: '设置一次复查提醒', exact: true }).count(), 0, '信息不足时不应让提醒抢占补充检查');
    await panel.getByRole('button', { name: '重新补充关键检查', exact: true }).click();
    await panel.getByText('一次填完 · 已回答 0/2', { exact: true }).waitFor();
    assert.equal(errors.length, 0, `unknown care assessment page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/care?topic=guide_safe_water_change');
    await page.getByRole('button', { name: '去记录本次换水', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/aquarium');
    await page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: '换水记录', exact: true }) }).waitFor();
    assert.equal(errors.length, 0, `water change guide page errors: ${errors.join('; ')}`);
    await page.close();
  }

  console.log('任务动作闭环浏览器验收通过。');
} finally {
  await browser.close();
}

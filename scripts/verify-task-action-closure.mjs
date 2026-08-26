import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
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
  wishlist: ['sp_0001'],
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

const open = async (path, width = 1200, locale = 'zh-CN') => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ saved, requestedLocale }) => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', requestedLocale);
  }, { saved: state, requestedLocale: locale });
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
    if (path.includes('add-species')) {
      const dialog = page.getByRole('dialog');
      const selectionSection = dialog.locator('section').filter({ hasText: '第 1 步：选择生物' });
      await selectionSection.locator('button').filter({ hasText: '选择' }).first().click();
      const entryDateField = dialog.getByText('入缸日期', { exact: true }).last().locator('..');
      await entryDateField.getByRole('button').click();
      for (const label of ['上个月', '下个月']) {
        const control = dialog.getByRole('button', { name: label, exact: true });
        const box = await control.boundingBox();
        assert.ok(box && box.width >= 44 && box.height >= 44, `${label} must be at least 44×44`);
      }
    }
    if (path.includes('daily-check')) {
      const dialog = page.getByRole('dialog').filter({ hasText: '每日鱼缸检查' });
      for (const label of ['返回', '退出']) {
        const control = dialog.getByRole('button', { name: label, exact: true });
        const box = await control.boundingBox();
        assert.ok(box && box.width >= 44 && box.height >= 44, `daily check ${label} must be at least 44×44`);
      }
      assert.equal(await dialog.getByRole('button', { name: '关闭', exact: true }).count(), 0, 'task flow must not retain a duplicate generic close control');
      const firstAnswer = dialog.getByRole('button', { name: '正常', exact: true }).first();
      const initialAnswerClass = await firstAnswer.getAttribute('class');
      await firstAnswer.click();
      const selectedAnswerClass = await firstAnswer.getAttribute('class');
      assert.notEqual(selectedAnswerClass, initialAnswerClass, 'daily check answer should become visibly selected before testing exit protection');
      await dialog.getByRole('button', { name: '退出', exact: true }).click();
      const exitConfirmation = page.getByRole('dialog').filter({ hasText: '退出本次检查？' });
      await exitConfirmation.waitFor();
      assert.equal(await exitConfirmation.locator('[data-slot="dialog-close"]').count(), 0, 'draft exit confirmation must only use footer decisions');
      await exitConfirmation.getByRole('button', { name: '继续填写', exact: true }).click();
      await exitConfirmation.waitFor({ state: 'hidden' });
      assert.equal(await firstAnswer.getAttribute('class'), selectedAnswerClass, 'continuing must preserve the selected answer');
      await dialog.getByRole('button', { name: '退出', exact: true }).click();
      await page.getByRole('dialog').filter({ hasText: '退出本次检查？' }).getByRole('button', { name: '退出并放弃', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
    }
    if (path.includes('water-change')) {
      const dialog = page.getByRole('dialog');
      for (const label of ['上个月', '下个月']) {
        const control = dialog.getByRole('button', { name: label, exact: true });
        const box = await control.boundingBox();
        assert.ok(box && box.width >= 44 && box.height >= 44, `water-change ${label} must be at least 44×44`);
      }
      const dateControl = dialog.getByRole('button', { name: /^\d+$/ }).first();
      const dateBox = await dateControl.boundingBox();
      assert.ok(dateBox && dateBox.width >= 44 && dateBox.height >= 44, 'water-change date control must be at least 44×44');
      for (const label of ['取消', '记录这天换水']) {
        const control = dialog.getByRole('button', { name: label, exact: true });
        const box = await control.boundingBox();
        assert.ok(box && box.height >= 44, `water-change ${label} must be at least 44px high`);
      }
    }
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
    const { page, errors } = await open('/aquarium?action=daily-check');
    const dialog = page.getByRole('dialog').filter({ hasText: '每日鱼缸检查' });
    await dialog.waitFor();
    for (const answer of ['正常', '清澈', '没有泡沫或油膜', '没有异味', '正常游动和进食', '没有特别操作']) {
      await dialog.getByRole('button', { name: answer, exact: true }).click();
    }
    await dialog.getByRole('button', { name: '生成检查结果', exact: true }).click();
    const saveResult = dialog.getByRole('button', { name: /^(保存今天记录|查看补救步骤)$/ });
    await saveResult.waitFor();

    await dialog.getByRole('button', { name: '退出', exact: true }).click();
    const exitConfirmation = page.getByRole('dialog').filter({ hasText: '退出本次检查？' });
    await exitConfirmation.waitFor();
    await exitConfirmation.getByRole('button', { name: '继续填写', exact: true }).click();
    await exitConfirmation.waitFor({ state: 'hidden' });
    await saveResult.waitFor();

    await saveResult.click();
    const visibleDialogs = page.getByRole('dialog');
    if (await visibleDialogs.count() > 1) {
      await visibleDialogs.last().getByRole('button', { name: '关闭', exact: true }).click();
    }
    await dialog.getByRole('button', { name: '退出', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('dialog').filter({ hasText: '退出本次检查？' }).count(), 0, 'saved diagnosis result must close without a stale draft confirmation');
    assert.equal(errors.length, 0, `saved daily-check page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/collection/wishlist', 390);
    await page.getByRole('button', { name: '移除种草', exact: true }).first().click();
    const confirmation = page.getByRole('dialog').filter({ hasText: '移除这条种草？' });
    await confirmation.waitFor();
    await page.waitForTimeout(200);
    assert.equal(await confirmation.locator('[data-slot="dialog-close"]').count(), 0, 'confirmation dialog must not include a duplicate top-right close');
    for (const label of ['取消', '确认移除']) {
      const control = confirmation.getByRole('button', { name: label, exact: true });
      const box = await control.boundingBox();
      assert.ok(box && box.height >= 44, `collection confirmation ${label} must be at least 44px high`);
    }
    await confirmation.getByRole('button', { name: '取消', exact: true }).click();
    await confirmation.waitFor({ state: 'hidden' });
    assert.equal(errors.length, 0, `collection confirmation page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/collection/wishlist', 390, 'en');
    await page.getByRole('button', { name: 'Remove Saved', exact: true }).first().click();
    const confirmation = page.getByRole('dialog').filter({ hasText: 'Remove this saved species?' });
    await confirmation.waitFor();
    await confirmation.getByRole('button', { name: 'Cancel', exact: true }).waitFor();
    await confirmation.getByRole('button', { name: 'Remove', exact: true }).waitFor();
    assert.equal(await confirmation.getByText('移除这条种草？', { exact: true }).count(), 0, 'English confirmation must not fall back to a Chinese title');
    assert.equal(errors.length, 0, `English collection confirmation page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/encyclopedia', 390);
    const groupCard = page.locator('[data-species-group-card]').first();
    await groupCard.waitFor();
    await groupCard.locator('button[aria-label^="查看"]').first().click();
    const variantFavorite = page.locator('[id^="group-variant-wishlist-"]').first();
    await variantFavorite.waitFor();
    await page.waitForTimeout(200);
    const box = await variantFavorite.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `variant favorite control must be at least 44×44, got ${JSON.stringify(box)}`);
    assert.equal(errors.length, 0, `variant dialog page errors: ${errors.join('; ')}`);
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
    await page.getByRole('button', { name: '开始快速评测', exact: true }).click();
    const panel = page.locator('section').filter({ hasText: '快速评测' }).last();
    const normalOptions = panel.getByRole('button', { name: '没有', exact: true });
    for (let index = (await normalOptions.count()) - 1; index >= 0; index -= 1) {
      await normalOptions.nth(index).click();
    }
    await panel.getByRole('button', { name: '查看处理方案', exact: true }).click();
    await panel.locator('[data-care-assessment-result]').waitFor();
    await panel.getByText('检查过滤出水和进水口是否通畅', { exact: true }).waitFor();
    const secondWaterAction = panel.getByText('清理可见残饵和腐败物', { exact: true });
    const firstWaterAvoid = panel.getByText('不要一次性清洗全部滤材', { exact: true });
    await secondWaterAction.waitFor();
    await firstWaterAvoid.waitFor();
    assert.equal(await panel.getByText('保持环境稳定', { exact: true }).count(), 0, 'water assessment must provide a concrete first action');
    assert.equal(await page.getByRole('button', { name: '开始快速评测', exact: true }).count(), 0, 'stale footer action remains after assessment starts');
    await panel.locator('[data-care-assessment-next]').waitFor();
    assert.equal(await panel.getByText('检查过滤出水和进水口是否通畅', { exact: true }).count(), 1, 'the visual first action must not repeat inside expanded steps');
    assert.equal(await secondWaterAction.count(), 1, 'direct action steps must not repeat in follow-up checks');
    assert.equal(await firstWaterAvoid.count(), 1, 'safety actions must remain direct and unique');
    assert.equal(await panel.getByText('是否持续浮头', { exact: true }).count(), 0, 'water assessment must not reuse gasping follow-up semantics');
    await panel.getByText('水体是否继续变浑或发绿', { exact: true }).waitFor();
    await panel.getByRole('button', { name: '设置复查时间', exact: true }).waitFor();
    await panel.getByRole('button', { name: '设置复查时间', exact: true }).click();
    await page.getByText('设置养护提醒', { exact: true }).waitFor();
    await page.getByRole('button', { name: '确认设置', exact: true }).click();
    await panel.getByRole('status').filter({ hasText: '养护提醒已设置' }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, 'mobile care assessment overflowed horizontally');
    assert.equal(errors.length, 0, `care assessment page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/care?topic=guide_water_deteriorate', 390);
    await page.getByRole('button', { name: '开始快速评测', exact: true }).click();
    const panel = page.locator('section').filter({ hasText: '快速评测' }).last();
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
    await panel.getByRole('button', { name: '查看处理方案', exact: true }).click();
    const assessmentResult = panel.locator('[data-care-assessment-result]');
    await assessmentResult.getByText(/所选 2 种生物/).waitFor();
    assert.equal(await assessmentResult.locator('img').count(), 2, 'multi-species result should preview the selected species');
    await panel.getByText('增加水草、沉木或石缝作为躲避区', { exact: true }).waitFor();
    await panel.getByText('不要频繁追捞所有生物', { exact: true }).waitFor();
    await panel.getByText('是否固定追咬同一对象', { exact: true }).waitFor();
    assert.equal(await panel.getByText('全缸检查', { exact: true }).count(), 0, 'multi-species result must not claim whole-tank scope');
    assert.equal(errors.length, 0, `multi-species care assessment page errors: ${errors.join('; ')}`);
    await page.close();
  }

  {
    const { page, errors } = await open('/care?topic=guide_water_deteriorate', 390);
    await page.getByRole('button', { name: '开始快速评测', exact: true }).click();
    const panel = page.locator('section').filter({ hasText: '快速评测' }).last();
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
    await panel.getByRole('button', { name: '查看处理方案', exact: true }).click();
    await panel.getByText('信息不足', { exact: true }).waitFor();
    assert.equal(await panel.getByRole('button', { name: '设置复查时间', exact: true }).count(), 0, '信息不足时不应让提醒抢占补充检查');
    await panel.getByRole('button', { name: '补充关键检查', exact: true }).click();
    await panel.getByText('已回答 0/2', { exact: true }).waitFor();
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

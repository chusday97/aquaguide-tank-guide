import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_PREVIEW_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });

const cases = [
  {
    topicId: 'guide_safe_water_change',
    expected: ['跟着图示操作', '现在按顺序做'],
    absent: ['开始问题自查'],
  },
  {
    topicId: 'guide_water_deteriorate',
    expected: ['先做快速评测', '开始快速检查'],
    absent: ['现在按顺序做'],
    openAssessmentResult: true,
  },
  {
    topicId: 'guide_pregnant_care',
    expected: ['按阶段照料', '护理清单'],
    absent: ['开始问题自查'],
  },
  {
    topicId: 'qa_gen_004',
    expected: ['先看结论', '完整说明'],
    absent: ['开始问题自查'],
  },
];

try {
  for (const testCase of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.addInitScript(() => window.localStorage.setItem('aquaguide_locale', 'zh-CN'));
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${baseUrl}/care?topic=${testCase.topicId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 30000 });
    for (const text of testCase.expected) {
      assert.ok(await dialog.getByText(text, { exact: true }).count(), `${testCase.topicId} 缺少“${text}”`);
    }
    for (const text of testCase.absent) {
      assert.equal(await dialog.getByText(text, { exact: true }).count(), 0, `${testCase.topicId} 不应显示“${text}”`);
    }
    const referenceSection = dialog.locator('[data-care-references]');
    await referenceSection.waitFor({ state: 'visible' });
    assert.ok(await referenceSection.locator('a[href^="https://"]').count(), `${testCase.topicId} 必须显示可访问的外部来源`);
    if (testCase.openAssessmentResult) {
      await dialog.getByRole('button', { name: '开始快速检查', exact: true }).click();
      const assessment = dialog.locator('section').filter({ hasText: '快速评测' }).last();
      const normalOptions = dialog.getByRole('button', { name: '没有', exact: true });
      assert.equal(await normalOptions.count(), 3, '水质快速评测应显示 3 个可回答的问题');
      for (let index = (await normalOptions.count()) - 1; index >= 0; index -= 1) await normalOptions.nth(index).click();
      await dialog.getByRole('button', { name: '查看处理建议', exact: true }).click();
      await dialog.locator('[data-care-assessment-result]').waitFor();
    }
    const inlineEvidence = dialog.locator('[data-care-action-evidence]');
    assert.ok(await inlineEvidence.count(), `${testCase.topicId} 必须把来源绑定到具体动作，而不是只放在页尾`);
    assert.ok(await inlineEvidence.first().locator('a[href^="https://"]').count(), `${testCase.topicId} 首个动作缺少可访问来源`);
    const evidenceIds = await inlineEvidence.evaluateAll(elements => elements.map(element => element.getAttribute('data-care-action-evidence')));
    assert.equal(new Set(evidenceIds).size, evidenceIds.length, `${testCase.topicId} 页面重复渲染同一个动作依据`);
    if (testCase.topicId === 'qa_gen_004') {
      assert.equal(await dialog.locator('[data-care-action-step]').count(), 0, '知识文章正文不得渲染无业务结果的勾选按钮');
    }
    assert.deepEqual(pageErrors, [], `${testCase.topicId} 出现页面错误`);
    await page.close();
  }

  const persistenceContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await persistenceContext.addInitScript(() => {
    window.localStorage.setItem('aquaguide_locale', 'zh-CN');
  });
  const persistencePage = await persistenceContext.newPage();

  await persistencePage.goto(`${baseUrl}/care?topic=guide_pregnant_care`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await persistencePage.evaluate(() => {
    window.localStorage.removeItem('aqua_care_completed_operations');
    window.localStorage.removeItem('aqua_care_saved_checklists');
  });
  await persistencePage.reload({ waitUntil: 'domcontentloaded' });
  let dialog = persistencePage.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  const emptyChecklistButton = dialog.getByRole('button', { name: '先勾选已完成项目' });
  assert.equal(await emptyChecklistButton.isDisabled(), true, '未勾选护理项时不得保存');
  await dialog.locator('[data-care-action-step]').first().click();
  await dialog.getByRole('button', { name: '保存已完成的 1 项' }).click();
  await dialog.getByText('已保存 1 项完成记录', { exact: true }).waitFor();
  await persistencePage.reload({ waitUntil: 'domcontentloaded' });
  dialog = persistencePage.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  assert.equal(await dialog.locator('[data-care-action-step]').first().getAttribute('aria-pressed'), 'true', '刷新后应恢复已完成护理项');
  assert.equal(await dialog.getByRole('button', { name: '已保存 1 项' }).isDisabled(), true, '刷新后应恢复清单已保存状态');

  await persistencePage.goto(`${baseUrl}/care?topic=guide_new_fish_acclimation`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  dialog = persistencePage.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await dialog.getByRole('button', { name: '标记已完成过水' }).click();
  await dialog.getByText('已标记完成', { exact: true }).waitFor();
  await persistencePage.reload({ waitUntil: 'domcontentloaded' });
  dialog = persistencePage.getByRole('dialog');
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  assert.equal(await dialog.getByRole('button', { name: '已完成过水' }).isDisabled(), true, '刷新后应恢复操作完成状态');

  await persistenceContext.close();

  const collectionContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await collectionContext.addInitScript(() => {
    window.localStorage.setItem('aquaguide_locale', 'zh-CN');
    window.localStorage.setItem('aqua_care_favorites', JSON.stringify({
      qa_gen_004: {
        id: 'qa_gen_004',
        title: '养鱼常说的『软水』『硬度（GH/KH）』真的很重要吗？',
        favoritedAt: '2026-07-29T00:00:00.000Z',
      },
    }));
  });
  const collectionPage = await collectionContext.newPage();
  await collectionPage.goto(`${baseUrl}/collection/care?item=qa_gen_004`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const collectionDialog = collectionPage.getByRole('dialog');
  await collectionDialog.waitFor({ state: 'visible', timeout: 30000 });
  assert.equal(
    await collectionDialog.getByRole('button', { name: '去水族册查看' }).count(),
    0,
    '水族册详情不得显示无效的“去水族册查看”操作',
  );
  assert.equal(
    await collectionDialog.getByRole('button', { name: '取消收藏' }).count(),
    1,
    '水族册详情应保留明确的取消收藏入口',
  );
  await collectionContext.close();

  console.log('Care guide type verification passed.');
} finally {
  await browser.close();
}

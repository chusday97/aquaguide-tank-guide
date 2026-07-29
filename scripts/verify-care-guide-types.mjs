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
    expected: ['先判断，再处理', '开始问题自查'],
    absent: ['现在按顺序做'],
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
  console.log('Care guide type verification passed.');
} finally {
  await browser.close();
}

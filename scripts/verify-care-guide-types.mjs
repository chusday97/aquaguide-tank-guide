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
  console.log('Care guide type verification passed.');
} finally {
  await browser.close();
}

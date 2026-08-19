import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle' });

  const command = page.locator('.search-v2-command');
  const input = command.getByRole('combobox');
  await input.fill('鱼');

  const listbox = command.getByRole('listbox');
  await listbox.waitFor({ state: 'visible' });
  const showAllAction = listbox.locator('button:not([role="option"])');
  assert.equal(await showAllAction.count(), 1, '宽泛查询超过联想上限时必须只有一个明确的查看全部动作');

  const label = (await showAllAction.innerText()).trim();
  const advertisedTotal = Number(label.match(/\d+/)?.[0] || 0);
  assert.ok(advertisedTotal > 18, `查看全部回归需要 >18 个匹配物种，实际文案：${label}`);

  await showAllAction.click();
  await page.waitForURL(url => url.pathname === '/search' && url.searchParams.get('q') === '鱼');

  const speciesSection = page.locator('.search-v2-species-section');
  await speciesSection.waitFor({ state: 'visible' });
  const resultCards = speciesSection.locator('.search-v2-species-card');
  await page.waitForFunction(
    expected => document.querySelectorAll('.search-v2-species-section .search-v2-species-card').length === expected,
    advertisedTotal,
  );

  assert.equal(
    await resultCards.count(),
    advertisedTotal,
    `点击“查看全部 ${advertisedTotal} 个物种”后必须真实显示同一匹配集合的全部结果`,
  );
  assert.deepEqual(errors, [], `Search show-all 不应产生页面错误：${errors.join(' | ')}`);
  console.log(`Search V2 show-all action PASS: advertised=${advertisedTotal}, rendered=${await resultCards.count()}`);
} finally {
  await browser.close();
}

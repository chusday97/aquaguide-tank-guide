import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await page.goto('http://localhost:3000/encyclopedia', { waitUntil: 'networkidle' });
    await page.getByText('今日推荐', { exact: true }).waitFor();
    const detailsButton = page.getByRole('button', { name: '查看物种详情' }).first();
    await detailsButton.scrollIntoViewIfNeeded();
    await detailsButton.click();
    await page.waitForURL(/\/encyclopedia\?species=/);
    const detailSurface = page.locator('[data-surface="centered-dialog"], [data-surface="bottom-sheet"]');
    await detailSurface.waitFor({ state: 'visible' });
    assert.equal(await detailSurface.count(), 1, 'should reuse the encyclopedia species detail surface');
    await page.keyboard.press('Escape');
    await page.waitForURL(/\/encyclopedia/);
    assert.equal(pageErrors.length, 0);
    await page.close();
  }
  console.log('daily discovery deep link: encyclopedia discovery → species profile → encyclopedia passed');
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await page.goto('http://localhost:3000/aquarium', { waitUntil: 'networkidle' });
    if (page.url().includes('/welcome')) {
      await page.getByRole('button', { name: '先跳过，直接进入我的鱼缸' }).click();
      await page.waitForURL(/\/aquarium/);
    }
    const detailsButton = page.getByRole('button', { name: '查看物种详情' }).first();
    await detailsButton.scrollIntoViewIfNeeded();
    await detailsButton.click();
    await page.waitForURL(/\/encyclopedia\?species=.*source=daily-discovery/);
    const detailSurface = page.locator('[data-surface="centered-dialog"], [data-surface="bottom-sheet"]');
    await detailSurface.waitFor({ state: 'visible' });
    assert.equal(await detailSurface.count(), 1, 'should reuse the encyclopedia species detail surface');
    await page.keyboard.press('Escape');
    await page.waitForURL(/\/aquarium/);
    assert.equal(pageErrors.length, 0);
    await page.close();
  }
  console.log('daily discovery deep link: aquarium → encyclopedia species → aquarium passed');
} finally {
  await browser.close();
}

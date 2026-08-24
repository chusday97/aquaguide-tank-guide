import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-shell="mobile-header"]').count(), 0,
    'Encyclopedia must not leave an obscured global mobile header in the DOM');

  const toolbar = page.locator('.atlas-mobile-toolbar');
  await toolbar.waitFor({ state: 'visible' });
  for (const selector of ['[data-atlas-mobile-search]', '[data-atlas-mobile-identify]', '[data-atlas-mobile-settings]']) {
    const control = toolbar.locator(selector);
    await control.waitFor({ state: 'visible' });
    const box = await control.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, `${selector} must keep a 44px touch target`);
  }

  const topControls = await toolbar.locator('button').count();
  assert.equal(topControls, 5, 'Encyclopedia toolbar should expose two modes plus Search, Photo ID, and Settings');
  const modeButtons = toolbar.locator('div.grid button');
  for (let index = 0; index < 2; index += 1) {
    const box = await modeButtons.nth(index).boundingBox();
    assert.ok(box && box.width >= 70, `mode button ${index} must stay readable at 390px`);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 1, `Encyclopedia toolbar must not introduce horizontal overflow (delta=${overflow})`);

  await page.goto(`${baseUrl}/care`, { waitUntil: 'networkidle' });
  const shell = page.locator('[data-shell="mobile-header"]');
  await shell.waitFor({ state: 'visible' });
  assert.equal(await shell.locator('button[data-shell-action]').count(), 3,
    'global mobile header must remain available on normal routes');

  console.log('Mobile Encyclopedia toolbar ownership browser regression PASS');
} finally {
  await browser.close();
}

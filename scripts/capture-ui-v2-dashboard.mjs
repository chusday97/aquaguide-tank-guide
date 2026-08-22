import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve('artifacts/ui-v2-dashboard');
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(20_000);

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();
  await page.locator('[data-aquarium-dashboard-v2]').waitFor();

  // Capture the settled product state rather than a transient creation toast.
  await page.waitForTimeout(3000);

  for (const viewport of [
    { name: 'phone-390', width: 390, height: 844 },
    { name: 'desktop-900', width: 900, height: 900 },
    { name: 'wide-1600', width: 1600, height: 1000 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    if (viewport.name === 'phone-390') {
      await page.screenshot({
        path: path.join(outputDir, 'phone-390-fold.png'),
        fullPage: false,
        animations: 'disabled',
      });
    }

    await page.screenshot({
      path: path.join(outputDir, `${viewport.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  }

  console.log(`Saved settled Aquarium Dashboard V2 screenshots to ${outputDir}`);
} finally {
  await browser.close();
}

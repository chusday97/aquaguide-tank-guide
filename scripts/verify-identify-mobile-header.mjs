import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 900, 1600]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
    await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await page.goto(`${baseUrl}/identify`, { waitUntil: 'networkidle' });
    const header = page.locator('main[data-identify-stage] > header');
    const back = header.locator('button').first();
    const title = header.locator('h1');
    await back.waitFor();
    await title.waitFor();
    const result = await page.evaluate(() => {
      const header = document.querySelector('main[data-identify-stage] > header');
      const button = header?.querySelector('button');
      const heading = header?.querySelector('h1');
      const b = button?.getBoundingClientRect(); const h = heading?.getBoundingClientRect();
      const textNode = button ? [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) : null;
      const range = textNode ? document.createRange() : null;
      if (range && textNode) range.selectNodeContents(textNode);
      return { width: b?.width ?? 0, height: b?.height ?? 0, bottom: b?.bottom ?? 0, titleTop: h?.top ?? 0, textLines: range ? range.getClientRects().length : 0 };
    });
    assert.ok(result.width >= 96, `${width}px back label must have text width; got ${result.width}`);
    assert.ok(result.height <= 44, `${width}px back action must keep single-line control height; got ${result.height}`);
    assert.equal(result.textLines, 1, `${width}px back label must render on one line`);
    assert.ok(result.bottom <= result.titleTop, `${width}px back button must not overlap title`);
    await page.close();
  }
  console.log('Identify mobile header browser regression PASS');
} finally { await browser.close(); }

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4208';
const outputDir = path.resolve('artifacts/interactive-atlas-reentry-v2');
fs.mkdirSync(outputDir, { recursive: true });
const viewports = [[390, 844], [900, 900], [1600, 1000]];

const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, locale: 'zh-CN' });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await page.goto(`${baseUrl}/encyclopedia?mode=browse`, { waitUntil: 'domcontentloaded' });
    const scene = page.locator('.interactive-tank-shell');
    await scene.waitFor({ state: 'visible' });
    assert.match(await scene.innerText(), /不是推荐排序/, 'scene must disclose that discovery is not a recommendation ranking');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 1, `${width}px scene must not horizontally overflow`);
    await scene.locator('[data-scene-node]').first().click();
    await scene.locator('.interactive-tank-dock.is-visible').waitFor({ state: 'visible' });
    await scene.getByRole('button', { name: /查看物种档案|View species profile/ }).click();
    await page.locator('[data-species-detail-layout]').waitFor({ state: 'visible' });
    assert.ok(await page.locator('[data-species-detail-hero]').count() > 0, 'scene selection must open the existing species detail surface');
    await page.screenshot({ path: path.join(outputDir, `atlas-${width}.png`), fullPage: false });
    assert.deepEqual(errors, [], `${width}px scene emitted page errors: ${errors.join(' | ')}`);
    await context.close();
    console.log(`Interactive atlas scene ${width}px PASS`);
  }
  console.log('Interactive atlas scene PASS: discovery remains non-recommendation and opens the existing detail authority path.');
} finally {
  await browser.close();
}

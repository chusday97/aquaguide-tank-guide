import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const outputRoot = process.env.VISUAL_OUTPUT || 'artifacts/ci-visual';
const routes = [
  ['aquarium', '/aquarium'],
  ['encyclopedia', '/encyclopedia?mode=scene'],
  ['care', '/care?mode=scene'],
  ['collection', '/collection'],
];
const viewports = [390, 1440];

await mkdir(outputRoot, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
try {
  for (const [name, route] of routes) {
    for (const width of viewports) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
      const pageErrors = [];
      const failedRequests = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      page.on('requestfailed', request => failedRequests.push(request.url()));
      try {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 20_000 });
        assert.equal(response?.status(), 200, `${name} ${width}px must return 200`);
        await page.locator('[data-page], main').first().waitFor({ state: 'visible' });
        await page.evaluate(async () => { await document.fonts?.ready; });
        const metrics = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length,
          canvas: document.querySelectorAll('canvas').length,
        }));
        assert.ok(metrics.scrollWidth <= metrics.width + 1, `${name} ${width}px horizontal overflow`);
        assert.equal(metrics.h1, 1, `${name} ${width}px must expose one page title`);
        // Headless Chromium may not expose WebGL in every runner; the
        // dedicated Aquarium stage gate owns the strict one-canvas assertion.
        if (name === 'aquarium') assert.ok(metrics.canvas <= 1, 'Aquarium must not render multiple canvases');
        assert.deepEqual(pageErrors, [], `${name} ${width}px page errors`);
        assert.deepEqual(failedRequests, [], `${name} ${width}px failed requests`);
        const screenshot = `${outputRoot}/${name}-${width}.png`;
        await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' });
        records.push({ name, width, route, screenshot, metrics });
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log(`visual layout verified: ${records.length} route/viewport captures`);

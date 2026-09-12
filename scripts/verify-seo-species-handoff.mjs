import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
const vite = await createServer({
  root,
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'silent',
});
await vite.listen();
const address = vite.httpServer?.address();
if (!address || typeof address === 'string') throw new Error('Unable to resolve Vite test port.');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(String(error)));
try {
  const compatibilityUrl = `${baseUrl}/encyclopedia?mode=compatibility&species=sp_0030&source=seo-species`;
  await page.goto(compatibilityUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(300);
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

  assert.match(page.url(), /mode=compatibility/);
  assert.match(page.url(), /species=sp_0030/);
  assert.match(page.url(), /source=seo-species/);
  assert.match(body, /Neocaridina davidi var\. Yellow/);
  assert.match(body, /planned|准备加入/);
  assert.deepEqual(pageErrors, []);

  console.log('SEO Species handoff verified: sp_0030 enters compatibility as a planned species.');
} finally {
  await browser.close();
  await vite.close();
}

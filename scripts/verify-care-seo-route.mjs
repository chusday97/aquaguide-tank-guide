import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

process.env.VITE_SUPABASE_URL = 'http://127.0.0.1:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'care-seo-route-test';

const vite = await createServer({
  root: process.cwd(),
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'silent',
});
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address === 'object');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewportSize: viewport });
    await page.addInitScript(() => {
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    });
    await page.route('**/api/v1/content-bootstrap**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { species: [], careArticles: [], authority: 'legacy-published', publicationCounts: { species: 0, care: 0 } }, requestId: 'care-seo-route' }),
    }));
    await page.route('**/api/v1/compatibility-bootstrap**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'test fallback' }, requestId: 'care-compat-fallback' }),
    }));

    await page.goto(`${baseUrl}/care/guide_safe_water_change`, { waitUntil: 'networkidle' });
    const canonicalPage = page.getByTestId('care-canonical-topic-page');
    await canonicalPage.waitFor();
    await canonicalPage.getByRole('heading', { level: 1, name: /安全.*换水/ }).waitFor();
    assert.match(await page.title(), /安全.*换水.*AquaGuide/);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    assert.ok(description && description.length > 10, 'Canonical Care route must own a topic meta description.');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${baseUrl}/care/guide_safe_water_change`);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
    assert.equal(await canonicalPage.locator('h1').count(), 1, 'Canonical Care topic page must expose exactly one topic H1.');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, `${viewport.width}px canonical Care topic route should not overflow horizontally`);

    await canonicalPage.getByRole('button', { name: '返回养护百科' }).click();
    await page.waitForURL(url => new URL(url).pathname === '/care');

    await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'networkidle' });
    await page.getByRole('dialog').waitFor();
    assert.equal(await page.getByTestId('care-canonical-topic-page').count(), 0, 'Legacy query route must keep Dialog behavior.');
    assert.equal(new URL(page.url()).pathname, '/care');
    assert.equal(new URL(page.url()).searchParams.get('topic'), 'guide_safe_water_change');
    await page.close();
  }
  console.log('care SEO canonical route verified: standalone H1/meta/canonical/noindex + legacy query Dialog PASS');
} finally {
  await browser.close();
  await vite.close();
}

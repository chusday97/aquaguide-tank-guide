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
  const routeCases = [
    {
      path: '/care/guide_safe_water_change.html',
      storedLocale: 'zh-CN',
      expectedLang: 'en',
      heading: /How to Perform a Water Change Safely/,
      title: /How to Perform a Water Change Safely.*AquaGuide/,
    },
    {
      path: '/zh/care/guide_safe_water_change.html',
      storedLocale: 'en',
      expectedLang: 'zh-CN',
      heading: /安全.*换水/,
      title: /安全.*换水.*AquaGuide/,
    },
  ];
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    for (const routeCase of routeCases) {
      const page = await browser.newPage({ viewportSize: viewport });
      await page.addInitScript((storedLocale) => {
        localStorage.setItem('aquaguide_locale', storedLocale);
      }, routeCase.storedLocale);
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

      await page.goto(`${baseUrl}${routeCase.path}`, { waitUntil: 'networkidle' });
      const canonicalPage = page.getByTestId('care-canonical-topic-page');
      await canonicalPage.waitFor();
      await canonicalPage.getByRole('heading', { level: 1, name: routeCase.heading }).waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), routeCase.expectedLang);
      assert.match(await page.title(), routeCase.title);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      assert.ok(description && description.length > 10, 'Canonical Care route must own a topic meta description.');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `${baseUrl}${routeCase.path}`);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
      assert.equal(await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href'), `${baseUrl}/care/guide_safe_water_change.html`);
      assert.equal(await page.locator('link[rel="alternate"][hreflang="zh-CN"]').getAttribute('href'), `${baseUrl}/zh/care/guide_safe_water_change.html`);
      assert.equal(await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute('href'), `${baseUrl}/care/guide_safe_water_change.html`);
      assert.equal(await canonicalPage.locator('h1').count(), 1, 'Canonical Care topic page must expose exactly one topic H1.');
      assert.equal(await page.evaluate(() => localStorage.getItem('aquaguide_locale')), routeCase.storedLocale, 'SEO route locale must not overwrite the user language preference.');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      assert.equal(overflow, false, `${viewport.width}px canonical Care topic route should not overflow horizontally`);
      await canonicalPage.locator('button').first().click();
      await page.waitForURL(url => new URL(url).pathname === '/care');
      await page.close();
    }

    const legacyPage = await browser.newPage({ viewportSize: viewport });
    await legacyPage.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await legacyPage.route('**/api/v1/content-bootstrap**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { species: [], careArticles: [], authority: 'legacy-published', publicationCounts: { species: 0, care: 0 } }, requestId: 'care-seo-legacy' }),
    }));
    await legacyPage.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'networkidle' });
    await legacyPage.getByRole('dialog').waitFor();
    assert.equal(await legacyPage.getByTestId('care-canonical-topic-page').count(), 0, 'Legacy query route must keep Dialog behavior.');
    assert.equal(new URL(legacyPage.url()).pathname, '/care');
    assert.equal(new URL(legacyPage.url()).searchParams.get('topic'), 'guide_safe_water_change');
    await legacyPage.close();
  }
  console.log('care SEO canonical route verified: deterministic EN/ZH paths + hreflang + noindex + legacy query Dialog PASS');
} finally {
  await browser.close();
  await vite.close();
}

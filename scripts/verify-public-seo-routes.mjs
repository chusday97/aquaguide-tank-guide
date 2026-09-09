import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const publicRoutes = [
  { path: '/', type: 'marketing', jsonLd: ['WebSite'] },
  { path: '/category/shrimp-snails-crabs', type: 'category', jsonLd: ['CollectionPage', 'BreadcrumbList'] },
  { path: '/species/sp_0001', type: 'species', jsonLd: [] },
  { path: '/species/sp_0432', type: 'species', jsonLd: [] },
  { path: '/species/sp_0001?variant=sp_0030', type: 'species', jsonLd: [] },
  { path: '/guides/new-fish-acclimation', type: 'guide', jsonLd: [] },
];

const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
await context.addInitScript(() => {
  localStorage.setItem('aquaguide_locale', 'zh-CN');
  window.__seoVitals = { lcp: 0, cls: 0 };
  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) window.__seoVitals.lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__seoVitals.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Older Chromium builds may not expose these observers.
    }
  }
});
const page = await context.newPage();
page.setDefaultTimeout(20_000);

const inspectPage = async (route, width) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
  const result = await page.evaluate(() => {
    const visible = node => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const headings = [...document.querySelectorAll('h1,h2,h3')].filter(visible).map(node => Number(node.tagName.slice(1)));
    const interactiveSmall = [...document.querySelectorAll('a,button,select,input')]
      .filter(visible)
      .filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).length;
    const focused = document.querySelector('a,button,select,input');
    focused?.focus();
    const focusStyle = focused ? getComputedStyle(focused) : null;
    const fontResources = performance.getEntriesByType('resource')
      .filter(entry => /\.(woff2?|ttf|otf)(\?|$)/i.test(entry.name))
      .map(entry => ({ name: entry.name, size: entry.transferSize || entry.encodedBodySize || 0 }));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      publicShell: Boolean(document.querySelector('.public-seo-root')),
      appShell: Boolean(document.querySelector('.aquaguide-app, .desktop-shell-active, .phone-shell-active')),
      onboarding: Boolean(document.querySelector('.aquarium-onboarding')),
      h1Count: document.querySelectorAll('h1').length,
      headings,
      interactiveSmall,
      focusVisible: Boolean(focusStyle && focusStyle.outlineStyle !== 'none'),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      title: document.title,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent || '{}')),
      body: document.body.innerText,
      vitals: window.__seoVitals,
      fontResources,
    };
  });
  assert.equal(result.scrollWidth, width, `${route.path} overflows at ${width}px`);
  assert.equal(result.h1Count, 1, `${route.path} should have one H1`);
  assert.ok(result.headings.every((level, index) => index === 0 || level <= result.headings[index - 1] + 1), `${route.path} heading levels should be continuous`);
  assert.equal(result.interactiveSmall, 0, `${route.path} has a target smaller than 44px`);
  assert.equal(result.focusVisible, true, `${route.path} first interactive target lacks visible focus`);
  assert.equal(result.robots, 'noindex,follow', `${route.path} robots policy changed`);
  assert.equal(result.publicShell, true, `${route.path} should use Public Shell`);
  assert.equal(result.appShell, false, `${route.path} should not mount App Shell`);
  assert.equal(result.onboarding, false, `${route.path} should not mount onboarding`);
  const types = result.jsonLd.flatMap(item => item['@graph']?.map(node => node['@type']) || [item['@type']]);
  assert.deepEqual(types.sort(), [...route.jsonLd].sort(), `${route.path} JSON-LD does not match its publication gate`);
  return result;
};

try {
  const snapshots = [];
  for (const route of publicRoutes) {
    snapshots.push(await inspectPage(route, 390));
    await inspectPage(route, 600);
    await inspectPage(route, 1440);
  }

  const appRoutes = ['/aquarium', '/care', '/welcome'];
  for (const route of appRoutes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    const appShell = await page.locator('.aquaguide-app, .desktop-shell-active, .phone-shell-active').count();
    const onboarding = await page.locator('button').filter({ hasText: /Start|开始/ }).count();
    if (route === '/aquarium' && page.url().endsWith('/welcome')) {
      assert.ok(onboarding > 0, '/aquarium should retain its onboarding gate');
    } else if (route === '/welcome') {
      assert.ok(onboarding > 0, '/welcome should retain its onboarding surface');
    } else {
      assert.ok(appShell > 0, `${route} should retain App Shell`);
    }
    assert.equal(await page.locator('.public-seo-root').count(), 0, `${route} should not use Public Shell`);
  }

  const final = snapshots.at(-1);
  console.log(JSON.stringify({
    routes: publicRoutes.length + appRoutes.length,
    responsiveWidths: [390, 600, 1440],
    fontResources: final?.fontResources || [],
    lcpMs: final?.vitals?.lcp || null,
    cls: final?.vitals?.cls || null,
    result: 'public SEO routes passed',
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}

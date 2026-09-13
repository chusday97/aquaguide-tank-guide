import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const screenshotDir = process.env.SEO_SCREENSHOT_DIR;
const widths = [390, 600, 1440];
const publicRoutes = [
  { id: 'marketing', path: '/', jsonLd: ['WebSite'] },
  { id: 'category', path: '/category/shrimp-snails-crabs', jsonLd: ['BreadcrumbList', 'CollectionPage'] },
  { id: 'sp_0001', path: '/species/sp_0001', jsonLd: [] },
  { id: 'sp_0001-variant-sp_0030', path: '/species/sp_0001?variant=sp_0030', jsonLd: [] },
  { id: 'sp_0432', path: '/species/sp_0432', jsonLd: [] },
  { id: 'sp_0436', path: '/species/sp_0436', jsonLd: [] },
  { id: 'guide-new-fish-acclimation', path: '/guides/new-fish-acclimation', jsonLd: [] },
];
const appRoutes = ['/aquarium', '/care', '/welcome'];
const prohibitedRequest = /supabase\.co|\/auth(?:\/|$)|\/api\/(?:tank|aquarium|compatibility|session|user)/i;
const prohibitedCopy = /Candidate|Draft|Review|Override|Product Truth|Publish Gate|编辑内容/i;

if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const requestLog = [];
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
await context.addInitScript(() => {
  localStorage.setItem('aquaguide_locale', 'zh-CN');
  window.__seoVitals = { lcp: 0, cls: 0 };
  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver(list => {
        const last = list.getEntries().at(-1);
        if (last) window.__seoVitals.lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__seoVitals.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Metrics are best-effort; layout and content assertions remain authoritative.
    }
  }
});
const page = await context.newPage();
page.setDefaultTimeout(20_000);
let checkingPublicRoute = false;
page.on('request', request => {
  if (checkingPublicRoute) requestLog.push(request.url());
});

const fileNameFor = (id, width) => `${id}-${width}.png`;
const typesFor = jsonLd => jsonLd.flatMap(item => item['@graph']?.map(node => node['@type']) || [item['@type']]);

const inspect = async (route, width) => {
  await page.setViewportSize({ width, height: 844 });
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const result = await page.evaluate(() => {
    const visible = node => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const headings = [...document.querySelectorAll('h1,h2,h3')].filter(visible).map(node => Number(node.tagName.slice(1)));
    const smallTargets = [...document.querySelectorAll('a,button,select,input,[role="button"]')]
      .filter(visible)
      .filter(node => {
        const rect = node.getBoundingClientRect();
        return Math.round(rect.width) < 44 || Math.round(rect.height) < 44;
      }).length;
    const firstInteractive = document.querySelector('a,button,select,input,[role="button"]');
    firstInteractive?.focus();
    const focusStyle = firstInteractive ? getComputedStyle(firstInteractive) : null;
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      h1Count: document.querySelectorAll('h1').length,
      headings,
      smallTargets,
      focusVisible: Boolean(focusStyle && focusStyle.outlineStyle !== 'none'),
      publicShell: Boolean(document.querySelector('.public-seo-root')),
      appShell: Boolean(document.querySelector('.aquaguide-app, .desktop-shell-active, .phone-shell-active')),
      onboarding: Boolean(document.querySelector('.aquarium-onboarding')),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
      title: document.title,
      body: document.body.innerText,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent || '{}')),
      dataRailColumns: document.querySelector('.seo-data-rail') ? getComputedStyle(document.querySelector('.seo-data-rail')).gridTemplateColumns.split(' ').length : null,
      heroLead: document.querySelector('.seo-hero__content .seo-lead')?.textContent || '',
      compatibilityHref: document.querySelector('a[href*="mode=compatibility"]')?.getAttribute('href') || '',
      vitals: window.__seoVitals,
    };
  });

  assert.equal(result.scrollWidth, width, `${route.path} overflows at ${width}px`);
  assert.equal(result.h1Count, 1, `${route.path} should have one H1`);
  assert.ok(result.headings.every((level, index) => index === 0 || level <= result.headings[index - 1] + 1), `${route.path} heading levels should be continuous`);
  assert.equal(result.smallTargets, 0, `${route.path} has an interactive target smaller than 44px`);
  assert.equal(result.focusVisible, true, `${route.path} has no visible keyboard focus`);
  assert.equal(result.publicShell, true, `${route.path} should use Public Shell`);
  assert.equal(result.appShell, false, `${route.path} should not mount App Shell`);
  assert.equal(result.onboarding, false, `${route.path} should not mount onboarding`);
  assert.equal(result.robots, 'noindex,follow', `${route.path} robots policy changed`);
  assert.doesNotMatch(result.body, prohibitedCopy, `${route.path} exposes internal publishing terminology`);
  assert.deepEqual(typesFor(result.jsonLd).sort(), [...route.jsonLd].sort(), `${route.path} JSON-LD does not match its publication gate`);

  if (route.id === 'sp_0001') {
    assert.match(result.body, /极火虾/);
    assert.match(result.body, /一眼了解/);
    assert.match(result.body, /常见问题/);
    assert.match(result.compatibilityHref, /species=sp_0001/);
    assert.match(result.compatibilityHref, /source=species-profile/);
    assert.ok(await page.locator('a[href="#behavior"]').count() > 0, `${route.path} should expose a behavior chapter anchor`);
    const faqButton = page.locator('#faq button[aria-expanded]').first();
    if (await faqButton.count() > 0) {
      await faqButton.focus();
      await faqButton.press('Space');
      assert.equal(await faqButton.getAttribute('aria-expanded'), 'true', `${route.path} FAQ should expand by keyboard`);
    }
  }
  if (route.id === 'sp_0001-variant-sp_0030') {
    assert.match(result.body, /黄金米虾/);
    assert.match(result.body, /黄色选育型/);
    assert.match(result.body, /生物膜/);
    assert.match(result.heroLead, /黄色选育型/);
    assert.doesNotMatch(result.heroLead, /红色选育型/);
    assert.match(result.compatibilityHref, /species=sp_0030/);
  }
  if (route.id === 'sp_0432') {
    assert.match(result.body, /宝莲灯/);
    assert.match(result.body, /中层/);
    assert.match(result.body, /建议至少 5 条/);
    assert.match(result.body, /适合怎样的环境/);
    assert.match(result.compatibilityHref, /species=sp_0432/);
  }
  if (route.id === 'sp_0436') {
    assert.match(result.body, /孔雀鱼/);
    assert.match(result.body, /Poecilia reticulata/);
    assert.match(result.body, /图片暂时不可用|图片暂不可用/);
  }
  if (route.id.startsWith('sp_') && result.dataRailColumns !== null) {
    assert.equal(result.dataRailColumns, width === 390 ? 2 : width === 600 ? 3 : 6, `${route.path} data rail columns mismatch at ${width}px`);
  }

  if (screenshotDir && route.id.startsWith('sp_')) await page.screenshot({ path: path.join(screenshotDir, fileNameFor(route.id, width)), fullPage: true });
  return result;
};

const buildComparison = async (speciesId, files) => {
  if (!screenshotDir) return;
  const images = await Promise.all(files.map(async ({ width, file }) => {
    const data = (await readFile(path.join(screenshotDir, file))).toString('base64');
    return `<figure><figcaption>${width}px</figcaption><img src="data:image/png;base64,${data}" /></figure>`;
  }));
  const comparison = await browser.newPage({ viewport: { width: 1800, height: 1000 } });
  await comparison.setContent(`<style>body{margin:24px;background:#fdfcf8;color:#1a1a1a;font:16px sans-serif}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}figure{margin:0}figcaption{margin:0 0 8px;font-weight:700}img{display:block;width:100%;height:auto;border:1px solid #d8ddd9;border-radius:12px}</style><main>${images.join('')}</main>`);
  await comparison.screenshot({ path: path.join(screenshotDir, `${speciesId}-comparison.png`), fullPage: true });
  await comparison.close();
};

try {
  const captured = new Map();
  for (const route of publicRoutes) {
    checkingPublicRoute = true;
    const results = [];
    for (const width of widths) results.push(await inspect(route, width));
    captured.set(route.id, results);
    checkingPublicRoute = false;
  }

  for (const route of appRoutes) {
    checkingPublicRoute = false;
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.public-seo-root').count(), 0, `${route} should not use Public Shell`);
    if (route === '/welcome') {
      assert.ok(await page.locator('button').filter({ hasText: /开始|Start/ }).count() > 0, '/welcome should retain onboarding controls');
    } else if (route === '/aquarium' && page.url().endsWith('/welcome')) {
      assert.ok(await page.locator('button').filter({ hasText: /开始|Start/ }).count() > 0, '/aquarium should retain its onboarding gate');
    } else {
      assert.ok(await page.locator('.aquaguide-app, .desktop-shell-active, .phone-shell-active').count() > 0, `${route} should retain App Shell`);
    }
  }

  await buildComparison('species', [
    { width: 390, file: fileNameFor('sp_0001', 390) },
    { width: 600, file: fileNameFor('sp_0001', 600) },
    { width: 1440, file: fileNameFor('sp_0001', 1440) },
  ]);
  await buildComparison('species-variant', [
    { width: 390, file: fileNameFor('sp_0001-variant-sp_0030', 390) },
    { width: 600, file: fileNameFor('sp_0001-variant-sp_0030', 600) },
    { width: 1440, file: fileNameFor('sp_0001-variant-sp_0030', 1440) },
  ]);
  await buildComparison('lantern-fish', [
    { width: 390, file: fileNameFor('sp_0432', 390) },
    { width: 600, file: fileNameFor('sp_0432', 600) },
    { width: 1440, file: fileNameFor('sp_0432', 1440) },
  ]);
  await buildComparison('guppy', [
    { width: 390, file: fileNameFor('sp_0436', 390) },
    { width: 600, file: fileNameFor('sp_0436', 600) },
    { width: 1440, file: fileNameFor('sp_0436', 1440) },
  ]);

  const blocked = requestLog.filter(url => prohibitedRequest.test(url));
  assert.deepEqual(blocked, [], `Public/App browser gate observed forbidden data request(s): ${blocked.join(', ')}`);
  const final = captured.get('sp_0436')?.at(-1);
  console.log(JSON.stringify({
    routes: publicRoutes.length + appRoutes.length,
    speciesRoutes: 4,
    widths,
    screenshots: screenshotDir ? '12 raw + 4 comparison' : 'disabled',
    lcpMs: final?.vitals?.lcp || null,
    cls: final?.vitals?.cls || null,
    forbiddenRequests: blocked.length,
    result: 'public SEO GitHub Actions browser gate passed',
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}

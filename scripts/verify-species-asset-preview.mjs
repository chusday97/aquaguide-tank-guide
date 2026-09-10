import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const outputDir = '.project-journal/evidence/seo-asset-preview';
const widths = [390, 600, 1440];
const previews = [
  { name: 'sp_0001', path: '/species/sp_0001?assetPreview=1', sources: ['sp_0001.png'] },
  { name: 'sp_0030-variant', path: '/species/sp_0001?variant=sp_0030&assetPreview=1', sources: ['sp_0001.png', 'sp_0030.png'] },
  { name: 'sp_0432', path: '/species/sp_0432?assetPreview=1', sources: ['sp_0432.png'] },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: 'zh-CN' });
await context.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
const page = await context.newPage();
page.setDefaultTimeout(20_000);

try {
  for (const preview of previews) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`${baseUrl}${preview.path}`, { waitUntil: 'networkidle' });
      const state = await page.evaluate(() => ({
        robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
        jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
        images: [...document.querySelectorAll('main img')].map(image => image.getAttribute('src') || ''),
        overflow: document.documentElement.scrollWidth > innerWidth,
        backendTerms: /Draft|Review|Override|Publish Gate|Product Truth|审核/.test(document.body.innerText),
      }));
      assert.equal(state.robots, 'noindex,follow', `${preview.name} preview changed robots at ${width}px`);
      assert.equal(state.jsonLd, 0, `${preview.name} preview added JSON-LD at ${width}px`);
      assert.equal(state.overflow, false, `${preview.name} preview overflows at ${width}px`);
      assert.equal(state.backendTerms, false, `${preview.name} preview exposed review terms at ${width}px`);
      for (const source of preview.sources) assert.ok(state.images.some(image => image.includes(source)), `${preview.name} missing ${source} at ${width}px`);
      await page.screenshot({ path: `${outputDir}/${preview.name}-${width}.png`, fullPage: true });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/species/sp_0001`, { waitUntil: 'networkidle' });
  const ordinary = await page.evaluate(() => ({
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    images: [...document.querySelectorAll('main img')].map(image => image.getAttribute('src') || ''),
  }));
  assert.equal(ordinary.robots, 'noindex,follow');
  assert.ok(ordinary.images.some(image => image.includes('sp_0001.png')), 'ordinary public route must retain the approved Hero asset');

  await page.goto(`${baseUrl}/species/sp_0432`, { waitUntil: 'networkidle' });
  const pendingOrdinary = await page.evaluate(() => ({
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    images: [...document.querySelectorAll('main img')].map(image => image.getAttribute('src') || ''),
    fallback: document.body.innerText.includes('图片暂时不可用'),
  }));
  assert.equal(pendingOrdinary.robots, 'noindex,follow');
  assert.equal(pendingOrdinary.images.some(image => image.includes('sp_0432.png')), false, 'ordinary pending route must not expose unapproved asset');
  assert.equal(pendingOrdinary.fallback, true, 'ordinary pending route must show a stable image fallback');

  console.log(JSON.stringify({
    routes: previews.map(preview => preview.path),
    widths,
    outputDir,
    ordinaryRoute: 'approved asset preserved',
    result: 'species asset preview passed',
  }, null, 2));
} finally {
  await context.close();
  await browser.close();
}

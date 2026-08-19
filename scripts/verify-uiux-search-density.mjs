import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const cases = [
  { name: 'compact-desktop-768', width: 768, height: 900, mode: 'stacked' },
  { name: 'desktop-1024', width: 1024, height: 900, mode: 'stacked' },
  { name: 'wide-1440', width: 1440, height: 1000, mode: 'side-by-side' },
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const testCase of cases) {
    const context = await browser.newContext({ viewport: { width: testCase.width, height: testCase.height }, locale: 'zh-CN' });
    await context.addInitScript(() => {
      localStorage.setItem('aquaguide_locale', 'zh-CN');
      localStorage.setItem('aquaguide_onboarding_v1', JSON.stringify({ version: 1, status: 'skipped' }));
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${baseUrl}/search?q=${encodeURIComponent('鱼')}`, { waitUntil: 'domcontentloaded' });
    await page.locator('.search-v2-species-section').waitFor();
    await page.locator('.search-v2-care-section').waitFor();
    await page.waitForTimeout(500);

    const geometry = await page.evaluate(() => {
      const rect = selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {
          top: Math.round(box.top),
          bottom: Math.round(box.bottom),
          left: Math.round(box.left),
          right: Math.round(box.right),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
      };
      return {
        page: rect('.search-v2-page'),
        species: rect('.search-v2-species-section'),
        care: rect('.search-v2-care-section'),
        firstSpeciesCard: rect('.search-v2-species-card'),
        sidebar: rect('.desktop-sidebar'),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      };
    });

    assert.ok(geometry.page && geometry.species && geometry.care && geometry.firstSpeciesCard, `${testCase.name}: missing Search surface`);
    assert.ok(geometry.documentWidth <= geometry.viewportWidth + 1, `${testCase.name}: Search page overflows horizontally`);
    assert.ok(geometry.firstSpeciesCard.width >= 220, `${testCase.name}: species result card is too narrow (${geometry.firstSpeciesCard.width}px)`);

    if (testCase.mode === 'stacked') {
      assert.ok(Math.abs(geometry.species.left - geometry.care.left) <= 8, `${testCase.name}: Species and Care should share one content column`);
      assert.ok(geometry.care.top >= geometry.species.bottom - 8, `${testCase.name}: Care should follow Species rather than squeeze beside it`);
    } else {
      assert.ok(Math.abs(geometry.species.top - geometry.care.top) <= 24, `${testCase.name}: wide Search should compare Species and Care side-by-side`);
      assert.ok(geometry.care.left >= geometry.species.right - 8, `${testCase.name}: wide Search columns overlap`);
    }

    results.push({ name: testCase.name, ...geometry });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log('Search visual density PASS');
console.log(JSON.stringify(results, null, 2));

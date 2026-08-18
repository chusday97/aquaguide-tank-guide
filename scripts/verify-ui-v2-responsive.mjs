import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();

  const app = page.locator('.aquaguide-app');
  await app.waitFor();
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'phone');
  assert.equal(await app.getAttribute('data-layout-mode'), 'phone', '390px viewport must render the phone shell regardless of desktop browser user-agent');

  const grid = page.locator('.quick-action-grid').first();
  await grid.waitFor();
  const compactColumns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(compactColumns, 1, `compact Aquarium quick actions must use one adaptive column, got ${compactColumns}`);

  const indexDisplay = await page.locator('.aquarium-zone-index').first().evaluate(element => getComputedStyle(element).display);
  assert.equal(indexDisplay, 'none', 'Observe / Manage / Learn must not look like a forced numbered wizard');

  const compactOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(compactOverflow.scrollWidth <= compactOverflow.viewportWidth + 1, `compact Aquarium must not overflow horizontally: ${JSON.stringify(compactOverflow)}`);

  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');
  assert.equal(await app.getAttribute('data-layout-mode'), 'desktop', '900px viewport must switch to desktop shell without reload');
  await grid.waitFor();
  const mediumColumns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(mediumColumns, 2, `medium Aquarium quick actions must use two columns, got ${mediumColumns}`);

  const mediumOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(mediumOverflow.scrollWidth <= mediumOverflow.viewportWidth + 1, `medium Aquarium must not overflow horizontally: ${JSON.stringify(mediumOverflow)}`);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');
  await grid.waitFor();
  const wideColumns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(wideColumns, 3, `wide Aquarium quick actions must use three columns, got ${wideColumns}`);

  const sectionTypography = await page.locator('.aquarium-zone-header h2').first().evaluate(element => {
    const style = getComputedStyle(element);
    return { fontSize: parseFloat(style.fontSize), fontWeight: parseInt(style.fontWeight, 10), lineHeight: style.lineHeight };
  });
  assert.ok(sectionTypography.fontSize >= 18, `section title must retain readable hierarchy, got ${sectionTypography.fontSize}px`);
  assert.ok(sectionTypography.fontWeight >= 600 && sectionTypography.fontWeight <= 750, `section title must use controlled semantic weight, got ${sectionTypography.fontWeight}`);

  const wideOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(wideOverflow.scrollWidth <= wideOverflow.viewportWidth + 1, `wide Aquarium must not overflow horizontally: ${JSON.stringify(wideOverflow)}`);
  assert.deepEqual(pageErrors, [], `UI V2 responsive path must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('AquaGuide UI V2 responsive regression: PASS (390px phone → 900px medium → 1600px wide, no reload).');
} finally {
  await browser.close();
}

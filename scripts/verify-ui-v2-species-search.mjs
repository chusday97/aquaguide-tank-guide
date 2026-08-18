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

  await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'domcontentloaded' });
  const atlasGrid = page.locator('#atlas-grid');
  await atlasGrid.waitFor();
  const firstCard = atlasGrid.locator('[data-species-card], [data-species-group-card]').first();
  await firstCard.waitFor();

  const compactColumns = await atlasGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(compactColumns, 2, `compact Species atlas must remain scan-friendly at two columns, got ${compactColumns}`);

  const cardMetrics = await firstCard.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      height: rect.height,
      radius: parseFloat(style.borderTopLeftRadius),
    };
  });
  assert.ok(cardMetrics.height <= 390, `compact Species card must avoid the old oversized card rhythm, got ${cardMetrics.height}px`);
  assert.ok(cardMetrics.radius >= 18, `Species card must use the V2 surface radius, got ${cardMetrics.radius}px`);

  const firstImageArea = firstCard.locator('[data-species-card-image-area]').first();
  const imageRatio = await firstImageArea.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.width / rect.height;
  });
  assert.ok(imageRatio >= 1.15, `Species image must become supporting 4:3-ish media instead of a dominant square, got ratio ${imageRatio}`);

  const compactOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(compactOverflow.scrollWidth <= compactOverflow.viewportWidth + 1, `compact Species atlas must not overflow horizontally: ${JSON.stringify(compactOverflow)}`);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');
  const wideColumns = await atlasGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.ok(wideColumns >= 3, `desktop Species atlas must expose at least three scan columns, got ${wideColumns}`);

  await page.goto(`${baseUrl}/search?q=${encodeURIComponent('孔雀')}`, { waitUntil: 'domcontentloaded' });
  await page.locator('.search-v2-command').waitFor();
  const speciesResult = page.locator('.search-v2-species-card').first();
  await speciesResult.waitFor();
  assert.ok(await page.locator('.search-v2-species-section').isVisible(), 'species query must render the dedicated Species result surface');

  const speciesResultHeight = await speciesResult.evaluate(element => element.getBoundingClientRect().height);
  assert.ok(speciesResultHeight >= 96 && speciesResultHeight <= 180, `Search species result must remain compact and scannable, got ${speciesResultHeight}px`);

  await page.goto(`${baseUrl}/search?q=${encodeURIComponent('换水')}`, { waitUntil: 'domcontentloaded' });
  const careResult = page.locator('.search-v2-care-card').first();
  await careResult.waitFor();
  assert.ok(await page.locator('.search-v2-care-section').isVisible(), 'care query must render the dedicated Care result surface');

  const searchOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(searchOverflow.scrollWidth <= searchOverflow.viewportWidth + 1, `Search V2 must not overflow horizontally: ${JSON.stringify(searchOverflow)}`);
  assert.deepEqual(pageErrors, [], `Species/Search V2 path must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('AquaGuide UI V2 Species/Search regression: PASS (atlas hierarchy + differentiated search surfaces).');
} finally {
  await browser.close();
}

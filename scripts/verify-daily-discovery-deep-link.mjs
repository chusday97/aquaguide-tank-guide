import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 600, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => {
      localStorage.removeItem('aquapediaDiscoveryDeck');
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    });
    await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });

    const scene = page.locator('.interactive-tank-shell');
    await scene.locator('[data-scene-node]').first().waitFor();
    assert.equal(await scene.locator('[data-scene-node]').count(), 6, `interactive discovery must show six species at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px must not overflow`);

    const firstSources = await scene.locator('[data-scene-node] img').evaluateAll(images => images.map(image => image.getAttribute('src')));
    await scene.getByRole('button', { name: '换一批物种', exact: true }).click();
    await page.waitForTimeout(250);
    const secondSources = await scene.locator('[data-scene-node] img').evaluateAll(images => images.map(image => image.getAttribute('src')));
    assert.equal(secondSources.length, 6, `switching discovery batch must keep six species at ${width}px`);
    assert.equal(firstSources.some(source => secondSources.includes(source)), false, `switching discovery batch must replace the current group at ${width}px`);

    await scene.locator('[data-scene-node]').first().click();
    await scene.getByRole('button', { name: '查看物种档案', exact: true }).click();
    const detailSurface = page.locator('[data-surface="detail-rail"], [data-surface="bottom-sheet"]');
    await detailSurface.waitFor({ state: 'visible' });
    await detailSurface.getByRole('button', { name: '关闭', exact: true }).click();
    await detailSurface.waitFor({ state: 'hidden' });
    assert.equal(new URL(page.url()).pathname, '/encyclopedia', `closing discovery detail must stay on encyclopedia at ${width}px`);

    assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
    await page.close();
  }

  const atlas = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await atlas.addInitScript(() => {
    localStorage.removeItem('aquapediaDiscoveryDeck');
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });
  await atlas.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
  await atlas.locator('.interactive-tank-shell').waitFor();
  assert.equal(await atlas.locator('#aquarium-discovery').count(), 0, 'species guide must not expose the retired aquarium homepage discovery card');
  await atlas.close();
  const home = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await home.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await home.goto(`${baseUrl}/aquarium`, { waitUntil: 'networkidle' });
  assert.equal(await home.locator('#aquarium-discovery').count(), 0, 'aquarium home must not render a second discovery queue');
  await home.close();
  console.log('daily discovery verified: encyclopedia scene ownership, batch switch, detail return and no aquarium duplicate');
} finally {
  await browser.close();
}

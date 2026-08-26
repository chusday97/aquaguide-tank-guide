import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });

async function assertPersistentDetailRail(page, path, openDetail, switchDetail, closeDetail) {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await openDetail(page);

  const detail = page.locator('[data-detail-viewport="desktop-rail"]').last();
  await detail.waitFor({ state: 'visible' });

  const detailBox = await detail.boundingBox();
  assert.ok(detailBox, `${path} must render a visible desktop detail rail`);
  assert.equal(await detail.evaluate(node => getComputedStyle(node).position), 'fixed', `${path} detail must extend from the viewport right edge`);
  assert.equal(await detail.getAttribute('data-detail-behavior'), 'persistent-browse-rail', `${path} must use persistent browse-rail behavior`);
  assert.equal(await page.locator('body').evaluate(node => node.classList.contains('modal-open')), false, `${path} browsing detail must not lock the background`);

  const viewport = page.viewportSize();
  assert.ok(viewport, `${path} must have a viewport`);
  assert.ok(Math.abs(detailBox.x + detailBox.width - viewport.width) <= 3, `${path} detail rail must stay attached to the right viewport edge`);
  assert.ok(detailBox.height >= viewport.height - 3, `${path} detail rail must reach the viewport bottom`);
  assert.ok(detailBox.width >= 440 && detailBox.width <= 620, `${path} detail rail width must remain readable, got ${detailBox.width}`);

  const backdrop = page.locator('[data-slot="dialog-backdrop"]:visible');
  assert.equal(await backdrop.count(), 0, `${path} browsing detail must not render a blocking backdrop`);

  if (switchDetail) {
    await switchDetail(page);
    await detail.waitFor({ state: 'visible' });
    assert.equal(await detail.getAttribute('data-detail-behavior'), 'persistent-browse-rail', `${path} rail must remain open while switching browse targets`);
  }

  assert.equal(pageErrors.length, 0, `${path} must not throw while browsing details: ${pageErrors.join('; ')}`);
  await closeDetail(page);
  await detail.waitFor({ state: 'hidden' });
}

try {
  const atlas = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await assertPersistentDetailRail(
    atlas,
    '/encyclopedia?mode=browse',
    async page => {
      const detailButtons = page.locator('[id^="atlas-species-"]');
      await detailButtons.first().waitFor({ state: 'visible' });
      await detailButtons.first().click();
    },
    async page => {
      const detailButtons = page.locator('[id^="atlas-species-"]');
      if (await detailButtons.count() > 1) {
        await detailButtons.nth(1).scrollIntoViewIfNeeded();
        await detailButtons.nth(1).click();
      }
    },
    async page => page.locator('.species-workspace-close button').click(),
  );

  const care = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await assertPersistentDetailRail(
    care,
    '/care?topic=guide_new_fish_acclimation',
    async () => {},
    null,
    async page => page.getByRole('button', { name: /关闭指南|close guide/i }).click(),
  );

  console.log('persistent detail rail runtime: PASS');
} finally {
  await browser.close();
}

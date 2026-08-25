import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4347';
const browser = await chromium.launch({ headless: true });

const seed = page => page.addInitScript(() => {
  localStorage.setItem('aquaguide_locale', 'zh-CN');
  localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001', 'sp_0002', 'sp_0003']));
});

async function open(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
  await seed(page);
  await page.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  return page;
}

try {
  const desktop = await open(1440);
  const carousel = desktop.locator('[data-collection-carousel]');
  const focus = desktop.locator('[data-collection-focus]');
  await carousel.waitFor({ state: 'visible' });
  assert.equal(await focus.getAttribute('data-collection-focus'), 'wishlist');
  assert.equal(await desktop.locator('[data-collection-dot]').count(), 4, 'focus carousel must expose four module dots');
  assert.equal(await desktop.locator('[data-collection-neighbor="previous"]:visible').count(), 1, 'desktop must expose previous neighbor peek');
  assert.equal(await desktop.locator('[data-collection-neighbor="next"]:visible').count(), 1, 'desktop must expose next neighbor peek');

  await desktop.locator('[data-collection-carousel-next]').click();
  await desktop.waitForTimeout(250);
  assert.equal(await focus.getAttribute('data-collection-focus'), 'care', 'next arrow must advance center focus');
  assert.equal(await desktop.locator('[data-collection-dot="care"]').getAttribute('aria-current'), 'true');

  await desktop.locator('[data-collection-dot="memorial"]').click();
  await desktop.waitForTimeout(250);
  assert.equal(await focus.getAttribute('data-collection-focus'), 'memorial', 'dot must focus requested module');
  await desktop.close();

  const mobile = await open(390);
  const mobileFocus = mobile.locator('[data-collection-focus]');
  const focusCard = mobile.locator('[data-collection-focus-card]');
  assert.equal(await mobileFocus.getAttribute('data-collection-focus'), 'wishlist');
  assert.equal(await focusCard.evaluate(node => getComputedStyle(node).touchAction), 'pan-y', 'mobile focus card must preserve vertical page scrolling while allowing horizontal drag');

  const box = await focusCard.boundingBox();
  assert.ok(box, 'mobile focus card must be measurable');
  await mobile.mouse.move(box.x + 20, box.y + 20);
  await mobile.mouse.down();
  await mobile.mouse.move(box.x - 120, box.y + 20, { steps: 20 });
  await mobile.mouse.up();
  await mobile.waitForTimeout(500);
  assert.equal(await mobileFocus.getAttribute('data-collection-focus'), 'care', 'left drag must advance center focus');

  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `focus carousel must not introduce mobile horizontal overflow: ${overflow}px`);
  await mobile.close();

  console.log('Collection focus-carousel runtime PASS: creature-first + center focus + neighbor peek + arrows + dots + drag.');
} finally {
  await browser.close();
}

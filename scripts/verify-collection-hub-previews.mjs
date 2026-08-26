import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });

const seedCollection = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001', 'sp_0002', 'sp_0003', 'sp_0004']));
    localStorage.setItem('aqua_care_favorites', JSON.stringify({
      guide_new_fish_acclimation: { id: 'guide_new_fish_acclimation', title: '新鱼入缸', favoritedAt: '2026-07-28T10:00:00.000Z' },
      guide_water_deteriorate: { id: 'guide_water_deteriorate', title: '水质变差怎么办', favoritedAt: '2026-07-27T10:00:00.000Z' },
      guide_pregnant_care: { id: 'guide_pregnant_care', title: '怀孕鱼护理', favoritedAt: '2026-07-29T10:00:00.000Z' },
    }));
    localStorage.setItem('deceasedRecords', JSON.stringify([
      { id: 'memorial-1', fishId: 'sp_0001', date: '2026-07-18T08:00:00.000Z', reason: '记录水质波动并调整换水节奏' },
      { id: 'memorial-2', fishId: 'sp_0002', date: '2026-06-29T08:00:00.000Z' },
      { id: 'memorial-3', fishId: 'sp_0003', date: '2026-07-25T08:00:00.000Z', reason: '复盘入缸观察' },
    ]));
  });
};

const noHorizontalOverflow = async page => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `Collection must not overflow horizontally: ${overflow}px`);
};

const overlapArea = (a, b) => (
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
);

async function assertDesktopCreatureNavigation(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await seedCollection(page);
  await page.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);

  const scene = page.locator('section[aria-label="互动水族册"], section[aria-label="Interactive collection aquarium"]').first();
  const nodes = page.locator('[data-node-visual="creature"]:visible');
  const center = page.locator('[data-collection-focus]').first();
  assert.equal(await nodes.count(), 4, `${width}px desktop must expose four creature-first navigation nodes`);
  assert.equal(await center.getAttribute('data-collection-focus'), 'wishlist', 'Wishlist should be the initial center module');

  const [sceneBox, centerBox] = await Promise.all([scene.boundingBox(), center.boundingBox()]);
  assert.ok(sceneBox && centerBox, `${width}px scene and center must be measurable`);
  for (let index = 0; index < 4; index += 1) {
    const node = nodes.nth(index);
    const box = await node.boundingBox();
    assert.ok(box, `${width}px creature node ${index} must be visible`);
    assert.equal(await node.evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)', 'Creature node button must stay visually transparent');
    assert.equal(overlapArea(box, centerBox), 0, `${width}px creature nodes must not cover the center module`);
  }

  for (const module of ['wishlist', 'care']) {
    const node = page.locator(`[data-collection-node="${module}"]`);
    await node.hover();
    await page.waitForTimeout(160);
    const hover = page.locator(`[data-collection-hover="${module}"]`);
    assert.ok(await hover.isVisible(), `${module} hover subdivision must be visible`);
    const hoverBox = await hover.boundingBox();
    assert.ok(hoverBox && hoverBox.x >= sceneBox.x - 2 && hoverBox.x + hoverBox.width <= sceneBox.x + sceneBox.width + 2, `${module} hover subdivision must stay inside scene bounds`);
  }

  await page.locator('[data-collection-node="care"]').click();
  assert.equal(await center.getAttribute('data-collection-focus'), 'care', 'Clicking a creature must focus that collection in the center');
  assert.ok(await page.locator('[data-preview-item="care"]').count() >= 1, 'Care center module must render saved guides');

  await page.locator('[data-collection-node="wishlist"]').click();
  const firstWishlist = page.locator('[data-preview-item="wishlist"]').first();
  assert.equal(await firstWishlist.getAttribute('data-preview-id'), 'sp_0004', 'Newest saved species must remain first');
  await firstWishlist.click();
  await page.waitForURL(url => url.pathname === '/collection/wishlist' && url.searchParams.get('item') === 'sp_0004');

  await noHorizontalOverflow(page);
  assert.deepEqual(pageErrors, [], `Collection ${width}px must not throw: ${pageErrors.join('; ')}`);
  await page.close();
}

async function assertCompactNavigation(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await seedCollection(page);
  await page.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(550);
  assert.equal(await page.locator('[data-node-visual="creature"]:visible').count(), 0, `${width}px must not force desktop floating nodes`);
  const compact = page.locator('[data-collection-compact]:visible');
  assert.equal(await compact.count(), 4, `${width}px must expose four touch-friendly collection entries`);
  await page.locator('[data-collection-compact="care"]').click();
  assert.equal(await page.locator('[data-collection-focus]').getAttribute('data-collection-focus'), 'care', `${width}px compact navigation must still focus center content`);
  await noHorizontalOverflow(page);
  await page.close();
}

try {
  await assertDesktopCreatureNavigation(1440);
  await assertDesktopCreatureNavigation(1024);
  await assertCompactNavigation(768);
  await assertCompactNavigation(390);
  console.log('Collection hub creature-navigation runtime: PASS');
} finally {
  await browser.close();
}

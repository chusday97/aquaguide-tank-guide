import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const targetFishId = 'sp_0002';
const targetFishName = '水晶虾';
const targetCardId = `collection-wishlist-${targetFishId}`;

const seedCollection = async page => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001', 'sp_0002', 'sp_0003', 'sp_0004']));
  });
};

const railScrollLeft = locator => locator.evaluate(element => element.scrollLeft);

const moveTargetIntoScrolledContext = async (page, rail) => {
  const target = page.locator(`#${targetCardId}`);
  await target.waitFor();
  await rail.evaluate(element => {
    element.scrollLeft = Math.min(element.scrollWidth - element.clientWidth, 420);
  });
  await page.waitForTimeout(100);
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const scrollLeft = await railScrollLeft(rail);
  assert.ok(scrollLeft > 0, `Collection rail must be in a non-zero horizontal context before opening detail; got ${scrollLeft}.`);
  return { target, scrollLeft };
};

const assertContextRestored = async (page, rail, beforeScrollLeft, expectedCardId) => {
  await page.waitForFunction(id => {
    const target = document.getElementById(id);
    return Boolean(target && document.activeElement && (document.activeElement === target || target.contains(document.activeElement)));
  }, expectedCardId);
  const afterScrollLeft = await railScrollLeft(rail);
  assert.ok(
    Math.abs(afterScrollLeft - beforeScrollLeft) <= 3,
    `Closing detail must preserve the collection rail position; before=${beforeScrollLeft}, after=${afterScrollLeft}.`,
  );
  assert.equal(
    await page.evaluate(id => {
      const target = document.getElementById(id);
      return Boolean(target && document.activeElement && (document.activeElement === target || target.contains(document.activeElement)));
    }, expectedCardId),
    true,
    'Closing detail must restore focus to the exact saved object card or its original interaction target.',
  );
};

const assertNoPageOverflow = async page => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `Collection journey must not create page-level horizontal overflow; got ${overflow}px.`);
};

const getActiveModule = page => page.locator('[data-carousel-active="true"] [data-collection-module]').getAttribute('data-collection-module');

const assertFocusCarousel = async page => {
  const carousel = page.locator('.collection-hub-carousel');
  await carousel.waitFor();

  const cards = carousel.locator('[data-carousel-card]');
  assert.equal(await cards.count(), 4, 'Collection hub must expose four carousel module cards.');
  assert.equal(await carousel.locator('[data-carousel-active="true"]').count(), 1, 'Collection hub must have exactly one active carousel card.');
  assert.equal(await getActiveModule(page), 'wishlist', 'Wishlist must be the initial active collection module.');

  await page.waitForTimeout(350);
  const carouselBox = await carousel.locator(':scope > div').first().boundingBox();
  const activeBox = await carousel.locator('[data-carousel-active="true"]').boundingBox();
  assert.ok(activeBox && carouselBox, 'Collection carousel and active card must have measurable geometry.');
  const activeCenter = activeBox.x + activeBox.width / 2;
  const carouselCenter = carouselBox.x + carouselBox.width / 2;
  assert.ok(
    Math.abs(activeCenter - carouselCenter) <= Math.max(16, carouselBox.width * 0.04),
    `Active collection card must remain centered in the collection surface; cardCenter=${activeCenter}, carouselCenter=${carouselCenter}.`,
  );

  const visibleSideCards = await cards.evaluateAll(elements => elements.filter(element => {
    if (element.getAttribute('data-carousel-active') === 'true') return false;
    const rect = element.getBoundingClientRect();
    const opacity = Number.parseFloat(getComputedStyle(element).opacity || '0');
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    return opacity >= 0.2 && visibleWidth >= 24;
  }).length);
  assert.ok(visibleSideCards >= 2, `Collection carousel must visibly preview both neighboring modules; got ${visibleSideCards} visible side cards.`);

  const nextButton = page.getByRole('button', { name: '下一个水族册模块', exact: true });
  await nextButton.click();
  await page.waitForFunction(() => document.querySelector('[data-carousel-active="true"] [data-collection-module="care"]'));
  assert.equal(await getActiveModule(page), 'care', 'Next control must advance the active collection module to care.');

  const previousButton = page.getByRole('button', { name: '上一个水族册模块', exact: true });
  await previousButton.click();
  await page.waitForFunction(() => document.querySelector('[data-carousel-active="true"] [data-collection-module="wishlist"]'));
  assert.equal(await getActiveModule(page), 'wishlist', 'Previous control must restore wishlist as the active collection module.');

  const indicators = carousel.locator('[aria-label="选择水族册模块"] button');
  assert.equal(await indicators.count(), 4, 'Collection carousel must expose one position control per module.');
  assert.equal(await carousel.locator('[aria-label="选择水族册模块"] button[aria-current="true"]').count(), 1, 'Exactly one position control must expose the current carousel position.');

  await assertNoPageOverflow(page);
};

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  desktop.setDefaultTimeout(12_000);
  const desktopErrors = [];
  desktop.on('pageerror', error => desktopErrors.push(error.message));
  await seedCollection(desktop);

  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await desktop.getByText('我的水族册', { exact: true }).waitFor();
  await assertFocusCarousel(desktop);
  await desktop.getByRole('button', { name: '种草图鉴，4', exact: true }).click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist');

  const desktopRail = desktop.locator('.collection-wishlist-grid');
  await desktopRail.waitFor();
  const desktopMetrics = await desktopRail.evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(desktopMetrics.scrollWidth > desktopMetrics.clientWidth, 'Wishlist must be horizontally scrollable before GP-005 can be considered covered.');

  const { target: desktopTarget, scrollLeft: desktopScrollLeft } = await moveTargetIntoScrolledContext(desktop, desktopRail);
  await desktopTarget.getByRole('button').first().click();

  const desktopDrawer = desktop.locator('[data-surface="right-drawer"]');
  await desktopDrawer.waitFor();
  await desktopDrawer.getByText(targetFishName, { exact: true }).first().waitFor();
  assert.equal(new URL(desktop.url()).pathname, '/collection/wishlist', 'Opening saved-species detail must keep the user inside the wishlist collection context.');

  await desktop.keyboard.press('Escape');
  await desktopDrawer.waitFor({ state: 'detached' });
  await assertContextRestored(desktop, desktopRail, desktopScrollLeft, targetCardId);
  await assertNoPageOverflow(desktop);
  assert.deepEqual(desktopErrors, [], `Desktop GP-005 must not emit page errors: ${desktopErrors.join('; ')}`);
  await desktop.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'zh-CN',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  });
  const mobile = await mobileContext.newPage();
  mobile.setDefaultTimeout(12_000);
  const mobileErrors = [];
  mobile.on('pageerror', error => mobileErrors.push(error.message));
  await seedCollection(mobile);

  await mobile.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await mobile.getByText('我的水族册', { exact: true }).waitFor();
  await assertFocusCarousel(mobile);
  await mobile.getByRole('button', { name: '种草图鉴，4', exact: true }).click();
  await mobile.waitForURL(url => url.pathname === '/collection/wishlist');

  const mobileRail = mobile.locator('.collection-wishlist-grid');
  await mobileRail.waitFor();
  const { target: mobileTarget, scrollLeft: mobileScrollLeft } = await moveTargetIntoScrolledContext(mobile, mobileRail);
  await mobileTarget.getByRole('button').first().click();

  const mobileSheet = mobile.locator('[data-surface="bottom-sheet"]');
  await mobileSheet.waitFor();
  await mobileSheet.getByText(targetFishName, { exact: true }).first().waitFor();

  await mobile.keyboard.press('Escape');
  await mobileSheet.waitFor({ state: 'detached' });
  await assertContextRestored(mobile, mobileRail, mobileScrollLeft, targetCardId);
  await assertNoPageOverflow(mobile);
  assert.deepEqual(mobileErrors, [], `Mobile GP-005 must not emit page errors: ${mobileErrors.join('; ')}`);
  await mobileContext.close();

  console.log('GP-005 continuous E2E passed: Collection focus carousel → Wishlist horizontal context → exact saved species → desktop drawer/mobile sheet → close → exact card context and rail position preserved.');
} finally {
  await browser.close();
}

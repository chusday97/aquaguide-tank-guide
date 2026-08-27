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

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  desktop.setDefaultTimeout(12_000);
  const desktopErrors = [];
  desktop.on('pageerror', error => desktopErrors.push(error.message));
  await seedCollection(desktop);

  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await desktop.getByText('我的水族册', { exact: true }).waitFor();
  await desktop.getByRole('button', { name: '种草图鉴，4', exact: true }).click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist');

  const desktopRail = desktop.locator('.collection-wishlist-grid');
  await desktopRail.waitFor();
  const desktopMetrics = await desktopRail.evaluate(element => ({ clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));
  assert.ok(desktopMetrics.scrollWidth > desktopMetrics.clientWidth, 'Wishlist must be horizontally scrollable before GP-005 can be considered covered.');

  const { target: desktopTarget, scrollLeft: desktopScrollLeft } = await moveTargetIntoScrolledContext(desktop, desktopRail);
  await desktopTarget.getByRole('button').first().click();

  const desktopDrawer = desktop.locator('[data-surface="detail-rail"]:visible');
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

  console.log('GP-005 continuous E2E passed: Collection → Wishlist horizontal context → exact saved species → desktop drawer/mobile sheet → close → exact card context and rail position preserved.');
} finally {
  await browser.close();
}

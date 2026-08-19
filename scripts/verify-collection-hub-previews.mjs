import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
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

const assertNoHorizontalOverflow = async page => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `页面不应横向溢出，当前为 ${overflow}px`);
};

const railMetrics = locator => locator.evaluate(element => ({
  clientWidth: element.clientWidth,
  scrollWidth: element.scrollWidth,
  scrollLeft: element.scrollLeft,
  display: getComputedStyle(element).display,
  snap: getComputedStyle(element).scrollSnapType,
}));

const getActiveModule = page => page.locator('[data-carousel-active="true"] [data-collection-module]').getAttribute('data-collection-module');

const assertHubCarousel = async (page, expectedLayout) => {
  await page.getByRole('heading', { name: '我的水族册', exact: true }).waitFor();
  const carousel = page.locator('.collection-hub-carousel');
  await carousel.waitFor();

  assert.equal(await page.locator('[data-collection-module]').count(), 3, '主轮播只允许三个可用水族册模块');
  assert.equal(await carousel.locator('[data-carousel-card]').count(), 3, '轮播卡数量必须与 live module 数量一致');
  assert.equal(await carousel.locator('[data-carousel-active="true"]').count(), 1, '任何时刻只能有一张 active carousel card');
  assert.equal(await getActiveModule(page), 'wishlist', '首次进入应聚焦种草图鉴');
  assert.equal(await page.locator('[data-preview-item="wishlist"]').count(), 3, '种草模块应预览三个物种');
  assert.equal(await page.locator('[data-preview-item="care"]').count(), 2, '养护模块应预览两篇文章');
  assert.equal(await page.locator('[data-preview-item="memorial"]').count(), 2, '生命纪念应预览两条记录');

  const comingSoon = page.locator('[data-collection-coming-soon]');
  await comingSoon.waitFor();
  assert.equal(await comingSoon.getAttribute('data-feature-status'), 'building', '成就必须保留 building 状态但退出主轮播');
  assert.equal(await comingSoon.locator('button').count(), 0, '成就建设中区域不得伪装成可执行 CTA');
  assert.ok((await comingSoon.innerText()).includes('成就勋章'), 'coming-soon 区应明确说明未来的成就功能');

  assert.equal(await page.locator('[data-preview-item="wishlist"]').first().getAttribute('data-preview-id'), 'sp_0004', '最新加入的种草物种应排在最前');
  assert.equal(await page.locator('[data-preview-item="care"]').first().getAttribute('data-preview-id'), 'guide_pregnant_care', '养护收藏应按 favoritedAt 倒序');
  assert.equal(await page.locator('[data-preview-item="memorial"]').first().getAttribute('data-preview-id'), 'memorial-3', '生命纪念应按记录日期倒序');

  await page.waitForTimeout(350);
  const carouselBox = await carousel.locator(':scope > div').first().boundingBox();
  const activeBox = await carousel.locator('[data-carousel-active="true"]').boundingBox();
  assert.ok(carouselBox && activeBox, 'carousel 与 active card 必须可测量');
  const activeCenter = activeBox.x + activeBox.width / 2;
  const carouselCenter = carouselBox.x + carouselBox.width / 2;
  assert.ok(Math.abs(activeCenter - carouselCenter) <= Math.max(16, carouselBox.width * 0.04), 'active card 必须居中成为唯一视觉焦点');

  const visibleSideCards = await carousel.locator('[data-carousel-card]').evaluateAll(elements => elements.filter(element => {
    if (element.getAttribute('data-carousel-active') === 'true') return false;
    const rect = element.getBoundingClientRect();
    const opacity = Number.parseFloat(getComputedStyle(element).opacity || '0');
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    return opacity >= 0.2 && visibleWidth >= 24;
  }).length);
  assert.equal(visibleSideCards, 2, '三模块轮播必须同时露出左右两个 live 邻卡');

  await page.getByRole('button', { name: '下一个水族册模块', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-carousel-active="true"] [data-collection-module="care"]'));
  assert.equal(await getActiveModule(page), 'care');
  await page.getByRole('button', { name: '上一个水族册模块', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-carousel-active="true"] [data-collection-module="wishlist"]'));

  const indicators = carousel.locator('[aria-label="选择水族册模块"] button');
  assert.equal(await indicators.count(), 3, '位置圆点只能对应三个 live modules');
  assert.equal(await carousel.locator('[aria-label="选择水族册模块"] button[aria-current="true"]').count(), 1, '只能有一个当前位置圆点');

  assert.equal(await page.locator('.aquaguide-app').getAttribute('data-layout-mode'), expectedLayout, `viewport 应使用 ${expectedLayout} layout`);
  await assertNoHorizontalOverflow(page);
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const desktopErrors = [];
  desktop.on('pageerror', error => desktopErrors.push(error.message));
  await seedCollection(desktop);
  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });
  await assertHubCarousel(desktop, 'desktop');

  await desktop.getByRole('button', { name: '种草图鉴，4', exact: true }).click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist');
  const wishlistRail = desktop.locator('.collection-wishlist-grid');
  const wishlistMetrics = await railMetrics(wishlistRail);
  assert.equal(wishlistMetrics.display, 'flex', '种草收藏必须是横向 rail');
  assert.ok(wishlistMetrics.scrollWidth > wishlistMetrics.clientWidth, '种草收藏多卡时必须可以左右滑动');
  assert.ok(wishlistMetrics.snap.includes('x'), '种草收藏必须保持 x scroll-snap');
  const wishlistCardWidth = (await wishlistRail.locator('article').first().boundingBox())?.width ?? 0;
  assert.ok(wishlistCardWidth >= 270 && wishlistCardWidth <= 290, `桌面种草卡应接近 280px，实际 ${wishlistCardWidth}px`);

  await desktop.goto(`${baseUrl}/collection/care`, { waitUntil: 'networkidle' });
  const careRail = desktop.locator('.collection-care-grid');
  const careMetrics = await railMetrics(careRail);
  assert.equal(careMetrics.display, 'flex', '养护收藏必须是横向 rail');
  assert.ok(careMetrics.scrollWidth > careMetrics.clientWidth, '养护收藏多卡时必须可以左右滑动');
  await careRail.locator('article').first().getByRole('button').first().click();
  await desktop.locator('[data-surface="right-drawer"]').waitFor();
  await desktop.keyboard.press('Escape');

  await desktop.goto(`${baseUrl}/collection/memorial?item=memorial-2`, { waitUntil: 'networkidle' });
  await desktop.waitForURL(url => url.pathname === '/collection/memorial/memorial-2');
  await desktop.getByRole('button', { name: '返回生命纪念' }).click();
  await desktop.waitForURL(url => url.pathname === '/collection/memorial');
  assert.deepEqual(desktopErrors, [], `桌面不应出现页面错误：${desktopErrors.join('; ')}`);
  await desktop.close();

  const compact = await browser.newPage({ viewport: { width: 600, height: 900 } });
  const compactErrors = [];
  compact.on('pageerror', error => compactErrors.push(error.message));
  await seedCollection(compact);
  await compact.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await assertHubCarousel(compact, 'phone');
  assert.deepEqual(compactErrors, [], `600px compact 不应出现页面错误：${compactErrors.join('; ')}`);
  await compact.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  });
  const mobile = await mobileContext.newPage();
  const mobileErrors = [];
  mobile.on('pageerror', error => mobileErrors.push(error.message));
  await seedCollection(mobile);
  await mobile.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await assertHubCarousel(mobile, 'phone');

  await mobile.goto(`${baseUrl}/collection/wishlist`, { waitUntil: 'domcontentloaded' });
  const mobileWishlistRail = mobile.locator('.collection-wishlist-grid');
  await mobileWishlistRail.waitFor();
  const [wish1, wish2] = await Promise.all([
    mobileWishlistRail.locator('article').nth(0).boundingBox(),
    mobileWishlistRail.locator('article').nth(1).boundingBox(),
  ]);
  assert.ok(wish1 && wish2 && wish1.width < 390 && wish2.x < 390, '手机收藏卡应露出下一张，形成明确左右滑动提示');
  await assertNoHorizontalOverflow(mobile);
  assert.deepEqual(mobileErrors, [], `手机不应出现页面错误：${mobileErrors.join('; ')}`);
  await mobileContext.close();

  console.log('Collection UI system checks passed: live focus carousel at 390/600/1440, building IA separated, saved-object rails preserved, no overflow.');
} finally {
  await browser.close();
}

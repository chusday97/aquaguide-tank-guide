import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const seedCollection = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001', 'sp_0002', 'sp_0003']));
    localStorage.setItem('aqua_care_favorites', JSON.stringify({
      guide_new_fish_acclimation: {
        id: 'guide_new_fish_acclimation',
        title: '新鱼入缸',
        favoritedAt: '2026-07-28T10:00:00.000Z',
      },
      guide_water_deteriorate: {
        id: 'guide_water_deteriorate',
        title: '水质变差怎么办',
        favoritedAt: '2026-07-27T10:00:00.000Z',
      },
    }));
    localStorage.setItem('deceasedRecords', JSON.stringify([
      { id: 'memorial-1', fishId: 'sp_0001', date: '2026-07-18T08:00:00.000Z', reason: '记录水质波动并调整换水节奏' },
      { id: 'memorial-2', fishId: 'sp_0002', date: '2026-06-29T08:00:00.000Z' },
    ]));
  });
};

const assertNoHorizontalOverflow = async page => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `页面不应横向溢出，当前为 ${overflow}px`);
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const desktopErrors = [];
  desktop.on('pageerror', error => desktopErrors.push(error.message));
  await seedCollection(desktop);
  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });

  assert.equal(await desktop.locator('[data-collection-module]').count(), 4, '水族册首页应显示四个模块');
  assert.equal(await desktop.locator('[data-preview-item="wishlist"]').count(), 3, '种草模块应预览三个物种');
  assert.equal(await desktop.locator('[data-preview-item="care"]').count(), 2, '养护模块应预览两篇文章');
  assert.equal(await desktop.locator('[data-preview-item="memorial"]').count(), 2, '生命纪念应预览两条记录');
  assert.equal(await desktop.getByText('今日种草', { exact: true }).count(), 0, '今日种草不得进入水族册');

  const wishlistBox = await desktop.locator('[data-collection-module="wishlist"]').boundingBox();
  const careBox = await desktop.locator('[data-collection-module="care"]').boundingBox();
  const memorialBox = await desktop.locator('[data-collection-module="memorial"]').boundingBox();
  assert.ok(wishlistBox && careBox && memorialBox, '四格卡片必须可见');
  assert.ok(Math.abs(wishlistBox.y - careBox.y) <= 2, '宽桌面首行应为双列');
  assert.ok(memorialBox.y > wishlistBox.y + wishlistBox.height, '第二行应位于首行下方');
  await assertNoHorizontalOverflow(desktop);
  assert.deepEqual(desktopErrors, [], `桌面不应出现页面错误：${desktopErrors.join('; ')}`);

  const routeMap = {
    wishlist: '/collection/wishlist',
    care: '/collection/care',
    memorial: '/collection/memorial',
    achievements: '/collection/achievements',
  };
  for (const [moduleId, expectedPath] of Object.entries(routeMap)) {
    await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });
    await desktop.locator(`[data-collection-module="${moduleId}"]`).click();
    await desktop.waitForURL(url => url.pathname === expectedPath);
  }
  await desktop.close();

  const narrowDesktop = await browser.newPage({ viewport: { width: 600, height: 900 } });
  await seedCollection(narrowDesktop);
  await narrowDesktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });
  const narrowWishlist = await narrowDesktop.locator('[data-collection-module="wishlist"]').boundingBox();
  const narrowCare = await narrowDesktop.locator('[data-collection-module="care"]').boundingBox();
  assert.ok(narrowWishlist && narrowCare && narrowCare.y > narrowWishlist.y + narrowWishlist.height, '600px 桌面应降为单列');
  await assertNoHorizontalOverflow(narrowDesktop);
  await narrowDesktop.close();

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
  await mobile.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });
  assert.equal(await mobile.locator('[data-collection-module]').count(), 4, '手机也应显示四个完整模块');
  await assertNoHorizontalOverflow(mobile);
  assert.deepEqual(mobileErrors, [], `手机不应出现页面错误：${mobileErrors.join('; ')}`);
  await mobileContext.close();

  console.log('Collection hub preview checks passed.');
} finally {
  await browser.close();
}

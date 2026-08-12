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
  assert.equal(await desktop.locator('[data-preview-item="achievements"]').count(), 0, '建设中的成就模块不得展示真实勋章或进度');
  const achievementCopy = await desktop.locator('[data-collection-module="achievements"]').textContent();
  assert.ok(achievementCopy?.includes('成就勋章') && achievementCopy.includes('建设中') && achievementCopy.includes('暂未开放'), '横向轨道末端的成就模块必须保持建设中状态，不要求首屏可见');
  assert.equal(await desktop.locator('[data-preview-item="wishlist"]').first().getAttribute('data-preview-id'), 'sp_0004', '最新加入的种草物种应排在最前');
  assert.equal(await desktop.locator('[data-preview-item="care"]').first().getAttribute('data-preview-id'), 'guide_pregnant_care', '养护收藏应按 favoritedAt 倒序');
  assert.equal(await desktop.locator('[data-preview-item="memorial"]').first().getAttribute('data-preview-id'), 'memorial-3', '生命纪念应按记录日期倒序');
  await desktop.getByRole('button', { name: '更多 1 种' }).waitFor();
  await desktop.getByRole('button', { name: '更多 1 篇' }).waitFor();
  await desktop.getByRole('button', { name: '更多 1 条' }).waitFor();
  assert.equal(await desktop.getByRole('button', { name: /更多 .*枚/ }).count(), 0, '建设中的成就模块不得出现真实剩余勋章 CTA');
  assert.equal(await desktop.getByText('今日种草', { exact: true }).count(), 0, '今日种草不得进入水族册');

  const hubRail = desktop.locator('.collection-hub > section[aria-label]');
  const hubMetrics = await railMetrics(hubRail);
  assert.equal(hubMetrics.display, 'flex', '宽桌面水族册模块也应为横向卡片轨道');
  assert.ok(hubMetrics.scrollWidth > hubMetrics.clientWidth, '宽桌面模块轨道应可横向滚动');
  assert.ok(hubMetrics.snap.includes('x'), '宽桌面模块轨道应启用横向 scroll snap');
  const hubBoxes = await desktop.locator('[data-collection-module]').evaluateAll(elements => elements.slice(0, 3).map(element => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width };
  }));
  assert.ok(Math.abs(hubBoxes[0].y - hubBoxes[1].y) <= 2 && Math.abs(hubBoxes[1].y - hubBoxes[2].y) <= 2, '模块卡应在同一横向轨道而不是换行成 grid');
  assert.ok(hubBoxes[1].x > hubBoxes[0].x + hubBoxes[0].width, '后续模块卡应位于第一张右侧');
  await hubRail.evaluate(element => { element.scrollLeft = 420; });
  assert.ok((await railMetrics(hubRail)).scrollLeft > 0, '桌面触控板/水平滚动对应的 rail scrollLeft 必须可推进');
  await assertNoHorizontalOverflow(desktop);
  assert.deepEqual(desktopErrors, [], `桌面不应出现页面错误：${desktopErrors.join('; ')}`);

  await hubRail.evaluate(element => { element.scrollLeft = 0; });
  await desktop.locator('[data-preview-item="wishlist"]').first().click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist' && url.searchParams.get('item') === 'sp_0004');
  await desktop.locator('[data-surface="right-drawer"]').waitFor();
  await desktop.getByRole('button', { name: '知道了', exact: true }).click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist' && !url.searchParams.has('item'));

  const wishlistRail = desktop.locator('.collection-wishlist-grid');
  const wishlistMetrics = await railMetrics(wishlistRail);
  assert.equal(wishlistMetrics.display, 'flex', '种草收藏必须是横向 rail');
  assert.ok(wishlistMetrics.scrollWidth > wishlistMetrics.clientWidth, '种草收藏多卡时必须可以左右滑动');
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
  await desktop.locator('#collection-memorial-memorial-2').click();
  await desktop.waitForURL(url => url.pathname === '/collection/memorial/memorial-2');
  await desktop.getByRole('button', { name: '补充记录' }).click();
  await desktop.getByLabel('当时看到什么').fill('入缸后活动量持续减少');
  await desktop.getByLabel('以后准备怎么做').fill('下次延长过水并单独观察');
  await desktop.getByRole('button', { name: '保存复盘' }).click();
  await desktop.getByText('复盘已保存', { exact: true }).last().waitFor();
  await desktop.close();

  const narrowDesktop = await browser.newPage({ viewport: { width: 600, height: 900 } });
  await seedCollection(narrowDesktop);
  await narrowDesktop.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  const narrowRail = narrowDesktop.locator('.collection-hub > section[aria-label]');
  await narrowRail.waitFor();
  const narrowMetrics = await railMetrics(narrowRail);
  assert.equal(narrowMetrics.display, 'flex', '600px 窄桌面仍应保持横向卡片轨道，而不是回退为单列列表');
  assert.ok(narrowMetrics.scrollWidth > narrowMetrics.clientWidth, '600px 窄桌面必须保留左右滑动能力');
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
  await mobile.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  const mobileRail = mobile.locator('.collection-hub > section[aria-label]');
  await mobileRail.waitFor();
  assert.equal(await mobile.locator('[data-collection-module]').count(), 4, '手机也应显示四个完整模块');
  const [firstBox, secondBox] = await Promise.all([
    mobile.locator('[data-collection-module]').nth(0).boundingBox(),
    mobile.locator('[data-collection-module]').nth(1).boundingBox(),
  ]);
  assert.ok(firstBox && secondBox, '手机滑动卡必须可测量');
  assert.ok(firstBox.width < 390, '手机第一张卡不能占满整个 viewport，应露出下一张提示可滑动');
  assert.ok(secondBox.x < 390, `第二张卡应有一部分露在首屏，当前起点 ${secondBox.x}px`);
  const before = (await railMetrics(mobileRail)).scrollLeft;
  await mobileRail.evaluate(element => element.scrollBy({ left: 260, behavior: 'instant' }));
  await mobile.waitForTimeout(100);
  const after = (await railMetrics(mobileRail)).scrollLeft;
  assert.ok(after > before, '手机 rail 必须能响应横向滑动对应的 scroll movement');
  await assertNoHorizontalOverflow(mobile);

  await mobile.goto(`${baseUrl}/collection/wishlist`, { waitUntil: 'domcontentloaded' });
  const mobileWishlistRail = mobile.locator('.collection-wishlist-grid');
  await mobileWishlistRail.waitFor();
  const mobileWishlistCards = await mobileWishlistRail.locator('article').count();
  assert.ok(mobileWishlistCards >= 2, '测试数据应至少产生两张种草收藏卡');
  const [wish1, wish2] = await Promise.all([
    mobileWishlistRail.locator('article').nth(0).boundingBox(),
    mobileWishlistRail.locator('article').nth(1).boundingBox(),
  ]);
  assert.ok(wish1 && wish2 && wish1.width < 390 && wish2.x < 390, '手机收藏卡应露出下一张，形成明确左右滑动 affordance');
  assert.deepEqual(mobileErrors, [], `手机不应出现页面错误：${mobileErrors.join('; ')}`);
  await mobileContext.close();

  console.log('Collection swipe-card browser checks passed: hub + wishlist + care rails, next-card peek, deep-link drawers, achievements gate, and no page overflow.');
} finally {
  await browser.close();
}

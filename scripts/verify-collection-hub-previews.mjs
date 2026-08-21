import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const seedCollection = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001', 'sp_0002', 'sp_0003', 'sp_0004']));
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
      guide_pregnant_care: {
        id: 'guide_pregnant_care',
        title: '怀孕鱼护理',
        favoritedAt: '2026-07-29T10:00:00.000Z',
      },
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
  assert.equal(await desktop.locator('[data-preview-item="achievements"]').count(), 2, '成就模块应预览两个具体项目');
  assert.equal(await desktop.locator('[data-preview-item="wishlist"]').first().getAttribute('data-preview-id'), 'sp_0004', '最新加入的种草物种应排在最前');
  assert.equal(await desktop.locator('[data-preview-item="care"]').first().getAttribute('data-preview-id'), 'guide_pregnant_care', '养护收藏应按 favoritedAt 倒序');
  assert.equal(await desktop.locator('[data-preview-item="memorial"]').first().getAttribute('data-preview-id'), 'memorial-3', '生命纪念应按记录日期倒序');
  await desktop.getByRole('button', { name: '更多 1 种' }).waitFor();
  await desktop.getByRole('button', { name: '更多 1 篇' }).waitFor();
  await desktop.getByRole('button', { name: '更多 1 条' }).waitFor();
  await desktop.getByRole('button', { name: '更多 6 枚' }).waitFor();
  assert.equal(await desktop.getByText('今日种草', { exact: true }).count(), 0, '今日种草不得进入水族册');

  const wishlistBox = await desktop.locator('[data-collection-module="wishlist"]').boundingBox();
  const careBox = await desktop.locator('[data-collection-module="care"]').boundingBox();
  const memorialBox = await desktop.locator('[data-collection-module="memorial"]').boundingBox();
  assert.ok(wishlistBox && careBox && memorialBox, '四格卡片必须可见');
  assert.ok(Math.abs(wishlistBox.y - careBox.y) <= 2, '宽桌面首行应为双列');
  assert.ok(memorialBox.y > wishlistBox.y + wishlistBox.height, '第二行应位于首行下方');
  await assertNoHorizontalOverflow(desktop);
  assert.deepEqual(desktopErrors, [], `桌面不应出现页面错误：${desktopErrors.join('; ')}`);

  for (const [label, path] of [
    ['更多 1 种', '/collection/wishlist'],
    ['更多 1 篇', '/collection/care'],
    ['更多 1 条', '/collection/memorial'],
    ['更多 6 枚', '/collection/achievements'],
  ]) {
    await desktop.getByRole('button', { name: label }).click();
    await desktop.waitForURL(url => url.pathname === path);
    await desktop.goBack();
    await desktop.waitForURL(url => url.pathname === '/collection');
  }

  await desktop.locator('[data-preview-item="wishlist"]').first().click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist' && url.searchParams.get('item') === 'sp_0004');
  await desktop.locator('[data-surface="detail-drawer"]').waitFor();
  await desktop.getByRole('button', { name: '知道了', exact: true }).click();
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist' && !url.searchParams.has('item'));
  await desktop.goBack();
  await desktop.waitForURL(url => url.pathname === '/collection');

  await desktop.locator('[data-preview-item="care"]').first().click();
  await desktop.waitForURL(url => url.pathname === '/collection/care' && url.searchParams.get('item') === 'guide_pregnant_care');
  await desktop.locator('[data-surface="detail-drawer"]').waitFor();
  await desktop.goBack();
  await desktop.waitForURL(url => url.pathname === '/collection');

  await desktop.locator('[data-preview-item="memorial"]').first().click();
  await desktop.waitForURL(url => url.pathname === '/collection/memorial/memorial-3');
  await desktop.locator('[data-memorial-detail="memorial-3"]').waitFor();
  await desktop.getByRole('button', { name: '返回生命纪念' }).waitFor();
  await desktop.goBack();
  await desktop.waitForURL(url => url.pathname === '/collection');

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
  await desktop.getByText('已记录 · 原因待补充', { exact: true }).waitFor();
  await desktop.getByRole('button', { name: '编辑记录' }).click();
  await desktop.getByLabel('可能原因').fill('可能与入缸应激有关');
  await desktop.evaluate(() => window.history.back());
  await desktop.getByRole('heading', { name: '放弃未保存的复盘吗？' }).waitFor();
  assert.equal(new URL(desktop.url()).pathname, '/collection/memorial/memorial-2', '浏览器返回必须先恢复纪念详情');
  await desktop.getByRole('button', { name: '继续编辑' }).click();
  assert.equal(await desktop.getByLabel('可能原因').inputValue(), '可能与入缸应激有关', '浏览器返回后继续编辑必须保留草稿');
  await desktop.getByRole('button', { name: '取消', exact: true }).click();
  await desktop.getByRole('heading', { name: '放弃未保存的复盘吗？' }).waitFor();
  await desktop.getByRole('button', { name: '继续编辑' }).click();
  assert.equal(await desktop.getByLabel('可能原因').inputValue(), '可能与入缸应激有关', '继续编辑必须保留未保存内容');
  await desktop.getByRole('button', { name: '取消', exact: true }).click();
  await desktop.getByRole('button', { name: '放弃修改' }).click();
  await desktop.getByText('还没有记录可能原因。', { exact: true }).waitFor();
  await desktop.getByRole('button', { name: '编辑记录' }).click();
  await desktop.getByLabel('可能原因').fill('可能与入缸应激有关');
  await desktop.getByRole('button', { name: '保存复盘' }).click();
  await desktop.getByText('复盘已保存', { exact: true }).last().waitFor();
  await desktop.getByText('可能与入缸应激有关', { exact: true }).waitFor();
  await desktop.reload({ waitUntil: 'networkidle' });
  await desktop.getByText('可能与入缸应激有关', { exact: true }).waitFor();
  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });

  const achievementId = await desktop.locator('[data-preview-item="achievements"]').first().getAttribute('data-preview-id');
  assert.ok(achievementId, '成就预览应提供稳定 ID');
  await desktop.locator('[data-preview-item="achievements"]').first().click();
  await desktop.waitForURL(url => url.pathname === '/collection/achievements' && url.searchParams.get('item') === achievementId);
  await desktop.locator(`#collection-achievement-${achievementId}`).waitFor();
  assert.equal(
    await desktop.locator(`#collection-achievement-${achievementId}`).evaluate(element => document.activeElement === element),
    true,
    '成就深链应聚焦具体勋章',
  );

  await desktop.goto(`${baseUrl}/collection/wishlist?item=missing-species`, { waitUntil: 'networkidle' });
  await desktop.waitForURL(url => url.pathname === '/collection/wishlist' && !url.searchParams.has('item'));
  await desktop.getByText('该内容已不存在或已移出水族册。', { exact: true }).waitFor();

  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle' });
  await desktop.locator('[data-collection-module="wishlist"] .collection-book-chapter-title').click();
  await desktop.locator('.collection-book-shell.has-open-chapter').waitFor();
  assert.equal(await desktop.locator('[data-collection-module="wishlist"].is-open').count(), 1, '点击章节应在书页内展开对应内容');
  assert.equal(await desktop.locator('[data-collection-module="wishlist"] .collection-book-chapter-title').getAttribute('aria-current'), 'true', '打开章节应暴露当前章节状态');
  assert.equal(new URL(desktop.url()).pathname, '/collection', '展开章节不应产生额外路由或弹窗');
  await desktop.getByRole('button', { name: '返回全部章节' }).click();
  assert.equal(await desktop.locator('.collection-book-shell.has-open-chapter').count(), 0, '返回后应恢复四个章节总览');
  await desktop.close();

  const narrowDesktop = await browser.newPage({ viewport: { width: 600, height: 900 } });
  await seedCollection(narrowDesktop);
  await narrowDesktop.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await narrowDesktop.locator('[data-collection-module="wishlist"]').waitFor();
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
  await mobile.goto(`${baseUrl}/collection`, { waitUntil: 'domcontentloaded' });
  await mobile.locator('[data-collection-module="wishlist"]').waitFor();
  assert.equal(await mobile.locator('[data-collection-module]').count(), 4, '手机也应显示四个完整模块');
  await assertNoHorizontalOverflow(mobile);
  await mobile.locator('[data-collection-module="care"] .collection-book-chapter-title').click();
  await mobile.locator('.collection-book-shell.has-open-chapter').waitFor();
  assert.equal(await mobile.locator('[data-collection-module="care"].is-open').count(), 1, '手机点击章节应原位聚焦对应章节');
  const mobileReturn = mobile.getByRole('button', { name: '返回全部章节' });
  const [mobileReturnBox, mobileViewport] = await Promise.all([
    mobileReturn.boundingBox(),
    mobile.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })),
  ]);
  assert.ok(mobileReturnBox && mobileReturnBox.width >= 44 && mobileReturnBox.height >= 44, '手机返回按钮必须保留至少 44px 点击区域');
  assert.ok(mobileReturnBox && mobileReturnBox.y >= 0 && mobileReturnBox.y + mobileReturnBox.height <= mobileViewport.height, '手机返回按钮不能被底部导航遮挡');
  await mobileReturn.click();
  assert.equal(await mobile.locator('.collection-book-shell.has-open-chapter').count(), 0, '手机返回后应恢复章节总览');
  await mobile.locator('[data-preview-item="memorial"]').first().click();
  await mobile.waitForURL(url => url.pathname === '/collection/memorial/memorial-3');
  await mobile.locator('[data-memorial-detail="memorial-3"]').waitFor();
  await assertNoHorizontalOverflow(mobile);
  await mobile.getByRole('button', { name: '返回生命纪念' }).waitFor();
  assert.deepEqual(mobileErrors, [], `手机不应出现页面错误：${mobileErrors.join('; ')}`);
  await mobileContext.close();

  console.log('Collection hub preview checks passed.');
} finally {
  await browser.close();
}

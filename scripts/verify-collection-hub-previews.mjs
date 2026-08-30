import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4319';
const browser = await chromium.launch({ headless: true });

const seedCollection = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001', 'sp_0002', 'sp_0003', 'sp_0004']));
    localStorage.setItem('aqua_care_favorites', JSON.stringify({
      guide_new_fish_acclimation: { id: 'guide_new_fish_acclimation', title: '新鱼入缸', favoritedAt: '2026-07-28T10:00:00.000Z' },
      guide_water_deteriorate: { id: 'guide_water_deteriorate', title: '水质变差怎么办', favoritedAt: '2026-07-27T10:00:00.000Z' },
    }));
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
  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle', timeout: 30_000 });

  await desktop.getByRole('region', { name: '互动水族册' }).waitFor();
  assert.equal(await desktop.locator('[data-collection-node]').count(), 4, '桌面水族册应显示四个生物导航节点');
  assert.equal(await desktop.locator('[data-collection-focus]').count(), 1, '桌面水族册应显示中央聚焦内容');
  assert.equal(await desktop.locator('[data-collection-focus]').getAttribute('data-collection-focus'), 'wishlist', '默认聚焦种草图鉴');
  assert.equal(await desktop.locator('[data-collection-module]').count(), 0, '不得回退到旧模块卡片布局');
  await desktop.locator('[data-collection-node="care"]').click();
  assert.equal(await desktop.locator('[data-collection-focus]').getAttribute('data-collection-focus'), 'care', '点击生物节点应切换中央收藏内容');
  const careItem = desktop.locator('[data-preview-item="care"]').first();
  assert.equal(await careItem.count(), 1, 'care collection must render a preview item for deep-link coverage');
  await careItem.click();
  await desktop.waitForURL(/\/collection\/care\?item=/);
  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle', timeout: 30_000 });
  await desktop.getByRole('region', { name: '互动水族册' }).waitFor();
  await desktop.locator('[data-collection-node="wishlist"]').click();
  const wishlistItem = desktop.locator('[data-preview-item="wishlist"]').first();
  assert.equal(await wishlistItem.count(), 1, 'wishlist collection must render a preview item for deep-link coverage');
  await wishlistItem.click();
  await desktop.waitForURL(/\/collection\/wishlist\?item=/);
  await desktop.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle', timeout: 30_000 });
  await desktop.getByRole('region', { name: '互动水族册' }).waitFor();
  await assertNoHorizontalOverflow(desktop);
  assert.deepEqual(desktopErrors, [], `桌面不应出现页面错误：${desktopErrors.join('; ')}`);
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await seedCollection(mobile);
  await mobile.goto(`${baseUrl}/collection`, { waitUntil: 'networkidle', timeout: 30_000 });
  await mobile.getByRole('region', { name: '互动水族册' }).waitFor();
  assert.equal(await mobile.locator('[data-collection-compact]').count(), 4, '手机水族册应显示四个紧凑入口');
  assert.equal(await mobile.locator('[data-collection-node]:visible').count(), 0, '手机端不应显示桌面绝对定位节点');
  await mobile.locator('[data-collection-compact="memorial"]').click();
  assert.equal(await mobile.locator('[data-collection-focus]').getAttribute('data-collection-focus'), 'memorial', '手机点击入口应切换中央收藏内容');
  await assertNoHorizontalOverflow(mobile);
  await mobile.close();

  console.log('Collection creature-first browser checks passed: desktop nodes, central focus, mobile compact fallback, and no legacy card grid.');
} finally {
  await browser.close();
}

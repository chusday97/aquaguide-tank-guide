import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4319';
const browser = await chromium.launch({ headless: true });
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1,
  currentAquariumId: 'tank-mobile',
  aquariums: [{
    id: 'tank-mobile', name: 'Community Aquarium With A Long Name',
    fishes: [{ id: 'stock-1', fishId: 'sp_0001', quantity: 6, entryDate: today, lastWaterChangeDate: today }],
    lastWaterChangeDate: today, waterChangeHistory: [today],
    dimensions: { length: '60', width: '40', height: '40' }, waterType: 'Freshwater', targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' }, plants: [], hardscape: [],
  }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const seed = async (page, locale = 'zh-CN') => page.addInitScript(({ saved, localeValue }) => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', localeValue);
}, { saved: state, localeValue: locale });

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });
  const page = await context.newPage();
  await seed(page);
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.getByText('今日推荐', { exact: true }).waitFor();

  const aquariumToolbar = page.locator('.aquarium-toolbar');
  assert.ok(await aquariumToolbar.getByRole('button', { name: '新建鱼缸' }).isVisible());
  assert.ok(await aquariumToolbar.getByRole('button', { name: '更多鱼缸操作' }).isVisible());
  assert.equal(await aquariumToolbar.getByRole('button', { name: /水族册/ }).count(), 0, 'collection must not occupy the aquarium top bar');
  assert.equal(await aquariumToolbar.getByRole('button', { name: /语言设置|数据保存提醒/ }).count(), 0, 'settings and data must move under More');

  await page.getByRole('button', { name: '更多鱼缸操作' }).click();
  for (const label of ['重命名鱼缸', '设置', '数据与备份', '删除鱼缸']) assert.ok(await aquariumToolbar.getByRole('button', { name: label, exact: true }).isVisible());
  await page.getByRole('button', { name: '更多鱼缸操作' }).click();

  const primaryActionTexts = await page.locator('.aquarium-actions .desktop-card-grid').first().locator(':scope > button').allTextContents();
  assert.equal(primaryActionTexts.length, 7);
  for (const keyword of ['鱼缸检查', '换水', '喂食', '记录已有生物', '规划想养的生物', 'AI 建缸助手', '养护记录']) assert.ok(primaryActionTexts.some(text => text.includes(keyword)), `visible actions must include ${keyword}`);
  assert.equal(await page.getByText('更多工具', { exact: true }).count(), 0, 'core actions must not be folded under more tools');
  assert.ok(await page.getByText('今日推荐', { exact: true }).isVisible(), 'daily discovery must remain visible on aquarium home');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  const atlas = await context.newPage();
  await seed(atlas);
  await atlas.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'domcontentloaded' });
  await atlas.locator('.atlas-mobile-toolbar').waitFor();
  const mobileToolbar = atlas.locator('.atlas-mobile-toolbar');
  assert.equal(await mobileToolbar.getByRole('button', { name: '浏览图鉴' }).count(), 1);
  assert.equal(await mobileToolbar.getByRole('button', { name: '混养计算' }).count(), 1);
  assert.equal(await mobileToolbar.getByRole('button', { name: '拍照识别' }).count(), 1);
  assert.ok(await atlas.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  for (const width of [600, 1024, 1440]) {
    const desktop = await browser.newPage({ viewport: { width, height: 900 }, locale: 'en-US' });
    await seed(desktop, 'en');
    await desktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
    await desktop.getByText('Daily Discovery', { exact: true }).waitFor();
    assert.ok(await desktop.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px must not overflow`);
    assert.ok(await desktop.getByText('Daily Discovery', { exact: true }).isVisible());
    assert.equal(await desktop.getByText('More tools', { exact: true }).count(), 0);
    await desktop.close();
  }

  console.log('mobile aquarium priorities: compact header, seven visible actions, homepage discovery and atlas modes separated');
} finally {
  await browser.close();
}

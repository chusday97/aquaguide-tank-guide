import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });
mkdirSync('artifacts', { recursive: true });

const state = {
  version: 1,
  currentAquariumId: 'tank-1',
  aquariums: [{
    id: 'tank-1',
    name: '测试鱼缸',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: '2026-07-20T00:00:00.000Z',
      batches: [{ id: 'batch-1', quantity: 4, entryDate: '2026-07-20T00:00:00.000Z', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: '2026-07-20T00:00:00.000Z' }],
    }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, taskCardDismissed: false },
  updatedAt: '2026-08-12T00:00:00.000Z',
};

const seed = async page => {
  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);
};

try {
  const desktop = await browser.newPage({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  await seed(desktop);
  await desktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await desktop.getByText('缸内物种', { exact: true }).last().click();
  const desktopDrawer = desktop.locator('[role="dialog"][data-surface="detail-rail"]:visible');
  await desktopDrawer.waitFor();
  await desktopDrawer.getByRole('button', { name: '调整体态' }).click();
  await desktopDrawer.getByText('调整缸内物种体态', { exact: true }).waitFor();
  await desktopDrawer.getByText('这次要调整哪一组？', { exact: true }).waitFor();
  const [drawerBox, editorBox] = await Promise.all([
    desktopDrawer.boundingBox(),
    desktopDrawer.locator('article').filter({ hasText: '这次要调整哪一组？' }).first().boundingBox(),
  ]);
  assert.ok(drawerBox && editorBox, 'desktop livestock editor must have measurable bounds');
  assert.ok(Math.abs(drawerBox.width - 560) <= 3, `1200px desktop livestock drawer should use the 560px editing width; got ${drawerBox.width}px`);
  assert.ok(drawerBox.width < 1200 * 0.5, 'editing drawer must not consume half of the entire viewport when a sidebar already exists');
  assert.ok(editorBox.width >= drawerBox.width * 0.9, `editing card must use the drawer width; got ${editorBox.width}px inside ${drawerBox.width}px`);
  assert.ok(await desktop.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'desktop drawer must not create horizontal page overflow');
  await desktop.screenshot({ path: 'artifacts/livestock-state-drawer-desktop.png', fullPage: false });
  await desktop.close();

  const phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });
  const phone = await phoneContext.newPage();
  await seed(phone);
  await phone.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await phone.getByText('缸内物种', { exact: true }).last().click();
  const mobileSheet = phone.locator('[role="dialog"][data-surface="bottom-sheet"]:visible');
  await mobileSheet.waitFor();
  await mobileSheet.getByRole('button', { name: '调整体态' }).click();
  await mobileSheet.getByText('调整缸内物种体态', { exact: true }).waitFor();
  const mobileBox = await mobileSheet.boundingBox();
  assert.ok(mobileBox && mobileBox.width <= 390 && mobileBox.width >= 380, 'mobile livestock task must keep the full-width bottom sheet');
  assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '390px mobile livestock task must not overflow');
  await phone.screenshot({ path: 'artifacts/livestock-state-sheet-mobile.png', fullPage: false });
  await phoneContext.close();

  console.log('Livestock state drawer browser geometry verified: 560px desktop editing drawer, full-width editor, mobile bottom sheet preserved.');
} finally {
  await browser.close();
}

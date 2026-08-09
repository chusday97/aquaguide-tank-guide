import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_PREVIEW_URL || 'http://127.0.0.1:3000';
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1,
  currentAquariumId: 'action-runtime-tank',
  aquariums: [{
    id: 'action-runtime-tank',
    name: '动作验收缸',
    fishes: [{ id: 'stock-action-1', fishId: 'sp_0001', quantity: 3, entryDate: today }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    waterChangeHistory: [today],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [], careFavorites: {}, dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [],
  deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const routes = [
  '/aquarium', '/encyclopedia', '/care', '/collection', '/collection/wishlist', '/collection/care',
  '/collection/memorial', '/collection/achievements', '/identify', '/search?q=孔', '/settings', '/welcome',
  '/login', '/report/invalid-token',
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(saved => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
}, state);

try {
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(350);
    const unnamed = await page.locator('button:visible').evaluateAll(buttons => buttons
      .filter(button => !button.disabled)
      .filter(button => !(button.getAttribute('aria-label') || button.getAttribute('title') || button.textContent?.trim()))
      .length);
    assert.equal(unnamed, 0, `${route} 存在没有可理解名称的可点击按钮`);
    assert.equal(errors.length, 0, `${route} 页面错误：${errors.join('; ')}`);
    await page.close();
  }

  const page = await context.newPage();
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  await page.locator('#aquarium-discovery').getByRole('button', { name: '查看物种详情', exact: true }).click();
  await page.waitForURL(/\/encyclopedia\?species=/);
  assert.equal(new URL(page.url()).pathname, '/encyclopedia', 'route 动作没有进入目标页面');

  await page.getByRole('dialog').getByRole('button', { name: '知道了', exact: true }).click();
  await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'domcontentloaded' });

  const filterButton = page.getByRole('button', { name: /筛选/ }).first();
  await filterButton.click();
  assert.equal(await filterButton.getAttribute('aria-expanded'), 'true', 'view 动作没有改变展开状态');

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  const discovery = page.locator('#aquarium-discovery');
  const favoriteButton = discovery.getByRole('button', { name: '收藏物种', exact: true });
  await favoriteButton.click();
  await discovery.getByRole('button', { name: '取消收藏物种', exact: true }).waitFor();
  assert.equal((await discovery.locator('h3').innerText()).trim().length > 0, true, 'mutation 动作后推荐对象消失');

  await page.getByRole('button', { name: '添加生物', exact: true }).first().click();
  const dialog = page.getByRole('dialog').filter({ hasText: '添加生物' });
  await dialog.waitFor();
  await dialog.getByRole('button', { name: '关闭', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });

  await page.goto(`${baseUrl}/aquarium?action=timeline&tank=action-runtime-tank`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: '操作时间线', exact: true }).waitFor();
  assert.ok(page.url().includes('action=timeline'), 'section 深链没有定位到目标任务');

  await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'domcontentloaded' });
  const sourceLink = page.getByRole('dialog').locator('[data-care-action-evidence] a[href^="https://"]').first();
  const href = await sourceLink.getAttribute('href');
  assert.ok(href && href.startsWith('https://'), 'external 动作没有有效 HTTPS 地址');
  assert.equal(await sourceLink.getAttribute('target'), '_blank', 'external 动作必须明确在新页面打开来源');

  console.log(`runtime action audit passed: ${routes.length} routes plus route/view/mutation/dialog/section/external observable outcomes`);
} finally {
  await context.close();
  await browser.close();
}

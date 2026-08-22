import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const aquariumState = {
  version: 1,
  currentAquariumId: 'tank-modal-rc1',
  aquariums: [{
    id: 'tank-modal-rc1',
    name: '弹窗回归测试缸',
    fishes: [{
      id: 'aqf-modal-1',
      fishId: 'sp_0001',
      quantity: 2,
      entryDate: now,
      createdAt: now,
      updatedAt: now,
    }],
    lastWaterChangeDate: today,
    waterChangeHistory: [today],
    dimensions: { length: '60', width: '30', height: '30' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  onboarding: {
    version: 1,
    status: 'completed',
    goal: 'build_tank',
    viewedSpecies: true,
    aquariumConfigured: true,
    taskCardDismissed: true,
  },
  updatedAt: now,
};

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, aquariumState);

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  // Read-only Data & Backup reuses Settings instead of opening a second modal.
  const moreButton = page.getByRole('button', { name: '更多鱼缸操作', exact: true });
  await moreButton.waitFor();
  await moreButton.click();
  await page.getByRole('button', { name: '数据与备份', exact: true }).click();

  const storagePanel = page.locator('[data-settings-storage-panel]');
  await storagePanel.waitFor();

  let visibleDialogs = page.locator('[role="dialog"]:visible');
  assert.equal(await visibleDialogs.count(), 1, 'Data & Backup must reuse exactly one Settings surface, not open a nested/standalone dialog.');
  await page.getByRole('heading', { name: '鱼缸设置', exact: true }).waitFor();
  await page.getByText('数据与备份', { exact: true }).last().waitFor();

  assert.equal(await page.getByRole('button', { name: '保存设置', exact: true }).count(), 0, 'Read-only Data panel must not expose a fake Save Settings CTA.');
  const explicitClose = visibleDialogs.locator('button').filter({ hasText: /^关闭$/ }).first();
  await explicitClose.waitFor();
  assert.equal((await explicitClose.textContent())?.trim(), '关闭', 'Read-only Data panel must expose an explicit Close action instead of Save Settings.');
  await explicitClose.click();
  await storagePanel.waitFor({ state: 'hidden' });

  // Aquarium roster must open the real shared species detail; viewing must not mutate compatibility selection.
  const archiveButton = page.locator('#aquarium-records > button');
  await archiveButton.waitFor();
  await archiveButton.click();
  const rosterSurface = page.locator('.livestock-roster-surface');
  await rosterSurface.getByText('缸内物种', { exact: true }).first().waitFor();
  const residentProfileButton = rosterSurface.locator('button').filter({ has: page.locator('img[alt="极火虾"]') }).first();
  await residentProfileButton.waitFor();
  await residentProfileButton.click();

  const speciesDetail = page.locator('[data-detail-kind="species"]:visible');
  await speciesDetail.waitFor();
  await speciesDetail.getByText('极火虾', { exact: true }).first().waitFor();
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(sessionStorage.getItem('aquaguide_compatibility_selection') || '[]')),
    [],
    'Opening an owned species detail from the Aquarium roster must not implicitly add it to compatibility selection.',
  );
  await rosterSurface.waitFor({ state: 'hidden', timeout: 2_000 });
  visibleDialogs = page.locator('[role="dialog"]:visible');
  assert.equal(await visibleDialogs.count(), 1, 'After the Roster exit transition completes, species detail must be the only visible dialog.');

  await page.keyboard.press('Escape');
  await speciesDetail.waitFor({ state: 'hidden' });
  assert.equal(new URL(page.url()).pathname, '/aquarium', 'Closing Aquarium species detail must preserve the Aquarium route.');
  await page.locator('#aquarium-records').waitFor();

  assert.deepEqual(pageErrors, [], `RC1 modal/detail paths must not emit page errors: ${pageErrors.join('; ')}`);
  console.log('UI modal/detail browser contract PASS: Data reuses Settings; Aquarium roster exits before shared species detail remains; browsing does not mutate compatibility selection.');
} finally {
  await browser.close();
}

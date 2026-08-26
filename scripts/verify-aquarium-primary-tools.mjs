import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
const today = new Date().toISOString().slice(0, 10);

const state = {
  version: 1,
  currentAquariumId: 'tank-primary-tools',
  aquariums: [{
    id: 'tank-primary-tools',
    name: 'Primary tools regression tank',
    fishes: [{ id: 'stock-1', fishId: 'sp_0439', quantity: 5, entryDate: today }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '水草泥',
    plants: ['sp_0076'],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
  }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [],
  feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const seed = page => page.addInitScript(saved => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
}, state);

const overlapArea = (a, b) => (
  Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
);

async function verifyPrimaryTools(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
  await seed(page);
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  const tank = page.locator('#aquarium-tank');
  const tools = page.locator('[data-tank-primary-tools]');
  const add = page.locator('[data-tank-primary-action="add"]');
  const settings = page.locator('[data-tank-primary-action="settings"]');
  const speciesEntry = page.locator('[data-tank-species-entry]');
  await tools.waitFor({ state: 'visible' });
  assert.equal(await add.isVisible(), true, `${width}px add icon must stay visible`);
  assert.equal(await settings.isVisible(), true, `${width}px settings icon must stay visible`);
  const [toolsBox, tankBox, speciesBox, addBox, settingsBox] = await Promise.all([
    tools.boundingBox(), tank.boundingBox(), speciesEntry.boundingBox(), add.boundingBox(), settings.boundingBox(),
  ]);
  assert.ok(toolsBox && tankBox && speciesBox && addBox && settingsBox, `${width}px primary tool geometry must exist`);
  assert.ok(addBox.width >= 44 && addBox.height >= 44 && settingsBox.width >= 44 && settingsBox.height >= 44, `${width}px primary tools must keep 44px touch targets`);
  assert.ok(toolsBox.x >= tankBox.x - 2 && toolsBox.y >= tankBox.y - 2 && toolsBox.x + toolsBox.width <= tankBox.x + tankBox.width + 2 && toolsBox.y + toolsBox.height <= tankBox.y + tankBox.height + 2, `${width}px primary tools must remain inside the tank stage`);
  assert.equal(overlapArea(toolsBox, speciesBox), 0, `${width}px primary tools must not cover the livestock entry`);
  await page.close();
}

async function verifySettingsSearch() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  await seed(page);
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-tank-primary-action="settings"]').click();
  await page.getByRole('dialog', { name: '鱼缸设置' }).waitFor({ state: 'visible' });

  await page.locator('[data-settings-panel="substrate"]').click();
  const substrateSearch = page.getByRole('searchbox', { name: '搜索底砂或造景' });
  await substrateSearch.fill('溪流砂');
  const substrateSection = substrateSearch.locator('xpath=ancestor::section[1]');
  assert.ok(await substrateSection.getByText('溪流砂', { exact: true }).count(), 'substrate search must find matching substrate');
  assert.equal(await substrateSection.getByText('水草泥', { exact: true }).count(), 0, 'substrate search must filter unrelated options');

  await page.locator('[data-settings-panel="plants"]').click();
  const plantSearch = page.getByRole('searchbox', { name: '搜索水草物种' });
  await plantSearch.fill('小水榕');
  const plantSection = plantSearch.locator('xpath=ancestor::section[1]');
  assert.ok(await plantSection.getByText('小水榕', { exact: true }).count(), 'plant search must find matching species');
  assert.equal(await plantSection.getByText('牛毛毡', { exact: true }).count(), 0, 'plant search must filter unrelated species');
  await plantSearch.fill('金鱼藻');
  assert.ok(await plantSection.getByText('金鱼藻', { exact: true }).count(), 'plant search must include newly registered aquatic-plant species');
  assert.equal(await plantSection.getByText('小水榕', { exact: true }).count(), 0, 'plant search must update results when the query changes');

  await page.keyboard.press('Escape');
  await page.locator('[data-tank-primary-action="add"]').click();
  await page.getByRole('dialog', { name: '记录已有生物' }).waitFor({ state: 'visible' });
  await page.close();
}

try {
  for (const width of [1440, 1024, 390]) await verifyPrimaryTools(width);
  await verifySettingsSearch();
  console.log('Aquarium primary tools + inline settings search: PASS');
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const now = '2026-08-20T00:00:00.000Z';

const plantState = {
  version: 1,
  currentAquariumId: 'plant-edit-tank',
  aquariums: [{
    id: 'plant-edit-tank',
    name: '水草编辑测试缸',
    fishes: [{
      id: 'plant-stock-1',
      fishId: 'sp_0073',
      quantity: 1,
      entryDate: '2026-08-01T00:00:00.000Z',
      batches: [{
        id: 'plant-batch-1',
        quantity: 1,
        entryDate: '2026-08-01T00:00:00.000Z',
        lifeStage: 'unknown',
        reproductiveState: 'not_applicable',
        stateUpdatedAt: '2026-08-01T00:00:00.000Z',
      }],
    }],
    dimensions: { length: '60', width: '30', height: '36' },
    waterType: 'Freshwater',
    targetTemperature: '24',
    substrate: '水草泥',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
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
    viewedSpecies: true,
    aquariumConfigured: true,
    taskCardDismissed: true,
  },
  updatedAt: now,
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await context.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, plantState);

  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  page.setDefaultNavigationTimeout(45_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  const archiveSource = page.locator('#aquarium-records');
  await archiveSource.waitFor();
  await archiveSource.locator(':scope > button').click();

  const roster = page
    .locator('[role="dialog"][data-surface="right-drawer"]:not([data-detail-kind])')
    .filter({ hasText: '缸内物种' })
    .first();
  await roster.waitFor({ state: 'visible' });

  const plantRow = roster.locator('[data-livestock-record-id="plant-stock-1"]');
  await plantRow.waitFor();
  await plantRow.getByText('挖耳草', { exact: true }).waitFor();
  await plantRow.getByText('共 1株', { exact: true }).waitFor();
  assert.equal(await plantRow.getByText(/共 1(?:只|条|只\/条|条\/只)/).count(), 0, 'aquatic plant must not use animal quantity units in the roster');
  await roster.getByText(/1株/).first().waitFor();

  const plantProfileButton = plantRow.locator('button:has(img)').first();
  assert.equal(await plantProfileButton.count(), 1, 'plant roster row must expose a profile opener');
  await plantProfileButton.click();

  const detail = page.locator('[role="dialog"][data-detail-kind="species"]:visible');
  await detail.waitFor();
  await detail.getByText('挖耳草', { exact: true }).first().waitFor();
  const editFromDetail = detail.locator('[data-species-detail-edit-tank-record]');
  await editFromDetail.waitFor();
  assert.match((await editFromDetail.textContent()) || '', /修改水草记录/, 'owned aquatic plant detail must expose a plant-record edit action');
  await editFromDetail.click();

  await detail.waitFor({ state: 'hidden' });
  await roster.waitFor({ state: 'visible' });
  const editor = roster.locator('[data-plant-record-editor]');
  await editor.waitFor({ state: 'visible' });
  await editor.getByText('修改水草记录', { exact: true }).waitFor();
  await editor.getByText('1株', { exact: true }).waitFor();
  assert.equal(await editor.getByText(/体态|繁殖状态|怀孕|抱卵/).count(), 0, 'plant editor must not expose fish life-stage or reproductive controls');

  await editor.getByRole('button', { name: '植株数量 + 1', exact: true }).click();
  await editor.getByText('2株', { exact: true }).waitFor();
  await editor.getByRole('button', { name: '保存水草记录', exact: true }).click();

  await editor.waitFor({ state: 'hidden' });
  const updatedRow = roster.locator('[data-livestock-record-id="plant-stock-1"]');
  await updatedRow.getByText('共 2株', { exact: true }).waitFor();
  assert.equal(await updatedRow.getByText(/共 2(?:只|条|只\/条|条\/只)/).count(), 0, 'saved plant quantity must remain plant-specific');

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const persistedPlant = persisted.aquariums?.[0]?.fishes?.find(record => record.id === 'plant-stock-1');
  assert.equal(persistedPlant?.quantity, 2, 'plant record quantity must persist as 2');
  assert.equal(persistedPlant?.batches?.[0]?.quantity, 2, 'plant batch quantity must persist as 2');
  assert.equal(persistedPlant?.batches?.[0]?.reproductiveState, 'not_applicable', 'plant record must remain outside animal reproductive semantics');

  fs.mkdirSync('artifacts/plant-livestock-edit', { recursive: true });
  await page.screenshot({ path: 'artifacts/plant-livestock-edit/plant-roster-2-plants.png', fullPage: true });
  assert.deepEqual(pageErrors, [], `plant livestock edit flow emitted page errors: ${pageErrors.join(' | ')}`);

  console.log('Plant livestock edit PASS: 1株 roster → plant detail edit entry → plant-specific editor → 2株 saved and persisted.');
  await context.close();
} finally {
  await browser.close();
}

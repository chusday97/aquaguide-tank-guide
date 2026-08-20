import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const now = '2026-08-20T00:00:00.000Z';

const baseTank = {
  dimensions: { length: '60', width: '30', height: '36' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
};

const shellState = (currentAquariumId, aquarium) => ({
  version: 1,
  currentAquariumId,
  aquariums: [aquarium],
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
});

const structuredPlantState = shellState('plant-edit-tank', {
  ...baseTank,
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
  plants: [],
});

const legacyPlantsOnlyState = shellState('legacy-plant-tank', {
  ...baseTank,
  id: 'legacy-plant-tank',
  name: '旧水草数据测试缸',
  startedAt: '2026-07-10',
  startedAtSource: 'user',
  fishes: [],
  plants: ['sp_0073'],
});

const seedState = async (context, saved) => {
  await context.addInitScript(state => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
    localStorage.setItem('aquariums', JSON.stringify(state.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, saved);
};

const openRoster = async page => {
  const archiveSource = page.locator('#aquarium-records');
  await archiveSource.waitFor();
  await archiveSource.locator(':scope > button').click();
  const roster = page
    .locator('[role="dialog"][data-surface="right-drawer"]:not([data-detail-kind]):visible')
    .filter({ hasText: '缸内物种' })
    .first();
  await roster.waitFor({ state: 'visible' });
  return roster;
};

const waitForVisibleRecordText = async (page, recordId, expectedText) => {
  await page.waitForFunction(({ recordId: targetId, expectedText: targetText }) => {
    const rows = Array.from(document.querySelectorAll(`[data-livestock-record-id="${targetId}"]`));
    return rows.some(row => {
      if (!(row instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(row);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && row.getClientRects().length > 0;
      const text = (row.textContent || '').replace(/\s+/g, ' ');
      return visible && text.includes(targetText);
    });
  }, { recordId, expectedText });
};

try {
  fs.mkdirSync('artifacts/plant-livestock-edit', { recursive: true });

  // Structured record path: quantity unit + detail edit entry + durable save.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await seedState(context, structuredPlantState);
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  page.setDefaultNavigationTimeout(45_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  const storedBeforeOpen = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  assert.equal(storedBeforeOpen.currentAquariumId, 'plant-edit-tank', 'browser fixture must keep the plant tank active');
  assert.equal(storedBeforeOpen.aquariums?.[0]?.fishes?.[0]?.fishId, 'sp_0073', 'browser fixture must contain the aquatic plant before roster open');

  const roster = await openRoster(page);
  await page.screenshot({ path: 'artifacts/plant-livestock-edit/01-roster-open.png', fullPage: true });

  const visibleRecordIds = await roster.locator('[data-livestock-record-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-livestock-record-id')));
  const rosterText = ((await roster.textContent()) || '').replace(/\s+/g, ' ').trim();
  console.log('Plant roster diagnostic:', JSON.stringify({ visibleRecordIds, rosterText: rosterText.slice(0, 1600) }));
  assert.ok(visibleRecordIds.includes('plant-stock-1'), `plant record must be present in the livestock roster; visible=${visibleRecordIds.join(',')}; text=${rosterText.slice(0, 500)}`);

  const plantRow = roster.locator('[data-livestock-record-id="plant-stock-1"]');
  await plantRow.getByText('挖耳草', { exact: true }).waitFor();
  await plantRow.getByText('共 1株', { exact: true }).waitFor();
  assert.equal(await plantRow.getByText(/共 1(?:只|条|只\/条|条\/只)/).count(), 0, 'aquatic plant must not use animal quantity units in the roster');

  const plantProfileButton = plantRow.locator('button:has(img)').first();
  assert.equal(await plantProfileButton.count(), 1, 'plant roster row must expose a profile opener');
  await plantProfileButton.click();

  const detail = page.locator('[role="dialog"][data-detail-kind="species"]:visible');
  await detail.waitFor();
  await detail.getByText('挖耳草', { exact: true }).first().waitFor();
  const editFromDetail = detail.locator('[data-species-detail-edit-tank-record]');
  await editFromDetail.waitFor();
  assert.match((await editFromDetail.textContent()) || '', /修改水草记录/, 'owned aquatic plant detail must expose a plant-record edit action');
  await page.screenshot({ path: 'artifacts/plant-livestock-edit/02-plant-detail-edit-entry.png', fullPage: true });
  await editFromDetail.click();

  await detail.waitFor({ state: 'hidden' });
  await roster.waitFor({ state: 'visible' });
  const editor = roster.locator('[data-plant-record-editor]');
  await editor.waitFor({ state: 'visible' });
  await editor.getByText('修改水草记录', { exact: true }).waitFor();
  await editor.getByText('1株', { exact: true }).waitFor();
  assert.equal(await editor.locator('[role="radiogroup"]').count(), 0, 'plant editor must not render animal life-stage choice groups');
  assert.equal(await editor.getByRole('button', { name: /幼年|成年|怀孕|抱卵|生产|繁殖中|产后/ }).count(), 0, 'plant editor must not expose animal life-stage or reproductive choice buttons');
  await page.screenshot({ path: 'artifacts/plant-livestock-edit/03-plant-editor-1.png', fullPage: true });

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
  await page.screenshot({ path: 'artifacts/plant-livestock-edit/04-plant-roster-2-plants.png', fullPage: true });
  assert.deepEqual(pageErrors, [], `plant livestock edit flow emitted page errors: ${pageErrors.join(' | ')}`);
  await context.close();

  // Legacy path: plants[]-only data must be migrated into an editable structured record, then remain durable after reload.
  const legacyContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await seedState(legacyContext, legacyPlantsOnlyState);
  const legacyPage = await legacyContext.newPage();
  legacyPage.setDefaultTimeout(45_000);
  const legacyErrors = [];
  legacyPage.on('pageerror', error => legacyErrors.push(String(error)));
  await legacyPage.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const legacyRoster = await openRoster(legacyPage);
  const migratedId = 'plant-record:legacy-plant-tank:sp_0073';
  const migratedRow = legacyRoster.locator(`[data-livestock-record-id="${migratedId}"]`);
  await migratedRow.waitFor();
  await migratedRow.getByText('挖耳草', { exact: true }).waitFor();
  await migratedRow.getByText('共 1株', { exact: true }).waitFor();
  assert.equal(await migratedRow.getByText(/共 1(?:只|条|只\/条|条\/只)/).count(), 0, 'legacy plant mirror must migrate with a plant unit, never an animal unit');
  await legacyPage.screenshot({ path: 'artifacts/plant-livestock-edit/05-legacy-migrated-1-plant.png', fullPage: true });

  await migratedRow.getByRole('button', { name: '修改水草记录', exact: true }).click();
  const migratedEditor = legacyRoster.locator('[data-plant-record-editor]');
  await migratedEditor.waitFor({ state: 'visible' });
  await migratedEditor.getByRole('button', { name: '植株数量 + 1', exact: true }).click();
  await migratedEditor.getByText('2株', { exact: true }).waitFor();
  await migratedEditor.getByRole('button', { name: '保存水草记录', exact: true }).click();
  await migratedEditor.waitFor({ state: 'hidden' });

  const postSaveDiagnostic = await legacyPage.evaluate(recordId => {
    const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
    const aquarium = state.aquariums?.find(item => item.id === 'legacy-plant-tank');
    const record = aquarium?.fishes?.find(item => item.id === recordId);
    return {
      currentAquariumId: state.currentAquariumId,
      recordQuantity: record?.quantity,
      batchQuantity: record?.batches?.[0]?.quantity,
      plantMirror: aquarium?.plants,
      allRecordIds: aquarium?.fishes?.map(item => item.id),
    };
  }, migratedId);
  const postSaveRosterText = ((await legacyRoster.textContent()) || '').replace(/\s+/g, ' ').trim();
  console.log('Legacy plant post-save diagnostic:', JSON.stringify({ ...postSaveDiagnostic, rosterText: postSaveRosterText.slice(0, 1600) }));

  await waitForVisibleRecordText(legacyPage, migratedId, '共 2株');

  const migratedPersisted = await legacyPage.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const migratedPlant = migratedPersisted.aquariums?.[0]?.fishes?.find(record => record.id === 'plant-record:legacy-plant-tank:sp_0073');
  assert.equal(migratedPlant?.fishId, 'sp_0073', 'legacy plants[] entry must become a structured plant record');
  assert.equal(migratedPlant?.quantity, 2, 'migrated plant quantity must persist after editing');
  assert.equal(migratedPlant?.batches?.[0]?.quantity, 2, 'migrated plant batch must persist after editing');
  assert.ok(migratedPersisted.aquariums?.[0]?.plants?.includes('sp_0073'), 'plant environment mirror must remain synchronized after editing');

  await legacyPage.reload({ waitUntil: 'domcontentloaded' });
  const reloadedRoster = await openRoster(legacyPage);
  await reloadedRoster.locator(`[data-livestock-record-id="${migratedId}"]`).waitFor({ state: 'visible' });
  await waitForVisibleRecordText(legacyPage, migratedId, '共 2株');
  await legacyPage.screenshot({ path: 'artifacts/plant-livestock-edit/06-legacy-reload-2-plants.png', fullPage: true });
  assert.deepEqual(legacyErrors, [], `legacy plant migration emitted page errors: ${legacyErrors.join(' | ')}`);
  await legacyContext.close();

  console.log('Plant livestock edit PASS: structured 1株 → detail edit → 2株 persisted; legacy plants[]-only data → structured 1株 → 2株 persisted across reload.');
} finally {
  await browser.close();
}

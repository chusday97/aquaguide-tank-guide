import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const rawName = '银河异形测试种';
const plannedRawName = '规划模式测试未收录鱼';

const state = {
  version: 1,
  currentAquariumId: 'tank-unresolved-ui',
  aquariums: [{
    id: 'tank-unresolved-ui',
    name: '未确认生物测试缸',
    fishes: [{
      id: 'stock-known',
      fishId: 'sp_0001',
      quantity: 2,
      entryDate: '2026-08-01T00:00:00.000Z',
      batches: [{
        id: 'batch-known',
        quantity: 2,
        entryDate: '2026-08-01T00:00:00.000Z',
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: '2026-08-01T00:00:00.000Z',
      }],
    }],
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
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, taskCardDismissed: false },
  updatedAt: '2026-08-16T00:00:00.000Z',
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });

try {
  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: /记录已有生物/ }).first().click();
  const recordDialog = page.getByRole('dialog').filter({ hasText: '记录已有生物' }).last();
  await recordDialog.waitFor({ state: 'visible' });
  const recordSearch = recordDialog.getByPlaceholder('搜索鱼、虾、螺或学名');
  await recordSearch.fill(rawName);
  await recordDialog.getByText('待确认身份', { exact: true }).waitFor();
  await recordDialog.getByText(rawName, { exact: true }).waitFor();
  await recordDialog.getByText(/身份确认前不会用于完整混养判断/).waitFor();
  const quantity = recordDialog.getByLabel('未确认生物数量');
  await quantity.fill('2');
  await recordDialog.getByRole('button', { name: '按此名称记录', exact: true }).click();
  await recordDialog.getByText('已记录', { exact: true }).waitFor({ timeout: 10_000 });

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const savedRecord = stored.aquariums?.[0]?.fishes?.find(item => item.identityStatus === 'unresolved');
  assert.ok(savedRecord, 'manual existing-livestock flow must persist an unresolved record');
  assert.equal(savedRecord.rawName, rawName, 'unresolved record must preserve the original user-entered name');
  assert.equal(savedRecord.quantity, 2, 'manual unresolved record must preserve quantity');
  assert.match(savedRecord.fishId, /^unresolved:/, 'local mirror key must stay explicitly non-canonical');

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /缸内物种/ }).first().click();
  const roster = page.getByRole('dialog').filter({ hasText: '缸内物种' }).last();
  await roster.waitFor({ state: 'visible' });
  const unresolvedCard = roster.locator('[data-livestock-identity="unresolved"]');
  await unresolvedCard.getByText(rawName, { exact: true }).waitFor();
  await unresolvedCard.getByText('待确认身份', { exact: true }).waitFor();
  await unresolvedCard.getByText(/身份确认前，完整混养判断会保持信息不足/).waitFor();
  assert.equal(await unresolvedCard.getByRole('button', { name: /查看|详情|调整体态/ }).count(), 0,
    'unresolved record must not expose canonical species detail/edit actions');
  await roster.getByRole('button', { name: `将${rawName}移出鱼缸` }).waitFor();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /规划想养的生物/ }).first().click();
  const plannedDialog = page.getByRole('dialog').filter({ hasText: '规划想养的生物' }).last();
  await plannedDialog.waitFor({ state: 'visible' });
  await plannedDialog.getByPlaceholder('搜索鱼、虾、螺或学名').fill(plannedRawName);
  await plannedDialog.getByText(/规划模式只接受已收录生物/).waitFor();
  assert.equal(await plannedDialog.getByRole('button', { name: '按此名称记录', exact: true }).count(), 0,
    'planned addition must never expose unresolved direct recording');

  console.log('unresolved livestock browser path passed: record-existing preserves raw reality, roster keeps it visible, and planned-addition stays catalog-grounded');
} finally {
  await browser.close();
}

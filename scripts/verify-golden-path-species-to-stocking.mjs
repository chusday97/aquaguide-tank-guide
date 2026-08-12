import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const state = {
  version: 1,
  currentAquariumId: 'tank-gp2',
  aquariums: [{
    id: 'tank-gp2',
    name: 'Golden Path 测试缸',
    fishes: [{
      id: 'stock-existing',
      fishId: 'sp_0001',
      quantity: 2,
      entryDate: '2026-08-01T00:00:00.000Z',
      batches: [{ id: 'batch-existing', quantity: 2, entryDate: '2026-08-01T00:00:00.000Z', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: '2026-08-01T00:00:00.000Z' }],
    }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '24',
    substrate: '水草泥',
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

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  // GP-002 milestone 1: search an exact species from the real search page.
  await page.goto(`${baseUrl}/search?q=${encodeURIComponent('水晶虾')}`, { waitUntil: 'domcontentloaded' });
  const resultCard = page.locator('#search-species-sp_0002');
  await resultCard.waitFor();
  assert.ok(await resultCard.isVisible(), 'exact 水晶虾 search result must be visible');

  // Milestone 2: open the exact object, not the atlas home.
  await resultCard.click();
  await page.waitForURL(url => url.pathname === '/encyclopedia' && url.searchParams.get('species') === 'sp_0002');
  const detail = page.locator('[role="dialog"][data-surface="right-drawer"]:visible');
  await detail.waitFor();
  await detail.getByText('水晶虾', { exact: true }).first().waitFor();

  // Milestone 3: use the species detail PRIMARY task CTA. For a caution/conflict-like fit,
  // the footer action is intentionally the canonical path into full compatibility checkout.
  const mainTaskAction = detail.locator('.modalFooter button').first();
  await mainTaskAction.waitFor();
  const mainTaskLabel = (await mainTaskAction.textContent())?.trim() || '';
  assert.match(mainTaskLabel, /风险|混养|加入/, `detail primary CTA must lead toward compatibility, got: ${mainTaskLabel}`);
  await mainTaskAction.click();

  // Milestones 4–5: atlas remains context; decision drawer shows tank baseline + candidate + a real result.
  const calculator = page.locator('[data-surface="compatibility-checkout-drawer"]:visible');
  await calculator.waitFor();
  await calculator.getByText('当前鱼缸', { exact: true }).waitFor();
  await calculator.getByText('水晶虾', { exact: true }).first().waitFor();
  await calculator.getByText('混养结果', { exact: true }).waitFor();
  const resultText = (await calculator.textContent()) || '';
  assert.match(resultText, /当前可混养|有条件可尝试/, 'test fixture must resolve to a recordable compatibility state');
  assert.equal(/不建议混养|需要补充鱼缸信息/.test(resultText), false, 'recording fixture must not bypass block or missing-data states');

  // Milestone 6: record actual stocking. Caution requires one explicit risk confirmation before the real write.
  let recordButton = calculator.getByRole('button', { name: /已经实际入缸，记录下来|确认风险后再记录/ });
  await recordButton.waitFor();
  const firstLabel = await recordButton.textContent();
  await recordButton.click();
  if (firstLabel?.includes('确认风险后再记录')) {
    recordButton = calculator.getByRole('button', { name: '已经实际入缸，记录下来' });
    await recordButton.waitFor();
    await recordButton.click();
  }
  await calculator.getByText(/已记录到鱼缸|已记录/).last().waitFor();

  // Milestone 7: verify the real persisted side effect instead of trusting a toast.
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const tank = stored.aquariums?.find(item => item.id === 'tank-gp2');
  assert.ok(tank, 'target aquarium must still exist after stocking');
  const candidate = tank.fishes?.find(item => item.fishId === 'sp_0002');
  assert.equal(candidate?.quantity, 1, '水晶虾 must be persisted exactly once after the Golden Path');
  assert.equal(tank.fishes?.find(item => item.fishId === 'sp_0001')?.quantity, 2, 'existing livestock quantity must not change');
  assert.deepEqual(pageErrors, [], `GP-002 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-002 continuous E2E passed: search → exact detail → primary compatibility task → result → actual stocking → persisted quantity.');
} finally {
  await browser.close();
}

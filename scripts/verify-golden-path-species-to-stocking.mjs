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
      fishId: 'sp_0431',
      quantity: 6,
      entryDate: '2026-08-01T00:00:00.000Z',
      batches: [{ id: 'batch-existing', quantity: 6, entryDate: '2026-08-01T00:00:00.000Z', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: '2026-08-01T00:00:00.000Z' }],
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
  await page.goto(`${baseUrl}/search?q=${encodeURIComponent('宝莲灯')}`, { waitUntil: 'domcontentloaded' });
  const resultCard = page.locator('#search-species-sp_0432');
  await resultCard.waitFor();
  assert.ok(await resultCard.isVisible(), 'exact 宝莲灯 search result must be visible');

  // Milestone 2: open the exact object, not the atlas home.
  await resultCard.click();
  await page.waitForURL(url => url.pathname === '/encyclopedia' && url.searchParams.get('species') === 'sp_0432');
  const detail = page.locator('[role="dialog"][data-surface="detail-rail"]:visible, [role="dialog"][data-surface="bottom-sheet"]:visible').first();
  await detail.waitFor();
  await detail.getByText('宝莲灯', { exact: true }).first().waitFor();

  // Milestone 3: use the species detail PRIMARY task CTA. The footer action is the canonical
  // transition into full compatibility checkout, including caution states.
  const mainTaskAction = detail.locator('.modalFooter button').first();
  await mainTaskAction.waitFor();
  const mainTaskLabel = (await mainTaskAction.textContent())?.trim() || '';
  assert.match(mainTaskLabel, /风险|混养|加入/, `detail primary CTA must lead toward compatibility, got: ${mainTaskLabel}`);
  await mainTaskAction.click();

  // Milestones 4–5: the decision drawer must retain the real tank baseline and exact candidate.
  const calculator = page.locator('[data-surface="compatibility-checkout-drawer"]:visible');
  await calculator.waitFor();
  await calculator.getByText('当前鱼缸', { exact: true }).waitFor();
  await calculator.getByText('红绿灯', { exact: true }).first().waitFor();
  const candidateName = calculator.getByText('宝莲灯', { exact: true }).first();
  await candidateName.waitFor();
  await calculator.getByText('混养结果', { exact: true }).waitFor();

  // This species is shoaling. Exercise the real quantity controls rather than recording one fish
  // while the UI is warning that the group is too small.
  const candidateChip = candidateName.locator('xpath=ancestor::div[contains(@class,"rounded-full")][1]');
  const plusButton = candidateChip.getByRole('button', { name: '+' });
  await plusButton.waitFor();
  for (let index = 1; index < 6; index += 1) await plusButton.click();
  await candidateChip.getByText(/×6/).waitFor();

  const resultText = (await calculator.textContent()) || '';
  assert.match(resultText, /当前可混养|有条件可尝试/, 'evidence-backed fixture must resolve to a recordable compatibility state');
  assert.equal(/不建议混养|需要补充鱼缸信息/.test(resultText), false, 'recording fixture must not bypass block or medium/high missing-data states');
  assert.equal(/当前鱼缸已有 红绿灯，不建议再加入体型明显更小的 宝莲灯/.test(resultText), false, 'peaceful prey wording must not regress into a predation block');

  // Milestone 6: caution requires an explicit confirmation before the real write.
  let recordButton = page.getByRole('button', { name: /已经实际入缸，记录下来|确认风险后再记录/ });
  await recordButton.waitFor();
  const firstLabel = await recordButton.textContent();
  await recordButton.click();
  if (firstLabel?.includes('确认风险后再记录')) {
    recordButton = page.getByRole('button', { name: '已经实际入缸，记录下来' });
    await recordButton.waitFor();
    await recordButton.click();
  }

  // Milestone 7: persisted product state is the source of truth. A transient success message is
  // secondary evidence and must not be able to make a failed write look successful (or vice versa).
  await page.waitForFunction(() => {
    const stored = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
    const tank = stored.aquariums?.find(item => item.id === 'tank-gp2');
    return tank?.fishes?.some(item => item.fishId === 'sp_0432' && item.quantity === 6);
  });

  const successFeedback = calculator.getByText(/已加入|已记录到鱼缸|已记录/).last();
  if (await successFeedback.count()) await successFeedback.waitFor();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const tank = stored.aquariums?.find(item => item.id === 'tank-gp2');
  assert.ok(tank, 'target aquarium must still exist after stocking');
  const candidate = tank.fishes?.find(item => item.fishId === 'sp_0432');
  assert.equal(candidate?.quantity, 6, '宝莲灯 group quantity must persist as 6 after the Golden Path');
  assert.equal(tank.fishes?.find(item => item.fishId === 'sp_0431')?.quantity, 6, 'existing 红绿灯 quantity must remain unchanged');
  assert.deepEqual(pageErrors, [], `GP-002 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-002 continuous E2E passed: search 宝莲灯 → exact detail → compatibility → quantity ×6 → caution confirmation → actual stocking → persisted quantity.');
} finally {
  await browser.close();
}

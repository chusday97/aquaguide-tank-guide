import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const artifactDir = 'artifacts/compatibility-stage-risk';
fs.mkdirSync(artifactDir, { recursive: true });

const state = {
  version: 1,
  currentAquariumId: 'stage-risk-browser-tank',
  aquariums: [{
    id: 'stage-risk-browser-tank',
    name: '生命周期风险测试缸',
    fishes: [{
      id: 'guppy-existing-record',
      fishId: 'sp_0436',
      quantity: 2,
      entryDate: '2026-01-01T00:00:00.000Z',
      batches: [{
        id: 'guppy-adult-batch',
        quantity: 2,
        entryDate: '2026-01-01T00:00:00.000Z',
        lifeStage: 'adult',
        reproductiveState: 'normal',
        stateUpdatedAt: '2026-08-01T00:00:00.000Z',
      }],
    }],
    dimensions: { length: '120', width: '50', height: '50' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '水草泥',
    plants: ['莫丝', '水榕'],
    hardscape: ['沉木'],
    equipment: { filter: '桶滤', heater: true, oxygen: false, light: '水草灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, taskCardDismissed: true },
  updatedAt: '2026-08-20T00:00:00.000Z',
};

const readStoredGuppy = page => page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
  const tank = stored.aquariums?.find(item => item.id === 'stage-risk-browser-tank');
  return tank?.fishes?.find(item => item.fishId === 'sp_0436') || null;
});

const assertExistingAdultRecordUnchanged = async (page, message) => {
  const stored = await readStoredGuppy(page);
  assert.equal(stored?.quantity, 2, `${message}: planned review must not change existing guppy quantity`);
  assert.equal(stored?.batches?.length, 1, `${message}: planned review must not append a batch`);
  assert.equal(stored?.batches?.[0]?.lifeStage, 'adult', `${message}: existing adult batch must remain adult`);
};

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.goto(`${baseUrl}/aquarium?action=plan-species`, { waitUntil: 'domcontentloaded' });
  const dialog = page.getByRole('dialog').first();
  await dialog.getByText('规划想养的生物', { exact: true }).waitFor();

  const search = dialog.getByPlaceholder('搜索鱼、虾、螺或学名');
  await search.fill('孔雀鱼');
  const exactCandidateName = dialog.getByText('孔雀鱼', { exact: true }).first();
  await exactCandidateName.waitFor();
  const candidate = exactCandidateName.locator('xpath=ancestor::button[1]');
  await candidate.waitFor();
  await candidate.click();

  const stageSelect = dialog.locator('[data-add-fish-life-stage="sp_0436"]');
  await stageSelect.waitFor();
  assert.equal(await stageSelect.inputValue(), 'unknown', 'planned additions must start at explicit unknown stage');

  // Control: same-species adult + adult must not be blocked merely because the species IDs match.
  await stageSelect.selectOption('adult');
  assert.equal(await stageSelect.inputValue(), 'adult', 'adult life-stage choice must be captured by the UI');
  await dialog.getByRole('button', { name: '查看规划判断' }).click();
  await dialog.getByText('加入后风险判定', { exact: true }).waitFor();
  assert.equal(await dialog.getByText('不建议加入', { exact: true }).count(), 0, 'same-species adult + adult must not be classified as the fry-predation block');
  await assertExistingAdultRecordUnchanged(page, 'adult control review');

  await dialog.getByRole('button', { name: '返回调整' }).first().click();
  await stageSelect.waitFor();

  // Treatment: changing only the candidate life stage to fry must surface the reviewed block.
  await stageSelect.selectOption('fry');
  assert.equal(await stageSelect.inputValue(), 'fry', 'fry life-stage choice must be captured by the UI');
  await dialog.getByRole('button', { name: '查看规划判断' }).click();
  await dialog.getByText('加入后风险判定', { exact: true }).waitFor();
  await dialog.getByText('不建议加入', { exact: true }).waitFor();

  const blockedText = await dialog.innerText();
  assert.match(blockedText, /当前规划命中阻断风险/, 'fry review must explain that the plan hit a blocking risk');
  assert.match(blockedText, /鱼苗|幼体|捕食|吞食/, 'fry block must expose life-stage-specific risk evidence, not an unrelated generic block');
  await assertExistingAdultRecordUnchanged(page, 'fry blocked review');

  // A blocked plan cannot become a normal save. "Add anyway" must first enter a distinct high-risk override confirmation.
  const overrideEntry = dialog.getByRole('button', { name: '仍要加入' });
  await overrideEntry.waitFor();
  assert.equal(await dialog.getByRole('button', { name: '已经实际入缸，记录下来' }).count(), 0, 'blocked fry plan must not expose the normal safe-record CTA');
  await overrideEntry.click();

  const overrideDialog = page.getByRole('dialog').filter({ hasText: '高风险确认' });
  await overrideDialog.waitFor();
  await overrideDialog.getByRole('button', { name: '我已了解风险，仍要加入' }).waitFor();
  await assertExistingAdultRecordUnchanged(page, 'before explicit high-risk override confirmation');

  await page.screenshot({ path: `${artifactDir}/same-species-fry-block.png`, fullPage: true });
  assert.deepEqual(pageErrors, [], `life-stage browser regression must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('Same-species life-stage browser regression: PASS (adult control stays non-blocking; fry treatment becomes not_recommended; normal save is replaced by explicit high-risk override).');
} finally {
  await browser.close();
}

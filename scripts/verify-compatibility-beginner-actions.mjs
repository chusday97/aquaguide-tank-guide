import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const makeState = ({ id, name, fishId, quantity, temperature = '21' }) => ({
  version: 1,
  currentAquariumId: id,
  aquariums: [{
    id,
    name,
    fishes: [{
      id: `stock-${id}`,
      fishId,
      quantity,
      entryDate: '2026-06-01T00:00:00.000Z',
      batches: [{ id: `batch-${id}`, quantity, entryDate: '2026-06-01T00:00:00.000Z', lifeStage: 'adult', reproductiveState: 'normal', stateUpdatedAt: '2026-09-01T00:00:00.000Z' }],
    }],
    dimensions: { length: '100', width: '40', height: '30' },
    waterType: 'Freshwater',
    targetTemperature: temperature,
    substrate: '无', plants: [], hardscape: [],
    equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [],
  compatibilityRecords: [], deceasedRecords: [], feedingRecords: [],
  observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: '2026-09-11T00:00:00.000Z',
});

const openCompatibility = async ({ state, candidateId }) => {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(15_000);
  page.on('pageerror', error => { throw error; });
  await page.addInitScript(saved => {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);
  await page.goto(`${baseUrl}/compatibility?species=${candidateId}&source=beginner-action-e2e`, { waitUntil: 'domcontentloaded' });
  const calculator = page.locator('[data-ui-block="compatibility-workspace"]:visible').first();
  await calculator.waitFor();
  return { page, calculator };
};

const setQuantity = async (calculator, speciesName, target) => {
  const name = calculator.getByText(speciesName, { exact: true }).first();  await name.waitFor();
  const chip = name.locator('xpath=ancestor::div[contains(@class,"rounded-full")][1]');
  const plus = chip.getByRole('button', { name: '+' });
  await plus.waitFor();
  for (let current = 1; current < target; current += 1) await plus.click();
  await chip.getByText(new RegExp(`×${target}$`)).waitFor();
  return chip;
};

try {
  {
    const state = makeState({ id: 'tank-fin-nip', name: '虎皮行为测试缸', fishId: 'sp_0434', quantity: 10, temperature: '21' });
    const { page, calculator } = await openCompatibility({ state, candidateId: 'sp_0439' });
    await calculator.getByText('白云金丝', { exact: true }).first().waitFor();
    await setQuantity(calculator, '虎皮鱼', 4);
    await calculator.getByText('先把群体数量补够，再混养', { exact: true }).waitFor();
    const resultPanel = calculator.getByText('计算结果', { exact: true }).locator('xpath=ancestor::section[1]');
    const underGroupedText = (await resultPanel.textContent()) || '';
    assert.match(underGroupedText, /当前不是“少养几条更安全”/);
    assert.doesNotMatch(underGroupedText, /建议单养/);

    const tigerChip = calculator.getByText('虎皮鱼', { exact: true }).first()
      .locator('xpath=ancestor::div[contains(@class,"rounded-full")][1]');
    const plus = tigerChip.getByRole('button', { name: '+' });
    for (let current = 4; current < 8; current += 1) await plus.click();
    await tigerChip.getByText(/×8$/).waitFor();    await page.waitForFunction(() => !document.body.textContent?.includes('先把群体数量补够，再混养'));
    assert.equal(((await calculator.textContent()) || '').includes('先把群体数量补够，再混养'), false);
    await page.close();
  }

  {
    const state = makeState({ id: 'tank-stable-load', name: '稳定经验测试缸', fishId: 'sp_0434', quantity: 10, temperature: '21' });
    const { page, calculator } = await openCompatibility({ state, candidateId: 'sp_0435' });
    await calculator.getByText('白云金丝', { exact: true }).first().waitFor();
    await setQuantity(calculator, '斑马鱼', 40);
    await calculator.getByText('可以尝试，但别一次加太多', { exact: true }).waitFor();
    assert.match((await calculator.textContent()) || '', /按当前粗粒度体型与数量筛查，负荷有所升高/);

    await calculator.getByRole('button', { name: '是，符合', exact: true }).click();
    await calculator.getByRole('heading', { name: '可以混养', exact: true }).waitFor();
    const stableText = (await calculator.textContent()) || '';
    assert.doesNotMatch(stableText, /按当前粗粒度体型与数量筛查，负荷有所升高/);
    const evidenceToggle = calculator.locator('[data-disclosure-purpose="secondary_evidence"]').first();
    await evidenceToggle.waitFor();
    await evidenceToggle.click();
    await calculator.getByText('稳定运行背景已纳入判断', { exact: true }).waitFor();
    await page.close();
  }

  {
    const state = makeState({ id: 'tank-tiger-guppy', name: '虎皮孔雀测试缸', fishId: 'sp_0439', quantity: 8, temperature: '24' });
    const { page, calculator } = await openCompatibility({ state, candidateId: 'sp_0436' });
    await calculator.getByText('虎皮鱼', { exact: true }).first().waitFor();
    await setQuantity(calculator, '孔雀鱼', 5);
    await calculator.getByRole('heading', { name: '不建议混养', exact: true }).waitFor();
    const resultText = (await calculator.textContent()) || '';
    assert.match(resultText, /先不要把这组生物放在一起/);
    assert.match(resultText, /长鳍|追鳍/);
    assert.doesNotMatch(resultText, /可以尝试，但别一次加太多/);
    await page.close();
  }

  console.log('Compatibility beginner-action E2E passed: fin-nipping group pressure + stable soft-load downgrade + tiger-barb/guppy reviewed block.');
} finally {
  await browser.close();
}
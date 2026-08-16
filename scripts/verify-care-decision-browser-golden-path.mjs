import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const sourceTank = {
  id: 'care-gp-source',
  name: '冲突源鱼缸',
  fishes: [
    { id: 'care-gp-predator', fishId: 'sp_0049', quantity: 1, entryDate: '2026-08-01T00:00:00.000Z' },
    { id: 'care-gp-neon', fishId: 'sp_0431', quantity: 6, entryDate: '2026-08-01T00:00:00.000Z' },
  ],
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const destinationTank = {
  id: 'care-gp-destination',
  name: '备用观察缸',
  fishes: [],
  dimensions: { length: '120', width: '45', height: '45' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const seededState = {
  version: 1,
  currentAquariumId: sourceTank.id,
  aquariums: [sourceTank, destinationTank],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  updatedAt: new Date().toISOString(),
};

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, locale: 'zh-CN' });
  await context.addInitScript((state) => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
    localStorage.setItem('aquariums', JSON.stringify(state.aquariums));
    localStorage.setItem('wishlistFishIds', '[]');
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, seededState);

  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  await page.goto(`${baseUrl}/care?topic=guide_water_deteriorate`, { waitUntil: 'domcontentloaded' });

  const startDiagnosis = page.locator('[data-care-first-screen-primary]').filter({ hasText: '开始快速检查' });
  await startDiagnosis.waitFor();
  await startDiagnosis.click();

  await page.getByText('你主要看到了什么？', { exact: true }).waitFor();
  await page.getByRole('button', { name: '追咬打架', exact: true }).click();

  await page.getByText('是否有拒食、躲藏或死亡？', { exact: true }).waitFor();
  await page.getByText('最近是否新增生物？', { exact: true }).waitFor();
  const noneButtons = page.getByRole('button', { name: '没有', exact: true });
  assert.ok(await noneButtons.count() >= 2, 'aggression diagnosis must render two explicit “没有” answer options');
  await noneButtons.nth(0).click();
  await noneButtons.nth(1).click();

  const showAdvice = page.getByRole('button', { name: '查看处理建议', exact: true });
  await showAdvice.waitFor();
  assert.equal(await showAdvice.isDisabled(), false, 'behavior diagnosis should be ready after both required answers');
  await showAdvice.click();

  const baseResult = page.locator('[data-care-assessment-result]');
  await baseResult.waitFor();
  const conflictAugmentation = page.locator('[data-care-conflict-augmentation]');
  await conflictAugmentation.waitFor();
  const augmentationStatus = await conflictAugmentation.getAttribute('data-care-conflict-augmentation');
  assert.ok(
    ['specific_conflict_evidence', 'partial_specific_conflict_evidence'].includes(augmentationStatus || ''),
    `expected specific behavior conflict evidence, got ${augmentationStatus}`,
  );
  assert.match(await conflictAugmentation.innerText(), /→|↔/, 'conflict evidence should expose relationship direction');

  const compareButton = page.locator('[data-open-intervention-comparison]');
  await compareButton.waitFor();
  await compareButton.click();

  const panel = page.locator('[data-intervention-panel-readonly="true"]');
  await panel.waitFor();
  assert.match(await panel.innerText(), /当前群落调整比较/);
  assert.ok(await panel.locator('[data-conflict-edge-id]').count() >= 1, 'intervention panel must show at least one explicit blocker edge');
  assert.ok(await panel.locator('[data-intervention-choice-id]').count() >= 1, 'intervention panel must show at least one recomputed choice');
  assert.ok(await panel.locator('[data-relocation-destinations]').count() >= 1, 'intervention panel must show destination evaluations');

  const panelText = await panel.innerText();
  assert.match(panelText, /备用观察缸/, 'repository-reactive destination aquarium should be visible in the comparison panel');
  assert.match(
    panelText,
    /基于当前证据可考虑|有条件候选|资料不足，暂不能确认|当前不建议/,
    'destination must expose an explicit fail-closed verdict label',
  );
  assert.match(panelText, /不会自动移动或删除任何生物/, 'panel must disclose that it is read-only');

  for (const forbiddenLabel of ['确认移出', '立即移出', '删除生物', '移动到备用观察缸']) {
    assert.equal(
      await panel.getByRole('button', { name: forbiddenLabel, exact: true }).count(),
      0,
      `read-only Golden Path must not expose executable mutation button: ${forbiddenLabel}`,
    );
  }

  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    0,
    'Care decision Golden Path must not introduce horizontal overflow',
  );

  await context.close();
  console.log('Care decision browser Golden Path passed: quick diagnosis -> explicit conflict -> read-only intervention comparison -> destination verdict');
} finally {
  await browser.close();
}

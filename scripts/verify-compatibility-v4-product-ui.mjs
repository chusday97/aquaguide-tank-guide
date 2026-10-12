import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const vite = await createServer({
  root: process.cwd(),
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'silent',
});
await vite.listen();
const address = vite.httpServer?.address();
if (!address || typeof address === 'string') throw new Error('Could not resolve local Vite port');
const baseUrl = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ headless: true });

const createState = (tankId) => ({
  version: 1,
  currentAquariumId: tankId,
  aquariums: [{
    id: tankId,
    name: 'Compatibility V4 browser tank',
    fishes: [{
      id: `${tankId}-existing-black-skirt`,
      fishId: 'sp_0010',
      quantity: 6,
      entryDate: '2026-10-01T00:00:00.000Z',
    }],
    dimensions: { length: '120', width: '50', height: '50' },
    waterType: 'Freshwater',
    targetTemperature: '24',
    substrate: '河沙',
    plants: ['plant-a', 'plant-b'],
    hardscape: ['rock-a'],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  }],
  wishlist: ['sp_0011'],
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
    taskCardDismissed: false,
    aquariumConfigured: true,
  },
  updatedAt: '2026-10-12T00:00:00.000Z',
});

const newSeededContext = async (tankId) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await context.addInitScript(({ saved }) => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('wishlistFishIds', JSON.stringify(saved.wishlist));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, { saved: createState(tankId) });
  return context;
};

const aiResultFor = (body, {
  verdict,
  reason,
  adjustment,
  model = 'compatibility-v4-ui-mock',
}) => ({
  verdict,
  reasons: [reason],
  adjustments: [adjustment],
  uncertainties: [],
  confidence: 'medium',
  evidenceIds: (body.allowedEvidenceIds || []).slice(0, 2),
  provenance: {
    mode: 'ai_assisted',
    model,
    authorityVersion: body.authorityVersion,
    speciesIds: (body.species || []).map(item => item.speciesId),
  },
});

const assertPairContext = (body, label) => {
  assert.deepEqual(
    (body.species || []).map(item => item.speciesId).sort(),
    ['sp_0010', 'sp_0011'],
    `${label} must send current tank livestock plus the planned candidate to V4`,
  );
};

try {
  // Scenario 1: the visible calculator must expose a pending state and accept
  // a stricter AI verdict without mutating deterministic evidence arrays.
  {
    const context = await newSeededContext('v4-ui-block');
    let calls = 0;
    const pageErrors = [];
    await context.route('**/api/v1/ai/compatibility-reason', async route => {
      calls += 1;
      const body = JSON.parse(route.request().postData() || '{}');
      assertPairContext(body, 'calculator display request');
      await new Promise(resolve => setTimeout(resolve, 650));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: aiResultFor(body, {
            verdict: 'not_recommended',
            reason: 'V4 UI：动态综合判断发现额外行为压力。',
            adjustment: 'V4 UI：先扩大活动空间并降低群体压力。',
          }),
          requestId: 'v4-ui-block',
        }),
      });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${baseUrl}/compatibility?species=sp_0011`, { waitUntil: 'domcontentloaded' });
    const drawer = page.locator('[data-surface="compatibility-checkout-drawer"]');
    await drawer.waitFor();
    await drawer.getByText('综合判断中…', { exact: true }).waitFor();
    const pendingRecordAction = page.getByRole('button', { name: /确认风险后再记录|已经实际入缸，记录下来/ }).first();
    if (await pendingRecordAction.count()) {
      assert.equal(await pendingRecordAction.isDisabled(), true, 'record action must stay disabled while V4 is pending');
    }
    await drawer.getByText('V4 UI：动态综合判断发现额外行为压力。', { exact: true }).waitFor();
    assert.equal(await drawer.locator('[data-visual-result-status="not_recommended"]').count() > 0, true);
    assert.equal(await page.getByRole('button', { name: /确认风险后再记录|已经实际入缸，记录下来/ }).count(), 0);
    assert.equal(calls, 1);
    assert.deepEqual(pageErrors, []);
    await context.close();
  }

  // Scenario 2: a caution result may proceed only after a second V4 request
  // starts at submit time; persistence must not happen before that response.
  {
    const tankId = 'v4-ui-add';
    const context = await newSeededContext(tankId);
    let calls = 0;
    const requestSpecies = [];
    const pageErrors = [];
    await context.route('**/api/v1/ai/compatibility-reason', async route => {
      calls += 1;
      const body = JSON.parse(route.request().postData() || '{}');
      assertPairContext(body, `V4 request ${calls}`);
      requestSpecies.push((body.species || []).map(item => item.speciesId).sort());
      await new Promise(resolve => setTimeout(resolve, calls === 1 ? 350 : 700));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: aiResultFor(body, {
            verdict: 'caution',
            reason: calls === 1
              ? 'V4 UI：组合可尝试，但需要控制群体与空间。'
              : 'V4 UI：提交前复核仍为谨慎可加入。',
            adjustment: 'V4 UI：保持充足空间并持续观察。',
          }),
          requestId: `v4-ui-add-${calls}`,
        }),
      });
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${baseUrl}/compatibility?species=sp_0011`, { waitUntil: 'domcontentloaded' });
    const drawer = page.locator('[data-surface="compatibility-checkout-drawer"]');
    await drawer.waitFor();
    await drawer.getByText('V4 UI：组合可尝试，但需要控制群体与空间。', { exact: true }).waitFor();

    let recordButton = page.getByRole('button', { name: /确认风险后再记录|已经实际入缸，记录下来/ }).first();
    await recordButton.waitFor();
    const firstLabel = (await recordButton.textContent()) || '';
    await recordButton.click();
    if (firstLabel.includes('确认风险后再记录')) {
      recordButton = page.getByRole('button', { name: '已经实际入缸，记录下来' });
      await recordButton.waitFor();
      await recordButton.click();
    }

    for (let index = 0; index < 40 && calls < 2; index += 1) await page.waitForTimeout(50);
    assert.ok(calls >= 2, 'actual livestock write must trigger a second V4 request');

    const beforeSubmitResponse = await page.evaluate(({ targetTankId }) => {
      const stored = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
      const tank = stored.aquariums?.find(item => item.id === targetTankId);
      return tank?.fishes?.some(item => item.fishId === 'sp_0011') || false;
    }, { targetTankId: tankId });
    assert.equal(beforeSubmitResponse, false, 'candidate must not persist while submit-time V4 is still pending');

    await page.waitForFunction(({ targetTankId }) => {
      const stored = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
      const tank = stored.aquariums?.find(item => item.id === targetTankId);
      return tank?.fishes?.some(item => item.fishId === 'sp_0011') || false;
    }, { targetTankId: tankId }, { timeout: 15_000 });

    assert.deepEqual(requestSpecies[0], ['sp_0010', 'sp_0011']);
    assert.deepEqual(requestSpecies[1], ['sp_0010', 'sp_0011']);
    assert.deepEqual(pageErrors, []);
    await context.close();
  }

  // Scenario 3: provider failure must visibly fail closed and expose no
  // livestock-recording action.
  {
    const tankId = 'v4-ui-fallback';
    const context = await newSeededContext(tankId);
    let calls = 0;
    const pageErrors = [];
    await context.route('**/api/v1/ai/compatibility-reason', async route => {
      calls += 1;
      await new Promise(resolve => setTimeout(resolve, 250));
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'mock provider unavailable' },
          requestId: 'v4-ui-fallback',
        }),
      });
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${baseUrl}/compatibility?species=sp_0011`, { waitUntil: 'domcontentloaded' });
    const drawer = page.locator('[data-surface="compatibility-checkout-drawer"]');
    await drawer.waitFor();
    await page.waitForFunction(() => document.body.innerText.includes('兼容性 AI 暂时不可用'));
    const drawerText = await drawer.innerText();
    assert.match(drawerText, /兼容性 AI 暂时不可用，已回退为资料不足。/);
    assert.equal(await page.getByRole('button', { name: /确认风险后再记录|已经实际入缸，记录下来/ }).count(), 0);
    const persisted = await page.evaluate(({ targetTankId }) => {
      const stored = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
      const tank = stored.aquariums?.find(item => item.id === targetTankId);
      return tank?.fishes?.some(item => item.fishId === 'sp_0011') || false;
    }, { targetTankId: tankId });
    assert.equal(persisted, false);
    assert.equal(calls, 1);
    assert.deepEqual(pageErrors, []);
    await context.close();
  }

  // Scenario 4: Species Detail intentionally keeps tank-fit summary separate,
  // while the expandable Compatibility section must render the V4 synthesis.
  {
    const context = await newSeededContext('v4-ui-detail');
    let calls = 0;
    const pageErrors = [];
    await context.route('**/api/v1/ai/compatibility-reason', async route => {
      calls += 1;
      const body = JSON.parse(route.request().postData() || '{}');
      assertPairContext(body, 'species detail V4 request');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: aiResultFor(body, {
            verdict: 'not_recommended',
            reason: 'V4 UI 详情：动态判断为不建议。',
            adjustment: 'V4 UI 详情：先调整空间再考虑。',
            model: 'compatibility-v4-detail-ui-mock',
          }),
          requestId: 'v4-ui-detail',
        }),
      });
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`${baseUrl}/encyclopedia?species=sp_0011`, { waitUntil: 'domcontentloaded' });
    const dialog = page.locator('[role="dialog"][data-surface]:visible').first();
    await dialog.waitFor();
    await dialog.getByRole('button', { name: /混养关系/ }).first().click();
    await dialog.getByText('V4 UI 详情：动态判断为不建议。', { exact: true }).waitFor();
    const compatibilityCard = dialog.locator('[data-visual-result-status="not_recommended"]').last();
    assert.equal(await compatibilityCard.count() > 0, true);
    const compatibilityText = await compatibilityCard.innerText();
    assert.match(compatibilityText, /V4 UI 详情：动态判断为不建议。/);
    assert.match(compatibilityText, /V4 UI 详情：先调整空间再考虑。/);
    assert.equal(calls, 1);
    assert.deepEqual(pageErrors, []);
    await context.close();
  }

  console.log('Compatibility V4 browser product smoke PASS: pending guard, AI risk escalation, submit-time revalidation before persistence, fail-closed provider behavior, and Species Detail runtime synthesis verified in real rendered UI.');
} finally {
  await browser.close();
  await vite.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const now = new Date().toISOString();
const today = now.slice(0, 10);
const artifactDir = 'artifacts/result-ux-procedure';

const state = {
  version: 1,
  currentAquariumId: 'tank-procedure',
  aquariums: [{
    id: 'tank-procedure',
    name: '操作指南测试缸',
    fishes: [{
      id: 'stock-procedure',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: today,
      batches: [{
        id: 'batch-procedure',
        quantity: 4,
        entryDate: today,
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: now,
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
  onboarding: {
    version: 1,
    status: 'completed',
    goal: 'build_tank',
    viewedSpecies: true,
    aquariumConfigured: true,
    taskCardDismissed: true,
  },
  updatedAt: now,
};

fs.mkdirSync(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'domcontentloaded' });

  const detail = page.locator('[data-care-workspace-detail]');
  await detail.waitFor();
  assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, 'Procedure browsing must remain in the workspace detail surface.');

  const result = detail.locator('[data-testid="care-procedure-decision"]');
  await result.waitFor();
  assert.equal(await result.getAttribute('data-result-ux'), 'decision', 'Procedure must consume the shared decision-first Result UX surface.');

  const heroTitle = result.locator('h3').first();
  const heroTitleText = ((await heroTitle.textContent()) || '').trim();
  assert.ok(heroTitleText.length > 0, 'Procedure must expose the first concrete step as the strongest result heading.');
  assert.doesNotMatch(heroTitleText, /换水.*指南|指南.*换水/, 'Procedure hero must not simply repeat the article title.');

  const resultText = ((await result.textContent()) || '').replace(/\s+/g, ' ');
  assert.match(resultText, /现在先做/, 'Procedure decision surface must explicitly frame the first step as the action to take now.');

  const actionStack = result.locator('[data-result-ux-actions]');
  if (await actionStack.count()) {
    const count = await actionStack.locator('li').count();
    assert.ok(count <= 2, `Procedure decision surface must expose at most two next steps, got ${count}.`);
  }

  const evidence = result.locator('[data-result-ux-evidence]');
  if (await evidence.count()) {
    assert.equal(await evidence.locator('details[open]').count(), 0, 'Procedure evidence must remain collapsed by default.');
  }

  const explanation = detail.locator('[data-disclosure-purpose="secondary_evidence"]');
  await explanation.waitFor();
  assert.equal(await explanation.getAttribute('aria-expanded'), 'false', 'Procedure detailed explanation must remain collapsed by default.');

  await detail.getByRole('button', { name: /去记录本次换水|Record Water Change in Tank/ }).waitFor();

  const heroBox = await heroTitle.boundingBox();
  assert.ok(heroBox && heroBox.y < 900, 'Procedure first step must be visible in the initial desktop viewport.');

  await page.screenshot({ path: `${artifactDir}/procedure-decision-first-desktop.png`, fullPage: true });
  assert.deepEqual(pageErrors, [], `Procedure Result UX must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('Procedure Result UX passed: direct procedure topic → shared decision surface → first step first → bounded next steps → collapsed detail.');
} finally {
  await browser.close();
}

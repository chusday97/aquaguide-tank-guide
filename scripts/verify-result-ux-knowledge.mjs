import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const artifactDir = 'artifacts/result-ux-knowledge';

const state = {
  version: 1,
  currentAquariumId: 'tank-knowledge',
  aquariums: [{
    id: 'tank-knowledge',
    name: '知识页测试缸',
    fishes: [{
      id: 'stock-knowledge',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: today,
      batches: [{
        id: 'batch-knowledge',
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
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.goto(`${baseUrl}/care?topic=qa_gen_004`, { waitUntil: 'domcontentloaded' });

  const detail = page.locator('[data-care-workspace-detail]').filter({ hasText: '软水' });
  await detail.waitFor();
  assert.equal(
    await page.locator('[role="dialog"]:visible').count(),
    0,
    'Knowledge browsing must stay in the workspace detail surface rather than reopening a modal report.',
  );

  const result = detail.locator('[data-testid="care-knowledge-decision"]');
  await result.waitFor();
  assert.equal(await result.getAttribute('data-result-ux'), 'decision', 'Knowledge must consume the shared decision-first Result UX surface.');

  const heroTitle = result.locator('h3').first();
  const heroTitleText = ((await heroTitle.textContent()) || '').trim();
  assert.ok(heroTitleText.length > 0, 'Knowledge must expose a concrete takeaway/action in the strongest result heading.');
  assert.doesNotMatch(heroTitleText, /养鱼常说的.*GH\/KH/, 'The strongest result heading must not simply repeat the article/report title.');

  const resultText = ((await result.textContent()) || '').replace(/\s+/g, ' ');
  assert.match(resultText, /先看结论/, 'Knowledge must explicitly frame the takeaway before the long explanation.');

  const actionStack = result.locator('[data-result-ux-actions]');
  if (await actionStack.count()) {
    const count = await actionStack.locator('li').count();
    assert.ok(count <= 2, `Knowledge decision surface must expose at most two follow-up points, got ${count}.`);
  }

  const primaryControl = result.locator('[data-care-result-primary]');
  await primaryControl.waitFor();
  await result.getByRole('button', { name: /收藏这篇指南|去水族册查看|已收藏在水族册/ }).waitFor();

  const disclosure = detail.locator('[data-disclosure-purpose="secondary_explanation"]');
  await disclosure.waitFor();
  assert.equal(await disclosure.getAttribute('aria-expanded'), 'false', 'Long knowledge explanation must be collapsed by default.');
  await disclosure.getByText(/详细说明|Detailed explanation/).waitFor();

  const evidence = result.locator('[data-result-ux-evidence]');
  if (await evidence.count()) {
    assert.equal(await evidence.locator('details[open]').count(), 0, 'Knowledge evidence/sources must be collapsed by default.');
    const sourceSummary = evidence.locator('summary').filter({ hasText: '信息来源' });
    if (await sourceSummary.count()) {
      await sourceSummary.first().click();
      const sourceText = ((await evidence.textContent()) || '').replace(/\s+/g, ' ');
      assert.match(sourceText, /(已核验|待逐条核验)/, 'Knowledge source details must expose review status instead of generic authority labels.');
    }
  }

  const heroBox = await heroTitle.boundingBox();
  const disclosureBox = await disclosure.boundingBox();
  assert.ok(heroBox && disclosureBox && heroBox.y < disclosureBox.y, 'Knowledge takeaway must appear before the long-form explanation disclosure.');
  assert.ok(heroBox && heroBox.y < 900, 'Knowledge takeaway must be visible in the initial desktop viewport.');

  await page.screenshot({ path: `${artifactDir}/knowledge-decision-first-desktop.png`, fullPage: true });
  assert.deepEqual(pageErrors, [], `Knowledge Result UX must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('Knowledge Result UX passed: direct care topic → shared decision surface → bounded follow-ups → collapsed long explanation → fail-closed source detail.');
} finally {
  await browser.close();
}

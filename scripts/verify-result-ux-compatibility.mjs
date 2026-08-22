import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const artifactDir = 'artifacts/result-ux-compatibility';
const now = new Date().toISOString();

const state = {
  version: 1,
  currentAquariumId: 'result-ux-compat-tank',
  aquariums: [{
    id: 'result-ux-compat-tank',
    name: 'Result UX 混养测试缸',
    fishes: [],
    dimensions: { length: '100', width: '50', height: '50' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: ['沉木'],
    equipment: { filter: '外置过滤', heater: true, oxygen: true, light: '普通灯' },
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
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await context.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    sessionStorage.setItem('aquaguide_compatibility_selection', JSON.stringify(['sp_0439', 'sp_0021']));
  }, state);

  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  page.setDefaultNavigationTimeout(30_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(`${baseUrl}/encyclopedia?mode=compatibility`, { waitUntil: 'domcontentloaded' });

  const drawer = page.locator('[data-surface="compatibility-checkout-drawer"]:visible');
  await drawer.waitFor();
  const decision = drawer.locator('[data-testid="compatibility-decision"]');
  await decision.waitFor();

  assert.equal(await decision.getAttribute('data-result-ux'), 'decision', 'Compatibility must use the shared decision-first Result UX surface.');
  const decisionText = ((await decision.textContent()) || '').replace(/\s+/g, ' ');
  assert.match(decisionText, /不建议混养/, 'Reviewed tiger-barb × mini-parrot conflict must remain not_recommended in the UI.');
  assert.match(decisionText, /混养结论/, 'Compatibility Result UX must lead with an explicit verdict frame.');

  const heroTitle = decision.locator('h3').first();
  const heroTitleText = ((await heroTitle.textContent()) || '').trim();
  assert.match(heroTitleText, /(保留|移除|不要|先不要)/, `Blocked Compatibility hero must give a concrete safe adjustment, got: ${heroTitleText}`);

  const stockButton = decision.getByRole('button', { name: /已经实际入缸|record now/i });
  assert.equal(await stockButton.count(), 0, 'not_recommended must never expose the actual-stocking record control.');

  const primaryAdjustment = decision.getByRole('button', { name: /移除|不加入|查看当前鱼缸/i }).first();
  assert.equal(await primaryAdjustment.count(), 1, 'Blocked result must expose one concrete safe adjustment control in the first result surface.');

  const followUp = decision.locator('[data-result-ux-actions] li');
  const followUpCount = await followUp.count();
  assert.ok(followUpCount <= 2, `Compatibility must show at most two follow-up actions, got ${followUpCount}.`);

  const avoid = decision.locator('[data-result-ux-avoid]');
  await avoid.waitFor();
  assert.match(((await avoid.textContent()) || ''), /明确冲突解决前不要继续入缸/, 'Blocked result must state the hard stop explicitly.');

  const evidence = decision.locator('[data-result-ux-evidence]');
  await evidence.waitFor();
  assert.equal(await evidence.locator('details[open]').count(), 0, 'Compatibility reasoning and sources must be collapsed by default.');
  await evidence.getByText('为什么是这个结果？', { exact: true }).waitFor();

  const pairDetails = decision.locator('details[data-compatibility-pair-details]');
  await pairDetails.waitFor();
  assert.equal(await pairDetails.getAttribute('open'), null, 'Pair-by-pair report must be progressive disclosure, not first-screen clutter.');

  const sourceSummary = evidence.locator('summary').filter({ hasText: '信息来源' });
  assert.equal(await sourceSummary.count(), 1, 'Reviewed pair conflict should expose a source disclosure.');
  await sourceSummary.click();
  const sourceText = ((await evidence.textContent()) || '').replace(/\s+/g, ' ');
  assert.match(sourceText, /已核验/, 'Reviewed pair rule and citation must surface as 已核验.');

  const [heroBox, evidenceBox, drawerBox] = await Promise.all([
    heroTitle.boundingBox(),
    evidence.boundingBox(),
    drawer.boundingBox(),
  ]);
  assert.ok(heroBox && evidenceBox && heroBox.y < evidenceBox.y, 'Compatibility primary adjustment must appear before rule/source detail.');
  assert.ok(heroBox && heroBox.y < 900, 'Compatibility primary adjustment must be visible in the initial desktop viewport.');
  assert.ok(drawerBox && drawerBox.y <= 10 && drawerBox.height >= 760, 'Compatibility must remain a top-level full-height drawer.');

  await page.waitForFunction(() => {
    const calculatorNode = document.getElementById('compatibility-calculator');
    const browseSurface = calculatorNode?.previousElementSibling;
    return browseSurface instanceof HTMLElement
      && browseSurface.dataset.encyclopediaBrowseSurfaceHidden === 'true'
      && browseSurface.style.display === 'none';
  });

  await page.screenshot({ path: `${artifactDir}/blocked-pair-decision-first.png`, fullPage: true });

  assert.deepEqual(pageErrors, [], `Compatibility Result UX emitted page errors: ${pageErrors.join('; ')}`);
  console.log('Compatibility Result UX passed: reviewed blocked pair → explicit not-recommended verdict → safe adjustment first → no stocking control → collapsed pair/evidence detail → reviewed source status.');
  await context.close();
} finally {
  await browser.close();
}

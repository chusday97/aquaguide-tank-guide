import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const artifactDir = 'artifacts/result-ux-diagnosis';

const state = {
  version: 1,
  currentAquariumId: 'tank-gp004',
  aquariums: [{
    id: 'tank-gp004',
    name: '异常排查测试缸',
    fishes: [{
      id: 'stock-gp004',
      fishId: 'sp_0001',
      quantity: 6,
      entryDate: today,
      batches: [{
        id: 'batch-gp004',
        quantity: 6,
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

  await page.goto(`${baseUrl}/care?topic=guide_water_deteriorate`, { waitUntil: 'domcontentloaded' });

  const detail = page.locator('[data-care-workspace-detail]').filter({ hasText: '水质变差怎么办？' });
  await detail.waitFor();
  assert.equal(
    await page.locator('[role="dialog"]:visible').count(),
    0,
    'Long-form abnormal-care browsing must remain a workspace detail, not reopen the removed article Dialog.',
  );

  const firstScreen = detail.locator('[data-care-first-screen]');
  await firstScreen.waitFor();
  await firstScreen.getByText('先做快速评测', { exact: true }).waitFor();

  const start = detail.getByRole('button', { name: '开始快速检查', exact: true });
  await start.waitFor();
  await start.click();

  await detail.getByText('水体是否浑浊或有异味？', { exact: true }).waitFor();
  await detail.getByRole('button', { name: '明显', exact: true }).click();
  await detail.getByRole('button', { name: '大量换水', exact: true }).click();
  await detail.getByRole('button', { name: '有', exact: true }).click();

  const viewRecommendations = detail.getByRole('button', { name: '查看处理建议', exact: true });
  await viewRecommendations.waitFor();
  assert.equal(await viewRecommendations.isEnabled(), true, 'Quick Check must become actionable after the minimum required answers are complete.');
  await viewRecommendations.click();

  const result = detail.locator('[data-testid="care-diagnosis-decision"]');
  await result.waitFor();
  assert.equal(await result.getAttribute('data-result-ux'), 'decision', 'Diagnosis must use the shared decision-first Result UX surface.');

  const heroTitle = result.locator('h3').first();
  const heroTitleText = ((await heroTitle.textContent()) || '').trim();
  assert.match(
    heroTitleText,
    /(换水|过滤|残饵|水面|观察|水温|保持)/,
    'The strongest result heading must be a concrete first action, not a report heading or risk label.',
  );

  const resultText = ((await result.textContent()) || '').replace(/\s+/g, ' ');
  assert.match(resultText, /(中风险|高风险)/, 'Observed abnormal water conditions must retain an actionable non-low risk status.');
  assert.match(resultText, /现在先做/, 'Diagnosis hero must explicitly frame the primary decision/action first.');

  const actionStack = result.locator('[data-result-ux-actions]');
  await actionStack.waitFor();
  const followUpActions = actionStack.locator('li');
  const followUpCount = await followUpActions.count();
  assert.ok(followUpCount >= 1 && followUpCount <= 2, `Decision-first result must show 1-2 follow-up actions, got ${followUpCount}.`);

  const guardrails = result.locator('[data-result-ux-guardrails]');
  await guardrails.waitFor();
  await guardrails.getByText('接下来观察', { exact: true }).waitFor();
  await guardrails.getByText('出现这些情况就升级处理', { exact: true }).waitFor();

  const avoid = result.locator('[data-result-ux-avoid]');
  await avoid.waitFor();
  await avoid.getByText('暂时不要', { exact: true }).waitFor();

  const evidence = result.locator('[data-result-ux-evidence]');
  await evidence.waitFor();
  assert.ok(await evidence.locator('details').count() >= 1, 'Reasoning/evidence must remain available on demand.');
  assert.equal(await evidence.locator('details[open]').count(), 0, 'Reasoning and sources must be collapsed by default.');
  await evidence.getByText('为什么是这个结果？', { exact: true }).waitFor();

  const heroBox = await heroTitle.boundingBox();
  const evidenceBox = await evidence.boundingBox();
  assert.ok(heroBox && evidenceBox && heroBox.y < evidenceBox.y, 'Primary action must appear before reasoning/source detail in visual order.');
  assert.ok(heroBox && heroBox.y < 900, 'Primary action must be visible in the initial desktop result viewport.');

  const sourceSummary = evidence.locator('summary').filter({ hasText: '信息来源' });
  if (await sourceSummary.count()) {
    await sourceSummary.first().click();
    const sourceText = ((await evidence.textContent()) || '').replace(/\s+/g, ' ');
    assert.match(sourceText, /(已核验|待逐条核验)/, 'Visible source details must expose review status instead of implying authority from publisher name alone.');
  }

  await result.getByRole('button', { name: '设置复查时间', exact: true }).waitFor();
  await result.getByRole('button', { name: '重新检查', exact: true }).waitFor();

  await page.screenshot({ path: `${artifactDir}/gp004-diagnosis-result-ux-desktop.png`, fullPage: true });

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  assert.equal(
    (persisted.diagnosisRecords || []).filter(record => record.problemType === '巡检').length,
    0,
    'Care Quick Check must not masquerade as or complete the record-producing Daily Tank Check.',
  );
  assert.deepEqual(pageErrors, [], `GP-004 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-004 Result UX passed: abnormal care detail → Quick Check → decision-first primary action → max two follow-ups → watch/escalation guardrails → collapsed evidence → follow-up control.');
} finally {
  await browser.close();
}

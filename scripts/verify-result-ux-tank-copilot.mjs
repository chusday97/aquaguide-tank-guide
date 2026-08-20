import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const artifactDir = 'artifacts/result-ux-tank-copilot';
fs.mkdirSync(artifactDir, { recursive: true });

const state = {
  version: 1,
  currentAquariumId: 'copilot-result-ux-tank',
  aquariums: [{
    id: 'copilot-result-ux-tank',
    name: 'Copilot 验收缸',
    fishes: [],
    dimensions: { length: '60', width: '30', height: '35' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '水草泥',
    plants: ['莫丝'],
    hardscape: ['沉木'],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '水草灯' },
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

const modelGoalUnderstanding = '模型理解：你想做一个低维护的新手淡水缸。';
const modelPlanSummary = '先根据本地规则查看允许的候选，再决定是否进入模拟添加。';
const modelBoundaryProbe = '模型说明仅供辅助，不能覆盖本地兼容与风险规则。';

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);

  await page.route('**/api/ai/chat', async route => {
    const request = route.request();
    let payload = {};
    try {
      payload = request.postDataJSON() || {};
    } catch {
      payload = {};
    }

    if (payload?.task !== 'build_tank_copilot') {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Unexpected AI task in Tank Copilot Result UX fixture' }) });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        task: 'build_tank_copilot',
        data: {
          goalUnderstanding: modelGoalUnderstanding,
          missingQuestions: [],
          planSummary: modelPlanSummary,
          recommendedActions: [{ type: 'restart_goal', label: '模型试图自定义动作标签' }],
          selectedCandidateIds: [],
          blockedExplanation: [modelBoundaryProbe],
        },
      }),
    });
  });

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'networkidle' });

  const copilotEntry = page.locator('[data-quick-action-id="smartRecommend"]');
  await copilotEntry.waitFor({ state: 'attached' });
  if (!(await copilotEntry.isVisible())) {
    const moreActions = copilotEntry.locator('xpath=ancestor::details[1]');
    await moreActions.locator('summary').click();
  }
  await copilotEntry.waitFor({ state: 'visible' });
  await copilotEntry.click();
  await page.screenshot({ path: `${artifactDir}/after-live-entry-click.png`, fullPage: true });

  const copilotDialog = page.getByRole('dialog').filter({ hasText: 'AI 建缸助手' });
  await copilotDialog.waitFor({ state: 'visible', timeout: 10_000 });

  const goalInput = copilotDialog.getByPlaceholder('例如：新手小型淡水缸、低维护草缸、虾缸');
  await goalInput.fill('新手低维护淡水缸');
  await copilotDialog.getByRole('button', { name: '生成建缸方案' }).click();

  const decision = copilotDialog.locator('[data-testid="tank-copilot-decision"]');
  await decision.waitFor({ state: 'visible', timeout: 12_000 });

  const decisionText = await decision.innerText();
  assert.match(decisionText, /AI 辅助|AI 建议|AI-assisted|AI suggestion/i, 'Copilot result must visibly identify model output as AI assistance');
  assert.match(decisionText, /待逐条核验|Needs action-level review/i, 'model-originated Copilot content must remain candidate evidence, never Verified');
  assert.doesNotMatch(decisionText, /已核验|Verified/i, 'model-originated Copilot content must not render as Verified');

  const authorityBoundary = decision.locator('[data-tank-copilot-ai-boundary]');
  await authorityBoundary.waitFor();
  assert.match(
    await authorityBoundary.innerText(),
    /本地规则|系统规则|兼容|风险|local rules|deterministic/i,
    'Copilot must tell users that deterministic/local rules remain authoritative',
  );

  const primaryAction = decision.locator('[data-tank-copilot-primary-action]');
  assert.equal(await primaryAction.count(), 1, 'Copilot decision surface must expose exactly one primary action');

  const followUps = decision.locator('[data-result-ux-actions] li');
  assert.ok((await followUps.count()) <= 2, 'Copilot may promote at most two follow-up actions');

  const evidenceRoot = decision.locator('[data-result-ux-evidence]');
  const evidenceDetails = evidenceRoot.locator('details');
  assert.ok((await evidenceDetails.count()) >= 1, 'Copilot explanation must be available behind progressive disclosure');
  const openEvidence = await evidenceDetails.evaluateAll(nodes => nodes.filter(node => node.hasAttribute('open')).length);
  assert.equal(openEvidence, 0, 'Copilot explanation/evidence must start collapsed');
  const evidenceText = await evidenceRoot.textContent();
  assert.ok(evidenceText?.includes(modelGoalUnderstanding), 'model goal interpretation must remain available inside shared secondary evidence');
  assert.ok(evidenceText?.includes(modelPlanSummary), 'model plan summary must remain available inside shared secondary evidence');

  const alternativePlan = copilotDialog.locator('details[data-disclosure-purpose="alternative_plan"]');
  await alternativePlan.waitFor();
  assert.equal(await alternativePlan.evaluate(node => node.hasAttribute('open')), false, 'model blocked explanation must start collapsed');
  const alternativeText = await alternativePlan.textContent();
  assert.ok(alternativeText?.includes(modelBoundaryProbe), 'model blocked explanation must remain inspectable behind disclosure');

  assert.deepEqual(pageErrors, [], `Tank Copilot Result UX emitted page errors: ${pageErrors.join(' | ')}`);
  await page.screenshot({ path: `${artifactDir}/decision-first-ai-boundary.png`, fullPage: true });

  console.log('Tank Copilot Result UX passed: live entry → local-rule-owned primary action → model context as candidate evidence → collapsed explanations → explicit AI/local-rule authority boundary.');
  await context.close();
} finally {
  await browser.close();
}

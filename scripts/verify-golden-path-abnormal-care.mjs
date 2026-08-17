import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();

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

  const dialog = page.getByRole('dialog').filter({ hasText: '水质变差怎么办？' });
  await dialog.waitFor();

  const firstScreen = dialog.locator('[data-care-first-screen]');
  await firstScreen.waitFor();
  await firstScreen.getByText('先做快速评测', { exact: true }).waitFor();

  const start = dialog.getByRole('button', { name: '开始快速检查', exact: true });
  await start.waitFor();
  await start.click();

  await dialog.getByText('水体是否浑浊或有异味？', { exact: true }).waitFor();
  await dialog.getByRole('button', { name: '明显', exact: true }).click();
  await dialog.getByRole('button', { name: '大量换水', exact: true }).click();
  await dialog.getByRole('button', { name: '有', exact: true }).click();

  const viewRecommendations = dialog.getByRole('button', { name: '查看处理建议', exact: true });
  await viewRecommendations.waitFor();
  assert.equal(await viewRecommendations.isEnabled(), true, 'Quick Check must become actionable after the minimum required answers are complete.');
  await viewRecommendations.click();

  const result = dialog.locator('[data-care-assessment-result]');
  await result.waitFor();
  await result.getByText('检查完成', { exact: true }).waitFor();

  const riskLabel = (await result.locator('h3').first().textContent()) || '';
  assert.match(riskLabel, /^(中风险|高风险)$/, 'Observed abnormal water conditions must produce an actionable non-low risk result.');

  const next = result.locator('[data-care-assessment-next]');
  await next.waitFor();
  await next.getByText('现在按顺序做', { exact: true }).waitFor();
  const actions = next.locator('[data-care-action-text]');
  assert.ok(await actions.count() >= 1, 'Assessment result must expose at least one immediate action on the first result screen.');
  const actionText = ((await actions.allTextContents()).join(' ')).trim();
  assert.match(actionText, /(换水|过滤|残饵|水温|观察)/, 'Immediate actions must contain concrete handling guidance, not a vague completion state.');

  await result.getByText('暂时不要', { exact: true }).waitFor();
  await result.getByText('处理后复查', { exact: true }).waitFor();
  await result.getByRole('button', { name: '设置复查时间', exact: true }).waitFor();

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  assert.equal(
    (persisted.diagnosisRecords || []).filter(record => record.problemType === '巡检').length,
    0,
    'Care Quick Check must not masquerade as or complete the record-producing Daily Tank Check.',
  );
  assert.deepEqual(pageErrors, [], `GP-004 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-004 continuous E2E passed: abnormal care guide → Quick Check → minimum answers → actionable risk result → immediate steps and recheck guidance.');
} finally {
  await browser.close();
}

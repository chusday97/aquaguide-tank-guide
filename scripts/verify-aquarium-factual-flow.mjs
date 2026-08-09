import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });
const emptyState = {
  version: 1,
  currentAquariumId: '',
  aquariums: [],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'skipped', viewedSpecies: false, taskCardDismissed: false },
  updatedAt: new Date().toISOString(),
};

const readState = page => page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(state => {
    localStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, emptyState);
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  const createButton = page.getByRole('button', { name: '创建第一个鱼缸' });
  await createButton.waitFor();
  assert.ok(await createButton.isVisible(), 'empty state must be real and actionable');
  await createButton.click();
  await page.getByText('记录已有生物', { exact: true }).first().waitFor();
  console.log('✓ empty aquarium created without synthetic setup facts');

  const createdState = await readState(page);
  const created = createdState.aquariums[0];
  assert.ok(created?.id, 'create must persist the repository result');
  for (const field of ['dimensions', 'waterType', 'targetTemperature', 'equipment', 'lastWaterChangeDate']) {
    assert.equal(created[field], undefined, `${field} must remain unknown`);
  }
  const createdBody = await page.locator('body').innerText();
  assert.equal(createdBody.includes('25°C'), false, 'unknown target temperature must not render as 25°C');
  assert.equal(createdBody.includes('82L'), false, 'unknown dimensions must not render a default volume');

  await page.goto(`${baseUrl}/aquarium?action=plan-species`, { waitUntil: 'domcontentloaded' });
  const planningDialog = page.getByRole('dialog');
  await planningDialog.getByText('规划想养的生物', { exact: true }).waitFor();
  await planningDialog.locator('section').first().getByRole('button').first().click();
  await planningDialog.getByRole('button', { name: '查看规划判断' }).click();
  assert.equal((await readState(page)).aquariums[0].fishes.length, 0, 'planning assessment must not write livestock');
  console.log('✓ planning assessment left real livestock unchanged');

  await planningDialog.getByRole('button', { name: '已经在缸里了，记录实际情况' }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}').aquariums?.[0]?.fishes?.length === 1);
  assert.ok(await planningDialog.getByText('已记录', { exact: true }).isVisible(), 'recording reality must show an explicit saved state');
  console.log('✓ explicit reality confirmation persisted livestock');

  await planningDialog.getByRole('button', { name: '继续记录其他生物' }).click();
  await page.goto(`${baseUrl}/aquarium?action=add-species`, { waitUntil: 'domcontentloaded' });
  const legacyPlanTitle = page.getByRole('dialog').getByText('规划想养的生物', { exact: true });
  await legacyPlanTitle.waitFor();
  assert.ok(await legacyPlanTitle.isVisible(), 'legacy add-species must map to planning');
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'mobile factual flow must not overflow');

  console.log('aquarium factual flow verified: empty facts, plan-only assessment, explicit reality recording and legacy deep link');
} finally {
  await browser.close();
}

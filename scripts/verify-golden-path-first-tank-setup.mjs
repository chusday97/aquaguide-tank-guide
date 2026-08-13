import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const readState = page => page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));

try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  // GP-001 milestone 1: a genuinely new user starts from welcome.
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/welcome');
  const startButton = page.getByRole('button', { name: '开始' }).first();
  await startButton.waitFor();
  await startButton.click();

  // Milestones 2-3: create and enter one real aquarium. Creation itself must not invent facts.
  await page.waitForURL('**/aquarium');
  await page.getByText(/已新建/).waitFor();
  const createdState = await readState(page);
  assert.equal(createdState.aquariums?.length, 1, 'first-use path must create exactly one aquarium');
  const created = createdState.aquariums[0];
  assert.ok(created?.id, 'created aquarium must persist with a real id');
  assert.equal(createdState.currentAquariumId, created.id, 'new aquarium must become the active aquarium');
  for (const field of ['dimensions', 'waterType', 'targetTemperature', 'equipment']) {
    assert.equal(created[field], undefined, `${field} must remain unknown immediately after creation`);
  }
  const bodyBeforeSetup = await page.locator('body').innerText();
  assert.equal(bodyBeforeSetup.includes('25°C'), false, 'creation must not invent a 25°C target');
  assert.equal(bodyBeforeSetup.includes('82L'), false, 'creation must not invent a tank volume');

  // Milestone 4: the onboarding task itself must take the user into the exact setup task.
  const onboarding = page.locator('.aquarium-onboarding').first();
  await onboarding.waitFor();
  const nextTaskButton = onboarding.locator('button:not([aria-label])').first();
  await nextTaskButton.waitFor();
  await nextTaskButton.click();
  const settingsDialog = page.getByRole('dialog').filter({ hasText: '鱼缸设置' });
  await settingsDialog.waitFor();
  await settingsDialog.getByText('常用尺寸预设', { exact: true }).waitFor();

  // Milestone 5: explicitly record required facts. No implicit/default value is accepted as evidence.
  await settingsDialog.getByRole('button', { name: '60×30×35 · 63L', exact: true }).click();

  const parametersButton = settingsDialog.getByRole('button', { name: /参数/ }).first();
  await parametersButton.click();
  await settingsDialog.getByText('目标温度 (°C)', { exact: true }).waitFor();
  await settingsDialog.getByRole('button', { name: /淡水/ }).last().click();
  await settingsDialog.getByRole('button', { name: /^25(?:°C)?$/ }).click();

  const equipmentButton = settingsDialog.getByRole('button', { name: /设备/ }).first();
  await equipmentButton.click();
  await settingsDialog.getByRole('button', { name: '瀑布过滤', exact: true }).click();

  // Saving is not considered successful until persisted product state contains the explicit facts.
  await settingsDialog.getByRole('button', { name: '保存设置', exact: true }).click();
  await settingsDialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(expectedId => {
    const stored = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
    const tank = stored.aquariums?.find(item => item.id === expectedId);
    return tank?.dimensions?.length === '60'
      && tank?.dimensions?.width === '30'
      && tank?.dimensions?.height === '35'
      && tank?.waterType === 'Freshwater'
      && tank?.targetTemperature === '25'
      && tank?.equipment?.filter === '瀑布过滤'
      && stored.onboarding?.aquariumConfigured === true;
  }, created.id);

  const savedState = await readState(page);
  const saved = savedState.aquariums.find(item => item.id === created.id);
  assert.deepEqual(saved.dimensions, { length: '60', width: '30', height: '35' });
  assert.equal(saved.waterType, 'Freshwater');
  assert.equal(saved.targetTemperature, '25');
  assert.equal(saved.equipment?.filter, '瀑布过滤');
  assert.equal(savedState.onboarding?.aquariumConfigured, true, 'successful setup must advance onboarding aquariumConfigured');

  // Milestone 6: remain in the real aquarium with the setup task completed and the next task exposed.
  assert.equal(new URL(page.url()).pathname, '/aquarium', 'saving setup must return to the aquarium workspace');
  await onboarding.getByText('1 / 4', { exact: true }).waitFor();
  const bodyAfterSetup = await page.locator('body').innerText();
  assert.match(bodyAfterSetup, /60x30x35cm|60×30×35/, 'saved dimensions must be visible in the aquarium workspace');
  assert.match(bodyAfterSetup, /淡水/, 'saved water type must be visible in the aquarium workspace');
  assert.match(bodyAfterSetup, /25°C|25℃/, 'saved target temperature must be visible in the aquarium workspace');
  assert.equal(bodyAfterSetup.includes('完善鱼缸配置'), false, 'completed basic setup must not remain the primary setup action');
  assert.deepEqual(pageErrors, [], `GP-001 must not emit page errors: ${pageErrors.join('; ')}`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'GP-001 mobile path must not overflow horizontally');

  console.log('GP-001 continuous E2E passed: welcome → create real aquarium → setup task → explicit dimensions/water/temp/filter → persisted state → next onboarding step.');
} finally {
  await browser.close();
}

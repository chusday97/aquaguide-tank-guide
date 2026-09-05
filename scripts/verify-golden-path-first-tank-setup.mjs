import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(30_000);
  page.setDefaultNavigationTimeout(30_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();

  await page.waitForFunction(() => {
    const raw = localStorage.getItem('aquarium_app_state_v1');
    if (!raw) return false;
    try {
      const state = JSON.parse(raw);
      return state.aquariums?.length === 1 && state.currentAquariumId;
    } catch {
      return false;
    }
  });

  const draftState = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  assert.equal(draftState.aquariums.length, 1, 'onboarding build goal must create exactly one real aquarium');
  assert.equal(draftState.onboarding?.goal, 'build_tank', 'build-tank onboarding goal must persist');
  assert.equal(draftState.onboarding?.aquariumConfigured ?? false, false, 'creating the draft must not fake setup completion');
  assert.equal(draftState.aquariums[0].dimensions, undefined, 'new aquarium dimensions must remain unknown before user input');
  assert.equal(draftState.aquariums[0].waterType, undefined, 'new aquarium water type must remain unknown before user input');
  assert.equal(draftState.aquariums[0].targetTemperature, undefined, 'new aquarium target temperature must remain unknown before user input');

  const onboarding = page.locator('.aquarium-onboarding').first();
  await onboarding.waitFor();
  const setupTask = onboarding.getByRole('button', { name: /建立或完善鱼缸/ });
  await setupTask.waitFor();
  await setupTask.click();

  const settingsDialog = page.getByRole('dialog').filter({ hasText: '鱼缸设置' });
  await settingsDialog.waitFor();

  // action=setup must land on the size task first.
  const initialNumberInputs = settingsDialog.locator('input[type="number"]');
  await initialNumberInputs.first().waitFor();
  assert.ok(await initialNumberInputs.count() >= 3, 'setup task must expose the three required dimension inputs');
  await initialNumberInputs.nth(0).fill('60');
  await initialNumberInputs.nth(1).fill('30');
  await initialNumberInputs.nth(2).fill('30');

  // Move to water parameters using the product's own settings navigation.
  await settingsDialog.getByText('参数', { exact: true }).first().click();
  await settingsDialog.getByText('淡水', { exact: true }).last().click();
  const parameterInputs = settingsDialog.locator('input[type="number"]');
  const parameterInputCount = await parameterInputs.count();
  assert.ok(parameterInputCount >= 1, 'parameter task must expose target-temperature input');
  await parameterInputs.last().fill('25');

  // Save through the real UI; onboarding completion is allowed only after persistence.
  await settingsDialog.getByRole('button', { name: '保存设置', exact: true }).click();
  await settingsDialog.waitFor({ state: 'detached' });

  await page.waitForFunction(() => {
    const raw = localStorage.getItem('aquarium_app_state_v1');
    if (!raw) return false;
    try {
      const state = JSON.parse(raw);
      const tank = state.aquariums?.[0];
      return state.onboarding?.aquariumConfigured === true
        && tank?.dimensions?.length === '60'
        && tank?.dimensions?.width === '30'
        && tank?.dimensions?.height === '30'
        && tank?.waterType === 'Freshwater'
        && tank?.targetTemperature === '25';
    } catch {
      return false;
    }
  });

  const completedSetupState = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  const savedTank = completedSetupState.aquariums[0];
  assert.equal(completedSetupState.onboarding.aquariumConfigured, true, 'successful settings save must mark the aquarium setup task complete');
  assert.deepEqual(savedTank.dimensions, { length: '60', width: '30', height: '30' });
  assert.equal(savedTank.waterType, 'Freshwater');
  assert.equal(savedTank.targetTemperature, '25');
  assert.equal(new URL(page.url()).pathname, '/aquarium', 'setup flow must return to the real aquarium context');

  const updatedOnboarding = page.locator('.aquarium-onboarding').first();
  await updatedOnboarding.waitFor();
  assert.equal(await updatedOnboarding.getByRole('button', { name: /建立或完善鱼缸/ }).count(), 0, 'after setup save, onboarding must advance past the aquarium setup task');
  assert.deepEqual(pageErrors, [], `GP-001 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-001 continuous E2E passed: welcome → build goal → real unknown draft → setup task → dimensions/water/temperature → save → onboarding advances.');
} finally {
  await browser.close();
}

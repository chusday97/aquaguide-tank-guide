import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

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
    localStorage.removeItem('aquarium_app_state_v1');
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  // Milestone 1: a genuinely new user starts from Welcome.
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/welcome');
  await page.getByRole('button').filter({ hasText: '开始' }).first().click();

  // Milestones 2–3: create a real empty aquarium and land in it.
  await page.waitForURL('**/aquarium?action=create&source=onboarding');
  await page.waitForURL('**/aquarium');
  await page.getByText(/已新建/).waitFor();

  let stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  assert.equal(stored.aquariums?.length, 1, 'first-use create must persist exactly one aquarium');
  const createdId = stored.currentAquariumId || stored.aquariums?.[0]?.id;
  let tank = stored.aquariums?.find(item => item.id === createdId) || stored.aquariums?.[0];
  assert.ok(tank, 'created aquarium must exist in persisted state');
  assert.equal(tank.dimensions, undefined, 'new aquarium must not invent dimensions');
  assert.equal(tank.waterType, undefined, 'new aquarium must not invent water type');
  assert.equal(tank.targetTemperature, undefined, 'new aquarium must not invent target temperature');
  assert.equal(tank.equipment, undefined, 'new aquarium must not invent filter/light/heater equipment');
  assert.equal(stored.onboarding?.aquariumConfigured, false, 'creating an empty tank is not the same as configuring it');

  // Milestone 4: task CTA opens the real setup task, not the aquarium home.
  const setupTask = page.getByRole('button', { name: /建立或完善鱼缸/ }).first();
  await setupTask.waitFor();
  await setupTask.click();
  const surface = page.locator('[role="dialog"][data-surface="task-flow-mobile"]:visible');
  await surface.waitFor();
  await surface.getByText('鱼缸设置', { exact: true }).waitFor();

  // Missing-context state: saving an untouched draft must NOT complete onboarding or close the task.
  await surface.getByRole('button', { name: '保存设置' }).click();
  await page.waitForTimeout(350);
  assert.equal(await surface.isVisible(), true, 'incomplete setup must remain open after save attempt');
  stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  tank = stored.aquariums?.find(item => item.id === createdId) || stored.aquariums?.[0];
  assert.equal(stored.onboarding?.aquariumConfigured, false, 'incomplete setup must not mark onboarding aquariumConfigured');
  assert.equal(tank?.dimensions, undefined, 'failed incomplete-save guard must not write dimensions');
  assert.equal(tank?.waterType, undefined, 'failed incomplete-save guard must not write water type');
  assert.equal(tank?.targetTemperature, undefined, 'failed incomplete-save guard must not write temperature');
  assert.equal(tank?.equipment, undefined, 'failed incomplete-save guard must not write equipment');

  // Milestone 5: explicitly provide every required fact. No defaults are accepted as user answers.
  await surface.getByRole('button', { name: /60×30×35.*63L/ }).first().click();

  const parametersSection = surface.getByRole('button', { name: /参数.*水体未记录.*目标温度未记录/ }).first();
  await parametersSection.click();
  await surface.getByRole('button', { name: /淡水.*常见观赏鱼/ }).first().click();
  await surface.getByRole('button', { name: '24°C', exact: true }).click();

  const equipmentSection = surface.getByRole('button', { name: /设备.*未选择过滤或辅助设备/ }).first();
  await equipmentSection.click();
  await surface.getByRole('button', { name: '瀑布过滤', exact: true }).click();

  // Save the explicit facts and return to the aquarium.
  await surface.getByRole('button', { name: '保存设置' }).click();
  await surface.waitFor({ state: 'hidden' });
  await page.waitForURL(url => url.pathname === '/aquarium' && !url.searchParams.get('action'));

  stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}'));
  tank = stored.aquariums?.find(item => item.id === createdId) || stored.aquariums?.[0];
  assert.ok(tank, 'configured aquarium must still exist after save');
  assert.deepEqual(tank.dimensions, { length: '60', width: '30', height: '35' }, '63L preset must persist the exact user-selected dimensions');
  assert.equal(tank.waterType, 'Freshwater', 'explicit freshwater selection must persist');
  assert.equal(tank.targetTemperature, '24', 'explicit 24°C target must persist');
  assert.equal(tank.equipment?.filter, '瀑布过滤', 'explicit filter selection must persist');
  assert.equal(tank.equipment?.light, undefined, 'untouched lighting must not be silently defaulted');
  assert.equal(tank.equipment?.heater, undefined, 'untouched heater must not be silently enabled');
  assert.equal(tank.equipment?.oxygen, undefined, 'untouched aeration must not be silently enabled');
  assert.equal(stored.onboarding?.aquariumConfigured, true, 'only the completed required setup may finish the aquarium onboarding task');

  // Milestone 6: after setup, the next onboarding task becomes the concrete species action.
  const nextTask = page.getByRole('button', { name: /收藏或加入一个物种/ }).first();
  await nextTask.waitFor();
  assert.ok(await nextTask.isVisible(), 'configured tank must expose the next concrete onboarding task');
  assert.deepEqual(pageErrors, [], `GP-001 must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('GP-001 continuous E2E passed: welcome → real empty tank → incomplete-save guard → explicit 63L/freshwater/24°C/filter setup → persisted facts → next task.');
} finally {
  await browser.close();
}

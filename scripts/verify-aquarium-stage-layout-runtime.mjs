import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1,
  currentAquariumId: 'tank-stage',
  aquariums: [{
    id: 'tank-stage', name: 'Stage Regression Aquarium',
    fishes: [{ id: 'stock-1', fishId: 'sp_0001', quantity: 6, entryDate: today, lastWaterChangeDate: today }],
    lastWaterChangeDate: today, waterChangeHistory: [today],
    dimensions: { length: '60', width: '40', height: '40' }, waterType: 'Freshwater', targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' }, plants: [], hardscape: [],
  }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const seed = async page => page.addInitScript(saved => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
}, state);

const within = (inner, outer, tolerance = 3) => (
  inner.x >= outer.x - tolerance
  && inner.y >= outer.y - tolerance
  && inner.x + inner.width <= outer.x + outer.width + tolerance
  && inner.y + inner.height <= outer.y + outer.height + tolerance
);

async function verifyImmersiveStage(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
  await seed(page);
  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const stage = page.locator('.aquarium-dashboard-tank');
  const tank = page.locator('#aquarium-tank');
  const rail = page.locator('.aquarium-dashboard-rail');
  const dock = page.locator('.aquarium-dashboard-actions');
  const speciesEntry = page.locator('[data-tank-species-entry]');
  await stage.waitFor({ state: 'visible' });
  await tank.waitFor({ state: 'visible' });
  await rail.waitFor({ state: 'visible' });
  await dock.waitFor({ state: 'visible' });
  await speciesEntry.waitFor({ state: 'visible' });

  const [stageBox, tankBox, railBox, dockBox, speciesBox] = await Promise.all([
    stage.boundingBox(), tank.boundingBox(), rail.boundingBox(), dock.boundingBox(), speciesEntry.boundingBox(),
  ]);
  assert.ok(stageBox && tankBox && railBox && dockBox && speciesBox, `${width}px stage elements must have geometry`);

  assert.ok(stageBox.width >= width * 0.70, `${width}px aquarium stage must consume most of the available workspace`);
  assert.ok(tankBox.width >= stageBox.width - 4, `${width}px visual tank must fill stage width instead of being squeezed by a side column`);
  assert.ok(tankBox.height >= stageBox.height - 4, `${width}px visual tank must fill stage height`);
  assert.equal(await rail.evaluate(node => getComputedStyle(node).position), 'absolute', `${width}px today's action must overlay the stage`);
  assert.equal(await dock.evaluate(node => getComputedStyle(node).position), 'absolute', `${width}px quick actions must overlay the stage`);
  assert.ok(within(railBox, stageBox), `${width}px today's action must stay inside stage bounds`);
  assert.ok(within(dockBox, stageBox), `${width}px quick-action dock must stay inside stage bounds`);
  assert.ok(within(speciesBox, stageBox), `${width}px livestock entry must stay inside stage bounds`);
  assert.ok(stageBox.y + stageBox.height - (dockBox.y + dockBox.height) <= 40, `${width}px quick-action dock must stay anchored near the stage bottom`);

  const outerHeader = page.locator('.aquarium-dashboard > .aquarium-zone-header').first();
  assert.equal(await outerHeader.evaluate(node => getComputedStyle(node).display), 'none', `${width}px must not keep a duplicate observe header above immersive stage`);
  const dockHeader = dock.locator(':scope > .aquarium-zone-header').first();
  assert.equal(await dockHeader.evaluate(node => getComputedStyle(node).display), 'none', `${width}px dock must not keep a second management header`);

  const three = tank.locator('[data-three-aquarium]');
  if (await three.count()) {
    const threeBox = await three.boundingBox();
    if (threeBox) assert.ok(threeBox.width >= tankBox.width * 0.95, `${width}px ThreeAquarium must fill the visual tank width`);
  }

  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px must not overflow horizontally`);
  await page.close();
}

try {
  for (const width of [1440, 1280, 1024]) await verifyImmersiveStage(width);

  for (const width of [768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
    await seed(page);
    await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
    await page.locator('.aquarium-dashboard-tank').waitFor({ state: 'visible' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px must not overflow horizontally`);
    const stageBox = await page.locator('.aquarium-dashboard-tank').boundingBox();
    const tankBox = await page.locator('#aquarium-tank').boundingBox();
    assert.ok(stageBox && tankBox && tankBox.width >= stageBox.width - 4, `${width}px visual tank must remain full-width in its responsive container`);
    await page.close();
  }

  console.log('Aquarium immersive stage runtime geometry: PASS');
} finally {
  await browser.close();
}

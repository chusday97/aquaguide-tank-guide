import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const artifactDir = path.resolve('artifacts/layout-recovery-v1');
fs.mkdirSync(artifactDir, { recursive: true });

const appState = {
  version: 1,
  currentAquariumId: 'layout-recovery-tank',
  aquariums: [{
    id: 'layout-recovery-tank',
    name: 'Layout Recovery Tank',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: '2026-07-20T00:00:00.000Z',
      batches: [{
        id: 'batch-1',
        quantity: 4,
        entryDate: '2026-07-20T00:00:00.000Z',
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: '2026-07-20T00:00:00.000Z',
      }],
    }],
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
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
    viewedSpecies: true,
    taskCardDismissed: true,
    aquariumConfigured: true,
  },
  updatedAt: '2026-08-20T00:00:00.000Z',
};

const seedState = async context => {
  await context.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, appState);
};

const browser = await chromium.launch({ headless: true });

try {
  // Exact Atlas/Search deep-link path: a visible dialog must contain the complete species layout.
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
    await seedState(context);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    await page.goto(`${baseUrl}/encyclopedia?species=sp_0001&source=search`, { waitUntil: 'domcontentloaded' });
    const detail = page.locator('[role="dialog"][data-detail-kind="species"]:visible');
    await detail.waitFor({ state: 'visible', timeout: 15_000 });
    const layout = detail.locator('[data-species-detail-layout="single-screen-profile"]');
    await layout.waitFor({ state: 'visible', timeout: 10_000 });
    const box = await layout.boundingBox();
    assert.ok(box && box.width > 320 && box.height > 300, `Atlas full species detail rendered blank or collapsed: ${JSON.stringify(box)}`);
    assert.ok((await detail.innerText()).trim().length > 80, 'Atlas full species detail must contain meaningful content, not an empty drawer.');
    assert.deepEqual(pageErrors, [], `Atlas detail emitted page errors: ${pageErrors.join(' | ')}`);
    await page.screenshot({ path: path.join(artifactDir, 'species-detail-atlas-desktop.png'), fullPage: true });
    await context.close();
  }

  // Desktop Care should use the actual workspace instead of a legacy 960/850px nested corridor.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' });
    await seedState(context);
    const page = await context.newPage();
    await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'domcontentloaded' });
    const shell = page.locator('.care-workspace-shell');
    await shell.waitFor({ state: 'visible', timeout: 15_000 });
    const shellBox = await shell.boundingBox();
    assert.ok(shellBox && shellBox.width >= 1040, `Care workspace is still squeezed by the legacy page-frame width: ${JSON.stringify(shellBox)}`);

    const detail = page.locator('[data-care-workspace-detail]');
    await detail.waitFor({ state: 'visible', timeout: 10_000 });
    const firstScreen = detail.locator('[data-care-first-screen]').first();
    await firstScreen.waitFor({ state: 'visible', timeout: 10_000 });
    const firstScreenBox = await firstScreen.boundingBox();
    assert.ok(firstScreenBox && firstScreenBox.width >= 940, `Care guide content remains too narrow inside the desktop workspace: ${JSON.stringify(firstScreenBox)}`);
    await page.screenshot({ path: path.join(artifactDir, 'care-guide-wide-desktop.png'), fullPage: true });
    await context.close();
  }

  // Restore the prior aquarium-home hierarchy on desktop: context belongs in/after the hero,
  // not below the recurring management block. Phone remains task-first separately.
  {
    const context = await browser.newContext({ viewport: { width: 768, height: 900 }, locale: 'zh-CN' });
    await seedState(context);
    const page = await context.newPage();
    await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-aquarium-dashboard-v2]').waitFor({ state: 'visible', timeout: 15_000 });
    const geometry = await page.evaluate(() => {
      const rect = selector => {
        const node = document.querySelector(selector);
        if (!(node instanceof HTMLElement)) return null;
        const box = node.getBoundingClientRect();
        return { top: Math.round(box.top), left: Math.round(box.left), width: Math.round(box.width), height: Math.round(box.height) };
      };
      return {
        today: rect('[data-dashboard-priority="today"]'),
        context: rect('[data-dashboard-priority="context"]'),
        manage: rect('#aquarium-manage-zone'),
      };
    });
    assert.ok(geometry.today && geometry.context && geometry.manage, 'Aquarium dashboard priority surfaces are missing.');
    const contextBesideToday = Math.abs(geometry.context.top - geometry.today.top) <= 40 && geometry.context.left > geometry.today.left;
    const contextBeforeManage = geometry.context.top < geometry.manage.top;
    assert.ok(
      contextBesideToday || contextBeforeManage,
      `Desktop Aquarium context was pushed below management instead of preserving the prior home hero: ${JSON.stringify(geometry)}`,
    );
    await page.screenshot({ path: path.join(artifactDir, 'aquarium-prior-home-768.png'), fullPage: true });
    await context.close();
  }

  console.log('Layout Recovery V1 PASS: nonblank Atlas species detail + wider Care guide + prior Aquarium home hierarchy');
} finally {
  await browser.close();
}

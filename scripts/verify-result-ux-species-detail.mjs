import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const artifactDir = path.resolve('artifacts/result-ux-species-detail');
fs.mkdirSync(artifactDir, { recursive: true });

const aquariumState = {
  version: 1,
  currentAquariumId: 'species-result-tank',
  aquariums: [{
    id: 'species-result-tank',
    name: 'Species Result UX Tank',
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

const getWorkspaceScrollTop = page => page.locator('.desktop-workspace-scroll').evaluate(element => element.scrollTop);

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await context.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, aquariumState);

  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  page.setDefaultNavigationTimeout(45_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const archiveSource = page.locator('#aquarium-records');
  await archiveSource.waitFor();
  await archiveSource.evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(120);
  const archiveScrollTop = await getWorkspaceScrollTop(page);
  await archiveSource.locator(':scope > button').click();

  const roster = page
    .locator('[role="dialog"][data-surface="right-drawer"]:not([data-detail-kind])')
    .filter({ hasText: '缸内物种' })
    .first();
  await roster.waitFor({ state: 'visible' });
  assert.notEqual(await roster.getAttribute('data-open'), null, 'livestock roster must be open before Species Detail');

  const profileButton = roster.locator('[data-livestock-record-id="stock-1"] button:has(img)').first();
  assert.equal(await profileButton.count(), 1, 'stock-1 must expose one species profile opener');
  await profileButton.click();

  const detail = page.locator('[role="dialog"][data-detail-kind="species"]:visible');
  await detail.waitFor();
  await roster.waitFor({ state: 'hidden' });

  assert.equal(await detail.locator('[data-species-detail-edit-tank-record]').count(), 1, 'Aquarium-owned Species Detail must preserve the tank-record edit action');

  const decision = detail.locator('[data-testid="species-detail-decision"]');
  await decision.waitFor({ state: 'visible', timeout: 10_000 });
  assert.equal(await decision.getAttribute('data-result-ux'), 'decision', 'Species Detail must use the shared DecisionResultSurface');

  const speciesName = (await detail.locator('[data-species-detail-hero]').getAttribute('aria-label')) || '';
  const decisionTitle = (await decision.locator('h3').innerText()).trim();
  assert.ok(decisionTitle.length > 0, 'Species Detail decision hero must have a non-empty conclusion');
  assert.ok(!speciesName.endsWith(decisionTitle), 'decision hero must answer tank fit, not merely repeat the species name');

  const followUps = decision.locator('[data-result-ux-actions] li');
  assert.ok(await followUps.count() <= 2, 'Species Detail must expose at most two Result UX follow-up actions');

  const evidence = decision.locator('[data-result-ux-evidence] details');
  for (let i = 0; i < await evidence.count(); i += 1) {
    assert.equal(await evidence.nth(i).getAttribute('open'), null, 'Species Detail Result UX evidence must start collapsed');
  }

  const whyDisclosure = detail.locator('[data-disclosure-purpose="secondary_evidence"]').first();
  assert.equal(await whyDisclosure.getAttribute('aria-expanded'), 'false', 'existing Species Detail evidence disclosure must remain collapsed initially');

  const [detailBox, decisionBox] = await Promise.all([detail.boundingBox(), decision.boundingBox()]);
  assert.ok(detailBox && decisionBox, 'Species Detail and decision surface must have visible bounds');
  assert.ok(decisionBox.y < detailBox.y + detailBox.height, 'Species Detail decision surface must begin in the initial desktop dialog viewport');

  await page.screenshot({ path: path.join(artifactDir, 'species-detail-decision-first-desktop.png'), fullPage: true });

  // PUI-BC-052: closing the child Species Detail must restore the exact parent roster context.
  await page.keyboard.press('Escape');
  await detail.waitFor({ state: 'hidden' });
  await roster.waitFor({ state: 'visible' });
  assert.notEqual(await roster.getAttribute('data-open'), null, 'closing Species Detail must reopen the originating livestock roster');
  await page.waitForFunction(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLButtonElement)) return false;
    const row = active.closest('[data-livestock-record-id]');
    return row instanceof HTMLElement
      && row.dataset.livestockRecordId === 'stock-1'
      && Boolean(active.querySelector('img'));
  });

  const restoredScrollTop = await getWorkspaceScrollTop(page);
  assert.ok(
    Math.abs(restoredScrollTop - archiveScrollTop) <= 96,
    `Species Detail return must preserve Aquarium workspace scroll; before=${archiveScrollTop}, after=${restoredScrollTop}`,
  );
  assert.deepEqual(pageErrors, [], `Species Detail Result UX flow emitted page errors: ${pageErrors.join(' | ')}`);

  console.log('Species Detail Result UX PASS: decision-first tank-fit surface + collapsed evidence + tank-record action + exact parent-roster focus/scroll return');
  await context.close();
} finally {
  await browser.close();
}

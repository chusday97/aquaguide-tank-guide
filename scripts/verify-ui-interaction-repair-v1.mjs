import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const outputDir = 'output/ui-interaction-repair-v1';
fs.mkdirSync(outputDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const aquariumState = {
  version: 1,
  currentAquariumId: 'tank-ui100',
  aquariums: [{
    id: 'tank-ui100',
    name: 'UI 回归测试缸',
    fishes: [{
      id: 'stock-ui100',
      fishId: 'sp_0001',
      quantity: 6,
      entryDate: today,
      batches: [{
        id: 'batch-ui100',
        quantity: 6,
        entryDate: today,
        lifeStage: 'unknown',
        reproductiveState: 'unknown',
        stateUpdatedAt: now,
      }],
    }],
    lastWaterChangeDate: today,
    waterChangeHistory: [today],
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
  const makePage = async (viewport) => {
    const page = await browser.newPage({ viewport, locale: 'zh-CN' });
    page.setDefaultTimeout(12_000);
    page.setDefaultNavigationTimeout(20_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(saved => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    }, aquariumState);
    return { page, errors };
  };

  // 0) Opening a species detail is read-only. Browsing must never pre-commit a compatibility decision.
  {
    const { page, errors } = await makePage({ width: 1280, height: 900 });
    await page.addInitScript(() => {
      sessionStorage.setItem('aquaguide_compatibility_selection', JSON.stringify([]));
    });
    await page.goto(`${baseUrl}/encyclopedia?mode=browse&species=sp_0002&source=atlas-detail`, { waitUntil: 'domcontentloaded' });
    const detail = page.locator('[data-detail-kind="species"]');
    await detail.waitFor();
    await page.waitForTimeout(150);
    const selection = await page.evaluate(() => JSON.parse(sessionStorage.getItem('aquaguide_compatibility_selection') || '[]'));
    assert.deepEqual(selection, [], 'Opening a species detail must not silently add that species to compatibility selection.');
    assert.match(page.url(), /species=sp_0002/, 'Read-only detail browsing must preserve the species detail route.');
    assert.deepEqual(errors, [], `Read-only species detail emitted page errors: ${errors.join('; ')}`);
    await page.close();
  }

  // 1) Entity detail width + exact task return path on desktop.
  {
    const { page, errors } = await makePage({ width: 1600, height: 1000 });
    const detailUrl = '/encyclopedia?mode=browse&species=sp_0001&source=atlas-detail';
    await page.goto(`${baseUrl}${detailUrl}`, { waitUntil: 'domcontentloaded' });
    const detail = page.locator('[data-detail-kind="species"]');
    await detail.waitFor();
    const box = await detail.boundingBox();
    assert.ok(box, 'Species detail must have measurable geometry.');
    assert.ok(box.width >= 700, `Desktop species detail must be wide enough for dense content; got ${box.width}px.`);
    assert.ok(box.width <= 920, `Desktop species detail should remain a focused detail surface; got ${box.width}px.`);

    await page.screenshot({ path: `${outputDir}/species-detail-1600.png`, fullPage: false });

    const primary = detail.locator('.modalFooter button').first();
    await primary.waitFor();
    await primary.click();
    await page.waitForURL(url => url.pathname === '/aquarium' && url.searchParams.get('action') === 'livestock');

    assert.equal(await page.locator('[data-workspace-return]').count(), 0, 'Global return must not sit inert behind the livestock Dialog.');
    const returnButton = page.locator('[data-workspace-dialog-return]');
    await returnButton.waitFor();
    assert.equal(await returnButton.getAttribute('aria-hidden'), null, 'Dialog-local return must remain in the active accessibility tree.');
    assert.match((await returnButton.getAttribute('aria-label')) || '', /返回物种详情/, 'Aquarium task must explain that it returns to the species detail, not a generic home.');
    await returnButton.click();
    await page.waitForURL(url => `${url.pathname}${url.search}` === detailUrl);
    await page.locator('[data-detail-kind="species"]').waitFor();
    assert.deepEqual(errors, [], `Desktop detail/navigation flow emitted page errors: ${errors.join('; ')}`);
    await page.close();
  }

  // 2) Species detail is effectively full-screen on phone, allowing native scrollbar/subpixel variance and no horizontal overflow.
  {
    const { page, errors } = await makePage({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/encyclopedia?mode=browse&species=sp_0001&source=atlas-detail`, { waitUntil: 'domcontentloaded' });
    const detail = page.locator('[data-detail-kind="species"]');
    await detail.waitFor();
    const box = await detail.boundingBox();
    assert.ok(box, 'Phone species detail must have measurable geometry.');
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    assert.ok(box.width >= viewportWidth - 12, `Phone species detail must use the viewport width apart from native scrollbar/subpixel variance; viewport=${viewportWidth}px, detail=${box.width}px.`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `Phone entity detail must not introduce horizontal overflow; got ${overflow}px.`);
    await page.screenshot({ path: `${outputDir}/species-detail-390.png`, fullPage: false });
    assert.deepEqual(errors, [], `Phone detail emitted page errors: ${errors.join('; ')}`);
    await page.close();
  }

  // 3) A visible default livestock state is a valid state; user can review and finish without inventing a change.
  {
    const { page, errors } = await makePage({ width: 1280, height: 900 });
    await page.goto(`${baseUrl}/aquarium?action=livestock`, { waitUntil: 'domcontentloaded' });
    const manageState = page.getByRole('button', { name: '调整体态', exact: true }).first();
    await manageState.waitFor();
    await manageState.click();

    const task = page.locator('[data-livestock-state-task]');
    await task.waitFor();
    await page.getByRole('button', { name: '下一步：选择体态', exact: true }).click();
    await page.locator('[data-livestock-state-task][data-task-step="2"]').waitFor();

    const checkedDefaults = page.locator('[data-livestock-state-task][data-task-step="2"] [role="radio"][aria-checked="true"]');
    assert.ok(await checkedDefaults.count() >= 1, 'Step 2 must expose the actual default state as selected.');

    const review = page.locator('[data-livestock-review-default-valid]');
    assert.equal(await review.isEnabled(), true, 'A valid default state must allow review without forcing a fake change.');
    await review.click();
    await page.locator('[data-livestock-state-task][data-task-step="3"]').waitFor();

    const done = page.locator('[data-livestock-finish-mode="done"]');
    await done.waitFor();
    assert.equal(await done.isEnabled(), true, 'No-change review must offer an enabled Done action.');
    assert.match((await done.textContent()) || '', /完成/, 'No-change review should say Done/完成 instead of disabled Save.');
    await page.screenshot({ path: `${outputDir}/livestock-default-state-review.png`, fullPage: false });
    await done.click();
    await page.locator('[data-livestock-state-task]').waitFor({ state: 'detached' });
    assert.deepEqual(errors, [], `Livestock default-state flow emitted page errors: ${errors.join('; ')}`);
    await page.close();
  }

  // 4) Compatibility result is scan-first: a dominant semantic verdict/symbol is visible before details.
  {
    const { page, errors } = await makePage({ width: 900, height: 900 });
    await page.addInitScript(() => {
      sessionStorage.setItem('aquaguide_compatibility_selection', JSON.stringify(['sp_0002']));
    });
    await page.goto(`${baseUrl}/encyclopedia?mode=compatibility`, { waitUntil: 'domcontentloaded' });
    const verdict = page.locator('[data-compatibility-verdict]');
    await verdict.waitFor();
    const status = await verdict.getAttribute('data-compatibility-verdict');
    assert.ok(['compatible', 'caution', 'insufficient_data', 'not_recommended'].includes(status || ''), `Unexpected compatibility verdict: ${status}`);
    const symbol = verdict.locator('[data-verdict-symbol]');
    const symbolValue = await symbol.getAttribute('data-verdict-symbol');
    assert.ok(['✓', '!', '?', '×'].includes(symbolValue || ''), `Compatibility verdict must expose a compact semantic symbol; got ${symbolValue}`);
    const symbolBox = await symbol.boundingBox();
    assert.ok(symbolBox && symbolBox.width >= 50 && symbolBox.height >= 50, 'Compatibility verdict symbol must visually dominate paragraph copy.');
    const verdictBox = await verdict.boundingBox();
    const selectorBox = await page.locator('[data-compatibility-selection]').boundingBox();
    assert.ok(verdictBox && selectorBox && verdictBox.y < selectorBox.y, `Compatibility result must appear before the selector once a verdict exists; verdictY=${verdictBox?.y}, selectorY=${selectorBox?.y}.`);
    assert.equal(await page.locator('dialog').filter({ hasText: '为什么会这样' }).count(), 0, 'Compatibility explanation must not pre-render as a nested dialog.');
    await page.screenshot({ path: `${outputDir}/compatibility-verdict-900.png`, fullPage: false });
    assert.deepEqual(errors, [], `Compatibility verdict flow emitted page errors: ${errors.join('; ')}`);
    await page.close();
  }

  console.log('PASS: UI interaction browser regression — read-only species browsing, exact return path, responsive species detail, default-state CTA consistency, scan-first compatibility verdict.');
} finally {
  await browser.close();
}
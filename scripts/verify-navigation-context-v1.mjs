import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const aquariumState = {
  version: 1,
  currentAquariumId: 'nav-context-tank',
  aquariums: [{
    id: 'nav-context-tank',
    name: '导航上下文测试缸',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: '2026-07-20T00:00:00.000Z',
      batches: [{ id: 'batch-1', quantity: 4, entryDate: '2026-07-20T00:00:00.000Z', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: '2026-07-20T00:00:00.000Z' }],
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
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, taskCardDismissed: true, aquariumConfigured: true },
  updatedAt: '2026-08-19T00:00:00.000Z',
};

const getWorkspaceScrollTop = page => page.locator('.desktop-workspace-scroll').evaluate(element => element.scrollTop);

const scrollCardIntoStablePosition = async (page, card) => {
  await card.evaluate(element => element.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(120);
  return getWorkspaceScrollTop(page);
};

const clickVisibleCardWithoutAutoScroll = async (page, card) => {
  const box = await card.boundingBox();
  assert.ok(box, 'result card must have a visible bounding box before click');
  const viewport = page.viewportSize();
  assert.ok(viewport, 'navigation context test requires a fixed viewport');
  assert.ok(box.y >= 0 && box.y + box.height <= viewport.height, `result card must already be vertically visible before click; y=${box.y}, height=${box.height}`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

const assertReturnedSearchContext = async ({ page, sourceId, previousScrollTop, kind, minCount }) => {
  await page.waitForURL(url => url.pathname === '/search' && url.searchParams.get('q') === '鱼');
  const selector = kind === 'species' ? '.search-v2-species-card' : '.search-v2-care-card';
  await page.waitForFunction(({ selector, minCount }) => document.querySelectorAll(selector).length >= minCount, { selector, minCount });

  const target = page.locator(`#${sourceId}`);
  await target.waitFor();
  await page.waitForFunction(id => document.activeElement?.id === id, sourceId);

  const restoredScrollTop = await getWorkspaceScrollTop(page);
  assert.ok(
    Math.abs(restoredScrollTop - previousScrollTop) <= 96,
    `${kind} return must restore the search workspace scroll position; before=${previousScrollTop}, after=${restoredScrollTop}`,
  );
};

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await context.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  page.setDefaultNavigationTimeout(45_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  // Species: an item beyond the 18-card preview must survive detail -> Search return.
  await page.goto(`${baseUrl}/search?q=${encodeURIComponent('鱼')}`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-search-show-all="species"]').click();
  const speciesCards = page.locator('.search-v2-species-card');
  const speciesCount = await speciesCards.count();
  assert.ok(speciesCount > 18, `species fixture must expose an expanded result beyond preview; got ${speciesCount}`);

  const speciesSource = speciesCards.nth(22);
  const speciesSourceId = await speciesSource.getAttribute('id');
  assert.ok(speciesSourceId, 'expanded species result must have a stable source id');
  const speciesScrollTop = await scrollCardIntoStablePosition(page, speciesSource);
  await clickVisibleCardWithoutAutoScroll(page, speciesSource);
  await page.waitForURL(/\/encyclopedia\?species=.*source=search/);
  await page.locator('[role="dialog"]:visible').waitFor();
  await page.keyboard.press('Escape');
  await assertReturnedSearchContext({
    page,
    sourceId: speciesSourceId,
    previousScrollTop: speciesScrollTop,
    kind: 'species',
    minCount: 19,
  });

  // Care: an item beyond the 12-card preview must obey the same return contract.
  const careShowAll = page.locator('[data-search-show-all="care"]');
  await careShowAll.waitFor();
  await careShowAll.click();
  const careCards = page.locator('.search-v2-care-card');
  const careCount = await careCards.count();
  assert.ok(careCount > 12, `care fixture must expose an expanded result beyond preview; got ${careCount}`);

  const careSource = careCards.nth(14);
  const careSourceId = await careSource.getAttribute('id');
  assert.ok(careSourceId, 'expanded Care result must have a stable source id');
  const careScrollTop = await scrollCardIntoStablePosition(page, careSource);
  await clickVisibleCardWithoutAutoScroll(page, careSource);
  await page.waitForURL(/\/care\?topic=.*source=search/);
  const careDetail = page.locator('[data-care-workspace-detail]');
  await careDetail.waitFor();
  await careDetail.locator('[data-care-detail-back]').click();
  await assertReturnedSearchContext({
    page,
    sourceId: careSourceId,
    previousScrollTop: careScrollTop,
    kind: 'care',
    minCount: 13,
  });

  assert.deepEqual(pageErrors, [], `search navigation context flow emitted page errors: ${pageErrors.join(' | ')}`);
  await context.close();

  // Aquarium: detail opened from the livestock roster must return to the roster, not drop a context layer.
  const aquariumContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await aquariumContext.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, aquariumState);
  const aquariumPage = await aquariumContext.newPage();
  aquariumPage.setDefaultTimeout(45_000);
  const aquariumErrors = [];
  aquariumPage.on('pageerror', error => aquariumErrors.push(String(error)));
  await aquariumPage.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  const archiveSource = aquariumPage.locator('#aquarium-records');
  await archiveSource.waitFor();
  const archiveScrollTop = await scrollCardIntoStablePosition(aquariumPage, archiveSource);
  await archiveSource.locator(':scope > button').click();
  const roster = aquariumPage.locator('[role="dialog"][data-surface="right-drawer"]:visible');
  await roster.waitFor();
  const profileButton = roster.locator('button:has(img)').first();
  assert.equal(await profileButton.count(), 1, 'livestock roster must expose a species profile opener');
  await profileButton.click();
  await roster.waitFor({ state: 'hidden' });
  const detail = aquariumPage.locator('[role="dialog"][data-surface]:visible');
  await detail.waitFor();
  await aquariumPage.keyboard.press('Escape');

  const restoredRoster = aquariumPage.locator('[role="dialog"][data-surface="right-drawer"]:visible');
  await restoredRoster.waitFor();
  const restoredArchiveScrollTop = await getWorkspaceScrollTop(aquariumPage);
  assert.ok(Math.abs(restoredArchiveScrollTop - archiveScrollTop) <= 96, `closing Aquarium species detail must keep the underlying archive scroll context; before=${archiveScrollTop}, after=${restoredArchiveScrollTop}`);
  assert.deepEqual(aquariumErrors, [], `aquarium detail return flow emitted page errors: ${aquariumErrors.join(' | ')}`);
  await aquariumContext.close();

  console.log('navigation context V1 PASS: Search deep results preserve expansion/focus/scroll and Aquarium roster detail returns to its originating roster');
} finally {
  await browser.close();
}

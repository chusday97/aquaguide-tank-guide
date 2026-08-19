import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

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

  assert.deepEqual(pageErrors, [], `navigation context flow emitted page errors: ${pageErrors.join(' | ')}`);
  console.log('navigation context V1 PASS: expanded Search species/Care state, source focus and workspace scroll survive detail return');
  await context.close();
} finally {
  await browser.close();
}

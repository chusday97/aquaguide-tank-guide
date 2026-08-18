import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();

  const app = page.locator('.aquaguide-app');
  await app.waitFor();
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'phone');
  assert.equal(await app.getAttribute('data-layout-mode'), 'phone', '390px viewport must render the phone shell regardless of desktop browser user-agent');

  const dashboard = page.locator('[data-aquarium-dashboard-v2]');
  const today = page.locator('[data-dashboard-priority="today"]');
  const context = page.locator('[data-dashboard-priority="context"]');
  await dashboard.waitFor();
  await today.waitFor();
  await context.waitFor();
  assert.equal(await page.locator('.aquarium-zone-index').count(), 0, 'Decision-first Aquarium must not reintroduce numbered Observe / Manage / Learn zones');

  const compactPriority = await page.evaluate(() => {
    const todayElement = document.querySelector('[data-dashboard-priority="today"]');
    const contextElement = document.querySelector('[data-dashboard-priority="context"]');
    if (!(todayElement instanceof HTMLElement) || !(contextElement instanceof HTMLElement)) return null;
    const todayRect = todayElement.getBoundingClientRect();
    const contextRect = contextElement.getBoundingClientRect();
    return { todayTop: todayRect.top, contextTop: contextRect.top };
  });
  assert.ok(compactPriority && compactPriority.todayTop <= compactPriority.contextTop, `mobile dashboard must show Today's decision area before tank context: ${JSON.stringify(compactPriority)}`);

  const grid = page.locator('.quick-action-primary');
  await grid.waitFor();
  assert.equal(await grid.locator('.quick-action-button').count(), 3, 'Aquarium home must keep exactly three recurrent maintenance actions permanently visible');
  const compactColumns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(compactColumns, 2, `compact Aquarium primary actions must use two concise columns, got ${compactColumns}`);
  const moreActions = page.locator('.quick-action-more');
  await moreActions.waitFor();
  assert.equal(await moreActions.evaluate(element => element.hasAttribute('open')), false, 'secondary Aquarium actions must be collapsed by default');
  assert.equal(await page.locator('.quick-action-secondary .quick-action-button').count(), 4, 'secondary actions must remain available without competing on first scan');

  const emptyCarePlan = page.locator('.care-plan-empty-strip');
  await emptyCarePlan.waitFor();
  const emptyCarePlanHeight = await emptyCarePlan.evaluate(element => Math.round(element.getBoundingClientRect().height));
  assert.ok(emptyCarePlanHeight <= 72, `empty care plan must stay a compact strip instead of a nested empty-state panel, got ${emptyCarePlanHeight}px`);

  const compactOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(compactOverflow.scrollWidth <= compactOverflow.viewportWidth + 1, `compact Aquarium must not overflow horizontally: ${JSON.stringify(compactOverflow)}`);

  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');
  assert.equal(await app.getAttribute('data-layout-mode'), 'desktop', '900px viewport must switch to desktop shell without reload');
  await grid.waitFor();
  const mediumColumns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(mediumColumns, 2, `medium Aquarium primary actions must use two columns, got ${mediumColumns}`);

  const mediumHeader = await page.evaluate(() => {
    const header = document.querySelector('.aquarium-desktop-header');
    const timelineButton = header?.querySelector(':scope > button:last-child');
    const identity = header?.querySelector(':scope > div:first-child');
    if (!(header instanceof HTMLElement) || !(timelineButton instanceof HTMLElement) || !(identity instanceof HTMLElement)) return null;
    const headerRect = header.getBoundingClientRect();
    const timelineRect = timelineButton.getBoundingClientRect();
    const identityRect = identity.getBoundingClientRect();
    return {
      headerHeight: Math.round(headerRect.height),
      identityTop: Math.round(identityRect.top),
      timelineTop: Math.round(timelineRect.top),
      timelineWidth: Math.round(timelineRect.width),
      headerWidth: Math.round(headerRect.width),
    };
  });
  assert.ok(mediumHeader && Math.abs(mediumHeader.identityTop - mediumHeader.timelineTop) <= 12, `900px Aquarium header must keep identity and timeline in the same row: ${JSON.stringify(mediumHeader)}`);
  assert.ok(mediumHeader && mediumHeader.headerHeight <= 110, `900px Aquarium header must stay compact instead of becoming a second hero card: ${JSON.stringify(mediumHeader)}`);
  assert.ok(mediumHeader && mediumHeader.timelineWidth < mediumHeader.headerWidth * 0.42, `timeline control must remain a compact action at 900px: ${JSON.stringify(mediumHeader)}`);

  const desktopHero = await page.evaluate(() => {
    const todayElement = document.querySelector('[data-dashboard-priority="today"]');
    const contextElement = document.querySelector('[data-dashboard-priority="context"]');
    if (!(todayElement instanceof HTMLElement) || !(contextElement instanceof HTMLElement)) return null;
    const todayRect = todayElement.getBoundingClientRect();
    const contextRect = contextElement.getBoundingClientRect();
    return {
      todayTop: Math.round(todayRect.top),
      contextTop: Math.round(contextRect.top),
      todayRight: Math.round(todayRect.right),
      contextLeft: Math.round(contextRect.left),
      todayWidth: Math.round(todayRect.width),
      contextWidth: Math.round(contextRect.width),
    };
  });
  assert.ok(desktopHero && Math.abs(desktopHero.todayTop - desktopHero.contextTop) <= 2, `desktop decision and context areas must share a stable hero row: ${JSON.stringify(desktopHero)}`);
  assert.ok(desktopHero && desktopHero.todayRight <= desktopHero.contextLeft + 2, `desktop decision area must remain visually distinct from tank context: ${JSON.stringify(desktopHero)}`);
  assert.ok(desktopHero && desktopHero.todayWidth >= desktopHero.contextWidth, `desktop tank context must not be wider than Today's decision area: ${JSON.stringify(desktopHero)}`);

  const mediumOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(mediumOverflow.scrollWidth <= mediumOverflow.viewportWidth + 1, `medium Aquarium must not overflow horizontally: ${JSON.stringify(mediumOverflow)}`);

  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');
  await grid.waitFor();
  const wideColumns = await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length);
  assert.equal(wideColumns, 3, `wide Aquarium primary actions must use three concise columns, got ${wideColumns}`);

  const sectionTypography = await page.locator('.aquarium-dashboard-v2__section-title').first().evaluate(element => {
    const style = getComputedStyle(element);
    return { fontSize: parseFloat(style.fontSize), fontWeight: parseInt(style.fontWeight, 10), lineHeight: style.lineHeight };
  });
  assert.ok(sectionTypography.fontSize >= 16, `section title must retain readable hierarchy, got ${sectionTypography.fontSize}px`);
  assert.ok(sectionTypography.fontWeight >= 600 && sectionTypography.fontWeight <= 850, `section title must use controlled semantic weight, got ${sectionTypography.fontWeight}`);

  const wideOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  assert.ok(wideOverflow.scrollWidth <= wideOverflow.viewportWidth + 1, `wide Aquarium must not overflow horizontally: ${JSON.stringify(wideOverflow)}`);
  assert.deepEqual(pageErrors, [], `UI V2 responsive path must not emit page errors: ${pageErrors.join('; ')}`);

  console.log('AquaGuide UI V2 responsive regression: PASS (decision-first hierarchy + compact actions/header across 390/900/1600).');
} finally {
  await browser.close();
}

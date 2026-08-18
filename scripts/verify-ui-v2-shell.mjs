import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const buttonSource = await readFile(new URL('../components/ui/button.tsx', import.meta.url), 'utf8');
const inputSource = await readFile(new URL('../components/ui/input.tsx', import.meta.url), 'utf8');

for (const semanticVariant of ['action', 'action-outline', 'action-ghost', 'action-danger', 'icon-quiet', 'icon-surface']) {
  assert.ok(buttonSource.includes(`\"${semanticVariant}\"`) || buttonSource.includes(`${semanticVariant}:`), `Button must expose semantic variant ${semanticVariant}`);
}
assert.ok(buttonSource.includes('icon-touch'), 'Button must expose a 44px-class icon touch size');
assert.ok(buttonSource.includes('min-h-11'), 'Button touch variants must keep a 44px-class minimum hit area');
assert.ok(inputSource.includes('uiSize?: \"compact\" | \"touch\"'), 'Input must expose compact/touch density instead of forcing one global height');

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

  const mobileHeader = page.locator('[data-shell="mobile-header"]');
  const mobileBottomNav = page.locator('[data-shell="mobile-bottom-nav"]');
  await mobileHeader.waitFor();
  await mobileBottomNav.waitFor();

  const utilityActions = mobileHeader.locator('button[data-shell-action]');
  assert.equal(await utilityActions.count(), 3, 'mobile utility header must expose exactly search / identify / settings actions');
  assert.deepEqual(
    await utilityActions.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-shell-action'))),
    ['search', 'identify', 'settings'],
    'mobile header actions must keep stable semantic ordering'
  );

  const utilitySizes = await utilityActions.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  for (const size of utilitySizes) {
    assert.ok(size.width >= 44 && size.height >= 44, `mobile utility action must be at least 44×44, got ${JSON.stringify(size)}`);
  }

  const mobileTabs = mobileBottomNav.locator('button[data-shell-nav-item]');
  assert.equal(await mobileTabs.count(), 4, 'mobile bottom navigation must remain four primary destinations');
  const mobileTabSizes = await mobileTabs.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  for (const size of mobileTabSizes) {
    assert.ok(size.width >= 44 && size.height >= 44, `mobile tab target must be at least 44×44, got ${JSON.stringify(size)}`);
  }

  const aquariumMobileTab = mobileBottomNav.locator('[data-shell-nav-item="/aquarium"]');
  assert.equal(await aquariumMobileTab.getAttribute('aria-current'), 'page', 'Aquarium must expose the current mobile destination semantically');
  const mobileActiveStyle = await aquariumMobileTab.evaluate(element => ({
    backgroundColor: getComputedStyle(element).backgroundColor,
    color: getComputedStyle(element).color,
  }));
  assert.notEqual(mobileActiveStyle.backgroundColor, 'rgb(27, 77, 62)', 'mobile active tab should use a quiet indicator instead of a full dark-green tile');

  const careMobileTab = mobileBottomNav.locator('[data-shell-nav-item="/care"]');
  await careMobileTab.click();
  await page.waitForURL(url => url.pathname === '/care');
  await page.waitForFunction(() => (
    document.querySelector('[data-shell="mobile-bottom-nav"] [data-shell-nav-item="/care"]')?.getAttribute('aria-current') === 'page'
  ));
  assert.equal(await careMobileTab.getAttribute('aria-current'), 'page', 'mobile active state must follow route changes');
  assert.equal(await aquariumMobileTab.getAttribute('aria-current'), null, 'previous mobile destination must clear aria-current after navigation');

  const phoneOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth }));
  assert.ok(phoneOverflow.scrollWidth <= phoneOverflow.width + 1, `phone shell must not overflow horizontally: ${JSON.stringify(phoneOverflow)}`);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');

  const desktopSidebar = page.locator('[data-shell="desktop-sidebar"]');
  await desktopSidebar.waitFor();
  const desktopPrimaryNav = desktopSidebar.locator('button[data-shell-nav-item]');
  assert.equal(await desktopPrimaryNav.count(), 4, 'desktop sidebar must expose four primary destinations');

  const careDesktopNav = desktopSidebar.locator('[data-shell-nav-item="/care"]');
  await page.waitForFunction(() => (
    document.querySelector('[data-shell="desktop-sidebar"] [data-shell-nav-item="/care"]')?.getAttribute('aria-current') === 'page'
  ));
  assert.equal(await careDesktopNav.getAttribute('aria-current'), 'page', 'desktop current destination must expose aria-current=page');
  const desktopNavSizes = await desktopPrimaryNav.evaluateAll(nodes => nodes.map(node => {
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  for (const size of desktopNavSizes) {
    assert.ok(size.height >= 44, `desktop primary navigation target must retain at least 44px height, got ${JSON.stringify(size)}`);
  }

  const encyclopediaDesktopNav = desktopSidebar.locator('[data-shell-nav-item="/encyclopedia"]');
  await encyclopediaDesktopNav.click();
  await page.waitForURL(url => url.pathname === '/encyclopedia');
  await page.waitForFunction(() => (
    document.querySelector('[data-shell="desktop-sidebar"] [data-shell-nav-item="/encyclopedia"]')?.getAttribute('aria-current') === 'page'
  ));
  assert.equal(await encyclopediaDesktopNav.getAttribute('aria-current'), 'page', 'desktop active state must follow route changes');
  assert.equal(await careDesktopNav.getAttribute('aria-current'), null, 'previous desktop destination must clear aria-current after navigation');
  await page.waitForFunction(() => {
    const active = document.querySelector('[data-shell="desktop-sidebar"] [data-shell-nav-item="/encyclopedia"]');
    return active ? getComputedStyle(active).backgroundColor === 'rgb(27, 77, 62)' : false;
  });

  const activeDesktopStyle = await encyclopediaDesktopNav.evaluate(element => ({
    backgroundColor: getComputedStyle(element).backgroundColor,
    color: getComputedStyle(element).color,
    fontFamily: getComputedStyle(element).fontFamily,
  }));
  assert.equal(activeDesktopStyle.backgroundColor, 'rgb(27, 77, 62)', `desktop primary active state must settle on the decisive shell color, got ${activeDesktopStyle.backgroundColor}`);
  assert.ok(/Segoe UI|PingFang|Microsoft YaHei|Noto Sans|Arial|system-ui|-apple-system/i.test(activeDesktopStyle.fontFamily), `desktop shell must use the UI font stack, got ${activeDesktopStyle.fontFamily}`);

  const desktopOverflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth }));
  assert.ok(desktopOverflow.scrollWidth <= desktopOverflow.width + 1, `desktop shell must not overflow horizontally: ${JSON.stringify(desktopOverflow)}`);

  await page.setViewportSize({ width: 900, height: 900 });
  await page.waitForFunction(() => document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') === 'desktop');
  const collapsedWidth = await desktopSidebar.evaluate(element => element.getBoundingClientRect().width);
  assert.ok(collapsedWidth >= 72 && collapsedWidth <= 82, `narrow desktop must auto-collapse the sidebar to the icon rail, got ${collapsedWidth}px`);
  const collapsedTargets = await desktopSidebar.locator('button[data-shell-nav-item]').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width));
  assert.ok(collapsedTargets.every(width => width >= 44 && width <= 60), `collapsed desktop navigation targets must stay compact but touchable, got ${collapsedTargets.join(', ')}`);

  assert.deepEqual(pageErrors, [], `UI V2 shell path must not emit page errors: ${pageErrors.join('; ')}`);
  console.log('AquaGuide UI V2 shell regression: PASS (semantic controls + mobile chrome + desktop sidebar + active states).');
} finally {
  await browser.close();
}

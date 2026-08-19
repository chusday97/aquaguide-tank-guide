import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const cases = [
  { name: 'phone-390', width: 390, height: 844, expected: 'stacked-task-first' },
  { name: 'compact-desktop-768', width: 768, height: 900, expected: 'stacked-task-first' },
  { name: 'desktop-1024', width: 1024, height: 900, expected: 'stacked-task-first-or-balanced' },
  { name: 'wide-1440', width: 1440, height: 1000, expected: 'balanced-hero' },
];

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: { width: testCase.width, height: testCase.height },
      locale: 'zh-CN',
      hasTouch: testCase.width < 768,
      isMobile: testCase.width < 768,
    });
    await context.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();
    await page.locator('[data-aquarium-dashboard-v2]').waitFor();
    await page.waitForTimeout(1200);

    const geometry = await page.evaluate(() => {
      const rect = selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return {
          top: Math.round(box.top),
          bottom: Math.round(box.bottom),
          left: Math.round(box.left),
          right: Math.round(box.right),
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
      };
      const main = rect('.desktop-workspace-scroll') || rect('main');
      const sidebar = rect('.desktop-sidebar');
      const aquariumLayout = rect('.aquarium-desktop-layout');
      return {
        today: rect('[data-dashboard-priority="today"]'),
        manage: rect('#aquarium-manage-zone'),
        context: rect('[data-dashboard-priority="context"]'),
        main,
        sidebar,
        aquariumLayout,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      };
    });

    assert.ok(geometry.today && geometry.manage && geometry.context, `${testCase.name}: missing dashboard priority surface`);
    assert.ok(geometry.documentWidth <= geometry.viewportWidth + 1, `${testCase.name}: page overflows horizontally`);

    const today = geometry.today;
    const manage = geometry.manage;
    const contextBox = geometry.context;
    const contextBesideToday = Math.abs(contextBox.top - today.top) <= 40 && contextBox.left > today.left;

    if (testCase.expected === 'stacked-task-first') {
      assert.ok(today.top < manage.top, `${testCase.name}: Today must precede Manage`);
      assert.ok(manage.top < contextBox.top, `${testCase.name}: recurrent Manage actions must appear before contextual 3D tank`);
      assert.ok(contextBox.height <= 180, `${testCase.name}: contextual 3D tank is too tall for a stacked task-first workspace (${contextBox.height}px)`);
    } else if (testCase.expected === 'stacked-task-first-or-balanced') {
      const taskFirst = today.top < manage.top && manage.top < contextBox.top;
      assert.ok(taskFirst || contextBesideToday, `${testCase.name}: 3D tank must be after Manage or beside Today, never a dominant full-width block before Manage`);
      if (!contextBesideToday) {
        assert.ok(contextBox.height <= 180, `${testCase.name}: stacked contextual 3D tank is too tall (${contextBox.height}px)`);
      }
    } else {
      assert.ok(contextBesideToday, `${testCase.name}: wide workspace should balance Today and tank context side-by-side`);
      assert.ok(manage.top >= Math.min(today.bottom, contextBox.bottom) - 24, `${testCase.name}: Manage should follow the hero row`);
      assert.ok(contextBox.height <= 250, `${testCase.name}: wide contextual 3D tank should remain visually subordinate (${contextBox.height}px)`);
    }

    results.push({ name: testCase.name, ...geometry, contextBesideToday });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log('Aquarium visual hierarchy PASS');
console.log(JSON.stringify(results, null, 2));

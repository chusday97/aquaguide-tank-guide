import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve('artifacts/uiux-visual-baseline');
fs.mkdirSync(outputDir, { recursive: true });

const viewports = [
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'compact-desktop-768', width: 768, height: 900 },
  { name: 'desktop-1024', width: 1024, height: 900 },
  { name: 'wide-1440', width: 1440, height: 1000 },
];

const routes = [
  { name: 'aquarium', path: '/aquarium' },
  { name: 'encyclopedia', path: '/encyclopedia' },
  { name: 'care', path: '/care' },
  { name: 'search', path: '/search?q=%E9%B1%BC' },
  { name: 'collection', path: '/collection' },
  { name: 'settings', path: '/settings' },
];

const browser = await chromium.launch({ headless: true });
const manifest = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: 'zh-CN',
      hasTouch: viewport.width < 768,
      isMobile: viewport.width < 768,
    });
    // A fresh browser context already starts with empty storage. Only seed locale here;
    // clearing storage in an init script would wipe the aquarium again on every navigation.
    await context.addInitScript(() => {
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.setDefaultNavigationTimeout(25_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();
    await page.locator('[data-aquarium-dashboard-v2]').waitFor();
    await page.waitForTimeout(1200);

    for (const route of routes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded' });
      if (route.name === 'aquarium') {
        // A valid visual baseline must preserve the seeded aquarium across route changes.
        // This would have failed the original harness bug that silently captured Welcome.
        await page.locator('[data-aquarium-dashboard-v2]').waitFor();
      }
      await page.waitForTimeout(route.name === 'aquarium' ? 1400 : 700);
      await page.evaluate(async () => {
        if ('fonts' in document) await document.fonts.ready;
        window.scrollTo(0, 0);
      });

      const metrics = await page.evaluate(() => {
        const app = document.querySelector('.aquaguide-app');
        const main = document.querySelector('main');
        const mainRect = main?.getBoundingClientRect();
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          pageHeight: document.documentElement.scrollHeight,
          layoutMode: app?.getAttribute('data-layout-mode') || 'unknown',
          main: mainRect ? {
            left: Math.round(mainRect.left),
            width: Math.round(mainRect.width),
          } : null,
          headingCount: document.querySelectorAll('h1,h2,h3').length,
          buttonCount: document.querySelectorAll('button').length,
          cjkFontReady: document.fonts?.check('16px "Noto Sans CJK SC"', '鱼缸养护') ?? false,
        };
      });

      if (!metrics.cjkFontReady) {
        throw new Error(`${viewport.name}/${route.name}: CJK snapshot font unavailable; refusing unreadable visual evidence`);
      }

      const baseName = `${viewport.name}__${route.name}`;
      await page.screenshot({
        path: path.join(outputDir, `${baseName}__fold.png`),
        fullPage: false,
        animations: 'disabled',
      });
      await page.screenshot({
        path: path.join(outputDir, `${baseName}__full.png`),
        fullPage: true,
        animations: 'disabled',
      });

      manifest.push({ viewport, route, ...metrics });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Saved ${manifest.length * 2} screenshots + manifest to ${outputDir}`);

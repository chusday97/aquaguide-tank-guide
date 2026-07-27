import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const routes = [
  '/login',
  '/aquarium',
  '/encyclopedia',
  '/care',
  '/care?topic=guide_new_fish_acclimation',
  '/care?topic=guide_water_deteriorate',
  '/care?topic=guide_fry_care',
  '/care?topic=qa_gen_001',
  '/collection',
  '/collection/wishlist',
  '/collection/care',
  '/collection/memorial',
  '/collection/achievements',
  '/search?q=fish',
  '/identify',
  '/settings',
  '/welcome',
];
const profiles = [
  { width: 390, height: 844, locale: 'zh-CN', phone: true },
  { width: 390, height: 844, locale: 'en', phone: true },
  { width: 600, height: 900, locale: 'zh-CN', phone: false },
  { width: 600, height: 900, locale: 'en', phone: false },
  { width: 820, height: 900, locale: 'en', phone: false },
  { width: 1024, height: 900, locale: 'en', phone: false },
  { width: 1440, height: 900, locale: 'zh-CN', phone: false },
];

const localState = {
  version: 1,
  currentAquariumId: '',
  aquariums: [],
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
    status: 'skipped',
    viewedSpecies: false,
    taskCardDismissed: false,
    aquariumConfigured: false,
  },
  updatedAt: '2026-07-27T00:00:00.000Z',
};

const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      locale: profile.locale === 'en' ? 'en-US' : 'zh-CN',
      hasTouch: profile.phone,
      isMobile: profile.phone,
      userAgent: profile.phone
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
        : undefined,
    });
    await context.addInitScript(({ locale, state }) => {
      localStorage.setItem('aquaguide_locale', locale);
      localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
    }, { locale: profile.locale, state: localState });

    for (const route of routes) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(350);
        const result = await page.evaluate(() => {
          const isInsideHorizontalScroller = (element) => {
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
              const style = getComputedStyle(parent);
              if (parent.scrollWidth > parent.clientWidth + 1 && ['auto', 'scroll'].includes(style.overflowX)) return true;
              parent = parent.parentElement;
            }
            return false;
          };
          const isFullyClipped = (element) => {
            const elementRect = element.getBoundingClientRect();
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
              const style = getComputedStyle(parent);
              if (['hidden', 'clip'].includes(style.overflowX)) {
                const parentRect = parent.getBoundingClientRect();
                if (elementRect.left >= parentRect.right - 1 || elementRect.right <= parentRect.left + 1) return true;
              }
              parent = parent.parentElement;
            }
            return false;
          };
          const overflowingControls = [...document.querySelectorAll('button, a, input, select, textarea, [role="tab"]')]
            .filter(element => {
              const rect = element.getBoundingClientRect();
              if (rect.width < 1 || rect.height < 1 || rect.bottom < 0 || rect.top > innerHeight) return false;
              if (isFullyClipped(element)) return false;
              if (isInsideHorizontalScroller(element)) return false;
              return rect.left < -1 || rect.right > innerWidth + 1;
            })
            .map(element => ({
              text: (element.getAttribute('aria-label') || element.textContent || element.tagName).trim().slice(0, 80),
              rect: element.getBoundingClientRect().toJSON(),
            }));
          return {
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
            layoutMode: document.querySelector('.aquaguide-app')?.getAttribute('data-layout-mode') || 'standalone',
            errorBoundary: /页面暂时无法显示|Page unavailable/i.test(document.body.innerText),
            overflowingControls,
          };
        });
        if (
          pageErrors.length > 0
          || result.documentWidth > result.viewportWidth + 1
          || result.errorBoundary
          || result.overflowingControls.length > 0
        ) {
          failures.push({ profile, route, pageErrors, ...result });
        }
      } catch (error) {
        failures.push({ profile, route, navigationError: error instanceof Error ? error.message : String(error) });
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

assert.deepEqual(failures, [], `responsive route failures:\n${JSON.stringify(failures, null, 2)}`);
console.log(`responsive route scan passed: ${profiles.length} profiles × ${routes.length} routes`);

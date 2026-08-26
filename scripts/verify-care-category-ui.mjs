import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });

const seed = async (page, locale) => {
  await page.addInitScript(selectedLocale => {
    localStorage.setItem('aquaguide_locale', selectedLocale);
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify({
      version: 1,
      currentAquariumId: null,
      aquariums: [],
      wishlist: [],
      dismissedRecommendations: [],
      diagnosisRecords: [],
      compatibilityRecords: [],
      deceasedRecords: [],
      feedingRecords: [],
      observationRecords: [],
      riskReminderState: {},
      onboarding: { version: 1, status: 'completed', viewedSpecies: true, aquariumConfigured: false, taskCardDismissed: false },
      updatedAt: new Date().toISOString(),
    }));
  }, locale);
};

const inspectNewStock = async (locale, buttonName) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: locale === 'en' ? 'en-US' : 'zh-CN' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await seed(page, locale);
  await page.goto(`${baseUrl}/care?mode=browse`, { waitUntil: 'networkidle' });

  const category = page.locator('[data-care-category="new_stock"]');
  await category.getByText(buttonName, { exact: true }).waitFor();
  await category.click();
  await page.locator('#care-results').waitFor();

  const resultCount = Number(await page.locator('#care-results').getAttribute('data-care-result-count'));
  assert.ok(resultCount >= 2, `${locale} new-stock category should show at least two articles`);
  assert.equal(await page.locator('[data-surface="detail-rail"]').count(), 0, 'choosing a category must not open a single article');
  assert.equal(await category.getAttribute('class').then(value => value?.includes('bg-emerald-50')), true, 'selected category should stay visibly selected');

  const firstArticle = page.locator('#care-results button[id^="care-article-"]').first();
  await firstArticle.click();
  await page.locator('[data-surface="detail-rail"]').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('[data-surface="detail-rail"]').waitFor({ state: 'detached' });
  assert.equal(Number(await page.locator('#care-results').getAttribute('data-care-result-count')), resultCount, 'closing an article must restore the category result set');
  assert.deepEqual(errors, [], `${locale} care page should not throw: ${errors.join('; ')}`);
  await page.close();
  return resultCount;
};

try {
  const chineseCount = await inspectNewStock('zh-CN', '新鱼入缸');
  const englishCount = await inspectNewStock('en', 'New Arrivals');
  assert.equal(englishCount, chineseCount, 'Chinese and English category clicks must show the same number of articles');
  console.log(`care category UI verified: new_stock shows ${chineseCount} articles in both locales`);
} finally {
  await browser.close();
}

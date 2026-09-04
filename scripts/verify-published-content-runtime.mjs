import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const speciesFor = (locale) => ({
  id: '11111111-1111-4111-8111-111111111111',
  catalogKey: 'sp_0001',
  name: locale === 'en' ? 'P0 Published Fire Red Shrimp' : 'P0 已发布极火虾',
  scientificName: 'Neocaridina davidi',
  category: locale === 'en' ? 'Shrimps/Snails/Crabs' : '虾螺蟹',
  difficulty: 'Easy',
  waterTemperatureText: '22–26°C',
  phLevelText: '6.5–7.5',
  temperament: 'Peaceful',
  sizeClass: 'Small',
  updatedAt: '2026-09-04T09:00:00.000Z',
  localization: { requestedLocale: locale, resolvedLocale: locale, usedFallback: false },
  waterChangeCycleDays: 7,
  description: locale === 'en' ? 'P0 published Product description.' : 'P0 已发布 Product 描述。',
  diet: locale === 'en' ? 'Biofilm and algae.' : '生物膜和藻类。',
  tankSizeText: locale === 'en' ? 'At least 20 L' : '至少 20 升',
  assets: [],
});
const careFor = (locale) => ({
  id: '22222222-2222-4222-8222-222222222222',
  catalogKey: 'guide_new_fish_acclimation',
  title: locale === 'en' ? 'P0 Published New Fish Acclimation' : 'P0 已发布新鱼入缸',
  category: locale === 'en' ? 'Fish issues' : '鱼只异常',
  urgency: '高优先级',
  summary: locale === 'en' ? 'P0 published Care summary.' : 'P0 已发布 Care 摘要。',
  keywords: locale === 'en' ? ['acclimation'] : ['过水'],
  updatedAt: '2026-09-04T09:00:00.000Z',
  localization: { requestedLocale: locale, resolvedLocale: locale, usedFallback: false },
  symptoms: locale === 'en' ? ['New arrival'] : ['新鱼刚到家'],
  avoidActions: locale === 'en' ? ['Do not rush'] : ['不要直接入缸'],
  observeItems: [],
  diagnoseWhen: [],
  nextStep: locale === 'en' ? 'Observe after acclimation.' : '过水后继续观察。',
  steps: [{
    id: '33333333-3333-4333-8333-333333333333',
    position: 1,
    instruction: locale === 'en' ? 'Match temperature first.' : '先对齐温度。',
    actionKind: 'immediate',
  }],
  references: [],
  assets: [],
});
const installBootstrapFixture = async (page, locale, seenRequests) => {
  await page.route('**/api/v1/content-bootstrap*', route => {
    const url = new URL(route.request().url());
    seenRequests.push(url.searchParams.get('locale'));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          species: [speciesFor(locale)],
          careArticles: [careFor(locale)],
          authority: 'publication-snapshot',
          publicationCounts: { species: 1, care: 1 },
        },
        requestId: `published-content-${locale}`,
      }),
    });
  });
};

const createPage = async (browser, locale) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(value => localStorage.setItem('aquaguide_locale', value), locale);
  return { page, errors };
};
const browser = await chromium.launch({ headless: true });
try {
  {
    const { page, errors } = await createPage(browser, 'zh-CN');
    const seenRequests = [];
    await installBootstrapFixture(page, 'zh-CN', seenRequests);
    await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'domcontentloaded' });
    const input = page.locator('#atlas-toolbar [role="combobox"]');
    await input.waitFor({ state: 'visible' });
    await input.fill('P0 已发布极火虾');
    const listbox = page.locator('#atlas-toolbar [role="listbox"]');
    await listbox.waitFor({ state: 'visible' });
    assert.match(await listbox.innerText(), /P0 已发布极火虾/, 'Species Guide must render the Published Product name');
    assert.deepEqual(seenRequests, ['zh-CN'], 'initial Product/Care bootstrap must request the active locale');
    assert.deepEqual(errors, [], `Published Product runtime should not raise page errors: ${errors.join(' | ')}`);
    await page.close();
  }

  {
    const { page, errors } = await createPage(browser, 'zh-CN');
    const seenRequests = [];
    await installBootstrapFixture(page, 'zh-CN', seenRequests);
    await page.goto(`${baseUrl}/care`, { waitUntil: 'domcontentloaded' });
    const careInput = page.locator('#care-search [role="combobox"]');
    await careInput.waitFor({ state: 'visible' });
    await careInput.fill('P0 已发布新鱼入缸');
    const careResults = page.locator('#care-results');
    await careResults.waitFor({ state: 'visible' });
    await careResults.getByText('P0 已发布新鱼入缸', { exact: true }).first().waitFor();
    assert.deepEqual(seenRequests, ['zh-CN'], 'Care runtime must use the same Published Content bootstrap');
    assert.deepEqual(errors, [], `Published Care runtime should not raise page errors: ${errors.join(' | ')}`);
    await page.close();
  }

  {
    const { page, errors } = await createPage(browser, 'en');
    const seenRequests = [];
    await installBootstrapFixture(page, 'en', seenRequests);
    await page.goto(`${baseUrl}/care`, { waitUntil: 'domcontentloaded' });
    const careInput = page.locator('#care-search [role="combobox"]');
    await careInput.waitFor({ state: 'visible' });
    await careInput.fill('P0 Published New Fish Acclimation');
    const careResults = page.locator('#care-results');
    await careResults.waitFor({ state: 'visible' });
    await careResults.getByText('P0 Published New Fish Acclimation', { exact: true }).first().waitFor();
    assert.deepEqual(seenRequests, ['en'], 'English bootstrap must request en rather than reusing zh-CN data');
    assert.deepEqual(errors, [], `English Published Content runtime should not raise page errors: ${errors.join(' | ')}`);
    await page.close();
  }

  console.log('published content runtime verified: Product/Care API values reach zh-CN and EN frontend consumers');
} finally {
  await browser.close();
}

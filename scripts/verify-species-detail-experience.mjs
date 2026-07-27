import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });

const createState = ({ withTank = true, owned = false } = {}) => ({
  version: 1,
  currentAquariumId: withTank ? 'detail-tank' : '',
  aquariums: withTank ? [{
    id: 'detail-tank',
    name: 'Species detail tank',
    fishes: owned ? [{
      id: 'owned-sp-0001',
      fishId: 'sp_0001',
      quantity: 6,
      entryDate: '2026-07-01',
      lastWaterChangeDate: '2026-07-20',
    }] : [],
    dimensions: { length: '60', width: '35', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }] : [],
  wishlist: ['sp_0001'],
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
    aquariumConfigured: withTank,
  },
  updatedAt: '2026-07-27T00:00:00.000Z',
});

const newSeededPage = async ({ locale = 'en', state = createState(), phone = false } = {}) => {
  const context = await browser.newContext({
    viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 900 },
    locale: locale === 'en' ? 'en-US' : 'zh-CN',
    hasTouch: phone,
    isMobile: phone,
    userAgent: phone
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
      : undefined,
  });
  await context.addInitScript(({ saved, language }) => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001']));
    localStorage.setItem('aquaguide_locale', language);
  }, { saved: state, language: locale });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  return { context, page };
};

const openWishlistDetail = async page => {
  await page.goto(`${baseUrl}/collection/wishlist`, { waitUntil: 'domcontentloaded' });
  await page.locator('#collection-wishlist-sp_0001 button').first().click();
  const dialog = page.locator('[role="dialog"][data-surface]:visible');
  await dialog.waitFor();
  return dialog;
};

try {
  const noTank = await newSeededPage({ state: createState({ withTank: false }) });
  const noTankDialog = await openWishlistDetail(noTank.page);
  const setupAction = noTankDialog.getByRole('button', { name: 'Go to Tank Settings', exact: true });
  assert.equal(await setupAction.count(), 1, 'no-tank detail must expose exactly one primary action');
  await setupAction.click();
  await noTank.page.waitForURL(/\/aquarium\?action=create$/);
  await noTank.context.close();

  const metricIdsByLocale = {};
  for (const locale of ['zh-CN', 'en']) {
    const current = await newSeededPage({ locale, state: createState({ withTank: true, owned: false }), phone: locale === 'en' });
    const dialog = await openWishlistDetail(current.page);
    const primaryLabel = locale === 'en' ? 'Add to Current Tank' : '加入当前鱼缸';
    const primaryAction = dialog.getByRole('button', { name: primaryLabel, exact: true });
    assert.equal(await primaryAction.count(), 1, 'suitable detail must have one primary action');
    if (locale === 'en') {
      const [dialogBox, actionBox] = await Promise.all([dialog.boundingBox(), primaryAction.boundingBox()]);
      assert.ok(dialogBox && actionBox && actionBox.y >= dialogBox.y && actionBox.y + actionBox.height <= dialogBox.y + dialogBox.height, 'phone primary action must stay visible in the initial dialog viewport');
    }
    await dialog.getByRole('button', { name: locale === 'en' ? 'Show all 5 items' : '查看全部 5 项', exact: true }).click();
    metricIdsByLocale[locale] = await dialog.locator('[data-visual-result-subject-id^="fit-"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-visual-result-subject-id')).sort());
    assert.deepEqual(metricIdsByLocale[locale], ['fit-filter', 'fit-heater', 'fit-space', 'fit-temperature', 'fit-water_type']);
    assert.doesNotMatch(await dialog.innerText(), /pH range matches|pH 范围与物种资料匹配/);
    if (locale === 'en') {
      await primaryAction.click();
      await current.page.waitForURL(/\/aquarium\?action=add-species&species=sp_0001$/);
    }
    await current.context.close();
  }
  assert.deepEqual(metricIdsByLocale.en, metricIdsByLocale['zh-CN'], 'localized details must use the same canonical metric types');

  const baseConfiguredState = createState({ withTank: true, owned: false });
  const stateCases = [
    {
      name: 'caution',
      status: 'caution',
      action: 'Check Risks & Confirm Add',
      state: {
        ...baseConfiguredState,
        aquariums: [{ ...baseConfiguredState.aquariums[0], targetTemperature: '29' }],
      },
    },
    {
      name: 'not recommended',
      status: 'not_recommended',
      action: 'View Risks & Alternatives',
      expectedUrl: /\/encyclopedia#compatibility/,
      state: {
        ...baseConfiguredState,
        aquariums: [{ ...baseConfiguredState.aquariums[0], waterType: 'Saltwater' }],
      },
    },
    {
      name: 'predation conflict',
      status: 'not_recommended',
      action: 'View Risks & Alternatives',
      expectedUrl: /\/encyclopedia#compatibility/,
      state: {
        ...baseConfiguredState,
        aquariums: [{
          ...baseConfiguredState.aquariums[0],
          dimensions: { length: '300', width: '100', height: '100' },
          fishes: [{
            id: 'predator-sp-0117',
            fishId: 'sp_0117',
            quantity: 1,
            entryDate: '2026-07-01',
            lastWaterChangeDate: '2026-07-20',
          }],
        }],
      },
    },
    {
      name: 'insufficient data',
      status: 'insufficient_data',
      action: 'Complete Tank Setup',
      state: {
        ...baseConfiguredState,
        aquariums: [{ ...baseConfiguredState.aquariums[0], dimensions: undefined, targetTemperature: undefined }],
      },
    },
  ];
  for (const testCase of stateCases) {
    const current = await newSeededPage({ state: testCase.state });
    const dialog = await openWishlistDetail(current.page);
    await dialog.locator(`[data-visual-result-status="${testCase.status}"]`).waitFor();
    const action = dialog.getByRole('button', { name: testCase.action, exact: true });
    assert.equal(await action.count(), 1, `${testCase.name} must expose exactly one contextual action`);
    if (testCase.expectedUrl) {
      assert.equal(await dialog.getByRole('button', { name: /Confirm Add/, exact: false }).count(), 0, 'not-recommended detail must not imply that adding can be confirmed');
      await action.click();
      await current.page.waitForURL(testCase.expectedUrl);
      assert.equal(await current.page.getByRole('button', { name: 'Add to Current Tank', exact: true }).count(), 0, 'not-recommended destination must not expose a direct add action');
    }
    await current.context.close();
  }

  const ownedCollection = await newSeededPage({ state: createState({ withTank: true, owned: true }) });
  const ownedCollectionDialog = await openWishlistDetail(ownedCollection.page);
  const tankAction = ownedCollectionDialog.getByRole('button', { name: 'Livestock in Tank', exact: true });
  assert.equal(await tankAction.count(), 1, 'owned atlas detail must have one view-in-tank action');
  await tankAction.click();
  await ownedCollection.page.waitForURL(/\/aquarium\?action=livestock$/);
  await ownedCollection.context.close();

  const ownedAquarium = await newSeededPage({ state: createState({ withTank: true, owned: true }) });
  await ownedAquarium.page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await ownedAquarium.page.locator('.aquarium-archive button[aria-haspopup="dialog"]').click();
  const roster = ownedAquarium.page.locator('[role="dialog"]:visible').filter({ hasText: '缸内物种' }).first();
  await roster.getByRole('button', { name: /Open .* profile/ }).click();
  const aquariumDetail = ownedAquarium.page.locator('[role="dialog"][data-surface]:visible');
  const careAction = aquariumDetail.getByRole('button', { name: 'View Care Essentials', exact: true });
  assert.equal(await careAction.count(), 1, 'owned aquarium detail must replace the duplicate tank entry with one contextual action');
  await careAction.click();
  assert.equal(await aquariumDetail.getByRole('tab', { name: 'Care essentials', exact: true }).getAttribute('aria-selected'), 'true');
  assert.match(ownedAquarium.page.url(), /\/aquarium$/);
  await ownedAquarium.context.close();

  console.log('species detail experience verified: canonical metrics, unique CTA, collection routing, and owned context');
} finally {
  await browser.close();
}

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
      fishId: 'sp_0436',
      quantity: 6,
      entryDate: '2026-07-01',
      lastWaterChangeDate: '2026-07-20',
    }] : [],
    dimensions: { length: '60', width: '35', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }] : [],
  wishlist: ['sp_0436'],
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
    localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0436']));
    localStorage.setItem('aquaguide_locale', language);
  }, { saved: state, language: locale });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  return { context, page };
};

const openWishlistDetail = async page => {
  await page.goto(`${baseUrl}/collection/wishlist`, { waitUntil: 'domcontentloaded' });
  await page.locator('#collection-wishlist-sp_0436 button').first().click();
  const dialog = page.locator('[role="dialog"][data-surface]:visible');
  await dialog.waitFor();
  // Radix sheet entrance animation can leave the dialog in an intermediate
  // transform state; settle it before measuring the canonical phone layout.
  await page.waitForTimeout(300);
  return dialog;
};

try {
  const noTank = await newSeededPage({ state: createState({ withTank: false }) });
  const noTankDialog = await openWishlistDetail(noTank.page);
  const setupAction = noTankDialog.getByRole('button', { name: 'Go to Tank Settings', exact: true });
  assert.equal(await setupAction.count(), 1, 'no-tank detail must expose exactly one primary action');
  await noTankDialog.getByRole('button', { name: /Compatibility/ }).click();
  await noTankDialog.locator('.visual-result-card[data-visual-result-status="insufficient_data"]').waitFor();
  await setupAction.click();
  await noTank.page.waitForURL(/\/aquarium\?action=create$/);
  await noTank.context.close();

  const metricIdsByLocale = {};
  for (const locale of ['zh-CN', 'en']) {
    const current = await newSeededPage({ locale, state: createState({ withTank: true, owned: false }), phone: locale === 'en' });
    const dialog = await openWishlistDetail(current.page);
    // The canonical seeded tank has one simulated guppy, below the reviewed
    // minimum group size. The detail CTA must therefore stay on the
    // caution/review path instead of implying a direct add.
    const primaryLabel = locale === 'en' ? 'Check Risks & Confirm Add' : '查看风险后确认添加';
    const primaryAction = dialog.getByRole('button', { name: primaryLabel, exact: true });
    assert.equal(await primaryAction.count(), 1, 'configured detail must have one contextual primary action');
    if (locale === 'zh-CN') {
      const [displayTitle, scientificName] = await Promise.all([
        dialog.getByRole('heading', { name: '孔雀鱼', exact: true }),
        dialog.locator('[data-scientific-name]').first(),
      ]);
      assert.equal(await displayTitle.evaluate(node => getComputedStyle(node).fontStyle), 'normal', '中文物种名不应被强制斜体');
      assert.match((await scientificName.textContent())?.trim() || '', /Poecilia reticulata/, '详情必须展示完整学名');
    }
    if (locale === 'en') {
      const [dialogBox, actionBox, heroBox, feedingBox, verdictBox, reasonBoxes] = await Promise.all([
        dialog.boundingBox(),
        primaryAction.boundingBox(),
        dialog.locator('[data-species-detail-hero]').boundingBox(),
        dialog.locator('[data-species-feeding-summary]').boundingBox(),
        dialog.locator('[data-visual-result-status]').first().boundingBox(),
        dialog.locator('[aria-label="Key reasons"] > div').evaluateAll(nodes => nodes.map(node => {
          const box = node.getBoundingClientRect();
          return { y: box.y, height: box.height };
        })),
      ]);
      assert.ok(dialogBox && actionBox && heroBox && feedingBox && verdictBox, 'phone primary information must have visible bounds');
      assert.ok(actionBox.y >= verdictBox.y + verdictBox.height, 'phone primary action must follow the fit verdict in document order');
      assert.equal(reasonBoxes.length, 3, 'phone detail must render three key reasons without claiming they all fit before scrolling');
      assert.ok(heroBox.y + heroBox.height < feedingBox.y, 'phone hero and feeding summary must not overlap');
      assert.ok(feedingBox.y + feedingBox.height < verdictBox.y, 'feeding summary must appear before the fit verdict');
      assert.ok(verdictBox.y < actionBox.y, 'phone must show the fit verdict before the primary action');
      const lastReason = dialog.locator('[aria-label="Key reasons"] > div').last();
      await lastReason.evaluate(node => node.scrollIntoView({ block: 'center' }));
      await current.page.waitForTimeout(120);
      const [scrolledReasonBox, scrolledDialogBox] = await Promise.all([lastReason.boundingBox(), dialog.boundingBox()]);
      assert.ok(scrolledReasonBox && scrolledDialogBox && scrolledReasonBox.y >= scrolledDialogBox.y && scrolledReasonBox.y + scrolledReasonBox.height <= scrolledDialogBox.y + scrolledDialogBox.height, 'phone reasons must remain reachable after the inline primary action');
    }
    const fitSection = dialog.getByRole('button', { name: locale === 'en' ? /Tank fit evidence/ : /适配依据/ });
    assert.equal(await fitSection.getAttribute('aria-expanded'), 'false', 'fit evidence must be collapsed on first open');
    await fitSection.click();
    metricIdsByLocale[locale] = await dialog.locator('[data-species-fit-metric]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-species-fit-metric')).sort());
    assert.deepEqual(metricIdsByLocale[locale], ['fit-filter', 'fit-heater', 'fit-space', 'fit-temperature', 'fit-water_type']);
    assert.doesNotMatch(await dialog.innerText(), /pH range matches|pH 范围与物种资料匹配/);
    if (locale === 'en') {
      await primaryAction.click();
      await current.page.waitForURL(/\/encyclopedia\?mode=compatibility/);
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
      expectedUrl: /\/encyclopedia\?mode=compatibility/,
      state: {
        ...baseConfiguredState,
        aquariums: [{ ...baseConfiguredState.aquariums[0], waterType: 'Saltwater' }],
      },
    },
    {
      name: 'predation conflict',
      status: 'not_recommended',
      action: 'View Risks & Alternatives',
      expectedUrl: /\/encyclopedia\?mode=compatibility/,
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
    if (testCase.name === 'caution') {
      await dialog.getByRole('button', { name: /Tank fit evidence/ }).click();
      const temperatureMetric = dialog.locator('[data-species-fit-metric="fit-temperature"]');
      assert.equal(await temperatureMetric.evaluate(node => node.tagName), 'BUTTON', 'an abnormal temperature metric must be actionable');
      await temperatureMetric.click();
      await current.page.waitForURL(/\/aquarium#settings-parameters$/);
    }
    if (testCase.expectedUrl) {
      await dialog.getByRole('button', { name: /^Compatibility/ }).click();
      assert.equal(await dialog.getByRole('button', { name: 'Compatibility Calculator', exact: true }).count(), 0, 'risk detail must not duplicate the footer route inside compatibility evidence');
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
  await ownedAquarium.page.locator('[data-tank-species-entry]').click();
  const roster = ownedAquarium.page.locator('[role="dialog"][data-surface="task-flow"]:visible').first();
  await roster.locator('[data-livestock-open-profile]').click();
  const aquariumDetail = ownedAquarium.page.locator('[role="dialog"][data-surface]:visible');
  const careAction = aquariumDetail.getByRole('button', { name: 'View Care Essentials', exact: true });
  assert.equal(await careAction.count(), 1, 'owned aquarium detail must replace the duplicate tank entry with one contextual action');
  await careAction.click();
  const environmentSummary = aquariumDetail.locator('[data-species-environment-summary]');
  await ownedAquarium.page.waitForFunction(() => document.activeElement?.hasAttribute('data-species-environment-summary'));
  assert.equal(await environmentSummary.evaluate(element => element === document.activeElement), true, 'owned aquarium action must focus the directly visible environment summary');
  assert.equal(await aquariumDetail.getByText('Feeding at a glance', { exact: true }).count(), 1, 'feeding summary must stay directly visible without a disclosure');
  assert.match(ownedAquarium.page.url(), /\/aquarium$/);
  await ownedAquarium.context.close();

  console.log('species detail experience verified: visible feeding, scoped evidence, unique CTA, routing, and owned context');
} finally {
  await browser.close();
}

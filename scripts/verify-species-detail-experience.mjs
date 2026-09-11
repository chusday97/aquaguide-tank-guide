import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4319';
const browser = await chromium.launch({ headless: true });

const createState = ({ withTank = true, owned = false } = {}) => ({
  version: 1,
  currentAquariumId: withTank ? 'detail-tank' : '',
  aquariums: withTank ? [{
    id: 'detail-tank',
    name: 'Species detail tank',
    fishes: owned ? [{
      id: 'owned-sp-0431',
      fishId: 'sp_0431',
      quantity: 6,
      entryDate: '2026-07-01',
      lastWaterChangeDate: '2026-07-20',
    }] : [],
    dimensions: { length: '60', width: '35', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }] : [],
  wishlist: ['sp_0431'],
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
    localStorage.setItem('wishlistFishIds', JSON.stringify(saved.wishlist || ['sp_0431']));
    localStorage.setItem('aquaguide_locale', language);
  }, { saved: state, language: locale });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  return { context, page };
};

const openWishlistDetail = async (page, fishId = 'sp_0431') => {
  await page.goto(`${baseUrl}/collection/wishlist`, { waitUntil: 'domcontentloaded' });
  await page.locator(`#collection-wishlist-${fishId} button`).first().click();
  const dialog = page.locator('[role="dialog"][data-surface]:visible');
  await dialog.waitFor();
  return dialog;
};

try {
  const tigerState = { ...createState({ withTank: true, owned: false }), wishlist: ['sp_0439'] };
  const tiger = await newSeededPage({ locale: 'zh-CN', state: tigerState });
  const tigerDialog = await openWishlistDetail(tiger.page, 'sp_0439');
  assert.equal(await tigerDialog.getByText('群体 8+', { exact: true }).count() > 0, true, 'reviewed tiger-barb group authority must replace stale single-housing label');
  assert.equal(await tigerDialog.getByText('建议单养', { exact: true }).count(), 0, 'stale catalog single-housing label must not leak into reviewed tiger-barb detail');
  await tiger.context.close();

  const noTank = await newSeededPage({ state: createState({ withTank: false }) });
  const noTankDialog = await openWishlistDetail(noTank.page);
  const setupAction = noTankDialog.getByRole('button', { name: 'Go to Tank Settings', exact: true });
  assert.equal(await setupAction.count(), 1, 'no-tank detail must expose exactly one primary action');
  await noTankDialog.getByRole('button', { name: /Compatibility/ }).click();
  assert.equal(await noTankDialog.getByText('暂未开放这组混养建议', { exact: true }).count(), 1, 'no-tank detail must show the safe unavailable state instead of a fabricated verdict');
  await setupAction.click();
  await noTank.page.waitForURL(/\/aquarium\?action=create$/);
  await noTank.context.close();

  const metricIdsByLocale = {};
  for (const locale of ['zh-CN', 'en']) {
    const current = await newSeededPage({ locale, state: createState({ withTank: true, owned: false }), phone: locale === 'en' });
    const dialog = await openWishlistDetail(current.page);
    assert.equal(await dialog.getAttribute('data-surface'), locale === 'en' ? 'bottom-sheet' : 'detail-rail', 'detail surface must follow the viewport contract');
    // The reviewed neon-tetra authority requires a group of at least eight.
    // Species detail evaluates one planned individual by default, so it must
    // route the user through the risk view instead of offering a direct add.
    const primaryLabel = locale === 'en' ? 'View current tank risks' : '查看当前鱼缸风险';
    const primaryAction = dialog.getByRole('button', { name: primaryLabel, exact: true });
    assert.equal(await primaryAction.count(), 1, 'reviewed schooling requirement must expose one risk-review action');

    const spaceKnowledge = dialog.locator('[data-species-knowledge="space"]');
    const socialKnowledge = dialog.locator('[data-species-knowledge="social"]');
    assert.equal(await spaceKnowledge.count(), 1, 'reviewed space knowledge must be rendered');
    assert.equal(await socialKnowledge.count(), 1, 'reviewed social knowledge must be rendered');
    await spaceKnowledge.locator('summary').click();
    const spaceText = await spaceKnowledge.innerText();
    assert.match(spaceText, locale === 'en' ? /Adult size & space/ : /成体与空间/);
    assert.match(spaceText, /3 cm/);
    assert.match(spaceText, /≥54L/);
    assert.match(spaceText, /≥60cm/);
    assert.match(spaceText, locale === 'en' ? /Midwater/ : /中层/);
    assert.match(spaceText, locale === 'en' ? /long-term planning references/ : /长期空间规划参考/);
    await socialKnowledge.locator('summary').click();
    const socialText = await socialKnowledge.innerText();
    assert.match(socialText, locale === 'en' ? /Minimum group:\s*8 individuals/ : /最低群体：\s*8 条\/只/);
    assert.match(socialText, locale === 'en' ? /Recommended group:\s*8–10 individuals/ : /建议群体：\s*8–10 条\/只/);
    assert.match(socialText, locale === 'en' ? /Swimming zone:\s*Midwater/ : /活动水层：\s*中层/);
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
      assert.ok(actionBox.y >= dialogBox.y && actionBox.y + actionBox.height <= dialogBox.y + dialogBox.height, 'phone primary action must stay visible in the initial dialog viewport');
      assert.equal(reasonBoxes.length, 3, 'phone detail must render three key reasons without claiming they all fit before scrolling');
      assert.ok(heroBox.y + heroBox.height < feedingBox.y, 'phone hero and feeding summary must not overlap');
      assert.ok(feedingBox.y + feedingBox.height < verdictBox.y, 'feeding summary must appear before the fit verdict');
      await dialog.locator('[data-visual-result-status]').first().scrollIntoViewIfNeeded();
      const scrolledVerdictBox = await dialog.locator('[data-visual-result-status]').first().boundingBox();
      const scrolledActionBox = await primaryAction.boundingBox();
      assert.ok(scrolledVerdictBox && scrolledActionBox && scrolledVerdictBox.y + scrolledVerdictBox.height <= scrolledActionBox.y, 'phone fit verdict must remain reachable above the sticky primary action');
      const lastReason = dialog.locator('[aria-label="Key reasons"] > div').last();
      await lastReason.scrollIntoViewIfNeeded();
      const [scrolledReasonBox, stickyActionBox] = await Promise.all([lastReason.boundingBox(), primaryAction.boundingBox()]);
      assert.ok(scrolledReasonBox && stickyActionBox && scrolledReasonBox.y + scrolledReasonBox.height <= stickyActionBox.y, 'phone reasons must remain reachable above the sticky primary action after scrolling');
    }
    const fitSection = dialog.getByRole('button', { name: locale === 'en' ? /Tank fit evidence|Why\?/ : /适配依据|为什么？/ });
    assert.equal(await fitSection.getAttribute('aria-expanded'), 'false', 'fit evidence must be collapsed on first open');
    await fitSection.click();
    metricIdsByLocale[locale] = await dialog.locator('[data-species-fit-metric]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-species-fit-metric')).sort());
    assert.deepEqual(metricIdsByLocale[locale], ['fit-filter', 'fit-heater', 'fit-space', 'fit-temperature', 'fit-water_type']);
    assert.doesNotMatch(await dialog.innerText(), /pH range matches|pH 范围与物种资料匹配/);
    if (locale === 'en') {
    }
    await current.context.close();
  }
  assert.deepEqual(metricIdsByLocale.en, metricIdsByLocale['zh-CN'], 'localized details must use the same canonical metric types');

  const baseConfiguredState = createState({ withTank: true, owned: false });
  const stateCases = [
    {
      name: 'caution',
      // The current rules classify a temperature mismatch as a blocking
      // recommendation, so the rendered presentation is not_recommended.
      status: 'not_recommended',
      action: 'View current tank risks',
      state: {
        ...baseConfiguredState,
        aquariums: [{
          ...baseConfiguredState.aquariums[0],
          targetTemperature: '29',
          fishes: [{
            id: 'existing-sp-0432',
            fishId: 'sp_0432',
            quantity: 5,
            entryDate: '2026-07-01',
            lastWaterChangeDate: '2026-07-20',
          }],
        }],
      },
    },
    {
      name: 'not recommended',
      status: 'not_recommended',
      action: 'View current tank risks',
      state: {
        ...baseConfiguredState,
        aquariums: [{ ...baseConfiguredState.aquariums[0], waterType: 'Saltwater' }],
      },
    },
    {
      name: 'unreviewed predator data',
      status: 'insufficient_data',
      action: 'Complete Tank Setup',
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
      await dialog.getByRole('button', { name: /Tank fit evidence|Why\?|适配依据|为什么？/ }).click();
      const temperatureMetric = dialog.locator('[data-species-fit-metric="fit-temperature"]');
      assert.equal(await temperatureMetric.evaluate(node => node.tagName), 'BUTTON', 'an abnormal temperature metric must be actionable');
      await temperatureMetric.click();
      await current.page.waitForURL(/\/aquarium#settings-parameters$/);
    }
    if (testCase.name === 'not recommended') {
      await dialog.getByRole('button', { name: /^Compatibility/ }).click();
      assert.equal(await dialog.getByRole('button', { name: 'Compatibility Calculator', exact: true }).count(), 1, 'compatibility evidence must expose exactly one calculator route');
      assert.equal(await dialog.getByRole('button', { name: /Confirm Add/, exact: false }).count(), 0, 'not-recommended detail must not imply that adding can be confirmed');
      await action.click();
      assert.equal(await current.page.url().includes('/compatibility'), false, 'view risk must stay in the species detail');
      assert.equal(await dialog.locator('[data-disclosure-purpose="secondary_evidence"]').count() > 0, true, 'risk evidence must remain visible in place');
      await dialog.getByRole('button', { name: /打开混养计算器|Compatibility Calculator/ }).click();
      await current.page.waitForURL(/\/compatibility/);
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
  const roster = ownedAquarium.page.locator('[role="dialog"]:visible').filter({ hasText: /缸内物种|Tank livestock/ }).first();
  await roster.getByRole('button', { name: /Open .* profile|打开.*资料/ }).click();
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

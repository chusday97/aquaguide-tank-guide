import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });

const createState = (speciesCount = 0) => ({
  version: 1,
  currentAquariumId: 'tank-c',
  aquariums: [{
    id: 'tank-c',
    name: 'Beginner Community Aquarium',
    fishes: Array.from({ length: speciesCount }, (_, index) => ({
      id: `stock-${index + 1}`,
      fishId: `sp_${String(index + 1).padStart(4, '0')}`,
      quantity: index + 1,
      entryDate: '2026-07-20T00:00:00.000Z',
      lastWaterChangeDate: '2026-07-20T00:00:00.000Z',
      batches: [{
        id: `batch-${index + 1}`,
        quantity: index + 1,
        entryDate: '2026-07-20T00:00:00.000Z',
        lifeStage: index % 2 === 0 ? 'juvenile' : 'adult',
        reproductiveState: 'normal',
        stateUpdatedAt: '2026-07-20T00:00:00.000Z',
      }],
    })),
    lastWaterChangeDate: '2026-07-20T00:00:00.000Z',
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  }],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false },
  updatedAt: new Date().toISOString(),
});

const seed = async (page, state = createState()) => {
  await page.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'en');
  }, state);
};

const assertNoHorizontalOverflow = async page => {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
};

const assertControlInsideViewport = async (locator, label) => {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert.ok(box, `${label} must be visible`);
  const viewportWidth = await locator.evaluate(() => window.innerWidth);
  assert.ok(box.x >= 0 && box.x + box.width <= viewportWidth + 0.5, `${label} must stay inside the viewport`);
  assert.equal(await locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return Boolean(hit && (hit === element || element.contains(hit)));
  }), true, `${label} center must hit the intended control`);
};

try {
  for (const width of [1440, 1000, 600]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'en-US' });
    await seed(page);
    await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Tank Basics' }).waitFor();
    assert.deepEqual(await page.locator('.aquarium-zone-header').allTextContents().then(items => items.map(item => item.replace(/\s+/g, ' ').trim()).map(item => item.match(/Observe|Manage|Learn & Maintain/)?.[0])), ['Observe', 'Manage', 'Learn & Maintain']);
    assert.equal(await page.locator('.aquarium-recommend:visible').count(), 0, 'duplicate next-action panel must stay hidden');
    assert.equal(await page.locator('.aquarium-advanced-tests').getAttribute('open'), null, 'advanced tests must be collapsed by default');
    assert.equal(await page.locator('.aquarium-workspace-zone > .aquarium-zone-header h2').count(), 3, 'task zones must use semantic headings');
    assert.deepEqual(await page.locator('.aquarium-workspace-zone').evaluateAll(nodes => nodes.map(node => node.classList.contains('aquarium-observe-zone') ? 'observe' : node.classList.contains('aquarium-manage-zone') ? 'manage' : 'learn')), ['observe', 'manage', 'learn']);
    if (width === 1440) {
      const [tankBox, statusBox, archiveBox, manageBox, learnBox] = await Promise.all([
        page.locator('.aquarium-tank').boundingBox(),
        page.locator('.aquarium-status').boundingBox(),
        page.locator('.aquarium-archive').boundingBox(),
        page.locator('.aquarium-manage-zone').boundingBox(),
        page.locator('.aquarium-learn-zone').boundingBox(),
      ]);
      assert.ok(tankBox && statusBox && tankBox.x < statusBox.x, 'Observe must place tank before today action');
      assert.ok(archiveBox && tankBox && archiveBox.y > tankBox.y + tankBox.height, 'livestock preview must be part of Observe below the tank');
      assert.ok(manageBox && learnBox && manageBox.x < learnBox.x, 'Manage and Learn must share one row on wide desktop');
      assert.ok(archiveBox.height < 190, 'livestock preview must stay compact before its dialog opens');
    }
    if (width === 600) {
      const newAquarium = page.getByRole('button', { name: 'New Aquarium' });
      await assertControlInsideViewport(newAquarium, '600px New Aquarium');
      await assertControlInsideViewport(page.getByRole('button', { name: 'Browse Care Guides' }), '600px Browse Care Guides');
      await newAquarium.click();
      await page.getByText(/Created new aquarium/).waitFor();
    }
    await assertNoHorizontalOverflow(page);
    await page.close();
  }

  for (const speciesCount of [1, 2, 4]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
    await seed(page, createState(speciesCount));
    await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Tank Basics' }).waitFor();
    assert.equal(await page.locator('.aquarium-archive-preview img').count(), speciesCount, `${speciesCount}-species preview must show every seeded species`);
    const archive = page.locator('.aquarium-archive');
    await archive.locator('button[aria-haspopup="dialog"]').click();
    const roster = page.getByRole('dialog').filter({ hasText: '缸内物种' }).first();
    await roster.waitFor();
    assert.equal(await roster.locator('article').count(), speciesCount, 'roster dialog must show every seeded species');
    assert.equal(await archive.locator('.aquarium-archive-preview').count(), 1, 'compact preview must remain stable behind the dialog');
    if (speciesCount === 4) {
      await roster.getByRole('button', { name: /移出鱼缸/ }).first().click();
      const confirmation = page.getByRole('dialog').filter({ hasText: '不要放生' }).first();
      await confirmation.waitFor();
      await confirmation.getByRole('button', { name: '确认已移出 1 只/条' }).click();
      await confirmation.waitFor({ state: 'detached' });
      await roster.locator('article').nth(3).waitFor({ state: 'detached' });
      assert.equal(await roster.locator('article').count(), 3, 'removing the final batch must remove the species card');
    }
    await page.close();
  }

  const removalRetry = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  await removalRetry.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, createState(1));
  await removalRetry.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await removalRetry.locator('.aquarium-archive button[aria-haspopup="dialog"]').click();
  const retryRoster = removalRetry.getByRole('dialog').filter({ hasText: '缸内物种' }).first();
  await retryRoster.getByRole('button', { name: /移出鱼缸/ }).click();
  const retryConfirmation = removalRetry.getByRole('dialog').filter({ hasText: '不要放生' }).first();
  const operationId = await retryConfirmation.getAttribute('data-removal-operation-id');
  await removalRetry.evaluate(() => {
    const originalSetItem = Storage.prototype.setItem;
    let shouldFail = true;
    window.__livestockRemovalFailureInjected = false;
    Storage.prototype.setItem = function setItemWithOneFailure(key, value) {
      const removesFinalSpecies = key === 'aquarium_app_state_v1'
        && JSON.parse(String(value)).aquariums?.[0]?.fishes?.length === 0;
      if (removesFinalSpecies && shouldFail) {
        shouldFail = false;
        window.__livestockRemovalFailureInjected = true;
        throw new DOMException('simulated storage failure', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await retryConfirmation.getByRole('button', { name: '确认已移出 1 只/条' }).click();
  await retryConfirmation.getByRole('alert').waitFor();
  assert.equal(await removalRetry.evaluate(() => window.__livestockRemovalFailureInjected), true, 'the first removal persistence must hit the injected response failure');
  assert.equal(await retryConfirmation.getAttribute('data-removal-operation-id'), operationId, 'failed response retry must keep the same removal operation id');
  assert.equal(await retryConfirmation.getByRole('spinbutton', { name: '移出数量' }).isDisabled(), true, 'submitted quantity must stay locked until cancel or success');
  await retryConfirmation.getByRole('button', { name: '确认已移出 1 只/条' }).click();
  await retryConfirmation.waitFor({ state: 'detached' });
  assert.equal(await retryRoster.locator('article').count(), 0, 'retry must finish the original removal once');
  await removalRetry.close();

  const emptyDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  await seed(emptyDesktop);
  await emptyDesktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await emptyDesktop.getByRole('button', { name: 'Add Livestock' }).click();
  await emptyDesktop.getByRole('dialog').waitFor();
  await emptyDesktop.close();

  const multiTankState = createState(1);
  multiTankState.aquariums.push({
    ...structuredClone(multiTankState.aquariums[0]),
    id: 'tank-second',
    name: '隔离观察缸',
    fishes: [],
  });
  const tankNavigationDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
  await seed(tankNavigationDesktop, multiTankState);
  await tankNavigationDesktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await tankNavigationDesktop.getByRole('heading', { name: /鱼缸基础|Tank Basics/ }).waitFor();
  const tankNavigation = tankNavigationDesktop.getByRole('region', { name: '切换鱼缸' });
  await tankNavigation.getByRole('button', { name: /隔离观察缸/ }).click();
  await tankNavigationDesktop.waitForURL(/tank=tank-second/);
  await tankNavigationDesktop.locator('.aquarium-desktop-header').getByText('隔离观察缸', { exact: true }).waitFor();
  await tankNavigationDesktop.getByRole('button', { name: '重命名鱼缸' }).click();
  const renameInput = tankNavigationDesktop.getByRole('textbox', { name: '鱼缸名称' });
  await renameInput.fill('新鱼观察缸');
  await tankNavigationDesktop.getByRole('button', { name: '保存', exact: true }).click();
  await tankNavigationDesktop.locator('.aquarium-desktop-header').getByText('新鱼观察缸', { exact: true }).waitFor();
  await tankNavigation.getByText('新鱼观察缸', { exact: true }).waitFor();
  await tankNavigationDesktop.close();

  const riskState = createState(1);
  riskState.aquariums[0].dimensions = { length: '10', width: '10', height: '10' };
  riskState.aquariums[0].fishes[0].quantity = 100;
  riskState.aquariums[0].fishes[0].batches[0].quantity = 100;
  const riskDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });
  await seed(riskDesktop, riskState);
  await riskDesktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  const riskTrigger = riskDesktop.locator('button').filter({ hasText: /风险|Risk/ }).first();
  await riskTrigger.waitFor();
  await riskTrigger.click();
  const riskDialog = riskDesktop.getByRole('dialog').filter({ hasText: '鱼缸风险处理' });
  await riskDialog.waitFor();
  assert.equal(await riskDialog.locator('ol li').count(), 3, 'risk guide must expose three concrete steps');
  assert.ok(await riskDialog.locator('img').count() >= 1, 'risk guide must visualize the affected species');
  assert.equal(await riskDialog.locator('details').count(), 1, 'avoid actions must stay collapsed on first view');
  await riskDialog.getByRole('button', { name: /调整.*数量|查看当前负载来源/ }).click();
  await riskDesktop.getByRole('dialog').filter({ hasText: '缸内物种' }).waitFor();
  await riskDesktop.close();

  for (const width of [320, 375, 390, 430]) {
    const phone = await browser.newPage({
      viewport: { width, height: 844 },
      locale: 'en-US',
      hasTouch: true,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    });
    await seed(phone);
    await phone.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
    const manageToggle = phone.getByRole('button', { name: 'Open management tasks' });
    await manageToggle.waitFor();
    assert.equal(await manageToggle.getAttribute('aria-expanded'), 'false', 'phone management zone should start collapsed');
    const learningToggle = phone.getByRole('button', { name: 'Open learning tasks' });
    await learningToggle.waitFor();
    assert.equal(await learningToggle.getAttribute('aria-expanded'), 'false', 'phone learning zone should start collapsed');
    await learningToggle.click();
    await phone.waitForFunction(() => document.querySelector('#aquarium-learn-zone .aquarium-zone-toggle')?.getAttribute('aria-expanded') === 'true');
    assert.equal(
      await phone.locator('#aquarium-learn-zone .aquarium-zone-toggle').getAttribute('aria-expanded'),
      'true',
      'phone learning zone should expand in place',
    );
    await phone.getByRole('heading', { name: 'Tank Basics' }).waitFor();
    const onboardingBox = await phone.locator('.aquarium-onboarding').boundingBox();
    const observeBox = await phone.locator('.aquarium-observe-zone').boundingBox();
    assert.ok(onboardingBox && observeBox && onboardingBox.y + onboardingBox.height < observeBox.y, 'onboarding must stay before Observe on phone');
    const zonePositions = await phone.locator('.aquarium-zone-header').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
    assert.ok(zonePositions[0] < zonePositions[1] && zonePositions[1] < zonePositions[2], 'phone task zones must keep Observe → Manage → Learn order');
    await assertControlInsideViewport(phone.getByText('View all 4 steps', { exact: true }), `${width}px onboarding details`);
    assert.equal(await phone.getByText('Advanced Water Tests (Optional)', { exact: true }).count(), 1);
    await assertNoHorizontalOverflow(phone);
    await phone.close();
  }

  const deepLinkPhone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    locale: 'en-US',
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });
  await seed(deepLinkPhone);
  await deepLinkPhone.goto(`${baseUrl}/aquarium?action=livestock`, { waitUntil: 'domcontentloaded' });
  const targetedManageZone = deepLinkPhone.locator('#aquarium-manage-zone');
  await deepLinkPhone.waitForFunction(() => document.querySelector('#aquarium-manage-zone .aquarium-zone-toggle')?.getAttribute('aria-expanded') === 'true');
  assert.equal(await targetedManageZone.evaluate(element => element === document.activeElement), true, 'manage deep link must focus the target zone');
  assert.equal(await targetedManageZone.evaluate(element => element.classList.contains('aquarium-zone-target')), true, 'manage deep link must highlight the target zone');
  await deepLinkPhone.close();

  console.log('aquarium homepage C verified: guided zones, optional advanced tests, and responsive English layout');
} finally {
  await browser.close();
}

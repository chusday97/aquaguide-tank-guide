import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:4173';
const browser = await chromium.launch({ headless: true });

const riskyState = {
  version: 1,
  currentAquariumId: 'risk-nav-tank',
  aquariums: [{
    id: 'risk-nav-tank',
    name: 'Risk navigation tank',
    fishes: [],
    dimensions: { length: '60', width: '35', height: '40' },
    waterType: 'Saltwater',
    targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }],
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
    viewedSpecies: true,
    taskCardDismissed: true,
    aquariumConfigured: true,
  },
  updatedAt: '2026-08-19T00:00:00.000Z',
};

const createPage = async () => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: 'zh-CN',
  });
  await context.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, riskyState);
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  return { context, page, errors };
};

const assertCompatibilitySurface = async page => {
  const drawer = page.locator('[data-surface="compatibility-checkout-drawer"]:visible');
  await drawer.waitFor();
  await page.waitForFunction(() => {
    const calculatorNode = document.getElementById('compatibility-calculator');
    const browseSurface = calculatorNode?.previousElementSibling;
    return browseSurface instanceof HTMLElement
      && browseSurface.dataset.encyclopediaBrowseSurfaceHidden === 'true'
      && browseSurface.style.display === 'none';
  });
  await page.waitForTimeout(150);

  const workspace = page.locator('.desktop-workspace-scroll');
  const [scrollState, drawerBox] = await Promise.all([
    workspace.evaluate(element => ({
      top: element.scrollTop,
      max: Math.max(0, element.scrollHeight - element.clientHeight),
    })),
    drawer.boundingBox(),
  ]);

  assert.ok(drawerBox, 'compatibility drawer must be visible');
  assert.ok(drawerBox.y <= 10, `compatibility drawer must start at the viewport top, got y=${drawerBox.y}`);
  assert.ok(drawerBox.height >= 760, `compatibility drawer must occupy the workspace height, got height=${drawerBox.height}`);
  assert.ok(scrollState.top <= 120, `compatibility mode must reset the Atlas workspace near the top, got scrollTop=${scrollState.top}`);
  if (scrollState.max > 240) {
    assert.ok(scrollState.top < scrollState.max * 0.35, `compatibility mode must not restore a near-bottom Atlas scroll position (${scrollState.top}/${scrollState.max})`);
  }
};

try {
  const detailCase = await createPage();
  await detailCase.page.goto(`${baseUrl}/encyclopedia?species=sp_0001&source=atlas-detail`, { waitUntil: 'domcontentloaded' });
  const dialog = detailCase.page.locator('[role="dialog"][data-surface]:visible');
  await dialog.waitFor();
  await dialog.locator('[data-visual-result-status="not_recommended"]').waitFor();

  const footerAction = dialog.locator('.modalFooter button').first();
  assert.equal(await footerAction.count(), 1, 'not-recommended detail must expose one footer action');
  const urlBeforeRiskReview = detailCase.page.url();

  // Stage 1: reviewing risk must stay inside the species detail.
  await footerAction.click();
  const compatibilityDisclosure = dialog.getByRole('button', { name: /混养关系|Compatibility/i });
  await detailCase.page.waitForFunction(() => {
    const candidates = [...document.querySelectorAll('[data-detail-kind="species"] button[data-disclosure-purpose="secondary_evidence"]')];
    const compatibility = candidates.find(button => /混养关系|Compatibility/i.test(button.textContent || ''));
    return compatibility?.getAttribute('aria-expanded') === 'true';
  });
  assert.equal(await compatibilityDisclosure.getAttribute('aria-expanded'), 'true', 'risk CTA must expand in-dialog compatibility evidence');
  assert.equal(detailCase.page.url(), urlBeforeRiskReview, 'first risk review must not silently navigate to compatibility mode');
  assert.equal(await dialog.isVisible(), true, 'first risk review must keep the species detail open');

  // Stage 2: after evidence has been reviewed, the same CTA may open the full calculator.
  await footerAction.click();
  await detailCase.page.waitForURL(/\/encyclopedia\?mode=compatibility/);
  await assertCompatibilitySurface(detailCase.page);
  assert.equal(detailCase.errors.length, 0, `risk-to-compatibility flow emitted page errors: ${detailCase.errors.join(' | ')}`);
  await detailCase.context.close();

  // Direct/sidebar navigation must obey the same top-level surface contract.
  const directCase = await createPage();
  await directCase.page.goto(`${baseUrl}/encyclopedia?mode=compatibility`, { waitUntil: 'domcontentloaded' });
  await assertCompatibilitySurface(directCase.page);
  assert.equal(directCase.errors.length, 0, `direct compatibility mode emitted page errors: ${directCase.errors.join(' | ')}`);
  await directCase.context.close();

  console.log('encyclopedia risk navigation verified: in-context risk review + top-level compatibility drawer without Atlas bottom-scroll restoration');
} finally {
  await browser.close();
}

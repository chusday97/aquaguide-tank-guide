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

try {
  const detailCase = await createPage();
  await detailCase.page.goto(`${baseUrl}/encyclopedia?species=sp_0001&source=atlas-detail`, { waitUntil: 'domcontentloaded' });
  const dialog = detailCase.page.locator('[role="dialog"][data-surface]:visible');
  await dialog.waitFor();
  await dialog.locator('[data-visual-result-status="not_recommended"]').waitFor();

  const footerAction = dialog.locator('.modalFooter button').first();
  assert.match(await footerAction.innerText(), /风险|替代|Risk|Alternative/i, 'risk footer CTA must describe risk review rather than an unrelated action');
  const urlBeforeRiskReview = detailCase.page.url();
  await footerAction.click();

  const compatibilityDisclosure = dialog.getByRole('button', { name: /混养关系|Compatibility/i });
  await detailCase.page.waitForFunction(() => {
    const candidates = [...document.querySelectorAll('[data-detail-kind="species"] button[data-disclosure-purpose="secondary_evidence"]')];
    const compatibility = candidates.find(button => /混养关系|Compatibility/i.test(button.textContent || ''));
    return compatibility?.getAttribute('aria-expanded') === 'true';
  });
  assert.equal(await compatibilityDisclosure.getAttribute('aria-expanded'), 'true', 'risk CTA must expand in-dialog compatibility evidence');
  assert.equal(detailCase.page.url(), urlBeforeRiskReview, 'risk review must not silently navigate to compatibility mode');
  assert.equal(await dialog.isVisible(), true, 'risk review must keep the species detail open');
  assert.equal(detailCase.errors.length, 0, `risk review emitted page errors: ${detailCase.errors.join(' | ')}`);
  await detailCase.context.close();

  const compatibilityCase = await createPage();
  await compatibilityCase.page.goto(`${baseUrl}/encyclopedia?mode=compatibility`, { waitUntil: 'domcontentloaded' });
  const calculator = compatibilityCase.page.locator('#compatibility-calculator');
  await calculator.waitFor();
  await compatibilityCase.page.waitForFunction(() => {
    const calculatorNode = document.getElementById('compatibility-calculator');
    const browseSurface = calculatorNode?.previousElementSibling;
    return browseSurface instanceof HTMLElement
      && browseSurface.dataset.encyclopediaBrowseSurfaceHidden === 'true'
      && browseSurface.style.display === 'none';
  });

  await compatibilityCase.page.waitForTimeout(150);
  const workspace = compatibilityCase.page.locator('.desktop-workspace-scroll');
  const scrollState = await workspace.evaluate(element => ({
    top: element.scrollTop,
    max: Math.max(0, element.scrollHeight - element.clientHeight),
  }));
  const calculatorBox = await calculator.boundingBox();
  assert.ok(calculatorBox, 'compatibility calculator must be visible');
  assert.ok(scrollState.top <= 120, `compatibility mode must start near workspace top, got scrollTop=${scrollState.top}`);
  assert.ok(calculatorBox.y < 260, `compatibility calculator must occupy the top workspace surface, got y=${calculatorBox.y}`);
  if (scrollState.max > 240) {
    assert.ok(scrollState.top < scrollState.max * 0.35, `compatibility mode must not restore a near-bottom atlas scroll position (${scrollState.top}/${scrollState.max})`);
  }
  assert.equal(compatibilityCase.errors.length, 0, `compatibility mode emitted page errors: ${compatibilityCase.errors.join(' | ')}`);
  await compatibilityCase.context.close();

  console.log('encyclopedia risk navigation verified: in-context evidence + top-level compatibility surface');
} finally {
  await browser.close();
}

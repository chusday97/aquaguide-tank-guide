import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const aquariumState = {
  version: 1,
  currentAquariumId: 'authority-presentation-tank',
  aquariums: [{
    id: 'authority-presentation-tank',
    name: 'Authority Presentation Tank',
    fishes: [],
    dimensions: { length: '20', width: '20', height: '27' },
    waterType: 'Freshwater',
    targetTemperature: '24',
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
  onboarding: {
    version: 1,
    status: 'completed',
    viewedSpecies: true,
    taskCardDismissed: true,
    aquariumConfigured: true,
  },
  updatedAt: '2026-08-24T00:00:00.000Z',
};

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  await context.addInitScript(saved => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquariums', JSON.stringify(saved.aquariums));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, aquariumState);

  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.goto(`${baseUrl}/encyclopedia?species=sp_0431&source=atlas-detail`, { waitUntil: 'domcontentloaded' });
  const detail = page.locator('[role="dialog"][data-detail-kind="species"]:visible');
  await detail.waitFor();
  const decision = detail.locator('[data-testid="species-detail-decision"]');
  await decision.waitFor();
  const decisionText = await decision.innerText();
  assert.match(decisionText, /可以尝试，但需要谨慎|Try with caution/i, 'canonical caution verdict must remain visible');
  assert.equal(
    await decision.locator('[data-result-ux-avoid]').count(),
    0,
    'generic tank-size planning guidance must not be promoted into an avoid/blocking instruction when canonical blockingRules is empty',
  );

  const evidenceDetails = decision.locator('[data-result-ux-evidence] details').first();
  await evidenceDetails.locator('summary').click();
  const evidenceText = await evidenceDetails.innerText();
  assert.match(
    evidenceText,
    /minimumGroupSize|至少\s*5|合计\s*1\s*只\/条/i,
    'reviewed group requirement warning must be present in canonical decision evidence',
  );

  const referenceSection = detail.locator('[data-species-fit-reference]');
  await referenceSection.waitFor();
  assert.match(await referenceSection.innerText(), /鱼缸条件参考|Tank context reference/i);
  assert.deepEqual(pageErrors, [], `Species Detail authority presentation emitted page errors: ${pageErrors.join(' | ')}`);

  console.log('Species Detail authority presentation PASS: canonical verdict buckets own watch/avoid/evidence; heuristic metrics are reference-only');
  await context.close();
} finally {
  await browser.close();
}

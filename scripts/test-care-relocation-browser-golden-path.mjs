import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE_URL = process.env.AQUAGUIDE_BROWSER_BASE_URL || 'http://127.0.0.1:4173';
const APP_STATE_KEY = 'aquarium_app_state_v1';
const ARTIFACT_DIR = process.env.AQUAGUIDE_BROWSER_ARTIFACT_DIR || '/tmp/aquaguide-browser-artifacts';
mkdirSync(ARTIFACT_DIR, { recursive: true });

const makeBatch = (id, quantity) => ({
  id,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  lifeStage: 'adult',
  reproductiveState: 'normal',
  stateUpdatedAt: '2026-08-17T00:00:00.000Z',
});

const makeFish = (id, fishId, quantity, batches = [makeBatch(`${id}-batch`, quantity)]) => ({
  id,
  fishId,
  quantity,
  entryDate: '2026-08-17T00:00:00.000Z',
  batches,
});

const makeTank = (id, name, fishes) => ({
  id,
  name,
  fishes,
  dimensions: { length: '120', width: '50', height: '50' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  plants: ['水草'],
  hardscape: ['沉木'],
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
});

const makeState = ({ tigerBatches } = {}) => ({
  version: 1,
  currentAquariumId: 'source',
  aquariums: [
    makeTank('source', '冲突缸', [
      makeFish('convict-record', 'sp_0021', 1),
      makeFish('tiger-record', 'sp_0439', 6, tigerBatches || [makeBatch('tiger-batch', 6)]),
    ]),
    makeTank('target', '安全目标缸', []),
  ],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  updatedAt: '2026-08-17T00:00:00.000Z',
});

const speciesQuantity = (state, aquariumId, fishId) => {
  const aquarium = state.aquariums.find(item => item.id === aquariumId);
  return (aquarium?.fishes || [])
    .filter(item => item.fishId === fishId)
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
};

const addBrowserInstrumentation = async (context, seedState) => {
  await context.addInitScript(({ appStateKey, state }) => {
    const rawSetItem = Storage.prototype.setItem;
    rawSetItem.call(localStorage, appStateKey, JSON.stringify(state));
    rawSetItem.call(localStorage, 'aquariums', JSON.stringify(state.aquariums));

    window.__aqRelocationTransitions = 0;
    window.__aqAppStateWrites = 0;
    window.__aqThrowNextAppStateWrite = false;
    let previousState = state;

    const qty = (value, aquariumId, fishId) => {
      const aquarium = value?.aquariums?.find?.(item => item.id === aquariumId);
      return (aquarium?.fishes || [])
        .filter(item => item.fishId === fishId)
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    };

    Storage.prototype.setItem = function patchedSetItem(key, value) {
      if (this === localStorage && key === appStateKey) {
        if (window.__aqThrowNextAppStateWrite) {
          window.__aqThrowNextAppStateWrite = false;
          throw new Error('browser fixture forced app-state write failure');
        }
        window.__aqAppStateWrites += 1;
        try {
          const nextState = JSON.parse(String(value));
          const priorSource = qty(previousState, 'source', 'sp_0439');
          const priorTarget = qty(previousState, 'target', 'sp_0439');
          const nextSource = qty(nextState, 'source', 'sp_0439');
          const nextTarget = qty(nextState, 'target', 'sp_0439');
          if (nextSource < priorSource && nextTarget > priorTarget) {
            window.__aqRelocationTransitions += 1;
          }
          previousState = nextState;
        } catch {
          // Product code owns malformed-data handling. Instrumentation should not
          // change it merely because transition counting cannot parse a write.
        }
      }
      return rawSetItem.call(this, key, value);
    };

    window.__aqReadAppState = () => JSON.parse(localStorage.getItem(appStateKey) || 'null');
    window.__aqSilentWriteAppState = nextState => {
      rawSetItem.call(localStorage, appStateKey, JSON.stringify(nextState));
    };
  }, { appStateKey: APP_STATE_KEY, state: seedState });
};

const openCareDiagnosis = async (page) => {
  await page.goto(`${BASE_URL}/care?topic=guide_water_deteriorate`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-care-first-screen-primary]').waitFor({ state: 'visible' });
  await page.locator('[data-care-first-screen-primary]').click();
  await page.locator('[data-care-step-diagnosis="true"]').waitFor({ state: 'visible' });
  await page.locator('[data-care-diagnosis-issue="aggression"]').click();

  const questions = page.locator('[data-care-diagnosis-question]');
  const questionCount = await questions.count();
  assert.ok(questionCount > 0, 'aggression diagnosis should render at least one real question');
  for (let index = 0; index < questionCount; index += 1) {
    const question = questions.nth(index);
    const firstOption = question.locator('[data-care-diagnosis-option]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();
  }

  const submit = page.locator('[data-care-diagnosis-submit="true"]');
  await assertEventually(async () => !(await submit.isDisabled()), 'diagnosis submit should become enabled');
  await submit.click();
  await page.locator('[data-open-intervention-comparison]').waitFor({ state: 'visible' });
  await page.locator('[data-open-intervention-comparison]').click();
  await page.locator('[data-intervention-panel-mutation-free="true"]').waitFor({ state: 'visible' });
};

const openEligibleConfirmation = async (page) => {
  const opener = page.locator('[data-open-relocation-confirmation="target"]');
  await opener.waitFor({ state: 'visible' });
  await opener.click();
  await page.locator('[data-relocation-confirmation-dialog="true"]').waitFor({ state: 'visible' });
};

const readAppState = page => page.evaluate(() => window.__aqReadAppState());
const readTransitionCount = page => page.evaluate(() => window.__aqRelocationTransitions);

const assertEventually = async (predicate, message, timeoutMs = 8000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 80));
  }
  assert.fail(message);
};

const assertFact = async (page, key, expected) => {
  const text = await page.locator(`[data-relocation-fact="${key}"]`).innerText();
  assert.match(text, new RegExp(expected));
};

const addConvictToTargetSilently = page => page.evaluate(() => {
  const state = window.__aqReadAppState();
  const target = state.aquariums.find(item => item.id === 'target');
  target.fishes.push({
    id: 'target-convict-record',
    fishId: 'sp_0021',
    quantity: 1,
    entryDate: '2026-08-17T00:00:00.000Z',
    batches: [{
      id: 'target-convict-batch',
      quantity: 1,
      entryDate: '2026-08-17T00:00:00.000Z',
      lifeStage: 'adult',
      reproductiveState: 'normal',
      stateUpdatedAt: '2026-08-17T00:00:00.000Z',
    }],
  });
  window.__aqSilentWriteAppState(state);
});

const runCase = async (browser, name, seedState, body) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, locale: 'zh-CN' });
  await addBrowserInstrumentation(context, seedState);
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(`pageerror: ${error.message}`));

  try {
    await body(page);
    console.log(`PASS ${name}`);
  } catch (error) {
    const screenshotPath = `${ARTIFACT_DIR}/${name.replace(/[^a-z0-9_-]+/gi, '_')}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    console.error(`FAIL ${name}`);
    console.error(`Screenshot: ${screenshotPath}`);
    if (consoleErrors.length) console.error('Browser console errors:', consoleErrors.join('\n'));
    throw error;
  } finally {
    await context.close();
  }
};

const browser = await chromium.launch({ headless: true });
try {
  // GP-REL-01 + GP-REL-02: real reviewed community -> real opener -> facts ->
  // rapid confirm. Opening confirmation itself must not mutate.
  await runCase(browser, 'gp-rel-01-02-success', makeState(), async page => {
    await openCareDiagnosis(page);
    await openEligibleConfirmation(page);

    await assertFact(page, 'source', '冲突缸');
    await assertFact(page, 'destination', '安全目标缸');
    await assertFact(page, 'species', '虎皮鱼');
    await assertFact(page, 'quantity', '6');
    assert.equal(await readTransitionCount(page), 0, 'opening confirmation must not relocate livestock');

    const before = await readAppState(page);
    assert.equal(speciesQuantity(before, 'source', 'sp_0439'), 6);
    assert.equal(speciesQuantity(before, 'target', 'sp_0439'), 0);

    await page.locator('[data-confirm-relocation="true"]').evaluate(button => {
      button.click();
      button.click();
    });
    await page.locator('[data-relocation-completed="true"]').waitFor({ state: 'visible' });

    const after = await readAppState(page);
    assert.equal(speciesQuantity(after, 'source', 'sp_0439'), 0, 'source tiger barb group should be moved exactly once');
    assert.equal(speciesQuantity(after, 'target', 'sp_0439'), 6, 'target should contain exactly the six moved tiger barbs');
    assert.equal(await readTransitionCount(page), 1, 'rapid double confirm must produce one business relocation transition');

    await page.locator('[data-close-relocation-confirmation="true"]').click();
    await page.locator('[data-relocation-confirmation-dialog="true"]').waitFor({ state: 'detached' });
    await assertEventually(
      async () => (await page.locator('[data-open-intervention-comparison]').count()) === 0,
      'Care intervention CTA should disappear from the rendered source decision after canonical post-state refresh',
    );
  });

  // GP-REL-03: rendered card becomes stale after target silently changes. Fresh
  // controller read must block before any relocation transition occurs.
  await runCase(browser, 'gp-rel-03-stale-destination', makeState(), async page => {
    await openCareDiagnosis(page);
    await openEligibleConfirmation(page);
    assert.equal(await readTransitionCount(page), 0);

    await addConvictToTargetSilently(page);
    await page.locator('[data-confirm-relocation="true"]').click();
    await page.locator('[data-relocation-blocked]').waitFor({ state: 'visible' });
    const blockedText = await page.locator('[data-relocation-blocked]').innerText();
    assert.match(blockedText, /条件已变化，本次没有执行迁移/);

    const state = await readAppState(page);
    assert.equal(speciesQuantity(state, 'source', 'sp_0439'), 6);
    assert.equal(speciesQuantity(state, 'target', 'sp_0439'), 0);
    assert.equal(await readTransitionCount(page), 0, 'fresh-blocked stale target must write no relocation');
  });

  // GP-REL-04: force the local persistence boundary to throw. UI cannot know
  // whether a generic transport failed pre/post write, so it must stay locked,
  // sync-only, and send no second relocation during reconciliation.
  await runCase(browser, 'gp-rel-04-uncertain-reconcile', makeState(), async page => {
    await openCareDiagnosis(page);
    await openEligibleConfirmation(page);
    await page.evaluate(() => { window.__aqThrowNextAppStateWrite = true; });
    await page.locator('[data-confirm-relocation="true"]').click();
    const dialog = page.locator('[data-relocation-confirmation-dialog="true"]');
    await assertEventually(
      async () => (await dialog.getAttribute('data-relocation-close-locked')) === 'true',
      'uncertain relocation dialog should become close-locked',
    );
    assert.match(await dialog.innerText(), /暂时无法确认迁移是否已经执行|迁移可能已经完成/);

    await page.keyboard.press('Escape');
    await assertEventually(async () => await dialog.isVisible(), 'Escape must not dismiss uncertain dialog');
    await page.mouse.click(4, 4);
    await assertEventually(async () => await dialog.isVisible(), 'overlay click must not dismiss uncertain dialog');

    assert.equal(await readTransitionCount(page), 0);
    const beforeSync = await readAppState(page);
    assert.equal(speciesQuantity(beforeSync, 'source', 'sp_0439'), 6);

    await page.locator('[data-reconcile-relocation="true"]').click();
    await page.locator('[data-relocation-reconciled="true"]').waitFor({ state: 'visible' });
    assert.equal(await dialog.getAttribute('data-relocation-close-locked'), 'false');
    assert.equal(await readTransitionCount(page), 0, 'reconciliation must not send a second relocation');

    const afterSync = await readAppState(page);
    assert.equal(speciesQuantity(afterSync, 'source', 'sp_0439'), 6);
    assert.equal(speciesQuantity(afterSync, 'target', 'sp_0439'), 0);
    await page.locator('[data-close-relocation-confirmation="true"]').click();
    await dialog.waitFor({ state: 'detached' });
  });

  // GP-REL-05: same reviewed community, but the formal tiger-barb subject spans
  // two factual batches. Actual rendered target card must explain the boundary
  // and expose no executable confirmation opener.
  await runCase(
    browser,
    'gp-rel-05-multibatch-fail-closed',
    makeState({ tigerBatches: [makeBatch('tiger-batch-a', 3), makeBatch('tiger-batch-b', 3)] }),
    async page => {
      await openCareDiagnosis(page);
      const blocked = page.locator('[data-relocation-entrypoint-blocked="multiple_positive_source_batches"]');
      await blocked.waitFor({ state: 'visible' });
      assert.match(await blocked.innerText(), /多个批次|单批次迁移/);
      assert.equal(await page.locator('[data-open-relocation-confirmation="target"]').count(), 0);
    },
  );

  console.log('CARE_RELOCATION_BROWSER_GOLDEN_PATH_PASS deterministic local browser harness only; hosted Auth/Supabase acceptance remains separate');
} finally {
  await browser.close();
}

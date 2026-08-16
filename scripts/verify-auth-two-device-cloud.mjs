import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const previewUrl = process.env.PREVIEW_URL?.trim();
const magicLink = process.env.AQUAGUIDE_E2E_MAGIC_LINK?.trim();
const allowMutation = process.env.AQUAGUIDE_E2E_ALLOW_MUTATION === 'yes';

if (!previewUrl) throw new Error('PREVIEW_URL is required for live two-device acceptance.');
if (!magicLink) throw new Error('AQUAGUIDE_E2E_MAGIC_LINK is required for live two-device acceptance.');
if (!allowMutation) {
  throw new Error('Set AQUAGUIDE_E2E_ALLOW_MUTATION=yes only for a dedicated AquaGuide acceptance account.');
}

const baseUrl = new URL(previewUrl);
const businessStorageKeys = [
  'aquarium_app_state_v1',
  'aquariums',
  'myAquarium',
  'wishlistFishIds',
  'aquarium_diagnosis_records',
  'deceasedRecords',
  'aquapediaDiscoveryDeck',
  'aqua_care_favorites',
  'aqua_care_reminders',
  'aqua_care_completed_operations',
  'aqua_care_saved_checklists',
];

const localDateKey = date => {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const readAppState = page => page.evaluate(() => {
  try {
    return JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
  } catch {
    return {};
  }
});

const clearBusinessMirrors = page => page.evaluate(keys => {
  for (const key of keys) localStorage.removeItem(key);
}, businessStorageKeys);

const waitForAquarium = async (page, aquariumId, predicate = () => true) => {
  await page.waitForFunction(
    ({ aquariumId }) => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return Boolean((state.aquariums || []).find(item => item.id === aquariumId));
      } catch {
        return false;
      }
    },
    { aquariumId },
    { timeout: 20_000 },
  );
  const state = await readAppState(page);
  const aquarium = (state.aquariums || []).find(item => item.id === aquariumId);
  assert.ok(aquarium, `aquarium ${aquariumId} must be present`);
  assert.ok(predicate(aquarium), `aquarium ${aquariumId} did not reach the expected state`);
  return aquarium;
};

const waitForAquariumAbsent = async (page, aquariumId) => {
  await page.waitForFunction(
    ({ aquariumId }) => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return !(state.aquariums || []).some(item => item.id === aquariumId);
      } catch {
        return true;
      }
    },
    { aquariumId },
    { timeout: 20_000 },
  );
};

const waitForCareEvent = async (page, expected) => {
  await page.waitForFunction(
    expectedEvent => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return (state.careEvents || []).some(event => Object.entries(expectedEvent).every(([key, value]) => event[key] === value));
      } catch {
        return false;
      }
    },
    expected,
    { timeout: 20_000 },
  );
};

const getCareEvents = async page => {
  const state = await readAppState(page);
  return state.careEvents || [];
};

const createAquariumFromUi = async page => {
  await page.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const before = await readAppState(page);
  const beforeIds = new Set((before.aquariums || []).map(item => item.id));

  const createFirst = page.getByRole('button', { name: '创建第一个鱼缸' });
  const createAnother = page.getByRole('button', { name: '新建鱼缸' });
  if (await createFirst.isVisible().catch(() => false)) {
    await createFirst.click();
  } else {
    await createAnother.waitFor({ state: 'visible' });
    await createAnother.click();
  }

  await page.waitForFunction(
    beforeCount => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return (state.aquariums || []).length > beforeCount;
      } catch {
        return false;
      }
    },
    beforeIds.size,
    { timeout: 20_000 },
  );

  const after = await readAppState(page);
  const created = (after.aquariums || []).find(item => !beforeIds.has(item.id));
  assert.ok(created?.id, 'UI creation must yield a new canonical aquarium id');
  return created;
};

const switchAquariumFromUi = async (page, aquarium) => {
  await page.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'networkidle' });
  await page.getByTitle('切换鱼缸').click();
  const option = page.getByRole('button').filter({ hasText: aquarium.name }).first();
  await option.waitFor({ state: 'visible' });
  await option.click();
  await page.waitForFunction(
    aquariumId => {
      try {
        return JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}').currentAquariumId === aquariumId;
      } catch {
        return false;
      }
    },
    aquarium.id,
    { timeout: 10_000 },
  );
};

const freshCloudHydrate = async (page, aquariums) => {
  await page.goto(new URL('/login?mode=account', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await clearBusinessMirrors(page);
  await page.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'networkidle' });
  for (const aquarium of aquariums) await waitForAquarium(page, aquarium.id);
};

const addOneLivestockFromUi = async (page, aquarium) => {
  await switchAquariumFromUi(page, aquarium);
  await page.goto(new URL('/aquarium?action=plan-species', baseUrl).href, { waitUntil: 'domcontentloaded' });
  const planningDialog = page.getByRole('dialog');
  await planningDialog.getByText('规划想养的生物', { exact: true }).waitFor();
  await planningDialog.locator('section').first().getByRole('button').first().click();
  await planningDialog.getByRole('button', { name: '查看规划判断' }).click();
  await planningDialog.getByRole('button', { name: '已经在缸里了，记录实际情况' }).click();
  await page.waitForFunction(
    aquariumId => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return (state.aquariums || []).find(item => item.id === aquariumId)?.fishes?.length > 0;
      } catch {
        return false;
      }
    },
    aquarium.id,
    { timeout: 20_000 },
  );
  await planningDialog.getByText('已记录', { exact: true }).waitFor();
  await page.keyboard.press('Escape').catch(() => {});
  return waitForAquarium(page, aquarium.id, item => item.fishes?.length > 0);
};

const assertSignedIn = async page => {
  await page.goto(new URL('/login?mode=account', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await page.getByText('已登录', { exact: true }).waitFor({ state: 'visible', timeout: 15_000 });
};

const browser = await chromium.launch({ headless: true });
let contextA;
let contextB;

try {
  contextA = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  const pageA = await contextA.newPage();
  pageA.setDefaultTimeout(10_000);

  // A real Magic Link must land back on the deployment under test and establish a real Supabase session.
  // Never print the link: it contains a one-time credential.
  await pageA.goto(magicLink, { waitUntil: 'domcontentloaded' });
  await pageA.waitForURL(url => url.origin === baseUrl.origin, { timeout: 20_000 });
  assert.equal(new URL(pageA.url()).origin, baseUrl.origin, 'Magic Link must return to the deployment under test');
  await assertSignedIn(pageA);
  console.log('✓ device A completed a real Magic Link session');

  const storageA = await contextA.storageState();
  const authOnlyState = {
    cookies: storageA.cookies,
    origins: storageA.origins
      .map(origin => ({
        origin: origin.origin,
        localStorage: origin.localStorage.filter(entry => entry.name.startsWith('sb-')),
      }))
      .filter(origin => origin.localStorage.length > 0),
  };
  const copiedKeys = authOnlyState.origins.flatMap(origin => origin.localStorage.map(entry => entry.name));
  assert.ok(copiedKeys.some(key => key.includes('auth-token')), 'device A must expose a persisted Supabase auth session');
  assert.equal(copiedKeys.some(key => businessStorageKeys.includes(key)), false, 'device B seed must never contain business mirrors');

  // Create two aquariums through the actual UI. The second one gives us a deletable record while preserving last-tank protection.
  const firstAquarium = await createAquariumFromUi(pageA);
  await pageA.keyboard.press('Escape').catch(() => {});
  const secondAquarium = await createAquariumFromUi(pageA);
  assert.notEqual(firstAquarium.id, secondAquarium.id, 'two UI creates must produce distinct canonical ids');
  await pageA.waitForFunction(
    aquariumId => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return state.currentAquariumId === aquariumId;
      } catch {
        return false;
      }
    },
    secondAquarium.id,
    { timeout: 10_000 },
  );
  console.log('✓ device A created two repository-backed aquariums');

  // Device B receives ONLY the Supabase auth storage, never the local AquaGuide business mirror.
  contextB = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    storageState: authOnlyState,
  });
  const pageB = await contextB.newPage();
  pageB.setDefaultTimeout(10_000);
  await assertSignedIn(pageB);
  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  console.log('✓ device B rebuilt aquarium state from cloud without a copied business cache');

  // Put a real livestock record into tank B. Feeding acceptance must not rely on a synthetic local fixture.
  const stockedSecond = await addOneLivestockFromUi(pageA, secondAquarium);
  assert.ok(stockedSecond.fishes.length > 0, 'device A must create a real livestock record before feeding acceptance');
  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  const firstOnB = await waitForAquarium(pageB, firstAquarium.id);
  const secondOnB = await waitForAquarium(pageB, secondAquarium.id, item => item.fishes?.length > 0);
  assert.equal(firstOnB.fishes?.length || 0, 0, 'tank A must not inherit tank B livestock');
  assert.ok(secondOnB.fishes.length > 0, 'tank B livestock must hydrate from cloud');
  console.log('✓ livestock hydrated cross-device without tank contamination');

  // Update a real aquarium fact through the settings UI on A, then require B to recover it after a business-cache reset.
  await switchAquariumFromUi(pageA, secondAquarium);
  await pageA.goto(new URL('/aquarium#settings-parameters', baseUrl).href, { waitUntil: 'domcontentloaded' });
  const settingsDialog = pageA.getByRole('dialog');
  await settingsDialog.getByText('鱼缸设置', { exact: true }).waitFor({ state: 'visible' });
  await settingsDialog.getByRole('button', { name: '26°C', exact: true }).click();
  await settingsDialog.getByRole('button', { name: '保存设置', exact: true }).click();
  await pageA.waitForFunction(
    ({ aquariumId }) => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return (state.aquariums || []).find(item => item.id === aquariumId)?.targetTemperature === '26';
      } catch {
        return false;
      }
    },
    { aquariumId: secondAquarium.id },
    { timeout: 15_000 },
  );

  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  await waitForAquarium(pageB, secondAquarium.id, item => item.targetTemperature === '26');
  assert.notEqual((await waitForAquarium(pageB, firstAquarium.id)).targetTemperature, '26', 'tank A must not inherit tank B settings');
  console.log('✓ settings mutation on device A was recovered on device B');

  // Record today's water change through the real quick action, then rebuild B from cloud.
  const today = localDateKey(new Date());
  await switchAquariumFromUi(pageA, secondAquarium);
  await pageA.getByText('记录本次换水', { exact: true }).click();
  await pageA.waitForFunction(
    ({ aquariumId, today }) => {
      try {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return (state.aquariums || []).find(item => item.id === aquariumId)?.waterChangeHistory?.includes(today);
      } catch {
        return false;
      }
    },
    { aquariumId: secondAquarium.id, today },
    { timeout: 20_000 },
  );

  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  await waitForAquarium(pageB, secondAquarium.id, item => item.waterChangeHistory?.includes(today));
  assert.equal((await waitForAquarium(pageB, firstAquarium.id)).waterChangeHistory?.includes(today) || false, false, 'tank A must not inherit tank B water-change history');
  await waitForCareEvent(pageB, { aquariumId: secondAquarium.id, eventType: 'water_change', sourceType: 'water_change_day', sourceId: today });
  console.log('✓ water change recovered cross-device from canonical cloud state');

  // Record feeding through the product UI. Device B must derive "fed today" from the canonical feeding event after cache reset.
  await switchAquariumFromUi(pageA, secondAquarium);
  await pageA.getByText('记录本次喂食', { exact: true }).click();
  await pageA.getByText('撤回喂食记录', { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });

  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  await switchAquariumFromUi(pageB, secondAquarium);
  await waitForCareEvent(pageB, { aquariumId: secondAquarium.id, eventType: 'feeding', sourceType: 'feeding_day', sourceId: today });
  await pageB.getByText('撤回喂食记录', { exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  console.log('✓ feeding state recovered cross-device from canonical event');

  // Account-level care favorite + tank-scoped care operation are both exercised through the actual Care detail UI.
  await switchAquariumFromUi(pageA, secondAquarium);
  await pageA.goto(new URL('/care?topic=guide_new_fish_acclimation', baseUrl).href, { waitUntil: 'networkidle' });
  await pageA.getByRole('heading', { name: '如何安全给新鱼过水？' }).waitFor();
  const favoriteButtonA = pageA.getByRole('button', { name: '收藏百科', exact: true });
  if (await favoriteButtonA.isVisible().catch(() => false)) await favoriteButtonA.click();
  await pageA.getByRole('button', { name: '取消收藏', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await pageA.getByRole('button', { name: '标记已完成过水', exact: true }).click();
  await pageA.getByRole('button', { name: '已完成过水', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });

  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  await switchAquariumFromUi(pageB, secondAquarium);
  await pageB.goto(new URL('/care?topic=guide_new_fish_acclimation', baseUrl).href, { waitUntil: 'networkidle' });
  await pageB.getByRole('button', { name: '取消收藏', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await pageB.getByRole('button', { name: '已完成过水', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await waitForCareEvent(pageB, {
    aquariumId: secondAquarium.id,
    eventType: 'care_operation_completed',
    sourceType: 'care_operation',
    sourceId: 'guide_new_fish_acclimation',
  });
  console.log('✓ care favorite and tank-scoped care operation recovered on device B');

  // Save one stable-key checklist item for tank B and verify it is restored from the cloud on device B.
  await pageA.goto(new URL('/care?topic=guide_fry_care', baseUrl).href, { waitUntil: 'networkidle' });
  await pageA.getByRole('heading', { name: '鱼苗出生后怎么照料？' }).waitFor();
  const firstChecklistA = pageA.locator('[data-care-action-step]').first();
  await firstChecklistA.click();
  await pageA.getByRole('button', { name: '保存已完成的 1 项', exact: true }).click();
  await pageA.getByRole('button', { name: '已保存 1 项', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });

  await freshCloudHydrate(pageB, [firstAquarium, secondAquarium]);
  await switchAquariumFromUi(pageB, secondAquarium);
  await pageB.goto(new URL('/care?topic=guide_fry_care', baseUrl).href, { waitUntil: 'networkidle' });
  const firstChecklistB = pageB.locator('[data-care-action-step]').first();
  await firstChecklistB.waitFor({ state: 'visible' });
  assert.equal(await firstChecklistB.getAttribute('aria-pressed'), 'true', 'tank B checklist progress must restore on device B');
  await pageB.getByRole('button', { name: '已保存 1 项', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  console.log('✓ tank-scoped care checklist progress recovered on device B');

  // Canonical timeline facts must all belong to tank B, never tank A.
  await pageB.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'networkidle' });
  await waitForCareEvent(pageB, { aquariumId: secondAquarium.id, eventType: 'feeding', sourceType: 'feeding_day', sourceId: today });
  await waitForCareEvent(pageB, { aquariumId: secondAquarium.id, eventType: 'water_change', sourceType: 'water_change_day', sourceId: today });
  await waitForCareEvent(pageB, {
    aquariumId: secondAquarium.id,
    eventType: 'care_operation_completed',
    sourceType: 'care_operation',
    sourceId: 'guide_new_fish_acclimation',
  });
  const canonicalEvents = await getCareEvents(pageB);
  const scopedSourceKeys = new Set([
    `water_change:water_change_day:${today}`,
    `feeding:feeding_day:${today}`,
    'care_operation_completed:care_operation:guide_new_fish_acclimation',
  ]);
  const eventKey = event => `${event.eventType}:${event.sourceType}:${event.sourceId}`;
  assert.ok(canonicalEvents.some(event => event.aquariumId === secondAquarium.id && scopedSourceKeys.has(eventKey(event))), 'tank B must expose canonical timeline facts');
  assert.equal(canonicalEvents.some(event => event.aquariumId === firstAquarium.id && scopedSourceKeys.has(eventKey(event))), false, 'tank A must not inherit tank B timeline facts');
  console.log('✓ canonical timeline facts remain tank-scoped');

  // Explicit tank isolation: operation/checklist completion belongs to tank B; account favorite remains global to the signed-in user.
  await switchAquariumFromUi(pageB, firstAquarium);
  await pageB.goto(new URL('/care?topic=guide_new_fish_acclimation', baseUrl).href, { waitUntil: 'networkidle' });
  await pageB.getByRole('button', { name: '标记已完成过水', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await pageB.getByRole('button', { name: '取消收藏', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  await pageB.goto(new URL('/care?topic=guide_fry_care', baseUrl).href, { waitUntil: 'networkidle' });
  const firstChecklistOnTankA = pageB.locator('[data-care-action-step]').first();
  await firstChecklistOnTankA.waitFor({ state: 'visible' });
  assert.notEqual(await firstChecklistOnTankA.getAttribute('aria-pressed'), 'true', 'tank A must not inherit tank B checklist progress');
  await pageB.getByRole('button', { name: '先勾选已完成项目', exact: true }).waitFor({ state: 'visible', timeout: 20_000 });
  console.log('✓ tank-scoped care state is isolated while account favorite remains shared');

  // Observation is intentionally not faked here. Current Aquarium.tsx defines the reminder dialog and observation mutation,
  // but has no reachable setIsRiskReminderOpen(true) UI trigger. That product reachability blocker must be fixed on #34 first;
  // only then should this live harness click "全部提醒" -> "开始观察" -> "没有异常，记录观察" and assert cloud recovery.

  // Delete tank B through A. B must not resurrect it from stale compatibility mirrors after another business-cache reset.
  await switchAquariumFromUi(pageA, secondAquarium);
  await pageA.getByRole('button', { name: '更多鱼缸操作' }).click();
  await pageA.getByRole('button', { name: '删除鱼缸', exact: true }).click();
  const deleteDialog = pageA.getByRole('dialog');
  const confirmDelete = deleteDialog.getByRole('button', { name: /确认删除|删除/ }).last();
  await confirmDelete.click();
  await waitForAquariumAbsent(pageA, secondAquarium.id);

  await pageB.goto(new URL('/login?mode=account', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await clearBusinessMirrors(pageB);
  await pageB.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'networkidle' });
  await waitForAquarium(pageB, firstAquarium.id);
  await waitForAquariumAbsent(pageB, secondAquarium.id);
  console.log('✓ deleted aquarium stayed deleted on device B');

  // Sign out on B. Account-level mirrors must disappear from this device only after Supabase sign-out succeeds.
  await pageB.goto(new URL('/login?mode=account', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await pageB.getByRole('button', { name: '退出账号', exact: true }).click();
  await pageB.waitForURL(url => url.pathname === '/login', { timeout: 15_000 });
  const remainingBusinessKeys = await pageB.evaluate(keys => keys.filter(key => localStorage.getItem(key) !== null), businessStorageKeys);
  assert.deepEqual(remainingBusinessKeys, [], `sign-out must clear account business mirrors: ${remainingBusinessKeys.join(', ')}`);
  console.log('✓ device B sign-out cleared account business mirrors');

  console.log('live two-device acceptance passed: auth, create, livestock, settings, water change, feeding, care favorite, care operation, checklist, timeline isolation, delete, sign-out cleanup');
} finally {
  await contextB?.close().catch(() => {});
  await contextA?.close().catch(() => {});
  await browser.close();
}

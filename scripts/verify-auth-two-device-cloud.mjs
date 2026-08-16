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

const readAppState = page => page.evaluate(() => {
  try {
    return JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
  } catch {
    return {};
  }
});

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
    { timeout: 15_000 },
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
    { timeout: 15_000 },
  );
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
    { timeout: 15_000 },
  );

  const after = await readAppState(page);
  const created = (after.aquariums || []).find(item => !beforeIds.has(item.id));
  assert.ok(created?.id, 'UI creation must yield a new canonical aquarium id');
  return created;
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
  await pageB.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'networkidle' });
  await waitForAquarium(pageB, firstAquarium.id);
  await waitForAquarium(pageB, secondAquarium.id);
  console.log('✓ device B rebuilt aquarium state from cloud without a copied business cache');

  // Update a real aquarium fact through the settings UI on A, then require B to recover it after reload.
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

  await pageB.reload({ waitUntil: 'networkidle' });
  await pageB.waitForFunction(
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
  console.log('✓ settings mutation on device A was recovered on device B');

  // Delete the second aquarium through A. B must not resurrect it from a stale compatibility mirror.
  await pageA.goto(new URL('/aquarium', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await pageA.getByRole('button', { name: '更多鱼缸操作' }).click();
  await pageA.getByRole('button', { name: '删除鱼缸', exact: true }).click();
  const deleteDialog = pageA.getByRole('dialog');
  const confirmDelete = deleteDialog.getByRole('button', { name: /确认删除|删除/ }).last();
  await confirmDelete.click();
  await waitForAquariumAbsent(pageA, secondAquarium.id);

  await pageB.reload({ waitUntil: 'networkidle' });
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

  console.log('live two-device acceptance smoke passed: auth, create, cloud hydrate, settings, delete, sign-out cleanup');
} finally {
  await contextB?.close().catch(() => {});
  await contextA?.close().catch(() => {});
  await browser.close();
}

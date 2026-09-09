import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const port = Number(process.env.OPERATIONS_STUDIO_TEST_PORT || 4318);
const baseUrl = `http://127.0.0.1:${port}`;
const viteBin = resolve('node_modules/.bin/vite');
const server = spawn(viteBin, ['--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    VITE_SUPABASE_URL: 'https://fixture.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'fixture-anon',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += String(chunk); });
server.stderr.on('data', chunk => { serverOutput += String(chunk); });

const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const waitForServer = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error(`Operations Studio fixture server did not start.\n${serverOutput}`);
};const species = {
  id: 'sp-fixture-1', status: 'draft', version: 3,
  catalogKey: 'fixture-goldfish', name: 'Fixture Goldfish', scientificName: 'Carassius auratus', category: 'Goldfish',
  difficulty: 'Easy', waterTemperatureText: '20-24°C', phLevelText: '7.0-8.0', waterChangeCycleDays: 7,
  description: 'Fixture species description.', diet: 'Omnivore', tankSizeText: '80 L',
  temperament: 'Peaceful', sizeClass: 'Medium', isCustom: false, searchTerms: [],
};
const profile = {
  id: 'rev-profile-1', speciesId: 'species-db-1', revisionNumber: 2, baseProfileVersion: 1,
  behaviorTraits: ['schooling'], minimumGroupSize: 6, predationTargets: [], confidence: 'medium', status: 'pending_review',
  citationSnapshots: [{ sourceKey: 'fixture-source', title: 'Fixture Evidence', publisher: 'Fixture', url: 'https://example.test/evidence', sourceType: 'reference', reviewStatus: 'reviewed' }],
  evidenceResolution: [{ sourceKey: 'fixture-source', sourceId: 'fixture-evidence-id', version: 1 }],
  impactReport: { kind: 'profile', baselineVersion: 1, changedFields: ['confidence'], changes: [{ field: 'confidence', before: 'low', after: 'medium' }] },
  regressionReport: {
    kind: 'profile', targetKey: 'fixture-guppy', baselineVersion: 1, authoritySequence: 1,
    engineVersion: 'fixture', catalogFingerprint: 'fixture', regressionDigest: 'fixture',
    evaluatedScenarios: 3, changedScenarios: 0, changes: [], generatedAt: new Date().toISOString(),
  },
  impactCheckedAt: new Date().toISOString(), reviewNote: '', version: 1,
  species: { catalogKey: 'fixture-guppy', name: 'Fixture Guppy', scientificName: 'Poecilia reticulata' },
};
const envelope = data => JSON.stringify({ data, requestId: 'fixture-request' });
const errorEnvelope = (code, message) => JSON.stringify({ error: { code, message }, requestId: 'fixture-request' });
const releaseFeed = { events: [], sources: [], capabilities: [], permissions: [] };
const installFixtureRoutes = async (context, { adminAccess = 'ready' } = {}) => {
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    if (adminAccess === 'forbidden' && path.startsWith('/api/v1/admin/')) {
      return route.fulfill({ status: 403, contentType: 'application/json', body: errorEnvelope('FORBIDDEN', '没有内容管理权限。') });
    }
    if (path === '/api/v1/content-bootstrap') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope({ species: [], careArticles: [], authority: 'publication-snapshot', publicationCounts: { species: 0, care: 0 } }) });
    if (path === '/api/v1/compatibility-bootstrap') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope({ profiles: [], pairRules: [], authority: 'reviewed-db', counts: { profiles: 0, pairRules: 0 } }) });
    if (path === '/api/v1/profile') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope({ version: 1, preferences: {} }) });
    if (path === '/api/v1/admin/species') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope([species]) });
    if (path === '/api/v1/admin/care-articles') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope([]) });
    if (path === '/api/v1/admin/care-seo-health') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope([]) });
    if (path === '/api/v1/admin/compatibility/profile-revisions') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope({ revisions: [profile], writableCatalogKeys: ['fixture-guppy'] }) });
    if (path === '/api/v1/admin/compatibility/pair-rule-revisions') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope({ revisions: [], writablePairKeys: [] }) });
    if (path === '/api/v1/admin/releases') return route.fulfill({ status: 200, contentType: 'application/json', body: envelope(releaseFeed) });
    if (path === '/api/admin-content/session') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ configured: true, session: null }) });
    if (path === `/api/v1/species/${species.catalogKey}`) return route.fulfill({ status: 200, contentType: 'application/json', body: envelope(species) });
    return route.continue();
  });
};

const installFixtureSession = async context => {
  await context.addInitScript(() => localStorage.setItem('sb-fixture-auth-token', JSON.stringify({
    access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600, token_type: 'bearer',
    user: { id: 'fixture-user', aud: 'authenticated', role: 'authenticated', email: 'fixture@example.test', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
  })));
};
const runAuthRequired = async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installFixtureRoutes(context);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    const productSource = page.getByTestId('operations-source-product_care');
    const compatibilitySource = page.getByTestId('operations-source-compatibility');
    await productSource.getByText('需要登录', { exact: true }).waitFor({ timeout: 10000 });
    await compatibilitySource.getByText('需要登录', { exact: true }).waitFor({ timeout: 10000 });
    const primary = page.getByTestId('operations-primary-task');
    await primary.getByText('先恢复数据来源，再判断是否真的没有任务', { exact: true }).waitFor({ timeout: 10000 });
    assert.match(await page.getByTestId('operations-work-queue').innerText(), /0 个已读取任务 · 来源未完整/);
    await primary.getByRole('button', { name: /查看数据来源/ }).click();
    assert.equal(await page.locator('#operations-source-status').count(), 1, 'source recovery action must target the existing source status section.');
    assert.match(await productSource.innerText(), /Business Admin 会话/);
    assert.match(await compatibilitySource.innerText(), /Business Admin 会话/);
    assert.doesNotMatch(await productSource.innerText(), /暂不可用/);
    assert.doesNotMatch(await compatibilitySource.innerText(), /暂不可用/);
    assert.deepEqual(pageErrors, [], 'auth-required state must not produce page errors.');
    return { authRequired: 'Product/Care + Compatibility PASS' };
  } finally {
    await browser.close();
  }
};

const runForbidden = async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await installFixtureSession(context);
    await installFixtureRoutes(context, { adminAccess: 'forbidden' });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    const productSource = page.getByTestId('operations-source-product_care');
    const compatibilitySource = page.getByTestId('operations-source-compatibility');
    await productSource.getByText('权限不足', { exact: true }).waitFor({ timeout: 10000 });
    await compatibilitySource.getByText('权限不足', { exact: true }).waitFor({ timeout: 10000 });
    await page.getByTestId('operations-primary-task').getByText('先恢复数据来源，再判断是否真的没有任务', { exact: true }).waitFor({ timeout: 10000 });
    assert.match(await page.getByTestId('operations-work-queue').innerText(), /0 个已读取任务 · 来源未完整/);
    assert.match(await productSource.innerText(), /没有 Business Admin 内容管理权限/);
    assert.match(await compatibilitySource.innerText(), /没有 Compatibility 管理权限/);
    assert.doesNotMatch(await productSource.innerText(), /暂不可用/);
    assert.doesNotMatch(await compatibilitySource.innerText(), /暂不可用/);
    assert.deepEqual(pageErrors, [], 'forbidden state must not produce page errors.');
    return { forbidden: 'Product/Care + Compatibility PASS' };
  } finally {
    await browser.close();
  }
};

const run = async (viewport, label) => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport });
    await installFixtureSession(context);
    await installFixtureRoutes(context);
    const page = await context.newPage();
    const pageErrors = [];
    const serverErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    page.on('response', response => {
      if (response.url().includes('/api/') && response.status() >= 500) {
        serverErrors.push(`${response.status()} ${new URL(response.url()).pathname}`);
      }
    });

    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    await page.getByText('Fixture Guppy · Compatibility Profile 等待人工审核').waitFor({ timeout: 10000 });
    assert.match(await page.getByTestId('operations-primary-task').innerText(), /当前已读取优先任务/, `${label}: incomplete source coverage must scope the priority claim.`);
    assert.match(await page.getByTestId('operations-primary-task').innerText(), /当前优先级仅基于已读取任务/, `${label}: scoped priority must disclose incomplete source coverage.`);
    const overflowHome = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.getByRole('button', { name: /审核这个 revision/ }).click();
    await page.waitForURL(/\/admin\/compatibility\?kind=profile&revision=rev-profile-1/);
    const compatibilityEditor = page.locator('[data-testid="compatibility-draft-editor"]');
    await compatibilityEditor.waitFor({ state: 'visible', timeout: 10000 });
    assert.match(await compatibilityEditor.innerText(), /Fixture Guppy/, `${label}: exact Compatibility revision must open.`);
    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    const productTask = page.getByRole('button', { name: /Fixture Goldfish · Product Data Draft/ });
    await productTask.waitFor({ timeout: 10000 });
    await productTask.click();
    await page.waitForURL(/\/admin\/product-content\?type=species&id=sp-fixture-1/);
    await page.getByText('Fixture Goldfish', { exact: true }).last().waitFor({ state: 'visible', timeout: 10000 });
    assert.equal(await page.getByLabel('目录 ID *').inputValue(), 'fixture-goldfish', `${label}: exact Product Draft must open.`);
    const overflowTarget = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

    assert.equal(overflowHome, 0, `${label}: Operations Home must not overflow horizontally.`);
    assert.equal(overflowTarget, 0, `${label}: deep-linked authority must not overflow horizontally.`);
    assert.deepEqual(pageErrors, [], `${label}: page errors are not allowed.`);
    assert.deepEqual(serverErrors, [], `${label}: fixture browser flow must not produce API 5xx.`);
    return { label, overflowHome, overflowTarget, compatibility: 'exact revision PASS', product: 'exact draft PASS' };
  } finally {
    await browser.close();
  }
};

try {
  await waitForServer();
  const authRequired = await runAuthRequired();
  const forbidden = await runForbidden();
  const results = [
    await run({ width: 1440, height: 900 }, 'desktop'),
    await run({ width: 390, height: 844 }, 'mobile'),
  ];
  console.log(JSON.stringify({ gate: 'PASS', authRequired, forbidden, results }));
} finally {
  server.kill('SIGTERM');
}

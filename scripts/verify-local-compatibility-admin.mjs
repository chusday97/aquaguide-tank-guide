import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

process.env.VITE_ADMIN_LOCAL_MODE = 'true';

const vite = await createServer({
  root: process.cwd(),
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'silent',
});
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address === 'object');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const businessKey = 'aquaguide-local-business-admin-v1';
const compatibilityKey = 'aquaguide-local-compatibility-admin-v1';
const unavailable = route => route.fulfill({
  status: 503, contentType: 'application/json',
  body: JSON.stringify({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'cloud disabled in local-mode test' }, requestId: 'local-compat-test' }),
});
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('dialog', dialog => dialog.accept());
    await page.route('**/api/v1/**', unavailable);
    await page.route('**/api/admin-content/**', unavailable);
    await page.goto(`${baseUrl}/admin/compatibility`, { waitUntil: 'networkidle' });
    await page.evaluate(([business, compatibility]) => {
      localStorage.removeItem(business);
      localStorage.removeItem(compatibility);
    }, [businessKey, compatibilityKey]);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Compatibility Admin' }).waitFor();

    const firstBody = await page.locator('body').innerText();
    assert.match(firstBody, /Profile \/ Pair Draft 已启用/);
    assert.match(firstBody, /Local baseline 7\/7/);
    assert.match(firstBody, /Local baseline 4\/4/);
    assert.doesNotMatch(firstBody, /DB baseline/);
    const authoritySummary = page.getByTestId('compatibility-authority-summary');
    const summaryHeight = await authoritySummary.evaluate(element => element.getBoundingClientRect().height);
    assert.equal(summaryHeight <= (viewport.width === 390 ? 120 : 100), true, `${viewport.width}px authority summary must stay compact.`);
    assert.equal(await authoritySummary.evaluate(element => element.scrollWidth - element.clientWidth), 0, `${viewport.width}px authority summary must not overflow internally.`);
    await page.getByRole('button', { name: '创建 Profile Draft' }).first().click();
    const profileEditor = page.getByTestId('compatibility-draft-editor');
    await profileEditor.waitFor();
    const editorTop = await profileEditor.evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    if (viewport.width === 390) assert.equal(editorTop < 500, true, '390px Profile editor must appear before the large reviewed lists.');
    assert.equal(await profileEditor.evaluate(element => element.scrollWidth - element.clientWidth), 0, `${viewport.width}px Profile editor must not overflow internally.`);
    const minGroup = page.locator('input[placeholder="留空表示未设置"]');
    await minGroup.fill('7');
    await page.getByRole('button', { name: '保存 Draft' }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Compatibility Admin' }).waitFor();
    await page.getByRole('button', { name: '打开 Draft' }).first().click();
    assert.equal(await page.locator('input[placeholder="留空表示未设置"]').inputValue(), '7');

    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    const operationsText = await page.locator('body').innerText();
    assert.match(operationsText, /虎皮鱼 · Compatibility Profile Draft 未提交审核/);
    assert.match(operationsText, /本地 Compatibility revision store 可读取/);
    await page.getByRole('button', { name: /继续这个 Draft/ }).first().click();
    await page.waitForSelector('[data-testid="compatibility-draft-editor"]');
    assert.match(page.url(), /kind=profile&revision=/);

    await page.getByRole('button', { name: '提交审核' }).click();
    await page.waitForSelector('[data-testid="profile-regression-report"]');
    const profileRegression = await page.getByTestId('profile-regression-report').innerText();
    assert.match(profileRegression, /已评估 1455 个场景/);
    assert.match(await page.locator('body').innerText(), /Canonical Evidence：1\/1/);
    await page.getByRole('button', { name: '批准 revision（不发布）' }).click();
    await page.getByRole('button', { name: '发布 reviewed version' }).click();
    await page.waitForFunction(() => document.body.innerText.includes('Profile reviewed version 已发布'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Compatibility Admin' }).waitFor();
    const profilePublishedText = await page.locator('body').innerText();
    assert.match(profilePublishedText, /虎皮鱼[\s\S]{0,500}最低群体：7/);
    assert.match(profilePublishedText, /Local baseline 7\/7/);

    await page.getByRole('button', { name: '创建 Pair Draft' }).first().click();
    const pairEditor = page.getByTestId('compatibility-pair-draft-editor');
    await pairEditor.locator('select').first().selectOption('caution');
    await page.getByRole('button', { name: '保存 Pair Draft' }).click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Compatibility Admin' }).waitFor();
    await page.getByRole('button', { name: /打开 Pair Draft/ }).first().click();
    assert.equal(await page.getByTestId('compatibility-pair-draft-editor').locator('select').first().inputValue(), 'caution');

    await page.getByRole('button', { name: '提交 Pair 审核' }).click();
    await page.waitForSelector('[data-testid="pair-regression-report"]');
    const pairRegression = await page.getByTestId('pair-regression-report').innerText();
    assert.match(pairRegression, /已评估 3 个场景/);
    assert.match(pairRegression, /结果变化 3 个/);
    assert.match(await page.locator('body').innerText(), /Canonical Evidence：2\/2/);
    await page.getByRole('button', { name: '批准 Pair revision（不发布）' }).click();
    await page.getByRole('button', { name: '发布 Pair reviewed version' }).click();
    await page.waitForFunction(() => document.body.innerText.includes('Pair Rule reviewed version 已发布'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Compatibility Admin' }).waitFor();
    const pairPublishedText = await page.locator('body').innerText();
    assert.match(pairPublishedText, /迷你鹦鹉鱼 × 虎皮鱼[\s\S]{0,300}谨慎混养/);
    assert.match(pairPublishedText, /Local baseline 4\/4/);
    await page.goto(`${baseUrl}/admin/publish-center`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Unified Publish Center' }).waitFor();
    const publishCenterText = await page.locator('body').innerText();
    for (const label of ['Compatibility Profile 已提交审核', 'Compatibility Profile 已批准', 'Compatibility Profile reviewed authority 已发布', 'Compatibility Pair Rule 已提交审核', 'Compatibility Pair Rule 已批准', 'Compatibility Pair Rule reviewed authority 已发布']) assert.match(publishCenterText, new RegExp(label));
    assert.match(publishCenterText, /Compatibility Profile reviewed authority 已发布/);
    assert.match(publishCenterText, /Compatibility Pair Rule reviewed authority 已发布/);
    assert.match(await page.getByTestId('publish-center-authority-note').getAttribute('title') || '', /DEV Local Mode/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `Local Compatibility must not overflow at ${viewport.width}px.`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS local Compatibility Admin: Profile/Pair Draft, review gates, runtime publish, Operations deep-link.');
} finally {
  await browser.close();
  await vite.close();
}

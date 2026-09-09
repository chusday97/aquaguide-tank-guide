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
const storageKey = 'aquaguide-local-business-admin-v1';
const marker = '【Local Draft regression】';
const json = value => JSON.stringify(value);
const unavailable = route => route.fulfill({
  status: 503,
  contentType: 'application/json',
  body: json({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'fixture unavailable' }, requestId: 'local-mode-test' }),
});

try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.route('**/api/admin-content/**', unavailable);
    await page.route('**/api/v1/admin/**', unavailable);
    await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
    await page.evaluate(key => localStorage.setItem(key, '{broken-json'), storageKey);
    await page.reload({ waitUntil: 'networkidle' });
    const healedState = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.equal(healedState.species.length, 486, 'Corrupted local Product store must self-heal to canonical Species seed.');
    assert.equal(healedState.care.length, 41, 'Corrupted local Product store must self-heal to canonical Care seed.');
    await page.evaluate(key => localStorage.removeItem(key), storageKey);
    await page.reload({ waitUntil: 'networkidle' });
    const stateBefore = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.equal(stateBefore.species.length, 486);
    assert.equal(stateBefore.care.length, 41);
    const publishedBefore = stateBefore.publishedSpecies.sp_0001.description;

    const description = page.locator('label:has-text("物种说明") textarea').first();
    const original = await description.inputValue();
    await description.fill(`${original}${marker}`);
    await page.getByRole('button', { name: '保存修改', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));

    const stateDraft = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.equal(stateDraft.species.find(item => item.catalogKey === 'sp_0001').status, 'draft');
    assert.equal(stateDraft.publishedSpecies.sp_0001.description, publishedBefore, 'Saving a Draft must not mutate Published snapshot.');
    await page.reload({ waitUntil: 'networkidle' });
    assert.ok((await page.locator('label:has-text("物种说明") textarea').first().inputValue()).endsWith(marker));

    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'networkidle' });
    const operationsText = await page.locator('body').innerText();
    assert.match(operationsText, /极火虾 · Product Data Draft/);
    assert.match(operationsText, /本地 Product \/ Care store 可读取/);

    await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));

    const statePublished = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.ok(statePublished.publishedSpecies.sp_0001.description.endsWith(marker));

    const careKey = 'guide_new_fish_acclimation';
    await page.evaluate(([key, catalogKey]) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      const care = state.care.find(item => item.catalogKey === catalogKey);
      care.careArticleSteps[0].actionTitle = '观察状态';
      care.careArticleSteps[0].actionKind = 'observe';
      localStorage.setItem(key, JSON.stringify(state));
    }, [storageKey, careKey]);
    await page.goto(`${baseUrl}/admin/product-content?type=care&id=local-care-${careKey}`, { waitUntil: 'networkidle' });
    const careSummary = page.locator('label:has-text("摘要") textarea').first();
    await careSummary.fill(`${await careSummary.inputValue()}${marker}`);
    await page.getByRole('button', { name: '保存修改', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));
    const careDraft = await page.evaluate(([key, catalogKey]) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      return state.care.find(item => item.catalogKey === catalogKey);
    }, [storageKey, careKey]);
    assert.equal(careDraft.careArticleSteps[0].actionTitle, '观察状态');
    assert.equal(careDraft.careArticleSteps[0].actionKind, 'observe');
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));
    const carePublished = await page.evaluate(([key, catalogKey]) => JSON.parse(localStorage.getItem(key) || '{}').publishedCare[catalogKey], [storageKey, careKey]);
    assert.equal(carePublished.steps[0].actionTitle, '观察状态');
    assert.equal(carePublished.steps[0].actionKind, 'observe', 'Care actionKind must survive Local Draft → publish round-trip.');
    await page.goto(`${baseUrl}/admin/publish-center`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Unified Publish Center' }).waitFor();
    const publishCenterText = await page.locator('body').innerText();
    assert.match(publishCenterText, /Local publish\/archive history 从当前本地 store 启用后持续记录/);
    assert.match(publishCenterText, /Care 发布版本/);
    assert.match(publishCenterText, /DEV Local Mode/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `Local Admin must not overflow at ${viewport.width}px.`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS local Business Admin: canonical seed, Draft persistence, Care action round-trip, Operations WorkItem, Published snapshot isolation.');
} finally {
  await browser.close();
  await vite.close();
}

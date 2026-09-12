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
    await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
    await page.evaluate(key => localStorage.setItem(key, '{broken-json'), storageKey);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(key => { try { const state = JSON.parse(localStorage.getItem(key) || '{}'); return state.species?.length === 486 && state.care?.length === 41; } catch { return false; } }, storageKey);
    const healedState = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.equal(healedState.species.length, 486, 'Corrupted local Product store must self-heal to canonical Species seed.');
    assert.equal(healedState.care.length, 41, 'Corrupted local Product store must self-heal to canonical Care seed.');
    await page.evaluate(key => localStorage.removeItem(key), storageKey);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(key => { try { const state = JSON.parse(localStorage.getItem(key) || '{}'); return state.species?.length === 486 && state.care?.length === 41; } catch { return false; } }, storageKey);
    const stateBefore = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.equal(stateBefore.species.length, 486);
    assert.equal(stateBefore.care.length, 41);
    const publishedBefore = stateBefore.publishedSpecies.sp_0001.description;

    const description = page.locator('label:has-text("物种说明") textarea').first();
    const original = await description.inputValue();
    await description.fill(`${original}${marker}`);
    const gatedPublish = page.getByRole('button', { name: '保存后可发布', exact: true });
    assert.equal(await gatedPublish.isDisabled(), true, 'Dirty Product/Care must explain that Save is required before Publish.');
    await page.getByRole('button', { name: '保存修改', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));

    const stateDraft = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), storageKey);
    assert.equal(stateDraft.species.find(item => item.catalogKey === 'sp_0001').status, 'draft');
    assert.equal(stateDraft.publishedSpecies.sp_0001.description, publishedBefore, 'Saving a Draft must not mutate Published snapshot.');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
    const reloadedDescription = page.locator('label:has-text("物种说明") textarea').first();
    await reloadedDescription.waitFor();
    for (let attempt = 0; attempt < 60 && !(await reloadedDescription.inputValue()).endsWith(marker); attempt += 1) await new Promise(resolve => setTimeout(resolve, 100));
    assert.ok((await reloadedDescription.inputValue()).endsWith(marker));
    const mobileNavigator = page.getByTestId('content-mobile-navigator');
    const desktopCatalog = page.locator('section[aria-label="内容列表"]');
    if (viewport.width < 1024) {
      assert.equal(await mobileNavigator.isVisible(), true, 'Mobile Product/Care must use a compact record navigator.');
      assert.equal(await desktopCatalog.isVisible(), false, 'Mobile Product/Care must not stack the full catalog before the editor.');
      assert.equal(await mobileNavigator.locator('select').inputValue(), 'local-species-sp_0001');
    } else {
      assert.equal(await mobileNavigator.isVisible(), false);
      assert.equal(await desktopCatalog.isVisible(), true);
    }
    const speciesFirstField = page.getByLabel('目录 ID *');
    const speciesReviewReference = page.getByTestId('content-review-reference');
    const speciesFieldBox = await speciesFirstField.boundingBox();
    const speciesReviewBox = await speciesReviewReference.boundingBox();
    assert.equal(Boolean(speciesFieldBox && speciesReviewBox && speciesFieldBox.y < speciesReviewBox.y), true, 'Product fields must come before Impact/downstream review references.');
    assert.equal(await page.locator('form').evaluate(element => element.scrollWidth - element.clientWidth), 0, 'Product form must not hide internal horizontal overflow.');

    await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: '运营工作台' }).waitFor();
    const operationsText = await page.locator('body').innerText();
    assert.match(operationsText, /极火虾 · Product Data Draft/);
    assert.match(await page.getByTestId('operations-source-product_care').innerText(), /Product \/ Care[\s\S]*可读取/, 'Ready Product/Care source stays explicit without repeating transport detail.');
    const operationsQueue = page.getByTestId('operations-work-queue');
    const repeatedIndexAttention = operationsQueue.locator('[data-work-item-id]').filter({ hasText: 'Index 策略尚未确认' });
    assert.equal(await repeatedIndexAttention.count() <= 3, true, 'Operations Home must not expand more than three repeated low-priority Index-strategy attention rows.');
    assert.match(await operationsQueue.innerText(), /还有 \d+ 个任务未在首页展开[\s\S]*SEO \d+/, 'Collapsed Operations tasks must keep an authority-level hidden-count summary.');

    await page.getByRole('button', { name: /继续这个 Draft/ }).first().click();
    await page.waitForURL(/\/admin\/product-content\?type=species&id=local-species-sp_0001/);
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));
    await page.getByRole('button', { name: '返回后台首页' }).click();
    await page.waitForURL(/\/admin\/content$/);
    const closureNotice = page.getByTestId('operations-return-context');
    await closureNotice.waitFor({ state: 'visible', timeout: 10000 });
    assert.match(await closureNotice.innerText(), /已返回工作台[\s\S]*极火虾 · Product Data Draft[\s\S]*当前队列未找到这条任务/, 'Publishing the exact Product task must close it out of the refreshed Operations queue.');
    assert.doesNotMatch(await page.getByTestId('operations-primary-task').innerText(), /极火虾 · Product Data Draft/, 'Completed Product task must not remain as the current priority after returning.');
    assert.match(await page.getByTestId('operations-primary-task').innerText(), /当前.*优先任务|当前已读取来源没有待处理任务/, 'Operations must expose the next current priority immediately after task closure.');

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
    await page.goto(`${baseUrl}/admin/product-content?type=care&id=local-care-${careKey}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
    const careSummary = page.locator('label:has-text("摘要") textarea').first();
    const careFirstField = page.getByLabel('目录 ID *');
    const careSeo = page.getByTestId('care-seo-projection');
    await careSeo.waitFor();
    const careFieldBox = await careFirstField.boundingBox();
    const careSeoBox = await careSeo.boundingBox();
    assert.equal(Boolean(careFieldBox && careSeoBox && careFieldBox.y < careSeoBox.y), true, 'Care fields must come before downstream Care SEO Editorial.');
    assert.equal(await page.locator('form').evaluate(element => element.scrollWidth - element.clientWidth), 0, 'Care form must fit its available mobile/desktop width.');
    await careSummary.fill(`${await careSummary.inputValue()}${marker}`);
    await page.getByRole('button', { name: '保存修改', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));
    const careDraft = await page.evaluate(([key, catalogKey]) => {
      const state = JSON.parse(localStorage.getItem(key) || '{}');
      return state.care.find(item => item.catalogKey === catalogKey);
    }, [storageKey, careKey]);
    assert.equal(careDraft.careArticleSteps[0].actionTitle, '观察状态');
    assert.equal(careDraft.careArticleSteps[0].actionKind, 'observe');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Product / Care Content' }).waitFor();
    await page.getByRole('button', { name: '发布', exact: true }).waitFor();
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));
    const carePublished = await page.evaluate(([key, catalogKey]) => JSON.parse(localStorage.getItem(key) || '{}').publishedCare[catalogKey], [storageKey, careKey]);
    assert.equal(carePublished.steps[0].actionTitle, '观察状态');
    assert.equal(carePublished.steps[0].actionKind, 'observe', 'Care actionKind must survive Local Draft → publish round-trip.');
    await page.goto(`${baseUrl}/admin/publish-center`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Unified Publish Center' }).waitFor();
    const publishCenterText = await page.locator('body').innerText();
    assert.match(publishCenterText, /发布 \/ 审核 \/ Revision 记录/);
    assert.match(publishCenterText, /发布边界详情/);
    assert.match(publishCenterText, /Care 发布版本/);
    assert.match((await page.getByTestId('publish-center-authority-note').getAttribute('title')) || '', /DEV Local Mode/);
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

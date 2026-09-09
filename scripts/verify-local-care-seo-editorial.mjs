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
const careId = 'local-care-guide_new_fish_acclimation';
const json = value => JSON.stringify(value);
const unavailable = route => route.fulfill({
  status: 503,
  contentType: 'application/json',
  body: json({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'fixture unavailable' }, requestId: 'local-care-seo' }),
});
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.route('**/api/v1/admin/**', unavailable);
    await page.route('**/api/admin-content/**', unavailable);

    await page.goto(`${baseUrl}/admin/product-content?type=care&id=${careId}`, { waitUntil: 'networkidle' });
    const seo = page.getByTestId('care-seo-projection');
    await seo.waitFor();
    assert.match(await seo.innerText(), /Published v1/);
    assert.equal(await seo.getByRole('button', { name: 'English（待接入）' }).isDisabled(), true);
    assert.equal(await seo.getByRole('button', { name: 'Local AI 未接入' }).isDisabled(), true);

    await seo.getByRole('button', { name: '创建 SEO Draft' }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="care-seo-projection"]')?.textContent?.includes('Draft'));
    await page.reload({ waitUntil: 'networkidle' });
    await seo.waitFor();
    assert.match(await seo.innerText(), /保存 SEO Draft/);
    await seo.getByRole('button', { name: '提交审核' }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="care-seo-projection"]')?.textContent?.includes('待审核'));
    await seo.getByRole('button', { name: '人工批准' }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="care-seo-projection"]')?.textContent?.includes('Approved'));
    assert.doesNotMatch(await seo.innerText(), /Source drift/);

    const summary = page.locator('label:has-text("摘要") textarea').first();
    const originalSummary = await summary.inputValue();
    await summary.fill(`${originalSummary}【Care source drift regression】`);
    await page.getByRole('button', { name: '保存修改', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('草稿'));
    assert.match(await seo.innerText(), /Published v1/);
    assert.match(await seo.innerText(), /Approved/);
    assert.doesNotMatch(await seo.innerText(), /Source drift/);

    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));
    await page.waitForFunction(() => document.querySelector('[data-testid="care-seo-projection"]')?.textContent?.includes('Source drift'));
    const driftText = await seo.innerText();
    assert.match(driftText, /Published v3/);
    assert.match(driftText, /Source drift/);
    assert.match(driftText, /基于 Published v3 新建 Draft/);

    let seoState = await page.evaluate(() => JSON.parse(localStorage.getItem('aquaguide-local-care-seo-editorial-v1') || '{}'));
    assert.equal(seoState.revisions[0].reviewState, 'approved');
    assert.equal(seoState.revisions[0].sourceCareVersion, 1);

    await seo.getByRole('button', { name: '基于 Published v3 新建 Draft' }).click();
    await page.waitForFunction(() => document.querySelector('[data-testid="care-seo-projection"]')?.textContent?.includes('Draft'));
    assert.doesNotMatch(await seo.innerText(), /Source drift/);
    seoState = await page.evaluate(() => JSON.parse(localStorage.getItem('aquaguide-local-care-seo-editorial-v1') || '{}'));
    assert.equal(seoState.revisions.length, 2);
    assert.equal(seoState.revisions[0].reviewState, 'draft');
    assert.equal(seoState.revisions[0].sourceCareVersion, 3);
    assert.equal(seoState.revisions[1].reviewState, 'approved');
    assert.equal(seoState.revisions[1].sourceCareVersion, 1);

    await page.goto(`${baseUrl}/admin/seo-pages`, { waitUntil: 'networkidle' });
    const healthText = await page.locator('body').innerText();
    assert.match(healthText, /Published Care \/ Care SEO Editorial[\s\S]{0,120}可读取/);
    assert.match(healthText, /来源待读取/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `Local Care SEO / Registry must not overflow at ${viewport.width}px.`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS local Care SEO: Draft persistence, human review, noindex lock, Published-source drift, English/AI fail-closed.');
} finally {
  await browser.close();
  await vite.close();
}

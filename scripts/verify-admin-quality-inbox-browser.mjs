import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/admin/feedback`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: '需要管理员登录', exact: true }).waitFor();
  assert.equal(await page.locator('[data-feedback-id]').count(), 0, 'Unauthenticated Quality Inbox must never render feedback records.');
  assert.equal(await page.getByText('反馈暂时无法加载', { exact: true }).count(), 0, 'Configured auth with no session must resolve to AUTH_REQUIRED, not a generic dependency failure.');

  await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'domcontentloaded' });
  const qualityLink = page.locator('[data-admin-quality-link]');
  await qualityLink.waitFor();
  assert.equal(await qualityLink.getAttribute('href'), '/admin/feedback', 'Content Admin must expose a direct Quality Inbox destination.');
  await qualityLink.click();
  await page.waitForURL(url => url.pathname === '/admin/feedback');
  await page.getByRole('heading', { name: '需要管理员登录', exact: true }).waitFor();

  assert.deepEqual(pageErrors, [], `Admin Quality Inbox auth path must not emit page errors: ${pageErrors.join('; ')}`);
  console.log('Admin Quality Inbox browser contract: PASS (discoverable route + explicit unauthenticated state + no feedback leakage).');
} finally {
  await browser.close();
}

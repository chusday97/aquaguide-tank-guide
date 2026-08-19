import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  page.setDefaultTimeout(15_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.addInitScript(() => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '更多鱼缸操作', exact: true }).click();
  await page.getByRole('button', { name: '数据与备份', exact: true }).click();

  const storagePanel = page.locator('[data-settings-storage-panel]');
  await storagePanel.waitFor();

  const visibleDialogs = page.locator('[role="dialog"]:visible');
  assert.equal(await visibleDialogs.count(), 1, 'Data & Backup must reuse exactly one Settings surface, not open a nested/standalone dialog.');
  await page.getByRole('heading', { name: '鱼缸设置', exact: true }).waitFor();
  await page.getByText('数据与备份', { exact: true }).last().waitFor();

  assert.equal(await page.getByRole('button', { name: '保存设置', exact: true }).count(), 0, 'Read-only Data panel must not expose a fake Save Settings CTA.');
  await page.getByRole('button', { name: '关闭', exact: true }).waitFor();

  assert.deepEqual(pageErrors, [], `Data & Backup Settings path must not emit page errors: ${pageErrors.join('; ')}`);
  console.log('UI modal surface browser contract PASS: mobile Data & Backup reuses one Settings surface with read-only close semantics.');
} finally {
  await browser.close();
}

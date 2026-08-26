import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'zh-CN',
});
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });

try {
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'networkidle' });

  const entry = page.getByRole('button', { name: '分享卡片', exact: true });
  assert.equal(await entry.count(), 1, 'Care article must expose one local care-card action');
  await entry.click();

  const cardDialog = page.getByRole('dialog').filter({ hasText: '生成养护卡' });
  await cardDialog.waitFor();
  assert.equal(await cardDialog.locator('[data-care-share-card]').count(), 1, 'care-card preview must render');
  assert.equal(await cardDialog.getByRole('button', { name: '复制文字', exact: true }).count(), 1, 'care card must provide copy action');
  assert.equal(await cardDialog.getByRole('button', { name: /公开分享|生成分享链接|发布/ }).count(), 0, 'local care card must not imply public sharing');

  await cardDialog.getByRole('button', { name: '复制文字', exact: true }).click();
  await cardDialog.getByRole('button', { name: '已复制', exact: true }).waitFor();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(copied.trim().length > 20, 'copy action must write care-card text');

  console.log('Care card action regression: PASS');
} finally {
  await context.close();
  await browser.close();
}

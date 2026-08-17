import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || process.env.AQUAGUIDE_PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseUrl });
await context.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));

try {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.getByRole('dialog').waitFor({ timeout: 15_000 });

  const entry = page.getByRole('button', { name: '生成养护卡', exact: true });
  assert.equal(await entry.count(), 1, '文章详情必须暴露唯一、明确的“生成养护卡”入口');
  await entry.click();

  const cardDialog = page.getByRole('dialog').filter({ hasText: '生成养护卡' });
  await cardDialog.waitFor({ timeout: 5_000 });
  assert.equal(await cardDialog.getByRole('button', { name: '复制文字', exact: true }).count(), 1, '养护卡必须提供真实复制动作');
  assert.equal(await cardDialog.getByRole('button', { name: /生成分享链接|公开分享|发布/ }).count(), 0, '本地养护卡不得伪装成尚未上线的公开分享能力');

  await cardDialog.getByRole('button', { name: '复制文字', exact: true }).click();
  await cardDialog.getByRole('button', { name: '已复制', exact: true }).waitFor({ timeout: 5_000 });
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(copied.trim().length > 20, '复制动作必须写入真实养护卡文字');

  console.log('Care card action regression: PASS');
} finally {
  await context.close();
  await browser.close();
}

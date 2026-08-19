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
  const articleDetail = page.locator('[data-care-workspace-detail]');
  await articleDetail.waitFor({ timeout: 15_000 });
  assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, 'Long-form Care article browsing must not open a Dialog before a transactional sub-action.');

  const entry = articleDetail.getByRole('button', { name: '生成养护卡', exact: true });
  assert.equal(await entry.count(), 1, '文章详情必须暴露唯一、明确的“生成养护卡”入口');
  await entry.click();

  const cardDialog = page.getByRole('dialog').filter({ hasText: '生成养护卡' });
  await cardDialog.waitFor({ timeout: 5_000 });
  assert.equal(await page.locator('[role="dialog"]:visible').count(), 1, '生成养护卡可以使用一个短事务 Dialog，但不能与文章浏览 Dialog 叠加。');
  const copyButton = cardDialog.getByRole('button', { name: '复制文字', exact: true });
  assert.equal(await copyButton.count(), 1, '养护卡必须提供真实复制动作');
  assert.equal(await cardDialog.getByRole('button', { name: /生成分享链接|公开分享|发布/ }).count(), 0, '本地养护卡不得伪装成尚未上线的公开分享能力');

  const saveActionCount = await cardDialog.getByRole('button', { name: /保存.*卡片|保存图片|下载|save card|download/i }).count();
  const dialogText = await cardDialog.innerText();
  assert.ok(
    saveActionCount > 0 || !/可保存/.test(dialogText),
    '没有真实保存动作时，养护卡说明不得承诺“可保存”',
  );

  const copyBox = await copyButton.boundingBox();
  const footerBox = await copyButton.locator('xpath=..').boundingBox();
  assert.ok(copyBox && footerBox, '必须能够读取养护卡 footer 与复制按钮几何');
  assert.ok(
    copyBox.width / footerBox.width >= 0.85,
    `只有一个真实 footer 动作时，复制按钮应占据主要宽度；当前比例 ${(copyBox.width / footerBox.width).toFixed(2)}`,
  );

  await copyButton.click();
  await cardDialog.getByRole('button', { name: '已复制', exact: true }).waitFor({ timeout: 5_000 });
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(copied.trim().length > 20, '复制动作必须写入真实养护卡文字');

  console.log('Care card action regression: PASS');
} finally {
  await context.close();
  await browser.close();
}

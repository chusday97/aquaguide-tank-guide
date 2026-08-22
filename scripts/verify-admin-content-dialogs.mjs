import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_URL || process.env.AQUAGUIDE_PREVIEW_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4317';
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await page.goto(`${baseUrl}/admin/content`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: '内容后台' }).waitFor();

  const catalog = page.getByLabel('目录 ID *');
  await catalog.fill('admin-unsaved-test');
  await page.getByRole('button', { name: '养护文章', exact: true }).click();

  const blocking = page.locator('[data-dialog-surface="blocking"][data-open]').filter({ hasText: '放弃未保存的修改？' });
  await blocking.waitFor();
  assert.equal(new URL(page.url()).pathname, '/admin/content');
  await blocking.getByRole('button', { name: '继续编辑' }).click();
  await blocking.waitFor({ state: 'hidden' });
  assert.equal(await catalog.inputValue(), 'admin-unsaved-test', 'stay must preserve the draft');
  await page.getByRole('button', { name: '养护文章', exact: true }).click();
  await blocking.waitFor();
  await blocking.getByRole('button', { name: '放弃修改' }).click();
  await page.getByLabel('标题 *').waitFor();

  await page.getByLabel('目录 ID *').fill('care-unsaved-test');
  await page.getByRole('button', { name: '返回我的鱼缸' }).click();
  await blocking.waitFor();
  await blocking.getByRole('button', { name: '继续编辑' }).click();
  assert.equal(new URL(page.url()).pathname, '/admin/content');
  assert.equal(await page.getByLabel('目录 ID *').inputValue(), 'care-unsaved-test');

  await page.getByRole('button', { name: '返回我的鱼缸' }).click();
  await blocking.waitFor();
  await blocking.getByRole('button', { name: '放弃修改' }).click();
  await page.waitForURL(url => url.pathname === '/aquarium');

  console.log('Admin content shared Blocking guard: PASS');
} finally {
  await browser.close();
}

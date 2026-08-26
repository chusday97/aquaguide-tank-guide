import assert from 'node:assert/strict';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await page.goto(`${baseUrl}/aquarium?action=exports`, { waitUntil: 'networkidle' });
  if (page.url().includes('/welcome')) {
    await page.getByRole('button', { name: '先跳过，直接进入我的鱼缸' }).click();
    await page.waitForURL(/\/aquarium/);
    await page.goto(`${baseUrl}/aquarium?action=exports`, { waitUntil: 'networkidle' });
  }
  await page.getByRole('heading', { name: '导出与分享' }).waitFor();
  assert.equal(await page.locator('article').count(), 6);
  for (const width of [390, 600, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, `${width}px should not overflow`);
  }
  await page.getByRole('button', { name: '预览并下载' }).first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '保存 PNG' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  assert.ok(path);
  const metadata = await sharp(path).metadata();
  const stats = await sharp(path).stats();
  const contrast = stats.channels.slice(0, 3).map(channel => ({ min: channel.min, max: channel.max, mean: Math.round(channel.mean), stdev: Math.round(channel.stdev) }));
  assert.equal(metadata.width, 1080);
  assert.ok((metadata.height || 0) > 400);
  assert.ok(Math.min(...stats.channels.slice(0, 3).map(channel => channel.min)) < 40, 'export should contain dark, visible text');
  assert.ok(stats.channels.slice(0, 3).some(channel => channel.stdev > 20), `export should have visible contrast: ${JSON.stringify(contrast)}`);
  console.log(`export center: 6 artifacts, 1080×${metadata.height} PNG and high-contrast pixels passed ${JSON.stringify(contrast)}`);
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || process.env.AQUAGUIDE_URL || 'http://127.0.0.1:4317';
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByRole('region', { name: '互动物种鱼缸' }).waitFor();
  assert.equal(await page.locator('[data-scene-node]').count(), 6, 'encyclopedia scene renders six selectable creatures');
  assert.equal(await page.locator('[data-scene-node] .resilient-image-transparent').count(), 6, 'encyclopedia creatures use transparent scene image surfaces');
  assert.equal(await page.locator('[data-scene-node] img[src$=".png"], [data-scene-node] img[src*=".png?"]').count(), 6, 'encyclopedia creatures resolve to PNG/RGBA scene assets');
  await page.locator('[data-scene-node]').first().click();
  await page.getByRole('button', { name: '查看物种档案' }).waitFor();
  await page.getByRole('button', { name: '传统浏览', exact: true }).click();
  await page.getByPlaceholder('搜索鱼、虾、螺、水草或用途').waitFor();
  assert.match(page.url(), /mode=browse/);

  await page.goto(`${baseUrl}/care`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByRole('region', { name: '互动鱼缸养护指南' }).waitFor();
  assert.ok(await page.locator('.interactive-care-scene .resilient-image-transparent').count() >= 1, 'care scene decorations use transparent image surfaces');
  await page.getByText('场景找问题', { exact: true }).waitFor();
  await page.getByRole('button', { name: '水面：泡沫、油膜、浮头' }).click();
  await page.getByText('再确认一个现象', { exact: true }).waitFor();
  await page.getByRole('button', { name: '传统浏览', exact: true }).click();
  await page.getByPlaceholder('搜索养护问题，如白点、水浑、不吃食...').waitFor();
  await page.goto(`${baseUrl}/care#care-results`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByPlaceholder('搜索养护问题，如白点、水浑、不吃食...').waitFor();

  console.log('formal interactive scenes: encyclopedia and care scene/browse flows passed');
} finally {
  await browser.close();
}

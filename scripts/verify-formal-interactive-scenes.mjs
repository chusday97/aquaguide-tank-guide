import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || process.env.AQUAGUIDE_URL || 'http://127.0.0.1:4319';
const expectedBranch = process.env.PREVIEW_BRANCH || 'codex/main-core-foundation-v1';
const expectedSha = process.env.PREVIEW_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  await page.goto(`${baseUrl}/_preview/interactive`, { waitUntil: 'networkidle', timeout: 30_000 });
  assert.match(page.url(), /\/aquarium\?preview=interactive$/, 'preview entry must land on the formal aquarium route');
  const previewMetadata = page.locator('[data-preview-metadata]');
  await previewMetadata.waitFor();
  const metadataText = await previewMetadata.innerText();
  assert.match(metadataText, new RegExp(expectedBranch.replaceAll('/', '\\/')), 'preview metadata must expose the expected branch');
  assert.match(metadataText, new RegExp(expectedSha), 'preview metadata must match the checked-out build SHA');
  assert.match(metadataText, /seed:\s*interactive-preview/);
  assert.match(metadataText, /built:/);
  assert.match(metadataText, /[0-9a-f]{40}/i, 'preview metadata must expose the full build SHA');
  await page.goto(`${baseUrl}/encyclopedia?mode=scene&preview=interactive`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByRole('region', { name: '互动物种鱼缸' }).waitFor();
  assert.equal(await page.locator('[data-scene-node]').count(), 6, 'encyclopedia scene renders six selectable creatures');
  assert.equal(await page.locator('[data-scene-node] .resilient-image-transparent').count(), 6, 'encyclopedia creatures use transparent scene image surfaces');
  assert.equal(await page.locator('[data-scene-node] img[src$=".png"], [data-scene-node] img[src*=".png?"]').count(), 6, 'encyclopedia creatures resolve to PNG/RGBA scene assets');
  await page.locator('[data-scene-node]').first().click();
  await page.getByRole('button', { name: '查看物种档案' }).waitFor();
  await page.getByRole('button', { name: '查看物种档案' }).click();
  const phoneDetailSurface = page.locator('[role="dialog"][data-surface]:visible');
  await phoneDetailSurface.waitFor();
  assert.equal(await phoneDetailSurface.getAttribute('data-surface'), 'bottom-sheet', 'phone species detail must use a bottom sheet');
  await page.keyboard.press('Escape');
  await phoneDetailSurface.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: '传统浏览', exact: true }).click();
  await page.getByPlaceholder('搜索鱼、虾、螺、水草或用途').waitFor();
  assert.match(page.url(), /mode=browse/);

  await page.goto(`${baseUrl}/care?mode=scene&preview=interactive`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByRole('region', { name: '互动鱼缸养护指南' }).waitFor();
  assert.ok(await page.locator('.interactive-care-scene .resilient-image-transparent').count() >= 1, 'care scene decorations use transparent image surfaces');
  await page.getByText('场景找问题', { exact: true }).waitFor();
  await page.getByRole('button', { name: '水面：泡沫、油膜、浮头' }).click();
  await page.getByText('再确认一个现象', { exact: true }).waitFor();
  await page.getByRole('button', { name: '传统浏览', exact: true }).click();
  await page.getByPlaceholder('搜索养护问题，如白点、水浑、不吃食...').waitFor();
  await page.goto(`${baseUrl}/care#care-results`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.getByPlaceholder('搜索养护问题，如白点、水浑、不吃食...').waitFor();

  for (const width of [600, 1280]) {
    const widePage = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
    await widePage.goto(`${baseUrl}/encyclopedia?mode=scene&preview=interactive`, { waitUntil: 'networkidle', timeout: 30_000 });
    await widePage.getByRole('region', { name: '互动物种鱼缸' }).waitFor();
    assert.equal(await widePage.locator('[data-scene-node]').count(), 6, `${width}px encyclopedia scene renders six selectable creatures`);
    assert.equal(await widePage.locator('[data-scene-node] .resilient-image-transparent').count(), 6, `${width}px encyclopedia scene keeps transparent surfaces`);
    assert.equal(await widePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `${width}px encyclopedia has no horizontal overflow`);
    await widePage.locator('[data-scene-node]').first().click();
    await widePage.getByRole('button', { name: '查看物种档案' }).click();
    const desktopDetailSurface = widePage.locator('[role="dialog"][data-surface]:visible');
    await desktopDetailSurface.waitFor();
    assert.equal(await desktopDetailSurface.getAttribute('data-surface'), width < 768 ? 'bottom-sheet' : 'detail-rail', `${width}px species detail must follow the viewport surface contract`);
    await widePage.keyboard.press('Escape');
    await desktopDetailSurface.waitFor({ state: 'hidden' });
    await widePage.goto(`${baseUrl}/care?mode=scene&preview=interactive`, { waitUntil: 'networkidle', timeout: 30_000 });
    await widePage.getByRole('region', { name: '互动鱼缸养护指南' }).waitFor();
    assert.ok(await widePage.locator('.interactive-care-scene .resilient-image-transparent').count() >= 1, `${width}px care scene keeps transparent surfaces`);
    assert.equal(await widePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, `${width}px care has no horizontal overflow`);
    await widePage.close();
  }

  console.log('formal interactive scenes: encyclopedia and care scene/browse flows passed');
} finally {
  await browser.close();
}

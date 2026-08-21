import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_URL || process.env.AQUAGUIDE_PREVIEW_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4317';
const browser = await chromium.launch({ headless: true });

const assertAtlasDockOverlay = async (width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(() => localStorage.removeItem('aquapediaDiscoveryDeck'));
  await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('[data-scene-node]').length > 0);
  await page.locator('[data-scene-node]').first().click();

  const stage = page.locator('.interactive-tank-stage').first();
  const dock = page.locator('.interactive-tank-dock.is-visible').first();
  await dock.waitFor({ state: 'visible' });
  assert.equal(await dock.evaluate(node => getComputedStyle(node).position), 'absolute', `${width}px selected result dock must overlay the scene`);

  const stageBox = await stage.boundingBox();
  const dockBox = await dock.boundingBox();
  assert.ok(stageBox && dockBox, `${width}px stage and dock must have measurable geometry`);
  assert.ok(dockBox.y >= stageBox.y - 1, `${width}px dock must start inside the scene`);
  assert.ok(dockBox.y + dockBox.height <= stageBox.y + stageBox.height + 2, `${width}px dock must not extend below the scene canvas`);
  await page.close();
};

try {
  const atlas = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // Clear discovery only on the first document. sessionStorage survives reload,
  // so the persistence assertion does not erase the state it is meant to test.
  await atlas.addInitScript(() => {
    if (sessionStorage.getItem('aquaguide_discovery_test_seeded') === '1') return;
    localStorage.removeItem('aquapediaDiscoveryDeck');
    sessionStorage.setItem('aquaguide_discovery_test_seeded', '1');
  });
  await atlas.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
  await atlas.waitForFunction(() => document.querySelectorAll('[data-scene-node]').length === 6);

  const getSceneSources = () => atlas.locator('[data-scene-node] img').evaluateAll(images => images.map(image => image.getAttribute('src')));
  const first = await getSceneSources();
  assert.equal(first.length, 6, '互动图鉴首屏必须展示六个物种');
  await atlas.getByRole('button', { name: /换一批物种|Show a new group/i }).click();
  await atlas.waitForTimeout(250);
  const second = await getSceneSources();
  assert.equal(second.length, 6, '换一批后必须仍展示六个物种');
  assert.equal(first.some(source => second.includes(source)), false, '换一批必须完整替换当前批次');
  await atlas.reload({ waitUntil: 'networkidle' });
  await atlas.waitForFunction(() => document.querySelectorAll('[data-scene-node]').length === 6);
  assert.deepEqual(await getSceneSources(), second, '刷新后必须保留当前批次');
  const transparentBackgrounds = await atlas.locator('.interactive-tank-creature .resilient-image-transparent').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor));
  assert.ok(transparentBackgrounds.every(color => color === 'rgba(0, 0, 0, 0)'), '场景图片容器必须保持透明');
  const firstSceneImage = atlas.locator('[data-scene-node] img').first();
  await firstSceneImage.evaluate(image => image.dispatchEvent(new Event('error', { bubbles: true })));
  await atlas.waitForTimeout(20);
  await firstSceneImage.evaluate(image => image.dispatchEvent(new Event('error', { bubbles: true })));
  await atlas.waitForTimeout(20);
  const fallback = atlas.locator('.resilient-image-transparent-fallback').first();
  await assert.doesNotReject(() => fallback.waitFor({ state: 'visible' }), '透明场景图片失败后必须显示无底板占位');
  assert.equal(await fallback.evaluate(node => getComputedStyle(node.parentElement).backgroundColor), 'rgba(0, 0, 0, 0)', '透明失败占位的容器必须保持透明');

  for (const width of [768, 1024, 1440]) await assertAtlasDockOverlay(width);

  const care = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await care.goto(`${baseUrl}/care`, { waitUntil: 'networkidle' });
  const labels = await care.locator('.interactive-care-hotspot-label b').allTextContents();
  assert.equal(labels.length, 6, '养护场景必须显示六个热点名称');
  const labelVisibility = await care.locator('.interactive-care-hotspot-label').evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
  }));
  assert.ok(labelVisibility.every(Boolean), '手机端热点名称必须常驻可见');
  assert.equal(await care.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, '手机互动养护不得出现横向溢出');

  console.log('Interactive scene browser checks passed.');
} finally {
  await browser.close();
}

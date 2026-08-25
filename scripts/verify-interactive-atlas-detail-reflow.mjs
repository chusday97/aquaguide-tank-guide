import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4347';
const browser = await chromium.launch({ headless: true });

const sceneSources = page => page.locator('[data-scene-node] img').evaluateAll(images => images.map(image => image.getAttribute('src')));

try {
  for (const width of [1440, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'zh-CN' });
    await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await page.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });

    const host = page.locator('[data-atlas-scene-context]');
    const before = await host.boundingBox();
    const batchBefore = await sceneSources(page);
    assert.ok(before, `${width}px scene must be measurable before detail`);

    await page.locator('[data-scene-node]').first().click();
    await page.getByRole('button', { name: /查看物种档案/ }).click();
    await page.waitForTimeout(600);

    const rail = page.locator('[data-atlas-detail-rail="true"]:visible');
    await rail.waitFor({ state: 'visible' });
    const [after, railBox] = await Promise.all([host.boundingBox(), rail.boundingBox()]);
    assert.ok(after && railBox, `${width}px reflow geometry must be measurable`);
    assert.equal(await host.getAttribute('data-detail-open'), 'true');
    assert.ok(after.width < before.width * 0.65, `${width}px aquarium must narrow when detail opens`);
    assert.ok(after.x + after.width <= railBox.x - 8, `${width}px aquarium must yield real space to the right rail`);
    assert.equal(await page.locator('.interactive-tank-dock:visible').count(), 0, `${width}px old in-scene dock must recede while the full detail rail is open`);

    await rail.getByRole('button', { name: '关闭' }).first().click();
    await page.waitForTimeout(600);
    const restored = await host.boundingBox();
    assert.ok(restored && Math.abs(restored.width - before.width) <= 2, `${width}px closing detail must restore original aquarium width`);
    assert.deepEqual(await sceneSources(page), batchBefore, `${width}px closing detail must restore the exact same discovery batch`);
    await page.close();
  }

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true });
  await phone.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await phone.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
  const phoneHost = phone.locator('[data-atlas-scene-context]');
  const phoneBefore = await phoneHost.boundingBox();
  await phone.locator('[data-scene-node]').first().click();
  await phone.getByRole('button', { name: /查看物种档案/ }).click();
  const sheet = phone.locator('[data-detail-viewport="phone-sheet"]:visible');
  await sheet.waitFor({ state: 'visible' });
  const phoneAfter = await phoneHost.boundingBox();
  assert.ok(phoneBefore && phoneAfter && Math.abs(phoneBefore.width - phoneAfter.width) <= 2, 'phone keeps the scene width and uses the accepted bottom sheet instead of desktop narrowing');
  await phone.close();

  console.log('Interactive Atlas detail reflow PASS: desktop narrows scene + right rail; close restores exact scene; phone keeps bottom sheet.');
} finally {
  await browser.close();
}

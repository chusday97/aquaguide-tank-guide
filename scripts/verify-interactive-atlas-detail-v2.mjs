import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4208';
const outputDir = path.resolve('artifacts/interactive-atlas-reentry-v1');
fs.mkdirSync(outputDir, { recursive: true });

const viewports = [
  { label: '390', width: 390, height: 844 },
  { label: '900', width: 900, height: 900 },
  { label: '1600', width: 1600, height: 1000 },
];

const assertNoHorizontalOverflow = async (page, label, state) => {
  const overflow = await page.evaluate(() => Math.max(
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
    document.body.scrollWidth - document.body.clientWidth,
  ));
  assert.ok(overflow <= 1, `${label}px ${state} state must not horizontally overflow; overflow=${overflow}px`);
};

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      locale: 'zh-CN',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.addInitScript(() => {
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    });

    await page.goto(`${baseUrl}/encyclopedia?mode=browse`, { waitUntil: 'domcontentloaded' });
    const atlas = page.locator('[data-interactive-atlas]');
    await atlas.waitFor({ state: 'visible' });
    assert.equal(await atlas.getAttribute('data-state'), 'exploring');
    assert.equal(await atlas.getAttribute('data-atlas-authority'), 'visual-only');
    assert.match(await atlas.innerText(), /非混养建议/, 'discovery scene must disclose that it is not a compatibility recommendation');
    await page.locator('[data-traditional-browse-guide]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-interactive-atlas-knowledge]').count(), 0, 'knowledge panel must be closed in exploration state');
    if (viewport.width < 768) {
      const mobileSearch = page.locator('[data-atlas-mobile-search]');
      await mobileSearch.waitFor({ state: 'visible' });
      await mobileSearch.click();
      await page.waitForFunction(() => document.activeElement?.tagName === 'INPUT' && Boolean(document.activeElement?.closest('#atlas-toolbar')));
      const toolbarBox = await page.locator('#atlas-toolbar').boundingBox();
      assert.ok(toolbarBox && toolbarBox.y < 180, `mobile species search must become immediately reachable from the top toolbar; y=${toolbarBox?.y}`);
    }
    await assertNoHorizontalOverflow(page, viewport.label, 'exploring');

    const firstShortcut = page.locator('[data-atlas-species-shortcut]').first();
    const anchorId = await firstShortcut.getAttribute('data-atlas-species-shortcut');
    assert.ok(anchorId, 'discovery scene must expose a stable grouped anchor species');
    await firstShortcut.evaluate(element => element.click());

    const knowledge = page.locator('[data-interactive-atlas-knowledge]');
    await knowledge.waitFor({ state: 'visible' });
    assert.equal(await atlas.getAttribute('data-state'), 'observing');
    assert.equal(await atlas.getAttribute('data-selected-species-id'), anchorId);
    assert.equal(await page.locator('[data-traditional-browse-guide]').count(), 0, 'classic browse guide must step back while observing a species');
    await knowledge.getByText('空间参考', { exact: true }).waitFor({ state: 'visible' });
    await knowledge.getByText('换水参考', { exact: true }).waitFor({ state: 'visible' });
    assert.match(await knowledge.locator('[data-atlas-reference-note]').innerText(), /不代表你的当前鱼缸状态/, 'knowledge panel must keep species reference separate from current-tank state');

    const rail = knowledge.locator('[data-variant-hover-rail]');
    await rail.waitFor({ state: 'visible' });
    const variants = rail.locator('[data-variant-id]');
    assert.ok(await variants.count() >= 2, 'the discovery anchor must deterministically use a multi-variant group');
    let secondVariant = null;
    let secondId = null;
    for (let index = 0; index < await variants.count(); index += 1) {
      const candidate = variants.nth(index);
      const candidateId = await candidate.getAttribute('data-variant-id');
      if (candidateId && candidateId !== anchorId) {
        secondVariant = candidate;
        secondId = candidateId;
        break;
      }
    }
    assert.ok(secondVariant && secondId, 'variant rail must expose a distinct preview target');

    await secondVariant.hover();
    await page.waitForFunction(id => document.querySelector('[data-interactive-atlas-knowledge]')?.getAttribute('data-preview-species-id') === id, secondId);
    assert.equal(await atlas.getAttribute('data-selected-species-id'), anchorId, 'hover preview must not commit the variant');
    await page.mouse.move(1, 1);
    await page.waitForFunction(id => document.querySelector('[data-interactive-atlas-knowledge]')?.getAttribute('data-preview-species-id') === id, anchorId);

    await secondVariant.click();
    await page.waitForFunction(id => document.querySelector('[data-interactive-atlas]')?.getAttribute('data-selected-species-id') === id, secondId);
    assert.equal(await knowledge.getAttribute('data-preview-species-id'), secondId, 'click must commit the chosen variant');
    if (viewport.width < 768) {
      const mobileClose = page.locator('[data-atlas-mobile-close]');
      await mobileClose.waitFor({ state: 'visible' });
      const closeBox = await mobileClose.boundingBox();
      assert.ok(closeBox && closeBox.y >= 64, `mobile knowledge close control must stay below the global top navigation; y=${closeBox?.y}`);
    }
    await assertNoHorizontalOverflow(page, viewport.label, 'observing');

    await page.screenshot({ path: path.join(outputDir, `atlas-${viewport.label}.png`), fullPage: false });

    const closeControl = viewport.width < 768
      ? page.locator('[data-atlas-mobile-close]')
      : knowledge.locator('[data-atlas-desktop-close]');
    await closeControl.click();
    await page.waitForFunction(() => document.querySelector('[data-interactive-atlas]')?.getAttribute('data-state') === 'exploring');
    assert.equal(await atlas.getAttribute('data-selected-species-id'), '');
    await page.locator('[data-traditional-browse-guide]').waitFor({ state: 'visible' });
    assert.equal(await firstShortcut.getAttribute('data-atlas-species-shortcut'), anchorId, 'closing detail must preserve the original random discovery scene');
    await assertNoHorizontalOverflow(page, viewport.label, 'restored');

    assert.deepEqual(errors, [], `${viewport.label}px interactive atlas emitted page errors: ${errors.join(' | ')}`);
    console.log(`Interactive Atlas Re-entry ${viewport.label}px PASS`);
    await context.close();
  }

  console.log('Interactive Atlas Re-entry PASS: 390/900/1600 visual-only discovery → inline knowledge → variant preview/commit → exact scene restore.');
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4208';
const outputDir = path.resolve('artifacts/interactive-atlas-detail-v2');
fs.mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, locale: 'zh-CN' });
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
  await page.locator('[data-traditional-browse-guide]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-interactive-atlas-knowledge]').count(), 0, 'knowledge panel must be closed in exploration state');

  const firstShortcut = page.locator('[data-atlas-species-shortcut]').first();
  const anchorId = await firstShortcut.getAttribute('data-atlas-species-shortcut');
  assert.ok(anchorId, 'discovery tank must expose a stable grouped anchor species');
  await firstShortcut.evaluate(element => element.click());

  await page.locator('[data-interactive-atlas-knowledge]').waitFor({ state: 'visible' });
  assert.equal(await atlas.getAttribute('data-state'), 'observing');
  assert.equal(await atlas.getAttribute('data-selected-species-id'), anchorId);
  assert.equal(await page.locator('[data-traditional-browse-guide]').count(), 0, 'classic browse guide must step back while observing a species');

  const rail = page.locator('[data-variant-hover-rail]');
  await rail.waitFor({ state: 'visible' });
  const variants = rail.locator('[data-variant-id]');
  assert.ok(await variants.count() >= 2, 'the discovery anchor must demonstrate a multi-variant group');
  const secondVariant = variants.nth(1);
  const secondId = await secondVariant.getAttribute('data-variant-id');
  assert.ok(secondId && secondId !== anchorId, 'variant rail must expose a distinct preview target');

  await secondVariant.hover();
  await page.waitForFunction(id => document.querySelector('[data-interactive-atlas-knowledge]')?.getAttribute('data-preview-species-id') === id, secondId);
  assert.equal(await atlas.getAttribute('data-selected-species-id'), anchorId, 'hover preview must not commit the variant');
  await page.mouse.move(1, 1);
  await page.waitForFunction(id => document.querySelector('[data-interactive-atlas-knowledge]')?.getAttribute('data-preview-species-id') === id, anchorId);

  await secondVariant.click();
  await page.waitForFunction(id => document.querySelector('[data-interactive-atlas]')?.getAttribute('data-selected-species-id') === id, secondId);
  assert.equal(await page.locator('[data-interactive-atlas-knowledge]').getAttribute('data-preview-species-id'), secondId, 'click must commit the chosen variant');

  await page.screenshot({ path: path.join(outputDir, 'observing-with-variant-rail.png'), fullPage: false });

  await page.locator('[data-interactive-atlas-knowledge] button[aria-label="关闭物种详情"]').click();
  await page.waitForFunction(() => document.querySelector('[data-interactive-atlas]')?.getAttribute('data-state') === 'exploring');
  assert.equal(await atlas.getAttribute('data-selected-species-id'), '');
  await page.locator('[data-traditional-browse-guide]').waitFor({ state: 'visible' });
  assert.equal(await firstShortcut.getAttribute('data-atlas-species-shortcut'), anchorId, 'closing detail must preserve the original random discovery tank');

  assert.deepEqual(errors, [], `interactive atlas emitted page errors: ${errors.join(' | ')}`);
  console.log('Interactive Atlas Detail V2 PASS: stable tank → inline knowledge slide-over → hover-only variant preview → click commit → close restores same tank + classic browse guide');
} finally {
  await browser.close();
}

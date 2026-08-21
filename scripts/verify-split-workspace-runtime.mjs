import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:3002';
const browser = await chromium.launch({ headless: true });

async function assertSplitPage(page, path, openDetail, closeDetail) {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await openDetail(page);

  const detail = page.locator('[data-surface="split-workspace-detail"]');
  await detail.waitFor({ state: 'visible' });
  const detailBox = await detail.boundingBox();
  assert.ok(detailBox, `${path} must render a visible detail region`);
  assert.notEqual(await detail.evaluate(node => getComputedStyle(node).position), 'fixed', `${path} detail must participate in page layout`);
  assert.equal(await detail.locator('xpath=ancestor-or-self::*[@data-slot="dialog-portal"]').count(), 0, `${path} detail must not render through DialogPortal`);
  assert.equal(await page.locator('body').evaluate(node => node.classList.contains('modal-open')), false, `${path} must not lock the document as a modal`);

  const workspace = page.locator(path.startsWith('/care') ? '.care-workspace-shell' : '.encyclopedia-workspace');
  const workspaceBox = await workspace.boundingBox();
  assert.ok(workspaceBox, `${path} must keep a workspace root`);
  const browse = path.startsWith('/care')
    ? workspace.locator(':scope > .care-workspace-grid')
    : workspace.locator(':scope > :not([data-surface="split-workspace-detail"])').first();
  const browseBox = await browse.boundingBox();
  assert.ok(browseBox, `${path} must keep a visible browse pane beside the detail`);
  assert.ok(detailBox.x > workspaceBox.x + workspaceBox.width * 0.42, `${path} detail must occupy the right side of its workspace`);
  assert.ok(detailBox.x + detailBox.width <= workspaceBox.x + workspaceBox.width + 2, `${path} detail must stay inside its workspace`);
  assert.ok(browseBox.x + browseBox.width <= detailBox.x + 1, `${path} browse and detail panes must not overlap`);
  assert.equal(pageErrors.length, 0, `${path} must not throw while opening a detail: ${pageErrors.join('; ')}`);

  await closeDetail(page);
  await detail.waitFor({ state: 'hidden' });
}

try {
  const atlas = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await assertSplitPage(
    atlas,
    '/encyclopedia',
    async page => {
      await page.locator('[data-scene-node]').first().click();
    },
    async page => page.getByRole('button', { name: /关闭物种档案|close species/i }).click(),
  );

  const care = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await assertSplitPage(
    care,
    '/care?topic=guide_new_fish_acclimation',
    async () => {},
    async page => page.getByRole('button', { name: /关闭指南|close guide/i }).click(),
  );

  console.log('split workspace runtime: PASS');
} finally {
  await browser.close();
}

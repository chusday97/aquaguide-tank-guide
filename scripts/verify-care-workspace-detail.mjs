import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(20_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  // Direct deeplink opens a workspace detail, not a Dialog.
  await page.goto(`${baseUrl}/care?topic=guide_safe_water_change`, { waitUntil: 'domcontentloaded' });
  let detail = page.locator('[data-care-workspace-detail]');
  await detail.waitFor();
  await detail.getByText('安全换水', { exact: false }).first().waitFor();
  assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, 'Opening a Care article must not create a browsing Dialog.');
  await page.locator('[data-care-browse-surface]').waitFor({ state: 'hidden' });

  const back = detail.locator('[data-care-detail-back]');
  await back.waitFor();
  await back.click();
  await page.waitForURL(url => url.pathname === '/care' && !url.searchParams.has('topic'));
  await page.locator('[data-care-browse-surface]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-care-workspace-detail]').count(), 0, 'Back from Care detail must restore the browse workspace.');

  // Opening from a real recommendation captures/returns to the browse context.
  const sourceCard = page.locator('[data-care-recommend-card]').first();
  await sourceCard.waitFor();
  const sourceId = await sourceCard.getAttribute('id');
  assert.ok(sourceId, 'Recommendation source needs a stable id for return-context verification.');
  await sourceCard.click();
  detail = page.locator('[data-care-workspace-detail]');
  await detail.waitFor();
  assert.equal(await page.locator('[role="dialog"]:visible').count(), 0, 'Care recommendation detail must remain a workspace surface.');
  await detail.locator('[data-care-detail-back]').click();
  await page.locator(`#${sourceId}`).waitFor();
  assert.equal(new URL(page.url()).pathname, '/care', 'Returning from a Care article must stay in the Care workspace.');

  assert.deepEqual(pageErrors, [], `Care workspace detail path must not emit page errors: ${pageErrors.join('; ')}`);
  console.log('Care workspace detail browser contract PASS: deeplink + browse return context + no article Dialog.');
} finally {
  await browser.close();
}

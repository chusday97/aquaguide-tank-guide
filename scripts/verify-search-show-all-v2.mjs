import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle' });

  const command = page.locator('.search-v2-command');
  const input = command.getByRole('combobox');
  await input.fill('鱼');

  const listbox = command.getByRole('listbox');
  await listbox.waitFor({ state: 'visible' });
  const showAllAction = listbox.locator('button:not([role="option"])');
  assert.equal(await showAllAction.count(), 1, '宽泛查询超过联想上限时必须只有一个明确的查看全部动作');

  const label = (await showAllAction.innerText()).trim();
  const advertisedTotal = Number(label.match(/\d+/)?.[0] || 0);
  assert.ok(advertisedTotal > 18, `查看全部回归需要 >18 个匹配物种，实际文案：${label}`);

  await showAllAction.click();
  await page.waitForURL(url => url.pathname === '/search' && url.searchParams.get('q') === '鱼');

  const speciesSection = page.locator('.search-v2-species-section');
  await speciesSection.waitFor({ state: 'visible' });
  const resultCards = speciesSection.locator('.search-v2-species-card');
  await page.waitForFunction(
    expected => document.querySelectorAll('.search-v2-species-section .search-v2-species-card').length === expected,
    advertisedTotal,
  );

  assert.equal(
    await resultCards.count(),
    advertisedTotal,
    `点击“查看全部 ${advertisedTotal} 个物种”后必须真实显示同一匹配集合的全部结果`,
  );

  // Section-level expansion is required too: result pages must not depend on the autocomplete
  // being open for discoverability.
  await page.goto(`${baseUrl}/search?q=${encodeURIComponent('鱼')}`, { waitUntil: 'networkidle' });
  const sectionSpeciesCount = Number((await page.locator('.search-v2-species-section .search-v2-count').innerText()).trim());
  assert.ok(sectionSpeciesCount > 18, 'section-level species expansion fixture must exceed the preview cap');
  assert.equal(await page.locator('.search-v2-species-card').count(), 18, 'normal species result page should keep a concise 18-card preview');
  await page.locator('[data-search-show-all="species"]').click();
  assert.equal(await page.locator('.search-v2-species-card').count(), sectionSpeciesCount, 'species section show-all must render the full advertised set');

  // Find a deterministic broad care query from the current catalog rather than hard-coding
  // an assumption about future care content volume.
  let careFixture = null;
  for (const query of ['鱼', '水', '养', '新', '缸']) {
    await page.goto(`${baseUrl}/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle' });
    const careSection = page.locator('.search-v2-care-section');
    if (await careSection.count() === 0) continue;
    const total = Number((await careSection.locator('.search-v2-count').innerText()).trim());
    if (total > 12) {
      careFixture = { query, total };
      break;
    }
  }

  assert.ok(careFixture, 'care catalog must expose at least one broad query with more than 12 results for show-all regression');
  assert.equal(await page.locator('.search-v2-care-card').count(), 12, 'care result page should keep a concise 12-card preview before explicit expansion');
  const careShowAll = page.locator('[data-search-show-all="care"]');
  await careShowAll.waitFor({ state: 'visible' });
  await careShowAll.click();
  assert.equal(await page.locator('.search-v2-care-card').count(), careFixture.total, 'care section show-all must render the full advertised set');

  assert.deepEqual(errors, [], `Search show-all 不应产生页面错误：${errors.join(' | ')}`);
  console.log(`Search V2 show-all PASS: species=${advertisedTotal}; care(${careFixture.query})=${careFixture.total}`);
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await page.route('**/api/v1/ai/species-recognition', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          recognitionId: '00000000-0000-4000-8000-000000000001',
          imageFingerprint: '0'.repeat(64),
          status: 'unmatched',
          candidates: [],
          requiresConfirmation: true,
          source: 'fallback',
          failureReason: 'not_configured',
          generatedAt: '2026-08-18T00:00:00.000Z',
        },
        requestId: 'identify-overflow-regression',
      }),
    });
  });

  await page.goto(`${baseUrl}/identify`, { waitUntil: 'networkidle' });
  await page.locator('input[type="file"]').setInputFiles('public/responsive/care/pregnant_fish_breeder_box_realistic-960.webp');
  await page.locator('[data-identify-stage="candidates"]').waitFor({ state: 'visible', timeout: 10_000 });

  const input = page.getByLabel('没有合适候选？手动搜索物种库');
  await input.fill('鱼');
  const listbox = page.locator('[data-search-suggestion-list="true"]');
  await listbox.waitFor({ state: 'visible' });

  const hint = listbox.getByText(/^共匹配 \d+ 个物种，请继续输入$/);
  await hint.waitFor({ state: 'visible' });
  const text = (await hint.innerText()).trim();
  const total = Number(text.match(/\d+/)?.[0] || 0);
  assert.ok(total > await listbox.getByRole('option').count(), `宽泛手动搜索应产生 overflow hint，实际：${text}`);
  assert.equal(await hint.evaluate(node => node.tagName), 'DIV', '“请继续输入”是输入引导，不得渲染成可点击按钮');
  assert.equal(await listbox.locator('button:not([role="option"])').count(), 0, 'Identify overflow 区不得存在无 effect 的额外 CTA');
  assert.deepEqual(errors, [], `Identify overflow hint 不应产生页面错误：${errors.join(' | ')}`);

  console.log(`Identify search overflow hint regression: PASS (${total})`);
} finally {
  await browser.close();
}
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const fixture = resolve('public/responsive/care/pregnant_fish_breeder_box_realistic-960.webp');
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  await page.goto(`${baseUrl}/identify`, { waitUntil: 'networkidle' });
  await page.locator('input[type=file]').setInputFiles(fixture);
  await page.getByText('视觉模型未配置或暂不可用').waitFor({ timeout: 20_000 });
  await page.getByLabel('没有合适候选？手动搜索物种库').fill('孔雀鱼');
  await page.getByRole('option', { name: /孔雀鱼/ }).first().click();
  await page.locator('[data-selected-species-summary="true"]').getByRole('button', { name: '确认是它' }).click();

  assert.equal(await page.getByRole('heading', { name: '它现在有什么异常？' }).count(), 0, 'confirming identity must not start health triage');
  assert.ok(await page.getByText('识别结果', { exact: true }).isVisible());
  assert.ok(await page.getByRole('button', { name: /先建立鱼缸|结合鱼缸判断混养/ }).isVisible());
  assert.ok(await page.getByRole('button', { name: '查看物种资料' }).isVisible());
  assert.ok(await page.getByRole('button', { name: '它有异常？进入健康分诊' }).isVisible());

  await page.getByRole('button', { name: '它有异常？进入健康分诊' }).click();
  await page.getByRole('heading', { name: '它现在有什么异常？' }).waitFor();
  assert.ok(await page.getByText('物种健康分诊', { exact: true }).isVisible());
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  console.log('identify flow separation: identity result precedes optional health triage');
} finally {
  await browser.close();
}

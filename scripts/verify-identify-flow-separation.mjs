import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_URL || process.env.AQUAGUIDE_PREVIEW_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4317';
const fixture = resolve('public/responsive/care/pregnant_fish_breeder_box_realistic-960.webp');
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
  await page.addInitScript(() => { localStorage.setItem('aquaguide_locale','zh-CN'); localStorage.setItem('aquarium_app_state_v1', JSON.stringify({ version:1, currentAquariumId:'', aquariums:[], wishlist:[], dismissedRecommendations:[], diagnosisRecords:[], compatibilityRecords:[], deceasedRecords:[], feedingRecords:[], observationRecords:[], riskReminderState:{}, onboarding:{ version:1, status:'completed', viewedSpecies:true, aquariumConfigured:true, taskCardDismissed:true }, updatedAt:new Date().toISOString() })); });
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
  const draft = page.locator('textarea[aria-required="true"]');
  await draft.fill('今天开始浮头，呼吸明显变快，想先记录再判断。');
  await page.getByRole('button', { name: '返回物种图鉴' }).click();
  const leaveGuard = page.locator('[data-dialog-surface="blocking"][data-open]').filter({ hasText: '离开本次状态判断？' });
  await leaveGuard.waitFor();
  assert.match(page.url(), /\/identify/, 'unsaved triage must keep Identify active until user decides');
  await leaveGuard.getByRole('button', { name: '继续判断' }).click();
  await leaveGuard.waitFor({ state: 'hidden' });
  assert.equal(await draft.inputValue(), '今天开始浮头，呼吸明显变快，想先记录再判断。', 'staying must preserve diagnosis draft');
  await page.getByRole('button', { name: '返回物种图鉴' }).click();
  const confirmLeave = page.locator('[data-dialog-surface="blocking"][data-open]').filter({ hasText: '离开本次状态判断？' });
  await confirmLeave.waitFor();
  await confirmLeave.getByRole('button', { name: '离开' }).click();
  await page.waitForURL(url => url.pathname === '/encyclopedia');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  console.log('identify flow separation + unsaved navigation guard: PASS');
} finally {
  await browser.close();
}

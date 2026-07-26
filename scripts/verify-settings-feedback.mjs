import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });

const seed = async page => {
  await page.addInitScript(() => {
    localStorage.setItem('aquaguide_locale', 'zh-CN');
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify({
      version: 1,
      currentAquariumId: 'feedback-tank',
      aquariums: [{
        id: 'feedback-tank',
        name: '反馈测试缸',
        fishes: [],
        waterType: 'Freshwater',
        dimensions: { length: '60', width: '40', height: '40' },
        equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
        substrate: '无',
        plants: [],
        hardscape: [],
      }],
      wishlist: [],
      dismissedRecommendations: [],
      diagnosisRecords: [],
      compatibilityRecords: [],
      deceasedRecords: [],
      feedingRecords: [],
      observationRecords: [],
      riskReminderState: {},
      onboarding: { version: 1, status: 'completed', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: false },
      updatedAt: new Date().toISOString(),
    }));
  });
};

try {
  for (const device of [
    { width: 1280, height: 900, isMobile: false },
    { width: 390, height: 844, isMobile: true },
  ]) {
    const page = await browser.newPage({
      viewport: { width: device.width, height: device.height },
      locale: 'zh-CN',
      isMobile: device.isMobile,
      hasTouch: device.isMobile,
      userAgent: device.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
        : undefined,
    });
    await seed(page);
    let submittedBody;
    await page.route('**/api/v1/feedback', async route => {
      submittedBody = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'feedback-id', status: 'new', createdAt: new Date().toISOString() }, requestId: 'feedback-request' }),
      });
    });
    await page.goto(`${baseUrl}/settings#feedback`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: '意见反馈' }).waitFor();
    const submit = page.getByRole('button', { name: '提交反馈' });
    assert.equal(await submit.isDisabled(), true, 'short feedback must not be submitted');
    await page.getByRole('textbox', { name: '你的意见' }).fill('希望风险处理可以继续保留明确的三步操作。');
    await page.getByText('使用问题', { exact: true }).click();
    await submit.click();
    await page.getByText('已收到，谢谢你的建议。', { exact: true }).waitFor();
    assert.equal(submittedBody.category, 'problem');
    assert.equal(submittedBody.deviceLayout, device.isMobile ? 'phone' : 'desktop');
    assert.equal(submittedBody.pagePath, '/settings#feedback');
    assert.equal('aquarium' in submittedBody, false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await page.close();
  }

  const failurePage = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: 'zh-CN' });
  await seed(failurePage);
  await failurePage.route('**/api/v1/feedback', route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: '反馈服务暂时不可用。' }, requestId: 'failed-feedback' }),
  }));
  await failurePage.goto(`${baseUrl}/settings#feedback`, { waitUntil: 'domcontentloaded' });
  const failureInput = failurePage.getByRole('textbox', { name: '你的意见' });
  const failureMessage = '提交失败时需要保留这段文字，方便用户重试。';
  await failureInput.fill(failureMessage);
  await failurePage.getByRole('button', { name: '提交反馈' }).click();
  await failurePage.getByRole('alert').waitFor();
  assert.equal(await failureInput.inputValue(), failureMessage, 'failed submission must preserve user input');
  await failurePage.close();

  console.log('settings feedback verified: validation, metadata, success, responsive layout and failure recovery');
} finally {
  await browser.close();
}

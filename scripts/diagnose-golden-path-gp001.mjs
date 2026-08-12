import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const snapshot = async (page, label) => {
  const data = await page.evaluate(() => ({
    url: location.href,
    userAgent: navigator.userAgent,
    buttons: Array.from(document.querySelectorAll('button')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => ({ text: (el.textContent || '').replace(/\s+/g, ' ').trim(), aria: el.getAttribute('aria-label') })).filter(item => item.text || item.aria).slice(0, 100),
    inputs: Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      aria: el.getAttribute('aria-label'),
      placeholder: el.getAttribute('placeholder'),
      value: el.value,
    })).slice(0, 80),
    dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => ({ surface: el.getAttribute('data-surface'), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 1800) })),
    appState: JSON.parse(localStorage.getItem('aquarium_app_state_v1') || 'null'),
  }));
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(data, null, 2));
};

const runScenario = async ({ label, viewport, userAgent, isMobile = false, hasTouch = false }) => {
  const page = await browser.newPage({ viewport, locale: 'zh-CN', userAgent, isMobile, hasTouch });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  await page.addInitScript(() => {
    localStorage.removeItem('aquarium_app_state_v1');
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/welcome');
  await page.getByRole('button').filter({ hasText: '开始' }).first().click();
  await page.waitForURL('**/aquarium?action=create&source=onboarding');
  await page.waitForURL('**/aquarium');
  await page.getByText(/已新建/).waitFor();
  await snapshot(page, `${label}_AFTER_CREATE`);

  const setupTask = page.getByRole('button', { name: /建立或完善鱼缸/ }).first();
  console.log(`${label}_SETUP_TASK_COUNT=${await setupTask.count()}`);
  if (await setupTask.count()) {
    await setupTask.click();
    await page.waitForTimeout(700);
  }
  await snapshot(page, `${label}_AFTER_SETUP_ENTRY`);
  await page.close();
};

try {
  await runScenario({
    label: 'PHONE',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });

  await runScenario({
    label: 'DESKTOP',
    viewport: { width: 1200, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
  });
} finally {
  await browser.close();
}

import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });

const snapshot = async (page, label) => {
  const data = await page.evaluate(() => ({
    url: location.href,
    buttons: Array.from(document.querySelectorAll('button')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => (el.textContent || el.getAttribute('aria-label') || '').trim()).filter(Boolean).slice(0, 80),
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
    })).slice(0, 60),
    dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => ({ surface: el.getAttribute('data-surface'), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 1200) })),
    appState: JSON.parse(localStorage.getItem('aquarium_app_state_v1') || 'null'),
  }));
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(data, null, 2));
};

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true });
  page.setDefaultTimeout(10_000);
  page.setDefaultNavigationTimeout(20_000);
  await page.addInitScript(() => {
    localStorage.removeItem('aquarium_app_state_v1');
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  });

  await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/welcome');
  await snapshot(page, 'WELCOME');

  await page.getByRole('button').filter({ hasText: '开始' }).first().click();
  await page.waitForURL('**/aquarium?action=create&source=onboarding');
  await page.waitForURL('**/aquarium');
  await page.getByText(/已新建/).waitFor();
  await snapshot(page, 'AFTER_CREATE');

  const setupButton = page.getByRole('button', { name: /完善鱼缸参数|设置鱼缸|完善参数/ }).first();
  if (await setupButton.count()) {
    await setupButton.click();
  } else {
    const textButton = page.getByText(/完善鱼缸参数|设置鱼缸|完善参数/, { exact: false }).first();
    if (await textButton.count()) await textButton.click();
  }
  await page.waitForTimeout(500);
  await snapshot(page, 'AFTER_SETUP_ENTRY');
} finally {
  await browser.close();
}

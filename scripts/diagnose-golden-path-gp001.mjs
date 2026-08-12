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
    }).map(el => ({
      text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      aria: el.getAttribute('aria-label'),
      pressed: el.getAttribute('aria-pressed'),
      expanded: el.getAttribute('aria-expanded'),
    })).filter(item => item.text || item.aria).slice(0, 140),
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
      checked: 'checked' in el ? el.checked : undefined,
    })).slice(0, 100),
    dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).map(el => ({ surface: el.getAttribute('data-surface'), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 2600) })),
    appState: JSON.parse(localStorage.getItem('aquarium_app_state_v1') || 'null'),
  }));
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(data, null, 2));
};

const openFreshSetup = async (page, label) => {
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
  const setupTask = page.getByRole('button', { name: /建立或完善鱼缸/ }).first();
  await setupTask.waitFor();
  await setupTask.click();
  const surface = page.locator('[role="dialog"]:visible');
  await surface.waitFor();
  await snapshot(page, `${label}_SETUP_INITIAL`);
  return surface;
};

try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });
  const surface = await openFreshSetup(page, 'PHONE');

  const sizePreset = surface.getByRole('button', { name: /60×30×35/ }).first();
  await sizePreset.click();
  await snapshot(page, 'PHONE_AFTER_SIZE_63L');

  const paramsSection = surface.getByRole('button', { name: /参数.*水体未记录.*目标温度未记录/ }).first();
  await paramsSection.click();
  await page.waitForTimeout(200);
  await snapshot(page, 'PHONE_PARAMETERS_EXPANDED');

  const paramsText = (await surface.textContent()) || '';
  console.log('PHONE_PARAMETER_TEXT_MATCHES', JSON.stringify({
    freshwater: /淡水/.test(paramsText),
    saltwater: /海水/.test(paramsText),
    temperatures: ['22°C','24°C','25°C','26°C','28°C'].filter(item => paramsText.includes(item)),
  }));

  const equipmentSection = surface.getByRole('button', { name: /设备.*未选择过滤或辅助设备/ }).first();
  await equipmentSection.click();
  await page.waitForTimeout(200);
  await snapshot(page, 'PHONE_EQUIPMENT_EXPANDED');

  await page.close();
} finally {
  await browser.close();
}

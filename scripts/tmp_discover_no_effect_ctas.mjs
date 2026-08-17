import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1,
  currentAquariumId: 'cta-audit-tank',
  aquariums: [{
    id: 'cta-audit-tank', name: 'CTA 审计缸',
    fishes: [{ id: 'cta-stock-1', fishId: 'sp_0431', quantity: 6, entryDate: today }],
    dimensions: { length: '60', width: '30', height: '30' },
    waterType: 'Freshwater', targetTemperature: '25', waterChangeHistory: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' },
  }],
  wishlist: [], careFavorites: {}, dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [],
  deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const routes = ['/aquarium', '/care', '/collection', '/identify', '/settings', '/encyclopedia'];
const destructive = /(删除|移出|清空|注销|退出|重置|撤回|remove|delete|clear|logout|reset|undo)/i;
const browser = await chromium.launch({ headless: true });

const newContext = async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(saved => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', 'zh-CN');
  }, state);
  return context;
};

const snapshot = async page => page.evaluate(() => ({
  url: location.href,
  body: document.body.innerHTML,
  local: JSON.stringify(localStorage),
  session: JSON.stringify(sessionStorage),
  scrollX: window.scrollX,
  scrollY: window.scrollY,
  dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(node => {
    const style = getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }).length,
}));

try {
  const findings = [];
  for (const route of routes) {
    const inventoryContext = await newContext();
    const inventoryPage = await inventoryContext.newPage();
    await inventoryPage.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await inventoryPage.waitForTimeout(700);
    const buttons = await inventoryPage.locator('button:visible').evaluateAll(nodes => nodes.map((node, index) => ({
      index,
      label: (node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent || '').replace(/\s+/g, ' ').trim(),
      disabled: node.disabled,
    })));
    await inventoryContext.close();

    for (const button of buttons) {
      if (button.disabled || !button.label || destructive.test(button.label)) continue;
      const context = await newContext();
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(700);
      const locator = page.locator('button:visible').nth(button.index);
      if (!(await locator.count())) { await context.close(); continue; }
      const currentLabel = ((await locator.getAttribute('aria-label')) || (await locator.getAttribute('title')) || (await locator.textContent()) || '').replace(/\s+/g, ' ').trim();
      if (!currentLabel) { await context.close(); continue; }
      const before = await snapshot(page);
      let clickError = '';
      try {
        await locator.click({ timeout: 2500 });
        await page.waitForTimeout(650);
      } catch (error) {
        clickError = error instanceof Error ? error.message.split('\n')[0] : String(error);
      }
      const after = await snapshot(page);
      const effects = {
        url: before.url !== after.url,
        dom: before.body !== after.body,
        localStorage: before.local !== after.local,
        sessionStorage: before.session !== after.session,
        scroll: before.scrollX !== after.scrollX || before.scrollY !== after.scrollY,
        dialog: before.dialogs !== after.dialogs,
      };
      if (!clickError && !Object.values(effects).some(Boolean)) {
        findings.push({ route, index: button.index, label: currentLabel, effects, pageErrors });
      }
      await context.close();
    }
  }

  console.log('CTA_EFFECT_DISCOVERY_BEGIN');
  console.log(JSON.stringify(findings, null, 2));
  console.log('CTA_EFFECT_DISCOVERY_END');
  console.log(`no-observable-effect candidates: ${findings.length}`);
} finally {
  await browser.close();
}

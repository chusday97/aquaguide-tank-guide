import { chromium } from 'playwright';

const baseUrl = process.env.AQUAGUIDE_PREVIEW_URL || 'http://127.0.0.1:4173';
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1, currentAquariumId: 'cta-audit-tank',
  aquariums: [{ id: 'cta-audit-tank', name: 'CTA 审计缸', fishes: [{ id: 'cta-stock-1', fishId: 'sp_0431', quantity: 6, entryDate: today }], dimensions: { length: '60', width: '30', height: '30' }, waterType: 'Freshwater', targetTemperature: '25', waterChangeHistory: [], equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' } }],
  wishlist: [], careFavorites: {}, dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true }, updatedAt: new Date().toISOString(),
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
const snapshot = page => page.evaluate(() => ({
  url: location.href, body: document.body.innerHTML, local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage),
  scrollX: window.scrollX, scrollY: window.scrollY,
  dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(node => { const s = getComputedStyle(node); return s.display !== 'none' && s.visibility !== 'hidden'; }).length,
}));
const testButton = async ({ route, index, expectedLabel }) => {
  const context = await newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(450);
    const locator = page.locator('main button:visible').nth(index);
    if (!(await locator.count())) return null;
    const label = ((await locator.getAttribute('aria-label')) || (await locator.getAttribute('title')) || (await locator.textContent()) || '').replace(/\s+/g, ' ').trim();
    if (!label || label !== expectedLabel) return null;
    const before = await snapshot(page);
    try { await locator.click({ timeout: 1200 }); } catch { return null; }
    await page.waitForTimeout(450);
    const after = await snapshot(page);
    const effects = { url: before.url !== after.url, dom: before.body !== after.body, localStorage: before.local !== after.local, sessionStorage: before.session !== after.session, scroll: before.scrollX !== after.scrollX || before.scrollY !== after.scrollY, dialog: before.dialogs !== after.dialogs };
    return Object.values(effects).some(Boolean) ? null : { route, index, label, effects };
  } finally { await context.close(); }
};

try {
  const tasks = [];
  for (const route of routes) {
    const context = await newContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForTimeout(450);
    const buttons = await page.locator('main button:visible').evaluateAll(nodes => nodes.map((node, index) => ({ index, label: (node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent || '').replace(/\s+/g, ' ').trim(), disabled: node.disabled })));
    await context.close();
    for (const button of buttons) if (!button.disabled && button.label && !destructive.test(button.label)) tasks.push({ route, index: button.index, expectedLabel: button.label });
  }
  console.log(`auditing ${tasks.length} visible non-destructive content buttons`);
  const findings = [];
  let cursor = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      const finding = await testButton(task);
      if (finding) findings.push(finding);
    }
  });
  await Promise.all(workers);
  findings.sort((a, b) => a.route.localeCompare(b.route) || a.index - b.index);
  console.log('CTA_EFFECT_DISCOVERY_BEGIN');
  console.log(JSON.stringify(findings, null, 2));
  console.log('CTA_EFFECT_DISCOVERY_END');
  console.log(`no-observable-effect candidates: ${findings.length}`);
} finally { await browser.close(); }

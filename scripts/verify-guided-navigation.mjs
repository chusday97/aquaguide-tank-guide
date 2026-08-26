import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
const browser = await chromium.launch({ headless: true });

const baseState = ({ withTank = false } = {}) => ({
  version: 1,
  currentAquariumId: withTank ? 'tank-1' : '',
  aquariums: withTank ? [{
    id: 'tank-1',
    name: '测试鱼缸',
    fishes: [{
      id: 'stock-1',
      fishId: 'sp_0001',
      quantity: 4,
      entryDate: '2026-07-20T00:00:00.000Z',
      batches: [{ id: 'batch-1', quantity: 4, entryDate: '2026-07-20T00:00:00.000Z', lifeStage: 'unknown', reproductiveState: 'unknown', stateUpdatedAt: '2026-07-20T00:00:00.000Z' }],
    }],
    lastWaterChangeDate: '2026-07-20T00:00:00.000Z',
    dimensions: { length: '60', width: '40', height: '40' },
    waterType: 'Freshwater',
    targetTemperature: '25',
    substrate: '无',
    plants: [],
    hardscape: [],
    equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
  }] : [],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  riskReminderState: {},
  onboarding: { version: 1, status: 'completed', viewedSpecies: true, taskCardDismissed: false },
  updatedAt: new Date().toISOString(),
});

const seed = async (page, state, locale = 'zh-CN') => {
  await page.addInitScript(({ state: saved, locale: language }) => {
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
    localStorage.setItem('aquaguide_locale', language);
  }, { state, locale });
};

try {
  const fresh = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', isMobile: true, hasTouch: true });
  fresh.setDefaultTimeout(8_000);
  fresh.setDefaultNavigationTimeout(20_000);
  await fresh.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await fresh.waitForURL('**/welcome');
  await fresh.getByRole('button', { name: '开始' }).first().click();
  await fresh.waitForURL('**/aquarium?action=create&source=onboarding');
  await fresh.waitForURL('**/aquarium');
  await fresh.getByText(/已新建/).waitFor();
  console.log('PASS onboarding creates and enters the real aquarium');
  await fresh.close();

  const desktop = await browser.newPage({ viewport: { width: 1200, height: 900 }, locale: 'zh-CN' });
  desktop.setDefaultTimeout(8_000);
  desktop.setDefaultNavigationTimeout(20_000);
  await seed(desktop, baseState({ withTank: true }));
  const desktopErrors = [];
  desktop.on('pageerror', error => desktopErrors.push(error.message));
  await desktop.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });

  await desktop.goto(`${baseUrl}/search?q=${encodeURIComponent('极火虾')}`, { waitUntil: 'domcontentloaded' });
  await desktop.getByRole('heading', { name: '物种' }).waitFor();
  await desktop.locator('#search-species-sp_0001').click();
  await desktop.getByRole('button', { name: '查看详情' }).click();
  await desktop.waitForURL('**/encyclopedia?species=sp_0001&source=search');
  await desktop.getByRole('dialog').waitFor();
  await desktop.keyboard.press('Escape');
  await desktop.waitForURL('**/search?q=*');
  assert.equal(new URL(desktop.url()).searchParams.get('q'), '极火虾');
  await desktop.waitForFunction(() => document.activeElement?.id === 'search-species-sp_0001');
  assert.equal(await desktop.evaluate(() => document.activeElement?.id), 'search-species-sp_0001', 'closing a search result must restore source-card focus');
  const pageSearch = desktop.getByPlaceholder('输入中文名、英文名、学名或养护问题');
  await pageSearch.fill('Fire Shrimp');
  await pageSearch.press('Enter');
  await desktop.locator('#search-species-sp_0001').waitFor();
  await desktop.getByRole('button', { name: '拍照识别' }).first().click();
  await desktop.waitForURL('**/identify');
  await desktop.goBack();
  await desktop.getByRole('button', { name: '设置' }).last().click();
  await desktop.waitForURL('**/settings');
  assert.deepEqual(desktopErrors, []);
  console.log('PASS search route, photo identification, and settings use routes');

  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });
  phone.setDefaultTimeout(8_000);
  phone.setDefaultNavigationTimeout(20_000);
  await seed(phone, baseState({ withTank: true }));
  const phoneErrors = [];
  phone.on('pageerror', error => phoneErrors.push(error.message));
  await phone.goto(`${baseUrl}/aquarium`, { waitUntil: 'domcontentloaded' });
  await phone.locator('[data-tank-species-entry]').click();
  await phone.getByRole('button', { name: '调整体态' }).click();
  await phone.getByRole('button', { name: '下一步：选择体态' }).click();
  await phone.getByRole('radio', { name: '成年', exact: true }).click();
  await phone.getByRole('radio', { name: '常态', exact: true }).click();
  await phone.getByRole('button', { name: '核对修改' }).click();
  await phone.getByText('保存前核对', { exact: true }).waitFor();
  await phone.getByRole('button', { name: '保存修改' }).click();
  await phone.getByRole('button', { name: '保存修改' }).waitFor({ state: 'hidden' });

  await phone.getByRole('button', { name: '调整体态' }).click();
  await phone.getByRole('textbox', { name: '本次调整数量' }).fill('1');
  await phone.getByRole('button', { name: '下一步：选择体态' }).click();
  await phone.getByRole('radio', { name: '成年', exact: true }).click();
  await phone.getByRole('radio', { name: '怀孕 / 抱卵', exact: true }).click();
  await phone.getByRole('button', { name: '核对修改' }).click();
  await phone.getByText('只修改所选数量，其余生物仍保留在原组。', { exact: true }).waitFor();
  await phone.getByRole('button', { name: '保存修改' }).click();
  await phone.getByRole('button', { name: '保存修改' }).waitFor({ state: 'hidden' });
  await phone.getByText(/共 4 条\/只 · 成年 4 · 怀孕 1/).waitFor();
  const stored = await phone.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1')).aquariums[0].fishes[0]);
  assert.equal(stored.quantity, 4, 'state editing must never change the total livestock quantity');
  assert.equal(stored.batches.length, 2);
  await phone.getByRole('button', { name: '调整体态' }).click();
  await phone.getByRole('button', { name: '删除第 1 组' }).click();
  await phone.getByText('将删除这 3 条/只的批次记录。', { exact: true }).waitFor();
  await phone.getByRole('button', { name: '删除这一组' }).click();
  const afterGroupDelete = await phone.evaluate(() => JSON.parse(localStorage.getItem('aquarium_app_state_v1')).aquariums[0].fishes[0]);
  assert.equal(afterGroupDelete.quantity, 1, 'deleting one group must preserve the remaining group');
  assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '390px batch manager must not overflow');
  assert.deepEqual(phoneErrors, []);
  console.log('PASS mobile livestock split persists without overflow');
  await phone.close();

  const narrowEnglish = await browser.newPage({ viewport: { width: 768, height: 900 }, locale: 'en-US' });
  narrowEnglish.setDefaultTimeout(8_000);
  narrowEnglish.setDefaultNavigationTimeout(20_000);
  await seed(narrowEnglish, baseState({ withTank: true }), 'en');
  await narrowEnglish.goto(`${baseUrl}/settings`, { waitUntil: 'domcontentloaded' });
  await narrowEnglish.getByRole('button', { name: 'My Aquarium' }).click();
  await narrowEnglish.waitForURL('**/aquarium');
  assert.ok(await narrowEnglish.locator('.desktop-sidebar').isVisible(), '768px desktop must keep the desktop sidebar');
  assert.equal(await narrowEnglish.locator('[data-layout-mode="phone"]').count(), 0, '768px desktop must not render the phone shell');
  await narrowEnglish.locator('[data-tank-species-entry]').click();
  await narrowEnglish.getByRole('button', { name: 'Manage groups' }).click();
  assert.ok(await narrowEnglish.getByRole('heading', { name: /^Manage / }).isVisible());
  assert.ok(await narrowEnglish.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), '768px English desktop must not overflow');
  await narrowEnglish.getByRole('textbox', { name: 'Number to update' }).fill('2');
  await narrowEnglish.keyboard.press('Escape');
  await narrowEnglish.getByRole('heading', { name: 'Discard changes?' }).waitFor();
  await narrowEnglish.getByRole('button', { name: 'Continue editing' }).click();
  assert.ok(narrowEnglish.url().includes('/aquarium'), 'continuing an edit must keep the livestock editor route');
  await narrowEnglish.keyboard.press('Escape');
  await narrowEnglish.getByRole('heading', { name: 'Discard changes?' }).waitFor();
  await narrowEnglish.getByRole('button', { name: 'Discard changes' }).click();
  await narrowEnglish.getByRole('heading', { name: /^Manage / }).waitFor({ state: 'hidden' });
  await narrowEnglish.getByRole('button', { name: 'Settings', exact: true }).click();
  await narrowEnglish.waitForURL('**/settings');
  await narrowEnglish.goto(`${baseUrl}/search?q=${encodeURIComponent('极火虾')}`, { waitUntil: 'domcontentloaded' });
  await narrowEnglish.locator('#search-species-sp_0001').waitFor();
  await narrowEnglish.goto(`${baseUrl}/encyclopedia?mode=compatibility`, { waitUntil: 'domcontentloaded' });
  await narrowEnglish.waitForFunction(() => document.activeElement?.id === 'compatibility-calculator');

  console.log('guided navigation UI verified: onboarding, direct routes, livestock groups, mobile and narrow English desktop');
} finally {
  await browser.close();
}

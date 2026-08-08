import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const today = new Date().toISOString().slice(0, 10);
const state = {
  version: 1,
  currentAquariumId: 'tank-discovery',
  aquariums: [{
    id: 'tank-discovery', name: '推荐测试缸',
    fishes: [{ id: 'stock-1', fishId: 'sp_0001', quantity: 6, entryDate: today, lastWaterChangeDate: today }],
    lastWaterChangeDate: today, waterChangeHistory: [today],
    dimensions: { length: '60', width: '40', height: '40' }, waterType: 'Freshwater', targetTemperature: '25',
    equipment: { filter: '瀑布过滤', heater: true, oxygen: true, light: '普通灯' }, plants: [], hardscape: [],
  }],
  wishlist: [], dismissedRecommendations: [], diagnosisRecords: [], compatibilityRecords: [], deceasedRecords: [], feedingRecords: [], observationRecords: [], riskReminderState: {},
  onboarding: { version: 1, status: 'completed', goal: 'build_tank', viewedSpecies: true, aquariumConfigured: true, taskCardDismissed: true },
  updatedAt: new Date().toISOString(),
};

const seed = (page) => page.addInitScript(({ saved }) => {
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(saved));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
}, { saved: state });

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 600, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await seed(page);
    await page.goto(`${baseUrl}/aquarium`, { waitUntil: 'networkidle' });

    const discovery = page.locator('#aquarium-discovery');
    await discovery.getByText('今日推荐', { exact: true }).waitFor();
    assert.equal(await discovery.getByText(/\d+ \/ 10/).count(), 1, `daily progress must be visible at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${width}px must not overflow`);

    const firstSpeciesName = (await discovery.locator('h3').innerText()).trim();
    await discovery.getByRole('button', { name: '查看物种详情', exact: true }).click();
    await page.waitForURL(/\/encyclopedia\?species=.*source=daily-discovery/);
    const detailSurface = page.locator('[data-surface="centered-dialog"], [data-surface="bottom-sheet"]');
    await detailSurface.waitFor({ state: 'visible' });
    await detailSurface.getByRole('button', { name: '知道了', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/aquarium');
    await discovery.getByText(firstSpeciesName, { exact: true }).waitFor();

    if (width === 390) {
      await discovery.getByRole('button', { name: '换一个物种', exact: true }).click();
      await page.waitForFunction(previous => document.querySelector('#aquarium-discovery h3')?.textContent?.trim() !== previous, firstSpeciesName);
      const nextSpeciesName = (await discovery.locator('h3').innerText()).trim();
      assert.notEqual(nextSpeciesName, firstSpeciesName, 'switching must advance to another species');
      await discovery.getByRole('button', { name: '收藏物种', exact: true }).click();
      await page.waitForFunction(() => {
        const saved = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return Array.isArray(saved.wishlist) && saved.wishlist.length === 1;
      });
      assert.equal((await discovery.locator('h3').innerText()).trim(), nextSpeciesName, 'saving must keep the current recommendation visible');
      await discovery.getByText('已收录到水族册', { exact: true }).waitFor();
      await discovery.getByRole('button', { name: '取消收藏物种', exact: true }).click();
      await page.waitForFunction(() => {
        const saved = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return Array.isArray(saved.wishlist) && saved.wishlist.length === 0;
      });
      assert.equal((await discovery.locator('h3').innerText()).trim(), nextSpeciesName, 'unsaving must also keep the current recommendation visible');
      await discovery.getByText('已从水族册移除', { exact: true }).waitFor();
    }

    assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
    await page.close();
  }

  const atlas = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await seed(atlas);
  await atlas.goto(`${baseUrl}/encyclopedia`, { waitUntil: 'networkidle' });
  assert.equal(await atlas.getByText('今日推荐', { exact: true }).count(), 0, 'species guide must not duplicate the homepage discovery card');
  await atlas.close();
  console.log('daily discovery verified: aquarium placement, detail return, daily progress, switch, save and no atlas duplicate');
} finally {
  await browser.close();
}

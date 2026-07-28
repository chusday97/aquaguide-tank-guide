import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
  locale: 'zh-CN',
});

await context.addInitScript(() => {
  const state = {
    version: 1,
    currentAquariumId: '',
    aquariums: [],
    wishlist: ['sp_0001'],
    dismissedRecommendations: [],
    diagnosisRecords: [],
    compatibilityRecords: [],
    deceasedRecords: [],
    feedingRecords: [],
    observationRecords: [],
    riskReminderState: {},
    onboarding: {
      version: 1,
      status: 'skipped',
      viewedSpecies: false,
      taskCardDismissed: false,
      aquariumConfigured: false,
    },
    updatedAt: '2026-07-28T00:00:00.000Z',
  };
  localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
  localStorage.setItem('aquariums', '[]');
  localStorage.setItem('wishlistFishIds', JSON.stringify(['sp_0001']));
  localStorage.setItem('aquaguide_locale', 'zh-CN');
});

const page = await context.newPage();
page.setDefaultTimeout(45_000);

try {
  await page.goto(`${baseUrl}/collection/wishlist`, { waitUntil: 'domcontentloaded' });
  await page.locator('#collection-wishlist-sp_0001 button').first().click();
  const detail = page.locator('[role="dialog"][data-surface]:visible');
  const firstSpeciesName = (await detail.getByRole('heading').first().innerText()).trim();
  const variantNavigator = detail.getByLabel(/米虾的其他类型/);
  await variantNavigator.waitFor();
  assert.equal(await variantNavigator.getByRole('button').count() > 2, true, 'grouped species must expose specific variants and two arrow controls');
  await variantNavigator.getByRole('button', { name: '下一个类型' }).click();
  await page.waitForFunction((previousName) => {
    const heading = document.querySelector('[role="dialog"][data-surface] h2');
    return heading?.textContent?.trim() !== previousName;
  }, firstSpeciesName);
  const nextSpeciesName = (await detail.getByRole('heading').first().innerText()).trim();
  assert.notEqual(nextSpeciesName, firstSpeciesName, 'next variant must update the detail in place');
  assert.equal(await detail.count(), 1, 'variant switching must keep the same detail surface open');

  await detail.getByRole('button', { name: '导出物种卡片' }).click();

  const exportDialog = page.locator('[role="dialog"][aria-labelledby="species-export-title"]:visible');
  await exportDialog.waitFor();
  const card = exportDialog.locator('[data-species-export-card]');
  const cardText = await card.innerText();
  assert.match(cardText, new RegExp(`基础|${nextSpeciesName}|喂养|环境`));
  assert.doesNotMatch(cardText, /当前鱼缸适配|混养风险|已种草|加入当前鱼缸/);

  const downloadPromise = page.waitForEvent('download');
  await exportDialog.getByRole('button', { name: '保存图片' }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /^AquaGuide-.*-物种卡片\.png$/);
  await exportDialog.getByText('卡片内容来自当前物种档案。').waitFor();

  const popupPromise = page.waitForEvent('popup');
  await exportDialog.getByRole('button', { name: '打印卡片' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await popup.locator('img').waitFor();

  const paperAnimation = await card.evaluate(node => getComputedStyle(node).animationName);
  assert.equal(paperAnimation, 'species-card-print');
  console.log('species detail extras verified: deduplicated variant switching, scoped export content, PNG download, and print preview');
} finally {
  await context.close();
  await browser.close();
}

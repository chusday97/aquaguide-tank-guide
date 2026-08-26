import { chromium } from 'playwright';
import sharp from 'sharp';
import { getPreviewUrl } from './preview-url.mjs';

const report = {
  snapshotVersion: 1,
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  health: { score: 86, status: '正常', reasons: ['换水记录稳定'], nextAction: '完成今日检查', missingData: [] },
  environment: { waterType: 'Freshwater', volumeLiters: 82, targetTemperatureC: 25, equipment: ['过滤：瀑布过滤'] },
  species: [{ catalogKey: 'guppy', name: '孔雀鱼', quantity: 6 }],
  weeklyCarePlan: [{ title: '观察水面', dayLabel: '07/29', status: 'pending' }],
  disclaimer: '仅根据用户记录生成，并非智能设备实时检测。',
};

const browser = await chromium.launch({ headless: true });
const baseUrl = getPreviewUrl();
for (const width of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/v1/public/share-reports/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: report, requestId: 'share-ui-test' }),
  }));
  await page.goto(`${baseUrl}/report/test-token`, { waitUntil: 'networkidle' });
  const body = await page.locator('body').innerText();
  if (!(body.includes('我的鱼缸报告') || body.includes('My aquarium report')) || !body.includes('孔雀鱼 × 6')) throw new Error(`report content missing at ${width}px`);
  if (body.includes('客厅缸') || body.includes('ownerId')) throw new Error(`private field visible at ${width}px`);
  const download = page.getByRole('button', { name: /下载脱敏报告|Download report/ });
  if (await download.count() !== 1) throw new Error(`download action missing at ${width}px`);
  await download.click();
  if (await page.getByRole('dialog').count() !== 1) throw new Error(`export preview missing at ${width}px`);
  if (width === 390) {
    const [file] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Save PNG|保存 PNG/ }).click(),
    ]);
    const metadata = await sharp(await file.path()).metadata();
    if (metadata.width !== 1080) throw new Error(`export width should be 1080px, received ${metadata.width}`);
  }
  if (errors.length) throw new Error(`page error at ${width}px: ${errors.join('; ')}`);
  await page.close();
}
await browser.close();
console.log('share report UI: ok');

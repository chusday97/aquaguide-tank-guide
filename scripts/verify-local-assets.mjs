import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'vite';

process.env.VITE_ADMIN_LOCAL_MODE = 'true';
const vite = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
await vite.listen();
const address = vite.httpServer?.address();
assert.ok(address && typeof address === 'object');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const businessKey = 'aquaguide-local-business-admin-v1';
const careSeoKey = 'aquaguide-local-care-seo-editorial-v1';
const png1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', 'base64');
const png2 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAQAAABFaP0WAAAADElEQVR42mNk+M8AAAICAQB7CYgAAAAASUVORK5CYII=', 'base64');
const unavailable = route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'cloud unavailable' }, requestId: 'local-asset-test' }) });
const resetLocal = async page => {
  await page.evaluate(async ([contentKey, seoKey]) => {
    localStorage.removeItem(contentKey);
    localStorage.removeItem(seoKey);
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('aquaguide-local-assets-v1');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  }, [businessKey, careSeoKey]);
  await page.reload({ waitUntil: 'networkidle' });
};

const publishedAsset = (page, method, key) => page.evaluate(async ([methodName, catalogKey]) => {
  const { contentAdminService } = await import('/src/services/admin/content-admin.service.ts');
  const detail = await contentAdminService[methodName](catalogKey);
  return detail?.assets?.[0] || null;
}, [method, key]);

try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.route('**/api/v1/admin/**', unavailable);
    await page.route('**/api/admin-content/**', unavailable);
    await page.goto(`${baseUrl}/admin/product-content?type=species&id=local-species-sp_0001`, { waitUntil: 'networkidle' });
    await resetLocal(page);
    assert.equal(await publishedAsset(page, 'getPublishedSpecies', 'sp_0001'), null);
    await page.locator('input[type=file]').setInputFiles({ name: 'species-v1.png', mimeType: 'image/png', buffer: png1 });
    await page.getByTestId('local-asset-preview').locator('img').waitFor();
    let state = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), businessKey);
    let species = state.species.find(item => item.catalogKey === 'sp_0001');
    const speciesV1 = species.speciesAssets.find(asset => asset.isCurrent);
    assert.equal(species.status, 'draft');
    assert.equal(speciesV1.assetVersion, 1);
    assert.equal(state.publishedSpeciesAssets.sp_0001, undefined);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('local-asset-preview').locator('img').waitFor();
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));
    let runtimeAsset = await publishedAsset(page, 'getPublishedSpecies', 'sp_0001');
    assert.equal(runtimeAsset.id, speciesV1.id);
    assert.match(runtimeAsset.url, /^blob:/);
    await page.locator('input[type=file]').setInputFiles({ name: 'species-v2.png', mimeType: 'image/png', buffer: png2 });
    await page.getByTestId('local-asset-preview').waitFor();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), businessKey);
    species = state.species.find(item => item.catalogKey === 'sp_0001');
    const speciesV2 = species.speciesAssets.find(asset => asset.isCurrent);
    assert.equal(speciesV2.assetVersion, 2);
    assert.equal(species.speciesAssets.find(asset => asset.id === speciesV1.id).isCurrent, false);
    assert.equal(state.publishedSpeciesAssets.sp_0001.find(asset => asset.isCurrent).id, speciesV1.id);
    runtimeAsset = await publishedAsset(page, 'getPublishedSpecies', 'sp_0001');
    assert.equal(runtimeAsset.id, speciesV1.id, 'Unpublished replacement must not mutate Product runtime asset.');

    const careKey = 'guide_new_fish_acclimation';
    await page.goto(`${baseUrl}/admin/product-content?type=care&id=local-care-${careKey}`, { waitUntil: 'networkidle' });
    await page.locator('input[type=file]').setInputFiles({ name: 'care-main.png', mimeType: 'image/png', buffer: png1 });
    await page.getByTestId('local-asset-preview').locator('img').waitFor();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), businessKey);
    const care = state.care.find(item => item.catalogKey === careKey);
    const careAsset = care.careArticleAssets.find(asset => asset.isCurrent);
    assert.equal(care.status, 'draft');
    assert.equal(careAsset.variant, 'article_main');
    assert.equal(state.publishedCareAssets[careKey], undefined);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('local-asset-preview').locator('img').waitFor();
    await page.getByRole('button', { name: '发布', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: '确认发布', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('form')?.textContent?.includes('已发布'));
    const careRuntimeAsset = await publishedAsset(page, 'getPublishedCareArticle', careKey);
    assert.equal(careRuntimeAsset.id, careAsset.id);
    assert.match(careRuntimeAsset.url, /^blob:/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow, 0, `Local asset editor must not overflow at ${viewport.width}px.`);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log('PASS local assets: Product/Care IndexedDB persistence, versioning, Draft isolation, Published runtime assets.');
} finally {
  await browser.close();
  await vite.close();
}

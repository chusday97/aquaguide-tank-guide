import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [390, 600, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
    await page.goto('http://localhost:3000/encyclopedia', { waitUntil: 'networkidle' });
    await page.getByText('今日推荐', { exact: true }).waitFor();
    const toolbar = page.locator('#atlas-toolbar');
    const discoveryCard = page.locator('section[aria-labelledby="atlas-daily-discovery-title"]');
    const [toolbarBox, cardBox] = await Promise.all([toolbar.boundingBox(), discoveryCard.boundingBox()]);
    assert.ok(toolbarBox && cardBox && cardBox.y >= toolbarBox.y + toolbarBox.height - 1, `daily discovery must render after the sticky toolbar at ${width}px`);
    const detailsButton = page.getByRole('button', { name: '查看物种详情' }).first();
    await detailsButton.scrollIntoViewIfNeeded();
    const detailsHitTarget = await detailsButton.evaluate(button => {
      const box = button.getBoundingClientRect();
      const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return target === button || button.contains(target);
    });
    assert.equal(detailsHitTarget, true, `sticky toolbar must not intercept discovery details at ${width}px`);
    await detailsButton.click();
    await page.waitForURL(/\/encyclopedia\?species=/);
    const firstSpeciesId = new URL(page.url()).searchParams.get('species');
    assert.ok(firstSpeciesId, 'daily discovery detail URL must identify the species');
    const detailSurface = page.locator('[data-surface="centered-dialog"], [data-surface="bottom-sheet"]');
    await detailSurface.waitFor({ state: 'visible' });
    assert.equal(await detailSurface.count(), 1, 'should reuse the encyclopedia species detail surface');
    await detailSurface.getByRole('button', { name: '知道了', exact: true }).click();
    await page.waitForURL(url => url.pathname === '/encyclopedia' && !url.searchParams.has('species'));
    await detailSurface.waitFor({ state: 'hidden' });

    if (width === 390) {
      const firstTitle = await page.locator('#atlas-daily-discovery-title').innerText();
      await page.getByRole('button', { name: '收藏物种', exact: true }).click();
      await page.waitForFunction(id => {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        return Array.isArray(state.wishlist) && state.wishlist.includes(id);
      }, firstSpeciesId);
      await page.waitForFunction(previous => document.querySelector('#atlas-daily-discovery-title')?.textContent?.trim() !== previous, firstTitle);

      const nextDetails = page.getByRole('button', { name: '查看物种详情' }).first();
      await nextDetails.click();
      await page.waitForURL(/\/encyclopedia\?species=/);
      const nextSpeciesId = new URL(page.url()).searchParams.get('species');
      assert.ok(nextSpeciesId && nextSpeciesId !== firstSpeciesId, 'saving a discovery must advance to another species');
      await detailSurface.getByRole('button', { name: '知道了', exact: true }).click();
      await page.waitForURL(url => url.pathname === '/encyclopedia' && !url.searchParams.has('species'));
      await detailSurface.waitFor({ state: 'hidden' });

      await page.evaluate(id => {
        const state = JSON.parse(localStorage.getItem('aquarium_app_state_v1') || '{}');
        state.wishlist = Array.from(new Set([...(state.wishlist || []), id]));
        localStorage.setItem('aquarium_app_state_v1', JSON.stringify(state));
        localStorage.setItem('wishlistFishIds', JSON.stringify(state.wishlist));
        window.dispatchEvent(new Event('focus'));
      }, nextSpeciesId);
      const savedAction = page.getByRole('button', { name: '查看已收藏物种', exact: true });
      await savedAction.waitFor();
      await savedAction.click();
      await page.waitForURL(/\/collection\/wishlist/);
      await page.locator(`#collection-wishlist-${firstSpeciesId}`).waitFor();
      assert.equal(await page.locator(`#collection-wishlist-${firstSpeciesId}`).count(), 1, 'saved discovery must be present in the wishlist page');
    }
    if (width === 1280) {
      await page.getByRole('button', { name: '新手好养', exact: true }).click();
      await discoveryCard.waitFor({ state: 'hidden' });
      assert.equal(await discoveryCard.count(), 0, 'daily discovery must not interrupt filtered result semantics');
    }
    assert.equal(pageErrors.length, 0);
    await page.close();
  }
  const directPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await directPage.addInitScript(() => localStorage.setItem('aquaguide_locale', 'zh-CN'));
  await directPage.goto('http://localhost:3000/encyclopedia?species=sp_0001&source=daily-discovery', { waitUntil: 'networkidle' });
  const directSurface = directPage.locator('[data-surface="centered-dialog"]');
  await directSurface.waitFor({ state: 'visible' });
  await directSurface.getByRole('button', { name: '知道了', exact: true }).click();
  await directPage.waitForURL(url => url.pathname === '/encyclopedia' && !url.searchParams.has('species'));
  assert.equal(new URL(directPage.url()).pathname, '/encyclopedia', 'direct discovery URL must close safely inside the encyclopedia');
  await directPage.close();
  console.log('daily discovery verified: sticky boundary, detail return, save advance and wishlist route');
} finally {
  await browser.close();
}

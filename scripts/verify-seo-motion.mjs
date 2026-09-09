import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', locale: 'zh-CN' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/species/sp_0001`, { waitUntil: 'networkidle' });
  const motion = await page.evaluate(() => ({
    heroAnimation: getComputedStyle(document.querySelector('.seo-hero__content')).animationName,
    revealCount: document.querySelectorAll('.seo-reveal').length,
    visibleRevealCount: document.querySelectorAll('.seo-reveal--visible').length,
  }));
  assert.equal(motion.heroAnimation, 'seo-hero-in');
  assert.ok(motion.revealCount > 0);
  assert.ok(motion.visibleRevealCount > 0);

  const faqTrigger = page.locator('.seo-disclosure__trigger').filter({ hasText: '极火虾属于淡水虾吗' }).first();
  await faqTrigger.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(420);
  assert.equal(await faqTrigger.getAttribute('aria-expanded'), 'true');
  const panelId = await faqTrigger.getAttribute('aria-controls');
  assert.ok(panelId);
  assert.equal(await page.locator(`#${panelId}`).getAttribute('aria-hidden'), 'false');

  await page.goto(`${baseUrl}/species/sp_0001?variant=sp_0030`, { waitUntil: 'networkidle' });
  assert.match(page.url(), /variant=sp_0030/);
  assert.equal(await page.locator('h1').first().textContent(), '黄金米虾');

  await context.close();

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', locale: 'zh-CN' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${baseUrl}/species/sp_0001`, { waitUntil: 'networkidle' });
  const reduced = await reducedPage.evaluate(() => {
    const hero = document.querySelector('.seo-hero__content');
    const section = document.querySelector('.seo-section');
    return {
      heroAnimation: hero ? getComputedStyle(hero).animationName : '',
      heroOpacity: hero ? getComputedStyle(hero).opacity : '',
      sectionOpacity: section ? getComputedStyle(section).opacity : '',
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  assert.equal(reduced.heroAnimation, 'none');
  assert.equal(reduced.heroOpacity, '1');
  assert.equal(reduced.sectionOpacity, '1');
  assert.equal(reduced.scrollBehavior, 'auto');
  await reducedContext.close();
  console.log('SEO motion 通过：Hero/章节进入、FAQ 键盘展开、品系 URL 状态和 reduced-motion 静态可读性正常。');
} finally {
  await browser.close();
}

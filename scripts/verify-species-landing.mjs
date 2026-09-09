import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const screenshotDir = process.env.SEO_SCREENSHOT_DIR;
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

const capture = async (page, name) => {
  if (screenshotDir) await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: true });
};

const openPage = async ({ width, locale = 'zh-CN' }) => {
  const context = await browser.newContext({ viewport: { width, height: 844 }, locale: locale === 'en' ? 'en-US' : 'zh-CN' });
  await context.addInitScript(language => localStorage.setItem('aquaguide_locale', language), locale);
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  return { context, page };
};

try {
  for (const width of [390, 600, 1440]) {
    const current = await openPage({ width });
    await current.page.goto(`${baseUrl}/species/sp_0001`, { waitUntil: 'networkidle' });
    const body = await current.page.locator('body').innerText();
    const bounds = await current.page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
      h1Top: document.querySelector('h1')?.getBoundingClientRect().top,
      mediaTop: document.querySelector('.seo-hero__media img, .seo-hero__media [role="img"]')?.getBoundingClientRect().top,
      dataRailColumns: getComputedStyle(document.querySelector('.seo-data-rail')).gridTemplateColumns.split(' ').length,
      interactiveSmall: [...document.querySelectorAll('button, a, select')]
        .filter(node => node.getBoundingClientRect().width > 0)
        .filter(node => node.getBoundingClientRect().width < 44 || node.getBoundingClientRect().height < 44).length,
    }));
    assert.equal(await current.page.locator('h1').first().textContent(), '极火虾');
    assert.match(body, /一眼了解/);
    assert.match(body, /把物种要求与你的真实鱼缸进行比较/);
    assert.doesNotMatch(body, /适合我的鱼缸吗？|正在读取鱼缸|草缸示例|结果/);
    assert.doesNotMatch(body, /Product Truth|Draft|Review|Override|Publish Gate|编辑内容/);
    assert.equal(bounds.documentWidth, bounds.viewportWidth);
    assert.equal(bounds.robots, 'noindex,follow');
    assert.equal(bounds.interactiveSmall, 0);
    assert.equal(bounds.dataRailColumns, width === 390 ? 2 : width === 600 ? 3 : 6);
    assert.equal(await current.page.locator('select').count(), 0);
    assert.equal(await current.page.locator('script[type="application/ld+json"]').count(), 0);
    assert.match(body, /底部叶屑等表面刮食生物膜/);
    assert.match(body, /常见问题/);
    assert.match(body, /University of Florida IFAS Extension/);
    assert.equal(await current.page.locator('#variants a').count(), 2);
    if (width === 390) assert.ok(bounds.h1Top < bounds.mediaTop, 'mobile identity should precede the visual frame');
    await capture(current.page, `sp_0001-${width}`);
    await current.context.close();
  }

  for (const width of [390, 600, 1440]) {
    const behavior = await openPage({ width });
    await behavior.page.goto(`${baseUrl}/species/sp_0432`, { waitUntil: 'networkidle' });
    const behaviorBody = await behavior.page.locator('body').innerText();
    assert.match(behaviorBody, /它如何生活/);
    assert.match(behaviorBody, /建议至少 5 条/);
    assert.match(behaviorBody, /中层/);
    assert.match(behaviorBody, /蠕虫/);
    assert.match(behaviorBody, /适合怎样的环境/);
    assert.doesNotMatch(behaviorBody, /混养分数|鱼缸加载/);
    assert.equal(await behavior.page.locator('#habitat').count(), 1);
    await behavior.context.close();
  }

  for (const width of [390, 600, 1440]) {
    const variant = await openPage({ width });
    await variant.page.goto(`${baseUrl}/species/sp_0001?variant=sp_0030`, { waitUntil: 'networkidle' });
    const variantBody = await variant.page.locator('body').innerText();
    assert.equal(await variant.page.locator('h1').first().textContent(), '黄金米虾');
    assert.match(variantBody, /极火虾/);
    assert.match(variantBody, /黄色选育型/);
    assert.match(await variant.page.locator('.seo-hero__content .seo-lead').textContent(), /黄色选育型/);
    assert.doesNotMatch(await variant.page.locator('.seo-hero__content .seo-lead').textContent(), /红色选育型/);
    const variantBreadcrumb = await variant.page.locator('nav[aria-label="面包屑"]').innerText();
    assert.match(variantBreadcrumb, /除藻生物/);
    assert.match(variantBreadcrumb, /极火虾/);
    assert.doesNotMatch(variantBreadcrumb, /Neocaridina davidi var\. Red/);
    assert.equal(await variant.page.locator('#variants a').count(), 2);
    assert.match(variantBody, /水底/);
    assert.match(variantBody, /生物膜/);
    await capture(variant.page, `sp_0030-variant-${width}`);
    await variant.context.close();
  }

  const english = await openPage({ width: 390, locale: 'en' });
  await english.page.goto(`${baseUrl}/species/sp_0001`, { waitUntil: 'networkidle' });
  const englishBody = await english.page.locator('body').innerText();
  assert.doesNotMatch(englishBody, /Product Truth|Draft|Review|Override|编辑内容|SEO 编辑/);
  assert.match(englishBody, /底部叶屑|黄色选育型|极火虾属于淡水虾吗/);
  assert.equal(await english.page.locator('html').getAttribute('lang'), 'zh-CN');
  assert.equal(await english.page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
  await english.context.close();

  console.log('Species Profile 通过：390/600/1440 无溢出，百科首屏与章节层级、行为证据、Base/Variant、后置工具入口、无鱼缸读取及 noindex 门禁正常。');
} finally {
  await browser.close();
}

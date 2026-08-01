import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });

const openSpecies = async ({ speciesId, locale, width }) => {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    locale: locale === 'en' ? 'en-US' : 'zh-CN',
    hasTouch: width < 500,
    isMobile: width < 500,
  });
  await context.addInitScript(language => {
    localStorage.setItem('aquaguide_locale', language);
    localStorage.setItem('aquarium_app_state_v1', JSON.stringify({
      version: 1,
      currentAquariumId: '',
      aquariums: [],
      wishlist: [],
      diagnosisRecords: [],
      deceasedRecords: [],
      onboarding: { version: 1, status: 'skipped', viewedSpecies: true, taskCardDismissed: false },
    }));
  }, locale);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${baseUrl}/encyclopedia?species=${speciesId}`, { waitUntil: 'networkidle' });
  const surface = page.locator('[data-surface="centered-dialog"], [data-surface="bottom-sheet"]');
  await surface.waitFor({ state: 'visible' });
  return { context, page, surface, pageErrors };
};

try {
  for (const locale of ['zh-CN', 'en']) {
    const current = await openSpecies({ speciesId: 'sp_0330', locale, width: 1280 });
    const text = await current.surface.innerText();
    assert.match(text, locale === 'en' ? /Reef Coral \/ Marine Ecosystem/ : /礁岩珊瑚 \/ 海水生态/);
    assert.match(text, /纽扣\/菇类珊瑚/);
    assert.doesNotMatch(text, /小型观赏鱼|Small Fish|群游搭配|Schooling Mix/);
    assert.equal(current.pageErrors.length, 0);
    await current.context.close();
  }

  const phone = await openSpecies({ speciesId: 'sp_0330', locale: 'zh-CN', width: 390 });
  assert.match(await phone.surface.innerText(), /纽扣\/菇类珊瑚/);
  assert.equal(await phone.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  assert.equal(phone.pageErrors.length, 0);
  await phone.context.close();

  const frogfish = await openSpecies({ speciesId: 'sp_0366', locale: 'zh-CN', width: 1280 });
  const frogfishText = await frogfish.surface.innerText();
  assert.match(frogfishText, /虾虎\/青蛙鱼/);
  assert.doesNotMatch(frogfishText, /蛙类/);
  assert.equal(frogfish.pageErrors.length, 0);
  await frogfish.context.close();

  console.log('taxonomy UI verified: coral roles, mobile category and frogfish classification');
} finally {
  await browser.close();
}

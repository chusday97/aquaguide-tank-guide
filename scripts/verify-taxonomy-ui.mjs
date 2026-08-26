import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { getPreviewUrl } from './preview-url.mjs';

const baseUrl = getPreviewUrl();
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
  await page.goto(`${baseUrl}/encyclopedia?mode=browse&species=${speciesId}`, { waitUntil: 'domcontentloaded' });
  const surface = page.locator('[data-detail-viewport="desktop-rail"], [data-detail-viewport="phone-sheet"]').last();
  await surface.waitFor({ state: 'visible' });
  return { context, page, surface, pageErrors };
};

try {
  for (const locale of ['zh-CN', 'en']) {
    const current = await openSpecies({ speciesId: 'sp_0330', locale, width: 1280 });
    const text = await current.surface.innerText();
    assert.match(text, locale === 'en' ? /Reef Coral \/ Marine Ecosystem/ : /礁岩珊瑚 \/ 海水生态/);
    assert.match(text, locale === 'en' ? /Zoanthids \/ Mushroom Corals/ : /纽扣\/菇类珊瑚/);
    assert.doesNotMatch(text, /小型观赏鱼|Small Fish|群游搭配|Schooling Mix/);
    assert.equal(current.pageErrors.length, 0);
    await current.context.close();
  }


  for (const [speciesId, expectedEnglish, forbiddenChinese] of [
    ['sp_0439', 'Barbs / Small Cyprinids', '鲃类/小型鲤科'],
    ['sp_0039', 'Loaches / Hillstream Loaches', '鳅类/吸鳅'],
    ['sp_0119', 'Arowanas / Ancient Fish', '龙鱼/古代鱼'],
  ]) {
    const englishSpecies = await openSpecies({ speciesId, locale: 'en', width: 1440 });
    const englishText = await englishSpecies.surface.innerText();
    assert.match(englishText, new RegExp(expectedEnglish.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(englishText, /Freshwater/);
    assert.equal(englishText.includes(forbiddenChinese), false, `${speciesId} must not expose canonical Chinese taxonomy in English UI`);
    assert.equal(englishSpecies.pageErrors.length, 0);
    await englishSpecies.context.close();
  }

  const phone = await openSpecies({ speciesId: 'sp_0330', locale: 'zh-CN', width: 390 });
  assert.match(await phone.surface.innerText(), /纽扣\/菇类珊瑚/);
  assert.equal(await phone.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false);
  assert.equal(phone.pageErrors.length, 0);
  await phone.context.close();

  const dianthusCoral = await openSpecies({ speciesId: 'sp_0335', locale: 'zh-CN', width: 1280 });
  const dianthusText = await dianthusCoral.surface.innerText();
  assert.match(dianthusText, /珊瑚|海水生态/);
  assert.doesNotMatch(dianthusText, /水草造景|环境植物|适合草缸/);
  assert.equal(dianthusCoral.pageErrors.length, 0);
  await dianthusCoral.context.close();

  for (const speciesId of ['sp_0366', 'sp_0406']) {
    const frogfish = await openSpecies({ speciesId, locale: 'zh-CN', width: 1280 });
    const frogfishText = await frogfish.surface.innerText();
    assert.match(frogfishText, /虾虎\/青蛙鱼/);
    assert.doesNotMatch(frogfishText, /蛙类/);
    assert.equal(frogfish.pageErrors.length, 0);
    await frogfish.context.close();
  }

  console.log('taxonomy UI verified: localized taxonomy, coral roles, source priority and frogfish classifications');
} finally {
  await browser.close();
}

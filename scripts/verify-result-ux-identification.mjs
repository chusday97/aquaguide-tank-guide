import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const fixture = resolve('public/responsive/care/pregnant_fish_breeder_box_realistic-960.webp');
const artifactDir = resolve('artifacts/result-ux-identification');
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'zh-CN',
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));

  await page.route('**/api/v1/ai/species-recognition', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          recognitionId: '11111111-1111-4111-8111-111111111111',
          imageFingerprint: 'a'.repeat(64),
          status: 'ambiguous',
          candidates: [
            {
              commonName: '极火虾',
              scientificName: 'Neocaridina davidi var. Red',
              confidenceBand: 'medium',
              visualEvidence: ['体色偏红，外形接近米虾类'],
              catalogKey: 'sp_0001',
              matchType: 'exact',
            },
            {
              commonName: '水晶虾',
              scientificName: 'Caridina cantonensis var.',
              confidenceBand: 'low',
              visualEvidence: ['体型接近小型观赏虾，但花纹证据不足'],
              catalogKey: 'sp_0002',
              matchType: 'exact',
            },
          ],
          requiresConfirmation: true,
          source: 'model',
          generatedAt: '2026-08-20T08:00:00.000Z',
        },
        requestId: 'result-ux-identification-fixture',
      }),
    });
  });

  await page.goto(`${baseUrl}/identify`, { waitUntil: 'networkidle' });
  await page.locator('input[type=file]').setInputFiles(fixture);

  const confirmButtons = page.locator('[data-identify-candidate-confirm]');
  await page.getByRole('button', { name: '确认是它' }).first().waitFor();

  const decision = page.locator('[data-testid="identify-decision"]');
  await decision.waitFor({ state: 'visible', timeout: 10_000 });

  assert.match(await decision.innerText(), /需要你确认|确认候选|确认/, 'candidate result must explicitly frame the model output as requiring user confirmation');
  assert.equal(await page.locator('[data-identify-candidate-options]').count(), 1, 'candidate choice set needs one stable container');
  assert.equal(await confirmButtons.count(), 2, 'ambiguous fixture must preserve both candidate choices instead of auto-selecting one');
  assert.equal(await page.locator('[data-identify-confirmed]').count(), 0, 'no candidate may be presented as confirmed before the user chooses it');
  assert.equal(await page.getByRole('heading', { name: '它现在有什么异常？' }).count(), 0, 'candidate review must remain separate from health triage');

  await page.screenshot({ path: resolve(artifactDir, 'candidates-before-confirm.png'), fullPage: true });
  await writeFile(resolve(artifactDir, 'decision-text.txt'), await decision.innerText(), 'utf8');

  await confirmButtons.first().click();
  const confirmedState = page.locator('[data-identify-confirmed="sp_0001"]');
  await confirmedState.waitFor();
  await confirmedState.getByRole('heading', { name: '极火虾' }).waitFor();
  assert.equal(await page.getByRole('heading', { name: '它现在有什么异常？' }).count(), 0, 'explicit species confirmation must still not auto-start health triage');
  assert.deepEqual(pageErrors, [], `identification Result UX emitted page errors: ${pageErrors.join(' | ')}`);

  await context.close();
  console.log('Identification Result UX passed: ambiguous model result → explicit needs-confirmation surface → two choices retained → explicit confirmation only → triage remains separate');
} finally {
  await browser.close();
}

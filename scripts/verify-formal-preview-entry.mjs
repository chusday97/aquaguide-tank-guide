import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4319';
const expectedBranch = process.env.VITE_PREVIEW_BRANCH || execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
const expectedSha = process.env.VITE_GIT_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const modules = {
  aquarium: {
    expected: /\/aquarium\?preview=interactive$/,
    selector: 'canvas',
  },
  encyclopedia: {
    expected: /\/encyclopedia\?mode=scene&preview=interactive$/,
    selector: '[data-scene-node]',
  },
  care: {
    expected: /\/care\?mode=scene&preview=interactive$/,
    selector: '.interactive-care-scene',
  },
  collection: {
    expected: /\/collection\?preview=interactive$/,
    selector: 'text=自然水族册',
  },
};

const browser = await chromium.launch({ headless: true });
try {
  for (const [module, contract] of Object.entries(modules)) {
    const context = await browser.newContext({ locale: 'zh-CN', viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const pageErrors = [];
    const failedRequests = [];
    const apiRequests = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => failedRequests.push(`${request.url()} · ${request.failure()?.errorText ?? 'failed'}`));
    page.on('request', request => {
      if (new URL(request.url()).pathname.startsWith('/api')) apiRequests.push(request.url());
    });

    await page.goto(`${baseUrl}/_preview/interactive?module=${module}`, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.locator('.aquaguide-app[data-layout-mode]').waitFor({ state: 'attached', timeout: 10_000 });
    await page.locator(contract.selector).first().waitFor({ state: 'attached', timeout: 10_000 });
    const metadata = await page.locator('[data-preview-metadata]').innerText();

    assert.match(page.url(), contract.expected, `${module} must land on its formal route`);
    assert.ok(metadata.includes(expectedBranch), `${module} metadata must expose the current preview branch`);
    assert.ok(metadata.includes(expectedSha), `${module} metadata must expose the current full build SHA`);
    assert.match(metadata, /seed:\s*interactive-preview/);
    assert.equal(apiRequests.length, 0, `${module} preview must not call the API`);
    assert.deepEqual(pageErrors, [], `${module} preview must not raise page errors`);
    assert.deepEqual(failedRequests, [], `${module} preview must not have failed resource requests`);
    await context.close();
  }
  console.log('formal preview entry: four modules route through the local formal shell with no API or resource failures');
} finally {
  await browser.close();
}

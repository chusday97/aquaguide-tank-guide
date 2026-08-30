import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const outputRoot = process.env.UI_FREEZE_OUTPUT ?? '/private/tmp/aquaguide-visual-matrix/ui-freeze-02457dd2';
const candidateSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const candidateBranch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
const targets = [
  { name: 'baseline', baseUrl: 'http://127.0.0.1:4317', branch: 'detached-visual-baseline', sha: '37a8d4d1' },
  { name: 'candidate', baseUrl: 'http://127.0.0.1:4319', branch: candidateBranch, sha: candidateSha }
];
const viewports = [390, 600, 768, 1024, 1280, 1440, 1920];
const modules = ['aquarium', 'encyclopedia', 'care', 'collection'];
const route = '/_preview/interactive';
await mkdir(outputRoot, { recursive: true });
const records = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const target of targets) {
    const targetModules = target.name === 'baseline' ? ['aquarium'] : modules;
    for (const module of targetModules) {
      for (const width of viewports) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
        try {
          const url = `${target.baseUrl}${route}?module=${module}`;
          const pageErrors = [];
          const failedRequests = [];
          page.on('pageerror', error => pageErrors.push(error.message));
          page.on('requestfailed', request => failedRequests.push(`${request.url()} · ${request.failure()?.errorText ?? 'failed'}`));
          const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
          await page.locator(target.name === 'candidate' ? '.aquaguide-app[data-layout-mode]' : '.interactive-tank-stage').first().waitFor({ state: 'attached', timeout: 8000 });
          await page.evaluate(async () => { await document.fonts?.ready; });
          await page.waitForFunction(() => {
            const canvas = document.querySelector('canvas');
            return !canvas || (canvas.clientWidth > 0 && canvas.clientHeight > 0);
          }, null, { timeout: 8000 });
          await page.waitForTimeout(1200);
          if (pageErrors.length || failedRequests.length) {
            throw new Error(`${target.name} ${width}px not ready: ${[...pageErrors, ...failedRequests].join(' | ')}`);
          }
          const filename = `${target.name}-${module}-${width}-preview_interactive.png`;
          await page.screenshot({ path: resolve(outputRoot, filename), fullPage: false, animations: 'disabled' });
          const bodyChars = (await page.locator('body').innerText().catch(() => '')).length;
          records.push({ target: target.name, branch: target.branch, sha: target.sha, module, width, route: `${route}?module=${module}`, status: response?.status() ?? null, bodyChars, screenshot: filename });
        } finally {
          await page.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}
await writeFile(resolve(outputRoot, 'manifest.json'), JSON.stringify({ schemaVersion: 1, capturedAt: new Date().toISOString(), route, viewports, targets, records }, null, 2) + '\n');
console.log(`Captured ${records.length} UI freeze screenshots to ${outputRoot}`);

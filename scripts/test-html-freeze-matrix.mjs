import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const baseUrl = process.env.HTML_FREEZE_URL || 'http://127.0.0.1:4198';
const outputDir = process.env.HTML_FREEZE_OUTPUT || '/private/tmp/aquaguide-html-freeze-v3/matrix';
const executablePath = process.env.CHROME_EXECUTABLE || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : null);
const viewports = [390, 600, 1024, 1440, 1920];
const pages = [
  ['aquarium', 'pages/aquarium.html'],
  ['collection', 'pages/collection.html'],
  ['encyclopedia', 'pages/encyclopedia.html'],
  ['care', 'pages/care.html'],
  ['compatibility', 'pages/compatibility.html'],
];

mkdirSync(outputDir, { recursive: true });
let browser;
try {
  browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
} catch (error) {
  const report = { schemaVersion: 1, baseUrl, executablePath, viewports, pages: pages.map(([name]) => name), status: 'BROWSER_UNAVAILABLE', error: String(error?.message || error) };
  writeFileSync(join(outputDir, 'matrix-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.error('HTML freeze matrix unavailable:', report.error.split('\n')[0]);
  process.exit(2);
}
const records = [];

for (const [name, path] of pages) {
  for (const width of viewports) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const failures = [];
    page.on('requestfailed', (request) => failures.push(request.url()));
    await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => {
      const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect().toJSON() || null;
      const visible = (selector) => {
        const node = document.querySelector(selector);
        return Boolean(node && !node.hidden && getComputedStyle(node).display !== 'none');
      };
      const h1s = document.querySelectorAll('h1').length;
      const header = rect('header');
      const media = rect('[data-ui-block$="stage"], .aquarium-stage, .collection-ecosystem, .result-grid');
      const overlap = header && media ? Math.max(0, Math.min(header.right, media.right) - Math.max(header.left, media.left)) * Math.max(0, Math.min(header.bottom, media.bottom) - Math.max(header.top, media.top)) : 0;
      return {
        h1s,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        header,
        media,
        headerMediaOverlap: overlap,
        surfaceCount: [...document.querySelectorAll('[data-surface]')].filter((node) => !node.hidden && getComputedStyle(node).display !== 'none').length,
      };
    });
    await page.screenshot({ path: join(outputDir, `${name}-${width}.png`), fullPage: true });
    records.push({ page: name, viewport: width, ...result, requestFailures: failures });
    await page.close();
  }
}

await browser.close();
const failures = records.filter((record) => record.h1s !== 1 || record.scrollWidth > record.clientWidth + 1 || record.headerMediaOverlap > 0 || record.requestFailures.length);
const report = { schemaVersion: 1, baseUrl, executablePath, viewports, pages: pages.map(([name]) => name), records, status: failures.length ? 'FAIL' : 'PASS', failures };
writeFileSync(join(outputDir, 'matrix-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, records: records.length, failures: failures.length, outputDir }, null, 2));
if (failures.length) process.exitCode = 1;

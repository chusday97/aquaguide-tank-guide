import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from 'playwright';
import sharp from 'sharp';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const goldenDir = path.resolve('evaluation/visual/golden-v1');
const manifestPath = path.join(goldenDir, 'manifest.json');
const outputDir = path.resolve('artifacts/uiux-golden-diff');
fs.mkdirSync(outputDir, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const cases = manifest.cases ?? [];
const routeOrder = manifest.capture?.routeOrder ?? [];
const grayThreshold = manifest.capture?.channelThreshold ?? 24;
const targetWidth = manifest.capture?.thumbnailWidth ?? 128;

if (!Array.isArray(cases) || cases.length === 0) {
  throw new Error('Golden manifest must contain at least one case.');
}

const viewportKey = ({ width, height }) => `${width}x${height}`;
const casesByViewport = new Map();
for (const visualCase of cases) {
  const key = viewportKey(visualCase.viewport);
  if (!casesByViewport.has(key)) casesByViewport.set(key, []);
  casesByViewport.get(key).push(visualCase);
}

const applyFixedMasks = (rgba, width, height, masks = []) => {
  for (const mask of masks) {
    const startX = Math.max(0, Math.floor(mask.x));
    const startY = Math.max(0, Math.floor(mask.y));
    const endX = Math.min(width, Math.ceil(mask.x + mask.width));
    const endY = Math.min(height, Math.ceil(mask.y + mask.height));
    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        const offset = (y * width + x) * 4;
        rgba[offset] = 128;
        rgba[offset + 1] = 128;
        rgba[offset + 2] = 128;
        rgba[offset + 3] = 255;
      }
    }
  }
};

const buildGrayThumbnail = async (pngBuffer, visualCase) => {
  const decoded = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = decoded.info;
  if (channels !== 4) throw new Error(`${visualCase.id}: expected RGBA screenshot, received ${channels} channels`);

  const expected = visualCase.reference;
  if (width !== expected.sourceWidth || height !== expected.sourceHeight) {
    throw new Error(
      `${visualCase.id}: dimension mismatch, expected ${expected.sourceWidth}x${expected.sourceHeight}, received ${width}x${height}`,
    );
  }

  const rgba = Buffer.from(decoded.data);
  applyFixedMasks(rgba, width, height, visualCase.masks);

  // The approved manifest is the normalization contract. Do not re-derive thumbHeight
  // here: Python round() and JS Math.round() disagree at exact .5 values (for example
  // 900 * 128 / 1024 = 112.5). Keeping the manifest authoritative makes the reference
  // portable across the language used to generate or verify it.
  const thumbWidth = expected.thumbWidth;
  const thumbHeight = expected.thumbHeight;
  if (thumbWidth !== targetWidth || !Number.isInteger(thumbHeight) || thumbHeight <= 0) {
    throw new Error(
      `${visualCase.id}: invalid thumbnail contract ${thumbWidth}x${thumbHeight}; expected width ${targetWidth} and positive integer height`,
    );
  }

  const gray = Buffer.alloc(thumbWidth * thumbHeight);
  for (let targetY = 0; targetY < thumbHeight; targetY += 1) {
    const sourceY = Math.floor((targetY * height) / thumbHeight);
    for (let targetX = 0; targetX < thumbWidth; targetX += 1) {
      const sourceX = Math.floor((targetX * width) / thumbWidth);
      const sourceOffset = (sourceY * width + sourceX) * 4;
      const r = rgba[sourceOffset];
      const g = rgba[sourceOffset + 1];
      const b = rgba[sourceOffset + 2];
      gray[targetY * thumbWidth + targetX] = (77 * r + 150 * g + 29 * b) >> 8;
    }
  }

  return { gray, width: thumbWidth, height: thumbHeight };
};

const writeGrayPng = async (data, width, height, filename) => {
  await sharp(data, { raw: { width, height, channels: 1 } })
    .resize({ width: Math.min(512, width * 4), kernel: 'nearest' })
    .png()
    .toFile(path.join(outputDir, filename));
};

const compareCase = async (currentPng, visualCase) => {
  const current = await buildGrayThumbnail(currentPng, visualCase);
  const signaturePath = path.join(goldenDir, visualCase.reference.signatureFile);
  const reference = zlib.inflateSync(Buffer.from(fs.readFileSync(signaturePath, 'utf8').trim(), 'base64'));
  const expectedLength = current.width * current.height;
  if (reference.length !== expectedLength) {
    throw new Error(`${visualCase.id}: reference payload length ${reference.length} != ${expectedLength}`);
  }

  let changedPixels = 0;
  let totalDelta = 0;
  let maxObservedDelta = 0;
  const diff = Buffer.alloc(expectedLength);

  for (let i = 0; i < expectedLength; i += 1) {
    const delta = Math.abs(reference[i] - current.gray[i]);
    diff[i] = delta;
    totalDelta += delta;
    maxObservedDelta = Math.max(maxObservedDelta, delta);
    if (delta > grayThreshold) changedPixels += 1;
  }

  const diffRatio = changedPixels / expectedLength;
  const passed = diffRatio <= visualCase.maxDiffRatio;

  await Promise.all([
    writeGrayPng(reference, current.width, current.height, `${visualCase.id}__reference-thumb.png`),
    writeGrayPng(current.gray, current.width, current.height, `${visualCase.id}__current-thumb.png`),
    writeGrayPng(diff, current.width, current.height, `${visualCase.id}__diff-thumb.png`),
  ]);

  return {
    passed,
    changedPixels,
    pixelCount: expectedLength,
    diffRatio,
    diffPercent: Number((diffRatio * 100).toFixed(4)),
    maxDiffRatio: visualCase.maxDiffRatio,
    maxDiffPercent: Number((visualCase.maxDiffRatio * 100).toFixed(4)),
    grayThreshold,
    meanDelta: Number((totalDelta / expectedLength).toFixed(4)),
    maxObservedDelta,
    thumbWidth: current.width,
    thumbHeight: current.height,
  };
};

const browser = await chromium.launch({ headless: true });
const reports = [];

try {
  for (const [key, viewportCases] of casesByViewport) {
    const viewport = viewportCases[0].viewport;
    const context = await browser.newContext({
      viewport,
      locale: manifest.capture?.locale || 'zh-CN',
      hasTouch: viewport.width < 768,
      isMobile: viewport.width < 768,
    });
    await context.addInitScript(() => {
      localStorage.setItem('aquaguide_locale', 'zh-CN');
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    page.setDefaultNavigationTimeout(25_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    if (manifest.capture?.seedFirstAquarium) {
      await page.goto(`${baseUrl}/welcome`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: /建立第一个鱼缸/ }).click();
      await page.locator('[data-aquarium-dashboard-v2]').waitFor();
      await page.waitForTimeout(1200);
    }

    for (const route of routeOrder) {
      const routeCases = viewportCases.filter((visualCase) => visualCase.route === route);
      const currentIndex = routeOrder.indexOf(route);
      const mustVisit = routeCases.length > 0 || viewportCases.some((visualCase) => {
        const targetIndex = routeOrder.indexOf(visualCase.route);
        return targetIndex > currentIndex;
      });
      if (!mustVisit) continue;

      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      if (route === '/aquarium') {
        await page.locator('[data-aquarium-dashboard-v2]').waitFor();
      }
      await page.waitForTimeout(route === '/aquarium' ? 1400 : 700);
      await page.evaluate(async () => {
        if ('fonts' in document) await document.fonts.ready;
        window.scrollTo(0, 0);
      });

      for (const visualCase of routeCases) {
        const cjkFontReady = await page.evaluate(() => (
          document.fonts?.check('16px "Noto Sans CJK SC"', '鱼缸养护') ?? false
        ));
        if (!cjkFontReady) {
          reports.push({ id: visualCase.id, passed: false, error: 'CJK snapshot font unavailable' });
          continue;
        }

        const currentPath = path.join(outputDir, `${visualCase.id}__current.png`);
        await page.screenshot({
          path: currentPath,
          fullPage: false,
          animations: 'disabled',
        });

        try {
          const comparison = await compareCase(fs.readFileSync(currentPath), visualCase);
          reports.push({
            id: visualCase.id,
            route: visualCase.route,
            viewport: visualCase.viewport,
            masks: visualCase.masks,
            viewportKey: key,
            ...comparison,
          });
        } catch (error) {
          reports.push({
            id: visualCase.id,
            route: visualCase.route,
            viewport: visualCase.viewport,
            passed: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const failed = reports.filter((report) => !report.passed);
const payload = {
  goldenVersion: manifest.version,
  source: manifest.source,
  generatedAt: new Date().toISOString(),
  total: reports.length,
  passed: reports.length - failed.length,
  failed: failed.length,
  cases: reports,
};
fs.writeFileSync(path.join(outputDir, 'report.json'), `${JSON.stringify(payload, null, 2)}\n`);

console.log('Golden visual signature cohort:');
for (const report of reports) {
  if (report.error) {
    console.log(`- ${report.id}: FAIL — ${report.error}`);
  } else {
    console.log(
      `- ${report.id}: ${report.passed ? 'PASS' : 'FAIL'} — ${report.diffPercent}% changed (limit ${report.maxDiffPercent}%, gray threshold ${grayThreshold})`,
    );
  }
}

if (failed.length > 0) {
  throw new Error(`${failed.length}/${reports.length} golden cases exceeded the approved tolerance.`);
}

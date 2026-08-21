import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const fail = message => { throw new Error(message); };

const main = await read('src/main.tsx');
const adaptive = await read('src/components/common/AdaptiveDetailContent.tsx');
const layoutProvider = await read('src/components/layout/LayoutModeProvider.tsx');
const layoutContract = await read('lib/layout-mode.ts');
const dialog = await read('components/ui/dialog.tsx');
const splitStatic = await read('scripts/verify-split-workspace-detail.mjs');
const splitRuntime = await read('scripts/verify-split-workspace-runtime.mjs');
const styles = await readdir(new URL('src/styles/', root));

const allowedVersionedLayoutFiles = new Set([
  'aquarium-stage-layout-v4.css',
  'immersive-detail-layout-v5.css',
]);

const versionedLayoutFiles = styles.filter(name => /(?:layout|surface).*v\d+\.css$/i.test(name));
for (const name of versionedLayoutFiles) {
  if (!allowedVersionedLayoutFiles.has(name)) {
    fail(`Do not add another versioned layout override (${name}). Refactor the canonical owner instead.`);
  }
}

for (const name of allowedVersionedLayoutFiles) {
  const importPath = `./styles/${name}`;
  const count = main.split(importPath).length - 1;
  if (count !== 1) fail(`${importPath} must be imported exactly once from src/main.tsx.`);
}

const stalePhrases = [
  'must participate in page layout',
  'actual two-pane geometry',
  'grid-template-columns: minmax(0, 54fr) minmax(0, 46fr)',
];
for (const phrase of stalePhrases) {
  if (splitStatic.includes(phrase) || splitRuntime.includes(phrase)) {
    fail(`Stale split-workspace contract reintroduced: ${phrase}`);
  }
}

if (!adaptive.includes('persistent-browse-rail')) fail('Desktop detail must retain persistent-browse-rail semantics.');
if (!adaptive.includes('data-detail-viewport')) fail('Adaptive detail must expose viewport semantics for regression tests.');
if (adaptive.includes('data-surface="split-workspace-detail"')) fail('Legacy split-workspace detail surface must not return.');

if (!layoutContract.includes("PHONE_LAYOUT_BREAKPOINT_PX = 768")) fail('Shared responsive contract must own the 768px phone/desktop boundary.');
if (!layoutProvider.includes("@/lib/layout-mode")) fail('LayoutModeProvider must consume the shared responsive contract.');
if (!dialog.includes("@/lib/layout-mode")) fail('Dialog must consume the shared responsive contract.');
if (/userAgentData|iPhone|iPad|Android\.\+Mobile|Mobile\.\+Safari/.test(layoutProvider)) fail('Product layout must not regress to UA/device inference.');
if (dialog.includes('(max-width: 767px)')) fail('Dialog must not duplicate the phone breakpoint literal.');
if (!dialog.includes('max-h-[88dvh]') || !dialog.includes('return "task"')) fail('Aquarium smart recommendation must remain classified as Task while legacy inference exists.');

console.log('ui regression governance contract: PASS');

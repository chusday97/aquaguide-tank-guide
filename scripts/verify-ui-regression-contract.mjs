import { readFile, readdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const fail = message => { throw new Error(message); };

const main = await read('src/main.tsx');
const adaptive = await read('src/components/common/AdaptiveDetailContent.tsx');
const layoutProvider = await read('src/components/layout/LayoutModeProvider.tsx');
const layoutContract = await read('lib/layout-mode.ts');
const dialog = await read('components/ui/dialog.tsx');
const aquarium = await read('src/pages/Aquarium.tsx');
const collectionHub = await read('src/pages/CollectionHub.tsx');
const indexCss = await read('src/index.css');
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
if (dialog.includes("Aquarium's legacy smart-recommendation workflow")) fail('Aquarium visual-signature surface inference must not return; its dialogs are explicit.');

const aquariumDialogTags = [...aquarium.matchAll(/<DialogContent\b([^>]*)>/g)];
for (const match of aquariumDialogTags) {
  if (!/\bsurface=/.test(match[1])) {
    fail(`Aquarium DialogContent must declare an explicit surface: ${match[0].slice(0, 140)}`);
  }
}
if (aquarium.includes('<Dialog open={false}')) fail('Disabled legacy Aquarium dialogs must be deleted, not kept as dead modal code.');

if (!collectionHub.includes('data-node-visual="creature"')) fail('Collection desktop navigation must remain creature-first, not card-first.');
if (!collectionHub.includes('data-collection-node={module}')) fail('Collection creature nodes must expose stable runtime hooks.');
if (indexCss.includes('.collection-book-')) fail('Retired Collection book-layout CSS must not return.');

const aquariumSurfaceContract = [
  ['<Dialog open={Boolean(pendingReminderReschedule)}', 'task'],
  ['<Dialog open={Boolean(pendingReminderDelete)}', 'blocking'],
  ['<Dialog open={!!pendingDeleteAquariumId}', 'blocking'],
  ['<Dialog open={isLocalDataOpen}', 'task'],
  ['<Dialog open={isTankPreviewOpen}', 'media'],
  ['<Dialog open={isDiagnosisExitConfirmOpen}', 'blocking'],
  ['<Dialog open={Boolean(selectedDailyCheckArticle)}', 'detail'],
  ['<Dialog open={isRiskReminderOpen}', 'task'],
  ['<Dialog open={isObservationOpen}', 'task'],
  ['<Dialog open={isSmartRecommendOpen}', 'task'],
  ['<Dialog open={isCalendarOpen}', 'task'],
  ['<Dialog open={isGuideOpen}', 'detail'],
  ['<Dialog open={Boolean(shareUrl)}', 'task'],
  ['<Dialog open={isConflictDialogOpen}', 'task'],
];
for (const [openMarker, expectedSurface] of aquariumSurfaceContract) {
  const markerIndex = aquarium.indexOf(openMarker);
  if (markerIndex < 0) fail(`Aquarium surface contract marker missing: ${openMarker}`);
  const nearby = aquarium.slice(markerIndex, markerIndex + 900);
  if (!nearby.includes(`surface="${expectedSurface}"`)) {
    fail(`Aquarium ${openMarker} must remain surface="${expectedSurface}".`);
  }
}

const modalCardBlocks = [...indexCss.matchAll(/\.modalCard(?:\.[\w-]+)?\s*\{([^}]*)\}/g)];
for (const [, body] of modalCardBlocks) {
  if (/(?:^|\s)(?:width|max-width|max-height|border-radius)\s*:/.test(body)) {
    fail('Global .modalCard must remain visual-only; geometry belongs to explicit Dialog surfaces.');
  }
}

console.log('ui regression governance contract: PASS');


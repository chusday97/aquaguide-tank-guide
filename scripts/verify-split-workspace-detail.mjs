import { readFile } from 'node:fs/promises';

const files = {
  dialog: await readFile(new URL('../components/ui/dialog.tsx', import.meta.url), 'utf8'),
  adaptive: await readFile(new URL('../src/components/common/AdaptiveDetailContent.tsx', import.meta.url), 'utf8'),
  species: await readFile(new URL('../src/components/SpeciesDetailDialog.tsx', import.meta.url), 'utf8'),
  atlas: await readFile(new URL('../src/pages/Encyclopedia.tsx', import.meta.url), 'utf8'),
  care: await readFile(new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url), 'utf8'),
  detailStyles: await readFile(new URL('../src/styles/immersive-detail-layout-v5.css', import.meta.url), 'utf8'),
  three: await readFile(new URL('../src/components/ThreeAquarium.tsx', import.meta.url), 'utf8'),
};

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

expect(files.adaptive.includes('surface="detail"'), 'AdaptiveDetailContent must use the shared detail surface.');
expect(files.adaptive.includes('data-detail-viewport={isPhoneLayout ? \'phone-sheet\' : \'desktop-rail\'}'), 'Detail must resolve to desktop rail / phone sheet by layout mode.');
expect(files.adaptive.includes('persistent-browse-rail'), 'Desktop browsing detail must stay open while the background remains browsable.');
expect(files.adaptive.includes('withOverlay={isPhoneLayout}'), 'Desktop detail must be non-blocking while mobile detail keeps a sheet backdrop.');
expect(files.adaptive.includes('right-0 top-0 h-[100dvh]'), 'Desktop detail rail must attach to the right edge and fill viewport height.');
expect(files.dialog.includes('disablePointerDismissal'), 'Shared Dialog must support persistent non-modal rails.');
expect(files.detailStyles.includes('[data-detail-viewport="desktop-rail"]'), 'Detail stylesheet must own the desktop rail contract.');
expect(!files.adaptive.includes('data-surface="split-workspace-detail"'), 'AdaptiveDetailContent must not regress to the legacy inline split-workspace surface.');
expect(!files.detailStyles.includes('grid-template-columns: minmax(0, 54fr) minmax(0, 46fr)'), 'Canonical detail stylesheet must not restore the legacy 54/46 page split.');
expect(files.atlas.includes('desktopSurface="workspace"'), 'Atlas may request workspace browsing semantics, which AdaptiveDetailContent resolves to a persistent rail.');
expect(files.care.includes('workspace={!isPhoneLayout}'), 'Care desktop browsing detail must request the shared detail rail.');
expect(files.three.includes("framing?: 'contain' | 'stage-cover'"), 'ThreeAquarium must expose framing.');

console.log('persistent detail rail contract: PASS');

import { readFile } from 'node:fs/promises';

const files = {
  dialog: await readFile(new URL('../components/ui/dialog.tsx', import.meta.url), 'utf8'),
  adaptive: await readFile(new URL('../src/components/common/AdaptiveDetailContent.tsx', import.meta.url), 'utf8'),
  species: await readFile(new URL('../src/components/SpeciesDetailDialog.tsx', import.meta.url), 'utf8'),
  atlas: await readFile(new URL('../src/pages/Encyclopedia.tsx', import.meta.url), 'utf8'),
  care: await readFile(new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url), 'utf8'),
  styles: await readFile(new URL('../src/index.css', import.meta.url), 'utf8'),
  three: await readFile(new URL('../src/components/ThreeAquarium.tsx', import.meta.url), 'utf8'),
};

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

expect(!files.dialog.includes('portal = true'), 'DialogContent must keep Base UI popups inside their Portal context.');
expect(files.adaptive.includes('data-surface="split-workspace-detail"'), 'Workspace details must render as an inline page region.');
expect(files.adaptive.includes('workspaceOpen'), 'Workspace details must be mounted only while their page detail is open.');
expect(files.species.includes("desktopSurface === 'workspace'"), 'Species detail must have a desktop workspace mode.');
expect(files.atlas.includes('desktopSurface="workspace"'), 'Atlas must request the species workspace surface.');
expect(files.care.includes('workspace={!isPhoneLayout}'), 'Care detail must use a workspace surface on desktop.');
expect(files.styles.includes('.care-workspace-shell:has(> [data-surface="split-workspace-detail"])'), 'Care workspace must reflow from its actual page shell.');
expect(files.styles.includes('grid-template-columns: minmax(0, 54fr) minmax(0, 46fr)'), 'Species workspace must allocate actual two-pane geometry.');
expect(files.three.includes("framing?: 'contain' | 'stage-cover'"), 'ThreeAquarium must expose framing.');

console.log('split workspace detail contract: PASS');

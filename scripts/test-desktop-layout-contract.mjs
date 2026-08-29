import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile('src/index.css', 'utf8');
const preview = await readFile('src/pages/InteractivePreview.tsx', 'utf8');
const care = await readFile('src/pages/CareEncyclopedia.tsx', 'utf8');
const encyclopedia = await readFile('src/pages/Encyclopedia.tsx', 'utf8');

for (const layout of ['workspace--immersive', 'workspace--content', 'workspace--standalone']) {
  assert.match(css, new RegExp(`\\.${layout}\\b`), `${layout} token must exist`);
}
assert.match(css, /container:\s*desktop-canvas\s*\/\s*inline-size/, 'desktop layout must respond to the available canvas width');
assert.match(css, /care-workspace-shell--scene/, 'care scene must have an explicit single-column mode');
assert.match(css, /care-workspace-shell:not\(\.care-workspace-shell--scene\)/, 'care browse grid must be excluded from scene mode');
assert.match(preview, /useSearchParams/, 'preview module state must be URL-addressable');
for (const module of ['aquarium', 'encyclopedia', 'care', 'collection']) {
  assert.match(preview, new RegExp(module), `preview must expose ${module} module`);
}
assert.equal((preview.match(/<SpeciesSceneAtlas/g) || []).length, 1, 'preview must render one module at a time');
assert.equal((preview.match(/<KnowledgeSceneExplorer/g) || []).length, 1, 'preview must render one care module at a time');
assert.match(care, /data-workspace-layout=/, 'care page must declare its workspace layout');
assert.match(encyclopedia, /data-workspace-layout=/, 'encyclopedia page must declare its workspace layout');

console.log('desktop layout contract: PASS');

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [indexCss, typography, foundation, surfaceHeader, sectionHeader] = await Promise.all([
  read('src/index.css'),
  read('src/styles/typography-system.css'),
  read('src/styles/ui-v2-foundation.css'),
  read('src/components/common/SurfaceHeader.tsx'),
  read('src/components/product/SectionHeader.tsx'),
]);

assert.ok(indexCss.includes('@import "./styles/typography-system.css";'), 'global stylesheet must import semantic typography roles');
for (const token of ['--type-display-size', '--type-section-size', '--type-body-size', '--type-meta-size', '--ui-space-1', '--ui-radius-card', '--ui-shadow-card']) {
  assert.ok(foundation.includes(token), `UI V2 foundation must own canonical token ${token}`);
}
assert.equal(typography.includes('--type-display-size:'), false, 'semantic typography layer must not redefine canonical display token');
assert.equal(typography.includes('--type-section-size:'), false, 'semantic typography layer must not redefine canonical section token');
assert.equal(typography.includes('--type-body-size:'), false, 'semantic typography layer must not redefine canonical body token');
assert.equal(typography.includes('--type-meta-size:'), false, 'semantic typography layer must not redefine canonical meta token');
assert.equal(typography.includes('.aquaguide-app .font-black'), false, 'typography migration must not globally rewrite every font-black utility');
assert.equal(typography.includes('.aquaguide-app .font-bold'), false, 'typography migration must not globally rewrite every font-bold utility');
for (const role of ['type-page-title', 'type-section-title', 'type-card-title', 'type-body', 'type-meta', 'type-action']) {
  assert.ok(typography.includes(`.${role}`), `semantic typography role ${role} must exist`);
}
assert.ok(surfaceHeader.includes('type-card-title'), 'surface titles must use semantic typography');
assert.ok(surfaceHeader.includes('type-meta'), 'surface descriptions must use semantic typography');
assert.ok(sectionHeader.includes('type-card-title'), 'section title must use semantic typography');
assert.ok(sectionHeader.includes('type-meta'), 'section subtitle must use semantic typography');

const aquariumHeadingRule = foundation.slice(foundation.indexOf('.aquarium-zone-header h2'), foundation.indexOf('.aquarium-workspace-zone'));
assert.ok(aquariumHeadingRule.includes('font-size: var(--type-section-size)'), 'Aquarium zone headings must resolve the canonical section-size token through the V2 foundation');
assert.ok(aquariumHeadingRule.includes('font-weight: var(--type-title-weight)'), 'Aquarium zone headings must resolve the canonical title-weight token through the V2 foundation');
assert.ok(foundation.includes('.aquarium-zone-header .type-meta'), 'Aquarium zone subtitles must continue to use the semantic meta role');

console.log('UI typography system verified: ui-v2-foundation owns tokens and both semantic components and Aquarium container-aware headings consume them.');

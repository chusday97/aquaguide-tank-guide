import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

const [indexCss, typography, surfaceHeader, sectionHeader, aquarium] = await Promise.all([
  read('src/index.css'),
  read('src/styles/typography-system.css'),
  read('src/components/common/SurfaceHeader.tsx'),
  read('src/components/product/SectionHeader.tsx'),
  read('src/pages/Aquarium.tsx'),
]);

assert.ok(indexCss.includes('@import "./styles/typography-system.css";'), 'global stylesheet must import the typography baseline');
assert.ok(typography.includes('--type-display-size'), 'typography baseline must define display size');
assert.ok(typography.includes('--type-section-size'), 'typography baseline must define section size');
assert.ok(typography.includes('--type-body-size'), 'typography baseline must define body size');
assert.ok(typography.includes('--type-meta-size'), 'typography baseline must define meta size');
assert.ok(typography.includes('.aquaguide-app .font-black'), 'legacy heavy weights must be normalized globally');
assert.ok(typography.includes('.text-\\[10px\\]'), 'legacy micro sizes must be normalized');
assert.ok(typography.includes('.text-\\[13px\\]'), 'legacy body arbitrary sizes must be normalized');
assert.ok(surfaceHeader.includes('type-card-title'), 'surface titles must use semantic typography');
assert.ok(surfaceHeader.includes('type-meta'), 'surface descriptions must use semantic typography');
assert.equal(surfaceHeader.includes('text-[15px] font-black'), false, 'surface title must not regress to arbitrary 15px black');
assert.ok(sectionHeader.includes('type-card-title'), 'section title must use semantic typography');
assert.ok(sectionHeader.includes('type-meta'), 'section subtitle must use semantic typography');
assert.ok(aquarium.includes('type-card-title'), 'aquarium zone title must use the shared card-title hierarchy');
assert.ok(aquarium.includes('type-meta'), 'aquarium zone subtitle must use the shared meta hierarchy');

console.log('Typography system verified: shared hierarchy, normalized legacy sizes, and reduced weight noise.');

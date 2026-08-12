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

assert.ok(indexCss.includes('@import "./styles/typography-system.css";'), 'global stylesheet must import the typography foundation');
assert.ok(typography.includes('--type-display-size'), 'typography foundation must define display size');
assert.ok(typography.includes('--type-section-size'), 'typography foundation must define section size');
assert.ok(typography.includes('--type-body-size'), 'typography foundation must define body size');
assert.ok(typography.includes('--type-meta-size'), 'typography foundation must define meta size');
assert.equal(typography.includes('.aquaguide-app .font-black'), false, 'typography migration must not globally rewrite every font-black utility');
assert.equal(typography.includes('.aquaguide-app .font-bold'), false, 'typography migration must not globally rewrite every font-bold utility');
assert.equal(typography.includes('.text-\\[10px\\]'), false, 'typography migration must not silently remap arbitrary legacy sizes globally');
assert.equal(typography.includes('.text-\\[13px\\]'), false, 'legacy sizes must migrate component-by-component instead of global CSS coercion');
assert.ok(typography.includes('.type-page-title'), 'semantic page title utility must exist');
assert.ok(typography.includes('.type-section-title'), 'semantic section title utility must exist');
assert.ok(typography.includes('.type-card-title'), 'semantic card title utility must exist');
assert.ok(typography.includes('.type-body'), 'semantic body utility must exist');
assert.ok(typography.includes('.type-meta'), 'semantic meta utility must exist');
assert.ok(typography.includes('.type-action'), 'semantic action utility must exist');
assert.ok(surfaceHeader.includes('type-card-title'), 'surface titles must use semantic typography');
assert.ok(surfaceHeader.includes('type-meta'), 'surface descriptions must use semantic typography');
assert.equal(surfaceHeader.includes('text-[15px] font-black'), false, 'surface title must not regress to arbitrary 15px black');
assert.ok(sectionHeader.includes('type-card-title'), 'section title must use semantic typography');
assert.ok(sectionHeader.includes('type-meta'), 'section subtitle must use semantic typography');
assert.ok(aquarium.includes('type-card-title'), 'aquarium zone title must use the shared card-title hierarchy');
assert.ok(aquarium.includes('type-meta'), 'aquarium zone subtitle must use the shared meta hierarchy');

console.log('Typography migration verified: semantic roles stay shared without globally mutating every legacy font utility.');

import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const forbiddenFiles = [
  'src/pages/Home.tsx',
  'src/pages/ProjectStructurePreview.tsx',
  'src/pages/ThreeDemo.tsx',
  'src/pages/AIAssistant.tsx',
  'src/modules/assistant/assistant.ui.tsx',
];

for (const relative of forbiddenFiles) {
  assert.equal(existsSync(resolve(root, relative)), false, `archived UI must not return to product source: ${relative}`);
}

const app = readFileSync(resolve(root, 'src/App.tsx'), 'utf8');
const taskRoutes = readFileSync(resolve(root, 'src/services/navigation/task-routes.ts'), 'utf8');
const formalSurface = app + '\n' + taskRoutes;

for (const forbidden of ['/3d-demo', '/assistant', 'ThreeDemo', 'ProjectStructurePreview', 'AIAssistant']) {
  assert.equal(formalSurface.includes(forbidden), false, `formal route/navigation surface must not expose archived experiment: ${forbidden}`);
}

const pageNames = readdirSync(resolve(root, 'src/pages'));
assert.equal(pageNames.includes('ThreeDemo.tsx'), false);
assert.equal(pageNames.includes('ProjectStructurePreview.tsx'), false);
assert.equal(pageNames.includes('Home.tsx'), false);
assert.equal(pageNames.includes('AIAssistant.tsx'), false);
assert.equal(pageNames.includes('InteractivePreview.tsx'), true, 'controlled interactive preview remains a supported validation surface');

const status = readFileSync(resolve(root, 'docs/01-definition/CURRENT_PRODUCT_STATUS.md'), 'utf8');
assert.doesNotMatch(status, /内部实验：`\/3d-demo`/);
assert.match(status, /旧独立实验页面.*已归档/);

const roadmap = readFileSync(resolve(root, 'docs/04-planning/PRODUCT_GAPS_AND_ROADMAP.md'), 'utf8');
assert.match(roadmap, /\| P2-04 \|[^\n]+\| 已完成 \|/);
assert.match(roadmap, /\| P2-05 \|[^\n]+\| 已归档（非产品） \|/);

console.log('experimental surface boundary verified: dead pages removed, standalone AI/3D routes forbidden, and only controlled preview remains');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAquariumCameraFrame } from '../src/components/ThreeAquarium';

for (const aspect of [0.5, 0.75, 1, 16 / 9, 2.4]) {
  const contain = getAquariumCameraFrame({ length: 9, width: 4.5, height: 5, aspect, framing: 'contain' });
  const cover = getAquariumCameraFrame({ length: 9, width: 4.5, height: 5, aspect, framing: 'stage-cover' });
  assert.ok(cover.z < contain.z, `stage-cover must move the camera closer at aspect ${aspect}`);
}

const stageCss = readFileSync(new URL('../src/styles/aquarium-stage-layout-v4.css', import.meta.url), 'utf8');
const canvasRulePattern = /\.aquarium-dashboard-tank\s*>\s*\.aquarium-tank canvas\s*\{([^}]*)\}/gs;
for (const match of stageCss.matchAll(canvasRulePattern)) {
  assert.doesNotMatch(match[1], /scale\s*\(/, 'camera owns framing; CSS canvas scale() would create duplicate zoom');
}

console.log('three stage framing: PASS — camera owns framing and CSS does not apply a second zoom');

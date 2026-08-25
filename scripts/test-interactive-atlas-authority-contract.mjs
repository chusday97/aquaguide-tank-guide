import assert from 'node:assert/strict';
import fs from 'node:fs';

const sceneSource = fs.readFileSync('src/components/interactive/SpeciesSceneAtlas.tsx', 'utf8');
const pageSource = fs.readFileSync('src/pages/Encyclopedia.tsx', 'utf8');

assert.match(sceneSource, /data-atlas-authority="visual-only"/, 'scene must be explicitly visual-only');
assert.match(sceneSource, /data-atlas-canonical="species-scene-v2"/, 'latest accepted scene must be the canonical interactive atlas owner');
assert.match(sceneSource, /这是发现兴趣的入口，不是推荐排序/, 'scene must disclose discovery-only semantics');
assert.match(sceneSource, /creaturePositions = \[/, 'scene must retain positioned swimming creatures');
assert.match(sceneSource, /data-scene-node/, 'scene must expose stable selectable creature nodes');
assert.match(sceneSource, /onRefreshDiscoveries/, 'scene must support explicit whole-batch refresh');
assert.match(pageSource, /useState<'scene' \| 'browse' \| 'compatibility'>\('scene'\)/, 'Encyclopedia must enter through the scene by default');
assert.match(pageSource, /<SpeciesSceneAtlas/, 'Encyclopedia must render SpeciesSceneAtlas as the interactive entry');
assert.match(pageSource, /setViewMode\('compatibility'\)/, 'Compatibility must remain an explicit separate intent');

for (const forbidden of ['tankCompatibilityEngine', 'deriveCurrentTankState', 'water-change-decision.service']) {
  assert.ok(!sceneSource.includes(forbidden), `visual scene must not import decision authority: ${forbidden}`);
}

console.log('Interactive Atlas authority contract PASS: SpeciesSceneAtlas owns visual discovery; compatibility remains explicit.');

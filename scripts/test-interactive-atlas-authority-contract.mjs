import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/InteractiveSpeciesAtlas.tsx', 'utf8');
const pageSource = fs.readFileSync('src/pages/EncyclopediaBase.tsx', 'utf8');

assert.match(source, /data-atlas-authority="visual-only"/, 'atlas discovery scene must be explicitly visual-only');
assert.match(source, /非混养建议/, 'atlas must disclose that the random scene is not a compatibility recommendation');
assert.match(source, /空间参考/, 'generic tankSize must be labeled as reference data');
assert.match(source, /换水参考/, 'species waterChangeCycle must be labeled as a maintenance reference');
assert.match(source, /multiVariantGroups = groups\.filter\(group => group\.variants\.length > 1\)/, 'random anchor must prefer a real multi-variant group so the variant interaction is deterministic');
assert.match(source, /groupedRepresentatives = groups\.map/, 'discovery scene should sample distinct species groups rather than arbitrary variants');
assert.match(source, /onClick=\{\(\) => onOpenCompatibility\(previewFish\)\}/, 'compatibility must remain an explicit secondary click');
assert.match(pageSource, /setViewMode\('compatibility'\)/, 'encyclopedia must keep explicit compatibility entry wiring');

for (const forbidden of ['tankCompatibilityEngine', 'deriveCurrentTankState', 'water-change-decision.service', 'recommendation.service']) {
  assert.ok(!source.includes(forbidden), `visual atlas must not import decision authority: ${forbidden}`);
}

console.log('Interactive Atlas authority contract PASS: visual-only scene + reference semantics + explicit compatibility intent.');

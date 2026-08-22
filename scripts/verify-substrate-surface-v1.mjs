import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/ThreeAquarium.tsx', 'utf8');

assert.match(source, /data-substrate=\{aquarium\.substrate \|\| ['"]none['"]\}/, '3D aquarium must expose the persisted substrate it consumes');
assert.match(source, /<SubstrateBed[^>]+substrate=\{aquarium\.substrate\}/, 'SubstrateBed must consume the saved substrate directly');
assert.doesNotMatch(source, /aquarium\.substrate \|\| \(isSaltwater/, 'Renderer must not invent river/coral sand before the user selects substrate');
assert.doesNotMatch(source, /pebbles\.map|const pebbles = useMemo/, 'Substrate must be a continuous bottom surface, not hundreds of grain meshes');
assert.match(source, /<boxGeometry args=\{\[bedLength, config\.height, bedWidth\]\}/, 'Configured substrate must still fill the tank bottom as a continuous bed');
assert.match(source, /if \(!hasSubstrate\)/, 'Bare-bottom state must remain explicit');

console.log('Substrate Surface V1 contract PASS: explicit saved substrate -> continuous full-bed surface, no fake default, no grain-mesh cloud.');

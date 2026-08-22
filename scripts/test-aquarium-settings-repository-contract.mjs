// Permanent regression: Save Settings must persist through the active repository before UI success.
// The aquarium fact is primary; the timeline entry is secondary evidence after persistence succeeds.
// Fail-before proof is Product Golden Path #629 / run 32109567946.
// Product-fix proof is Product Golden Path #644 / run 32111424988; registry target is PUI-BC-037.
// A later Product Golden Path run may be retried when runner dependency installation stalls before product assertions.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/pages/Aquarium.tsx', root), 'utf8');

assert.match(
  source,
  /const handleSaveAquariumSettings = async \(\) =>/,
  'Aquarium settings must use an explicit async persistence handler instead of an inline local-only save.',
);

const handlerStart = source.indexOf('const handleSaveAquariumSettings = async () =>');
const handlerEnd = source.indexOf('\n  };', handlerStart);
assert.ok(handlerStart >= 0 && handlerEnd > handlerStart, 'Aquarium settings persistence handler could not be isolated.');
const handler = source.slice(handlerStart, handlerEnd + 5);

assert.match(
  handler,
  /getCurrentAquaGuideRepository\(\)/,
  'Aquarium settings must resolve the active local/cloud repository before saving.',
);
assert.match(
  handler,
  /await repository\.saveAquarium\(/,
  'Aquarium settings must await repository.saveAquarium before reporting success.',
);
assert.doesNotMatch(
  handler,
  /saveAquariums\(/,
  'Aquarium settings must not persist through the legacy local-only saveAquariums helper.',
);
assert.match(
  handler,
  /setAquariums\(/,
  'Aquarium settings must update visible state from the repository result after persistence succeeds.',
);
assert.match(
  handler,
  /setIsSettingsSaving\(true\)/,
  'Aquarium settings must expose an in-flight state to prevent duplicate submissions.',
);
assert.match(
  handler,
  /catch \(error\)/,
  'Aquarium settings must keep a stable failure path when repository persistence fails.',
);

assert.match(
  source,
  /disabled=\{isSettingsSaving\}/,
  'The Save Settings CTA must be disabled while repository persistence is in flight.',
);
assert.match(
  source,
  /onClick=\{\(\) => void handleSaveAquariumSettings\(\)\}/,
  'The Save Settings CTA must call the repository-backed async handler.',
);

console.log('Aquarium settings repository contract: PASS');
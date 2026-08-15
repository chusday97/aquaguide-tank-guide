import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const aquariumPageSource = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');

assert.match(
  aquariumPageSource,
  /const aquariumSetupStatus = getAquariumSetupStatus\(activeAquarium\);/,
  'Aquarium page must derive setup status from the canonical setup service',
);
assert.match(
  aquariumPageSource,
  /const isBasicConfigComplete = aquariumSetupStatus === 'complete';/,
  'recommended next actions must consume canonical completion instead of redefining setup rules',
);
assert.doesNotMatch(
  aquariumPageSource,
  /const isBasicConfigComplete = hasDimensionConfig && hasWaterConfig && hasEquipmentConfig;/,
  'page-level completion rules must not drift from the setup service',
);

const settingsStart = aquariumPageSource.indexOf('/* Settings Modal */');
const settingsEnd = aquariumPageSource.indexOf('/* Guide Modal */', settingsStart);
assert.ok(settingsStart >= 0 && settingsEnd > settingsStart, 'Aquarium settings modal source must be discoverable');
const settingsSource = aquariumPageSource.slice(settingsStart, settingsEnd);

assert.match(
  settingsSource,
  /const repository = await getCurrentAquaGuideRepository\(\);[\s\S]*const savedAquarium = await repository\.saveAquarium\(nextAquarium\);/,
  'settings must persist through the active repository before updating local UI state',
);
assert.match(
  settingsSource,
  /const mirroredState = persistAquariums\(mirroredAquariums, savedAquarium\.id\);/,
  'successful repository saves must refresh the local mirror used by onboarding and page state',
);
assert.doesNotMatch(
  settingsSource,
  /saveAquariums\(updated\);/,
  'settings must not bypass the repository with the legacy local-only save path',
);
assert.match(
  settingsSource,
  /catch \{[\s\S]*Aquarium settings could not be saved\.[\s\S]*鱼缸设置没有保存成功。/,
  'repository failures must remain visible instead of closing the settings dialog as if saving succeeded',
);

console.log('aquarium settings boundary: canonical completion and repository-backed persistence verified');

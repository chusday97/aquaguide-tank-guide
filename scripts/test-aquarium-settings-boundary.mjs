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
assert.match(
  aquariumPageSource,
  /const settingsFacts = getAquariumSetupFacts\(settingsForm\);/,
  'settings display state must reuse canonical answer-presence semantics',
);
assert.match(
  aquariumPageSource,
  /settingsFacts\.filterKnown[\s\S]*settingsFacts\.lightKnown[\s\S]*settingsFacts\.heaterKnown[\s\S]*settingsFacts\.oxygenKnown/,
  'recorded-setting counts must include explicit none and false answers',
);
assert.match(
  aquariumPageSource,
  /configured: settingsFacts\.filterKnown/,
  'equipment readiness must depend on the filter question being answered, not on a truthy auxiliary device',
);
assert.doesNotMatch(
  aquariumPageSource,
  /configured: Boolean\([\s\S]{0,220}settingsForm\.equipment\?\.heater[\s\S]{0,120}settingsForm\.equipment\?\.oxygen/,
  'truthy auxiliary devices must not substitute for an unanswered filter',
);
assert.match(
  aquariumPageSource,
  /const currentValue = settingsForm\.equipment\?\.\[device\.key\];/,
  'heater and aeration controls must preserve undefined separately from boolean false',
);
assert.match(
  aquariumPageSource,
  /selected=\{currentValue === option\.value\}/,
  'auxiliary equipment choices must select explicit true or false without coercion',
);
assert.doesNotMatch(
  aquariumPageSource,
  /const isSelected = Boolean\(\(settingsForm\.equipment as any\)\?\.\[device\.key\]\);/,
  'the settings UI must not collapse unknown and false into the same visual state',
);
assert.match(
  aquariumPageSource,
  /currentSubstrate === '无'[\s\S]{0,100}Substrate: none[\s\S]{0,100}底砂：无/,
  'explicitly recording no substrate must be represented as a real answer',
);
assert.match(
  aquariumPageSource,
  /settingsForm\.equipment\?\.light === '无'[\s\S]{0,100}Lighting: none[\s\S]{0,100}灯光：无/,
  'explicitly recording no lighting must be represented as a real answer',
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

console.log('aquarium settings boundary: canonical completion, three-state answers, and repository-backed persistence verified');
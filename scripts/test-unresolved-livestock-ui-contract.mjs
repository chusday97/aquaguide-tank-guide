import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const aquarium = await readFile(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const roster = await readFile(new URL('../src/components/aquarium/LivestockRosterDialog.tsx', import.meta.url), 'utf8');

assert.match(
  aquarium,
  /const handleRecordUnresolvedExistingLivestock = async \(\) =>/,
  'Aquarium must expose a dedicated factual manual-record handler',
);
assert.match(
  aquarium,
  /additionIntent !== 'record_existing'/,
  'manual unresolved recording must fail closed outside record_existing intent',
);
assert.match(
  aquarium,
  /identityStatus:\s*'unresolved',[\s\S]*rawName:/,
  'manual existing-livestock recording must send an unresolved identity with the original name',
);
assert.match(
  aquarium,
  /additionIntent === 'record_existing'\s*\?[\s\S]*按此名称记录[\s\S]*:\s*\([\s\S]*规划模式只接受已收录生物/,
  'no-result UI must diverge: factual recording may use raw names, planned additions may not',
);
assert.match(
  aquarium,
  /身份确认前不会用于完整混养判断/,
  'manual record UI must disclose the compatibility evidence gap',
);
assert.match(
  aquarium,
  /identityStatus:\s*'unresolved',[\s\S]*rawName:\s*record\.rawName[\s\S]*quantity:\s*batch\.quantity/,
  'timeline events for unresolved livestock must preserve raw identity instead of a fake species ID',
);

assert.doesNotMatch(
  roster,
  /\.filter\(\(item\): item is \{ record: AquariumFish; fish: Fish \} => Boolean\(item\.fish\)\)/,
  'roster must not silently drop records that cannot be resolved to catalog fish',
);
assert.match(
  roster,
  /record\.identityStatus === 'unresolved'/,
  'roster must explicitly identify unresolved records',
);
assert.match(
  roster,
  /record\.rawName/,
  'roster must display the original user-entered name',
);
assert.match(
  roster,
  /data-livestock-identity="unresolved"/,
  'unresolved records need a stable UI marker for browser regression and accessibility review',
);
assert.match(
  roster,
  /待确认身份/,
  'unresolved roster records must visibly disclose their identity status',
);
assert.match(
  roster,
  /fish \? \([\s\S]*<LivestockBatchCard[\s\S]*\) : \(/,
  'catalog details/editing must remain restricted to verified records',
);
assert.match(
  roster,
  /beginRemoval\(record, fish, label\)/,
  'both verified and unresolved reality must remain removable by the factual record ID',
);

console.log('unresolved livestock UI contract passed: manual recording is intent-scoped and unresolved records remain visible without fake catalog detail');

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/components/compatibility/InterventionComparisonPanel.tsx', import.meta.url), 'utf8');

const propsStart = source.indexOf('export type InterventionComparisonPanelProps');
const propsEnd = source.indexOf('};', propsStart);
assert.ok(propsStart >= 0 && propsEnd > propsStart, 'intervention panel props contract must exist');
const propsBlock = source.slice(propsStart, propsEnd + 2);
assert.match(propsBlock, /result:\s*TankDecisionSupportResult/);
assert.match(propsBlock, /onOpenChange:\s*\(open:\s*boolean\)/);
assert.doesNotMatch(propsBlock, /onRemove|onDelete|onRelocate|onMove|onMutate|repository/i, 'read-only panel must not accept livestock mutation callbacks');

assert.match(source, /data-intervention-panel-readonly="true"/, 'panel must declare its read-only surface contract');
assert.match(source, /data-partial-known-community/, 'partial-known source state must be visibly represented');
assert.match(source, /data-formal-intervention-choices/, 'formal choices must have an explicit rendering boundary');
assert.match(source, /data-relocation-destinations/, 'destination evaluation must be visibly separated from relocation choice');
assert.match(source, /compatible_by_current_evidence/, 'destination wording must preserve current-evidence semantics');
assert.match(source, /资料不足，暂不能确认/, 'insufficient destination data must not be hidden');
assert.match(source, /不是要求你移出该生物/, 'strongest single-change comparison must explicitly avoid command language');
assert.match(source, /不会生成正式的保留 A \/ 保留 B 或目标缸结论/, 'unresolved source residents must visibly block formal whole-community advice');
assert.match(source, /不会把“未知去向”写成“没有可用鱼缸”/, 'missing destination-set input must stay unknown rather than none');

assert.doesNotMatch(source, /localStorage|sessionStorage/, 'decision UI must not recover business truth from device storage');
assert.doesNotMatch(source, /AquaGuideRepository|LocalAquaGuideRepository|ApiAquaGuideRepository/, 'presentation component must not own repository access');
assert.doesNotMatch(source, /removeLivestock|deleteLivestock|saveAquarium|addLivestock/, 'presentation component must not mutate aquarium state');
assert.doesNotMatch(source, /<Button\b/, 'read-only comparison must not expose an action button that looks executable');

console.log('intervention comparison UI contract passed: panel is result-driven, read-only, unresolved-aware, destination-aware, and contains no persistence/removal path');

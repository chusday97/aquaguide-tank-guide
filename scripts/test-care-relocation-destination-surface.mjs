import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url), 'utf8');

assert.ok(source.includes('allAquariums: aquariums'), 'Care decision support must receive the currently hydrated aquarium set for destination evaluation');
assert.ok(source.includes(': null, [targetAquarium, aquariums]);'), 'destination evaluation must recompute when the repository-hydrated aquarium list changes');
assert.ok(source.includes('InterventionComparisonPanel'), 'Care must keep rendering destination results through the existing read-only intervention panel');
assert.ok(source.includes('CARE_CONFLICT_DECISION_SURFACE_START') && source.includes('CARE_CONFLICT_DECISION_SURFACE_END'), 'Care decision-surface boundary markers must remain present');

const start = source.indexOf('CARE_CONFLICT_DECISION_SURFACE_START');
const end = source.indexOf('CARE_CONFLICT_DECISION_SURFACE_END');
const integration = source.slice(start, end);
assert.ok(integration.includes('allAquariums: aquariums'), 'destination set must be supplied inside the read-only decision surface');

for (const forbidden of ['removeLivestock', 'deleteLivestock', 'onRemove', 'onRelocate', 'repository.remove', 'repository.delete']) {
  assert.ok(!integration.includes(forbidden), `destination surface must remain read-only: ${forbidden}`);
}

console.log('Care relocation destination surface contract passed: aquarium set is reactive, explicit, and read-only');

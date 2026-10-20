import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompatibilityVariantExactEvidenceQueue } from '../src/services/compatibility/variant-exact-evidence-queue.service';

const outputPath = 'evaluation/product/compatibility-variant-exact-evidence-queue.v1.json';
const raw = readFileSync(outputPath, 'utf8');
const disk = JSON.parse(raw);
const queue = buildCompatibilityVariantExactEvidenceQueue();

assert.deepEqual(disk, queue);
assert.equal(queue.policy.promotionAllowed, false);
assert.equal(queue.policy.writesAuthority, false);
assert.equal(queue.policy.baseTaxonEvidenceCanCloseQueuedSlots, false);
assert.equal(queue.policy.wholeProfileInheritanceAllowed, false);
assert.equal(queue.summary.variantObjects, 9);
assert.equal(queue.summary.totalResearchSlots, 39);
assert.equal(queue.summary.environmentVariantSpecificSlots, 5);
assert.equal(queue.summary.exactObjectCoreSlots, 34);
assert.equal(queue.summary.contractBlockedSlotsNotQueued, 1);

assert.equal(new Set(queue.items.map(item => item.speciesId + ':' + item.field)).size, 39);
assert.equal(queue.items.every(item => item.promotionAllowed === false && item.writesAuthority === false), true);
assert.equal(queue.items.filter(item => item.sourceLane === 'environment_bridge_hold').every(item => (
  item.field === 'temperature' || item.field === 'ph'
)), true);
assert.equal(queue.items.filter(item => item.sourceLane === 'exact_object_policy').every(item => (
  ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'].includes(item.field)
)), true);

for (const speciesId of ['sp_0066', 'sp_0067', 'sp_0068']) {
  assert.ok(queue.items.some(item => item.speciesId === speciesId && item.field === 'temperature' && item.sourceLane === 'environment_bridge_hold'));
}
assert.ok(queue.items.some(item => item.speciesId === 'sp_0144' && item.field === 'temperature' && item.sourceLane === 'environment_bridge_hold'));
assert.ok(queue.items.some(item => item.speciesId === 'sp_0144' && item.field === 'ph' && item.sourceLane === 'environment_bridge_hold'));
for (const speciesId of ['sp_0065', 'sp_0143', 'sp_0155', 'sp_0162', 'sp_0361']) {
  assert.equal(queue.items.some(item => item.speciesId === speciesId && ['water', 'temperature', 'ph'].includes(item.field) && item.sourceLane === 'environment_bridge_hold'), false);
}
assert.deepEqual(queue.items.filter(item => item.speciesId === 'sp_0065').map(item => item.field).sort(), ['predation', 'social_behavior', 'territoriality']);
for (const speciesId of ['sp_0143', 'sp_0155', 'sp_0361']) {
  assert.deepEqual(queue.items.filter(item => item.speciesId === speciesId).map(item => item.field).sort(), ['predation', 'territoriality']);
}
assert.deepEqual(queue.blockedCandidateContracts.map(item => item.speciesId), ['sp_0144']);
assert.equal(queue.blockedCandidateContracts.every(item => item.field === 'water'), true);

console.log('Compatibility variant exact-evidence queue PASS: 39 unresolved slots remain after 23 exact-variant fields close; partially completed variants retain their exact-object remainders.');

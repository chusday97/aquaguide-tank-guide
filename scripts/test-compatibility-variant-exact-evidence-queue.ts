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
assert.equal(queue.summary.variantObjects, 5);
assert.equal(queue.summary.totalResearchSlots, 6);
assert.equal(queue.summary.environmentVariantSpecificSlots, 0);
assert.equal(queue.summary.exactObjectCoreSlots, 6);
assert.equal(queue.summary.contractBlockedSlotsNotQueued, 0);

assert.equal(new Set(queue.items.map(item => item.speciesId + ':' + item.field)).size, 6);
assert.equal(queue.items.every(item => item.promotionAllowed === false && item.writesAuthority === false), true);
assert.equal(queue.items.filter(item => item.sourceLane === 'environment_bridge_hold').every(item => (
  item.field === 'temperature' || item.field === 'ph'
)), true);
assert.equal(queue.items.filter(item => item.sourceLane === 'exact_object_policy').every(item => (
  ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'].includes(item.field)
)), true);

assert.equal(queue.items.some(item => item.sourceLane === 'environment_bridge_hold'), false, 'all remaining queued slots are exact-object-only after phase2-18 environmental promotion');
for (const speciesId of ['sp_0066', 'sp_0068', 'sp_0144', 'sp_0361']) {
  assert.deepEqual(queue.items.filter(item => item.speciesId === speciesId).map(item => item.field).sort(), ['territoriality']);
}
assert.deepEqual(queue.items.filter(item => item.speciesId === 'sp_0155').map(item => item.field).sort(), ['predation', 'territoriality']);
assert.equal(queue.items.some(item => item.speciesId === 'sp_0065'), false, 'Butterfly Tail 8/8 exact authority must leave the research queue');
assert.equal(queue.items.some(item => item.speciesId === 'sp_0143'), false, 'Red Grass Guppy 8/8 exact authority must leave the research queue');
assert.equal(queue.items.some(item => item.speciesId === 'sp_0162'), false, 'Red Grass Goldfish 8/8 authority must leave the exact-evidence queue');
assert.equal(queue.items.some(item => item.speciesId === 'sp_0067'), false, 'Pearlscale 8/8 exact authority must leave the research queue');
assert.deepEqual(queue.blockedCandidateContracts, []);

console.log('Compatibility variant exact-evidence queue PASS: 6 exact-object behavior slots remain across 5 variants after phase2-20 territoriality promotion.');

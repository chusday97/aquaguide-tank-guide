import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompatibilityVariantActionableResearchQueue, buildCompatibilityVariantExactEvidenceQueue } from '../src/services/compatibility/variant-exact-evidence-queue.service';

const outputPath = 'evaluation/product/compatibility-variant-exact-evidence-queue.v1.json';
const raw = readFileSync(outputPath, 'utf8');
const disk = JSON.parse(raw);
const queue = buildCompatibilityVariantExactEvidenceQueue();
const actionable = buildCompatibilityVariantActionableResearchQueue();

assert.deepEqual(disk, queue);
assert.equal(queue.policy.promotionAllowed, false);
assert.equal(queue.policy.writesAuthority, false);
assert.equal(queue.policy.baseTaxonEvidenceCanCloseQueuedSlots, false);
assert.equal(queue.policy.wholeProfileInheritanceAllowed, false);
assert.equal(queue.summary.variantObjects, 12);
assert.equal(queue.summary.totalResearchSlots, 41);
assert.equal(queue.summary.environmentVariantSpecificSlots, 0);
assert.equal(queue.summary.exactObjectCoreSlots, 41);
assert.equal(queue.summary.contractBlockedSlotsNotQueued, 0);

assert.equal(new Set(queue.items.map(item => item.speciesId + ':' + item.field)).size, 41);
assert.equal(queue.items.every(item => item.promotionAllowed === false && item.writesAuthority === false), true);
assert.equal(queue.items.filter(item => item.sourceLane === 'environment_bridge_hold').every(item => (
  item.field === 'temperature' || item.field === 'ph'
)), true);
assert.equal(queue.items.filter(item => item.sourceLane === 'exact_object_policy').every(item => (
  ['adult_size', 'tank_size', 'social_behavior', 'territoriality', 'predation'].includes(item.field)
)), true);

assert.equal(queue.items.some(item => item.sourceLane === 'environment_bridge_hold'), false, 'all unresolved audit slots are exact-object-only');
for (const speciesId of ['sp_0063', 'sp_0149', 'sp_0180', 'sp_0348', 'sp_0349', 'sp_0351', 'sp_0386']) {
  assert.deepEqual(queue.items.filter(item => item.speciesId === speciesId).map(item => item.field).sort(), ['adult_size', 'predation', 'social_behavior', 'tank_size', 'territoriality']);
  assert.deepEqual(actionable.items.filter(item => item.speciesId === speciesId).map(item => item.field), [], speciesId + ' wave37 predation ceiling must remove active research without deleting audit history');
}
for (const speciesId of ['sp_0066', 'sp_0068', 'sp_0144', 'sp_0155', 'sp_0361']) {
  assert.equal(queue.items.some(item => item.speciesId === speciesId), true, speciesId + ' unresolved terminal slots must remain in the audit ledger');
  assert.equal(actionable.items.some(item => item.speciesId === speciesId), false, speciesId + ' terminal-hold slots must not re-enter active research');
}
assert.equal(actionable.summary.variantObjects, 0);
assert.equal(actionable.summary.totalResearchSlots, 0);
assert.equal(actionable.summary.auditLedgerSlots, 41);
assert.equal(actionable.summary.excludedNonActionableSlots, 41);
assert.deepEqual(actionable.items, []);
assert.equal(queue.items.some(item => item.speciesId === 'sp_0065'), false, 'Butterfly Tail 8/8 exact authority must leave the research queue');
assert.equal(queue.items.some(item => item.speciesId === 'sp_0143'), false, 'Red Grass Guppy 8/8 exact authority must leave the research queue');
assert.equal(queue.items.some(item => item.speciesId === 'sp_0162'), false, 'Red Grass Goldfish 8/8 authority must leave the exact-evidence queue');
assert.equal(queue.items.some(item => item.speciesId === 'sp_0067'), false, 'Pearlscale 8/8 exact authority must leave the research queue');
assert.deepEqual(queue.blockedCandidateContracts, []);

console.log('Compatibility variant exact-evidence queue PASS: 41 unresolved audit slots remain traceable while Wave37 terminal ceilings reduce executable exact-variant research to zero.');

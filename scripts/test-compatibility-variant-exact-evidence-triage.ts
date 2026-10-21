import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildCompatibilityVariantActionableResearchQueue } from '../src/services/compatibility/variant-exact-evidence-queue.service';

const path = 'evaluation/product/compatibility-variant-exact-evidence-triage.v1.json';
const triage = JSON.parse(readFileSync(path, 'utf8'));
const queue = buildCompatibilityVariantActionableResearchQueue();

assert.equal(triage.policy.promotionAllowed, false);
assert.equal(triage.policy.writesAuthority, false);
assert.equal(triage.policy.grantsInheritance, false);
assert.equal(triage.policy.discoveryEvidenceCeilingRequiresEmptyRounds, 2);
assert.equal(triage.summary.variantObjects, 0);
assert.equal(triage.summary.totalResearchSlots, 0);
assert.equal(triage.summary.draftEvidenceFoundObjects, 0);
assert.equal(triage.summary.discoveryEvidenceCeilingObjects, 0);
assert.equal(triage.summary.discoveryRetryRequiredObjects, 0);
assert.equal(triage.summary.notRunObjects, 0);
assert.equal(triage.summary.supportedSlots, 0);
assert.equal(triage.summary.unresolvedSlots, 0);
assert.equal(triage.summary.totalResearchSlots, queue.summary.totalResearchSlots);

const triageSpeciesIds = triage.objects.map((item: any) => item.speciesId).sort();
const queueSpeciesIds = [...new Set(queue.items.map(item => item.speciesId))].sort();
assert.deepEqual(triageSpeciesIds, queueSpeciesIds, 'triage must cover exactly the current actionable exact-evidence queue');
assert.deepEqual(triageSpeciesIds, []);
assert.deepEqual(triage.objects, []);
assert.ok(triage.objects.every((item: any) => item.promotionAllowed === false && item.writesAuthority === false && item.grantsInheritance === false));

console.log('Compatibility exact-variant evidence triage PASS: actionable exact-variant queue is empty after Wave37 terminal ceilings; no terminal hold is re-scheduled.');

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
assert.equal(triage.summary.variantObjects, 7);
assert.equal(triage.summary.totalResearchSlots, 7);
assert.equal(triage.summary.draftEvidenceFoundObjects, 0);
assert.equal(triage.summary.discoveryEvidenceCeilingObjects, 0);
assert.equal(triage.summary.discoveryRetryRequiredObjects, 0);
assert.equal(triage.summary.notRunObjects, 7);
assert.equal(triage.summary.supportedSlots, 0);
assert.equal(triage.summary.unresolvedSlots, 7);
assert.equal(triage.summary.totalResearchSlots, queue.summary.totalResearchSlots);

const triageSpeciesIds = triage.objects.map((item: any) => item.speciesId).sort();
const queueSpeciesIds = [...new Set(queue.items.map(item => item.speciesId))].sort();
assert.deepEqual(triageSpeciesIds, queueSpeciesIds, 'triage must cover exactly the current actionable exact-evidence queue');
assert.deepEqual(triageSpeciesIds, ['sp_0063', 'sp_0149', 'sp_0180', 'sp_0348', 'sp_0349', 'sp_0351', 'sp_0386']);
assert.ok(triage.objects.every((item: any) => item.status === 'not_run' && item.researchRuns.length === 0));
assert.ok(triage.objects.every((item: any) => item.promotionAllowed === false && item.writesAuthority === false && item.grantsInheritance === false));

console.log('Compatibility exact-variant evidence triage PASS: triage is fresh against the 7-slot actionable queue; all new goldfish predation slots are explicitly not_run.');

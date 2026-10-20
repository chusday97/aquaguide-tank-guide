import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const path = 'evaluation/product/compatibility-variant-exact-evidence-triage.v1.json';
const triage = JSON.parse(readFileSync(path, 'utf8'));

assert.equal(triage.policy.promotionAllowed, false);
assert.equal(triage.policy.writesAuthority, false);
assert.equal(triage.policy.grantsInheritance, false);
assert.equal(triage.policy.discoveryEvidenceCeilingRequiresEmptyRounds, 2);
assert.equal(triage.summary.variantObjects, 7);
assert.equal(triage.summary.totalResearchSlots, 8);
assert.equal(triage.summary.draftEvidenceFoundObjects, 0);
assert.equal(triage.summary.discoveryEvidenceCeilingObjects, 3);
assert.equal(triage.summary.discoveryRetryRequiredObjects, 4);
assert.equal(triage.summary.notRunObjects, 0);
assert.equal(triage.summary.supportedSlots, 0);
assert.equal(triage.summary.unresolvedSlots, 8);

const ceilings = triage.objects.filter((item: any) => item.status === 'discovery_evidence_ceiling').map((item: any) => item.speciesId);
assert.deepEqual(ceilings, ['sp_0065', 'sp_0066', 'sp_0068']);
assert.ok(triage.objects.filter((item: any) => item.status === 'discovery_evidence_ceiling').every((item: any) => (
  item.researchRuns.length >= 2
  && item.researchRuns.filter((run: any) => run.discoveryStatus === 'discovery_empty').length >= 2
)));
assert.ok(triage.objects.every((item: any) => item.promotionAllowed === false && item.writesAuthority === false && item.grantsInheritance === false));

console.log('Compatibility exact-variant evidence triage PASS: 3 discovery ceilings / 4 retry-required objects / 8 unresolved exact-object slots after phase2-19 promotion.');

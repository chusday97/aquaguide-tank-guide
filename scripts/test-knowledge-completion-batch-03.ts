import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { phase2Batch03Authority, phase2Batch03Knowledge, phase2Batch03Subjects } from '../src/modules/knowledge/phase2Batch03Authority';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

const ids = Object.keys(phase2Batch03Subjects);
for (const id of ids) {
  assert.ok(fishData.some(item => item.id === id), `${id}: missing catalog object`);
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch03Knowledge[id], `${id}: missing direct knowledge`);
  assert.equal(getReviewedCompatibilityProfile(id), undefined, `${id}: unexpected compatibility profile`);
  for (const section of [phase2Batch03Knowledge[id]?.environment, phase2Batch03Knowledge[id]?.socialBehavior, phase2Batch03Knowledge[id]?.spaceAndGrowth]) {
    assert.equal(section?.evidence.reviewStatus, 'reviewed');
    assert.ok(section?.evidence.sourceIds.length);
  }
  for (const field of ['feeding', 'care'] as const) {
    const authority = phase2Batch03Authority[id]?.[field];
    assert.equal(authority?.status, 'reviewed_unknown');
    assert.ok(authority?.citationIds.length);
    assert.ok(authority?.factEvidence.trim());
  }
}
assert.equal(phase2Batch03Knowledge.sp_0052?.environment?.evidence.confidence, 'verified');
assert.equal(phase2Batch03Knowledge.sp_0112?.environment?.evidence.confidence, 'verified');
assert.equal(phase2Batch03Knowledge.sp_0115?.environment?.evidence.confidence, 'verified');
for (const id of ids.slice(3)) assert.equal(phase2Batch03Knowledge[id]?.environment?.evidence.confidence, 'unknown', `${id}: variant inherited unsupported environment`);
console.log(`knowledge completion batch 03 contract: PASS (${ids.length} direct records)`);

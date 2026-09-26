import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { phase2Batch02Authority, phase2Batch02Knowledge, phase2Batch02Subjects } from '../src/modules/knowledge/phase2Batch02Authority';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

const ids = Object.keys(phase2Batch02Subjects);
for (const id of ids) {
  assert.ok(fishData.some(item => item.id === id), `${id}: missing catalog object`);
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch02Knowledge[id], `${id}: missing direct knowledge`);
  // Compatibility authority is independent. This batch must not create or
  // alter profiles merely because Species Knowledge is now direct.
  if (!['sp_0021'].includes(id)) assert.equal(getReviewedCompatibilityProfile(id), undefined, `${id}: unexpected compatibility profile`);
  for (const section of [phase2Batch02Knowledge[id]?.environment, phase2Batch02Knowledge[id]?.socialBehavior, phase2Batch02Knowledge[id]?.spaceAndGrowth]) {
    assert.equal(section?.evidence.reviewStatus, 'reviewed');
    assert.ok(section?.evidence.sourceIds.length);
    assert.equal(section?.evidence.confidence, 'unknown');
  }
  for (const field of ['feeding', 'care'] as const) {
    const authority = phase2Batch02Authority[id]?.[field];
    assert.equal(authority?.status, 'reviewed_unknown');
    assert.ok(authority?.citationIds.length);
    assert.ok(authority?.factEvidence.trim());
  }
}
console.log(`knowledge completion batch 02 contract: PASS (${ids.length} direct records)`);

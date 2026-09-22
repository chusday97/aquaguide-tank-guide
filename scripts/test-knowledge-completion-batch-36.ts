import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch36Authority, phase2Batch36Knowledge, phase2Batch36Subjects } from '../src/modules/knowledge/phase2Batch36Authority';

for (const id of Object.keys(phase2Batch36Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch36Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch36Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch36Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch36Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch36Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 36 contract: PASS (${Object.keys(phase2Batch36Subjects).length} direct records)`);

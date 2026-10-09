import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch37Authority, phase2Batch37Knowledge, phase2Batch37Subjects } from '../src/modules/knowledge/phase2Batch37Authority';

for (const id of Object.keys(phase2Batch37Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch37Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch37Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch37Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch37Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch37Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 37 contract: PASS (${Object.keys(phase2Batch37Subjects).length} direct records)`);

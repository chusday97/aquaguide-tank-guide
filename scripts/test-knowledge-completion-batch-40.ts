import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch40Authority, phase2Batch40Knowledge, phase2Batch40Subjects } from '../src/modules/knowledge/phase2Batch40Authority';

for (const id of Object.keys(phase2Batch40Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch40Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch40Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch40Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch40Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch40Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 40 contract: PASS (${Object.keys(phase2Batch40Subjects).length} direct records)`);

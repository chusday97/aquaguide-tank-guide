import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch32Authority, phase2Batch32Knowledge, phase2Batch32Subjects } from '../src/modules/knowledge/phase2Batch32Authority';

for (const id of Object.keys(phase2Batch32Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch32Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch32Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch32Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch32Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch32Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 32 contract: PASS (${Object.keys(phase2Batch32Subjects).length} direct records)`);

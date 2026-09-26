import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch47Authority, phase2Batch47Knowledge, phase2Batch47Subjects } from '../src/modules/knowledge/phase2Batch47Authority';

for (const id of Object.keys(phase2Batch47Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch47Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch47Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch47Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch47Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch47Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 47 contract: PASS (${Object.keys(phase2Batch47Subjects).length} direct records)`);

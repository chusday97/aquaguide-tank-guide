import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch39Authority, phase2Batch39Knowledge, phase2Batch39Subjects } from '../src/modules/knowledge/phase2Batch39Authority';

for (const id of Object.keys(phase2Batch39Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch39Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch39Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch39Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch39Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch39Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 39 contract: PASS (${Object.keys(phase2Batch39Subjects).length} direct records)`);

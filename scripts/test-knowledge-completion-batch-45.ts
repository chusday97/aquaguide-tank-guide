import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch45Authority, phase2Batch45Knowledge, phase2Batch45Subjects } from '../src/modules/knowledge/phase2Batch45Authority';

for (const id of Object.keys(phase2Batch45Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch45Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch45Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch45Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch45Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch45Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 45 contract: PASS (${Object.keys(phase2Batch45Subjects).length} direct records)`);

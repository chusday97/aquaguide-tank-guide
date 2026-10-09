import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch35Authority, phase2Batch35Knowledge, phase2Batch35Subjects } from '../src/modules/knowledge/phase2Batch35Authority';

for (const id of Object.keys(phase2Batch35Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch35Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch35Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch35Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch35Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch35Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 35 contract: PASS (${Object.keys(phase2Batch35Subjects).length} direct records)`);

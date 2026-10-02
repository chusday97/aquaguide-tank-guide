import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch38Authority, phase2Batch38Knowledge, phase2Batch38Subjects } from '../src/modules/knowledge/phase2Batch38Authority';

for (const id of Object.keys(phase2Batch38Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch38Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch38Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch38Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch38Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch38Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 38 contract: PASS (${Object.keys(phase2Batch38Subjects).length} direct records)`);

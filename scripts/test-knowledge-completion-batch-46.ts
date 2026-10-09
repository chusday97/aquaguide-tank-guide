import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch46Authority, phase2Batch46Knowledge, phase2Batch46Subjects } from '../src/modules/knowledge/phase2Batch46Authority';

for (const id of Object.keys(phase2Batch46Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch46Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch46Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch46Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch46Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch46Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 46 contract: PASS (${Object.keys(phase2Batch46Subjects).length} direct records)`);

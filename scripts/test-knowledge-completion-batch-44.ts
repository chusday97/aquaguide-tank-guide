import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch44Authority, phase2Batch44Knowledge, phase2Batch44Subjects } from '../src/modules/knowledge/phase2Batch44Authority';

for (const id of Object.keys(phase2Batch44Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch44Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch44Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch44Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch44Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch44Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 44 contract: PASS (${Object.keys(phase2Batch44Subjects).length} direct records)`);

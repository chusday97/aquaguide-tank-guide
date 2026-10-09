import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch34Authority, phase2Batch34Knowledge, phase2Batch34Subjects } from '../src/modules/knowledge/phase2Batch34Authority';

for (const id of Object.keys(phase2Batch34Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch34Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch34Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch34Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch34Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch34Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 34 contract: PASS (${Object.keys(phase2Batch34Subjects).length} direct records)`);

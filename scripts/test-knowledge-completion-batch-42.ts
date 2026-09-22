import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch42Authority, phase2Batch42Knowledge, phase2Batch42Subjects } from '../src/modules/knowledge/phase2Batch42Authority';

for (const id of Object.keys(phase2Batch42Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch42Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch42Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch42Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch42Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch42Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 42 contract: PASS (${Object.keys(phase2Batch42Subjects).length} direct records)`);

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch33Authority, phase2Batch33Knowledge, phase2Batch33Subjects } from '../src/modules/knowledge/phase2Batch33Authority';

for (const id of Object.keys(phase2Batch33Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch33Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.equal(phase2Batch33Authority[id].feeding.status, 'reviewed_unknown');
  assert.equal(phase2Batch33Authority[id].care.status, 'reviewed_unknown');
  assert.ok(phase2Batch33Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch33Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 33 contract: PASS (${Object.keys(phase2Batch33Subjects).length} direct records)`);

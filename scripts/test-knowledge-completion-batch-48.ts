import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch48Authority, phase2Batch48Subjects } from '../src/modules/knowledge/phase2Batch48Authority';

for (const id of Object.keys(phase2Batch48Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  assert.equal(phase2Batch48Authority[id].environment.status, 'reviewed_unknown');
  assert.ok(phase2Batch48Authority[id].environment.citationIds.length);
}
console.log(`knowledge completion batch 48 contract: PASS (${Object.keys(phase2Batch48Subjects).length} direct records)`);

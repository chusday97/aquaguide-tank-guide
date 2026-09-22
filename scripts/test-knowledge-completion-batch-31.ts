import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch31Authority, phase2Batch31Knowledge, phase2Batch31Subjects } from '../src/modules/knowledge/phase2Batch31Authority';

for (const id of Object.keys(phase2Batch31Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.ok(getReviewedSpeciesKnowledge(id));
  getReviewedCompatibilityProfile(id);
  assert.equal(phase2Batch31Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch31Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch31Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 31 contract: PASS (${Object.keys(phase2Batch31Subjects).length} direct records)`);

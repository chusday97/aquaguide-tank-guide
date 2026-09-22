import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch23Authority, phase2Batch23Knowledge, phase2Batch23Subjects } from '../src/modules/knowledge/phase2Batch23Authority';
for (const id of Object.keys(phase2Batch23Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch23Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch23Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch23Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch23Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 23 contract: PASS (${Object.keys(phase2Batch23Subjects).length} direct records)`);

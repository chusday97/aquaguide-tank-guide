import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch15Authority, phase2Batch15Knowledge, phase2Batch15Subjects } from '../src/modules/knowledge/phase2Batch15Authority';
for (const id of Object.keys(phase2Batch15Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch15Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch15Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch15Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch15Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 15 contract: PASS (${Object.keys(phase2Batch15Subjects).length} direct records)`);

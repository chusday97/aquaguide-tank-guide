import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch25Authority, phase2Batch25Knowledge, phase2Batch25Subjects } from '../src/modules/knowledge/phase2Batch25Authority';

for (const id of Object.keys(phase2Batch25Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch25Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch25Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch25Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch25Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 25 contract: PASS (${Object.keys(phase2Batch25Subjects).length} direct records)`);

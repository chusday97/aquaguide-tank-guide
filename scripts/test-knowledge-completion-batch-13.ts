import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch13Authority, phase2Batch13Knowledge, phase2Batch13Subjects } from '../src/modules/knowledge/phase2Batch13Authority';

for (const id of Object.keys(phase2Batch13Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch13Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch13Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch13Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch13Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 13 contract: PASS (${Object.keys(phase2Batch13Subjects).length} direct records)`);

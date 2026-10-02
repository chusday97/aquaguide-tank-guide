import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch12Authority, phase2Batch12Knowledge, phase2Batch12Subjects } from '../src/modules/knowledge/phase2Batch12Authority';
for (const id of Object.keys(phase2Batch12Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch12Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch12Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch12Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch12Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 12 contract: PASS (${Object.keys(phase2Batch12Subjects).length} direct records)`);

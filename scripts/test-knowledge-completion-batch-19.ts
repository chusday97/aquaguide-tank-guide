import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch19Authority, phase2Batch19Knowledge, phase2Batch19Subjects } from '../src/modules/knowledge/phase2Batch19Authority';
for (const id of Object.keys(phase2Batch19Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch19Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch19Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch19Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch19Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 19 contract: PASS (${Object.keys(phase2Batch19Subjects).length} direct records)`);

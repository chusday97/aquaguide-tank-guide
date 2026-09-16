import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch08Authority, phase2Batch08Knowledge, phase2Batch08Subjects } from '../src/modules/knowledge/phase2Batch08Authority';
for (const id of Object.keys(phase2Batch08Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch08Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch08Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch08Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch08Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 08 contract: PASS (${Object.keys(phase2Batch08Subjects).length} direct records)`);

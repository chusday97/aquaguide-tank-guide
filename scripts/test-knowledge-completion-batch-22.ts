import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch22Authority, phase2Batch22Knowledge, phase2Batch22Subjects } from '../src/modules/knowledge/phase2Batch22Authority';
for (const id of Object.keys(phase2Batch22Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch22Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch22Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch22Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch22Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 22 contract: PASS (${Object.keys(phase2Batch22Subjects).length} direct records)`);

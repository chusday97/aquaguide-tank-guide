import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch14Authority, phase2Batch14Knowledge, phase2Batch14Subjects } from '../src/modules/knowledge/phase2Batch14Authority';
for (const id of Object.keys(phase2Batch14Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch14Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch14Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch14Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch14Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 14 contract: PASS (${Object.keys(phase2Batch14Subjects).length} direct records)`);

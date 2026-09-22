import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch18Authority, phase2Batch18Knowledge, phase2Batch18Subjects } from '../src/modules/knowledge/phase2Batch18Authority';
for (const id of Object.keys(phase2Batch18Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch18Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch18Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch18Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch18Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 18 contract: PASS (${Object.keys(phase2Batch18Subjects).length} direct records)`);

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch17Authority, phase2Batch17Knowledge, phase2Batch17Subjects } from '../src/modules/knowledge/phase2Batch17Authority';
for (const id of Object.keys(phase2Batch17Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch17Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch17Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch17Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch17Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 17 contract: PASS (${Object.keys(phase2Batch17Subjects).length} direct records)`);

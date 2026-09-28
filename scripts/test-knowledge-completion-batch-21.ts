import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch21Authority, phase2Batch21Knowledge, phase2Batch21Subjects } from '../src/modules/knowledge/phase2Batch21Authority';
for (const id of Object.keys(phase2Batch21Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch21Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch21Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch21Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch21Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 21 contract: PASS (${Object.keys(phase2Batch21Subjects).length} direct records)`);

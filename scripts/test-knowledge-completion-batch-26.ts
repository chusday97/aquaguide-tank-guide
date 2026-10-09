import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch26Authority, phase2Batch26Knowledge, phase2Batch26Subjects } from '../src/modules/knowledge/phase2Batch26Authority';

for (const id of Object.keys(phase2Batch26Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch26Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch26Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch26Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch26Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 26 contract: PASS (${Object.keys(phase2Batch26Subjects).length} direct records)`);

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch27Authority, phase2Batch27Knowledge, phase2Batch27Subjects } from '../src/modules/knowledge/phase2Batch27Authority';

for (const id of Object.keys(phase2Batch27Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch27Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch27Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch27Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch27Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 27 contract: PASS (${Object.keys(phase2Batch27Subjects).length} direct records)`);

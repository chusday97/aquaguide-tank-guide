import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch24Authority, phase2Batch24Knowledge, phase2Batch24Subjects } from '../src/modules/knowledge/phase2Batch24Authority';

for (const id of Object.keys(phase2Batch24Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch24Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch24Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch24Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch24Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 24 contract: PASS (${Object.keys(phase2Batch24Subjects).length} direct records)`);

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch10Authority, phase2Batch10Knowledge, phase2Batch10Subjects } from '../src/modules/knowledge/phase2Batch10Authority';
for (const id of Object.keys(phase2Batch10Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch10Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch10Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch10Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch10Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 10 contract: PASS (${Object.keys(phase2Batch10Subjects).length} direct records)`);

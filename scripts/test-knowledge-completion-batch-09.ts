import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch09Authority, phase2Batch09Knowledge, phase2Batch09Subjects } from '../src/modules/knowledge/phase2Batch09Authority';
for (const id of Object.keys(phase2Batch09Subjects)) {
  assert.ok(fishData.some(fish => fish.id === id));
  assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch09Knowledge[id]);
  assert.equal(getReviewedCompatibilityProfile(id), undefined);
  assert.equal(phase2Batch09Knowledge[id].environment?.evidence.confidence, 'unknown');
  assert.ok(phase2Batch09Authority[id].feeding.citationIds.length);
  assert.ok(phase2Batch09Authority[id].care.citationIds.length);
}
console.log(`knowledge completion batch 09 contract: PASS (${Object.keys(phase2Batch09Subjects).length} direct records)`);

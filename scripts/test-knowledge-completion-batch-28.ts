import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch28Authority, phase2Batch28Knowledge, phase2Batch28Subjects } from '../src/modules/knowledge/phase2Batch28Authority';
for (const id of Object.keys(phase2Batch28Subjects)) { assert.ok(fishData.some(fish => fish.id === id)); assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch28Knowledge[id]); assert.equal(getReviewedCompatibilityProfile(id), undefined); assert.equal(phase2Batch28Knowledge[id].environment?.evidence.confidence, 'unknown'); assert.ok(phase2Batch28Authority[id].feeding.citationIds.length); assert.ok(phase2Batch28Authority[id].care.citationIds.length); }
console.log(`knowledge completion batch 28 contract: PASS (${Object.keys(phase2Batch28Subjects).length} direct records)`);

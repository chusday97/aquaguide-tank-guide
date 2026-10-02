import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch30Authority, phase2Batch30Knowledge, phase2Batch30Subjects } from '../src/modules/knowledge/phase2Batch30Authority';
for (const id of Object.keys(phase2Batch30Subjects)) { assert.ok(fishData.some(fish => fish.id === id)); assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch30Knowledge[id]); assert.equal(getReviewedCompatibilityProfile(id), undefined); assert.equal(phase2Batch30Knowledge[id].environment?.evidence.confidence, 'unknown'); assert.ok(phase2Batch30Authority[id].feeding.citationIds.length); assert.ok(phase2Batch30Authority[id].care.citationIds.length); }
console.log(`knowledge completion batch 30 contract: PASS (${Object.keys(phase2Batch30Subjects).length} direct records)`);

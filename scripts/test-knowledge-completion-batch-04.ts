import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { phase2Batch04Authority, phase2Batch04Knowledge, phase2Batch04Subjects } from '../src/modules/knowledge/phase2Batch04Authority';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
for (const id of Object.keys(phase2Batch04Subjects)) { assert.ok(fishData.some(item => item.id === id)); assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch04Knowledge[id]); assert.equal(getReviewedCompatibilityProfile(id), undefined); for (const section of [phase2Batch04Knowledge[id].environment, phase2Batch04Knowledge[id].socialBehavior, phase2Batch04Knowledge[id].spaceAndGrowth]) { assert.equal(section?.evidence.reviewStatus, 'reviewed'); assert.equal(section?.evidence.confidence, 'unknown'); assert.ok(section?.evidence.sourceIds.length); } for (const field of ['feeding', 'care'] as const) assert.equal(phase2Batch04Authority[id][field]?.status, 'reviewed_unknown'); }
console.log(`knowledge completion batch 04 contract: PASS (${Object.keys(phase2Batch04Subjects).length} direct records)`);

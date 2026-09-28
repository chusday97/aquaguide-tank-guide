import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { phase2Batch05Authority, phase2Batch05Knowledge, phase2Batch05Subjects } from '../src/modules/knowledge/phase2Batch05Authority';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
for (const id of Object.keys(phase2Batch05Subjects)) { assert.ok(fishData.some(f => f.id === id)); assert.equal(getReviewedSpeciesKnowledge(id), phase2Batch05Knowledge[id]); assert.equal(getReviewedCompatibilityProfile(id), undefined); for (const section of [phase2Batch05Knowledge[id].environment, phase2Batch05Knowledge[id].socialBehavior, phase2Batch05Knowledge[id].spaceAndGrowth]) { assert.equal(section?.evidence.reviewStatus, 'reviewed'); assert.equal(section?.evidence.confidence, 'unknown'); assert.ok(section?.evidence.sourceIds.length); } assert.equal(phase2Batch05Authority[id].feeding?.status, 'reviewed_unknown'); assert.equal(phase2Batch05Authority[id].care?.status, 'reviewed_unknown'); }
console.log(`knowledge completion batch 05 contract: PASS (${Object.keys(phase2Batch05Subjects).length} direct records)`);

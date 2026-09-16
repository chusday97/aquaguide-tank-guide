import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch49Authority } from '../src/modules/knowledge/phase2Batch49Authority';

assert.ok(fishData.some(fish => fish.id === 'sp_0455'));
assert.ok(getReviewedSpeciesKnowledge('sp_0455'));
assert.equal(phase2Batch49Authority.sp_0455.environment.status, 'reviewed_unknown');
assert.ok(phase2Batch49Authority.sp_0455.environment.citationIds.length);
console.log('knowledge completion batch 49 contract: PASS (1 direct record)');

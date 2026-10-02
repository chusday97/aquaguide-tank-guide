import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { phase2Batch48Authority } from '../src/modules/knowledge/phase2Batch48Authority';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';

const knowledge = getReviewedSpeciesKnowledge('sp_0431');
assert.ok(knowledge, 'Neon tetra must have direct reviewed Species Knowledge');
assert.equal(knowledge.environment?.waterType, 'freshwater');
assert.deepEqual(knowledge.environment?.temperatureRangeC, { min: 20, max: 26 });
assert.deepEqual(knowledge.environment?.phRange, { min: 5, max: 7 });
assert.deepEqual(knowledge.environment?.hardnessDgh, { min: 1, max: 2 });
assert.equal(knowledge.environment?.evidence.reviewStatus, 'reviewed');
assert.notEqual(knowledge.environment?.evidence.confidence, 'unknown');

const authority = phase2Batch48Authority.sp_0431?.environment;
assert.equal(authority?.status, 'reviewed_supported');
assert.ok(authority?.citationIds.includes('batch33-fishbase-paracheirodon-innesi'));

const sources = resolveKnowledgeSources(knowledge.environment?.evidence.sourceIds || []);
assert.ok(sources.some(source => source.publisher === 'FishBase'));

console.log('Neon tetra environment authority passed: freshwater, 20-26C, pH 5-7, dH 1-2');

import assert from 'node:assert/strict';
import { getKnowledgeEvidenceCeiling, knowledgeEvidenceCeilings } from '../src/data/knowledgeEvidenceCeilings';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

assert.deepEqual(Object.keys(knowledgeEvidenceCeilings), ['sp_0258']);

const ceiling = getKnowledgeEvidenceCeiling('sp_0258');
assert.equal(ceiling?.field, 'social');
assert.equal(ceiling?.code, 'variant_social_not_established');
assert.deepEqual(ceiling?.sourceIds, [
  'sciadv-betta-phenotypic-diversity',
  'ygcen-betta-behavior-variation-2022',
]);

const knowledge = getReviewedSpeciesKnowledge('sp_0258');
assert.ok(knowledge?.socialBehavior);
assert.equal(knowledge?.socialBehavior?.mode, 'unknown');
assert.equal(knowledge?.socialBehavior?.evidence.reviewStatus, 'reviewed');
assert.equal(knowledge?.socialBehavior?.evidence.confidence, 'unknown');
assert.deepEqual(knowledge?.socialBehavior?.evidence.sourceIds, ceiling?.sourceIds);
assert.match(knowledge?.socialBehavior?.evidence.note || '', /evidence ceiling/i);

console.log('knowledge evidence ceiling passed: Koi Betta social remains reviewed fail-closed after targeted research');

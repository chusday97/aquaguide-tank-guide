import assert from 'node:assert/strict';
import { getKnowledgeEvidenceCeiling, knowledgeEvidenceCeilings } from '../src/data/knowledgeEvidenceCeilings';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

assert.deepEqual(Object.keys(knowledgeEvidenceCeilings).sort(), ['sp_0224', 'sp_0258']);

const koiSocial = getKnowledgeEvidenceCeiling('sp_0258', 'social');
assert.equal(koiSocial?.code, 'variant_social_not_established');
assert.deepEqual(koiSocial?.sourceIds, [
  'sciadv-betta-phenotypic-diversity',
  'ygcen-betta-behavior-variation-2022',
]);
assert.equal(getKnowledgeEvidenceCeiling('sp_0258', 'feeding')?.code, 'variant_husbandry_not_established');
assert.equal(getKnowledgeEvidenceCeiling('sp_0258', 'care')?.code, 'variant_husbandry_not_established');
for (const field of ['feeding', 'social', 'care'] as const) {
  assert.equal(getKnowledgeEvidenceCeiling('sp_0224', field)?.code, 'variant_husbandry_not_established');
}

for (const ceilings of Object.values(knowledgeEvidenceCeilings)) {
  for (const ceiling of ceilings) {
    assert.ok(ceiling.note.length > 40);
    assert.ok(ceiling.sourceIds.length > 0);
    for (const sourceId of ceiling.sourceIds) {
      assert.equal(resolveKnowledgeSources([sourceId]).length, 1, `${ceiling.speciesId}/${ceiling.field} ceiling source ${sourceId} must be registered`);
    }
  }
}

const knowledge = getReviewedSpeciesKnowledge('sp_0258');
assert.ok(knowledge?.socialBehavior);
assert.equal(knowledge?.socialBehavior?.mode, 'unknown');
assert.equal(knowledge?.socialBehavior?.evidence.reviewStatus, 'reviewed');
assert.equal(knowledge?.socialBehavior?.evidence.confidence, 'unknown');
assert.deepEqual(knowledge?.socialBehavior?.evidence.sourceIds, koiSocial?.sourceIds);
assert.match(knowledge?.socialBehavior?.evidence.note || '', /evidence ceiling/i);

console.log('knowledge evidence ceilings passed: ornamental-variant fields remain explicitly fail-closed after targeted research');

import assert from 'node:assert/strict';
import { getKnowledgeEvidenceCeiling, knowledgeEvidenceCeilings } from '../src/data/knowledgeEvidenceCeilings';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

assert.deepEqual(Object.keys(knowledgeEvidenceCeilings).sort(), ['sp_0025','sp_0037','sp_0039','sp_0040','sp_0041','sp_0046','sp_0047','sp_0060','sp_0061','sp_0106','sp_0107','sp_0111','sp_0113','sp_0128','sp_0132','sp_0134','sp_0135','sp_0136','sp_0137','sp_0186','sp_0224','sp_0258','sp_0362','sp_0458','sp_0467','sp_0470','sp_0471','sp_0472','sp_0473']);

const yellowCatfishSocial = getKnowledgeEvidenceCeiling('sp_0047', 'social');
assert.equal(yellowCatfishSocial?.code, 'species_social_not_established');
assert.deepEqual(yellowCatfishSocial?.sourceIds, [
  'batch18-fishbase-tachysurus-fulvidraco',
  'fws-tachysurus-fulvidraco-erss',
]);
assert.match(yellowCatfishSocial?.note || '', /prey-size threshold|community\/social mode/i);
const yellowCatfishKnowledge = getReviewedSpeciesKnowledge('sp_0047');
assert.equal(yellowCatfishKnowledge?.socialBehavior?.mode, 'unknown');
assert.equal(yellowCatfishKnowledge?.socialBehavior?.evidence.reviewStatus, 'reviewed');
assert.equal(yellowCatfishKnowledge?.socialBehavior?.evidence.confidence, 'unknown');

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
    assert.equal(ceiling.researchDisposition, 'terminal_unknown_hold');
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

console.log('knowledge evidence ceilings passed: variant and species-specific terminal holds remain explicitly fail-closed after targeted research');

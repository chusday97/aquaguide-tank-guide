import assert from 'node:assert/strict';
import { getKnowledgeEvidenceCeiling, knowledgeEvidenceCeilings } from '../src/data/knowledgeEvidenceCeilings';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';

assert.deepEqual(Object.keys(knowledgeEvidenceCeilings).sort(), ['sp_0025','sp_0037','sp_0039','sp_0040','sp_0041','sp_0046','sp_0047','sp_0060','sp_0061','sp_0063','sp_0064','sp_0106','sp_0107','sp_0111','sp_0112','sp_0113','sp_0115','sp_0128','sp_0132','sp_0134','sp_0135','sp_0136','sp_0137','sp_0147','sp_0148','sp_0149','sp_0150','sp_0152','sp_0153','sp_0161','sp_0168','sp_0169','sp_0171','sp_0172','sp_0180','sp_0186','sp_0196','sp_0203','sp_0209','sp_0213','sp_0215','sp_0222','sp_0223','sp_0224','sp_0233','sp_0237','sp_0252','sp_0253','sp_0254','sp_0258','sp_0259','sp_0260','sp_0261','sp_0262','sp_0267','sp_0289','sp_0290','sp_0291','sp_0292','sp_0293','sp_0295','sp_0348','sp_0349','sp_0350','sp_0351','sp_0362','sp_0363','sp_0364','sp_0385','sp_0386','sp_0387','sp_0389','sp_0390','sp_0391','sp_0395','sp_0406','sp_0413','sp_0419','sp_0426','sp_0458','sp_0467','sp_0470','sp_0471','sp_0472','sp_0473']);

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

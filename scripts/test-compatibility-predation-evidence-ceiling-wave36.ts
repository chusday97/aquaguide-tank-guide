import assert from 'node:assert/strict';
import { buildReviewedCompatibilityProfileFromCatalogFields } from '../src/data/compatibilityEvidence';
import {
  compatibilityPredationEvidenceCeilingsWave36,
  getKnowledgeEvidenceCeiling,
} from '../src/data/knowledgeEvidenceCeilings';
import { resolveKnowledgeSources } from '../src/modules/knowledge/knowledgeSources';
import { buildCompatibilityCoreFieldCoverage } from '../src/services/compatibility/compatibility-field-coverage.service';

const expected = new Map<string, string>([
  ['sp_0061', 'batch31-fishbase-semaprochilodus-insignis'],
  ['sp_0137', 'batch32-fishbase-semaprochilodus-insignis'],
  ['sp_0107', 'batch31-fishbase-semaprochilodus-taeniurus'],
  ['sp_0132', 'batch32-fishbase-parambassis-ranga'],
  ['sp_0046', 'batch26-fishbase-aphyocypris-chinensis'],
  ['sp_0471', 'batch38-fishbase-moenkhausia-pittieri'],
  ['sp_0472', 'batch38-fishbase-thayeria-boehlkei'],
]);

assert.equal(compatibilityPredationEvidenceCeilingsWave36.length, expected.size);

const coverage = buildCompatibilityCoreFieldCoverage();
for (const [speciesId, sourceId] of expected) {
  const ceiling = getKnowledgeEvidenceCeiling(speciesId, 'predation');
  assert.equal(ceiling?.code, 'species_fish_predation_not_established');
  assert.equal(ceiling?.researchDisposition, 'terminal_unknown_hold');
  assert.ok(ceiling?.sourceIds.includes(sourceId), `${speciesId} must retain exact-taxon reviewed source provenance`);
  assert.equal(resolveKnowledgeSources(ceiling?.sourceIds ?? []).length, ceiling?.sourceIds.length, `${speciesId} ceiling sources must resolve through the reviewed knowledge source registry`);
  assert.ok(getKnowledgeEvidenceCeiling(speciesId, 'social'), `${speciesId} historical social ceiling must remain intact`);

  const row = coverage.rows.find(item => item.speciesId === speciesId);
  assert.equal(row?.fields.predation.status, 'reviewed_unknown');
  assert.equal(row?.fields.predation.disposition, 'terminal_hold');
  assert.equal(row?.fields.predation.authoritySource, 'evidence_ceiling');
  assert.equal(row?.fields.predation.reasonCode, 'species_fish_predation_not_established');
  assert.equal(coverage.backlog.some(item => item.speciesId === speciesId && item.field === 'predation'), false);
  assert.equal(row?.genericOnboardingReady, false);
  assert.equal(buildReviewedCompatibilityProfileFromCatalogFields(speciesId), undefined, `${speciesId} evidence ceiling must never fabricate an 8/8 generic profile`);
}

const diamond = getKnowledgeEvidenceCeiling('sp_0471', 'predation');
const penguin = getKnowledgeEvidenceCeiling('sp_0472', 'predation');
assert.match(diamond?.note ?? '', /egg|fish_fry|prey vocabulary/i);
assert.match(penguin?.note ?? '', /egg|fish_fry|prey scope/i);
assert.ok(compatibilityPredationEvidenceCeilingsWave36.every(item => !('targets' in item)), 'Wave36 evidence ceilings must not contain any predation target payload');

console.log('Compatibility predation evidence-ceiling Wave36 PASS: seven high-impact exact catalog objects leave repetitive research without being declared safe; fish/fry prey scope remains terminal-unknown until materially new direct evidence appears.');

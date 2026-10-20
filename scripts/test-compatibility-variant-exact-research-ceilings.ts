import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  compatibilityVariantExactResearchCeilings,
  getCompatibilityVariantExactResearchCeiling,
} from '../src/data/compatibilityVariantExactResearchCeilings';

const triagePath = 'evaluation/product/compatibility-variant-exact-evidence-triage.v1.json';
const triage = JSON.parse(readFileSync(resolve(process.cwd(), triagePath), 'utf8')) as {
  objects?: Array<{
    speciesId?: string;
    status?: string;
    unresolvedFields?: string[];
    researchRuns?: Array<{ discoveryStatus?: string }>;
  }>;
};

const ceilingObjects = (triage.objects || [])
  .filter(object => object.status === 'discovery_evidence_ceiling')
  .sort((a, b) => String(a.speciesId).localeCompare(String(b.speciesId)));

assert.equal(compatibilityVariantExactResearchCeilings.length, 5);
assert.equal(compatibilityVariantExactResearchCeilings.reduce((sum, row) => sum + row.fields.length, 0), 6);
assert.deepEqual(
  compatibilityVariantExactResearchCeilings.map(row => [row.speciesId, [...row.fields].sort()]),
  [
    ['sp_0066', ['territoriality']],
    ['sp_0068', ['territoriality']],
    ['sp_0144', ['territoriality']],
    ['sp_0155', ['predation', 'territoriality']],
    ['sp_0361', ['territoriality']],
  ],
);

assert.equal(ceilingObjects.length, compatibilityVariantExactResearchCeilings.length);
for (const row of compatibilityVariantExactResearchCeilings) {
  assert.equal(row.status, 'exact_object_evidence_ceiling');
  assert.equal(row.reasonCode, 'variant_exact_object_research_exhausted');
  assert.equal(row.sourceArtifact, triagePath);
  assert.ok(row.researchRounds >= 2, `${row.speciesId} ceiling requires two independent empty discovery rounds`);
  const triageObject = ceilingObjects.find(object => object.speciesId === row.speciesId);
  assert.ok(triageObject, `${row.speciesId} ceiling must come from current exact-evidence triage`);
  assert.deepEqual([...row.fields].sort(), [...(triageObject.unresolvedFields || [])].sort());
  const emptyRounds = (triageObject.researchRuns || []).filter(run => run.discoveryStatus === 'discovery_empty').length;
  assert.equal(row.researchRounds, emptyRounds);
  for (const field of row.fields) {
    assert.equal(getCompatibilityVariantExactResearchCeiling(row.speciesId, field), row);
  }
}
assert.equal(getCompatibilityVariantExactResearchCeiling('sp_0066', 'predation'), undefined);
assert.equal(getCompatibilityVariantExactResearchCeiling('sp_0155', 'water'), undefined);
assert.equal(getCompatibilityVariantExactResearchCeiling('sp_0001', 'territoriality'), undefined);

console.log('Compatibility exact-object research ceilings PASS: 5 objects / 6 fields are explicitly fail-closed after two empty discovery rounds.');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  compatibilityFieldResearchCeilings,
  getCompatibilityFieldResearchCeiling,
} from '../src/data/compatibilityFieldResearchCeilings';

const terminalArtifact = 'evaluation/product/compatibility-field-research-ceilings-terminal.v1.json';
const snapshot = JSON.parse(readFileSync(terminalArtifact, 'utf8')) as {
  kind: string;
  promotionAllowed: boolean;
  writesAuthority: boolean;
  summary: { speciesCount: number; fieldCount: number };
  rows: Array<{
    speciesId: string;
    fields: string[];
    reasonCode: string;
    researchRounds: number;
    attemptedUrlCount: number;
    attemptedRouteIds: string[];
  }>;
};
const activeQueue = JSON.parse(readFileSync('evaluation/product/compatibility-research-review-queue.v1.json', 'utf8')) as {
  items: Array<{ queue: string }>;
};

assert.equal(snapshot.kind, 'compatibility_field_research_ceiling_terminal_snapshot');
assert.equal(snapshot.promotionAllowed, false);
assert.equal(snapshot.writesAuthority, false);
assert.equal(snapshot.summary.speciesCount, 13);
assert.equal(snapshot.summary.fieldCount, 23);
assert.equal(snapshot.rows.length, 13);
assert.equal(snapshot.rows.reduce((sum, row) => sum + row.fields.length, 0), 23);
assert.equal(compatibilityFieldResearchCeilings.length, 13);
assert.equal(compatibilityFieldResearchCeilings.reduce((sum, row) => sum + row.fields.length, 0), 23);

for (const row of snapshot.rows) {
  assert.ok(row.researchRounds >= 2);
  assert.ok(row.attemptedUrlCount > 0);
  assert.ok(row.attemptedRouteIds.length > 0);
  assert.equal(row.reasonCode, 'compatibility_field_source_strategy_exhausted');
  for (const field of row.fields) {
    const ceiling = getCompatibilityFieldResearchCeiling(row.speciesId, field);
    assert.ok(ceiling, `${row.speciesId}:${field} must have a persisted research ceiling`);
    assert.equal(ceiling?.reasonCode, 'compatibility_field_source_strategy_exhausted');
    assert.equal(ceiling?.sourceArtifact, terminalArtifact);
  }
}

assert.equal(getCompatibilityFieldResearchCeiling('sp_0046', 'temperature'), null, 'sp_0046 temperature ceiling must retire when new exact-taxon authority is promoted');
assert.ok(getCompatibilityFieldResearchCeiling('sp_0046', 'ph'));
assert.ok(getCompatibilityFieldResearchCeiling('sp_0046', 'tank_size'));

const activeEvidenceCeilings = activeQueue.items.filter(item => item.queue === 'evidence_ceiling_review');
assert.equal(
  activeEvidenceCeilings.length,
  0,
  'terminal research ceilings must survive after exhausted fields leave the active completion queue',
);

assert.equal(getCompatibilityFieldResearchCeiling('sp_0452', 'ph')?.researchRounds, 3);
assert.equal(getCompatibilityFieldResearchCeiling('sp_0452', 'predation')?.researchRounds, 3);
assert.equal(getCompatibilityFieldResearchCeiling('sp_0452', 'water'), null);

console.log('Compatibility field research ceilings PASS: stable terminal snapshot preserves 13 exact taxa / 23 exhausted fields after retiring sp_0046 temperature, while the active completion queue remains drained.');

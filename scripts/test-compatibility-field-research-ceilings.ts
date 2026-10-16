import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  compatibilityFieldResearchCeilings,
  getCompatibilityFieldResearchCeiling,
} from '../src/data/compatibilityFieldResearchCeilings';

const queue = JSON.parse(readFileSync('evaluation/product/compatibility-research-review-queue.v1.json', 'utf8')) as {
  items: Array<{
    queue: string;
    unresolvedFields: string[];
    reasonCodes: string[];
    identity?: { status?: string };
    researchHistory?: { rounds?: number };
    catalogObjects?: Array<{ speciesId?: string; isVariant?: boolean }>;
  }>;
};

const eligible = queue.items.filter(item => item.queue === 'evidence_ceiling_review');
assert.equal(eligible.length, 13);
assert.equal(compatibilityFieldResearchCeilings.length, 13);
assert.equal(compatibilityFieldResearchCeilings.reduce((sum, row) => sum + row.fields.length, 0), 24);

for (const item of eligible) {
  assert.equal(item.identity?.status, 'verified');
  assert.ok((item.researchHistory?.rounds || 0) >= 2);
  assert.ok(item.reasonCodes.includes('generic_source_strategy_exhausted'));
  assert.ok(item.reasonCodes.includes('specialized_source_routes_exhausted'));
  for (const object of item.catalogObjects || []) {
    if (!object.speciesId || object.isVariant) continue;
    for (const field of item.unresolvedFields) {
      const ceiling = getCompatibilityFieldResearchCeiling(object.speciesId, field);
      assert.ok(ceiling, `${object.speciesId}:${field} must have a persisted research ceiling`);
      assert.equal(ceiling?.reasonCode, 'compatibility_field_source_strategy_exhausted');
    }
  }
}

assert.equal(getCompatibilityFieldResearchCeiling('sp_0452', 'ph')?.researchRounds, 3);
assert.equal(getCompatibilityFieldResearchCeiling('sp_0452', 'predation')?.researchRounds, 3);
assert.equal(getCompatibilityFieldResearchCeiling('sp_0452', 'water'), null);

console.log('Compatibility field research ceilings PASS: 13 exact taxa / 24 exhausted fields are terminalized for research planning only.');

import assert from 'node:assert/strict';
import { evaluateCompatibility, type DomainSpeciesFact } from '../packages/domain-rules/src';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';

const base = (id: string, waterType: DomainSpeciesFact['waterType'], waterTypes?: DomainSpeciesFact['waterTypes']): DomainSpeciesFact => ({
  id, waterType, waterTypes, reviewed: true,
  temperatureMinC: 20, temperatureMaxC: 28,
  behaviorTraits: [], predationTargets: [],
});
const flexible = base('flex', 'unknown', ['freshwater', 'brackish']);
const freshwater = base('fresh', 'freshwater');
const brackish = base('brackish', 'brackish');
const saltwater = base('salt', 'saltwater');

for (const existing of [freshwater, brackish]) {
  const result = evaluateCompatibility({ intent: 'planned_addition', existingSpecies: [existing], candidateSpecies: flexible, catalogVersion: 'test' });
  assert.equal(result.ruleCodes.includes('water_type_conflict'), false);
  assert.equal(result.ruleCodes.includes('water_type_unknown'), false);
}
const pairSalt = evaluateCompatibility({ intent: 'planned_addition', existingSpecies: [saltwater], candidateSpecies: flexible, catalogVersion: 'test' });
assert.ok(pairSalt.ruleCodes.includes('water_type_conflict'));

for (const tankWaterType of ['freshwater', 'brackish'] as const) {
  const result = evaluateCompatibility({
    intent: 'planned_addition',
    tank: { waterType: tankWaterType, volumeLiters: 100, targetTemperatureC: 24 },
    existingSpecies: [], candidateSpecies: flexible, catalogVersion: 'test',
  });
  assert.equal(result.ruleCodes.includes('candidate_water_type_missing'), false);
  assert.equal(result.ruleCodes.includes('candidate_tank_water_type_conflict'), false);
}
const saltTank = evaluateCompatibility({
  intent: 'planned_addition',
  tank: { waterType: 'saltwater', volumeLiters: 100, targetTemperatureC: 24 },
  existingSpecies: [], candidateSpecies: flexible, catalogVersion: 'test',
});
assert.ok(saltTank.ruleCodes.includes('candidate_tank_water_type_conflict'));

const legacyConflict = evaluateCompatibility({ intent: 'planned_addition', existingSpecies: [freshwater], candidateSpecies: saltwater, catalogVersion: 'test' });
assert.ok(legacyConflict.ruleCodes.includes('water_type_conflict'));

const guppy = getReviewedSpeciesKnowledge('sp_0436');
assert.deepEqual(guppy?.environment?.waterTypes, ['freshwater', 'brackish']);
assert.equal(guppy?.environment?.waterType, 'unknown');
assert.deepEqual(getReviewedCompatibilityProfile('sp_0436')?.waterTypes, ['freshwater', 'brackish']);

const bitterling = getReviewedSpeciesKnowledge('sp_0475');
assert.deepEqual(bitterling?.environment?.waterTypes, ['freshwater', 'brackish']);
assert.equal(bitterling?.environment?.waterType, 'unknown');

console.log('Multi-water authority passed');

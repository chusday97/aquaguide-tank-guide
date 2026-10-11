import assert from 'node:assert/strict';
import { evaluateCompatibility, type DomainSpeciesFact } from '../packages/domain-rules/src';

const barca: DomainSpeciesFact = {
  id: 'sp_0050',
  waterType: 'freshwater',
  temperatureMinC: 10,
  temperatureMaxC: 28,
  phMin: 6,
  phMax: 8,
  reviewed: true,
  behaviorTraits: ['predatory', 'species_tank_required', 'intraspecific_aggression'],
  predationTargets: ['small_fish'],
  lifeType: 'fish',
  size: 'Large',
};
const largeConspecific = { ...barca };
const largeOther: DomainSpeciesFact = {
  id: 'large-other', waterType: 'freshwater', temperatureMinC: 20, temperatureMaxC: 26,
  phMin: 6.5, phMax: 7.5, reviewed: true, behaviorTraits: [], predationTargets: [],
  lifeType: 'fish', size: 'Large',
};
const same = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [largeConspecific], candidateSpecies: barca, catalogVersion: 'test' });
assert.equal(same.ruleCodes.includes('species_tank_required'), false, 'species-tank authority must not ban same-species pairing');
const hetero = evaluateCompatibility({ intent: 'record_existing', existingSpecies: [largeOther], candidateSpecies: barca, catalogVersion: 'test' });
assert.equal(hetero.status, 'not_recommended');
assert.ok(hetero.ruleCodes.includes('species_tank_required'));
console.log('species-tank-required contract passed: heterospecific blocked, conspecific pair not falsely treated as solitary');

import type { Fish } from '../src/types';
import { evaluateTankCompatibility } from '../src/lib/tankCompatibilityEngine';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const makeFish = (overrides: Partial<Fish>): Fish => ({
  id: 'test_fish',
  name: '测试鱼',
  scientificName: 'Testus aquatica',
  category: '淡水鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '淡水测试物种',
  diet: 'Omnivore',
  tankSize: '60L',
  temperament: 'Peaceful',
  size: 'Small',
  ...overrides,
});

const freshwater = makeFish({ id: 'test_freshwater', name: '淡水测试鱼' });
const freshwaterPeer = makeFish({ id: 'test_freshwater_peer', name: '淡水测试鱼二' });
const saltwater = makeFish({
  id: 'test_saltwater',
  name: '海水测试鱼',
  category: '海水鱼',
  scientificName: 'Marinus testus',
  description: 'marine saltwater test species',
});
const brackish = makeFish({
  id: 'test_brackish',
  name: '汽水测试鱼',
  category: '汽水鱼',
  scientificName: 'Brackish testus',
  description: 'brackish test species',
});
const unknown = makeFish({
  id: 'test_unknown',
  name: '未知测试物种',
  category: '',
  scientificName: 'Unclassified testus',
  description: 'unclassified test species',
});

const compare = (existing: Fish, candidate: Fish) => evaluateTankCompatibility({
  scope: 'species_only',
  existingSpecies: [existing],
  candidateSpecies: candidate,
});

const freshwaterPair = compare(freshwater, freshwaterPeer);
assert(
  freshwaterPair.passedRules.some(rule => rule.code === 'species_water_type_match'),
  'freshwater/freshwater pair must record a confirmed water-type match',
);

const freshSalt = compare(freshwater, saltwater);
assert(
  freshSalt.blockingRules.some(rule => rule.code === 'species_water_type_conflict'),
  'freshwater/saltwater pair must be blocked by water-type conflict',
);

for (const candidate of [brackish, unknown]) {
  const result = compare(freshwater, candidate);
  assert(
    !result.passedRules.some(rule => rule.code === 'species_water_type_match'),
    `freshwater/${candidate.id} must not be reported as a confirmed water-type match`,
  );
  assert(
    result.missingData.some(rule => rule.code === 'species_water_type_uncertain'),
    `freshwater/${candidate.id} must request water-type certainty`,
  );
  assert(
    result.status === 'insufficient_data',
    `freshwater/${candidate.id} must remain insufficient_data, got ${result.status}`,
  );
}

console.log(JSON.stringify({
  ok: true,
  freshwaterPairWaterMatch: true,
  freshSaltBlocked: true,
  uncertainPairs: ['brackish', 'unknown'],
}, null, 2));

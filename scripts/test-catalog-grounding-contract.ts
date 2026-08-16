import assert from 'node:assert/strict';
import type { Fish } from '../src/types';
import {
  groundRecommendationSpeciesIds,
  isFormalRecommendationGrounded,
  resolveCatalogSpecies,
} from '../src/modules/recommendation/catalog-grounding';

const makeSpecies = (overrides: Partial<Fish>): Fish => ({
  id: 'species-a',
  name: '测试鱼 A',
  scientificName: 'Testus aquatica',
  category: '淡水鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-26°C',
  phLevel: '6.5-7.5',
  waterChangeCycle: 7,
  description: '用于 catalog grounding contract 的测试物种。',
  diet: 'Omnivore',
  tankSize: '60L',
  temperament: 'Peaceful',
  size: 'Small',
  housingMode: '适合混养',
  ...overrides,
});

const canonicalA = makeSpecies({ id: 'canonical-a', name: '测试鱼 A' });
const canonicalB = makeSpecies({
  id: 'canonical-b',
  name: '测试鱼 B',
  scientificName: 'Testus communis',
});
const canonicalC = makeSpecies({
  id: 'canonical-c',
  name: '测试鱼 C',
  scientificName: 'Testus communis',
});
const speciesPool = [canonicalA, canonicalB, canonicalC];

const byId = resolveCatalogSpecies({ speciesId: 'canonical-a' }, speciesPool);
assert.equal(byId.status, 'verified');
assert.equal(byId.speciesId, 'canonical-a');
assert.equal(byId.matchedBy, 'species_id');

const generatedUnknownId = resolveCatalogSpecies({
  speciesId: 'llm-invented-species',
  name: canonicalA.name,
}, speciesPool);
assert.equal(
  generatedUnknownId.status,
  'unresolved',
  'an explicit unknown speciesId must not silently fall back to a similar catalog name',
);

const uniqueName = resolveCatalogSpecies({ name: '  测试鱼 A  ' }, speciesPool);
assert.equal(uniqueName.status, 'verified');
assert.equal(uniqueName.speciesId, 'canonical-a');
assert.equal(uniqueName.matchedBy, 'name');

const ambiguousScientificName = resolveCatalogSpecies(
  { scientificName: 'Testus communis' },
  speciesPool,
);
assert.equal(
  ambiguousScientificName.status,
  'ambiguous',
  'scientific-name collisions must stay ambiguous instead of choosing the first catalog row',
);
assert.deepEqual(
  new Set(ambiguousScientificName.candidateSpeciesIds),
  new Set(['canonical-b', 'canonical-c']),
);

const missingName = resolveCatalogSpecies({ name: '物种库里不存在的鱼' }, speciesPool);
assert.equal(missingName.status, 'unresolved');

const formalRecommendations = groundRecommendationSpeciesIds(
  ['canonical-a', 'llm-invented-species', 'canonical-a', 'canonical-b'],
  speciesPool,
);
assert.deepEqual(formalRecommendations.verifiedSpeciesIds, ['canonical-a', 'canonical-b']);
assert.deepEqual(formalRecommendations.unresolvedSpeciesIds, ['llm-invented-species']);
assert.equal(isFormalRecommendationGrounded('canonical-a', speciesPool), true);
assert.equal(isFormalRecommendationGrounded('llm-invented-species', speciesPool), false);

console.log(JSON.stringify({
  ok: true,
  verified: formalRecommendations.verifiedSpeciesIds,
  unresolved: formalRecommendations.unresolvedSpeciesIds,
  ambiguous: ambiguousScientificName.candidateSpeciesIds,
}, null, 2));

import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import type { Aquarium } from '../src/types';
import { getLifeType } from '../src/modules/species/species.service';
import { speciesIdAliases } from '../src/modules/species/speciesAliases';
import { buildTankDecisionContext } from '../src/lib/tankDecisionContext';
import { buildRelocationDestinationContext } from '../src/lib/relocationDestinationContext';
import { recommendReplacementSpecies } from '../src/lib/replacementRecommendationEngine';

const aliasEntry = Object.entries(speciesIdAliases).find(([, canonicalId]) => {
  const species = fishData.find(item => item.id === canonicalId);
  if (!species) return false;
  const lifeType = getLifeType(species);
  return lifeType !== 'plant' && lifeType !== 'hardscape';
});
assert.ok(aliasEntry, 'expected at least one animal legacy species alias');
const [legacyAliasId, canonicalId] = aliasEntry;
const canonicalSpecies = fishData.find(item => item.id === canonicalId);
assert.ok(canonicalSpecies);

const plant = fishData.find(item => getLifeType(item) === 'plant');
assert.ok(plant, 'expected at least one plant fixture');

const aquarium: Aquarium = {
  id: 'decision-context-tank',
  name: 'Decision Context Tank',
  fishes: [
    { id: 'legacy-alias-record', fishId: legacyAliasId, quantity: 2, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'canonical-record', fishId: canonicalId, quantity: 3, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'plant-record', fishId: plant.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' },
    { id: 'unresolved-record', fishId: 'unresolved:real-animal', quantity: 2, entryDate: '2026-08-16T00:00:00.000Z' },
  ],
  dimensions: { length: '100', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
};

const context = buildTankDecisionContext({ aquarium, catalog: fishData });
const canonicalLivestock = context.resolvedLivestock.find(item => item.species.id === canonicalId);
assert.ok(canonicalLivestock, 'legacy alias and canonical record should resolve to one canonical livestock node');
assert.equal(canonicalLivestock.quantity, 5);
assert.deepEqual(canonicalLivestock.sourceSpeciesIds, [legacyAliasId, canonicalId].sort());
assert.deepEqual(canonicalLivestock.sourceRecordIds, ['canonical-record', 'legacy-alias-record']);
assert.deepEqual(context.unresolvedCurrentSpeciesIds, ['unresolved:real-animal']);
assert.ok(context.nonLivestockSpeciesIds.includes(plant.id), 'plants belong to tank facts but not livestock behavior context');
assert.ok(
  context.aliasMappings.some(item => item.sourceSpeciesId === legacyAliasId && item.canonicalSpeciesId === canonicalId),
  'legacy alias resolution must remain auditable',
);
assert.equal(
  context.resolvedLivestock.some(item => item.species.id === plant.id),
  false,
  'plant records must not enter animal compatibility/bioload context',
);

const destinationContext = buildRelocationDestinationContext(aquarium, fishData);
assert.deepEqual(destinationContext.unresolvedCurrentSpeciesIds, ['unresolved:real-animal']);
assert.equal(destinationContext.existingSpecies.some(item => item.species.id === canonicalId), true);
assert.equal(destinationContext.existingSpecies.some(item => item.species.id === plant.id), false);

const neon = fishData.find(item => item.id === 'sp_0431');
const cardinal = fishData.find(item => item.id === 'sp_0432');
assert.ok(neon && cardinal);
const plantOnlyTank: Aquarium = {
  ...aquarium,
  id: 'plant-only-replacement-tank',
  fishes: [{ id: 'only-plant', fishId: plant.id, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' }],
};
const replacement = recommendReplacementSpecies({
  aquarium: plantOnlyTank,
  rejectedSpecies: neon,
  catalog: [neon, cardinal, plant],
});
assert.deepEqual(replacement.unresolvedCurrentSpeciesIds, []);
assert.equal(replacement.status, 'alternatives_found');
assert.equal(
  replacement.needsConfirmation.some(item => item.species.id === cardinal.id),
  false,
  'a plant-only tank must not make a reviewed fish replacement look like stocked-animal behavior uncertainty',
);

const aliasOnlyTank: Aquarium = {
  ...aquarium,
  id: 'alias-only-tank',
  fishes: [{ id: 'legacy-only', fishId: legacyAliasId, quantity: 1, entryDate: '2026-08-16T00:00:00.000Z' }],
};
const aliasContext = buildTankDecisionContext({ aquarium: aliasOnlyTank, catalog: fishData });
assert.deepEqual(aliasContext.unresolvedCurrentSpeciesIds, [], 'known legacy alias must not be mislabeled unresolved');
assert.equal(aliasContext.resolvedLivestock[0]?.species.id, canonicalId);

console.log('tank decision context passed: aliases canonicalize before strict grounding, unresolved reality stays explicit, non-livestock is excluded from animal behavior context, and replacement/destination adapters share the same facts');

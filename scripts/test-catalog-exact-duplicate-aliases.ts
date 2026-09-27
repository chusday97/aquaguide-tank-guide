import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import {
  areExactCatalogDuplicateAliases,
  exactCatalogDuplicateGroups,
  getExactCatalogDuplicateCanonicalId,
} from '../src/data/catalogDuplicateAliases';
import { getLifeType } from '../src/modules/species/species.service';
import { deriveCurrentTankState } from '../src/services/aquarium/tank-state-evidence.service';
import type { Aquarium } from '../src/types';

const coreSignature = (fish: (typeof fishData)[number]) => JSON.stringify([
  fish.name,
  fish.scientificName,
  fish.category,
  fish.size,
  fish.temperament,
  fish.housingMode,
  fish.waterTemperature,
  fish.phLevel,
  fish.tankSize,
]);

const exactNonPlantGroups = new Map<string, string[]>();
for (const fish of fishData) {
  if (['plant', 'hardscape'].includes(getLifeType(fish))) continue;
  const key = coreSignature(fish);
  const ids = exactNonPlantGroups.get(key) || [];
  ids.push(fish.id);
  exactNonPlantGroups.set(key, ids);
}
const detected = [...exactNonPlantGroups.values()]
  .filter(ids => ids.length > 1)
  .map(ids => [...ids].sort())
  .sort((a, b) => a[0].localeCompare(b[0]));
const registered = exactCatalogDuplicateGroups
  .map(group => [...group.duplicateIds].sort())
  .sort((a, b) => a[0].localeCompare(b[0]));

assert.deepEqual(
  registered,
  detected,
  'every current non-plant exact catalogue duplicate group must be explicitly classified, and stale aliases must be removed',
);

for (const group of exactCatalogDuplicateGroups) {
  assert.ok(group.duplicateIds.includes(group.canonicalId));
  assert.ok(group.duplicateIds.length >= 2);
  assert.equal(new Set(group.duplicateIds).size, group.duplicateIds.length);
  const rows = group.duplicateIds.map(id => fishData.find(fish => fish.id === id));
  assert.ok(rows.every(Boolean), `missing catalogue row in duplicate group ${group.canonicalId}`);
  assert.equal(new Set(rows.map(row => coreSignature(row!))).size, 1, `duplicate group ${group.canonicalId} is no longer exact`);
  for (const id of group.duplicateIds) {
    assert.equal(getExactCatalogDuplicateCanonicalId(id), group.canonicalId);
    assert.equal(areExactCatalogDuplicateAliases(group.canonicalId, id), true);
  }
}

// Same scientific name is not enough to collapse distinct catalogue objects / trade forms.
for (const [left, right] of [
  ['sp_0048', 'sp_0131'], // 大刺鳅 / 刺鳅
  ['sp_0103', 'sp_0116'], // 金龙 / 青龙 trade forms
  ['sp_0114', 'sp_0469'], // 红莲灯 / 喷火灯 catalogue objects
] as const) {
  assert.equal(areExactCatalogDuplicateAliases(left, right), false);
  assert.notEqual(getExactCatalogDuplicateCanonicalId(left), getExactCatalogDuplicateCanonicalId(right));
}

const tank = (rows: Array<[string, number]>): Aquarium => ({
  id: 'duplicate-runtime',
  name: 'duplicate runtime audit',
  waterType: 'Freshwater',
  targetTemperature: '24',
  dimensions: { length: '150', width: '50', height: '50' },
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '普通灯' },
  fishes: rows.map(([fishId, quantity], index) => ({
    id: `stock-${index}`,
    fishId,
    quantity,
    entryDate: '2026-09-01T00:00:00.000Z',
  })),
  startedAt: '2026-08-01T00:00:00.000Z',
});

// Current-tank path: duplicate catalogue aliases combine quantity and cannot create a fake self-pair.
{
  const evidence = deriveCurrentTankState({
    aquarium: tank([['sp_0038', 2], ['sp_0130', 3], ['sp_0431', 6]]),
    speciesCatalog: fishData,
    diagnosisRecords: [],
    now: new Date('2026-09-28T00:00:00.000Z'),
  });
  assert.deepEqual(evidence.catalogDuplicateCollapses, [{
    canonicalId: 'sp_0038',
    sourceSpeciesIds: ['sp_0038', 'sp_0130'],
    combinedQuantity: 5,
  }]);
  assert.equal(evidence.compatibilityDecision?.pairResults.length, 1);
  const pair = evidence.compatibilityDecision?.pairResults[0];
  assert.ok(pair);
  assert.deepEqual(new Set([pair.speciesA.id, pair.speciesB.id]), new Set(['sp_0038', 'sp_0431']));
  assert.equal(
    evidence.compatibilityDecision?.pairResults.some(item => areExactCatalogDuplicateAliases(item.speciesA.id, item.speciesB.id)),
    false,
  );
}

// Same-taxon but distinct trade/catalogue objects remain separate at runtime.
{
  const evidence = deriveCurrentTankState({
    aquarium: tank([['sp_0103', 1], ['sp_0116', 1]]),
    speciesCatalog: fishData,
    diagnosisRecords: [],
    now: new Date('2026-09-28T00:00:00.000Z'),
  });
  assert.deepEqual(evidence.catalogDuplicateCollapses, []);
  assert.equal(evidence.compatibilityDecision?.pairResults.length, 1);
  assert.deepEqual(
    new Set([evidence.compatibilityDecision?.pairResults[0].speciesA.id, evidence.compatibilityDecision?.pairResults[0].speciesB.id]),
    new Set(['sp_0103', 'sp_0116']),
  );
}

console.log(`catalog exact duplicate aliases passed: ${exactCatalogDuplicateGroups.length} non-plant groups classified; current Tank State collapses duplicate IDs without collapsing trade forms`);

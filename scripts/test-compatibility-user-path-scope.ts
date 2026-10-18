import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { getLifeType } from '../src/modules/species/species.service';
import {
  isCompatibilityCalculatorSelectableSpecies,
  isCompatibilitySupportedLifeType,
} from '../src/services/compatibility/compatibility-domain-scope.service';

const selected = fishData.filter(isCompatibilityCalculatorSelectableSpecies);
const fishDomain = fishData.filter(species => getLifeType(species) === 'fish');
const unsupportedLivestock = fishData.filter(species => (
  !['plant', 'hardscape'].includes(getLifeType(species))
  && !isCompatibilityCalculatorSelectableSpecies(species)
));

assert.equal(isCompatibilitySupportedLifeType('fish'), true);
assert.equal(isCompatibilitySupportedLifeType('invertebrate'), false);
assert.equal(isCompatibilitySupportedLifeType('reptile'), false);
assert.equal(isCompatibilitySupportedLifeType('coral'), false);
assert.deepEqual(
  selected.map(species => species.id),
  fishDomain.map(species => species.id),
  'calculator-selectable species must exactly match the currently supported fish Compatibility domain',
);
assert.equal(
  selected.every(species => getLifeType(species) === 'fish'),
  true,
  'no unsupported life type may enter the Compatibility calculator selector',
);
assert.ok(
  unsupportedLivestock.length > 0,
  'scope audit should retain unsupported livestock in the catalog while excluding them from fish Compatibility calculation',
);

const unsupportedByLifeType = unsupportedLivestock.reduce<Record<string, number>>((acc, species) => {
  const lifeType = getLifeType(species);
  acc[lifeType] = (acc[lifeType] || 0) + 1;
  return acc;
}, {});

console.log(
  `Compatibility user-path scope PASS: ${selected.length} fish selectable; ${unsupportedLivestock.length} non-fish livestock retained in catalog but excluded from the current fish Compatibility calculator (${JSON.stringify(unsupportedByLifeType)}).`,
);

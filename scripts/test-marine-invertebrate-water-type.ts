import { fishData } from '../src/data/fishData';
import type { Fish } from '../src/types';
import {
  getLifeType,
  getSecondaryCategory,
  getSpeciesFilterTags,
  isSaltwaterSpecies,
  isSpeciesCompatibleWithWaterType,
} from '../src/modules/species/species.service';

const makeInvertebrate = (overrides: Partial<Fish>): Fish => ({
  id: 'fixture-invertebrate',
  name: '测试虾',
  scientificName: '',
  category: '虾类',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-26°C',
  phLevel: '7.0-8.0',
  waterChangeCycle: 7,
  description: '',
  diet: 'Omnivore',
  tankSize: '20L',
  temperament: 'Peaceful',
  size: 'Small',
  ...overrides,
});

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const marineCases: Fish[] = [
  makeInvertebrate({ id: 'fixture-lysmata', name: '清洁虾', scientificName: 'Lysmata amboinensis' }),
  makeInvertebrate({ id: 'fixture-thor', name: '性感虾', scientificName: 'Thor amboinensis' }),
  makeInvertebrate({ id: 'fixture-paguristes', name: '红脚寄居蟹', scientificName: 'Paguristes cadenati', category: '虾螺蟹' }),
];

for (const species of marineCases) {
  assert(getLifeType(species) === 'invertebrate', `${species.scientificName}: expected invertebrate life type`);
  assert(getSecondaryCategory(species) === '海水清洁生物', `${species.scientificName}: expected marine cleaner secondary category`);
  assert(isSaltwaterSpecies(species), `${species.scientificName}: expected saltwater classification`);
  assert(isSpeciesCompatibleWithWaterType(species, 'Saltwater'), `${species.scientificName}: expected saltwater compatibility`);
  assert(!isSpeciesCompatibleWithWaterType(species, 'Freshwater'), `${species.scientificName}: must not be compatible with freshwater`);

  const environmentTags = getSpeciesFilterTags(species).environmentTags;
  assert(environmentTags.includes('海水'), `${species.scientificName}: expected 海水 environment tag`);
  assert(!environmentTags.includes('淡水'), `${species.scientificName}: must not receive 淡水 environment tag`);
}

const freshwaterShrimp = makeInvertebrate({
  id: 'fixture-neocaridina',
  name: '樱花虾',
  scientificName: 'Neocaridina davidi',
});

assert(getLifeType(freshwaterShrimp) === 'invertebrate', 'Neocaridina davidi: expected invertebrate life type');
assert(!isSaltwaterSpecies(freshwaterShrimp), 'Neocaridina davidi: must remain freshwater');
assert(isSpeciesCompatibleWithWaterType(freshwaterShrimp, 'Freshwater'), 'Neocaridina davidi: expected freshwater compatibility');
assert(!isSpeciesCompatibleWithWaterType(freshwaterShrimp, 'Saltwater'), 'Neocaridina davidi: must not be compatible with saltwater');
assert(getSpeciesFilterTags(freshwaterShrimp).environmentTags.includes('淡水'), 'Neocaridina davidi: expected 淡水 environment tag');

const catalogMarineCleaners = fishData.filter(species => getSecondaryCategory(species) === '海水清洁生物');
for (const species of catalogMarineCleaners) {
  assert(isSaltwaterSpecies(species), `${species.id} ${species.name}: marine cleaner catalog item must be saltwater`);
  const environmentTags = getSpeciesFilterTags(species).environmentTags;
  assert(environmentTags.includes('海水'), `${species.id} ${species.name}: marine cleaner catalog item must receive 海水 tag`);
  assert(!environmentTags.includes('淡水'), `${species.id} ${species.name}: marine cleaner catalog item must not receive 淡水 tag`);
}

console.log(JSON.stringify({
  ok: true,
  marineCases: marineCases.map(item => item.scientificName),
  freshwaterControl: freshwaterShrimp.scientificName,
  catalogMarineCleanerCount: catalogMarineCleaners.length,
}, null, 2));

import { fishData } from '../src/data/fishData';
import {
  getDisplayableSpecies,
  getLifeType,
  getSpeciesFilterTags,
} from '../src/modules/species/species.service';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const plantCases = fishData.filter(species => /Cabomba|Limnophila/i.test(species.scientificName));
assert(plantCases.length > 0, 'catalog must contain Cabomba or Limnophila regression cases');

const displayableIds = new Set(getDisplayableSpecies().map(species => species.id));

for (const species of plantCases) {
  assert(getLifeType(species) === 'plant', `${species.id} ${species.name}: expected plant life type`);
  assert(!displayableIds.has(species.id), `${species.id} ${species.name}: aquatic plant must not enter displayable animal species list`);
  const tags = getSpeciesFilterTags(species);
  assert(tags.environmentTags.includes('淡水'), `${species.id} ${species.name}: expected freshwater environment tag`);
  assert(!tags.functionTags.includes('观赏鱼'), `${species.id} ${species.name}: aquatic plant must not receive ornamental-fish tag`);
}

console.log(JSON.stringify({
  ok: true,
  plantCases: plantCases.map(species => ({ id: species.id, name: species.name, scientificName: species.scientificName })),
}, null, 2));

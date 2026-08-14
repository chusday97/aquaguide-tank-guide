import type { Fish } from '../src/types';
import {
  getCareTaxonomyPath,
  getEncyclopediaLifeType,
  getSpeciesFilterTags,
  getSpeciesWaterType,
  isSpeciesCompatibleWithWaterType,
  matchesWaterTypeFilter,
} from '../src/modules/species/species.service';

const makeFish = (overrides: Partial<Fish>): Fish => ({
  id: 'fixture-water-type',
  name: '测试鱼',
  scientificName: 'Fixture species',
  category: '鱼类',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '7.0-8.0',
  waterChangeCycle: 7,
  description: '',
  diet: 'Omnivore',
  tankSize: '30L',
  temperament: 'Peaceful',
  size: 'Small',
  ...overrides,
});

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const brackish = makeFish({
  id: 'fixture-brackish-service',
  name: '测试汽水鱼',
  description: 'brackish 半咸水 species，需要独立盐度规划。',
});

assert(getSpeciesWaterType(brackish) === 'brackish', 'brackish fixture must have canonical brackish water type');
assert(getCareTaxonomyPath(brackish).waterType === '汽水', 'brackish care taxonomy must display 汽水');
assert(getEncyclopediaLifeType(brackish) === 'fish', 'brackish fish must not be classified as freshwaterFish or saltwaterFish');
assert(!matchesWaterTypeFilter(brackish, 'Freshwater'), 'brackish species must not pass Freshwater filter');
assert(!matchesWaterTypeFilter(brackish, 'Saltwater'), 'brackish species must not pass Saltwater filter');
assert(!isSpeciesCompatibleWithWaterType(brackish, 'Freshwater'), 'brackish species must not be directly compatible with Freshwater');
assert(!isSpeciesCompatibleWithWaterType(brackish, 'Saltwater'), 'brackish species must not be directly compatible with Saltwater');

const brackishTags = getSpeciesFilterTags(brackish).environmentTags;
assert(brackishTags.includes('汽水'), 'brackish species must receive 汽水 environment tag');
assert(!brackishTags.includes('淡水'), 'brackish species must not receive 淡水 environment tag');
assert(!brackishTags.includes('海水'), 'brackish species must not receive 海水 environment tag');
assert(!brackishTags.some(tag => tag.startsWith('淡水')), 'brackish species must not receive freshwater temperature tags');

const freshwater = makeFish({
  id: 'fixture-freshwater-service',
  name: '宝莲灯',
  scientificName: 'Paracheirodon axelrodi',
  category: '灯科鱼',
  description: '淡水热带鱼',
});
assert(getSpeciesWaterType(freshwater) === 'freshwater', 'freshwater fixture must remain freshwater');
assert(matchesWaterTypeFilter(freshwater, 'Freshwater'), 'freshwater fixture must pass Freshwater filter');
assert(!matchesWaterTypeFilter(freshwater, 'Saltwater'), 'freshwater fixture must not pass Saltwater filter');
assert(getEncyclopediaLifeType(freshwater) === 'freshwaterFish', 'freshwater fish must remain freshwaterFish');

const saltwater = makeFish({
  id: 'fixture-saltwater-service',
  name: '公子小丑',
  scientificName: 'Amphiprion ocellaris',
  category: '海水鱼',
  description: 'marine reef fish',
});
assert(getSpeciesWaterType(saltwater) === 'saltwater', 'saltwater fixture must remain saltwater');
assert(matchesWaterTypeFilter(saltwater, 'Saltwater'), 'saltwater fixture must pass Saltwater filter');
assert(!matchesWaterTypeFilter(saltwater, 'Freshwater'), 'saltwater fixture must not pass Freshwater filter');
assert(getEncyclopediaLifeType(saltwater) === 'saltwaterFish', 'saltwater fish must remain saltwaterFish');

console.log(JSON.stringify({
  ok: true,
  checked: ['brackish', 'freshwater', 'saltwater'],
}, null, 2));

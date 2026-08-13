import type { Fish } from '../src/types';
import { getLifeType, getSecondaryCategory, getSpeciesWaterType } from '../src/modules/species/species.service';

const makeSpecies = (overrides: Partial<Fish>): Fish => ({
  id: 'fixture',
  name: 'fixture',
  scientificName: '',
  category: '鱼类',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '6.5-8.0',
  waterChangeCycle: 7,
  description: '',
  diet: 'Omnivore',
  tankSize: '80L',
  temperament: 'Territorial',
  size: 'Medium',
  ...overrides,
});

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const firemouth = makeSpecies({
  id: 'fixture-thorichthys',
  name: '大点火口',
  scientificName: 'Thorichthys meeki',
  category: '慈鲷/斗鱼',
});

assert(getLifeType(firemouth) === 'fish', `Thorichthys meeki must be fish, got ${getLifeType(firemouth)}`);
assert(getSpeciesWaterType(firemouth) === 'freshwater', `Thorichthys meeki must be freshwater, got ${getSpeciesWaterType(firemouth)}`);
assert(getSecondaryCategory(firemouth) === '慈鲷', `Thorichthys meeki must resolve to 慈鲷, got ${getSecondaryCategory(firemouth)}`);

const sexyShrimp = makeSpecies({
  id: 'fixture-thor-shrimp',
  name: '性感虾',
  scientificName: 'Thor amboinensis',
  category: '虾螺蟹',
  size: 'Small',
  temperament: 'Peaceful',
});

assert(getLifeType(sexyShrimp) === 'invertebrate', `Thor amboinensis must remain invertebrate, got ${getLifeType(sexyShrimp)}`);
assert(getSpeciesWaterType(sexyShrimp) === 'saltwater', `Thor amboinensis must remain saltwater, got ${getSpeciesWaterType(sexyShrimp)}`);

console.log(JSON.stringify({
  ok: true,
  firemouth: {
    lifeType: getLifeType(firemouth),
    waterType: getSpeciesWaterType(firemouth),
    secondaryCategory: getSecondaryCategory(firemouth),
  },
  sexyShrimp: {
    lifeType: getLifeType(sexyShrimp),
    waterType: getSpeciesWaterType(sexyShrimp),
  },
}, null, 2));

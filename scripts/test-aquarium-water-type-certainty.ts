import type { Aquarium, Fish } from '../src/types';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';

const species: Fish = {
  id: 'fixture-freshwater-fish',
  name: '测试淡水鱼',
  scientificName: 'Fixture freshwater',
  category: '淡水鱼',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '',
  waterChangeCycle: 7,
  description: 'freshwater peaceful fish',
  diet: 'Omnivore',
  tankSize: '20L',
  temperament: 'Peaceful',
  size: 'Small',
};

const baseAquarium: Aquarium = {
  id: 'fixture-aquarium',
  name: '测试鱼缸',
  fishes: [],
  dimensions: { length: '60', width: '30', height: '30' },
  targetTemperature: '26',
  equipment: {
    filter: '瀑布过滤',
    heater: true,
    oxygen: true,
    light: '普通灯',
  },
};

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const unknownWaterType = evaluateSpeciesForAquarium(species, baseAquarium);
assert(unknownWaterType.status === 'unknown', `missing aquarium water type must produce unknown, got ${unknownWaterType.status}`);
assert(
  unknownWaterType.confirmations.some(item => item.type === 'unknown_aquarium_water_type'),
  'missing aquarium water type must request explicit confirmation',
);
assert(
  !unknownWaterType.matchedItems.some(item => item.type === 'water_type'),
  'missing aquarium water type must not be counted as a water-type match',
);
assert(
  !unknownWaterType.hardBlocks.some(item => item.type === 'water_type_mismatch'),
  'missing aquarium water type must not be treated as a confirmed mismatch',
);

const freshwaterAquarium = evaluateSpeciesForAquarium(species, { ...baseAquarium, waterType: 'Freshwater' });
assert(freshwaterAquarium.status === 'suitable', `explicit freshwater aquarium should remain suitable, got ${freshwaterAquarium.status}`);
assert(
  freshwaterAquarium.matchedItems.some(item => item.type === 'water_type'),
  'explicit freshwater aquarium must record a water-type match',
);

console.log(JSON.stringify({
  ok: true,
  unknownWaterTypeStatus: unknownWaterType.status,
  explicitFreshwaterStatus: freshwaterAquarium.status,
}, null, 2));

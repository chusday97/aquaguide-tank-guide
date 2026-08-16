import type { Aquarium, Fish } from '../src/types';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';

const species: Fish = {
  id: 'fixture-brackish-fish',
  name: '测试汽水鱼',
  scientificName: 'Fixture brackish',
  category: '鱼类',
  image: '',
  difficulty: 'Easy',
  waterTemperature: '24-28°C',
  phLevel: '7.5-8.2',
  waterChangeCycle: 7,
  description: 'brackish 半咸水 species，需独立盐度规划。',
  diet: 'Omnivore',
  tankSize: '30L',
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

for (const waterType of ['Freshwater', 'Saltwater'] as const) {
  const result = evaluateSpeciesForAquarium(species, { ...baseAquarium, waterType });
  assert(result.status === 'unsuitable', `brackish species must be unsuitable for ${waterType}, got ${result.status}`);
  assert(
    result.hardBlocks.some(item => item.type === 'water_type_mismatch'),
    `brackish species must produce water_type_mismatch for ${waterType}`,
  );
  assert(
    !result.matchedItems.some(item => item.type === 'water_type'),
    `brackish species must not record water-type match for ${waterType}`,
  );
}

console.log(JSON.stringify({
  ok: true,
  checkedAquariumWaterTypes: ['Freshwater', 'Saltwater'],
}, null, 2));

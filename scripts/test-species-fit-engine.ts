import { fishData } from '../src/data/fishData';
import type { Aquarium, Fish } from '../src/types';
import { evaluateSpeciesForAquarium } from '../src/lib/speciesFitEngine';
import { getLifeType } from '../src/modules/species/species.service';

const freshwater82: Aquarium = {
  id: 'tank_fresh_82',
  name: '82L 淡水缸',
  fishes: [],
  dimensions: { length: '60', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const freshwater30: Aquarium = {
  ...freshwater82,
  id: 'tank_fresh_30',
  name: '30L 淡水缸',
  dimensions: { length: '40', width: '30', height: '30' },
};

const findSpecies = (matcher: (fish: Fish) => boolean, label: string) => {
  const species = fishData.find(matcher);
  if (!species) throw new Error(`Missing test species: ${label}`);
  return species;
};

const coral = findSpecies(fish => /珊瑚/.test(fish.name) || /珊瑚/.test(fish.category), 'coral');
const jellyfish = findSpecies(fish => /水母/.test(`${fish.name} ${fish.category}`), 'jellyfish');
const neon = findSpecies(fish => fish.name === '红绿灯' || fish.name === '长鳍红绿灯', 'neon tetra');
const largeFish = findSpecies(fish => /至少\s*(120|160|200|240|320|400|480|600|640|720|800)\s*升/.test(fish.tankSize) && fish.size === 'Large', 'large fish');
const predator = findSpecies(fish => fish.temperament === 'Aggressive' || /掠食|捕食|龙鱼|雷龙|地图/.test(`${fish.name} ${fish.description}`), 'predator');
const sensitive = findSpecies(fish => /水晶虾|苏拉威西|七彩|短鲷/.test(`${fish.name} ${fish.category} ${fish.description}`), 'ph sensitive');
const plantBase = findSpecies(fish => getLifeType(fish) === 'plant', 'aquatic plant');
const hardscapeBase = findSpecies(fish => getLifeType(fish) === 'hardscape', 'hardscape');

const unknownSpecies: Fish = {
  ...neon,
  id: 'unknown_species',
  name: '未知资料鱼',
  scientificName: '',
  category: '',
  description: '',
  waterTemperature: '',
  phLevel: '',
  tankSize: '',
};

const plantWithAnimalLikeFields: Fish = {
  ...plantBase,
  id: 'plant_fit_regression',
  waterTemperature: '22-28°C',
  tankSize: '至少 800 升',
  size: 'Small',
  temperament: 'Peaceful',
  housingMode: '建议单养',
};

const hardscapeWithAnimalLikeFields: Fish = {
  ...hardscapeBase,
  id: 'hardscape_fit_regression',
  waterTemperature: '1-40°C',
  tankSize: '至少 800 升',
  size: 'Small',
  temperament: 'Territorial',
  housingMode: '建议单养',
};

const animalOnlyRuleTypes = new Set([
  'missing_volume',
  'volume_too_small',
  'volume_needs_adjustment',
  'length_too_short',
  'missing_filter',
  'heater_needed',
  'missing_heater',
  'oxygen_needed',
  'predation_risk',
  'fin_nipping_risk',
  'territorial_conflict',
  'density_high',
  'single_housing',
]);

const emittedTypes = (result: ReturnType<typeof evaluateSpeciesForAquarium>) => [
  ...result.hardBlocks,
  ...result.warnings,
  ...result.confirmations,
  ...result.matchedItems,
].map(item => item.type);

const hasAnimalOnlyRule = (result: ReturnType<typeof evaluateSpeciesForAquarium>) => (
  emittedTypes(result).some(type => animalOnlyRuleTypes.has(type))
);

const cases = [
  {
    name: 'freshwater excludes coral',
    result: evaluateSpeciesForAquarium(coral, freshwater82, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status === 'unsuitable' && result.hardBlocks.some(item => item.type === 'water_type_mismatch'),
  },
  {
    name: 'freshwater excludes jellyfish',
    result: evaluateSpeciesForAquarium(jellyfish, freshwater82, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status === 'unsuitable' && result.hardBlocks.some(item => item.type === 'special_tank_required' || item.type === 'water_type_mismatch'),
  },
  {
    name: 'freshwater allows neon without hard block',
    result: evaluateSpeciesForAquarium(neon, freshwater82, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status !== 'unsuitable' && result.hardBlocks.length === 0,
  },
  {
    name: 'small tank excludes large fish',
    result: evaluateSpeciesForAquarium(largeFish, freshwater30, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status === 'unsuitable' && result.hardBlocks.some(item => item.type === 'volume_too_small'),
  },
  {
    name: 'empty tank has no compatibility conflict',
    result: evaluateSpeciesForAquarium(neon, freshwater82, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.hardBlocks.every(item => !item.type.includes('risk')) && result.matchedItems.some(item => item.type === 'empty_tank'),
  },
  {
    name: 'predator blocks small fish',
    result: evaluateSpeciesForAquarium(neon, freshwater82, [{ species: predator, record: { quantity: 1 } }]),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status === 'unsuitable' && result.hardBlocks.some(item => item.type === 'predation_risk'),
  },
  {
    name: 'ph sensitive species asks for confirmation',
    result: evaluateSpeciesForAquarium(sensitive, freshwater82, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status !== 'suitable' && result.confirmations.some(item => item.type === 'missing_ph'),
  },
  {
    name: 'missing species data is unknown',
    result: evaluateSpeciesForAquarium(unknownSpecies, freshwater82, []),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => result.status === 'unknown',
  },
  {
    name: 'plant ignores animal stocking rules even with fish-style dirty fields',
    result: evaluateSpeciesForAquarium(plantWithAnimalLikeFields, freshwater30, [{ species: predator, record: { quantity: 20 } }]),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => !hasAnimalOnlyRule(result) && result.hardBlocks.every(item => item.type !== 'volume_too_small' && item.type !== 'predation_risk'),
  },
  {
    name: 'hardscape ignores animal stocking rules and requests placement review',
    result: evaluateSpeciesForAquarium(hardscapeWithAnimalLikeFields, freshwater30, [{ species: predator, record: { quantity: 20 } }]),
    expect: (result: ReturnType<typeof evaluateSpeciesForAquarium>) => !hasAnimalOnlyRule(result) && result.confirmations.some(item => item.type === 'hardscape_placement_check'),
  },
];

let failed = 0;
for (const item of cases) {
  if (!item.expect(item.result)) {
    failed += 1;
    console.error(`FAIL ${item.name}`, item.result);
  } else {
    console.log(`PASS ${item.name}: ${item.result.status}`);
  }
}

if (failed > 0) {
  process.exitCode = 1;
}

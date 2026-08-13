import { fishData } from '../src/data/fishData';
import type { Fish } from '../src/types';
import { getLifeType, getSpeciesWaterType, type SpeciesWaterType } from '../src/modules/species/species.service';
import { getSpeciesWaterEvidence } from '../src/modules/species/speciesWaterEvidence';

const MAX_CATEGORY_FALLBACK_ONLY = 0;
const MAX_MALFORMED_FISH_CATEGORY_RECORDS = 0;
const MAX_LIFE_TYPE_CATEGORY_CONTRADICTIONS = 0;

const textOf = (species: Fish) => [
  species.name,
  species.scientificName,
  species.category,
  species.description,
  species.diet,
  species.housingMode,
  species.housingReason,
  species.feedingProfile?.specialNotes,
].filter(Boolean).join(' ');

const hasExplicitFreshwaterEvidence = (species: Fish) => {
  const text = textOf(species);
  const originalCategory = (species as Fish & { _originalCategory?: string })._originalCategory || '';
  const categoryText = `${species.category} ${originalCategory}`;

  return /淡水|Freshwater|水草|淡水鱼|热带鱼|冷水鱼|金鱼|锦鲤|龟类|两栖|爬宠/i.test(categoryText)
    || /淡水|freshwater|水草|灯科|鼠鱼|斗鱼|慈鲷|孔雀|月光鱼|玛丽|剑尾|斑马鱼|白云金丝|鳉鱼|曼龙|七彩神仙|神仙鱼|短鲷|异型|清道夫|青苔鼠|鳅|金鱼|锦鲤|雷龙|龙鱼|美人鱼|Neocaridina|Caridina|Neritina|Clithon|Anentome|Pomacea|Tylomelania|Geosesarma|Corydoras|Betta|Poecilia|Xiphophorus|Danio|Tanichthys|Apistogramma|Ancistrus|Otocinclus/i.test(text);
};

const classifyWithoutBroadCategoryFallback = (species: Fish): SpeciesWaterType => {
  const canonical = getSpeciesWaterType(species);
  if (canonical === 'saltwater' || canonical === 'brackish') return canonical;

  const explicitEvidence = getSpeciesWaterEvidence(species);
  if (explicitEvidence) return explicitEvidence.primaryWaterType;

  const lifeType = getLifeType(species);
  if (lifeType === 'plant' || lifeType === 'hardscape' || lifeType === 'reptile') return 'freshwater';
  if (hasExplicitFreshwaterEvidence(species)) return 'freshwater';
  return 'unknown';
};

const countBy = <T extends string>(values: T[]) => values.reduce<Record<string, number>>((acc, value) => {
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const currentCounts = countBy(fishData.map(getSpeciesWaterType));
const strictCounts = countBy(fishData.map(classifyWithoutBroadCategoryFallback));
const strictUnknown = fishData.filter(species => classifyWithoutBroadCategoryFallback(species) === 'unknown');

const unknownByCategory = Object.entries(
  strictUnknown.reduce<Record<string, number>>((acc, species) => {
    const key = species.category || '(empty)';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
).sort((a, b) => b[1] - a[1]);

const unknownByLifeType = Object.entries(
  strictUnknown.reduce<Record<string, number>>((acc, species) => {
    const key = getLifeType(species);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
).sort((a, b) => b[1] - a[1]);

const malformedCategoryRecords = strictUnknown
  .filter(species => getLifeType(species) === 'fish' && /硬景|底床|水草|珊瑚|海水无脊椎/.test(species.category || ''))
  .map(species => ({
    id: species.id,
    name: species.name,
    scientificName: species.scientificName,
    category: species.category,
    originalCategory: (species as Fish & { _originalCategory?: string })._originalCategory || null,
    lifeType: getLifeType(species),
  }));

const getLifeTypeCategoryContradiction = (species: Fish) => {
  const lifeType = getLifeType(species);
  const category = species.category || '';

  if (lifeType === 'plant' && category !== '水草') return 'plant_not_water_plant';
  if (lifeType === 'hardscape' && category !== '硬景/底床') return 'hardscape_not_hardscape';
  if (lifeType === 'fish' && /水草|硬景|底床|珊瑚|海水无脊椎/.test(category)) return 'fish_as_scenery_or_coral';
  if (lifeType === 'invertebrate' && /鱼类|灯科鱼|慈鲷|海水鱼|水草|硬景|底床/.test(category)) return 'invertebrate_wrong_category';
  if (lifeType === 'coral' && /鱼类|灯科鱼|慈鲷|海水鱼|水草|硬景|底床/.test(category)) return 'coral_wrong_category';
  if (lifeType === 'reptile' && !/龟|两栖|爬宠|Amphibians|Reptiles|Turtles/i.test(category)) return 'reptile_wrong_category';
  return null;
};

const lifeTypeCategoryContradictions = fishData
  .map(species => ({ species, reason: getLifeTypeCategoryContradiction(species) }))
  .filter((item): item is { species: Fish; reason: string } => Boolean(item.reason))
  .map(({ species, reason }) => ({
    reason,
    id: species.id,
    name: species.name,
    scientificName: species.scientificName,
    category: species.category,
    lifeType: getLifeType(species),
  }));

const contradictionCounts = lifeTypeCategoryContradictions.reduce<Record<string, number>>((acc, item) => {
  acc[item.reason] = (acc[item.reason] || 0) + 1;
  return acc;
}, {});

const categoryFallbackOnly = fishData.filter(species => (
  getSpeciesWaterType(species) === 'freshwater' && classifyWithoutBroadCategoryFallback(species) === 'unknown'
));

const fallbackDependentSpecies = categoryFallbackOnly.map(species => ({
  id: species.id,
  name: species.name,
  scientificName: species.scientificName,
  category: species.category,
  lifeType: getLifeType(species),
}));

const report = {
  totalSpecies: fishData.length,
  currentCounts,
  withoutBroadCategoryFallbackCounts: strictCounts,
  categoryFallbackOnlyCount: categoryFallbackOnly.length,
  maxAllowedCategoryFallbackOnly: MAX_CATEGORY_FALLBACK_ONLY,
  malformedFishCategoryCount: malformedCategoryRecords.length,
  maxAllowedMalformedFishCategoryRecords: MAX_MALFORMED_FISH_CATEGORY_RECORDS,
  lifeTypeCategoryContradictionCount: lifeTypeCategoryContradictions.length,
  maxAllowedLifeTypeCategoryContradictions: MAX_LIFE_TYPE_CATEGORY_CONTRADICTIONS,
  contradictionCounts,
  unknownByCategory,
  unknownByLifeType,
  malformedCategoryRecords,
  lifeTypeCategoryContradictions,
  fallbackDependentSpecies,
};

console.log(JSON.stringify(report, null, 2));

if (categoryFallbackOnly.length > MAX_CATEGORY_FALLBACK_ONLY) {
  console.error(
    `Water-type taxonomy debt increased: ${categoryFallbackOnly.length} records rely only on the broad category fallback; maximum allowed is ${MAX_CATEGORY_FALLBACK_ONLY}.`,
  );
  process.exit(1);
}

if (malformedCategoryRecords.length > MAX_MALFORMED_FISH_CATEGORY_RECORDS) {
  console.error(
    `Malformed fish-category debt increased: ${malformedCategoryRecords.length} fish records use scenery/coral categories; maximum allowed is ${MAX_MALFORMED_FISH_CATEGORY_RECORDS}.`,
  );
  process.exit(1);
}

if (lifeTypeCategoryContradictions.length > MAX_LIFE_TYPE_CATEGORY_CONTRADICTIONS) {
  console.error(
    `Life-type/category debt increased: ${lifeTypeCategoryContradictions.length} contradictory catalog records; maximum allowed is ${MAX_LIFE_TYPE_CATEGORY_CONTRADICTIONS}.`,
  );
  process.exit(1);
}

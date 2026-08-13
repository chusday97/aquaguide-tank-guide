import { fishData } from '../src/data/fishData';
import type { Fish } from '../src/types';
import { getLifeType, getSpeciesWaterType, type SpeciesWaterType } from '../src/modules/species/species.service';

const MAX_CATEGORY_FALLBACK_ONLY = 57;
const MAX_MALFORMED_FISH_CATEGORY_RECORDS = 7;

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

const samples = strictUnknown.slice(0, 40).map(species => ({
  id: species.id,
  name: species.name,
  scientificName: species.scientificName,
  category: species.category,
  lifeType: getLifeType(species),
}));

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

const categoryFallbackOnly = fishData.filter(species => (
  getSpeciesWaterType(species) === 'freshwater' && classifyWithoutBroadCategoryFallback(species) === 'unknown'
));

const report = {
  totalSpecies: fishData.length,
  currentCounts,
  withoutBroadCategoryFallbackCounts: strictCounts,
  categoryFallbackOnlyCount: categoryFallbackOnly.length,
  maxAllowedCategoryFallbackOnly: MAX_CATEGORY_FALLBACK_ONLY,
  malformedFishCategoryCount: malformedCategoryRecords.length,
  maxAllowedMalformedFishCategoryRecords: MAX_MALFORMED_FISH_CATEGORY_RECORDS,
  unknownByCategory,
  unknownByLifeType,
  malformedCategoryRecords,
  unknownSamples: samples,
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

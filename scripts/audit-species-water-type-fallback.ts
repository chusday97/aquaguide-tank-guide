import { fishData } from '../src/data/fishData';
import type { Fish } from '../src/types';
import { getLifeType, isSaltwaterSpecies } from '../src/modules/species/species.service';

type WaterType = 'freshwater' | 'saltwater' | 'brackish' | 'unknown';

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

const classifyCurrent = (species: Fish): WaterType => {
  const text = textOf(species);
  if (/汽水|半咸|brackish/i.test(text)) return 'brackish';
  if (isSaltwaterSpecies(species) || /海水|珊瑚|海葵|水母|蛋白分离|盐度|reef|marine|coral|anemone|jellyfish/i.test(text)) return 'saltwater';
  if (species.category || /淡水|水草|灯科|鼠鱼|虾|螺|斗鱼|慈鲷|孔雀|金鱼|锦鲤|freshwater/i.test(text)) return 'freshwater';
  return 'unknown';
};

const hasExplicitFreshwaterEvidence = (species: Fish) => {
  const text = textOf(species);
  const originalCategory = (species as Fish & { _originalCategory?: string })._originalCategory || '';
  const categoryText = `${species.category} ${originalCategory}`;

  return /淡水|Freshwater|水草|淡水鱼|热带鱼|冷水鱼|金鱼|锦鲤|龟类|两栖|爬宠/i.test(categoryText)
    || /淡水|freshwater|水草|灯科|鼠鱼|斗鱼|慈鲷|孔雀|月光鱼|玛丽|剑尾|斑马鱼|白云金丝|鳉鱼|曼龙|七彩神仙|神仙鱼|短鲷|异型|清道夫|青苔鼠|鳅|金鱼|锦鲤|雷龙|龙鱼|美人鱼|Neocaridina|Caridina|Neritina|Clithon|Anentome|Pomacea|Tylomelania|Geosesarma|Corydoras|Betta|Poecilia|Xiphophorus|Danio|Tanichthys|Apistogramma|Ancistrus|Otocinclus/i.test(text);
};

const classifyWithoutCategoryFallback = (species: Fish): WaterType => {
  const text = textOf(species);
  if (/汽水|半咸|brackish/i.test(text)) return 'brackish';
  if (isSaltwaterSpecies(species) || /海水|珊瑚|海葵|水母|蛋白分离|盐度|reef|marine|coral|anemone|jellyfish/i.test(text)) return 'saltwater';
  if (hasExplicitFreshwaterEvidence(species)) return 'freshwater';
  return 'unknown';
};

const countBy = <T extends string>(values: T[]) => values.reduce<Record<string, number>>((acc, value) => {
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const currentCounts = countBy(fishData.map(classifyCurrent));
const strictCounts = countBy(fishData.map(classifyWithoutCategoryFallback));
const strictUnknown = fishData.filter(species => classifyWithoutCategoryFallback(species) === 'unknown');

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

const categoryFallbackOnly = fishData.filter(species => (
  classifyCurrent(species) === 'freshwater' && classifyWithoutCategoryFallback(species) === 'unknown'
));

console.log(JSON.stringify({
  totalSpecies: fishData.length,
  currentCounts,
  withoutCategoryFallbackCounts: strictCounts,
  categoryFallbackOnlyCount: categoryFallbackOnly.length,
  unknownByCategory,
  unknownByLifeType,
  unknownSamples: samples,
}, null, 2));

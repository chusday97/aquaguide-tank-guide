import type { Fish } from '../types';
import { getLifeType } from '../modules/species/species.service';

export const getSpeciesQuantityUnit = (fish: Fish, isEn = false, count = 2) => {
  const lifeType = getLifeType(fish);
  if (lifeType === 'plant') return isEn ? (count === 1 ? 'plant' : 'plants') : '株';
  if (lifeType === 'fish') return isEn ? 'fish' : '条';
  if (lifeType === 'hardscape') return isEn ? (count === 1 ? 'piece' : 'pieces') : '件';
  return isEn ? (count === 1 ? 'animal' : 'animals') : '只';
};

export const formatSpeciesQuantity = (fish: Fish, count: number, isEn = false) => {
  const unit = getSpeciesQuantityUnit(fish, isEn, count);
  return isEn ? `${count} ${unit}` : `${count}${unit}`;
};

import type { Fish } from '../../types';
import { getLifeType } from '../../modules/species/species.service';

export type CompatibilitySupportedLifeType = 'fish';

export const isCompatibilitySupportedLifeType = (lifeType: string): lifeType is CompatibilitySupportedLifeType => (
  lifeType === 'fish'
);

export const isCompatibilityCalculatorSelectableSpecies = (fish: Fish) => (
  isCompatibilitySupportedLifeType(getLifeType(fish))
);

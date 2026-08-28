import type { SpeciesProfile } from '../../../packages/contracts/src';
import type { Fish } from '../../types';

const nullableText = (value?: string | null) => value?.trim() || null;

const numericRange = (value?: string | null) => {
  const values = value?.match(/\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) ?? [];
  if (values.length === 0) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
};

/** Convert legacy Fish records without inferring catalog facts from names or categories. */
export const speciesProfileFromFish = (fish: Fish): SpeciesProfile => {
  const temperature = numericRange(fish.waterTemperature);
  const ph = numericRange(fish.phLevel);
  return {
  id: fish.id,
  catalogKey: fish.id,
  name: fish.name,
  scientificName: fish.scientificName,
  category: fish.category,
  waterType: fish.waterType ?? 'unknown',
  difficulty: fish.difficulty,
  waterTemperatureText: nullableText(fish.waterTemperature),
  waterTemperatureMinC: temperature.min,
  waterTemperatureMaxC: temperature.max,
  phLevelText: nullableText(fish.phLevel),
  phMin: ph.min,
  phMax: ph.max,
  waterChangeCycleDays: Number.isFinite(fish.waterChangeCycle) && fish.waterChangeCycle > 0 ? fish.waterChangeCycle : null,
  description: nullableText(fish.description),
  diet: nullableText(fish.diet),
  tankSizeText: nullableText(fish.tankSize),
  minTankLiters: null,
  temperament: fish.temperament ?? null,
  sizeClass: fish.size ?? null,
  housingMode: fish.housingMode ?? null,
  housingReason: nullableText(fish.housingReason),
  completeness: 'unknown',
  evidenceSourceIds: [],
  };
};

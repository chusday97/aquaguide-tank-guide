import type { SpeciesProfile } from '../../../packages/contracts/src';
import type { Fish } from '../../types';

const nullableText = (value?: string | null) => value?.trim() || null;

/** Convert legacy Fish records without inferring catalog facts from free text. */
export const speciesProfileFromFish = (fish: Fish): SpeciesProfile => ({
  id: fish.id,
  catalogKey: fish.id,
  name: fish.name,
  scientificName: fish.scientificName,
  category: fish.category,
  waterType: fish.waterType ?? 'unknown',
  difficulty: fish.difficulty,
  waterTemperatureText: nullableText(fish.waterTemperature),
  waterTemperatureMinC: null,
  waterTemperatureMaxC: null,
  phLevelText: nullableText(fish.phLevel),
  phMin: null,
  phMax: null,
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
});

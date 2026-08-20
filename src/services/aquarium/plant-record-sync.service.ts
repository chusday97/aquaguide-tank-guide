import type { Aquarium, AquariumFish, Fish } from '../../types';
import {
  getAquariumPlantSpecies,
  isAquaticPlantSpecies,
  isHardscapeSpecies,
} from '../../lib/speciesClassification';
import {
  createSpeciesBatch,
  normalizeSpeciesBatches,
  withNormalizedSpeciesBatches,
} from './species-batches.service';

const toIsoDate = (value?: string) => {
  if (!value) return null;
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getFallbackPlantEntryDate = (aquarium: Aquarium, now = new Date()) => {
  const candidates = [
    aquarium.startedAt,
    aquarium.lastWaterChangeDate,
    ...aquarium.fishes.map(record => record.entryDate),
  ]
    .map(toIsoDate)
    .filter((value): value is string => Boolean(value));
  if (candidates.length === 0) return now.toISOString();
  return candidates.sort()[0];
};

const normalizePlantRecord = (record: AquariumFish) => withNormalizedSpeciesBatches({
  ...record,
  batches: normalizeSpeciesBatches(record).map(batch => ({
    ...batch,
    reproductiveState: 'not_applicable' as const,
  })),
});

const createPlantRecord = (
  aquarium: Aquarium,
  fish: Fish,
  entryDate: string,
): AquariumFish => withNormalizedSpeciesBatches({
  id: `plant-record:${aquarium.id}:${fish.id}`,
  fishId: fish.id,
  quantity: 1,
  entryDate,
  batches: [createSpeciesBatch({
    id: `plant-batch:${aquarium.id}:${fish.id}`,
    quantity: 1,
    entryDate,
    lifeStage: 'unknown',
    reproductiveState: 'not_applicable',
    stateUpdatedAt: entryDate,
  })],
});

const resolvePlantSelection = (values: string[] | undefined, speciesCatalog: Fish[]) => {
  const ids: string[] = [];
  const unresolved: string[] = [];
  for (const value of values || []) {
    const plant = getAquariumPlantSpecies(value, speciesCatalog);
    if (!plant) {
      if (!unresolved.includes(value)) unresolved.push(value);
      continue;
    }
    if (!ids.includes(plant.id)) ids.push(plant.id);
  }
  return { ids, unresolved };
};

export const normalizeAquariumPlantRecords = (
  aquarium: Aquarium,
  speciesCatalog: Fish[],
  now = new Date(),
): Aquarium => {
  const selected = resolvePlantSelection(aquarium.plants, speciesCatalog);
  const plantRecordsBySpeciesId = new Map<string, AquariumFish>();
  const retainedRecords: AquariumFish[] = [];
  const hardscapeMirror = new Set(aquarium.hardscape || []);

  for (const record of aquarium.fishes) {
    const species = speciesCatalog.find(item => item.id === record.fishId);
    if (!species) {
      retainedRecords.push(record);
      continue;
    }
    if (isHardscapeSpecies(species)) {
      hardscapeMirror.add(species.id);
      continue;
    }
    if (isAquaticPlantSpecies(species)) {
      plantRecordsBySpeciesId.set(species.id, normalizePlantRecord(record));
      continue;
    }
    retainedRecords.push(record);
  }

  const fallbackEntryDate = getFallbackPlantEntryDate(aquarium, now);
  for (const fishId of selected.ids) {
    if (plantRecordsBySpeciesId.has(fishId)) continue;
    const species = speciesCatalog.find(item => item.id === fishId);
    if (!species) continue;
    plantRecordsBySpeciesId.set(fishId, createPlantRecord(aquarium, species, fallbackEntryDate));
  }

  const plantRecords = Array.from(plantRecordsBySpeciesId.values());
  const plantMirror = [
    ...Array.from(plantRecordsBySpeciesId.keys()),
    ...selected.unresolved,
  ];

  return {
    ...aquarium,
    fishes: [...retainedRecords, ...plantRecords],
    plants: plantMirror,
    hardscape: Array.from(hardscapeMirror),
  };
};

export const applyPlantSettingsToAquarium = (
  aquarium: Aquarium,
  selectedValues: string[] | undefined,
  speciesCatalog: Fish[],
  now = new Date(),
): Aquarium => {
  const normalized = normalizeAquariumPlantRecords(aquarium, speciesCatalog, now);
  const selected = resolvePlantSelection(selectedValues, speciesCatalog);
  const selectedIds = new Set(selected.ids);
  const existingPlantRecords = new Map<string, AquariumFish>();
  const retainedRecords: AquariumFish[] = [];

  for (const record of normalized.fishes) {
    const species = speciesCatalog.find(item => item.id === record.fishId);
    if (species && isAquaticPlantSpecies(species)) {
      existingPlantRecords.set(species.id, normalizePlantRecord(record));
      continue;
    }
    retainedRecords.push(record);
  }

  const addedAt = now.toISOString();
  const plantRecords = selected.ids.flatMap(fishId => {
    const existing = existingPlantRecords.get(fishId);
    if (existing) return [existing];
    const species = speciesCatalog.find(item => item.id === fishId);
    return species ? [createPlantRecord(normalized, species, addedAt)] : [];
  });

  return {
    ...normalized,
    fishes: [...retainedRecords, ...plantRecords],
    plants: [...Array.from(selectedIds), ...selected.unresolved],
  };
};

export const removePlantMirrorForSpecies = (
  aquarium: Aquarium,
  fishId: string,
  speciesCatalog: Fish[],
): Aquarium => ({
  ...aquarium,
  plants: (aquarium.plants || []).filter(value => getAquariumPlantSpecies(value, speciesCatalog)?.id !== fishId),
});

export const getAquariumAnimalRecords = (aquarium: Aquarium, speciesCatalog: Fish[]) => aquarium.fishes.filter(record => {
  const species = speciesCatalog.find(item => item.id === record.fishId);
  if (!species) return true;
  return !isAquaticPlantSpecies(species) && !isHardscapeSpecies(species);
});

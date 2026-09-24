import type { Aquarium, AquariumSpeciesBatch } from '../../types';

export type AquariumSaveServerBatch = {
  id: string;
  quantity: number;
  entryDate: string;
  lifeStage: AquariumSpeciesBatch['lifeStage'];
  reproductiveState: AquariumSpeciesBatch['reproductiveState'];
  stateUpdatedAt?: string;
  version: number;
};

export type AquariumSaveServerSpecies = {
  id: string;
  speciesCatalogKey: string;
  quantity: number;
  entryDate: string;
  lastWaterChangeAt?: string;
  version: number;
  batches: AquariumSaveServerBatch[];
};

export type AquariumSaveServerSnapshot = {
  id: string;
  name: string;
  waterType?: Aquarium['waterType'];
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  targetTemperatureC?: number;
  lastWaterChangeAt?: string;
  lastWaterStoredAt?: string;
  startedAt?: string;
  startedAtSource?: Aquarium['startedAtSource'];
  startedAtConfirmedAt?: string;
  version: number;
  species: AquariumSaveServerSpecies[];
  equipment?: {
    id: string;
    filterType?: string;
    heater?: boolean;
    oxygen?: boolean;
    lightType?: string;
    version: number;
  };
};

const nil = <T>(value: T | null | undefined) => value ?? null;
const sameScalar = (left: unknown, right: unknown) => nil(left) === nil(right);
const day = (value: string | undefined) => value ? value.slice(0, 10) : undefined;

const desiredParent = (aquarium: Aquarium) => ({
  name: aquarium.name,
  waterType: aquarium.waterType,
  lengthCm: aquarium.dimensions?.length ? Number(aquarium.dimensions.length) : undefined,
  widthCm: aquarium.dimensions?.width ? Number(aquarium.dimensions.width) : undefined,
  heightCm: aquarium.dimensions?.height ? Number(aquarium.dimensions.height) : undefined,
  targetTemperatureC: aquarium.targetTemperature ? Number(aquarium.targetTemperature) : undefined,
  lastWaterChangeAt: aquarium.lastWaterChangeDate,
  lastWaterStoredAt: aquarium.lastWaterStoredDate,
  startedAt: aquarium.startedAt,
  startedAtSource: aquarium.startedAtSource,
  startedAtConfirmedAt: aquarium.startedAtConfirmedAt,
});

const batchMatchesDesired = (current: AquariumSaveServerBatch, desired: AquariumSpeciesBatch) => (
  current.quantity === desired.quantity
  && day(current.entryDate) === day(desired.entryDate)
  && current.lifeStage === desired.lifeStage
  && current.reproductiveState === desired.reproductiveState
);

const batchMatchesServer = (left: AquariumSaveServerBatch, right: AquariumSaveServerBatch) => (
  left.quantity === right.quantity
  && day(left.entryDate) === day(right.entryDate)
  && left.lifeStage === right.lifeStage
  && left.reproductiveState === right.reproductiveState
);

const transitionScalar = (before: unknown, current: unknown, target: unknown) => (
  sameScalar(current, before) || sameScalar(current, target)
);

const findDesiredSpecies = (aquarium: Aquarium, serverSpecies: AquariumSaveServerSpecies) => (
  aquarium.fishes.find(item => item.id === serverSpecies.id)
  || aquarium.fishes.find(item => item.fishId === serverSpecies.speciesCatalogKey)
);

const batchTransitionCompatible = (
  before: AquariumSaveServerBatch[],
  current: AquariumSaveServerBatch[],
  desired: AquariumSpeciesBatch[],
) => {
  const beforeById = new Map(before.map(batch => [batch.id, batch]));
  const desiredById = new Map(desired.map(batch => [batch.id, batch]));
  const matchedDesired = new Set<string>();

  for (const batch of current) {
    const previous = beforeById.get(batch.id);
    if (previous) {
      const target = desiredById.get(batch.id);
      if (!target) {
        if (!batchMatchesServer(batch, previous)) return false;
        continue;
      }
      matchedDesired.add(target.id);
      if (!batchMatchesServer(batch, previous) && !batchMatchesDesired(batch, target)) return false;
      continue;
    }

    const target = desired.find(item => !matchedDesired.has(item.id) && batchMatchesDesired(batch, item));
    if (!target) return false;
    matchedDesired.add(target.id);
  }

  const currentIds = new Set(current.map(batch => batch.id));
  for (const previous of before) {
    if (currentIds.has(previous.id)) continue;
    if (desiredById.has(previous.id)) return false;
  }

  return true;
};

const unbatchedTransitionCompatible = (
  before: AquariumSaveServerSpecies,
  current: AquariumSaveServerSpecies,
  desiredQuantity: number,
) => {
  if (current.quantity !== before.quantity && current.quantity !== desiredQuantity) return false;
  if (before.batches.length !== current.batches.length) return false;
  const currentById = new Map(current.batches.map(batch => [batch.id, batch]));
  for (const previous of before.batches) {
    const next = currentById.get(previous.id);
    if (!next) return false;
    const quantityOk = next.quantity === previous.quantity || (
      before.batches.length === 1 && next.quantity === desiredQuantity
    );
    if (!quantityOk) return false;
    if (
      day(next.entryDate) !== day(previous.entryDate)
      || next.lifeStage !== previous.lifeStage
      || next.reproductiveState !== previous.reproductiveState
    ) return false;
  }
  return true;
};

const newSpeciesCompatible = (
  current: AquariumSaveServerSpecies,
  desired: Aquarium['fishes'][number],
) => {
  const batches = desired.batches || [];
  const createdEntryDate = batches[0]?.entryDate || desired.entryDate;
  if (day(current.entryDate) !== day(createdEntryDate)) return false;
  if (!sameScalar(current.lastWaterChangeAt, desired.lastWaterChangeDate)) return false;

  if (batches.length === 0) {
    if (current.quantity !== desired.quantity || current.batches.length !== 1) return false;
    const [batch] = current.batches;
    return batch.quantity === desired.quantity
      && day(batch.entryDate) === day(desired.entryDate)
      && batch.lifeStage === 'unknown'
      && batch.reproductiveState === 'unknown';
  }

  const matched = new Set<string>();
  for (const batch of current.batches) {
    const target = batches.find(item => !matched.has(item.id) && batchMatchesDesired(batch, item));
    if (!target) return false;
    matched.add(target.id);
  }
  return true;
};

const equipmentMatchesTarget = (
  current: AquariumSaveServerSnapshot['equipment'],
  desired: Aquarium['equipment'],
) => {
  if (!desired) return current === undefined;
  if (!current) return false;
  return sameScalar(current.filterType, desired.filter)
    && sameScalar(current.heater, desired.heater)
    && sameScalar(current.oxygen, desired.oxygen)
    && sameScalar(current.lightType, desired.light);
};

const equipmentMatchesServer = (
  left: AquariumSaveServerSnapshot['equipment'],
  right: AquariumSaveServerSnapshot['equipment'],
) => {
  if (!left || !right) return left === right;
  return left.id === right.id
    && sameScalar(left.filterType, right.filterType)
    && sameScalar(left.heater, right.heater)
    && sameScalar(left.oxygen, right.oxygen)
    && sameScalar(left.lightType, right.lightType);
};

export const aquariumSaveFingerprint = (aquarium: Aquarium) => JSON.stringify({
  id: aquarium.id,
  ...desiredParent(aquarium),
  fishes: aquarium.fishes.map(fish => ({
    id: fish.id,
    fishId: fish.fishId,
    quantity: fish.quantity,
    entryDate: day(fish.entryDate),
    lastWaterChangeDate: fish.lastWaterChangeDate,
    batches: (fish.batches || []).map(batch => ({
      id: batch.id,
      quantity: batch.quantity,
      entryDate: day(batch.entryDate),
      lifeStage: batch.lifeStage,
      reproductiveState: batch.reproductiveState,
    })),
  })),
  equipment: aquarium.equipment || null,
});

export const aquariumPartialSaveCanResume = (
  before: AquariumSaveServerSnapshot,
  current: AquariumSaveServerSnapshot,
  desired: Aquarium,
) => {
  if (before.id !== current.id) return false;

  const targetParent = desiredParent(desired);
  for (const key of Object.keys(targetParent) as Array<keyof typeof targetParent>) {
    if (!transitionScalar(before[key], current[key], targetParent[key])) return false;
  }

  const beforeById = new Map(before.species.map(item => [item.id, item]));
  const beforeByCatalog = new Map(before.species.map(item => [item.speciesCatalogKey, item]));
  const currentById = new Map(current.species.map(item => [item.id, item]));

  for (const species of current.species) {
    const previous = beforeById.get(species.id) || beforeByCatalog.get(species.speciesCatalogKey);
    const target = findDesiredSpecies(desired, species);

    if (!previous) {
      if (!target || !newSpeciesCompatible(species, target)) return false;
      continue;
    }

    if (!target) {
      if (
        species.quantity !== previous.quantity
        || day(species.entryDate) !== day(previous.entryDate)
        || !sameScalar(species.lastWaterChangeAt, previous.lastWaterChangeAt)
        || !batchTransitionCompatible(previous.batches, species.batches, [])
      ) return false;
      continue;
    }

    if (
      !transitionScalar(day(previous.entryDate), day(species.entryDate), day(target.entryDate))
      || !transitionScalar(previous.lastWaterChangeAt, species.lastWaterChangeAt, target.lastWaterChangeDate)
    ) return false;

    if (target.batches?.length) {
      if (!batchTransitionCompatible(previous.batches, species.batches, target.batches)) return false;
    } else if (!unbatchedTransitionCompatible(previous, species, target.quantity)) {
      return false;
    }
  }

  for (const previous of before.species) {
    if (currentById.has(previous.id)) continue;
    const targetStillExists = desired.fishes.some(item => (
      item.id === previous.id || item.fishId === previous.speciesCatalogKey
    ));
    if (targetStillExists) return false;
  }

  const equipmentIsBefore = equipmentMatchesServer(current.equipment, before.equipment);
  const equipmentIsTarget = equipmentMatchesTarget(current.equipment, desired.equipment);
  if (!equipmentIsBefore && !equipmentIsTarget) return false;

  return true;
};

export const canonicalizeAquariumResumeInput = (
  desired: Aquarium,
  current: AquariumSaveServerSnapshot,
): Aquarium => {
  const usedSpecies = new Set<string>();

  return {
    ...desired,
    fishes: desired.fishes.map(fish => {
      const exact = current.species.find(item => item.id === fish.id && !usedSpecies.has(item.id));
      const matched = exact || current.species.find(item => (
        item.speciesCatalogKey === fish.fishId && !usedSpecies.has(item.id)
      ));
      if (!matched) return fish;
      usedSpecies.add(matched.id);

      if (!fish.batches?.length) return { ...fish, id: matched.id };

      const usedBatches = new Set<string>();
      const exactBatchIds = new Set(
        fish.batches
          .filter(batch => matched.batches.some(currentBatch => currentBatch.id === batch.id))
          .map(batch => batch.id),
      );

      const batches = fish.batches.map(batch => {
        const exactBatch = matched.batches.find(item => item.id === batch.id && !usedBatches.has(item.id));
        if (exactBatch) {
          usedBatches.add(exactBatch.id);
          return { ...batch, stateUpdatedAt: exactBatch.stateUpdatedAt || batch.stateUpdatedAt };
        }

        const semantic = matched.batches.find(item => (
          !usedBatches.has(item.id)
          && !exactBatchIds.has(item.id)
          && batchMatchesDesired(item, batch)
        ));
        if (!semantic) return batch;
        usedBatches.add(semantic.id);
        return {
          ...batch,
          id: semantic.id,
          stateUpdatedAt: semantic.stateUpdatedAt || batch.stateUpdatedAt,
        };
      });

      return { ...fish, id: matched.id, batches };
    }),
  };
};

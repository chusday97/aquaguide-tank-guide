import type { Aquarium, AquariumSetupStatus } from '../../types';

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const validDate = (value: unknown) => nonEmpty(value) && !Number.isNaN(new Date(value).getTime());

const normalizeDimensions = (dimensions: Aquarium['dimensions']) => {
  if (!dimensions) return undefined;
  const normalized = {
    length: nonEmpty(dimensions.length) ? dimensions.length.trim() : '',
    width: nonEmpty(dimensions.width) ? dimensions.width.trim() : '',
    height: nonEmpty(dimensions.height) ? dimensions.height.trim() : '',
  };
  return Object.values(normalized).some(Boolean) ? normalized : undefined;
};

const normalizeEquipment = (equipment: Aquarium['equipment']) => {
  if (!equipment) return undefined;
  const normalized: NonNullable<Aquarium['equipment']> = {};
  if (equipment.filter) normalized.filter = equipment.filter;
  if (typeof equipment.heater === 'boolean') normalized.heater = equipment.heater;
  if (typeof equipment.oxygen === 'boolean') normalized.oxygen = equipment.oxygen;
  if (equipment.light) normalized.light = equipment.light;
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

export const normalizeAquariumRecord = (aquarium: Partial<Aquarium>, index = 0): Aquarium => ({
  id: nonEmpty(aquarium.id) ? aquarium.id : crypto.randomUUID(),
  name: nonEmpty(aquarium.name) ? aquarium.name.trim() : `我的鱼缸 ${index + 1}`,
  fishes: Array.isArray(aquarium.fishes) ? aquarium.fishes : [],
  lastWaterChangeDate: validDate(aquarium.lastWaterChangeDate) ? aquarium.lastWaterChangeDate : undefined,
  waterChangeHistory: Array.isArray(aquarium.waterChangeHistory) ? aquarium.waterChangeHistory : [],
  lastWaterStoredDate: validDate(aquarium.lastWaterStoredDate) ? aquarium.lastWaterStoredDate : undefined,
  dimensions: normalizeDimensions(aquarium.dimensions),
  waterType: aquarium.waterType === 'Freshwater' || aquarium.waterType === 'Saltwater' ? aquarium.waterType : undefined,
  targetTemperature: nonEmpty(aquarium.targetTemperature) && Number.isFinite(Number(aquarium.targetTemperature))
    ? aquarium.targetTemperature.trim()
    : undefined,
  substrate: nonEmpty(aquarium.substrate) ? aquarium.substrate : undefined,
  plants: Array.isArray(aquarium.plants) ? aquarium.plants : [],
  hardscape: Array.isArray(aquarium.hardscape) ? aquarium.hardscape : [],
  equipment: normalizeEquipment(aquarium.equipment),
  startedAt: validDate(aquarium.startedAt) ? aquarium.startedAt : undefined,
  startedAtSource: aquarium.startedAtSource,
  startedAtConfirmedAt: validDate(aquarium.startedAtConfirmedAt) ? aquarium.startedAtConfirmedAt : undefined,
});

export const createAquariumDraft = (name = '我的鱼缸', now = new Date()): Omit<Aquarium, 'id'> => ({
  name,
  fishes: [],
  startedAt: now.toISOString().slice(0, 10),
  startedAtSource: 'created',
});

export const getAquariumSetupStatus = (aquarium: Aquarium): AquariumSetupStatus => {
  const dimensionsComplete = Boolean(
    nonEmpty(aquarium.dimensions?.length)
    && nonEmpty(aquarium.dimensions?.width)
    && nonEmpty(aquarium.dimensions?.height),
  );
  const waterTypeKnown = aquarium.waterType === 'Freshwater' || aquarium.waterType === 'Saltwater';
  const temperatureKnown = nonEmpty(aquarium.targetTemperature) && Number.isFinite(Number(aquarium.targetTemperature));
  const filterKnown = aquarium.equipment?.filter !== undefined;
  const hasAnyConfiguration = Boolean(
    aquarium.dimensions
    || aquarium.waterType
    || aquarium.targetTemperature
    || aquarium.substrate
    || aquarium.equipment
    || aquarium.lastWaterChangeDate
    || aquarium.lastWaterStoredDate
    || aquarium.plants?.length
    || aquarium.hardscape?.length,
  );

  if (!hasAnyConfiguration && aquarium.fishes.length === 0) return 'empty';
  if (!dimensionsComplete || !waterTypeKnown) return 'incomplete';
  if (temperatureKnown && filterKnown) return 'complete';
  return 'usable';
};

import type { Aquarium } from '../../types';
import type { FlowLevel, TankContext } from './environment.types';

export type TankContextOverrides = {
  lowestObservedTemperature?: number;
  highestObservedTemperature?: number;
  ph?: number;
  surfaceAgitation?: FlowLevel;
  co2?: boolean;
  stockingLoadRate?: number;
};

const getAquariumVolumeLiters = (aquarium: Aquarium) => {
  const length = Number(aquarium.dimensions?.length);
  const width = Number(aquarium.dimensions?.width);
  const height = Number(aquarium.dimensions?.height);
  if (![length, width, height].every(value => Number.isFinite(value) && value > 0)) return undefined;
  return Math.round((length * width * height * 0.85) / 1000);
};

const inferSurfaceAgitation = (aquarium: Aquarium): FlowLevel => {
  const filter = aquarium.equipment?.filter;
  if (!filter || filter === '无') return 'unknown';
  if (filter === '瀑布过滤' || filter === '上滤') return 'medium';
  if (filter === '海绵过滤' && aquarium.equipment?.oxygen) return 'medium';
  return 'unknown';
};

const toFiniteNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const buildTankContext = (
  aquarium: Aquarium,
  overrides: TankContextOverrides = {},
): TankContext => ({
  water: {
    type: aquarium.waterType === 'Saltwater'
      ? 'saltwater'
      : aquarium.waterType === 'Freshwater'
        ? 'freshwater'
        : undefined,
    volumeLiters: getAquariumVolumeLiters(aquarium),
    targetTemperature: toFiniteNumber(aquarium.targetTemperature),
    lowestObservedTemperature: toFiniteNumber(overrides.lowestObservedTemperature),
    highestObservedTemperature: toFiniteNumber(overrides.highestObservedTemperature),
    ph: toFiniteNumber(overrides.ph),
  },
  habitat: {
    substrate: aquarium.substrate,
    plants: aquarium.plants || [],
    hardscape: aquarium.hardscape || [],
  },
  equipment: {
    filterType: aquarium.equipment?.filter,
    heater: aquarium.equipment?.heater,
    airPump: aquarium.equipment?.oxygen,
    light: aquarium.equipment?.light,
    co2: overrides.co2,
    surfaceAgitation: overrides.surfaceAgitation || inferSurfaceAgitation(aquarium),
  },
  stocking: {
    loadRate: toFiniteNumber(overrides.stockingLoadRate),
    speciesIds: (aquarium.fishes || []).map(item => item.fishId),
  },
});

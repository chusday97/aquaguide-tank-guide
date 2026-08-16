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

export type AquariumSetupFacts = {
  dimensionsKnown: boolean;
  waterTypeKnown: boolean;
  temperatureKnown: boolean;
  substrateKnown: boolean;
  filterKnown: boolean;
  lightKnown: boolean;
  heaterKnown: boolean;
  oxygenKnown: boolean;
};

// Answer presence is intentionally different from truthiness:
// undefined means unknown, while "无" and false are explicit user answers.
export const getAquariumSetupFacts = (aquarium: Partial<Aquarium>): AquariumSetupFacts => ({
  dimensionsKnown: Boolean(
    nonEmpty(aquarium.dimensions?.length)
    && nonEmpty(aquarium.dimensions?.width)
    && nonEmpty(aquarium.dimensions?.height),
  ),
  waterTypeKnown: aquarium.waterType === 'Freshwater' || aquarium.waterType === 'Saltwater',
  temperatureKnown: nonEmpty(aquarium.targetTemperature) && Number.isFinite(Number(aquarium.targetTemperature)),
  substrateKnown: nonEmpty(aquarium.substrate),
  filterKnown: nonEmpty(aquarium.equipment?.filter),
  lightKnown: nonEmpty(aquarium.equipment?.light),
  heaterKnown: typeof aquarium.equipment?.heater === 'boolean',
  oxygenKnown: typeof aquarium.equipment?.oxygen === 'boolean',
});

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
  const facts = getAquariumSetupFacts(aquarium);
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
  if (!facts.dimensionsKnown || !facts.waterTypeKnown) return 'incomplete';
  if (facts.temperatureKnown && facts.filterKnown) return 'complete';
  return 'usable';
};


export type AquariumAiSetupPanel = 'size' | 'parameters' | 'equipment';

export type AquariumAiMissingField = {
  key: 'dimensions' | 'waterType' | 'temperature' | 'filter';
  label: string;
  panel: AquariumAiSetupPanel;
};

export const AQUARIUM_QUICK_SETUP_PRESETS = {
  dimensions: [
    { id: '20l', label: '40×25×20 cm · 20L', dimensions: { length: '40', width: '25', height: '20' } },
    { id: '34l', label: '45×30×25 cm · 34L', dimensions: { length: '45', width: '30', height: '25' } },
    { id: '45l', label: '50×30×30 cm · 45L', dimensions: { length: '50', width: '30', height: '30' } },
    { id: '63l', label: '60×30×35 cm · 63L', dimensions: { length: '60', width: '30', height: '35' } },
    { id: '90l', label: '75×40×30 cm · 90L', dimensions: { length: '75', width: '40', height: '30' } },
  ],
  temperaturesC: [22, 24, 25, 26, 28],
  filters: ['无', '瀑布过滤', '海绵过滤', '上滤', '桶滤'] as const,
} as const;

export const getAquariumAiReadiness = (aquarium: Aquarium) => {
  const missing: AquariumAiMissingField[] = [];
  const facts = getAquariumSetupFacts(aquarium);
  if (!facts.dimensionsKnown) missing.push({ key: 'dimensions', label: '鱼缸尺寸 / 容量', panel: 'size' });
  if (!facts.waterTypeKnown) {
    missing.push({ key: 'waterType', label: '水体类型', panel: 'parameters' });
  }
  if (!facts.temperatureKnown) {
    missing.push({ key: 'temperature', label: '目标水温', panel: 'parameters' });
  }
  if (!facts.filterKnown) {
    missing.push({ key: 'filter', label: '过滤设备', panel: 'equipment' });
  }
  return {
    ready: missing.length === 0,
    missing,
    firstPanel: missing[0]?.panel,
  };
};
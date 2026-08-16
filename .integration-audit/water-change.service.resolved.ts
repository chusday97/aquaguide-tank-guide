import type { Aquarium } from '../../types';

const WATER_CHANGE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type WaterChangeEventLike = {
  aquariumId: string;
  eventType: string;
  sourceType?: string;
  sourceId?: string;
};

const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidDateKey = (value: string) => {
  if (!WATER_CHANGE_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day;
};

export const isFutureWaterChangeDate = (dateKey: string, now = new Date()) => (
  !isValidDateKey(dateKey) || dateKey > toLocalDateKey(now)
);

const normalizeWaterChangeHistory = (history: string[], now = new Date()) => (
  Array.from(new Set(
    history.filter(dateKey => isValidDateKey(dateKey) && !isFutureWaterChangeDate(dateKey, now)),
  )).sort()
);

export const setWaterChangeDateRecorded = (
  history: string[],
  dateKey: string,
  recorded: boolean,
  now = new Date(),
) => {
  const normalized = normalizeWaterChangeHistory(history, now);
  if (isFutureWaterChangeDate(dateKey, now)) return normalized;
  if (recorded) return Array.from(new Set([...normalized, dateKey])).sort();
  return normalized.filter(item => item !== dateKey);
};

export const toggleWaterChangeDate = (history: string[], dateKey: string, now = new Date()) => (
  setWaterChangeDateRecorded(history, dateKey, !normalizeWaterChangeHistory(history, now).includes(dateKey), now)
);

export const getLatestWaterChangeDate = (history: string[], now = new Date()) => {
  const normalized = normalizeWaterChangeHistory(history, now);
  return normalized.at(-1);
};

export const getWaterChangeHistoryFromEvents = (aquariumId: string, events: WaterChangeEventLike[]) => (
  Array.from(new Set(events
    .filter(event => event.aquariumId === aquariumId
      && event.eventType === 'water_change'
      && event.sourceType === 'water_change_day'
      && typeof event.sourceId === 'string'
      && isValidDateKey(event.sourceId))
    .map(event => event.sourceId as string)))
    .sort()
);

export const waterChangeDateToIso = (dateKey: string) => {
  if (!isValidDateKey(dateKey)) return undefined;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();
};

export const applyWaterChangeHistory = (
  aquarium: Aquarium,
  history: string[],
  now = new Date(),
): Aquarium => {
  const normalizedHistory = normalizeWaterChangeHistory(history, now);
  const latestDate = getLatestWaterChangeDate(normalizedHistory, now);
  const latestIso = latestDate ? waterChangeDateToIso(latestDate) : undefined;

  return {
    ...aquarium,
    waterChangeHistory: normalizedHistory,
    lastWaterChangeDate: latestIso,
    fishes: aquarium.fishes.map(fish => ({
      ...fish,
      lastWaterChangeDate: latestIso,
    })),
  };
};

export const hydrateAquariumWaterChangeHistory = (
  aquarium: Aquarium,
  events: WaterChangeEventLike[],
  now = new Date(),
): Aquarium => (
  applyWaterChangeHistory(aquarium, getWaterChangeHistoryFromEvents(aquarium.id, events), now)
);

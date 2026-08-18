import type { Aquarium } from '../../types';

const WATER_CHANGE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

export const toggleWaterChangeDate = (history: string[], dateKey: string) => {
  const normalized = Array.from(new Set(history.filter(isValidDateKey))).sort();
  if (normalized.includes(dateKey)) return normalized.filter(item => item !== dateKey);
  if (!isValidDateKey(dateKey)) return normalized;
  return [...normalized, dateKey].sort();
};

export const getLatestWaterChangeDate = (history: string[]) => {
  const normalized = Array.from(new Set(history.filter(isValidDateKey))).sort();
  return normalized.at(-1);
};

export const waterChangeDateToIso = (dateKey: string) => {
  if (!isValidDateKey(dateKey)) return undefined;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();
};

export const applyWaterChangeHistory = (aquarium: Aquarium, history: string[]): Aquarium => {
  const normalizedHistory = Array.from(new Set(history.filter(isValidDateKey))).sort();
  const latestDate = getLatestWaterChangeDate(normalizedHistory);
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

type WaterChangeCareEvent = {
  aquariumId?: string;
  eventType: string;
  sourceType?: string;
  sourceId?: string;
};

export const hydrateWaterChangeHistoryFromEvents = (
  aquarium: Aquarium,
  events: WaterChangeCareEvent[],
): Aquarium => {
  const fallbackHistory = [...(aquarium.waterChangeHistory || [])];
  if (aquarium.lastWaterChangeDate) {
    const parsed = new Date(aquarium.lastWaterChangeDate);
    if (!Number.isNaN(parsed.getTime())) fallbackHistory.push(toLocalDateKey(parsed));
  }

  const persistedHistory = events
    .filter(event => (
      event.aquariumId === aquarium.id
      && event.eventType === 'water_change'
      && event.sourceType === 'water_change_day'
      && typeof event.sourceId === 'string'
      && isValidDateKey(event.sourceId)
    ))
    .map(event => event.sourceId as string);

  return applyWaterChangeHistory(aquarium, [...fallbackHistory, ...persistedHistory]);
};
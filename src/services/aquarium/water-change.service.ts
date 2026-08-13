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

const normalizeWaterChangeHistory = (history: string[], now = new Date()) => (
  Array.from(new Set(history.filter(dateKey => isValidDateKey(dateKey) && !isFutureWaterChangeDate(dateKey, now)))).sort()
);

export const toggleWaterChangeDate = (history: string[], dateKey: string, now = new Date()) => {
  const normalized = normalizeWaterChangeHistory(history, now);
  if (normalized.includes(dateKey)) return normalized.filter(item => item !== dateKey);
  if (isFutureWaterChangeDate(dateKey, now)) return normalized;
  return [...normalized, dateKey].sort();
};

export const getLatestWaterChangeDate = (history: string[], now = new Date()) => {
  const normalized = normalizeWaterChangeHistory(history, now);
  return normalized.at(-1);
};

export const waterChangeDateToIso = (dateKey: string) => {
  if (!isValidDateKey(dateKey)) return undefined;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0).toISOString();
};

export const applyWaterChangeHistory = (aquarium: Aquarium, history: string[], now = new Date()): Aquarium => {
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

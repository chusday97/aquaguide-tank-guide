import type { Aquarium, DeceasedRecord } from '../../types';
import { decrementSpeciesBatch, normalizeSpeciesBatches } from '../aquarium/species-batches.service';
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';

export type MemorialRecordInput = {
  fishId: string;
  date: string;
  reason: string;
  observation?: string;
  improvement?: string;
};

export type MemorialRecordUpdateInput = {
  id: string;
  date?: string;
  reason?: string;
  observation?: string;
  improvement?: string;
};

const normalizeRecords = (value: unknown[]): DeceasedRecord[] => value.filter((item): item is DeceasedRecord => {
  if (!item || typeof item !== 'object') return false;
  const record = item as Partial<DeceasedRecord>;
  return typeof record.id === 'string' && typeof record.fishId === 'string' && typeof record.date === 'string';
});

const createRecordId = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)
);

export const recordSpeciesMemorial = ({ fishId, date, reason, observation, improvement }: MemorialRecordInput) => {
  const normalizedReason = reason.trim();
  if (!fishId || !date || !normalizedReason) {
    throw new Error('请填写日期和原因后再保存。');
  }

  const current = loadAppStateFromStorage();
  const record: DeceasedRecord = {
    id: createRecordId(),
    fishId,
    date: new Date(`${date}T12:00:00`).toISOString(),
    reason: normalizedReason,
    observation: observation?.trim() || undefined,
    improvement: improvement?.trim() || undefined,
    version: 1,
  };
  const records = [...normalizeRecords(current.deceasedRecords), record];
  patchLocalAppState({ deceasedRecords: records });

  const saved = normalizeRecords(loadAppStateFromStorage().deceasedRecords);
  if (!saved.some(item => item.id === record.id)) {
    throw new Error('记录没有保存成功，请检查浏览器存储权限后重试。');
  }
  return { record, records: saved };
};

export const updateSpeciesMemorial = (input: MemorialRecordUpdateInput) => {
  const current = loadAppStateFromStorage();
  const records = normalizeRecords(current.deceasedRecords);
  const existing = records.find(item => item.id === input.id);
  if (!existing) throw new Error('没有找到这条生命纪念。');

  const next: DeceasedRecord = {
    ...existing,
    date: input.date ? new Date(`${input.date.slice(0, 10)}T12:00:00`).toISOString() : existing.date,
    reason: input.reason !== undefined ? input.reason.trim() || undefined : existing.reason,
    observation: input.observation !== undefined ? input.observation.trim() || undefined : existing.observation,
    improvement: input.improvement !== undefined ? input.improvement.trim() || undefined : existing.improvement,
    version: (existing.version || 1) + 1,
  };
  const nextRecords = records.map(item => item.id === input.id ? next : item);
  patchLocalAppState({ deceasedRecords: nextRecords });
  const saved = normalizeRecords(loadAppStateFromStorage().deceasedRecords).find(item => item.id === input.id);
  if (!saved) throw new Error('复盘没有保存成功，请检查浏览器存储权限后重试。');
  return saved;
};

export const recordSpeciesMemorialAndDecrementBatch = (input: MemorialRecordInput & {
  aquariumId: string;
  aquariumFishId: string;
  batchId: string;
}) => {
  const normalizedReason = input.reason.trim();
  if (!input.fishId || !input.date || !normalizedReason) throw new Error('请填写日期和原因后再保存。');
  const current = loadAppStateFromStorage();
  const aquarium = current.aquariums.find(item => item.id === input.aquariumId);
  const aquariumFish = aquarium?.fishes.find(item => item.id === input.aquariumFishId);
  if (!aquarium || !aquariumFish) throw new Error('没有找到需要更新的缸内物种。');
  if (aquariumFish.fishId !== input.fishId) throw new Error('所选物种与缸内记录不一致。');
  if (!normalizeSpeciesBatches(aquariumFish).some(batch => batch.id === input.batchId)) throw new Error('请选择记录减少数量的批次。');

  const nextFish = decrementSpeciesBatch(aquariumFish, input.batchId);
  const nextAquarium: Aquarium = {
    ...aquarium,
    fishes: nextFish
      ? aquarium.fishes.map(item => item.id === aquariumFish.id ? nextFish : item)
      : aquarium.fishes.filter(item => item.id !== aquariumFish.id),
  };
  const record: DeceasedRecord = {
    id: createRecordId(),
    fishId: input.fishId,
    date: new Date(`${input.date}T12:00:00`).toISOString(),
    reason: normalizedReason,
    observation: input.observation?.trim() || undefined,
    improvement: input.improvement?.trim() || undefined,
    version: 1,
  };
  const records = [...normalizeRecords(current.deceasedRecords), record];
  const aquariums = current.aquariums.map(item => item.id === aquarium.id ? nextAquarium : item);
  patchLocalAppState({ aquariums, deceasedRecords: records });
  const saved = loadAppStateFromStorage();
  if (!normalizeRecords(saved.deceasedRecords).some(item => item.id === record.id)) throw new Error('生命纪念没有保存成功，请重试。');
  return { record, records: normalizeRecords(saved.deceasedRecords), aquariums: saved.aquariums };
};

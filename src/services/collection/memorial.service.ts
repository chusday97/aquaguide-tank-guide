import type { Aquarium, DeceasedRecord, MemorialCauseCode } from '../../types';
import { decrementSpeciesBatch, normalizeSpeciesBatches } from '../aquarium/species-batches.service';
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';

export type MemorialRecordInput = {
  fishId: string;
  date: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
};

export type MemorialRecordUpdateInput = {
  id: string;
  date?: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
};

const causeCodeSet = new Set<MemorialCauseCode>([
  'water_quality_change', 'oxygen_shortage', 'temperature_stress', 'acclimation_stress',
  'aggression_or_injury', 'feeding_or_digestive', 'suspected_illness',
  'recent_medication_or_change', 'age_related', 'unknown', 'other',
]);

const normalizeCauseCodes = (value: unknown): MemorialCauseCode[] => {
  if (!Array.isArray(value)) return [];
  const codes = Array.from(new Set(value.filter((item): item is MemorialCauseCode => (
    typeof item === 'string' && causeCodeSet.has(item as MemorialCauseCode)
  )))).slice(0, 5);
  return codes.includes('unknown') ? ['unknown'] : codes;
};

const validateCause = (causeCodes: MemorialCauseCode[], reason?: string) => {
  if (causeCodes.length === 0 && !reason?.trim()) throw new Error('请选择一个可能原因，或填写自定义原因。');
  if (causeCodes.includes('other') && !reason?.trim()) throw new Error('选择“其他”后，请补充自定义原因。');
};

const normalizeRecords = (value: unknown[]): DeceasedRecord[] => value.map(item => {
  if (!item || typeof item !== 'object') return false;
  const record = item as Partial<DeceasedRecord>;
  if (typeof record.id !== 'string' || typeof record.fishId !== 'string' || typeof record.date !== 'string') return false;
  return { ...record, causeCodes: normalizeCauseCodes(record.causeCodes) } as DeceasedRecord;
}).filter((item): item is DeceasedRecord => Boolean(item));

const createRecordId = () => (
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)
);

export const recordSpeciesMemorial = ({ fishId, date, causeCodes, reason, observation, improvement }: MemorialRecordInput) => {
  const normalizedReason = reason?.trim();
  const normalizedCauseCodes = normalizeCauseCodes(causeCodes);
  if (!fishId || !date) throw new Error('请选择记录日期。');
  validateCause(normalizedCauseCodes, normalizedReason);

  const current = loadAppStateFromStorage();
  const record: DeceasedRecord = {
    id: createRecordId(),
    fishId,
    date: new Date(`${date}T12:00:00`).toISOString(),
    causeCodes: normalizedCauseCodes,
    reason: normalizedReason || undefined,
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
    causeCodes: input.causeCodes !== undefined ? normalizeCauseCodes(input.causeCodes) : existing.causeCodes,
    reason: input.reason !== undefined ? input.reason.trim() || undefined : existing.reason,
    observation: input.observation !== undefined ? input.observation.trim() || undefined : existing.observation,
    improvement: input.improvement !== undefined ? input.improvement.trim() || undefined : existing.improvement,
    version: (existing.version || 1) + 1,
  };
  validateCause(next.causeCodes || [], next.reason);
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
  const normalizedReason = input.reason?.trim();
  const normalizedCauseCodes = normalizeCauseCodes(input.causeCodes);
  if (!input.fishId || !input.date) throw new Error('请选择记录日期。');
  validateCause(normalizedCauseCodes, normalizedReason);
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
    causeCodes: normalizedCauseCodes,
    reason: normalizedReason || undefined,
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

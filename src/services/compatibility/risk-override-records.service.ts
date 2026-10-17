import type { TankCompatibilityStatus } from './compatibility.service';
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';

export const LEGACY_RISK_OVERRIDE_STORAGE_KEY = 'aquaguide:risk-overrides:v1';
const MAX_RISK_OVERRIDE_RECORDS = 100;

export interface RiskOverrideSpecies {
  fishId: string;
  name: string;
  quantity: number;
}

export interface RiskOverrideReason {
  code: string;
  title: string;
  evidence?: string;
  severity?: string;
}

export interface RiskOverrideRecord {
  id: string;
  aquariumId: string;
  species: RiskOverrideSpecies[];
  status: TankCompatibilityStatus;
  reasons: RiskOverrideReason[];
  ruleVersion: string;
  confirmedAt: string;
}

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const isRiskOverrideRecord = (value: unknown): value is RiskOverrideRecord => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<RiskOverrideRecord>;
  return isNonEmptyString(record.id)
    && isNonEmptyString(record.aquariumId)
    && Array.isArray(record.species)
    && record.species.length > 0
    && record.species.every(item => (
      Boolean(item)
      && typeof item === 'object'
      && isNonEmptyString((item as Partial<RiskOverrideSpecies>).fishId)
      && isNonEmptyString((item as Partial<RiskOverrideSpecies>).name)
      && Number.isFinite((item as Partial<RiskOverrideSpecies>).quantity)
      && Number((item as Partial<RiskOverrideSpecies>).quantity) > 0
    ))
    && ['compatible', 'caution', 'not_recommended', 'insufficient_data'].includes(String(record.status))
    && Array.isArray(record.reasons)
    && isNonEmptyString(record.ruleVersion)
    && isNonEmptyString(record.confirmedAt);
};

const readLegacyRiskOverrideRecords = (): RiskOverrideRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_RISK_OVERRIDE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isRiskOverrideRecord) : [];
  } catch {
    return [];
  }
};

const mergeById = (current: RiskOverrideRecord[], legacy: RiskOverrideRecord[]) => {
  const merged = new Map<string, RiskOverrideRecord>();
  [...legacy, ...current].forEach(record => merged.set(record.id, record));
  return [...merged.values()]
    .sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt))
    .slice(0, MAX_RISK_OVERRIDE_RECORDS);
};

export const getRiskOverrideRecords = (): RiskOverrideRecord[] => {
  const state = loadAppStateFromStorage();
  const current = (state.riskOverrideRecords || []).filter(isRiskOverrideRecord);
  const legacy = readLegacyRiskOverrideRecords();
  if (legacy.length === 0) return current;

  const merged = mergeById(current, legacy);
  patchLocalAppState({ riskOverrideRecords: merged });
  try {
    window.localStorage.removeItem(LEGACY_RISK_OVERRIDE_STORAGE_KEY);
  } catch {
    // The canonical App State write already succeeded; legacy cleanup is best-effort.
  }
  return merged;
};

export const recordRiskOverride = (
  input: Omit<RiskOverrideRecord, 'id' | 'confirmedAt'>,
): RiskOverrideRecord => {
  if (!isNonEmptyString(input.aquariumId) || input.species.length === 0) {
    throw new Error('高风险确认记录缺少鱼缸或物种信息。');
  }

  const record: RiskOverrideRecord = {
    ...input,
    id: crypto.randomUUID(),
    confirmedAt: new Date().toISOString(),
  };
  const existing = getRiskOverrideRecords();
  patchLocalAppState({
    riskOverrideRecords: [record, ...existing.filter(item => item.id !== record.id)].slice(0, MAX_RISK_OVERRIDE_RECORDS),
  });
  return record;
};

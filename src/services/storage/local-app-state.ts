import type { Aquarium, OnboardingState } from '../../types';
import type { DiscoveryDeckState } from '../../modules/recommendation/recommendation.schema';
import { notifyDataRecovery } from '../diagnostics/ui-failure.service';
import type { CareEventType } from '../../types/database';

export const AQUARIUM_APP_STATE_KEY = 'aquarium_app_state_v1';
export const AQUARIUM_APP_STATE_VERSION = 1;
export const APP_STATE_CHANGED_EVENT = 'aquaguide:app-state-changed';
export const LOCAL_APP_STATE_IMPORT_MAX_BYTES = 4 * 1024 * 1024;

const LOCAL_APP_STATE_IMPORT_KEYS = new Set([
  'version',
  'currentAquariumId',
  'aquariums',
  'wishlist',
  'dismissedRecommendations',
  'diagnosisRecords',
  'compatibilityRecords',
  'deceasedRecords',
  'feedingRecords',
  'observationRecords',
  'careEvents',
  'riskReminderState',
  'discoveryState',
  'onboarding',
  'cloudMigrationConfirmed',
  'updatedAt',
]);

const LOCAL_APP_STATE_IMPORT_DATA_KEYS = new Set([
  'aquariums',
  'wishlist',
  'dismissedRecommendations',
  'diagnosisRecords',
  'compatibilityRecords',
  'deceasedRecords',
  'feedingRecords',
  'observationRecords',
  'careEvents',
  'riskReminderState',
  'discoveryState',
  'onboarding',
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const isStringArray = (value: unknown) => Array.isArray(value) && value.every(item => typeof item === 'string');

const isImportableAquarium = (value: unknown) => {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== 'string' || typeof value.name !== 'string' || !Array.isArray(value.fishes)) return false;
  return value.fishes.every(fish => (
    isPlainObject(fish)
    && typeof fish.id === 'string'
    && typeof fish.fishId === 'string'
    && Number.isInteger(fish.quantity)
    && Number(fish.quantity) >= 0
    && (fish.entryDate === undefined || typeof fish.entryDate === 'string')
    && (fish.batches === undefined || Array.isArray(fish.batches))
  ));
};

const validateImportShape = (value: unknown): Partial<LocalAppState> => {
  if (!isPlainObject(value)) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  const keys = Object.keys(value);
  if (!keys.some(key => LOCAL_APP_STATE_IMPORT_KEYS.has(key))) throw new Error('UNRECOGNIZED_LOCAL_APP_STATE_IMPORT');
  if (!keys.some(key => LOCAL_APP_STATE_IMPORT_DATA_KEYS.has(key))) throw new Error('EMPTY_LOCAL_APP_STATE_IMPORT');
  if (value.version !== undefined && value.version !== AQUARIUM_APP_STATE_VERSION) {
    throw new Error('UNSUPPORTED_LOCAL_APP_STATE_VERSION');
  }
  if (value.currentAquariumId !== undefined && typeof value.currentAquariumId !== 'string') throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  if (value.aquariums !== undefined && (!Array.isArray(value.aquariums) || !value.aquariums.every(isImportableAquarium))) {
    throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  }
  for (const key of ['diagnosisRecords', 'compatibilityRecords', 'deceasedRecords'] as const) {
    if (value[key] !== undefined && !Array.isArray(value[key])) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  }
  for (const key of ['wishlist', 'dismissedRecommendations'] as const) {
    if (value[key] !== undefined && !isStringArray(value[key])) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  }
  for (const key of ['feedingRecords', 'observationRecords', 'careEvents'] as const) {
    if (value[key] !== undefined && !Array.isArray(value[key])) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  }
  if (value.riskReminderState !== undefined && !isPlainObject(value.riskReminderState)) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  if (value.discoveryState !== undefined && !isPlainObject(value.discoveryState)) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  if (value.onboarding !== undefined && !isPlainObject(value.onboarding)) throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  if (value.updatedAt !== undefined && typeof value.updatedAt !== 'string') throw new Error('INVALID_LOCAL_APP_STATE_IMPORT');
  return value as Partial<LocalAppState>;
};

export type LocalEventRecord = {
  id: string;
  aquariumId: string;
  createdAt: string;
  type: string;
  note?: string;
};

export type LocalCareEventRecord = {
  id: string;
  aquariumId: string;
  eventType: CareEventType;
  title: string;
  label?: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  sourceType?: string;
  sourceId?: string;
  isInferred: boolean;
};

export type LocalAppState = {
  version: 1;
  currentAquariumId: string;
  aquariums: Aquarium[];
  wishlist: string[];
  dismissedRecommendations: string[];
  diagnosisRecords: unknown[];
  compatibilityRecords: unknown[];
  deceasedRecords: unknown[];
  feedingRecords: LocalEventRecord[];
  observationRecords: LocalEventRecord[];
  careEvents?: LocalCareEventRecord[];
  riskReminderState: Record<string, string>;
  discoveryState?: DiscoveryDeckState;
  onboarding?: OnboardingState;
  cloudMigrationConfirmed?: boolean;
  updatedAt: string;
};

const safeParse = <T,>(value: string | null, fallback: T, resource = 'local-storage'): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    notifyDataRecovery(resource, error);
    return fallback;
  }
};

const readLegacyArray = <T,>(key: string): T[] => {
  const parsed = safeParse<unknown>(localStorage.getItem(key), [], key);
  return Array.isArray(parsed) ? parsed as T[] : [];
};

const createEmptyState = (): LocalAppState => ({
  version: AQUARIUM_APP_STATE_VERSION,
  currentAquariumId: '',
  aquariums: [],
  wishlist: [],
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  updatedAt: new Date().toISOString(),
});

const normalizeState = (value: Partial<LocalAppState> | null | undefined): LocalAppState => {
  const fallback = createEmptyState();
  return {
    version: AQUARIUM_APP_STATE_VERSION,
    currentAquariumId: typeof value?.currentAquariumId === 'string' ? value.currentAquariumId : fallback.currentAquariumId,
    aquariums: Array.isArray(value?.aquariums) ? value.aquariums : fallback.aquariums,
    wishlist: Array.isArray(value?.wishlist) ? value.wishlist : fallback.wishlist,
    dismissedRecommendations: Array.isArray(value?.dismissedRecommendations) ? value.dismissedRecommendations : fallback.dismissedRecommendations,
    diagnosisRecords: Array.isArray(value?.diagnosisRecords) ? value.diagnosisRecords : fallback.diagnosisRecords,
    compatibilityRecords: Array.isArray(value?.compatibilityRecords) ? value.compatibilityRecords : fallback.compatibilityRecords,
    deceasedRecords: Array.isArray(value?.deceasedRecords) ? value.deceasedRecords : fallback.deceasedRecords,
    feedingRecords: Array.isArray(value?.feedingRecords) ? value.feedingRecords : fallback.feedingRecords,
    observationRecords: Array.isArray(value?.observationRecords) ? value.observationRecords : fallback.observationRecords,
    careEvents: Array.isArray(value?.careEvents) ? value.careEvents : fallback.careEvents,
    riskReminderState: value?.riskReminderState && typeof value.riskReminderState === 'object' ? value.riskReminderState : fallback.riskReminderState,
    discoveryState: value?.discoveryState,
    onboarding: value?.onboarding ? {
      ...value.onboarding,
      aquariumConfigured: value.onboarding.aquariumConfigured ?? value.onboarding.status === 'completed',
    } : undefined,
    cloudMigrationConfirmed: value?.cloudMigrationConfirmed === true,
    updatedAt: typeof value?.updatedAt === 'string' ? value.updatedAt : fallback.updatedAt,
  };
};

let pendingTimer: number | null = null;
let pendingState: LocalAppState | null = null;
let pendingExpectedUpdatedAt: string | null = null;

const getStoredPrimaryUpdatedAt = () => {
  const raw = localStorage.getItem(AQUARIUM_APP_STATE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LocalAppState> | null;
    return typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : null;
  } catch {
    return null;
  }
};

const assertExpectedRevision = (expectedUpdatedAt?: string | null) => {
  if (!expectedUpdatedAt) return;
  const storedUpdatedAt = getStoredPrimaryUpdatedAt();
  if (storedUpdatedAt && storedUpdatedAt !== expectedUpdatedAt) {
    throw new Error('STALE_APP_STATE_WRITE');
  }
};

const emitAppStateChanged = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(APP_STATE_CHANGED_EVENT));
};

export const loadAppStateFromStorage = (): LocalAppState => {
  const stored = safeParse<Partial<LocalAppState> | null>(localStorage.getItem(AQUARIUM_APP_STATE_KEY), null, AQUARIUM_APP_STATE_KEY);
  if (stored) return normalizeState(stored);

  return normalizeState({
    currentAquariumId: '',
    aquariums: readLegacyArray<Aquarium>('aquariums'),
    wishlist: readLegacyArray<string>('wishlistFishIds'),
    diagnosisRecords: readLegacyArray<unknown>('aquarium_diagnosis_records'),
    deceasedRecords: readLegacyArray<unknown>('deceasedRecords'),
    discoveryState: safeParse<DiscoveryDeckState | undefined>(localStorage.getItem('aquapediaDiscoveryDeck'), undefined, 'aquapediaDiscoveryDeck'),
  });
};

export const saveAppStateToStorage = (
  appState: LocalAppState,
  options: { debounce?: boolean; expectedUpdatedAt?: string | null } = {},
) => {
  const normalized = normalizeState({ ...appState, updatedAt: new Date().toISOString() });
  const write = (expectedUpdatedAt?: string | null) => {
    try {
      assertExpectedRevision(expectedUpdatedAt);
      localStorage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify(normalized));
      localStorage.setItem('aquariums', JSON.stringify(normalized.aquariums));
      localStorage.setItem('wishlistFishIds', JSON.stringify(normalized.wishlist));
      localStorage.setItem('aquarium_diagnosis_records', JSON.stringify(normalized.diagnosisRecords));
      localStorage.setItem('deceasedRecords', JSON.stringify(normalized.deceasedRecords));
      if (normalized.discoveryState) {
        localStorage.setItem('aquapediaDiscoveryDeck', JSON.stringify(normalized.discoveryState));
      }
      emitAppStateChanged();
    } catch (error) {
      console.warn('AquaGuide local app state save failed', error);
      throw error instanceof Error ? error : new Error('本地数据没有保存成功。');
    }
  };

  if (!options.debounce) {
    if (pendingTimer !== null) window.clearTimeout(pendingTimer);
    pendingTimer = null;
    try {
      write(options.expectedUpdatedAt);
      return normalized;
    } finally {
      pendingState = null;
      pendingExpectedUpdatedAt = null;
    }
  }

  pendingState = normalized;
  pendingExpectedUpdatedAt = options.expectedUpdatedAt ?? pendingExpectedUpdatedAt ?? appState.updatedAt;
  if (pendingTimer !== null) window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(() => {
    if (pendingState) {
      try {
        assertExpectedRevision(pendingExpectedUpdatedAt);
        localStorage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify(pendingState));
        localStorage.setItem('aquariums', JSON.stringify(pendingState.aquariums));
        localStorage.setItem('wishlistFishIds', JSON.stringify(pendingState.wishlist));
        localStorage.setItem('aquarium_diagnosis_records', JSON.stringify(pendingState.diagnosisRecords));
        localStorage.setItem('deceasedRecords', JSON.stringify(pendingState.deceasedRecords));
        if (pendingState.discoveryState) {
          localStorage.setItem('aquapediaDiscoveryDeck', JSON.stringify(pendingState.discoveryState));
        }
        emitAppStateChanged();
      } catch (error) {
        console.warn('AquaGuide local app state debounced save failed', error);
        notifyDataRecovery(AQUARIUM_APP_STATE_KEY, error);
        emitAppStateChanged();
      }
    }
    pendingTimer = null;
    pendingState = null;
    pendingExpectedUpdatedAt = null;
  }, 700);
  return normalized;
};

export const patchLocalAppState = (patch: Partial<LocalAppState>, options: { debounce?: boolean } = {}) => {
  const current = pendingState || loadAppStateFromStorage();
  const expectedUpdatedAt = pendingState ? pendingExpectedUpdatedAt : current.updatedAt;
  return saveAppStateToStorage(
    { ...current, ...patch, version: AQUARIUM_APP_STATE_VERSION },
    { ...options, expectedUpdatedAt },
  );
};

export const subscribeToAppState = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  let active = true;
  let scheduled = false;
  const notify = () => {
    if (!active || scheduled) return;
    scheduled = true;
    const run = () => {
      scheduled = false;
      if (active) listener();
    };
    if (typeof queueMicrotask === 'function') queueMicrotask(run);
    else Promise.resolve().then(run);
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === AQUARIUM_APP_STATE_KEY) notify();
  };
  window.addEventListener(APP_STATE_CHANGED_EVENT, notify);
  window.addEventListener('storage', handleStorage);
  return () => {
    active = false;
    window.removeEventListener(APP_STATE_CHANGED_EVENT, notify);
    window.removeEventListener('storage', handleStorage);
  };
};

export const clearLocalAppState = () => {
  try {
    [
      AQUARIUM_APP_STATE_KEY,
      'aquariums',
      'myAquarium',
      'wishlistFishIds',
      'aquarium_diagnosis_records',
      'deceasedRecords',
      'aquapediaDiscoveryDeck',
    ].forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('AquaGuide local app state clear failed', error);
  }
};

export const exportLocalAppState = () => JSON.stringify(loadAppStateFromStorage(), null, 2);

export const importLocalAppState = (json: string) => {
  if (typeof json !== 'string' || new TextEncoder().encode(json).byteLength > LOCAL_APP_STATE_IMPORT_MAX_BYTES) {
    throw new Error('导入失败：本地数据文件过大或格式无效。');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    notifyDataRecovery('local-data-import', error);
    throw new Error('导入失败：不是有效的 AquaGuide 本地数据。');
  }
  const validated = validateImportShape(parsed);
  const current = loadAppStateFromStorage();
  const imported = normalizeState({
    ...validated,
    // Imported data becomes local authority until the user explicitly confirms a cloud migration again.
    cloudMigrationConfirmed: false,
  });
  return saveAppStateToStorage(imported, { expectedUpdatedAt: current.updatedAt });
};

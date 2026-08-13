import type { Aquarium, OnboardingState } from '../../types';
import type { DiscoveryDeckState } from '../../modules/recommendation/recommendation.schema';
import { normalizeSpeciesIds, resolveCanonicalSpeciesId } from '../../modules/species/speciesAliases';
import { notifyDataRecovery } from '../diagnostics/ui-failure.service';
import type { CareEventType } from '../../types/database';

export const AQUARIUM_APP_STATE_KEY = 'aquarium_app_state_v1';
export const AQUARIUM_APP_STATE_VERSION = 1;
export const APP_STATE_CHANGED_EVENT = 'aquaguide:app-state-changed';

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

const normalizeAquariumsSpeciesIds = (aquariums: Aquarium[]) => aquariums.map(aquarium => ({
  ...aquarium,
  fishes: Array.isArray(aquarium?.fishes)
    ? aquarium.fishes.map(fish => ({
      ...fish,
      fishId: resolveCanonicalSpeciesId(fish.fishId),
    }))
    : [],
}));

const normalizeRecordFishId = (record: unknown) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
  const fishId = (record as { fishId?: unknown }).fishId;
  if (typeof fishId !== 'string' || !fishId) return record;
  return { ...record, fishId: resolveCanonicalSpeciesId(fishId) };
};

const normalizeRecordSpeciesIds = (record: unknown) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return record;
  const speciesIds = (record as { speciesIds?: unknown }).speciesIds;
  if (!Array.isArray(speciesIds) || !speciesIds.every(id => typeof id === 'string')) return record;
  return { ...record, speciesIds: normalizeSpeciesIds(speciesIds) };
};

const normalizeDiscoveryStateSpeciesIds = (state: DiscoveryDeckState | undefined) => {
  if (!state || typeof state !== 'object') return state;
  const history = Array.isArray(state.history)
    ? state.history.map(item => (
      item && typeof item === 'object' && typeof item.id === 'string'
        ? { ...item, id: resolveCanonicalSpeciesId(item.id) }
        : item
    )) as DiscoveryDeckState['history']
    : [];
  return {
    ...state,
    queueIds: Array.isArray(state.queueIds)
      ? normalizeSpeciesIds(state.queueIds.filter((id): id is string => typeof id === 'string'))
      : [],
    consumedIds: Array.isArray(state.consumedIds)
      ? normalizeSpeciesIds(state.consumedIds.filter((id): id is string => typeof id === 'string'))
      : [],
    history,
  };
};

export const normalizePersistedSpeciesReferences = (value: Partial<LocalAppState>) => ({
  ...value,
  aquariums: Array.isArray(value.aquariums) ? normalizeAquariumsSpeciesIds(value.aquariums) : value.aquariums,
  wishlist: Array.isArray(value.wishlist)
    ? normalizeSpeciesIds(value.wishlist.filter((id): id is string => typeof id === 'string'))
    : value.wishlist,
  compatibilityRecords: Array.isArray(value.compatibilityRecords)
    ? value.compatibilityRecords.map(normalizeRecordSpeciesIds)
    : value.compatibilityRecords,
  deceasedRecords: Array.isArray(value.deceasedRecords)
    ? value.deceasedRecords.map(normalizeRecordFishId)
    : value.deceasedRecords,
  discoveryState: normalizeDiscoveryStateSpeciesIds(value.discoveryState),
});

const normalizeState = (value: Partial<LocalAppState> | null | undefined): LocalAppState => {
  const fallback = createEmptyState();
  const migrated = normalizePersistedSpeciesReferences(value || {});
  return {
    version: AQUARIUM_APP_STATE_VERSION,
    currentAquariumId: typeof migrated.currentAquariumId === 'string' ? migrated.currentAquariumId : fallback.currentAquariumId,
    aquariums: Array.isArray(migrated.aquariums) ? migrated.aquariums : fallback.aquariums,
    wishlist: Array.isArray(migrated.wishlist) ? migrated.wishlist : fallback.wishlist,
    dismissedRecommendations: Array.isArray(migrated.dismissedRecommendations) ? migrated.dismissedRecommendations : fallback.dismissedRecommendations,
    diagnosisRecords: Array.isArray(migrated.diagnosisRecords) ? migrated.diagnosisRecords : fallback.diagnosisRecords,
    compatibilityRecords: Array.isArray(migrated.compatibilityRecords) ? migrated.compatibilityRecords : fallback.compatibilityRecords,
    deceasedRecords: Array.isArray(migrated.deceasedRecords) ? migrated.deceasedRecords : fallback.deceasedRecords,
    feedingRecords: Array.isArray(migrated.feedingRecords) ? migrated.feedingRecords : fallback.feedingRecords,
    observationRecords: Array.isArray(migrated.observationRecords) ? migrated.observationRecords : fallback.observationRecords,
    careEvents: Array.isArray(migrated.careEvents) ? migrated.careEvents : fallback.careEvents,
    riskReminderState: migrated.riskReminderState && typeof migrated.riskReminderState === 'object' ? migrated.riskReminderState : fallback.riskReminderState,
    discoveryState: migrated.discoveryState,
    onboarding: migrated.onboarding ? {
      ...migrated.onboarding,
      aquariumConfigured: migrated.onboarding.aquariumConfigured ?? migrated.onboarding.status === 'completed',
    } : undefined,
    cloudMigrationConfirmed: migrated.cloudMigrationConfirmed === true,
    updatedAt: typeof migrated.updatedAt === 'string' ? migrated.updatedAt : fallback.updatedAt,
  };
};

let pendingTimer: number | null = null;
let pendingState: LocalAppState | null = null;

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

export const saveAppStateToStorage = (appState: LocalAppState, options: { debounce?: boolean } = {}) => {
  const normalized = normalizeState({ ...appState, updatedAt: new Date().toISOString() });
  const write = () => {
    try {
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
    pendingState = null;
    write();
    return normalized;
  }

  pendingState = normalized;
  if (pendingTimer !== null) window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(() => {
    if (pendingState) {
      try {
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
      }
    }
    pendingTimer = null;
    pendingState = null;
  }, 700);
  return normalized;
};

export const patchLocalAppState = (patch: Partial<LocalAppState>, options: { debounce?: boolean } = {}) => {
  const current = loadAppStateFromStorage();
  return saveAppStateToStorage({ ...current, ...patch, version: AQUARIUM_APP_STATE_VERSION }, options);
};

export const subscribeToAppState = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === AQUARIUM_APP_STATE_KEY) listener();
  };
  window.addEventListener(APP_STATE_CHANGED_EVENT, listener);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(APP_STATE_CHANGED_EVENT, listener);
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

export const importLocalAppState = (json: string) => {
  const parsed = safeParse<Partial<LocalAppState> | null>(json, null, 'local-data-import');
  if (!parsed) throw new Error('导入失败：不是有效的 AquaGuide 本地数据。');
  return saveAppStateToStorage(normalizeState(parsed));
};

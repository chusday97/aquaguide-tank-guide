import type { Aquarium, OnboardingState } from '../../types';
import type { DiscoveryDeckState } from '../../modules/recommendation/recommendation.schema';
import { notifyDataRecovery } from '../diagnostics/ui-failure.service';
import type { CareEventType } from '../../types/database';

export const AQUARIUM_APP_STATE_KEY = 'aquarium_app_state_v1';
export const AQUARIUM_APP_STATE_VERSION = 1;
export const APP_STATE_CHANGED_EVENT = 'aquaguide:app-state-changed';
const DISCOVERY_STORAGE_KEY = 'aquapediaDiscoveryDeck';

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
let pendingPatch: Partial<LocalAppState> | null = null;

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
    discoveryState: safeParse<DiscoveryDeckState | undefined>(localStorage.getItem(DISCOVERY_STORAGE_KEY), undefined, DISCOVERY_STORAGE_KEY),
  });
};

const getLatestAppState = (): LocalAppState => normalizeState({
  ...loadAppStateFromStorage(),
  ...(pendingPatch ?? {}),
});

const writeAppState = (state: LocalAppState) => {
  try {
    localStorage.setItem(AQUARIUM_APP_STATE_KEY, JSON.stringify(state));
    localStorage.setItem('aquariums', JSON.stringify(state.aquariums));
    localStorage.setItem('wishlistFishIds', JSON.stringify(state.wishlist));
    localStorage.setItem('aquarium_diagnosis_records', JSON.stringify(state.diagnosisRecords));
    localStorage.setItem('deceasedRecords', JSON.stringify(state.deceasedRecords));
    if (state.discoveryState) {
      localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(state.discoveryState));
    }
    emitAppStateChanged();
  } catch (error) {
    console.warn('AquaGuide local app state save failed', error);
    throw error instanceof Error ? error : new Error('本地数据没有保存成功。');
  }
};

const scheduleAppStatePatch = (patch: Partial<LocalAppState>) => {
  pendingPatch = {
    ...(pendingPatch ?? {}),
    ...patch,
    version: AQUARIUM_APP_STATE_VERSION,
    updatedAt: new Date().toISOString(),
  };
  if (pendingTimer !== null) window.clearTimeout(pendingTimer);
  pendingTimer = window.setTimeout(() => {
    const queuedPatch = pendingPatch;
    pendingTimer = null;
    pendingPatch = null;
    if (!queuedPatch) return;

    try {
      // Merge against the latest persisted snapshot so unrelated cross-tab updates survive.
      const latest = normalizeState({ ...loadAppStateFromStorage(), ...queuedPatch });
      writeAppState({ ...latest, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.warn('AquaGuide local app state debounced save failed', error);
      notifyDataRecovery(AQUARIUM_APP_STATE_KEY, error);
    }
  }, 700);
};

/** Read discovery state through the canonical app-state boundary, with legacy-key fallback. */
export const loadDiscoveryDeckState = (): DiscoveryDeckState | undefined => {
  const appState = getLatestAppState();
  if (appState.discoveryState) return appState.discoveryState;
  return safeParse<DiscoveryDeckState | undefined>(localStorage.getItem(DISCOVERY_STORAGE_KEY), undefined, DISCOVERY_STORAGE_KEY);
};

/** Persist discovery state through the same writer and change event as business state. */
export const saveDiscoveryDeckState = (state: DiscoveryDeckState, options: { debounce?: boolean } = {}) => {
  return patchLocalAppState({ discoveryState: state }, options);
};

export const saveAppStateToStorage = (appState: LocalAppState, options: { debounce?: boolean } = {}) => {
  const normalized = normalizeState({ ...appState, updatedAt: new Date().toISOString() });

  if (!options.debounce) {
    if (pendingTimer !== null) window.clearTimeout(pendingTimer);
    pendingTimer = null;
    pendingPatch = null;
    writeAppState(normalized);
    return normalized;
  }

  scheduleAppStatePatch(normalized);
  return normalized;
};

export const patchLocalAppState = (patch: Partial<LocalAppState>, options: { debounce?: boolean } = {}) => {
  if (options.debounce) {
    scheduleAppStatePatch(patch);
    return getLatestAppState();
  }
  return saveAppStateToStorage({ ...getLatestAppState(), ...patch, version: AQUARIUM_APP_STATE_VERSION });
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
    if (pendingTimer !== null) window.clearTimeout(pendingTimer);
    pendingTimer = null;
    pendingPatch = null;
    [
      AQUARIUM_APP_STATE_KEY,
      'aquariums',
      'myAquarium',
      'wishlistFishIds',
      'aquarium_diagnosis_records',
      'deceasedRecords',
      DISCOVERY_STORAGE_KEY,
    ].forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('AquaGuide local app state clear failed', error);
  }
};

export const exportLocalAppState = () => JSON.stringify(loadAppStateFromStorage(), null, 2);

export const importLocalAppState = (json: string) => {
  const parsed = safeParse<Partial<LocalAppState> | null>(json, null, 'local-data-import');
  if (!parsed) throw new Error('导入失败：不是有效的 AquaGuide 本地数据。');
  return saveAppStateToStorage(normalizeState(parsed));
};

import type { Aquarium } from '../../types';
import {
  saveAppStateToStorage,
  type LocalAppState,
} from '../storage/local-app-state';

export const PREVIEW_SESSION_STORAGE_KEY = 'aquaguide_preview_session_v1';
const PREVIEW_SEEDED_STORAGE_KEY = 'aquaguide_preview_seeded_v1';

export type PreviewModule = 'aquarium' | 'encyclopedia' | 'care' | 'collection';
const PREVIEW_SPECIES_IDS = ['sp_0001', 'sp_0002', 'sp_0003'];

const buildPreviewAquarium = (): Aquarium => ({
  id: 'interactive-preview-tank',
  name: '预览生态缸',
  startedAt: '2026-08-01',
  startedAtSource: 'created',
  dimensions: { length: '900', width: '450', height: '500' },
  waterType: 'Freshwater',
  targetTemperature: '25',
  substrate: '河沙',
  equipment: { filter: '桶滤', heater: true, oxygen: true, light: '水草灯' },
  plants: [],
  hardscape: [],
  fishes: PREVIEW_SPECIES_IDS.map((speciesId, index) => ({
    id: `preview-${speciesId}`,
    fishId: speciesId,
    quantity: index + 1,
    entryDate: '2026-08-01',
  })),
});

const buildPreviewState = (): LocalAppState => ({
  version: 1,
  currentAquariumId: 'interactive-preview-tank',
  aquariums: [buildPreviewAquarium()],
  wishlist: PREVIEW_SPECIES_IDS.slice(0, 2),
  dismissedRecommendations: [],
  diagnosisRecords: [],
  compatibilityRecords: [],
  deceasedRecords: [],
  feedingRecords: [],
  observationRecords: [],
  careEvents: [],
  riskReminderState: {},
  onboarding: {
    version: 1,
    status: 'completed',
    goal: 'build_tank',
    viewedSpecies: true,
    aquariumConfigured: true,
    taskCardDismissed: false,
  },
  updatedAt: new Date().toISOString(),
});

const getSessionStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
};

export const isInteractivePreviewSession = () => (
  getSessionStorage()?.getItem(PREVIEW_SESSION_STORAGE_KEY) === 'active'
);

export const isInteractivePreviewUrl = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('preview') === 'interactive'
    || window.location.pathname === '/_preview/interactive';
};

export const isInteractivePreviewActive = () => isInteractivePreviewSession() || isInteractivePreviewUrl();

export const activateInteractivePreview = (module: PreviewModule) => {
  const sessionStorage = getSessionStorage();
  if (!sessionStorage) return;
  sessionStorage.setItem(PREVIEW_SESSION_STORAGE_KEY, 'active');
  sessionStorage.setItem('aquaguide_preview_module', module);

  if (sessionStorage.getItem(PREVIEW_SEEDED_STORAGE_KEY) === '1') return;

  saveAppStateToStorage(buildPreviewState());
  window.localStorage.setItem('aqua_care_favorites', JSON.stringify({
    guide_water_deteriorate: {
      id: 'guide_water_deteriorate',
      title: '水质变差怎么办',
      favoritedAt: new Date().toISOString(),
    },
  }));
  sessionStorage.setItem(PREVIEW_SEEDED_STORAGE_KEY, '1');
};

export const getPreviewRoute = (module: PreviewModule) => {
  if (module === 'encyclopedia') return '/encyclopedia?mode=scene&preview=interactive';
  if (module === 'care') return '/care?mode=scene&preview=interactive';
  if (module === 'collection') return '/collection?preview=interactive';
  return '/aquarium?preview=interactive';
};

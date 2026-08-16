import type { OnboardingGoal, OnboardingState } from '../../types';
import { onboardingPreferenceSchema } from '../../../packages/contracts/src/index';
import { supabase } from '../../lib/supabaseClient';
import { apiRequest, AquaGuideApiError, createIdempotencyKey } from '../api/api-client';
import { getAquariumSetupStatus } from '../aquarium/aquarium-setup.service';
import { getCareFavorites, getSpeciesFavoriteIds, setCareFavorites, setSpeciesFavoriteIds } from '../favorites/favorites.service';
import { getCurrentAquaGuideRepository } from '../repository/repository-provider';
import { getCareReminders, getCompletedCareOperations, getSavedCareChecklists } from '../care/care-activity.service';
import { loadAppStateFromStorage, patchLocalAppState } from '../storage/local-app-state';
import { trackSessionEvent } from '../analytics/session-events.service';
import { buildOnboardingTaskProgress, hasHistoricalUserActivity, type OnboardingTaskProgress } from './onboarding-paths';
export { getOnboardingTasks } from './onboarding-paths';
export type { OnboardingTask, OnboardingTaskId, OnboardingTaskProgress } from './onboarding-paths';

const createState = (patch: Partial<OnboardingState> = {}): OnboardingState => ({
  version: 1,
  status: 'pending',
  viewedSpecies: false,
  aquariumConfigured: false,
  taskCardDismissed: false,
  ...patch,
});

export const ONBOARDING_SYNC_FAILED_EVENT = 'aquaguide:onboarding-sync-failed';

type ProfilePreferenceResponse = {
  version: number;
  preferences?: {
    onboarding?: unknown;
  };
};

const emitSyncFailure = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ONBOARDING_SYNC_FAILED_EVENT));
};

const hasSignedInUser = async () => {
  if (!supabase) return false;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return Boolean(data.session);
};

const syncOnboardingToProfile = async (onboarding: OnboardingState) => {
  if (!await hasSignedInUser()) return;
  const save = async () => {
    const profile = await apiRequest<ProfilePreferenceResponse>('/profile');
    await apiRequest('/profile', {
      method: 'PATCH',
      body: { onboarding, version: profile.version },
      idempotencyKey: createIdempotencyKey('onboarding-preference'),
    });
  };
  try {
    await save();
  } catch (error) {
    if (error instanceof AquaGuideApiError && error.code === 'VERSION_CONFLICT') {
      await save();
      return;
    }
    throw error;
  }
};

const queueProfileSync = (onboarding: OnboardingState) => {
  void syncOnboardingToProfile(onboarding).catch(() => emitSyncFailure());
};

const persistOnboarding = (onboarding: OnboardingState) => {
  const saved = patchLocalAppState({ onboarding }).onboarding!;
  queueProfileSync(saved);
  return saved;
};

export const hydrateOnboardingFromProfile = async () => {
  try {
    if (!await hasSignedInUser()) return getOnboardingState();
    const profile = await apiRequest<ProfilePreferenceResponse>('/profile');
    const local = getOnboardingState();
    const cloud = onboardingPreferenceSchema.safeParse(profile.preferences?.onboarding);
    if (!local && cloud.success) return patchLocalAppState({ onboarding: cloud.data }).onboarding;
    if (local && !cloud.success) {
      queueProfileSync(local);
      return local;
    }
    if (!local && !cloud.success) {
      const repository = await getCurrentAquaGuideRepository();
      const [aquariums, favorites] = await Promise.all([
        repository.getAquariums(),
        repository.getFavorites(),
      ]);
      const cached = loadAppStateFromStorage();
      const currentAquariumId = cached.currentAquariumId
        && aquariums.some(item => item.id === cached.currentAquariumId)
        ? cached.currentAquariumId
        : (aquariums[0]?.id || '');
      patchLocalAppState({ aquariums, currentAquariumId });
      setSpeciesFavoriteIds(favorites.speciesCatalogKeys);
      setCareFavorites(Object.fromEntries(favorites.careFavorites.map(item => [item.catalogKey, {
        id: item.catalogKey,
        title: item.title,
        favoritedAt: item.favoritedAt,
      }])));
    }
    return getOnboardingState();
  } catch {
    emitSyncFailure();
    return getOnboardingState();
  }
};

export const subscribeToOnboardingAuth = (listener: () => void) => {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(() => listener());
  return () => data.subscription.unsubscribe();
};

export const shouldStartOnboarding = () => {
  const state = loadAppStateFromStorage();
  if (state.onboarding) return false;
  const hasSupplementalCareActivity = getSpeciesFavoriteIds().length > 0
    || Object.keys(getCareFavorites()).length > 0
    || getCareReminders().length > 0
    || getCompletedCareOperations().length > 0
    || getSavedCareChecklists().length > 0;
  return !hasHistoricalUserActivity(state, hasSupplementalCareActivity);
};

export const getOnboardingState = () => loadAppStateFromStorage().onboarding;

export const chooseOnboardingGoal = (goal: OnboardingGoal) => {
  trackSessionEvent('onboarding_goal_selected', { action: 'select', status: goal, entry: 'welcome' });
  return persistOnboarding(createState({ goal }));
};

export const skipOnboarding = () => persistOnboarding(createState({ status: 'skipped' }));

export const restartOnboarding = () => {
  const current = getOnboardingState();
  return persistOnboarding(createState({
      viewedSpecies: current?.viewedSpecies ?? false,
      aquariumConfigured: current?.aquariumConfigured ?? false,
      taskCardDismissed: false,
    }));
};

export const markSpeciesViewed = () => {
  const current = getOnboardingState();
  if (!current || current.viewedSpecies) return current;
  return persistOnboarding({ ...current, viewedSpecies: true });
};

export const markAquariumConfigured = () => {
  const current = getOnboardingState();
  if (!current) return current;
  const aquariumReady = loadAppStateFromStorage().aquariums.some(
    aquarium => getAquariumSetupStatus(aquarium) === 'complete',
  );
  if (current.aquariumConfigured === aquariumReady) return current;
  return persistOnboarding({ ...current, aquariumConfigured: aquariumReady });
};

export const dismissOnboardingTaskCard = () => {
  const current = getOnboardingState() ?? createState();
  return persistOnboarding({ ...current, taskCardDismissed: true });
};

export const getOnboardingTaskProgress = (): OnboardingTaskProgress => {
  return buildOnboardingTaskProgress(loadAppStateFromStorage());
};

export const syncOnboardingCompletion = () => {
  const current = getOnboardingState();
  const progress = getOnboardingTaskProgress();
  if (!current || !progress.complete || current.status === 'completed') return current;
  trackSessionEvent('onboarding_core_value_completed', { action: 'complete', status: current.goal ?? 'build_tank', entry: 'onboarding-card' });
  return persistOnboarding({ ...current, status: 'completed', completedAt: new Date().toISOString() });
};
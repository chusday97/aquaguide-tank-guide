import type { OnboardingGoal } from '../../types';
import { getAquariumSetupStatus } from '../aquarium/aquarium-setup.service';
import type { LocalAppState } from '../storage/local-app-state';
import { isCompatibilityRecord } from '../compatibility/compatibility-records.service';
import { taskRoutes } from '../navigation/task-routes';

export interface OnboardingTaskProgress {
  aquariumReady: boolean;
  speciesViewed: boolean;
  speciesChosen: boolean;
  compatibilityCompleted: boolean;
  dailyCheckDone: boolean;
  completedCount: number;
  totalCount: number;
  complete: boolean;
}

export type OnboardingTaskId =
  | 'setup_aquarium'
  | 'view_species'
  | 'choose_species'
  | 'complete_compatibility'
  | 'complete_daily_check';

export interface OnboardingTask {
  id: OnboardingTaskId;
  labelKey: string;
  done: boolean;
  route: string;
}

export const hasHistoricalUserActivity = (state: LocalAppState, hasSupplementalCareActivity = false) => (
  state.aquariums.length > 0
  || state.wishlist.length > 0
  || state.compatibilityRecords.length > 0
  || state.diagnosisRecords.length > 0
  || state.deceasedRecords.length > 0
  || state.feedingRecords.length > 0
  || state.observationRecords.length > 0
  || hasSupplementalCareActivity
);

export const buildOnboardingTaskProgress = (state: LocalAppState): OnboardingTaskProgress => {
  // Readiness is factual state, not a sticky UI flag. This also repairs users whose
  // aquariumConfigured flag was previously set by saving an incomplete settings form.
  const aquariumReady = state.aquariums.some(aquarium => getAquariumSetupStatus(aquarium) === 'complete');
  const speciesViewed = state.onboarding?.viewedSpecies ?? false;
  const speciesChosen = state.wishlist.length > 0 || state.aquariums.some(aquarium => aquarium.fishes.some(fish => fish.quantity > 0));
  const compatibilityCompleted = state.compatibilityRecords.some(record => {
    if (!isCompatibilityRecord(record)) return false;
    return state.aquariums.some(aquarium => aquarium.id === record.aquariumId);
  });
  const dailyCheckDone = state.diagnosisRecords.some(record => {
    if (!record || typeof record !== 'object') return false;
    return (record as { problemType?: string }).problemType === '巡检';
  });
  const goal = state.onboarding?.goal ?? 'build_tank';
  const completionStates = goal === 'build_tank'
    ? [aquariumReady, speciesChosen, compatibilityCompleted, dailyCheckDone]
    : [speciesViewed, speciesChosen, aquariumReady, compatibilityCompleted];
  const completedCount = completionStates.filter(Boolean).length;
  const totalCount = completionStates.length;
  return { aquariumReady, speciesViewed, speciesChosen, compatibilityCompleted, dailyCheckDone, completedCount, totalCount, complete: completedCount === totalCount };
};

const beginnerSpeciesRoute = taskRoutes.encyclopedia.browseWith({ difficulty: 'Easy', source: 'onboarding' });
const setupAquariumRoute = taskRoutes.aquarium.setup('onboarding');
const compatibilityRoute = taskRoutes.encyclopedia.compatibilityWith('onboarding');
const dailyCheckRoute = taskRoutes.aquarium.dailyCheckFrom('onboarding');

export const getOnboardingTasks = (goal: OnboardingGoal | undefined, progress: OnboardingTaskProgress): OnboardingTask[] => {
  if (goal === 'browse_species') {
    return [
      { id: 'view_species', labelKey: 'onboarding.taskViewSpecies', done: progress.speciesViewed, route: beginnerSpeciesRoute },
      { id: 'choose_species', labelKey: 'onboarding.taskChooseSpecies', done: progress.speciesChosen, route: beginnerSpeciesRoute },
      { id: 'setup_aquarium', labelKey: 'onboarding.taskTank', done: progress.aquariumReady, route: setupAquariumRoute },
      { id: 'complete_compatibility', labelKey: 'onboarding.taskCompatibility', done: progress.compatibilityCompleted, route: compatibilityRoute },
    ];
  }
  return [
    { id: 'setup_aquarium', labelKey: 'onboarding.taskTank', done: progress.aquariumReady, route: setupAquariumRoute },
    { id: 'choose_species', labelKey: 'onboarding.taskChooseSpecies', done: progress.speciesChosen, route: beginnerSpeciesRoute },
    { id: 'complete_compatibility', labelKey: 'onboarding.taskCompatibility', done: progress.compatibilityCompleted, route: compatibilityRoute },
    { id: 'complete_daily_check', labelKey: 'onboarding.taskCheck', done: progress.dailyCheckDone, route: dailyCheckRoute },
  ];
};
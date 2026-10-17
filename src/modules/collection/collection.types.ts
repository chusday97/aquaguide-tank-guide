export type CollectionModule = 'wishlist' | 'care' | 'memorial' | 'achievements';

export type CollectionTab = CollectionModule;

export type AchievementId =
  | 'first_aquarium'
  | 'first_daily_check'
  | 'seven_day_guardian'
  | 'water_change_routine'
  | 'wishlist_collector'
  | 'care_learner'
  | 'compatible_community'
  | 'life_reflection';

export type AchievementNextAction = {
  label: string;
  route: string;
};

export interface AchievementProgress {
  id: AchievementId;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
  nextAction?: AchievementNextAction;
}

import type { LifeStage, MemorialCauseCode, ReproductiveState } from '../../types';
import type { CareEventType } from '../../types/database';

export type MemorialItem = {
  id: string;
  fishId: string;
  date: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
  version?: number;
};

export type KeepingHistoryEventType = CareEventType | 'memorial' | 'compatibility_decision';

export type KeepingHistoryEvent = {
  id: string;
  eventType: KeepingHistoryEventType;
  occurredAt: string;
  title: string;
  label?: string;
  aquariumId?: string;
  aquariumName?: string;
  speciesIds: string[];
  payload: Record<string, unknown>;
  sourceType?: string;
  sourceId?: string;
  isInferred: boolean;
};

export type KeepingCohortSummary = {
  id: string;
  aquariumId: string;
  aquariumName: string;
  speciesId: string;
  quantity: number;
  entryDate: string;
  lifeStage?: LifeStage;
  reproductiveState?: ReproductiveState;
  stateUpdatedAt?: string;
};

export type KeepingHistorySnapshot = {
  events: KeepingHistoryEvent[];
  activeCohorts: KeepingCohortSummary[];
  speciesEverKeptIds: string[];
  currentSpeciesIds: string[];
  aquariumIds: string[];
};

export type CollectionCounts = {
  wishlist: number;
  care: number;
  memorial: number;
  achievements: number;
};

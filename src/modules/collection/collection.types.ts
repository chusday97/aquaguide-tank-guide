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

import type { MemorialCauseCode } from '../../types';

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

export type CollectionCounts = {
  wishlist: number;
  care: number;
  memorial: number;
  achievements: number;
};

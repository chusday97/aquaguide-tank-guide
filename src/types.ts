export interface Fish {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  image: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  waterTemperature: string;
  phLevel: string;
  waterChangeCycle: number; // in days
  description: string;
  diet: string;
  feedingProfile?: {
    dietType?: string;
    feedingType: string;
    recommendedFoods: string;
    feedingFrequency: string;
    portionRule: string;
    feedingLayer?: string;
    avoidFoods: string;
    specialNotes?: string;
    confidence?: string;
    sourceName?: string;
    sourceUrl?: string;
    sourceFields?: string[];
    needsReview?: boolean;
    reviewReason?: string;
  };
  tankSize: string;
  temperament: 'Peaceful' | 'Aggressive' | 'Territorial';
  size: 'Small' | 'Medium' | 'Large';
  housingMode?: '适合混养' | '谨慎混养' | '建议单养';
  housingReason?: string;
  isCustom?: boolean;
}

export type LivestockIdentityStatus = 'verified' | 'unresolved';

export interface AquariumFish {
  id: string;
  fishId: string; // canonical catalog key for verified records; explicit unresolved:* mirror key otherwise
  identityStatus?: LivestockIdentityStatus;
  rawName?: string;
  quantity: number;
  entryDate: string; // ISO string
  lastWaterChangeDate?: string; // ISO string; unknown until a real water-change record exists
  batches?: AquariumSpeciesBatch[];
}

export type LifeStage = 'unknown' | 'juvenile' | 'adult';

export type ReproductiveState =
  | 'unknown'
  | 'not_applicable'
  | 'normal'
  | 'pregnant_or_gravid'
  | 'in_labor_or_spawning'
  | 'postpartum_recovery';

export interface AquariumSpeciesBatch {
  id: string;
  quantity: number;
  entryDate: string;
  lifeStage: LifeStage;
  reproductiveState: ReproductiveState;
  stateUpdatedAt: string;
}

export type OnboardingGoal = 'build_tank' | 'browse_species';

export interface OnboardingState {
  version: 1;
  status: 'pending' | 'completed' | 'skipped';
  goal?: OnboardingGoal;
  viewedSpecies: boolean;
  aquariumConfigured: boolean;
  taskCardDismissed: boolean;
  completedAt?: string;
}

export interface Aquarium {
  id: string;
  name: string;
  startedAt?: string;
  startedAtSource?: 'created' | 'inferred' | 'user';
  startedAtConfirmedAt?: string;
  fishes: AquariumFish[];
  lastWaterChangeDate?: string;
  waterChangeHistory?: string[];
  lastWaterStoredDate?: string;
  dimensions?: { length: string; width: string; height: string };
  waterType?: 'Freshwater' | 'Saltwater';
  targetTemperature?: string;
  substrate?: string;
  plants?: string[];
  hardscape?: string[];
  equipment?: {
    filter?: '无' | '瀑布过滤' | '桶滤' | '上滤' | '海绵过滤';
    heater?: boolean;
    oxygen?: boolean;
    light?: '无' | '普通灯' | '水草灯' | '海水灯';
  };
}

export type SpeciesAdditionIntent = 'record_existing' | 'planned_addition';

export type AquariumSetupStatus = 'empty' | 'incomplete' | 'usable' | 'complete';

export type SpeciesAdditionPolicy =
  | 'save'
  | 'save_with_warning'
  | 'save_with_unknown'
  | 'save_with_urgent_warning'
  | 'allow'
  | 'confirm'
  | 'complete_information'
  | 'block';

export type MemorialCauseCode =
  | 'water_quality_change'
  | 'oxygen_shortage'
  | 'temperature_stress'
  | 'acclimation_stress'
  | 'aggression_or_injury'
  | 'feeding_or_digestive'
  | 'suspected_illness'
  | 'recent_medication_or_change'
  | 'age_related'
  | 'unknown'
  | 'other';

export interface DeceasedRecord {
  id: string;
  fishId: string;
  date: string;
  causeCodes?: MemorialCauseCode[];
  reason?: string;
  observation?: string;
  improvement?: string;
  version?: number;
}

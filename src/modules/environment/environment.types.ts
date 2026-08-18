export type RequirementLevel =
  | 'required'
  | 'recommended'
  | 'optional'
  | 'not_needed'
  | 'unknown';

export type TraitConfidence = 'high' | 'medium' | 'low' | 'unknown';
export type ReviewStatus = 'draft' | 'reviewed';
export type Range = { min: number; max: number };
export type FlowLevel = 'still' | 'low' | 'medium' | 'high' | 'unknown';
export type DemandLevel = 'low' | 'medium' | 'high' | 'unknown';

export type EvidenceMeta = {
  confidence: TraitConfidence;
  reviewStatus: ReviewStatus;
  sourceRefs: string[];
  /**
   * Trait-level provenance for reviewed knowledge.
   * Keys use the profile path, for example `environment.temperature`
   * or `planting.type`. A reviewed explicit trait is not production-safe
   * unless at least one registered source is attached to that exact claim.
   */
  claimRefs?: Record<string, string[]>;
};

export type SpeciesEnvironmentProfile = {
  speciesId: string;
  environment: {
    waterType?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
    temperature?: Range;
    ph?: Range;
    oxygenDemand?: DemandLevel;
    flowPreference?: FlowLevel;
    minimumVolumeLiters?: number;
    minimumTankLengthCm?: number;
  };
  habitat?: {
    coverNeed?: DemandLevel;
    openSwimmingNeed?: DemandLevel;
    substratePreference?: Array<'fine_sand' | 'gravel' | 'soil' | 'rock'>;
    diggingBehavior?: 'none' | 'low' | 'high' | 'unknown';
    uprootingRisk?: 'none' | 'low' | 'high' | 'unknown';
    plantEatingRisk?: 'none' | 'low' | 'high' | 'unknown';
    shelterNeed?: DemandLevel;
  };
  evidence: EvidenceMeta;
};

export type PlantEnvironmentProfile = {
  speciesId: string;
  environment: {
    waterType?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
    temperature?: Range;
    ph?: Range;
    light?: 'low' | 'medium' | 'high' | 'unknown';
    co2?: 'none' | 'optional' | 'recommended' | 'unknown';
    flowPreference?: FlowLevel;
  };
  planting: {
    type: 'rooted' | 'epiphyte' | 'floating' | 'free' | 'unknown';
    substrateRequired?: 'none' | 'soil' | 'sand' | 'nutrient_substrate' | 'unknown';
    leafDurability?: 'delicate' | 'medium' | 'tough' | 'unknown';
  };
  habitatValue?: {
    cover?: DemandLevel;
    fryShelter?: DemandLevel;
    shrimpShelter?: DemandLevel;
    visualBarrier?: DemandLevel;
  };
  evidence: EvidenceMeta;
};

export type TankContext = {
  water: {
    type?: 'freshwater' | 'saltwater';
    volumeLiters?: number;
    tankLengthCm?: number;
    targetTemperature?: number;
    lowestObservedTemperature?: number;
    highestObservedTemperature?: number;
    ph?: number;
  };
  habitat: {
    substrate?: string;
    plants: string[];
    hardscape: string[];
  };
  equipment: {
    filterType?: string;
    heater?: boolean;
    airPump?: boolean;
    light?: string;
    co2?: boolean;
    surfaceAgitation: FlowLevel;
  };
  stocking: {
    loadRate?: number;
    speciesIds: string[];
  };
};

export type DecisionReason = {
  code: string;
  message: string;
  severity: 'info' | 'low' | 'medium' | 'high';
};

export type FitStatus = 'compatible' | 'caution' | 'not_recommended' | 'unknown';

export type EnvironmentFitResult = {
  status: FitStatus;
  reasons: DecisionReason[];
};

export type PlantMatchResult = {
  status: FitStatus;
  reasons: DecisionReason[];
  benefits: DecisionReason[];
};

export type EquipmentRequirement = {
  type: 'heating' | 'oxygenation' | 'filtration' | 'lighting' | 'co2' | 'flow';
  level: RequirementLevel;
  reasons: DecisionReason[];
  actions: string[];
  confidence: TraitConfidence;
};

export type EnvironmentDecision = {
  environment: EnvironmentFitResult;
  plantMatch?: PlantMatchResult;
  equipment: EquipmentRequirement[];
};

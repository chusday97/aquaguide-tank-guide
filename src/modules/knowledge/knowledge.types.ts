import type { Fish } from '../../types';
import type { ObservedCoexistenceStatus, StockingGuidance } from '../../../packages/domain-rules/src';
import type { TankCompatibilityResult, TankCompatibilityRule, TankCompatibilityStatus } from '../../services/compatibility/compatibility.service';

export type KnowledgeConfidence = 'verified' | 'derived' | 'unknown';
export type KnowledgeReviewStatus = 'reviewed' | 'derived' | 'unreviewed';

export type KnowledgeSource = {
  type: 'species_data' | 'rule_engine' | 'local_graph' | 'unknown';
  label: string;
  confidence: KnowledgeConfidence;
};

/**
 * Evidence belongs to individual claims/fields rather than only the whole
 * species profile. This lets Aqua say "this reproductive mode is verified"
 * while another field (for example sexing at juvenile stage) remains unknown.
 */
export type KnowledgeFieldEvidence = {
  confidence: KnowledgeConfidence;
  reviewStatus: KnowledgeReviewStatus;
  sourceIds: string[];
  note?: string;
  reviewedAt?: string;
};

export type SpeciesSocialMode = 'solitary' | 'pair' | 'harem' | 'shoal' | 'school' | 'group' | 'colony' | 'variable' | 'unknown';
export type SpeciesSwimmingZone = 'surface' | 'upper' | 'middle' | 'bottom' | 'all' | 'unknown';
export type SpeciesReproductiveMode =
  | 'livebearer'
  | 'egg_scatterer'
  | 'substrate_spawner'
  | 'cave_spawner'
  | 'bubble_nester'
  | 'mouthbrooder'
  | 'external_brooder'
  | 'other'
  | 'unknown';

export type SpeciesSexIdentificationKnowledge = {
  title: string;
  summary: string;
  points: string[];
  confidence: KnowledgeConfidence;
  source: KnowledgeSource;
  reliableFromLifeStage?: 'juvenile' | 'subadult' | 'adult' | 'unknown';
  maleTraits?: string[];
  femaleTraits?: string[];
  limitations?: string[];
  evidence?: KnowledgeFieldEvidence;
};

export type SpeciesReproductionKnowledge = {
  mode: SpeciesReproductiveMode;
  plainLanguageLabel: string;
  summary: string;
  fertilization?: 'internal' | 'external' | 'variable' | 'unknown';
  parentalCare?: 'none' | 'egg_guarding' | 'fry_guarding' | 'mouthbrooding' | 'carrying' | 'variable' | 'unknown';
  gestationOrIncubation?: { minDays?: number; maxDays?: number; label: string };
  breedingTriggers?: string[];
  breedingBehavior?: string[];
  breedingAggression?: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  fryCare?: string[];
  parentFryRisk?: string[];
  evidence: KnowledgeFieldEvidence;
};

export type SpeciesSocialKnowledge = {
  mode: SpeciesSocialMode;
  minimumGroupSize?: number;
  recommendedGroupSize?: { min?: number; max?: number };
  sexRatioGuidance?: string;
  swimmingZone?: SpeciesSwimmingZone;
  territoriality?: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  finNipping?: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  finNipVulnerability?: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  swimmingPace?: 'slow' | 'moderate' | 'fast' | 'unknown';
  predationRisk?: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  predationVulnerability?: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  summary: string;
  evidence: KnowledgeFieldEvidence;
};

export type SpeciesEnvironmentKnowledge = {
  waterType?: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
  temperatureRangeC?: { min: number; max: number };
  phRange?: { min: number; max: number };
  hardnessDgh?: { min: number; max: number };
  notes?: string[];
  evidence: KnowledgeFieldEvidence;
};

export type SpeciesSpaceKnowledge = {
  adultLengthCm?: { min?: number; max?: number; measurement?: 'SL' | 'TL' | 'unknown' };
  minVolumeLiters?: number;
  minTankLengthCm?: number;
  activityLevel?: 'low' | 'medium' | 'high' | 'unknown';
  swimmingZone?: SpeciesSwimmingZone;
  needsCover?: boolean;
  needsHidingPlaces?: boolean;
  substrateNotes?: string[];
  spaceNotes?: string[];
  evidence: KnowledgeFieldEvidence;
};

export type SpeciesKnowledgeProfile = {
  speciesId: string;
  displayName: string;
  scientificName: string;
  category: string;
  topTags: string[];
  facts: {
    waterType: 'freshwater' | 'saltwater' | 'brackish' | 'unknown';
    temperatureRange?: { min: number; max: number };
    phRange?: { min: number; max: number };
    minVolumeLiters?: number;
    temperament: Fish['temperament'] | 'unknown';
    housingMode: Fish['housingMode'] | 'unknown';
    difficulty: Fish['difficulty'] | 'unknown';
  };
  knowledge: {
    sexIdentification: SpeciesSexIdentificationKnowledge;
    /** V2 blocks are optional during staged migration; absence means unknown, never inferred. */
    reproduction?: SpeciesReproductionKnowledge;
    environment?: SpeciesEnvironmentKnowledge;
    socialBehavior?: SpeciesSocialKnowledge;
    spaceAndGrowth?: SpeciesSpaceKnowledge;
  };
  source: KnowledgeSource;
};

export type CompatibilityRiskType =
  | 'water_type'
  | 'temperature'
  | 'ph'
  | 'space'
  | 'predation'
  | 'aggression'
  | 'territory'
  | 'bioload'
  | 'group_size'
  | 'equipment'
  | 'unknown';

export type CompatibilityRelationship = {
  relationship: 'compatible' | 'conditional' | 'not_recommended' | 'unknown';
  riskType: CompatibilityRiskType;
  title: string;
  evidence: string;
  severity: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  conditions: string[];
  mitigation: string[];
  sourceRule: TankCompatibilityRule;
};

export type PairCompatibilityResult = {
  pairId: string;
  speciesA: Fish;
  speciesB: Fish;
  quantityA: number;
  quantityB: number;
  status: TankCompatibilityStatus;
  primaryReason?: CompatibilityRelationship;
  secondaryReasons: CompatibilityRelationship[];
  passedRelationships: CompatibilityRelationship[];
  rawResult: TankCompatibilityResult;
  adjustable: boolean;
  actions: string[];
};

export type CompatibilityDecision = {
  status: TankCompatibilityStatus;
  riskLevel: TankCompatibilityResult['riskLevel'];
  summary: string;
  pairResults: PairCompatibilityResult[];
  primaryConflict?: PairCompatibilityResult;
  blockedReasons: CompatibilityRelationship[];
  adjustableReasons: CompatibilityRelationship[];
  missingInformation: CompatibilityRelationship[];
  passedRules: TankCompatibilityRule[];
  warningRules: TankCompatibilityRule[];
  blockingRules: TankCompatibilityRule[];
  missingData: TankCompatibilityRule[];
  suggestions: string[];
  aggregateResult: TankCompatibilityResult;
  metadata: TankCompatibilityResult['metadata'];
  stockingGuidance?: StockingGuidance;
  observedStatus?: ObservedCoexistenceStatus;
  evidenceIds?: string[];
};

export type DiagnosisNode = {
  id: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    nextNodeId?: string;
    resultId?: string;
  }>;
};

export type DiagnosisResultNode = {
  id: string;
  title: string;
  summary: string;
  severity: 'info' | 'caution' | 'urgent';
  actions: string[];
};

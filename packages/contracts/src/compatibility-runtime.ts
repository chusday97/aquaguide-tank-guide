import type { CompatibilityRequiredFact } from './catalog';

export type RuntimeEvidenceSourceDto = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: 'government' | 'peer_reviewed' | 'university' | 'professional_association' | 'curated_husbandry';
  reviewStatus: 'reviewed';
  version: number;
};

export type CompatibilityLifeStageDto = 'unknown' | 'juvenile' | 'adult' | 'fry' | 'subadult';

export type ReviewedCompatibilityStockingGuidanceDto = {
  kind: 'reviewed_range' | 'minimum_group_only' | 'screening_only' | 'unknown';
  recommendedMin: number | null;
  recommendedMax: number | null;
  constraints: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  evidenceIds: string[];
};

export type ReviewedCompatibilityStageRiskRuleDto = {
  ruleKey: string;
  youngerStages: CompatibilityLifeStageDto[];
  olderStages: CompatibilityLifeStageDto[];
  verdict: 'caution' | 'not_recommended';
  riskType: string;
  reason: string;
  mitigation: string[];
  basis: 'species_trait' | 'pair_rule' | 'tank_condition' | 'rule_inference';
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  reviewStatus: 'reviewed';
  citations: RuntimeEvidenceSourceDto[];
};

export type ReviewedCompatibilityProfileDto = {
  catalogKey: string;
  behaviorTraits: string[];
  minimumGroupSize?: number;
  predationTargets: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  reviewStatus: 'reviewed';
  citations: RuntimeEvidenceSourceDto[];
  requiredFacts: CompatibilityRequiredFact[];
  stockingGuidance?: ReviewedCompatibilityStockingGuidanceDto;
  stageRiskRules: ReviewedCompatibilityStageRiskRuleDto[];
  version: number;
};

export type ReviewedCompatibilityPairRuleDto = {
  catalogKeys: [string, string];
  verdict: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
  riskType: string;
  reason: string;
  mitigation: string[];
  basis: 'species_trait' | 'pair_rule' | 'tank_condition' | 'rule_inference';
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  reviewStatus: 'reviewed';
  citations: RuntimeEvidenceSourceDto[];
  version: number;
};

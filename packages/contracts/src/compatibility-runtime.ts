export type RuntimeEvidenceSourceDto = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: 'government' | 'peer_reviewed' | 'university' | 'professional_association' | 'curated_husbandry';
  reviewStatus: 'reviewed';
  version: number;
};

export type ReviewedCompatibilityProfileDto = {
  catalogKey: string;
  behaviorTraits: string[];
  minimumGroupSize?: number;
  predationTargets: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  reviewStatus: 'reviewed';
  citations: RuntimeEvidenceSourceDto[];
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

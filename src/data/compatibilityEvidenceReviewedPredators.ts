import type { CompatibilityEvidenceDto, EvidenceSourceDto } from '../../packages/contracts/src';

export type AdditionalReviewedCompatibilityProfile = {
  speciesId: string;
  behaviorTraits: string[];
  minimumGroupSize?: number;
  predationTargets: string[];
  confidence: CompatibilityEvidenceDto['confidence'];
  reviewStatus: CompatibilityEvidenceDto['reviewStatus'];
  citations: EvidenceSourceDto[];
};

const lionfishPreyRiskStudy: EvidenceSourceDto = {
  id: 'lionfish-prey-risk-experiment',
  title: 'Ultimate Predators: Lionfish Have Evolved to Circumvent Prey Risk Assessment Abilities',
  publisher: 'PLOS ONE',
  url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0068259',
  sourceType: 'peer_reviewed',
  reviewStatus: 'reviewed',
};

const additionalProfiles: Record<string, AdditionalReviewedCompatibilityProfile> = {
  sp_0453: {
    speciesId: 'sp_0453',
    behaviorTraits: ['predatory'],
    predationTargets: ['small_fish'],
    confidence: 'medium',
    reviewStatus: 'reviewed',
    citations: [lionfishPreyRiskStudy],
  },
};

export const getAdditionalReviewedCompatibilityProfile = (speciesId: string) => additionalProfiles[speciesId];

export const getAdditionalReviewedCompatibilityProfileIds = () => Object.keys(additionalProfiles);

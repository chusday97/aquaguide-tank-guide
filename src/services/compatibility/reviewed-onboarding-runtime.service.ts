import {
  getReviewedCompatibilityProfile,
  getReviewedPairRule,
  getReviewedStageRiskProfile,
} from '../../data/compatibilityEvidence';
import type { Fish } from '../../types';
import type { CompatibilityEvidenceProvider } from './compatibility.service';
import type { ReviewedCompatibilityFieldAuthority, ReviewedCompatibilityOnboardingAuthority } from './species-onboarding-research.service';

export const createReviewedOnboardingEvidenceProvider = (
  authorities: Array<ReviewedCompatibilityOnboardingAuthority | ReviewedCompatibilityFieldAuthority>,
  authorityVersion = 'reviewed-onboarding-runtime-v1',
): CompatibilityEvidenceProvider => {
  const bySpeciesId = new Map(authorities.map(authority => [authority.catalogKey, authority]));

  return {
    getProfile: speciesId => bySpeciesId.get(speciesId)?.profile || getReviewedCompatibilityProfile(speciesId),
    getPairRule: (leftId, rightId) => {
      if (bySpeciesId.has(leftId) || bySpeciesId.has(rightId)) return undefined;
      return getReviewedPairRule(leftId, rightId);
    },
    getStageRisks: speciesId => {
      if (bySpeciesId.has(speciesId)) return [];
      const rule = getReviewedStageRiskProfile(speciesId);
      return rule ? [rule] : [];
    },
    getReviewedSpeciesFact: (species: Fish) => bySpeciesId.get(species.id)?.fact,
    authorityVersion,
  };
};

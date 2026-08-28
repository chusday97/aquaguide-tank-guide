import { fishData } from './fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from './compatibilityEvidence';
import { getLifeType } from '../modules/species/species.service';
import type { Fish } from '../types';

/**
 * Research and review queue only. Membership never grants a species a
 * compatibility decision; reviewed evidence remains the only readiness gate.
 */
export const LAUNCH_COHORT_TARGET = 30;

const priorityNames = [
  '红绿灯',
  '宝莲灯',
  '黑壳虾',
  '极火虾',
  '斑马螺',
  '咖啡鼠',
  '白云金丝',
  '孔雀鱼',
  '水晶虾',
];

const eligibleSpecies = fishData.filter(species => !['plant', 'hardscape'].includes(getLifeType(species)));
const reviewedIds = getCompatibilityEvidenceAudit().reviewedSpeciesIds;

const reviewPriority = (species: Fish) => {
  const reviewedBoost = reviewedIds.includes(species.id) ? 1000 : 0;
  const namedBoost = priorityNames.includes(species.name) ? 500 : 0;
  const riskBoost = species.temperament === 'Aggressive' || species.temperament === 'Territorial' ? 50 : 0;
  const sizeBoost = species.size === 'Large' ? 20 : species.size === 'Medium' ? 10 : 0;
  return reviewedBoost + namedBoost + riskBoost + sizeBoost;
};

export const selectCompatibilityLaunchCohort = (): Fish[] => (
  [...eligibleSpecies]
    .sort((left, right) => reviewPriority(right) - reviewPriority(left) || left.id.localeCompare(right.id))
    .slice(0, LAUNCH_COHORT_TARGET)
);

export const isSpeciesDecisionReady = (speciesId: string) => {
  const profile = getReviewedCompatibilityProfile(speciesId);
  return Boolean(profile && profile.reviewStatus === 'reviewed' && profile.citations.length > 0);
};

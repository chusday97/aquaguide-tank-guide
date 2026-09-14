import type { Fish } from '../../types';
import { getReviewedCompatibilityProfileForFish } from '../../data/compatibilityEvidence';
import { getReviewedSpeciesKnowledgeForFish } from './speciesKnowledge';

export type SpeciesHousingStatus = 'ok' | 'warning' | 'danger';

export type SpeciesHousingAuthority = {
  label: string;
  status: SpeciesHousingStatus;
  advice: string;
  source: 'reviewed' | 'legacy';
  solitaryRequired: boolean;
  groupHousing: boolean;
  minimumGroupSize?: number;
  communityCategory: '适合混养' | '谨慎混养' | '建议单养' | '需观察';
};

const getLegacyHousingMode = (fish: Fish) => (
  (fish as Fish & { _originalHousingMode?: Fish['housingMode'] })._originalHousingMode || fish.housingMode
);

const getLegacyLabel = (mode: string | undefined, isEn: boolean) => {
  if (!mode) return isEn ? 'Needs review' : '需观察';
  if (!isEn) return mode;
  const labels: Record<string, string> = {
    '适合混养': 'Compatible',
    '谨慎混养': 'Caution mix',
    '建议单养': 'Single housing',
  };
  return labels[mode] || mode;
};

export const getSpeciesHousingAuthority = (fish: Fish, isEn = false): SpeciesHousingAuthority => {
  const reviewedProfile = getReviewedCompatibilityProfileForFish(fish);
  const reviewedSocial = getReviewedSpeciesKnowledgeForFish(fish)?.socialBehavior;
  const socialReviewed = reviewedSocial?.evidence.reviewStatus === 'reviewed';
  const solitaryRequired = Boolean(
    reviewedProfile?.behaviorTraits.includes('solitary_required')
      || (socialReviewed && reviewedSocial?.mode === 'solitary'),
  );
  const reviewedCommunityCaution = Boolean(reviewedProfile && (
    reviewedProfile.predationTargets.length > 0
      || reviewedProfile.behaviorTraits.some(trait => ['fin_nipping', 'interspecific_aggression', 'territorial', 'predatory', 'chasing', 'biting', 'breeding_defense'].includes(trait))
  ));

  if (solitaryRequired) {
    return {
      label: isEn ? 'Single housing' : '建议单养',
      status: 'danger',
      advice: reviewedSocial?.summary || (isEn ? 'Reviewed behavior evidence supports single housing.' : '已审核行为资料支持单独规划缸位。'),
      source: 'reviewed',
      solitaryRequired: true,
      groupHousing: false,
      communityCategory: '建议单养',
    };
  }

  if (socialReviewed && reviewedSocial) {
    const minimumGroupSize = reviewedSocial.minimumGroupSize;
    if (['shoal', 'school', 'group', 'colony'].includes(reviewedSocial.mode)) {
      return {
        label: minimumGroupSize ? (isEn ? `Group ${minimumGroupSize}+` : `群体 ${minimumGroupSize}+`) : (isEn ? 'Group housing' : '群体饲养'),
        status: reviewedCommunityCaution ? 'warning' : 'ok',
        advice: reviewedSocial.summary,
        source: 'reviewed',
        solitaryRequired: false,
        groupHousing: true,
        minimumGroupSize,
        communityCategory: reviewedCommunityCaution ? '谨慎混养' : '适合混养',
      };
    }
    if (reviewedSocial.mode === 'pair') {
      return { label: isEn ? 'Pair housing' : '成对饲养', status: reviewedCommunityCaution ? 'warning' : 'ok', advice: reviewedSocial.summary, source: 'reviewed', solitaryRequired: false, groupHousing: true, communityCategory: reviewedCommunityCaution ? '谨慎混养' : '适合混养' };
    }
    if (reviewedSocial.mode === 'harem') {
      return { label: isEn ? 'Ratio-managed group' : '配比群养', status: 'warning', advice: reviewedSocial.summary, source: 'reviewed', solitaryRequired: false, groupHousing: true, communityCategory: '谨慎混养' };
    }
    return { label: isEn ? 'Reviewed social behavior' : '已审核群体习性', status: reviewedCommunityCaution ? 'warning' : 'ok', advice: reviewedSocial.summary, source: 'reviewed', solitaryRequired: false, groupHousing: false, communityCategory: reviewedCommunityCaution ? '谨慎混养' : '需观察' };
  }

  const legacyMode = getLegacyHousingMode(fish);
  return {
    label: getLegacyLabel(legacyMode, isEn),
    status: legacyMode === '建议单养' ? 'danger' : legacyMode === '谨慎混养' ? 'warning' : 'ok',
    advice: fish.housingReason || (isEn ? 'Review compatibility before adding.' : '建议加入混养计算后再确认组合风险。'),
    source: 'legacy',
    solitaryRequired: legacyMode === '建议单养',
    groupHousing: legacyMode === '适合混养',
    communityCategory: legacyMode === '建议单养' || legacyMode === '谨慎混养' || legacyMode === '适合混养' ? legacyMode : '需观察',
  };
};

import type { Aquarium, Fish } from '../types';
import { getReviewedCompatibilityProfile } from '../data/compatibilityEvidence';
import {
  evaluateTankCompatibility,
  type TankCompatibilityResult,
} from './tankCompatibilityEngine';
import {
  getLifeType,
  getSecondaryCategory,
  getSpeciesWaterType,
} from '../modules/species/species.service';

export type ReplacementSocialMode = 'schooling' | 'single_or_pair' | 'community' | 'unknown';

export type ReplacementIntent = {
  lifeType: ReturnType<typeof getLifeType>;
  waterType: ReturnType<typeof getSpeciesWaterType>;
  role: string;
  size: Fish['size'];
  difficulty: Fish['difficulty'];
  socialMode: ReplacementSocialMode;
};

export type ReplacementCandidate = {
  species: Fish;
  compatibility: TankCompatibilityResult;
  intentMatches: string[];
  evidenceStatus: 'reviewed_behavior' | 'behavior_evidence_missing';
};

export type ReplacementRecommendationResult = {
  status: 'alternatives_found' | 'no_safe_same_intent_alternative' | 'insufficient_data';
  intent: ReplacementIntent;
  recommended: ReplacementCandidate[];
  conditional: ReplacementCandidate[];
  needsConfirmation: ReplacementCandidate[];
  unresolvedCurrentSpeciesIds: string[];
  evaluatedCandidateCount: number;
  rejectedCandidateCount: number;
};

type ReplacementRecommendationInput = {
  aquarium: Aquarium;
  rejectedSpecies: Fish;
  catalog: Fish[];
  candidateQuantity?: number;
};

const inferSocialMode = (fish: Fish): ReplacementSocialMode => {
  const profile = getReviewedCompatibilityProfile(fish.id);
  if ((profile?.minimumGroupSize || 0) > 1) return 'schooling';
  if (fish.housingMode === '建议单养') return 'single_or_pair';
  if (fish.housingMode === '适合混养') return 'community';
  const text = `${fish.name} ${fish.category} ${fish.description} ${fish.housingMode || ''}`;
  if (/群游|成群|群养|school|shoal|tetra|rasbora|cory/i.test(text)) return 'schooling';
  if (/单养|独居|solitary/i.test(text)) return 'single_or_pair';
  return 'unknown';
};

export const deriveReplacementIntent = (fish: Fish): ReplacementIntent => ({
  lifeType: getLifeType(fish),
  waterType: getSpeciesWaterType(fish),
  role: getSecondaryCategory(fish),
  size: fish.size,
  difficulty: fish.difficulty,
  socialMode: inferSocialMode(fish),
});

const getIntentMatches = (candidate: Fish, intent: ReplacementIntent) => {
  const matches: string[] = [];
  if (getSecondaryCategory(candidate) === intent.role) matches.push('same_role');
  if (inferSocialMode(candidate) === intent.socialMode) matches.push('same_social_mode');
  if (candidate.size === intent.size) matches.push('same_size');
  if (candidate.difficulty === intent.difficulty) matches.push('same_difficulty');
  return matches;
};

const hasReviewedBehaviorEvidence = (fish: Fish) => {
  const profile = getReviewedCompatibilityProfile(fish.id);
  return Boolean(profile && profile.reviewStatus === 'reviewed');
};

const candidateRank = (candidate: ReplacementCandidate) => {
  const matchWeight = candidate.intentMatches.reduce((score, match) => {
    if (match === 'same_role') return score + 16;
    if (match === 'same_social_mode') return score + 8;
    if (match === 'same_size') return score + 4;
    if (match === 'same_difficulty') return score + 2;
    return score;
  }, 0);
  const evidenceWeight = candidate.evidenceStatus === 'reviewed_behavior' ? 2 : 0;
  const warningPenalty = candidate.compatibility.warningRules.length * 2;
  const missingPenalty = candidate.compatibility.missingData.length * 4;
  return matchWeight + evidenceWeight - warningPenalty - missingPenalty;
};

const sortCandidates = (candidates: ReplacementCandidate[]) => [...candidates].sort((a, b) => {
  const rankDelta = candidateRank(b) - candidateRank(a);
  if (rankDelta !== 0) return rankDelta;
  return a.species.id.localeCompare(b.species.id);
});

export const recommendReplacementSpecies = ({
  aquarium,
  rejectedSpecies,
  catalog,
  candidateQuantity = 1,
}: ReplacementRecommendationInput): ReplacementRecommendationResult => {
  const intent = deriveReplacementIntent(rejectedSpecies);
  const catalogById = new Map(catalog.map(species => [species.id, species]));
  const unresolvedCurrentSpeciesIds = Array.from(new Set(
    aquarium.fishes
      .map(record => record.fishId)
      .filter((id): id is string => Boolean(id) && !catalogById.has(id)),
  ));
  const existingSpecies = aquarium.fishes.flatMap(record => {
    const species = catalogById.get(record.fishId);
    return species ? [{ species, record: { quantity: Math.max(1, record.quantity || 1) } }] : [];
  });

  // Replacement MVP is intentionally strict: preserve the user's original role,
  // life type and water context instead of filling a carousel with unrelated but
  // technically low-risk organisms.
  const candidatePool = catalog.filter(candidate => (
    candidate.id !== rejectedSpecies.id
    && getLifeType(candidate) === intent.lifeType
    && getSpeciesWaterType(candidate) === intent.waterType
    && getSecondaryCategory(candidate) === intent.role
  ));

  const recommended: ReplacementCandidate[] = [];
  const conditional: ReplacementCandidate[] = [];
  const needsConfirmation: ReplacementCandidate[] = [];
  let rejectedCandidateCount = 0;

  candidatePool.forEach(candidate => {
    const compatibility = evaluateTankCompatibility({
      tank: aquarium,
      existingSpecies,
      candidateSpecies: candidate,
      candidateQuantity,
    });
    const evidenceStatus = hasReviewedBehaviorEvidence(candidate)
      ? 'reviewed_behavior' as const
      : 'behavior_evidence_missing' as const;
    const result: ReplacementCandidate = {
      species: candidate,
      compatibility,
      intentMatches: getIntentMatches(candidate, intent),
      evidenceStatus,
    };

    if (compatibility.status === 'not_recommended') {
      rejectedCandidateCount += 1;
      return;
    }

    // A current unresolved animal makes the whole-community behavior context
    // incomplete. We may surface candidates to investigate, but never promote
    // them to a formal recommendation by ignoring the unknown tank resident.
    if (unresolvedCurrentSpeciesIds.length > 0) {
      needsConfirmation.push(result);
      return;
    }

    if (compatibility.status === 'insufficient_data') {
      needsConfirmation.push(result);
      return;
    }

    if (compatibility.status === 'caution') {
      conditional.push(result);
      return;
    }

    if (existingSpecies.length > 0 && evidenceStatus === 'behavior_evidence_missing') {
      needsConfirmation.push(result);
      return;
    }

    recommended.push(result);
  });

  const sortedRecommended = sortCandidates(recommended);
  const sortedConditional = sortCandidates(conditional);
  const sortedNeedsConfirmation = sortCandidates(needsConfirmation);
  const evaluatedCandidateCount = candidatePool.length;

  const status: ReplacementRecommendationResult['status'] = unresolvedCurrentSpeciesIds.length > 0
    ? 'insufficient_data'
    : sortedRecommended.length > 0 || sortedConditional.length > 0
      ? 'alternatives_found'
      : sortedNeedsConfirmation.length > 0
        ? 'insufficient_data'
        : 'no_safe_same_intent_alternative';

  return {
    status,
    intent,
    recommended: sortedRecommended,
    conditional: sortedConditional,
    needsConfirmation: sortedNeedsConfirmation,
    unresolvedCurrentSpeciesIds,
    evaluatedCandidateCount,
    rejectedCandidateCount,
  };
};

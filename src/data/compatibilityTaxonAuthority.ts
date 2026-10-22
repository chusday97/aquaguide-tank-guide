import type { CompatibilityRequiredFact } from '../../packages/contracts/src';
import type { DomainSpeciesFact } from '../../packages/domain-rules/src';
import type { Fish } from '../types';

export type CompatibilityTaxonAuthorityRank = 'genus' | 'family';

export type ReviewedCompatibilityTaxonFact = {
  rank: CompatibilityTaxonAuthorityRank;
  taxonName: string;
  /**
   * Family defaults are fail-closed: a family authority must explicitly list
   * the genera it covers. Scientific-name inference alone never guesses family.
   */
  coveredGenera?: string[];
  field: CompatibilityRequiredFact;
  status: 'reviewed_supported' | 'reviewed_neutral_or_negative';
  patch: Partial<DomainSpeciesFact>;
  evidenceIds: string[];
  confidence: 'high' | 'medium';
  reviewStatus: 'reviewed';
  /** Variants/morphs are excluded unless the reviewed authority explicitly covers them. */
  appliesToVariants?: boolean;
  note?: string;
};

export type CompatibilityTaxonFactResolver = (
  fish: Pick<Fish, 'id' | 'scientificName'>,
  field: CompatibilityRequiredFact,
) => ReviewedCompatibilityTaxonFact | undefined;

/**
 * Production taxon defaults are intentionally explicit and reviewed. Do not
 * infer them from one catalogue species or from common-name heuristics.
 *
 * New reviewed genus/family defaults can be added here after the evidence
 * establishes that the specific field is safely shared at that taxonomic rank.
 */
export const reviewedCompatibilityTaxonFacts: ReviewedCompatibilityTaxonFact[] = [];

export const getScientificGenus = (scientificName?: string | null) => {
  const match = scientificName?.trim().match(/^([A-Z][A-Za-z-]+)(?:\s|$)/);
  return match?.[1] ?? null;
};

export const isCompatibilityTaxonVariant = (scientificName?: string | null) => {
  const normalized = scientificName?.trim() || '';
  return /\b(?:var\.|morph|strain|breed|form)\b/i.test(normalized)
    || /^([A-Z][A-Za-z-]+)\s+([a-z][A-Za-z-]+)\s+\S+/.test(normalized);
};

const cloneFact = (fact: ReviewedCompatibilityTaxonFact): ReviewedCompatibilityTaxonFact => ({
  ...fact,
  coveredGenera: fact.coveredGenera ? [...fact.coveredGenera] : undefined,
  patch: {
    ...fact.patch,
    ...(fact.patch.waterTypes ? { waterTypes: [...fact.patch.waterTypes] } : {}),
    ...(fact.patch.behaviorTraits ? { behaviorTraits: [...fact.patch.behaviorTraits] } : {}),
    ...(fact.patch.predationTargets ? { predationTargets: [...fact.patch.predationTargets] } : {}),
    ...(fact.patch.evidenceIds ? { evidenceIds: [...fact.patch.evidenceIds] } : {}),
  },
  evidenceIds: [...fact.evidenceIds],
});

export const resolveReviewedCompatibilityTaxonFact = (
  fish: Pick<Fish, 'id' | 'scientificName'>,
  field: CompatibilityRequiredFact,
  authorities: readonly ReviewedCompatibilityTaxonFact[] = reviewedCompatibilityTaxonFacts,
): ReviewedCompatibilityTaxonFact | undefined => {
  const genus = getScientificGenus(fish.scientificName);
  if (!genus) return undefined;

  const candidates = authorities.filter(authority => (
    authority.reviewStatus === 'reviewed'
    && authority.field === field
    && authority.evidenceIds.length > 0
  ));

  const variant = isCompatibilityTaxonVariant(fish.scientificName);
  const eligibleForObject = (authority: ReviewedCompatibilityTaxonFact) => (
    !variant || authority.appliesToVariants === true
  );

  const genusMatches = candidates.filter(authority => (
    authority.rank === 'genus' && authority.taxonName === genus && eligibleForObject(authority)
  ));
  // Conflicting duplicate authorities are not auto-selected.
  if (genusMatches.length === 1) return cloneFact(genusMatches[0]);
  if (genusMatches.length > 1) return undefined;

  const familyMatches = candidates.filter(authority => (
    authority.rank === 'family'
    && authority.coveredGenera?.includes(genus)
    && eligibleForObject(authority)
  ));
  // Family membership is accepted only from the explicit reviewed authority.
  if (familyMatches.length !== 1) return undefined;
  return cloneFact(familyMatches[0]);
};

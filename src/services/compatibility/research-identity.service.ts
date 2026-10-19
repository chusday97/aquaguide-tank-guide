import { getApprovedCatalogFieldReviews } from '../../data/catalogFieldReviews';
import type { CompatibilityTaxonResearchPlanItem } from './compatibility-field-coverage.service';
import type {
  CompatibilitySpeciesIdentityResolution,
  CompatibilitySpeciesIdentityResolver,
} from './species-onboarding-research.service';

const normalizeScientificName = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export const resolveReviewedCatalogResearchIdentity = (
  job: Pick<CompatibilityTaxonResearchPlanItem, 'baseScientificName' | 'catalogObjects'>,
): CompatibilitySpeciesIdentityResolution | null => {
  if (!job.baseScientificName || job.catalogObjects.length === 0) return null;
  const target = normalizeScientificName(job.baseScientificName);
  const allReviewed = job.catalogObjects.every(object => {
    const review = getApprovedCatalogFieldReviews(object.speciesId)
      .find(item => item.field === 'identity' && item.resolution === 'supported');
    if (!review || typeof review.proposedValue !== 'object' || review.proposedValue === null) return false;
    const value = review.proposedValue as { scientificName?: unknown; baseSpeciesKey?: unknown };
    return [value.scientificName, value.baseSpeciesKey]
      .some(candidate => typeof candidate === 'string' && normalizeScientificName(candidate) === target);
  });
  if (!allReviewed) return null;
  return {
    status: 'verified',
    queriedScientificName: job.baseScientificName,
    canonicalName: job.baseScientificName,
    externalId: 'reviewed-catalog:' + job.catalogObjects.map(object => object.speciesId).join(','),
    sourceUrl: null,
    confidence: 100,
    reasonCode: 'reviewed_catalog_identity',
  };
};

export const resolveCompatibilityResearchIdentity = async (
  job: Pick<CompatibilityTaxonResearchPlanItem, 'baseScientificName' | 'catalogObjects'>,
  externalResolver: CompatibilitySpeciesIdentityResolver,
): Promise<CompatibilitySpeciesIdentityResolution> => {
  const reviewed = resolveReviewedCatalogResearchIdentity(job);
  if (reviewed) return reviewed;
  if (!job.baseScientificName) {
    return {
      status: 'unresolved',
      queriedScientificName: '',
      canonicalName: null,
      externalId: null,
      sourceUrl: null,
      confidence: null,
      reasonCode: 'research_plan_identity_unresolved',
    };
  }
  return externalResolver.resolve(job.baseScientificName);
};

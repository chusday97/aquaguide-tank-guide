import { getCatalogCanonicalIdentity } from '../../data/catalogCanonicalIdentity';
import {
  catalogIdentityResearchDebtReviews,
  type CatalogIdentityResearchDebtStatus,
} from '../../data/catalogIdentityResearchDebt';
import { getBaseSpeciesScientificName } from '../../modules/species/speciesTaxonomy';
import { buildCompatibilityResearchDebtRoutingReport } from './taxon-authority-research.service';

export type CompatibilityIdentityDebtStage =
  | 'reviewed_evidence_ceiling'
  | 'batch_identity_review'
  | 'single_identity_review';

export type CompatibilityIdentityDebtItem = {
  speciesId: string;
  name: string;
  scientificName: string;
  candidateBaseScientificName: string | null;
  identityForm: 'variant_like' | 'exact_or_unparsed';
  reasonCodes: string[];
  stage: CompatibilityIdentityDebtStage;
  reviewedResearchDebtStatus: CatalogIdentityResearchDebtStatus | null;
  canonicalBridgePresent: boolean;
  candidateForAutomaticBridge: false;
  nextAction:
    | 'keep_identity_hold_until_new_exact_evidence'
    | 'review_exact_object_identity_with_parent_taxon_context';
};

const countBy = <T extends string>(values: T[]) => Object.fromEntries(
  [...new Set(values)].sort().map(value => [value, values.filter(candidate => candidate === value).length]),
) as Partial<Record<T, number>>;

export const buildCompatibilityIdentityDebtRoutingReport = () => {
  const debt = buildCompatibilityResearchDebtRoutingReport()
    .items
    .filter(item => item.lane === 'identity_first');

  const preItems = debt.map(item => {
    const base = getBaseSpeciesScientificName(item.scientificName);
    const variantLike = Boolean(base && base.trim() !== item.scientificName.trim());
    const reviewedDebt = catalogIdentityResearchDebtReviews[item.speciesId];
    const canonicalBridgePresent = Boolean(getCatalogCanonicalIdentity(item.speciesId));
    const reasonCodes = [...new Set(
      item.hardDecisionGaps.map(field => field.reasonCode || 'identity_boundary_without_reason'),
    )].sort();

    return {
      speciesId: item.speciesId,
      name: item.name,
      scientificName: item.scientificName,
      candidateBaseScientificName: base,
      identityForm: variantLike ? 'variant_like' as const : 'exact_or_unparsed' as const,
      reasonCodes,
      reviewedResearchDebtStatus: reviewedDebt?.status ?? null,
      canonicalBridgePresent,
    };
  });

  const clusterCounts = new Map<string, number>();
  for (const item of preItems) {
    if (!item.candidateBaseScientificName) continue;
    clusterCounts.set(
      item.candidateBaseScientificName,
      (clusterCounts.get(item.candidateBaseScientificName) ?? 0) + 1,
    );
  }

  const items: CompatibilityIdentityDebtItem[] = preItems.map(item => {
    const reviewedEvidenceCeiling = item.reviewedResearchDebtStatus !== null;
    const clustered = Boolean(
      item.candidateBaseScientificName
      && (clusterCounts.get(item.candidateBaseScientificName) ?? 0) >= 2,
    );
    const stage: CompatibilityIdentityDebtStage = reviewedEvidenceCeiling
      ? 'reviewed_evidence_ceiling'
      : clustered
        ? 'batch_identity_review'
        : 'single_identity_review';

    return {
      ...item,
      stage,
      candidateForAutomaticBridge: false as const,
      nextAction: reviewedEvidenceCeiling
        ? 'keep_identity_hold_until_new_exact_evidence' as const
        : 'review_exact_object_identity_with_parent_taxon_context' as const,
    };
  });

  const clusterMap = new Map<string, CompatibilityIdentityDebtItem[]>();
  for (const item of items) {
    const key = item.candidateBaseScientificName ?? `catalog:${item.speciesId}`;
    const current = clusterMap.get(key) ?? [];
    current.push(item);
    clusterMap.set(key, current);
  }

  const clusters = [...clusterMap.entries()]
    .map(([researchKey, members]) => {
      const sorted = [...members].sort((a, b) => a.speciesId.localeCompare(b.speciesId));
      const reviewedEvidenceCeilingSpecies = sorted.filter(item => item.stage === 'reviewed_evidence_ceiling').length;
      const activeReviewSpecies = sorted.length - reviewedEvidenceCeilingSpecies;
      return {
        researchKey,
        candidateBaseScientificName: researchKey.startsWith('catalog:') ? null : researchKey,
        catalogObjectCount: sorted.length,
        activeReviewSpecies,
        reviewedEvidenceCeilingSpecies,
        variantLikeSpecies: sorted.filter(item => item.identityForm === 'variant_like').length,
        exactOrUnparsedSpecies: sorted.filter(item => item.identityForm === 'exact_or_unparsed').length,
        reasonCodes: [...new Set(sorted.flatMap(item => item.reasonCodes))].sort(),
        speciesIds: sorted.map(item => item.speciesId),
        candidateForAutomaticBridge: false as const,
        nextAction: activeReviewSpecies === 0
          ? 'keep_cluster_on_identity_evidence_ceiling' as const
          : sorted.length >= 2
            ? 'batch_exact_object_identity_review_with_parent_taxon_context' as const
            : 'single_exact_object_identity_review' as const,
      };
    })
    .sort((a, b) => (
      b.activeReviewSpecies - a.activeReviewSpecies
      || b.catalogObjectCount - a.catalogObjectCount
      || a.researchKey.localeCompare(b.researchKey)
    ));

  const multiObjectClusters = clusters.filter(cluster => cluster.catalogObjectCount >= 2);

  return {
    policy: 'Identity is reviewed per catalog object. Parent-taxon clustering only deduplicates research context; it never auto-creates a canonical bridge or Compatibility inheritance. Reviewed evidence ceilings are not re-searched without new exact-object evidence.',
    summary: {
      identityFirstSpecies: items.length,
      variantLikeSpecies: items.filter(item => item.identityForm === 'variant_like').length,
      exactOrUnparsedSpecies: items.filter(item => item.identityForm === 'exact_or_unparsed').length,
      reviewedEvidenceCeilingSpecies: items.filter(item => item.stage === 'reviewed_evidence_ceiling').length,
      actionableIdentityReviewSpecies: items.filter(item => item.stage !== 'reviewed_evidence_ceiling').length,
      canonicalBridgePresentSpecies: items.filter(item => item.canonicalBridgePresent).length,
      multiObjectParentClusters: multiObjectClusters.length,
      speciesInMultiObjectParentClusters: multiObjectClusters.reduce((count, cluster) => count + cluster.catalogObjectCount, 0),
      activeBatchReviewClusters: multiObjectClusters.filter(cluster => cluster.activeReviewSpecies > 0).length,
      stageCounts: countBy(items.map(item => item.stage)),
      reasonCounts: countBy(items.flatMap(item => item.reasonCodes)),
    },
    items,
    clusters,
  };
};

import { fishData } from '../../data/fishData';
import {
  catalogCanonicalIdentities,
  isReviewedColorOnlyVariantKey,
  reviewedColorPolicyCanonicalSpeciesIds,
} from '../../data/catalogCanonicalIdentity';
import { catalogIdentityCorrectionBaseSpeciesIds } from '../../data/catalogIdentityCorrections';
import { getCatalogIdentityBoundary } from '../../data/catalogIdentityBoundaries';
import { getApprovedCatalogFieldReviews } from '../../data/catalogFieldReviews';
import { getLifeType } from '../../modules/species/species.service';
import { buildCompatibilityCoreFieldCoverage } from './compatibility-field-coverage.service';

const latestReviewedIdentityValue = (speciesId: string) => {
  const review = getApprovedCatalogFieldReviews(speciesId)
    .filter(item => item.field === 'identity' && item.resolution === 'supported')
    .at(-1);
  if (!review || typeof review.proposedValue !== 'object' || review.proposedValue === null) return null;
  const value = review.proposedValue as { baseSpeciesKey?: unknown; variantKey?: unknown };
  const baseSpeciesKey = typeof value.baseSpeciesKey === 'string' ? value.baseSpeciesKey.trim() : '';
  const variantKey = typeof value.variantKey === 'string' ? value.variantKey.trim() : '';
  if (!baseSpeciesKey || !variantKey) return null;
  return {
    baseSpeciesKey,
    variantKey,
    evidenceIds: [...review.citationIds],
  };
};

const remainingVariantClass = (variantKey: string) => {
  const normalized = variantKey.trim().toLowerCase().replace(/[\s/_-]+/g, '_');
  if (/longfin|veil|high_fin|balloon|telescope|giant/.test(normalized)) return 'morphology_or_body_form_variant' as const;
  if (isReviewedColorOnlyVariantKey(variantKey)) return 'color_variant_without_canonical_root' as const;
  if (/koi|ornamental|wild_type|strain|glo/.test(normalized)) return 'trade_or_selective_strain' as const;
  return 'other_reviewed_variant' as const;
};

export const buildCompatibilityVariantInheritanceAudit = () => {
  const fish = fishData.filter(species => getLifeType(species) === 'fish');
  const coverage = buildCompatibilityCoreFieldCoverage();
  const coverageById = new Map(coverage.rows.map(row => [row.speciesId, row]));

  const promoted = [...reviewedColorPolicyCanonicalSpeciesIds]
    .sort()
    .map(speciesId => {
      const species = fishData.find(item => item.id === speciesId);
      const identity = catalogCanonicalIdentities[speciesId];
      const reviewed = latestReviewedIdentityValue(speciesId);
      const row = coverageById.get(speciesId);
      if (!species || !identity || !reviewed || !row) {
        throw new Error('Incomplete reviewed color-morph audit row: ' + speciesId);
      }
      const base = fishData.find(item => item.id === identity.canonicalSpeciesId);
      if (!base) throw new Error('Missing canonical color-morph base: ' + speciesId);
      return {
        speciesId,
        name: species.name,
        scientificName: species.scientificName,
        canonicalSpeciesId: identity.canonicalSpeciesId,
        canonicalScientificName: identity.canonicalScientificName,
        variantKey: identity.variantKey,
        registrySource: identity.registrySource,
        evidenceIds: [...identity.identityEvidenceSourceIds],
        inheritedFacts: [...identity.inheritancePolicy.inheritedFacts],
        blockedFacts: [...identity.inheritancePolicy.blockedFacts],
        genericOnboardingReady: row.genericOnboardingReady,
        authoritativeFieldCount: row.authoritativeFieldCount,
      };
    });

  const remainingReviewedVariants = fish
    .flatMap(species => {
      if (catalogCanonicalIdentities[species.id]) return [];
      const reviewed = latestReviewedIdentityValue(species.id);
      if (!reviewed) return [];
      return [{
        speciesId: species.id,
        name: species.name,
        scientificName: species.scientificName,
        baseSpeciesKey: reviewed.baseSpeciesKey,
        variantKey: reviewed.variantKey,
        class: remainingVariantClass(reviewed.variantKey),
        activeIdentityBoundary: getCatalogIdentityBoundary(species.id)?.code ?? null,
        evidenceIds: reviewed.evidenceIds,
        genericOnboardingReady: coverageById.get(species.id)?.genericOnboardingReady ?? false,
      }];
    })
    .sort((a, b) => a.speciesId.localeCompare(b.speciesId));

  const remainingByClass = remainingReviewedVariants.reduce<Record<string, number>>((acc, item) => {
    acc[item.class] = (acc[item.class] || 0) + 1;
    return acc;
  }, {});

  return {
    version: 1,
    invariant: 'Catalog object -> reviewed canonical identity -> field allowlist -> resolved authority -> Compatibility',
    policy: {
      autoPromotionRequiresReviewedSupportedIdentity: true,
      requiresCanonicalCatalogRoot: true,
      colorOnlyVariantKeys: ['albino', 'blue', 'color_morph', 'gold', 'green', 'platinum', 'red', 'super_red', 'white'],
      morphologyVariantsAutoPromoted: false,
      tradeOrLineageVariantsAutoPromoted: false,
      unresolvedIdentityAutoPromoted: false,
      pairRulesRequiredForPromotedColorMorphs: false,
    },
    summary: {
      fishDomainSpecies: fish.length,
      genericOnboardingReadySpecies: coverage.summary.genericOnboardingReadySpecies,
      explicitReviewedCanonicalBridges: Object.keys(catalogIdentityCorrectionBaseSpeciesIds).length,
      reviewedColorPolicyCanonicalRecords: promoted.length,
      totalCanonicalIdentityRecords: Object.keys(catalogCanonicalIdentities).length,
      policyPromotedReadySpecies: promoted.filter(item => item.genericOnboardingReady).length,
      remainingReviewedVariantObjects: remainingReviewedVariants.length,
      remainingReviewedVariantsByClass: remainingByClass,
    },
    promoted,
    remainingReviewedVariants,
  };
};

export type CompatibilityVariantInheritanceAudit = ReturnType<typeof buildCompatibilityVariantInheritanceAudit>;

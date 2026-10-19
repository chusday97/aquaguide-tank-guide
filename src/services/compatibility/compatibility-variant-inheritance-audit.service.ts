import { fishData } from '../../data/fishData';
import {
  catalogCanonicalIdentities,
  isReviewedColorOnlyVariantKey,
  reviewedColorPolicyCanonicalSpeciesIds,
  reviewedColorTaxonPolicyCanonicalSpeciesIds,
  reviewedVariantFieldPolicySpeciesIds,
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
      return {
        speciesId,
        name: species.name,
        scientificName: species.scientificName,
        canonicalSpeciesId: identity.canonicalSpeciesId,
        canonicalRootKind: identity.canonicalRootKind,
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

  const fieldScopedPolicies = [...reviewedVariantFieldPolicySpeciesIds]
    .sort()
    .map(speciesId => {
      const species = fishData.find(item => item.id === speciesId);
      const identity = catalogCanonicalIdentities[speciesId];
      const row = coverageById.get(speciesId);
      if (!species || !identity || !row) {
        throw new Error('Incomplete reviewed variant field-policy audit row: ' + speciesId);
      }
      return {
        speciesId,
        name: species.name,
        scientificName: species.scientificName,
        canonicalScientificName: identity.canonicalScientificName,
        relationshipType: identity.relationshipType,
        variantKey: identity.variantKey,
        registrySource: identity.registrySource,
        evidenceIds: [...identity.identityEvidenceSourceIds],
        inheritedFacts: [...identity.inheritancePolicy.inheritedFacts],
        blockedFacts: [...identity.inheritancePolicy.blockedFacts],
        genericOnboardingReady: row.genericOnboardingReady,
        authoritativeFieldCount: row.authoritativeFieldCount,
        terminalGapFields: Object.entries(row.fields)
          .filter(([, cell]) => cell.disposition === 'terminal_hold')
          .map(([field]) => field),
      };
    });

  const directReviewedVariants = fish
    .flatMap(species => {
      if (catalogCanonicalIdentities[species.id]) return [];
      const reviewed = latestReviewedIdentityValue(species.id);
      const row = coverageById.get(species.id);
      if (!reviewed || !row?.genericOnboardingReady) return [];
      return [{
        speciesId: species.id,
        name: species.name,
        scientificName: species.scientificName,
        baseSpeciesKey: reviewed.baseSpeciesKey,
        variantKey: reviewed.variantKey,
        class: remainingVariantClass(reviewed.variantKey),
        evidenceIds: reviewed.evidenceIds,
        authoritativeFieldCount: row.authoritativeFieldCount,
        resolutionStrategy: 'direct_reviewed_authority_no_inheritance' as const,
      }];
    })
    .sort((a, b) => a.speciesId.localeCompare(b.speciesId));

  const remainingReviewedVariants = fish
    .flatMap(species => {
      if (catalogCanonicalIdentities[species.id]) return [];
      const reviewed = latestReviewedIdentityValue(species.id);
      const row = coverageById.get(species.id);
      if (!reviewed || row?.genericOnboardingReady) return [];
      return [{
        speciesId: species.id,
        name: species.name,
        scientificName: species.scientificName,
        baseSpeciesKey: reviewed.baseSpeciesKey,
        variantKey: reviewed.variantKey,
        class: remainingVariantClass(reviewed.variantKey),
        activeIdentityBoundary: getCatalogIdentityBoundary(species.id)?.code ?? null,
        evidenceIds: reviewed.evidenceIds,
        genericOnboardingReady: row?.genericOnboardingReady ?? false,
        authoritativeFieldCount: row?.authoritativeFieldCount ?? 0,
      }];
    })
    .sort((a, b) => a.speciesId.localeCompare(b.speciesId));

  const remainingByClass = remainingReviewedVariants.reduce<Record<string, number>>((acc, item) => {
    acc[item.class] = (acc[item.class] || 0) + 1;
    return acc;
  }, {});

  return {
    version: 2,
    invariant: 'Catalog object -> reviewed canonical identity -> field allowlist -> resolved authority -> Compatibility',
    policy: {
      autoPromotionRequiresReviewedSupportedIdentity: true,
      requiresCanonicalCatalogRoot: false,
      allowsReviewedTaxonRoot: true,
      restrictedToFishCompatibilityDomain: true,
      colorOnlyVariantKeys: ['albino', 'blue', 'color_morph', 'gold', 'green', 'platinum', 'red', 'super_red', 'white'],
      morphologyVariantsAutoPromoted: false,
      tradeOrLineageVariantsAutoPromoted: false,
      explicitFieldScopedVariantPoliciesAllowed: true,
      directReviewedVariantsRequireInheritance: false,
      unresolvedIdentityAutoPromoted: false,
      pairRulesRequiredForPromotedColorMorphs: false,
      pairRulesRequiredForFieldScopedVariantPolicies: false,
    },
    summary: {
      fishDomainSpecies: fish.length,
      genericOnboardingReadySpecies: coverage.summary.genericOnboardingReadySpecies,
      explicitReviewedCanonicalBridges: Object.keys(catalogIdentityCorrectionBaseSpeciesIds).length,
      reviewedColorPolicyCanonicalRecords: promoted.length,
      reviewedColorTaxonRootRecords: reviewedColorTaxonPolicyCanonicalSpeciesIds.size,
      reviewedVariantFieldPolicyRecords: fieldScopedPolicies.length,
      totalCanonicalIdentityRecords: Object.keys(catalogCanonicalIdentities).length,
      policyPromotedReadySpecies: promoted.filter(item => item.genericOnboardingReady).length,
      fieldPolicyReadySpecies: fieldScopedPolicies.filter(item => item.genericOnboardingReady).length,
      directReviewedVariantObjects: directReviewedVariants.length,
      remainingReviewedVariantObjects: remainingReviewedVariants.length,
      remainingReviewedVariantsByClass: remainingByClass,
    },
    promoted,
    fieldScopedPolicies,
    directReviewedVariants,
    remainingReviewedVariants,
  };
};

export type CompatibilityVariantInheritanceAudit = ReturnType<typeof buildCompatibilityVariantInheritanceAudit>;

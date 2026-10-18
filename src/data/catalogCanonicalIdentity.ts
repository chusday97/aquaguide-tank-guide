import {
  GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS,
  type CompatibilityRequiredFact,
} from '../../packages/contracts/src';
import type { Fish } from '../types';
import { getApprovedCatalogFieldReviews } from './catalogFieldReviews';
import { getCatalogIdentityBoundary } from './catalogIdentityBoundaries';
import { catalogIdentityCorrectionBaseSpeciesIds } from './catalogIdentityCorrections';
import { fishData } from './fishData';

export type CatalogCanonicalRelationshipType =
  | 'selectively_bred_variant'
  | 'color_morph'
  | 'longfin_variant'
  | 'trade_strain'
  | 'geographic_variant'
  | 'same_taxon_catalog_alias';

export type CatalogCanonicalRegistrySource =
  | 'explicit_reviewed_bridge'
  | 'reviewed_color_morph_policy';

export type CompatibilityInheritancePolicy = {
  mode: 'allowlist';
  inheritedFacts: CompatibilityRequiredFact[];
  blockedFacts: CompatibilityRequiredFact[];
};

export type CatalogCanonicalIdentity = {
  catalogSpeciesId: string;
  canonicalSpeciesId: string;
  canonicalScientificName: string;
  relationshipType: CatalogCanonicalRelationshipType;
  identityStatus: 'reviewed';
  variantKey: string;
  identityEvidenceSourceIds: string[];
  registrySource: CatalogCanonicalRegistrySource;
  inheritancePolicy: CompatibilityInheritancePolicy;
};

const allGenericFacts = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS] as CompatibilityRequiredFact[];

const reviewedColorOnlyVariantKeys = new Set([
  'albino',
  'blue',
  'color_morph',
  'gold',
  'green',
  'platinum',
  'red',
  'super_red',
  'white',
]);

const normalizeVariantKey = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[\s/-]+/g, '_')
  .replace(/_+/g, '_');

export const isReviewedColorOnlyVariantKey = (variantKey: string) => (
  reviewedColorOnlyVariantKeys.has(normalizeVariantKey(variantKey))
);

const relationshipBySpeciesId: Record<string, CatalogCanonicalRelationshipType> = {
  sp_0176: 'color_morph',
  sp_0407: 'trade_strain',
  sp_0236: 'color_morph',
  sp_0229: 'color_morph',
  sp_0221: 'selectively_bred_variant',
  sp_0177: 'color_morph',
  sp_0178: 'color_morph',
  sp_0388: 'color_morph',
  sp_0240: 'longfin_variant',
  sp_0272: 'longfin_variant',
  sp_0266: 'geographic_variant',
  sp_0242: 'color_morph',
  sp_0408: 'trade_strain',
  sp_0257: 'color_morph',
  sp_0284: 'color_morph',
  sp_0234: 'color_morph',
  sp_0231: 'color_morph',
  sp_0411: 'geographic_variant',
  sp_0442: 'same_taxon_catalog_alias',
};

const latestReviewedIdentity = (speciesId: string) => getApprovedCatalogFieldReviews(speciesId)
  .filter(review => review.field === 'identity' && review.resolution === 'supported')
  .at(-1);

const buildCanonicalIdentity = (
  catalogSpeciesId: string,
  canonicalSpeciesId: string,
  relationshipType: CatalogCanonicalRelationshipType,
  registrySource: CatalogCanonicalRegistrySource,
): CatalogCanonicalIdentity => {
  const catalog = fishData.find(item => item.id === catalogSpeciesId);
  const canonical = fishData.find(item => item.id === canonicalSpeciesId);
  if (!catalog) throw new Error('Canonical identity catalog object missing: ' + catalogSpeciesId);
  if (!canonical) throw new Error('Canonical identity base object missing: ' + canonicalSpeciesId);

  const identityReview = latestReviewedIdentity(catalogSpeciesId);
  if (!identityReview || typeof identityReview.proposedValue !== 'object' || identityReview.proposedValue === null) {
    throw new Error('Canonical identity requires a reviewed identity field: ' + catalogSpeciesId);
  }
  const value = identityReview.proposedValue as {
    baseSpeciesKey?: unknown;
    variantKey?: unknown;
  };
  if (typeof value.baseSpeciesKey !== 'string' || value.baseSpeciesKey.trim() !== canonical.scientificName.trim()) {
    throw new Error('Canonical identity base taxon mismatch: ' + catalogSpeciesId);
  }
  if (typeof value.variantKey !== 'string' || !value.variantKey.trim()) {
    throw new Error('Canonical identity variant key missing: ' + catalogSpeciesId);
  }

  return {
    catalogSpeciesId,
    canonicalSpeciesId,
    canonicalScientificName: canonical.scientificName.trim(),
    relationshipType,
    identityStatus: 'reviewed',
    variantKey: value.variantKey.trim(),
    identityEvidenceSourceIds: [...identityReview.citationIds],
    registrySource,
    inheritancePolicy: {
      mode: 'allowlist',
      inheritedFacts: [...allGenericFacts],
      blockedFacts: [],
    },
  };
};

const explicitCanonicalIdentityEntries = Object.entries(catalogIdentityCorrectionBaseSpeciesIds)
  .map(([catalogSpeciesId, canonicalSpeciesId]) => {
    const relationshipType = relationshipBySpeciesId[catalogSpeciesId];
    if (!relationshipType) throw new Error('Canonical identity relationship type missing: ' + catalogSpeciesId);
    return [
      catalogSpeciesId,
      buildCanonicalIdentity(
        catalogSpeciesId,
        canonicalSpeciesId,
        relationshipType,
        'explicit_reviewed_bridge',
      ),
    ] as const;
  });

const findCanonicalBaseCatalogSpeciesId = (
  catalogSpeciesId: string,
  canonicalScientificName: string,
) => fishData.find(item => {
  if (item.id === catalogSpeciesId) return false;
  if (item.scientificName.trim() !== canonicalScientificName.trim()) return false;
  if (getCatalogIdentityBoundary(item.id)) return false;
  const identity = latestReviewedIdentity(item.id);
  if (!identity || typeof identity.proposedValue !== 'object' || identity.proposedValue === null) return true;
  const value = identity.proposedValue as { variantKey?: unknown };
  return typeof value.variantKey !== 'string' || !value.variantKey.trim();
})?.id ?? null;

const explicitCanonicalSpeciesIds = new Set(Object.keys(catalogIdentityCorrectionBaseSpeciesIds));

const reviewedColorPolicyEntries = fishData.flatMap(catalog => {
  if (explicitCanonicalSpeciesIds.has(catalog.id)) return [];
  if (getCatalogIdentityBoundary(catalog.id)) return [];

  const identityReview = latestReviewedIdentity(catalog.id);
  if (!identityReview || typeof identityReview.proposedValue !== 'object' || identityReview.proposedValue === null) return [];
  const value = identityReview.proposedValue as { baseSpeciesKey?: unknown; variantKey?: unknown };
  if (typeof value.baseSpeciesKey !== 'string' || !value.baseSpeciesKey.trim()) return [];
  if (typeof value.variantKey !== 'string' || !isReviewedColorOnlyVariantKey(value.variantKey)) return [];

  const canonicalSpeciesId = findCanonicalBaseCatalogSpeciesId(catalog.id, value.baseSpeciesKey);
  if (!canonicalSpeciesId) return [];

  return [[
    catalog.id,
    buildCanonicalIdentity(
      catalog.id,
      canonicalSpeciesId,
      'color_morph',
      'reviewed_color_morph_policy',
    ),
  ] as const];
});

export const catalogCanonicalIdentities: Record<string, CatalogCanonicalIdentity> = Object.fromEntries([
  ...explicitCanonicalIdentityEntries,
  ...reviewedColorPolicyEntries,
]);

export const reviewedColorPolicyCanonicalSpeciesIds = new Set(
  reviewedColorPolicyEntries.map(([speciesId]) => speciesId),
);

export const getCatalogCanonicalIdentity = (speciesId: string) => catalogCanonicalIdentities[speciesId];

export const getCatalogCanonicalBaseSpeciesId = (speciesId: string) => (
  getCatalogCanonicalIdentity(speciesId)?.canonicalSpeciesId ?? null
);

export const getCompatibilityInheritancePolicy = (speciesId: string) => (
  getCatalogCanonicalIdentity(speciesId)?.inheritancePolicy ?? null
);

export const canInheritCompatibilityFact = (
  speciesId: string,
  field: CompatibilityRequiredFact,
) => {
  const policy = getCompatibilityInheritancePolicy(speciesId);
  return policy ? policy.inheritedFacts.includes(field) : false;
};

export const hasFullGenericCompatibilityInheritance = (speciesId: string) => (
  allGenericFacts.every(field => canInheritCompatibilityFact(speciesId, field))
);

export const createCompatibilityInheritancePolicy = (
  inheritedFacts: readonly CompatibilityRequiredFact[],
): CompatibilityInheritancePolicy => {
  const inherited = new Set(inheritedFacts);
  return {
    mode: 'allowlist',
    inheritedFacts: allGenericFacts.filter(field => inherited.has(field)),
    blockedFacts: allGenericFacts.filter(field => !inherited.has(field)),
  };
};

export type CatalogIdentityReadiness =
  | 'reviewed_canonical_variant'
  | 'reviewed_direct_identity'
  | 'legacy_reviewed_catalog_object'
  | 'unresolved_identity'
  | 'unreviewed_new_object';

export const getCatalogIdentityReadiness = (
  fish: Pick<Fish, 'id' | 'scientificName'>,
  options: {
    catalogPersisted?: boolean;
    reviewedDirectIdentity?: boolean;
    hasReviewedCompatibilityProfile?: boolean;
  } = {},
): CatalogIdentityReadiness => {
  if (getCatalogIdentityBoundary(fish.id)) return 'unresolved_identity';
  if (getCatalogCanonicalIdentity(fish.id)) return 'reviewed_canonical_variant';
  if (options.reviewedDirectIdentity) return 'reviewed_direct_identity';

  // Existing released catalog authority is preserved during migration. New
  // objects do not receive this grandfathered path and must provide explicit
  // reviewed identity evidence before Compatibility readiness is possible.
  if (options.catalogPersisted && options.hasReviewedCompatibilityProfile) {
    return 'legacy_reviewed_catalog_object';
  }
  return 'unreviewed_new_object';
};

export const isCompatibilityIdentityReady = (readiness: CatalogIdentityReadiness) => (
  readiness === 'reviewed_canonical_variant'
  || readiness === 'reviewed_direct_identity'
  || readiness === 'legacy_reviewed_catalog_object'
);

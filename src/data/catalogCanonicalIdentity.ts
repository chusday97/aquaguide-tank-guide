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
  | 'reviewed_color_morph_policy'
  | 'reviewed_color_morph_taxon_policy'
  | 'reviewed_variant_field_policy';

export type CatalogCanonicalRootKind = 'catalog_species' | 'reviewed_taxon';

export type CompatibilityInheritancePolicy = {
  mode: 'allowlist';
  inheritedFacts: CompatibilityRequiredFact[];
  blockedFacts: CompatibilityRequiredFact[];
};

export type CatalogCanonicalIdentity = {
  catalogSpeciesId: string;
  canonicalSpeciesId: string | null;
  canonicalRootKind: CatalogCanonicalRootKind;
  canonicalScientificName: string;
  relationshipType: CatalogCanonicalRelationshipType;
  identityStatus: 'reviewed';
  variantKey: string;
  identityEvidenceSourceIds: string[];
  registrySource: CatalogCanonicalRegistrySource;
  inheritancePolicy: CompatibilityInheritancePolicy;
};

const allGenericFacts = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS] as CompatibilityRequiredFact[];

const buildCompatibilityInheritancePolicy = (
  inheritedFacts: readonly CompatibilityRequiredFact[],
): CompatibilityInheritancePolicy => {
  const inherited = new Set(inheritedFacts);
  return {
    mode: 'allowlist',
    inheritedFacts: allGenericFacts.filter(field => inherited.has(field)),
    blockedFacts: allGenericFacts.filter(field => !inherited.has(field)),
  };
};

const reviewedColorOnlyVariantKeys = new Set([
  'albino',
  'blue',
  'color_morph',
  'gold',
  'green',
  'platinum',
  'red',
  'red_grass_goldfish',
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

type ReviewedVariantFieldPolicyConfig = {
  canonicalScientificName: string;
  relationshipType: CatalogCanonicalRelationshipType;
  expectedVariantKey: string;
  inheritedFacts: CompatibilityRequiredFact[];
};

// Trade/selective and morphology variants are never auto-promoted as a class.
// A reviewed object may opt into a field-scoped policy only after its identity
// and the biological relevance of each inherited fact have been reviewed.
const reviewedVariantFieldPolicyConfigs: Record<string, ReviewedVariantFieldPolicyConfig> = {
  sp_0065: {
    canonicalScientificName: 'Carassius auratus',
    relationshipType: 'selectively_bred_variant',
    expectedVariantKey: 'Butterfly Tail',
    inheritedFacts: [],
  },
  sp_0066: {
    canonicalScientificName: 'Carassius auratus',
    relationshipType: 'selectively_bred_variant',
    expectedVariantKey: 'Red Cap Oranda',
    inheritedFacts: [],
  },
  sp_0067: {
    canonicalScientificName: 'Carassius auratus',
    relationshipType: 'selectively_bred_variant',
    expectedVariantKey: 'Pearlscale',
    inheritedFacts: [],
  },
  sp_0068: {
    canonicalScientificName: 'Carassius auratus',
    relationshipType: 'selectively_bred_variant',
    expectedVariantKey: 'Bubble Eye',
    inheritedFacts: [],
  },
  sp_0143: {
    canonicalScientificName: 'Poecilia reticulata',
    relationshipType: 'trade_strain',
    expectedVariantKey: 'Red Grass',
    inheritedFacts: [],
  },
  sp_0144: {
    canonicalScientificName: 'Poecilia reticulata',
    relationshipType: 'trade_strain',
    expectedVariantKey: 'Blue Grass',
    inheritedFacts: [],
  },
  sp_0155: {
    canonicalScientificName: 'Paracheirodon innesi',
    relationshipType: 'longfin_variant',
    expectedVariantKey: 'Longfin',
    inheritedFacts: [],
  },
  sp_0361: {
    canonicalScientificName: 'Tanichthys albonubes',
    relationshipType: 'longfin_variant',
    expectedVariantKey: 'Longfin',
    inheritedFacts: [],
  },
  sp_0258: {
    canonicalScientificName: 'Betta splendens',
    relationshipType: 'trade_strain',
    expectedVariantKey: 'Koi',
    // Koi/candy is a reviewed mosaic phenotype of domesticated B. splendens.
    // Environmental physiology, body size, space floor and trophic ecology can
    // use reviewed species-level authority. Social mode remains blocked because
    // reviewed aggression work shows meaningful individual/strain variation;
    // territoriality already has direct catalog-object authority.
    inheritedFacts: ['water', 'temperature', 'ph', 'adult_size', 'tank_size', 'predation'],
  },
};

const nonFishCompatibilityCategories = new Set([
  '虾螺蟹', '虾类', '螺类', '龟类', '两栖/爬宠', 'Amphibians/Reptiles', 'Turtles',
  '珊瑚/海水无脊椎', '水草',
]);

// Keep this registry dependency-free: importing species.service here creates a
// catalog -> runtime rules -> Compatibility -> catalog initialization cycle.
// Reviewed color canonical promotion belongs only to the fish Compatibility
// domain; obvious non-fish taxonomy is excluded before any root resolution.
export const isFishCompatibilityCatalogObject = (catalog: Pick<Fish, 'name' | 'scientificName' | 'category'>) => {
  if (nonFishCompatibilityCategories.has(catalog.category)) return false;
  const text = `${catalog.name} ${catalog.scientificName} ${catalog.category}`;
  if (/虾|螺|蟹|shrimp|snail|crab|Neocaridina|Caridina|Neritina|Clithon|Pomacea|Geosesarma/i.test(text)) return false;
  if (/珊瑚|海葵|coral|anemone|水母|jellyfish|龟|turtle|蛙|frog|axolotl|Ambystoma|Cynops|Ceratophrys/i.test(text)) return false;
  return true;
};

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
  sp_0216: 'same_taxon_catalog_alias',
  sp_0442: 'same_taxon_catalog_alias',
  sp_0338: 'same_taxon_catalog_alias',
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
  const variantKey = relationshipType === 'same_taxon_catalog_alias'
    ? value.variantKey === null
      ? null
      : typeof value.variantKey === 'string' && value.variantKey.trim()
        ? value.variantKey.trim()
        : (() => { throw new Error('Same-taxon catalog alias requires variantKey=null or a reviewed legacy alias key: ' + catalogSpeciesId); })()
    : typeof value.variantKey === 'string' && value.variantKey.trim()
      ? value.variantKey.trim()
      : (() => { throw new Error('Canonical identity variant key missing: ' + catalogSpeciesId); })();

  return {
    catalogSpeciesId,
    canonicalSpeciesId,
    canonicalRootKind: 'catalog_species',
    canonicalScientificName: canonical.scientificName.trim(),
    relationshipType,
    identityStatus: 'reviewed',
    variantKey,
    identityEvidenceSourceIds: [...identityReview.citationIds],
    registrySource,
    inheritancePolicy: {
      mode: 'allowlist',
      inheritedFacts: [...allGenericFacts],
      blockedFacts: [],
    },
  };
};

const buildTaxonCanonicalIdentity = (
  catalogSpeciesId: string,
  canonicalScientificName: string,
): CatalogCanonicalIdentity => {
  const catalog = fishData.find(item => item.id === catalogSpeciesId);
  if (!catalog) throw new Error('Canonical identity catalog object missing: ' + catalogSpeciesId);

  const identityReview = latestReviewedIdentity(catalogSpeciesId);
  if (!identityReview || typeof identityReview.proposedValue !== 'object' || identityReview.proposedValue === null) {
    throw new Error('Taxon canonical identity requires a reviewed identity field: ' + catalogSpeciesId);
  }
  const value = identityReview.proposedValue as {
    baseSpeciesKey?: unknown;
    variantKey?: unknown;
  };
  if (typeof value.baseSpeciesKey !== 'string' || value.baseSpeciesKey.trim() !== canonicalScientificName.trim()) {
    throw new Error('Taxon canonical identity base taxon mismatch: ' + catalogSpeciesId);
  }
  if (typeof value.variantKey !== 'string' || !isReviewedColorOnlyVariantKey(value.variantKey)) {
    throw new Error('Taxon canonical identity requires a reviewed color-only variant key: ' + catalogSpeciesId);
  }

  return {
    catalogSpeciesId,
    canonicalSpeciesId: null,
    canonicalRootKind: 'reviewed_taxon',
    canonicalScientificName: canonicalScientificName.trim(),
    relationshipType: 'color_morph',
    identityStatus: 'reviewed',
    variantKey: value.variantKey.trim(),
    identityEvidenceSourceIds: [...identityReview.citationIds],
    registrySource: 'reviewed_color_morph_taxon_policy',
    inheritancePolicy: {
      mode: 'allowlist',
      inheritedFacts: [...allGenericFacts],
      blockedFacts: [],
    },
  };
};

const buildReviewedVariantFieldPolicyIdentity = (
  catalogSpeciesId: string,
  config: ReviewedVariantFieldPolicyConfig,
): CatalogCanonicalIdentity => {
  const catalog = fishData.find(item => item.id === catalogSpeciesId);
  if (!catalog) throw new Error('Reviewed variant field-policy catalog object missing: ' + catalogSpeciesId);
  if (!isFishCompatibilityCatalogObject(catalog)) {
    throw new Error('Reviewed variant field policy is restricted to fish Compatibility: ' + catalogSpeciesId);
  }
  if (getCatalogIdentityBoundary(catalogSpeciesId)) {
    throw new Error('Reviewed variant field policy cannot bypass an active identity boundary: ' + catalogSpeciesId);
  }

  const identityReview = latestReviewedIdentity(catalogSpeciesId);
  if (!identityReview || typeof identityReview.proposedValue !== 'object' || identityReview.proposedValue === null) {
    throw new Error('Reviewed variant field policy requires a reviewed identity field: ' + catalogSpeciesId);
  }
  const value = identityReview.proposedValue as { baseSpeciesKey?: unknown; variantKey?: unknown };
  if (typeof value.baseSpeciesKey !== 'string' || value.baseSpeciesKey.trim() !== config.canonicalScientificName) {
    throw new Error('Reviewed variant field-policy base taxon mismatch: ' + catalogSpeciesId);
  }
  if (
    typeof value.variantKey !== 'string'
    || normalizeVariantKey(value.variantKey) !== normalizeVariantKey(config.expectedVariantKey)
  ) {
    throw new Error('Reviewed variant field-policy variant key mismatch: ' + catalogSpeciesId);
  }

  return {
    catalogSpeciesId,
    canonicalSpeciesId: null,
    canonicalRootKind: 'reviewed_taxon',
    canonicalScientificName: config.canonicalScientificName,
    relationshipType: config.relationshipType,
    identityStatus: 'reviewed',
    variantKey: value.variantKey.trim(),
    identityEvidenceSourceIds: [...identityReview.citationIds],
    registrySource: 'reviewed_variant_field_policy',
    inheritancePolicy: buildCompatibilityInheritancePolicy(config.inheritedFacts),
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

const reviewedColorCatalogPolicyEntries = fishData.flatMap(catalog => {
  if (!isFishCompatibilityCatalogObject(catalog)) return [];
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

const reviewedColorCatalogPolicySpeciesIds = new Set(
  reviewedColorCatalogPolicyEntries.map(([speciesId]) => speciesId),
);

const reviewedColorTaxonPolicyEntries = fishData.flatMap(catalog => {
  if (!isFishCompatibilityCatalogObject(catalog)) return [];
  if (explicitCanonicalSpeciesIds.has(catalog.id)) return [];
  if (reviewedColorCatalogPolicySpeciesIds.has(catalog.id)) return [];
  if (getCatalogIdentityBoundary(catalog.id)) return [];

  const identityReview = latestReviewedIdentity(catalog.id);
  if (!identityReview || typeof identityReview.proposedValue !== 'object' || identityReview.proposedValue === null) return [];
  const value = identityReview.proposedValue as { baseSpeciesKey?: unknown; variantKey?: unknown };
  if (typeof value.baseSpeciesKey !== 'string' || !value.baseSpeciesKey.trim()) return [];
  if (typeof value.variantKey !== 'string' || !isReviewedColorOnlyVariantKey(value.variantKey)) return [];

  return [[
    catalog.id,
    buildTaxonCanonicalIdentity(catalog.id, value.baseSpeciesKey),
  ] as const];
});

const reviewedVariantFieldPolicyEntries = Object.entries(reviewedVariantFieldPolicyConfigs)
  .map(([catalogSpeciesId, config]) => [
    catalogSpeciesId,
    buildReviewedVariantFieldPolicyIdentity(catalogSpeciesId, config),
  ] as const);

export const catalogCanonicalIdentities: Record<string, CatalogCanonicalIdentity> = Object.fromEntries([
  ...explicitCanonicalIdentityEntries,
  ...reviewedColorCatalogPolicyEntries,
  ...reviewedColorTaxonPolicyEntries,
  ...reviewedVariantFieldPolicyEntries,
]);

export const reviewedColorPolicyCanonicalSpeciesIds = new Set([
  ...reviewedColorCatalogPolicyEntries.map(([speciesId]) => speciesId),
  ...reviewedColorTaxonPolicyEntries.map(([speciesId]) => speciesId),
]);

export const reviewedColorTaxonPolicyCanonicalSpeciesIds = new Set(
  reviewedColorTaxonPolicyEntries.map(([speciesId]) => speciesId),
);

export const reviewedVariantFieldPolicySpeciesIds = new Set(
  reviewedVariantFieldPolicyEntries.map(([speciesId]) => speciesId),
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
): CompatibilityInheritancePolicy => buildCompatibilityInheritancePolicy(inheritedFacts);

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

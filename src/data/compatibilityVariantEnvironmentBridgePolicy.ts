import type { CatalogCanonicalRelationshipType } from './catalogCanonicalIdentity';
import type { CompatibilityVariantEnvironmentCandidateField } from './compatibilityVariantEnvironmentCandidateEvidence';

export type CompatibilityVariantEnvironmentBridgeGateDecision = {
  supported: boolean;
  reasonCode: string;
  rationale: string;
};

const supported = (reasonCode: string, rationale: string): CompatibilityVariantEnvironmentBridgeGateDecision => ({
  supported: true,
  reasonCode,
  rationale,
});

const exactVariantRequired = (reasonCode: string, rationale: string): CompatibilityVariantEnvironmentBridgeGateDecision => ({
  supported: false,
  reasonCode,
  rationale,
});

/**
 * Biological-relevance gate for base-taxon environmental candidates.
 *
 * This table never grants inheritance. It only determines whether a reviewed
 * variant identity plus a base-taxon candidate may advance to an explicit
 * field-bridge decision. Runtime authority remains a separate change.
 */
export const reviewVariantEnvironmentFieldBridge = (
  relationshipType: CatalogCanonicalRelationshipType,
  field: CompatibilityVariantEnvironmentCandidateField,
): CompatibilityVariantEnvironmentBridgeGateDecision => {
  if (relationshipType === 'color_morph') {
    return supported(
      'color_morph_environment_field_bridge_supported',
      'The reviewed object is a color morph with no morphology or lineage boundary; water, temperature and pH may advance to explicit field-bridge review without extending size, space, behavior or trophic authority.',
    );
  }

  if (relationshipType === 'longfin_variant') {
    if (field === 'water' || field === 'ph') {
      return supported(
        'longfin_water_chemistry_bridge_supported',
        'The reviewed long-fin change is locomotor/fin morphology; coarse water class and pH may advance to explicit field-bridge review, while thermal tolerance remains variant-specific.',
      );
    }
    return exactVariantRequired(
      'longfin_temperature_requires_variant_evidence',
      'Long-fin morphology can change swimming effort and thermal stress exposure, so base-taxon temperature tolerance is not advanced without long-fin-specific evidence.',
    );
  }

  if (relationshipType === 'selectively_bred_variant') {
    if (field === 'water' || field === 'ph') {
      return supported(
        'selective_morph_water_chemistry_bridge_supported',
        'The reviewed selectively bred form remains the same taxon; coarse water class and pH may advance to explicit field-bridge review, while morphology-sensitive thermal tolerance stays object-specific.',
      );
    }
    return exactVariantRequired(
      'selective_morph_temperature_requires_variant_evidence',
      'Fancy/selective morphology may alter thermal performance or husbandry tolerance, so temperature remains exact-object gated.',
    );
  }

  if (relationshipType === 'trade_strain') {
    if (field === 'water') {
      return supported(
        'trade_strain_water_class_bridge_supported',
        'A reviewed same-taxon trade strain may use a single-valued exact-taxon water-class candidate for explicit bridge review; strain-level tolerance ranges remain separately gated.',
      );
    }
    return exactVariantRequired(
      'trade_strain_tolerance_requires_variant_evidence',
      'Selective strain history can alter physiological tolerance, so temperature and pH require strain-specific evidence before any field bridge is considered.',
    );
  }

  return exactVariantRequired(
    'relationship_type_not_environment_bridge_reviewed',
    'This reviewed relationship type has no approved environmental field-bridge policy and therefore remains exact-object gated.',
  );
};

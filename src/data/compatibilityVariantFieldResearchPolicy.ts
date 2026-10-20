import type { CompatibilityRequiredFact } from '../../packages/contracts/src';

export type CompatibilityVariantResearchFact = Extract<
  CompatibilityRequiredFact,
  'water' | 'temperature' | 'ph' | 'adult_size' | 'tank_size' | 'social_behavior' | 'territoriality' | 'predation'
>;

export type CompatibilityVariantFieldResearchPolicy = {
  speciesId: string;
  baseTaxonCandidateFacts: CompatibilityVariantResearchFact[];
  exactObjectEvidenceFacts: CompatibilityVariantResearchFact[];
  promotionGate: 'explicit_reviewed_field_bridge_or_variant_evidence';
  grantsInheritance: false;
  rationale: string;
};

const baseTaxonCandidateFacts: CompatibilityVariantResearchFact[] = [
  'water',
  'temperature',
  'ph',
];

const exactObjectEvidenceFacts: CompatibilityVariantResearchFact[] = [
  'adult_size',
  'tank_size',
  'social_behavior',
  'territoriality',
  'predation',
];

const makePolicy = (
  speciesId: string,
  rationale: string,
): CompatibilityVariantFieldResearchPolicy => ({
  speciesId,
  baseTaxonCandidateFacts: [...baseTaxonCandidateFacts],
  exactObjectEvidenceFacts: [...exactObjectEvidenceFacts],
  promotionGate: 'explicit_reviewed_field_bridge_or_variant_evidence',
  grantsInheritance: false,
  rationale,
});

/**
 * Research eligibility is deliberately separate from runtime inheritance authority.
 *
 * A base-taxon candidate fact only authorizes source discovery. It never updates
 * Catalog field reviews, canonical inheritedFacts, Profiles, or runtime authority.
 * Exact-object evidence (or a separately reviewed field bridge) is still required
 * before any candidate fact can become authoritative for the ornamental object.
 */
export const compatibilityVariantFieldResearchPolicies: Record<string, CompatibilityVariantFieldResearchPolicy> = {
  sp_0065: makePolicy('sp_0065', 'Butterfly Tail is a morphology-changing fancy goldfish form; species-level water chemistry may be researched as candidate evidence, while size, space, social, territorial and trophic fields remain object-specific.'),
  sp_0066: makePolicy('sp_0066', 'Red Cap Oranda is a selectively bred fancy goldfish form; base-taxon environmental physiology may be researched only as candidate evidence, while morphology- and behavior-sensitive fields require object-level support.'),
  sp_0067: makePolicy('sp_0067', 'Pearlscale morphology can materially affect body form, swimming and space needs; only environmental candidate research may use the base taxon without an exact-object bridge.'),
  sp_0068: makePolicy('sp_0068', 'Bubble Eye morphology can materially affect swimming ability, vulnerability and space requirements; base-taxon research is limited to environmental candidate facts.'),
  sp_0143: makePolicy('sp_0143', 'Red Grass guppy identity is reviewed, but guppy breed research documents strain-level behavioral variation; environmental physiology may be researched as candidate evidence while size, space and behavior/trophic fields remain exact-object gated.'),
  sp_0144: makePolicy('sp_0144', 'Blue Grass guppy identity is reviewed, but guppy breed research documents strain-level behavioral variation; environmental physiology may be researched as candidate evidence while size, space and behavior/trophic fields remain exact-object gated.'),
  sp_0155: makePolicy('sp_0155', 'Longfin Neon Tetra has morphology-sensitive swimming and fin-vulnerability implications; base-taxon discovery is limited to environmental candidate facts and cannot establish object-level space or behavior fields.'),
  sp_0361: makePolicy('sp_0361', 'Longfin White Cloud Mountain Minnow has morphology-sensitive swimming implications; base-taxon discovery is limited to environmental candidate facts and cannot establish object-level size, space, behavior or predation fields.'),
};

export const reviewedVariantFieldResearchPolicySpeciesIds = new Set(
  Object.keys(compatibilityVariantFieldResearchPolicies),
);

export const getCompatibilityVariantFieldResearchPolicy = (speciesId: string) => (
  compatibilityVariantFieldResearchPolicies[speciesId] ?? null
);

import { GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS } from '../../../packages/contracts/src';
import { fishData } from '../../data/fishData';
import { catalogContentVerifiedSourceIds, getCatalogFieldReviews, isCatalogFieldReviewValueValid, type CatalogFieldReview } from '../../data/catalogFieldReviews';
import { getCatalogReviewSourceCandidates } from '../../data/catalogReviewSourceCandidates';
import { getCatalogIdentityBoundary } from '../../data/catalogIdentityBoundaries';
import { catalogIdentityCorrectionBaseSpeciesIds } from '../../data/catalogIdentityCorrections';
import { getCompatibilityDomainBoundary } from '../../data/compatibilityDomainBoundaries';
import { getKnowledgeEvidenceCeilings } from '../../data/knowledgeEvidenceCeilings';
import { getReviewedCompatibilityProfile, getReviewedCompatibilityProfileForFish } from '../../data/compatibilityEvidence';
import { getReviewedSpeciesKnowledge, getReviewedSpeciesKnowledgeForFish } from '../../modules/knowledge/speciesKnowledge';
import { resolveKnowledgeSources } from '../../modules/knowledge/knowledgeSources';
import { getLifeType } from '../../modules/species/species.service';
import { getBaseSpeciesScientificName } from '../../modules/species/speciesTaxonomy';
import type { Fish } from '../../types';

export type CompatibilityCoreField = typeof GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS[number];
export type CompatibilityFieldCoverageStatus = 'reviewed_supported' | 'reviewed_neutral_or_negative' | 'reviewed_unknown' | 'needs_research' | 'missing_identity_or_domain' | 'not_applicable';
export type CompatibilityResearchDisposition = 'ready' | 'targeted_source_expansion' | 'terminal_hold' | 'domain_extension_required' | 'not_applicable';
export type CompatibilityFieldCoverageCell = {
  status: CompatibilityFieldCoverageStatus;
  disposition: CompatibilityResearchDisposition;
  evidenceIds: string[];
  authoritySource: 'catalog_field_review' | 'species_knowledge' | 'compatibility_profile' | 'identity_boundary' | 'domain_boundary' | 'evidence_ceiling' | 'none';
  reasonCode: string | null;
};
export type CompatibilityFieldCoverageRow = {
  speciesId: string;
  name: string;
  scientificName: string;
  lifeType: ReturnType<typeof getLifeType>;
  reviewedProfile: 'direct' | 'inherited' | 'none';
  genericOnboardingReady: boolean;
  authoritativeFieldCount: number;
  actionableGapCount: number;
  terminalGapCount: number;
  fields: Record<CompatibilityCoreField, CompatibilityFieldCoverageCell>;
};
export type CompatibilityFieldCoverageSummary = {
  speciesCount: number;
  coreFields: CompatibilityCoreField[];
  genericOnboardingReadySpecies: number;
  coreFieldCompleteSpecies: number;
  oneFieldGapSpecies: number;
  runtimeReviewedProfileSpecies: number;
  domainOrIdentityHeldSpecies: number;
  fieldCounts: Record<CompatibilityCoreField, Record<CompatibilityFieldCoverageStatus, number>>;
  fieldActionableGaps: Array<{ field: CompatibilityCoreField; count: number }>;
};
export type CompatibilityFieldBacklogItem = {
  rank: number;
  speciesId: string;
  name: string;
  scientificName: string;
  field: CompatibilityCoreField;
  status: 'reviewed_unknown' | 'needs_research';
  priorityScore: number;
  reason: 'missing_reviewed_authority' | 'reviewed_unknown_targeted_expansion';
};

export type CompatibilityTaxonResearchCatalogObject = {
  speciesId: string;
  name: string;
  scientificName: string;
  gaps: CompatibilityCoreField[];
  isVariant: boolean;
  isExactBaseTaxon: boolean;
};

export type CompatibilityTaxonResearchPlanItem = {
  researchKey: string;
  baseScientificName: string | null;
  priorityScore: number;
  catalogObjectCount: number;
  exactObjectCount: number;
  variantObjectCount: number;
  unresolvedObjectCount: number;
  combinedGapFields: CompatibilityCoreField[];
  requiresVariantBridgeReview: boolean;
  researchDisposition: 'exact_taxon_research' | 'base_taxon_candidate_research_with_variant_bridge' | 'identity_resolution_required';
  promotionPolicy: string;
  catalogObjects: CompatibilityTaxonResearchCatalogObject[];
};

export type CompatibilityFastLaneResearchPacket = {
  speciesId: string;
  name: string;
  scientificName: string;
  missingField: CompatibilityCoreField;
  currentStatus: 'reviewed_unknown' | 'needs_research';
  currentReasonCode: string | null;
  existingEvidenceIds: string[];
  existingSources: Array<{ id: string; title: string; publisher: string; url: string; reviewStatus: string }>;
  neededEvidenceType: string;
  resolutionConstraint: string;
};

const coreFields = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS] as CompatibilityCoreField[];

const reviewedScientificNameForResearch = (speciesId: string, fallback: string) => {
  const identityReview = [...getCatalogFieldReviews(speciesId)].reverse().find(review => (
    review.field === 'identity'
    && review.status === 'reviewed'
    && review.resolution === 'supported'
    && review.citationIds.length > 0
    && review.citationIds.every(id => catalogContentVerifiedSourceIds.has(id))
    && isCatalogFieldReviewValueValid(review)
  ));
  if (!identityReview || typeof identityReview.proposedValue !== 'object' || identityReview.proposedValue === null) return fallback;
  const candidate = identityReview.proposedValue as { scientificName?: unknown };
  return typeof candidate.scientificName === 'string' && candidate.scientificName.trim()
    ? candidate.scientificName.trim()
    : fallback;
};
const positiveNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const finiteRange = (min: unknown, max: unknown) => typeof min === 'number' && Number.isFinite(min) && typeof max === 'number' && Number.isFinite(max) && min <= max;
const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));
const reviewedFieldReviews = (speciesId: string, field: CompatibilityCoreField) => getCatalogFieldReviews(speciesId)
  .filter(review => review.field === field && review.status === 'reviewed' && isCatalogFieldReviewValueValid(review));

const supportedValueStatus = (review: CatalogFieldReview): CompatibilityFieldCoverageStatus => {
  if (review.resolution === 'unknown') return 'reviewed_unknown';
  const value = review.proposedValue;
  if (review.field === 'water') return value === 'unknown' ? 'reviewed_unknown' : 'reviewed_supported';
  if (review.field === 'temperature' || review.field === 'ph') {
    const range = value as { min?: unknown; max?: unknown };
    return finiteRange(range?.min, range?.max) ? 'reviewed_supported' : 'reviewed_unknown';
  }
  if (review.field === 'adult_size') {
    const range = value as { min?: unknown; max?: unknown };
    return positiveNumber(range?.min) || positiveNumber(range?.max) ? 'reviewed_supported' : 'reviewed_unknown';
  }
  if (review.field === 'tank_size') {
    const tank = value as { liters?: unknown; lengthCm?: unknown };
    return positiveNumber(tank?.liters) || positiveNumber(tank?.lengthCm) ? 'reviewed_supported' : 'reviewed_unknown';
  }
  if (review.field === 'social_behavior') {
    const social = value as { mode?: unknown; minimumGroupSize?: unknown };
    return social?.mode === 'unknown' && !positiveNumber(social?.minimumGroupSize) ? 'reviewed_unknown' : 'reviewed_supported';
  }
  if (review.field === 'territoriality') {
    const traits = (value as { traits?: unknown })?.traits;
    return Array.isArray(traits) && traits.length === 0 ? 'reviewed_neutral_or_negative' : 'reviewed_supported';
  }
  if (review.field === 'predation') {
    const targets = (value as { targets?: unknown })?.targets;
    return Array.isArray(targets) && targets.length === 0 ? 'reviewed_neutral_or_negative' : 'reviewed_supported';
  }
  return 'reviewed_supported';
};

const knowledgeCell = (fish: Fish, field: CompatibilityCoreField): CompatibilityFieldCoverageCell | null => {
  const hasReviewedIdentityCorrection = fish.id in catalogIdentityCorrectionBaseSpeciesIds;
  const knowledge = hasReviewedIdentityCorrection
    ? getReviewedSpeciesKnowledgeForFish(fish)
    : getReviewedSpeciesKnowledge(fish.id) ?? getReviewedSpeciesKnowledgeForFish(fish);
  if (!knowledge) return null;
  if (field === 'water' || field === 'temperature' || field === 'ph') {
    const section = knowledge.environment;
    if (section?.evidence.reviewStatus !== 'reviewed') return null;
    if (field === 'water') {
      const types = section.waterTypes?.length ? section.waterTypes : section.waterType && section.waterType !== 'unknown' ? [section.waterType] : [];
      if (!types.length) return { status: 'reviewed_unknown', disposition: 'targeted_source_expansion', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: 'reviewed_environment_water_unknown' };
    }
    if (field === 'temperature' && !finiteRange(section.temperatureRangeC?.min, section.temperatureRangeC?.max)) return null;
    if (field === 'ph' && !finiteRange(section.phRange?.min, section.phRange?.max)) return null;
    return { status: 'reviewed_supported', disposition: 'ready', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: null };
  }
  if (field === 'adult_size' || field === 'tank_size') {
    const section = knowledge.spaceAndGrowth;
    if (section?.evidence.reviewStatus !== 'reviewed') return null;
    if (field === 'adult_size' && !positiveNumber(section.adultLengthCm?.min) && !positiveNumber(section.adultLengthCm?.max)) return null;
    if (field === 'tank_size' && !positiveNumber(section.minVolumeLiters) && !positiveNumber(section.minTankLengthCm)) return null;
    return { status: 'reviewed_supported', disposition: 'ready', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: null };
  }
  const section = knowledge.socialBehavior;
  if (section?.evidence.reviewStatus !== 'reviewed') return null;
  if (field === 'social_behavior') {
    if (section.mode === 'unknown' && !positiveNumber(section.minimumGroupSize)) return { status: 'reviewed_unknown', disposition: 'targeted_source_expansion', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: 'reviewed_social_mode_unknown' };
    return { status: 'reviewed_supported', disposition: 'ready', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: null };
  }
  if (field === 'territoriality') {
    if (section.territoriality === 'unknown' || section.territoriality == null) return null;
    return { status: section.territoriality === 'none' ? 'reviewed_neutral_or_negative' : 'reviewed_supported', disposition: 'ready', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: null };
  }
  if (field === 'predation') {
    const risk = section.predationRisk;
    if (risk === 'unknown' || risk == null) return null;
    return { status: risk === 'none' ? 'reviewed_neutral_or_negative' : 'reviewed_supported', disposition: 'ready', evidenceIds: section.evidence.sourceIds, authoritySource: 'species_knowledge', reasonCode: null };
  }
  return null;
};

const profileCell = (fish: Fish, field: CompatibilityCoreField): CompatibilityFieldCoverageCell | null => {
  const profile = getReviewedCompatibilityProfileForFish(fish);
  if (!profile?.requiredFacts?.includes(field)) return null;
  const evidenceIds = profile.citations.map(citation => citation.id);
  if (field === 'water') {
    const types = profile.waterTypes?.length ? profile.waterTypes : profile.waterType ? [profile.waterType] : [];
    return types.length
      ? { status: 'reviewed_supported', disposition: 'ready', evidenceIds, authoritySource: 'compatibility_profile', reasonCode: null }
      : { status: 'reviewed_unknown', disposition: 'targeted_source_expansion', evidenceIds, authoritySource: 'compatibility_profile', reasonCode: 'reviewed_profile_water_unknown' };
  }
  if (field === 'social_behavior') {
    const positive = profile.minimumGroupSize != null || profile.behaviorTraits.some(trait => /shoal|school|group|solitary|pair|social|species_tank/i.test(trait));
    return { status: positive ? 'reviewed_supported' : 'reviewed_neutral_or_negative', disposition: 'ready', evidenceIds, authoritySource: 'compatibility_profile', reasonCode: null };
  }
  if (field === 'territoriality') {
    const positive = profile.behaviorTraits.some(trait => /territor|aggress|rival|defense|cave|resource/i.test(trait));
    return { status: positive ? 'reviewed_supported' : 'reviewed_neutral_or_negative', disposition: 'ready', evidenceIds, authoritySource: 'compatibility_profile', reasonCode: null };
  }
  if (field === 'predation') {
    const positive = profile.predationTargets.length > 0 || profile.behaviorTraits.some(trait => /predat|prey/i.test(trait));
    return { status: positive ? 'reviewed_supported' : 'reviewed_neutral_or_negative', disposition: 'ready', evidenceIds, authoritySource: 'compatibility_profile', reasonCode: null };
  }
  return null;
};

const evidenceCeilingForField = (fish: Fish, field: CompatibilityCoreField) => {
  const ceilings = getKnowledgeEvidenceCeilings(fish.id);
  if (field === 'territoriality' || field === 'predation') {
    const fieldSpecific = ceilings.find(item => item.field === field);
    if (fieldSpecific) return fieldSpecific;
  }
  const mapped = field === 'water' || field === 'temperature' || field === 'ph' ? 'environment' : field === 'adult_size' || field === 'tank_size' ? 'space' : 'social';
  return ceilings.find(item => item.field === mapped);
};

const fieldCell = (fish: Fish, field: CompatibilityCoreField): CompatibilityFieldCoverageCell => {
  const domainBoundary = getCompatibilityDomainBoundary(fish.id);
  if (domainBoundary) return { status: 'missing_identity_or_domain', disposition: 'domain_extension_required', evidenceIds: domainBoundary.sourceIds, authoritySource: 'domain_boundary', reasonCode: domainBoundary.code };
  const lifeType = getLifeType(fish);
  if (lifeType === 'hardscape') return { status: 'not_applicable', disposition: 'not_applicable', evidenceIds: [], authoritySource: 'domain_boundary', reasonCode: 'hardscape_not_livestock' };
  if (lifeType !== 'fish') return { status: 'missing_identity_or_domain', disposition: 'domain_extension_required', evidenceIds: [], authoritySource: 'domain_boundary', reasonCode: `unsupported_compatibility_domain_${lifeType}` };
  const identityBoundary = getCatalogIdentityBoundary(fish.id);
  if (identityBoundary) return { status: 'missing_identity_or_domain', disposition: 'terminal_hold', evidenceIds: identityBoundary.sourceIds, authoritySource: 'identity_boundary', reasonCode: identityBoundary.code };

  const exactReviews = reviewedFieldReviews(fish.id, field);
  const supported = [...exactReviews].reverse().find(review => review.resolution === 'supported' && review.citationIds.every(id => catalogContentVerifiedSourceIds.has(id)));
  if (supported) {
    const status = supportedValueStatus(supported);
    return { status, disposition: status === 'reviewed_unknown' ? 'targeted_source_expansion' : 'ready', evidenceIds: supported.citationIds, authoritySource: 'catalog_field_review', reasonCode: status === 'reviewed_unknown' ? 'reviewed_supported_record_contains_unknown_value' : null };
  }
  // A historical reviewed_unknown means only “this source did not establish the
  // field at that time”. It must not permanently suppress a later explicit,
  // reviewed species-knowledge or Compatibility-profile conclusion.
  const knowledge = knowledgeCell(fish, field);
  if (knowledge && knowledge.status !== 'reviewed_unknown') return knowledge;
  const profile = profileCell(fish, field);
  if (profile && profile.status !== 'reviewed_unknown') return profile;

  const unknown = exactReviews.find(review => review.resolution === 'unknown');
  if (unknown) {
    const ceiling = evidenceCeilingForField(fish, field);
    return { status: 'reviewed_unknown', disposition: ceiling ? 'terminal_hold' : 'targeted_source_expansion', evidenceIds: unique([...(unknown.citationIds || []), ...(ceiling?.sourceIds || [])]), authoritySource: ceiling ? 'evidence_ceiling' : 'catalog_field_review', reasonCode: ceiling?.code ?? 'reviewed_field_unknown' };
  }
  if (knowledge) {
    const ceiling = evidenceCeilingForField(fish, field);
    return ceiling ? { ...knowledge, disposition: 'terminal_hold', evidenceIds: unique([...knowledge.evidenceIds, ...ceiling.sourceIds]), authoritySource: 'evidence_ceiling', reasonCode: ceiling.code } : knowledge;
  }
  if (profile) return profile;
  const ceiling = evidenceCeilingForField(fish, field);
  if (ceiling) return { status: 'reviewed_unknown', disposition: 'terminal_hold', evidenceIds: ceiling.sourceIds, authoritySource: 'evidence_ceiling', reasonCode: ceiling.code };
  return { status: 'needs_research', disposition: 'targeted_source_expansion', evidenceIds: [], authoritySource: 'none', reasonCode: 'missing_reviewed_field_authority' };
};

const isAuthoritative = (status: CompatibilityFieldCoverageStatus) => status === 'reviewed_supported' || status === 'reviewed_neutral_or_negative';
const fieldWeights: Record<CompatibilityCoreField, number> = { water: 100, temperature: 100, ph: 85, adult_size: 95, tank_size: 90, social_behavior: 100, territoriality: 100, predation: 100 };

const fastLaneEvidenceNeed: Record<CompatibilityCoreField, string> = {
  water: 'Direct reviewed source establishing freshwater / brackish / saltwater applicability for this exact taxon.',
  temperature: 'Direct reviewed long-term husbandry temperature range for this exact taxon; do not substitute collection or experiment temperatures.',
  ph: 'Direct reviewed long-term husbandry pH range for this exact taxon.',
  adult_size: 'Direct reviewed adult-size measurement or biological maximum with measurement basis.',
  tank_size: 'Direct reviewed numeric minimum aquarium length/footprint or volume for this exact taxon.',
  social_behavior: 'Direct reviewed social-mode or group-requirement evidence with the scope needed for aquarium planning.',
  territoriality: 'Direct reviewed evidence for stable territorial/resource-defense behavior and the affected tankmate scope.',
  predation: 'Direct reviewed evidence defining fish-prey scope, or explicit evidence that no fish-predation target should be enforced.',
};

const fastLaneSpecialConstraint: Record<string, string> = {
  sp_0050: 'Existing reviewed sources describe only public installations / the very largest private aquaria and do not provide a numeric minimum footprint. Do not convert the legacy 640 L text into authority.',
  sp_0198: 'Existing reviewed source does not record a numeric aquarium base. Do not invent a minimum from adult size or the legacy catalog.',
  sp_0199: 'If the evidence establishes only crustacean/invertebrate micropredation, do not coerce it to small_fish; extend reviewed prey vocabulary first if needed.',
  sp_0200: 'If the evidence establishes only crustacean/invertebrate micropredation, do not coerce it to small_fish; extend reviewed prey vocabulary first if needed.',
};

const defaultFastLaneConstraint = (field: CompatibilityCoreField) => {
  if (field === 'predation') return 'Do not infer fish-predation safety from a diet label alone, and do not widen prey scope beyond the reviewed source.';
  if (field === 'territoriality') return 'Do not convert generic aggression, dominance or solitary behavior into territoriality without direct scope evidence.';
  if (field === 'tank_size') return 'A qualitative “large aquarium” statement is not a numeric minimum; keep reviewed_unknown until a direct numeric source exists.';
  return 'Promote only an exact-taxon reviewed fact with source provenance; otherwise keep reviewed_unknown.';
};

export const getCompatibilityCoreFieldCoverageRow = (fish: Fish): CompatibilityFieldCoverageRow => {
  const directProfile = getReviewedCompatibilityProfile(fish.id);
  const resolvedProfile = getReviewedCompatibilityProfileForFish(fish);
  const fields = Object.fromEntries(coreFields.map(field => [field, fieldCell(fish, field)])) as Record<CompatibilityCoreField, CompatibilityFieldCoverageCell>;
  const authoritativeFieldCount = coreFields.filter(field => isAuthoritative(fields[field].status)).length;
  const actionableGapCount = coreFields.filter(field => fields[field].disposition === 'targeted_source_expansion').length;
  const terminalGapCount = coreFields.filter(field => ['terminal_hold', 'domain_extension_required'].includes(fields[field].disposition)).length;
  const declared = new Set(resolvedProfile?.requiredFacts || []);
  const genericOnboardingReady = getLifeType(fish) === 'fish' && !getCatalogIdentityBoundary(fish.id) && Boolean(resolvedProfile)
    && coreFields.every(field => declared.has(field) && isAuthoritative(fields[field].status));
  return { speciesId: fish.id, name: fish.name, scientificName: fish.scientificName, lifeType: getLifeType(fish), reviewedProfile: directProfile ? 'direct' : resolvedProfile ? 'inherited' : 'none', genericOnboardingReady, authoritativeFieldCount, actionableGapCount, terminalGapCount, fields };
};

export const buildCompatibilityCoreFieldCoverage = () => {
  const rows: CompatibilityFieldCoverageRow[] = fishData.map(getCompatibilityCoreFieldCoverageRow);

  const fieldCounts = Object.fromEntries(coreFields.map(field => {
    const counts: Record<CompatibilityFieldCoverageStatus, number> = { reviewed_supported: 0, reviewed_neutral_or_negative: 0, reviewed_unknown: 0, needs_research: 0, missing_identity_or_domain: 0, not_applicable: 0 };
    for (const row of rows) counts[row.fields[field].status] += 1;
    return [field, counts];
  })) as CompatibilityFieldCoverageSummary['fieldCounts'];

  const summary: CompatibilityFieldCoverageSummary = {
    speciesCount: rows.length,
    coreFields,
    genericOnboardingReadySpecies: rows.filter(row => row.genericOnboardingReady).length,
    coreFieldCompleteSpecies: rows.filter(row => row.lifeType === 'fish' && row.authoritativeFieldCount === coreFields.length).length,
    oneFieldGapSpecies: rows.filter(row => row.lifeType === 'fish' && row.authoritativeFieldCount === coreFields.length - 1).length,
    runtimeReviewedProfileSpecies: rows.filter(row => row.reviewedProfile !== 'none').length,
    domainOrIdentityHeldSpecies: rows.filter(row => coreFields.some(field => row.fields[field].status === 'missing_identity_or_domain')).length,
    fieldCounts,
    fieldActionableGaps: coreFields.map(field => ({ field, count: rows.filter(row => row.fields[field].disposition === 'targeted_source_expansion').length }))
      .sort((a, b) => b.count - a.count || b.field.localeCompare(a.field)),
  };

  const backlogRaw = rows.flatMap(row => coreFields.flatMap(field => {
    const cell = row.fields[field];
    if (cell.disposition !== 'targeted_source_expansion' || (cell.status !== 'reviewed_unknown' && cell.status !== 'needs_research')) return [];
    const priorityScore = fieldWeights[field] + row.authoritativeFieldCount * 8 + (row.reviewedProfile !== 'none' ? 25 : 0) + (cell.status === 'reviewed_unknown' ? 10 : 0);
    return [{ speciesId: row.speciesId, name: row.name, scientificName: row.scientificName, field, status: cell.status, priorityScore, reason: cell.status === 'reviewed_unknown' ? 'reviewed_unknown_targeted_expansion' as const : 'missing_reviewed_authority' as const }];
  }));
  const backlog: CompatibilityFieldBacklogItem[] = backlogRaw
    .sort((a, b) => b.priorityScore - a.priorityScore || a.speciesId.localeCompare(b.speciesId) || a.field.localeCompare(b.field))
    .map((item, index) => ({ rank: index + 1, ...item }));
  return { rows, summary, backlog };
};

export const buildCompatibilityTaxonResearchPlan = (): CompatibilityTaxonResearchPlanItem[] => {
  const { backlog } = buildCompatibilityCoreFieldCoverage();
  const bySpecies = new Map<string, {
    speciesId: string;
    name: string;
    scientificName: string;
    gaps: Set<CompatibilityCoreField>;
    priorityScore: number;
  }>();

  for (const item of backlog) {
    const current = bySpecies.get(item.speciesId) ?? {
      speciesId: item.speciesId,
      name: item.name,
      scientificName: reviewedScientificNameForResearch(item.speciesId, item.scientificName),
      gaps: new Set<CompatibilityCoreField>(),
      priorityScore: 0,
    };
    current.gaps.add(item.field);
    current.priorityScore = Math.max(current.priorityScore, item.priorityScore);
    bySpecies.set(item.speciesId, current);
  }

  const grouped = new Map<string, {
    researchKey: string;
    baseScientificName: string | null;
    objects: CompatibilityTaxonResearchCatalogObject[];
    gapFields: Set<CompatibilityCoreField>;
    priorityScore: number;
    unresolvedObjectCount: number;
  }>();

  for (const item of bySpecies.values()) {
    const unresolvedIdentity = /\b(?:sp|spp|cf)\./i.test(item.scientificName);
    const baseScientificName = unresolvedIdentity ? null : getBaseSpeciesScientificName(item.scientificName);
    const researchKey = baseScientificName ?? `catalog:${item.speciesId}`;
    const normalizedScientificName = item.scientificName.trim();
    const isExactBaseTaxon = Boolean(baseScientificName && normalizedScientificName === baseScientificName);
    const isVariant = Boolean(baseScientificName && normalizedScientificName !== baseScientificName);
    const group = grouped.get(researchKey) ?? {
      researchKey,
      baseScientificName,
      objects: [],
      gapFields: new Set<CompatibilityCoreField>(),
      priorityScore: 0,
      unresolvedObjectCount: 0,
    };
    group.objects.push({
      speciesId: item.speciesId,
      name: item.name,
      scientificName: item.scientificName,
      gaps: coreFields.filter(field => item.gaps.has(field)),
      isVariant,
      isExactBaseTaxon,
    });
    for (const field of item.gaps) group.gapFields.add(field);
    group.priorityScore = Math.max(group.priorityScore, item.priorityScore);
    if (!baseScientificName) group.unresolvedObjectCount += 1;
    grouped.set(researchKey, group);
  }

  return [...grouped.values()].map(group => {
    const catalogObjects = [...group.objects].sort((a, b) => a.speciesId.localeCompare(b.speciesId));
    const variantObjectCount = catalogObjects.filter(item => item.isVariant).length;
    const exactObjectCount = catalogObjects.filter(item => item.isExactBaseTaxon).length;
    const requiresVariantBridgeReview = variantObjectCount > 0;
    const researchDisposition = group.unresolvedObjectCount > 0
      ? 'identity_resolution_required' as const
      : requiresVariantBridgeReview
        ? 'base_taxon_candidate_research_with_variant_bridge' as const
        : 'exact_taxon_research' as const;
    const promotionPolicy = researchDisposition === 'identity_resolution_required'
      ? 'Resolve catalog identity before source research. Do not promote evidence across an unresolved taxon.'
      : requiresVariantBridgeReview
        ? 'Research the base taxon once for source discovery only. Base-taxon facts are candidate evidence for variants and must never auto-promote; each affected field requires a reviewed variant-to-base bridge or variant-specific evidence.'
        : 'Research this exact base taxon once. Any field still requires fetched source verification and reviewed field authority before promotion.';
    return {
      researchKey: group.researchKey,
      baseScientificName: group.baseScientificName,
      priorityScore: group.priorityScore,
      catalogObjectCount: catalogObjects.length,
      exactObjectCount,
      variantObjectCount,
      unresolvedObjectCount: group.unresolvedObjectCount,
      combinedGapFields: coreFields.filter(field => group.gapFields.has(field)),
      requiresVariantBridgeReview,
      researchDisposition,
      promotionPolicy,
      catalogObjects,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore || a.researchKey.localeCompare(b.researchKey));
};

export const buildCompatibilityFastLaneResearchPackets = (): CompatibilityFastLaneResearchPacket[] => {
  const { rows } = buildCompatibilityCoreFieldCoverage();
  return rows.flatMap(row => {
    if (row.lifeType !== 'fish' || row.authoritativeFieldCount !== coreFields.length - 1) return [];
    const missingField = coreFields.find(field => !isAuthoritative(row.fields[field].status));
    if (!missingField) return [];
    const cell = row.fields[missingField];
    if (cell.disposition !== 'targeted_source_expansion' || (cell.status !== 'reviewed_unknown' && cell.status !== 'needs_research')) return [];
    const fish = fishData.find(item => item.id === row.speciesId);
    const profile = fish ? getReviewedCompatibilityProfileForFish(fish) : undefined;
    const evidenceIds = cell.evidenceIds.length > 0 ? cell.evidenceIds : (profile?.citations.map(source => source.id) ?? []);
    const evidenceSet = new Set(evidenceIds);
    const profileSources = (profile?.citations ?? []).filter(source => evidenceSet.has(source.id));
    const registrySources = resolveKnowledgeSources(evidenceIds);
    const catalogSources = fish
      ? getCatalogReviewSourceCandidates(fish.id)
        .filter(source => evidenceSet.has(source.id))
        .map(source => catalogContentVerifiedSourceIds.has(source.id)
          ? { ...source, reviewStatus: 'reviewed' as const }
          : source)
      : [];
    const existingSources = Array.from(new Map([...profileSources, ...registrySources, ...catalogSources].map(source => [source.id, source])).values())
      .map(source => ({ id: source.id, title: source.title, publisher: source.publisher, url: source.url, reviewStatus: source.reviewStatus }));
    return [{
      speciesId: row.speciesId,
      name: row.name,
      scientificName: row.scientificName,
      missingField,
      currentStatus: cell.status,
      currentReasonCode: cell.reasonCode,
      existingEvidenceIds: evidenceIds,
      existingSources,
      neededEvidenceType: fastLaneEvidenceNeed[missingField],
      resolutionConstraint: fastLaneSpecialConstraint[row.speciesId] ?? defaultFastLaneConstraint(missingField),
    }];
  }).sort((a, b) => a.missingField.localeCompare(b.missingField) || a.speciesId.localeCompare(b.speciesId));
};

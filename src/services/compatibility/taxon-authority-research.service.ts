import {
  COMPATIBILITY_DECISION_REQUIRED_FACTS,
  GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS,
  type CatalogEvidenceSource,
} from '../../../packages/contracts/src';
import type { DomainSpeciesFact } from '../../../packages/domain-rules/src';
import { fishData } from '../../data/fishData';
import { isCompatibilityIdentityReady } from '../../data/catalogCanonicalIdentity';
import {
  getScientificGenus,
  isCompatibilityTaxonVariant,
  resolveReviewedCompatibilityTaxonFact,
  reviewedCompatibilityTaxonFacts,
  type CompatibilityTaxonFactResolver,
  type ReviewedCompatibilityTaxonFact,
} from '../../data/compatibilityTaxonAuthority';
import { isCatalogFieldReviewValueValid } from '../../data/catalogFieldReviews';
import { getBaseSpeciesScientificName } from '../../modules/species/speciesTaxonomy';
import {
  buildCompatibilityCoreFieldCoverage,
  getCompatibilityCoreFieldCoverageRow,
  type CompatibilityCoreField,
} from './compatibility-field-coverage.service';

export const GENUS_AUTHORITY_ELIGIBLE_FIELDS = [
  'water',
  'social_behavior',
  'territoriality',
  'predation',
] as const satisfies readonly CompatibilityCoreField[];

export type CompatibilityGenusAuthorityField = typeof GENUS_AUTHORITY_ELIGIBLE_FIELDS[number];

export type CompatibilityGenusAuthorityResearchPlanItem = {
  genus: string;
  priorityScore: number;
  targetFields: CompatibilityGenusAuthorityField[];
  fieldImpactCounts: Partial<Record<CompatibilityGenusAuthorityField, number>>;
  impactedSpeciesIds: string[];
  exactSpeciesCount: number;
  variantObjectCount: number;
  existingAuthorityFields: CompatibilityGenusAuthorityField[];
  promotionPolicy: string;
};

export type CompatibilityGenusAuthorityResearchSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: CatalogEvidenceSource['sourceType'];
  contentSha256: string;
  contentVerified: true;
};

export type CompatibilityGenusAuthorityFieldCandidate = {
  field: CompatibilityGenusAuthorityField;
  proposedValue: unknown;
  sourceIds: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  evidenceText: string;
  note: string | null;
};

export type CompatibilityGenusAuthorityResearchResult = {
  genus: string;
  model: string | null;
  targetFields: CompatibilityGenusAuthorityField[];
  sources: CompatibilityGenusAuthorityResearchSource[];
  fieldCandidates: CompatibilityGenusAuthorityFieldCandidate[];
  unresolvedFields: CompatibilityGenusAuthorityField[];
  attemptedUrls: string[];
  discoveryStatus: 'not_run' | 'discovery_empty' | 'no_verified_genus_documents' | 'verified_genus_documents';
  discoveredUrlCount: number;
  verifiedGenusDocumentCount: number;
  promotionAllowed: false;
  writesAuthority: false;
};

export type CompatibilityGenusAuthorityFieldResolution = {
  field: CompatibilityGenusAuthorityField;
  status: 'supported' | 'missing' | 'conflicted' | 'invalid_or_unverified';
  proposedValue: unknown | null;
  patch: Partial<DomainSpeciesFact> | null;
  authorityStatus: ReviewedCompatibilityTaxonFact['status'] | null;
  sourceIds: string[];
  notes: string[];
};

export type CompatibilityGenusAuthorityAssessment = {
  genus: string;
  status: 'ready_for_review' | 'research_pending' | 'terminal_hold';
  reasonCodes: string[];
  fieldResolutions: CompatibilityGenusAuthorityFieldResolution[];
  reviewCandidates: Array<Omit<ReviewedCompatibilityTaxonFact, 'reviewStatus'> & { reviewStatus: 'draft' }>;
  writesAuthority: false;
};

const eligibleFieldSet = new Set<CompatibilityCoreField>(GENUS_AUTHORITY_ELIGIBLE_FIELDS);

const stableNormalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableNormalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, stableNormalize(nested)]),
    );
  }
  return value;
};

const stableValueKey = (value: unknown) => JSON.stringify(stableNormalize(value));

const isExactBaseSpeciesObject = (scientificName: string) => {
  const base = getBaseSpeciesScientificName(scientificName);
  return Boolean(base && scientificName.trim() === base);
};

const isFieldAuthorityGap = (
  cell: ReturnType<typeof getCompatibilityCoreFieldCoverageRow>['fields'][CompatibilityCoreField],
) => (
  (cell.status === 'reviewed_unknown' || cell.status === 'needs_research')
  && cell.authoritySource !== 'identity_boundary'
  && cell.authoritySource !== 'domain_boundary'
);

export const buildCompatibilityGenusAuthorityResearchPlan = (
  minimumImpactedExactSpecies = 2,
): CompatibilityGenusAuthorityResearchPlanItem[] => {
  const grouped = new Map<string, {
    genus: string;
    exactSpeciesIds: Set<string>;
    variantObjectCount: number;
    fieldImpacts: Map<CompatibilityGenusAuthorityField, Set<string>>;
  }>();

  for (const fish of fishData) {
    const genus = getScientificGenus(fish.scientificName);
    if (!genus) continue;
    const coverage = getCompatibilityCoreFieldCoverageRow(fish);
    if (coverage.lifeType !== 'fish' || !isCompatibilityIdentityReady(coverage.identityReadiness)) continue;

    const exact = isExactBaseSpeciesObject(fish.scientificName);
    const current = grouped.get(genus) ?? {
      genus,
      exactSpeciesIds: new Set<string>(),
      variantObjectCount: 0,
      fieldImpacts: new Map<CompatibilityGenusAuthorityField, Set<string>>(),
    };

    if (exact) current.exactSpeciesIds.add(fish.id);
    else current.variantObjectCount += 1;

    if (exact) {
      for (const field of GENUS_AUTHORITY_ELIGIBLE_FIELDS) {
        if (!isFieldAuthorityGap(coverage.fields[field])) continue;
        const affected = current.fieldImpacts.get(field) ?? new Set<string>();
        affected.add(fish.id);
        current.fieldImpacts.set(field, affected);
      }
    }

    grouped.set(genus, current);
  }

  return [...grouped.values()].flatMap(group => {
    const existingAuthorityFields = GENUS_AUTHORITY_ELIGIBLE_FIELDS.filter(field => (
      reviewedCompatibilityTaxonFacts.some(authority => (
        authority.rank === 'genus'
        && authority.taxonName === group.genus
        && authority.field === field
        && authority.reviewStatus === 'reviewed'
      ))
    ));
    const targetFields = GENUS_AUTHORITY_ELIGIBLE_FIELDS.filter(field => (
      !existingAuthorityFields.includes(field)
      && (group.fieldImpacts.get(field)?.size ?? 0) >= minimumImpactedExactSpecies
    ));
    if (!targetFields.length) return [];

    const fieldImpactCounts = Object.fromEntries(
      targetFields.map(field => [field, group.fieldImpacts.get(field)?.size ?? 0]),
    ) as Partial<Record<CompatibilityGenusAuthorityField, number>>;
    const impactedSpeciesIds = [...new Set(targetFields.flatMap(field => (
      [...(group.fieldImpacts.get(field) ?? [])]
    )))].sort();
    const priorityScore = targetFields.reduce((score, field) => (
      score + (fieldImpactCounts[field] ?? 0) * (field === 'water' ? 130 : 100)
    ), 0);

    return [{
      genus: group.genus,
      priorityScore,
      targetFields,
      fieldImpactCounts,
      impactedSpeciesIds,
      exactSpeciesCount: group.exactSpeciesIds.size,
      variantObjectCount: group.variantObjectCount,
      existingAuthorityFields,
      promotionPolicy: 'Research must directly state a genus-wide fact. Agreement among individual species pages is never enough. Production authority requires reviewed source provenance; ornamental variants remain excluded unless the authority explicitly opts into variant coverage.',
    }];
  }).sort((a, b) => b.priorityScore - a.priorityScore || a.genus.localeCompare(b.genus));
};

const valueValidForField = (field: CompatibilityGenusAuthorityField, value: unknown) => (
  isCatalogFieldReviewValueValid({
    speciesId: 'taxon-authority-review',
    field,
    proposedValue: value,
    status: 'reviewed',
    resolution: 'supported',
    confidence: 'medium',
    citationIds: ['taxon-authority-source'],
    conflictNotes: [],
    reviewedAt: new Date(0).toISOString(),
  })
);

const patchFromValue = (
  field: CompatibilityGenusAuthorityField,
  value: unknown,
): { patch: Partial<DomainSpeciesFact>; status: ReviewedCompatibilityTaxonFact['status'] } | null => {
  if (field === 'water') {
    if (!['freshwater', 'saltwater', 'brackish'].includes(String(value))) return null;
    const waterType = value as 'freshwater' | 'saltwater' | 'brackish';
    return { patch: { waterType, waterTypes: [waterType] }, status: 'reviewed_supported' };
  }

  if (field === 'social_behavior') {
    const social = value as { mode?: unknown; minimumGroupSize?: unknown };
    if (!['solitary', 'pair', 'group', 'colony', 'variable', 'unknown'].includes(String(social?.mode))) return null;
    if (social.mode === 'unknown') return null;
    const minimumGroupSize = typeof social.minimumGroupSize === 'number' && Number.isFinite(social.minimumGroupSize)
      ? social.minimumGroupSize
      : null;
    return {
      patch: {
        socialMode: social.mode as NonNullable<DomainSpeciesFact['socialMode']>,
        ...(minimumGroupSize != null ? { minimumGroupSize } : {}),
      },
      status: 'reviewed_supported',
    };
  }

  if (field === 'territoriality') {
    const traits = (value as { traits?: unknown })?.traits;
    if (!Array.isArray(traits) || traits.some(item => typeof item !== 'string')) return null;
    const normalized = traits.map(item => item.trim().toLowerCase()).filter(Boolean);
    if (normalized.length === 0) {
      return { patch: { territoriality: 'none' }, status: 'reviewed_neutral_or_negative' };
    }
    const canonicalTraits = normalized.filter(item => (
      item === 'territorial'
      || item === 'conspecific_territorial'
      || item === 'intraspecific_territorial'
    ));
    if (!canonicalTraits.length) return null;
    return {
      patch: { behaviorTraits: canonicalTraits },
      status: 'reviewed_supported',
    };
  }

  const targets = (value as { targets?: unknown })?.targets;
  if (!Array.isArray(targets) || targets.some(item => typeof item !== 'string')) return null;
  const normalizedTargets = targets.map(item => item.trim()).filter(Boolean);
  if (normalizedTargets.length === 0) {
    return {
      patch: { predationRisk: 'none', predationTargets: [] },
      status: 'reviewed_neutral_or_negative',
    };
  }
  const allowedTargets = new Set(['fish_fry', 'very_small_fish', 'small_fish', 'fish_unspecified_size']);
  if (normalizedTargets.some(item => !allowedTargets.has(item))) return null;
  return {
    patch: { predationTargets: normalizedTargets },
    status: 'reviewed_supported',
  };
};

export const assessCompatibilityGenusAuthorityResearchResult = (
  result: CompatibilityGenusAuthorityResearchResult,
): CompatibilityGenusAuthorityAssessment => {
  const sourceIds = new Set(result.sources.filter(source => source.contentVerified).map(source => source.id));
  const reasonCodes: string[] = [];
  const fieldResolutions = result.targetFields.map(field => {
    const candidates = result.fieldCandidates.filter(candidate => candidate.field === field);
    if (!candidates.length) {
      return {
        field,
        status: 'missing' as const,
        proposedValue: null,
        patch: null,
        authorityStatus: null,
        sourceIds: [],
        notes: ['No verified genus-wide direct claim was returned for this field.'],
      };
    }

    const invalid = candidates.filter(candidate => (
      candidate.sourceIds.length === 0
      || candidate.sourceIds.some(id => !sourceIds.has(id))
      || !valueValidForField(field, candidate.proposedValue)
      || !patchFromValue(field, candidate.proposedValue)
    ));
    if (invalid.length > 0) {
      return {
        field,
        status: 'invalid_or_unverified' as const,
        proposedValue: null,
        patch: null,
        authorityStatus: null,
        sourceIds: [...new Set(invalid.flatMap(candidate => candidate.sourceIds))],
        notes: ['At least one genus-wide claim failed source or field-shape validation.'],
      };
    }

    const byValue = new Map<string, CompatibilityGenusAuthorityFieldCandidate[]>();
    for (const candidate of candidates) {
      const key = stableValueKey(candidate.proposedValue);
      const bucket = byValue.get(key) ?? [];
      bucket.push(candidate);
      byValue.set(key, bucket);
    }
    if (byValue.size !== 1) {
      return {
        field,
        status: 'conflicted' as const,
        proposedValue: null,
        patch: null,
        authorityStatus: null,
        sourceIds: [...new Set(candidates.flatMap(candidate => candidate.sourceIds))],
        notes: ['Verified genus-wide sources disagree on the proposed field value; authority promotion is blocked.'],
      };
    }

    const accepted = candidates[0]!;
    const mapped = patchFromValue(field, accepted.proposedValue)!;
    return {
      field,
      status: 'supported' as const,
      proposedValue: accepted.proposedValue,
      patch: mapped.patch,
      authorityStatus: mapped.status,
      sourceIds: [...new Set(candidates.flatMap(candidate => candidate.sourceIds))],
      notes: candidates.flatMap(candidate => candidate.note ? [candidate.note] : []),
    };
  });

  for (const resolution of fieldResolutions) {
    if (resolution.status === 'missing') reasonCodes.push('field_missing_' + resolution.field);
    if (resolution.status === 'conflicted') reasonCodes.push('field_conflict_' + resolution.field);
    if (resolution.status === 'invalid_or_unverified') reasonCodes.push('field_unverified_' + resolution.field);
  }

  const hasTerminal = fieldResolutions.some(item => item.status === 'conflicted' || item.status === 'invalid_or_unverified');
  const hasPending = fieldResolutions.some(item => item.status === 'missing');
  const status = hasTerminal ? 'terminal_hold' : hasPending ? 'research_pending' : 'ready_for_review';

  const reviewCandidates = status === 'ready_for_review'
    ? fieldResolutions.flatMap(resolution => {
        if (resolution.status !== 'supported' || !resolution.patch || !resolution.authorityStatus) return [];
        const matching = result.fieldCandidates.filter(candidate => candidate.field === resolution.field);
        const confidenceOrder = ['unknown', 'low', 'medium', 'high'] as const;
        const confidence = matching.reduce<'unknown' | 'low' | 'medium' | 'high'>((current, candidate) => (
          confidenceOrder.indexOf(candidate.confidence) < confidenceOrder.indexOf(current)
            ? candidate.confidence
            : current
        ), 'high');
        return [{
          rank: 'genus' as const,
          taxonName: result.genus,
          field: resolution.field,
          status: resolution.authorityStatus,
          patch: resolution.patch,
          evidenceIds: resolution.sourceIds,
          confidence: confidence === 'high' ? 'high' as const : 'medium' as const,
          reviewStatus: 'draft' as const,
          appliesToVariants: false,
          note: 'Genus-wide candidate generated from verified direct evidence; requires source-controlled review before production promotion.',
        }];
      })
    : [];

  return {
    genus: result.genus,
    status,
    reasonCodes: [...new Set(reasonCodes)],
    fieldResolutions,
    reviewCandidates,
    writesAuthority: false,
  };
};

export type CompatibilityEvidenceAcquisitionRoute =
  | 'authority_ready'
  | 'genus_authority_research'
  | 'species_targeted_research'
  | 'public_evidence_ceiling'
  | 'identity_resolution_required'
  | 'domain_extension_required'
  | 'not_applicable';

export type CompatibilityEvidenceAcquisitionPlan = {
  speciesId: string;
  scientificName: string;
  genus: string | null;
  identityReadiness: ReturnType<typeof getCompatibilityCoreFieldCoverageRow>['identityReadiness'];
  nextStage: 'identity_resolution' | 'field_authority' | 'decision_ready';
  decisionReady: boolean;
  genericOnboardingReady: boolean;
  fields: Array<{
    field: CompatibilityCoreField;
    route: CompatibilityEvidenceAcquisitionRoute;
    authoritySource: ReturnType<typeof getCompatibilityCoreFieldCoverageRow>['fields'][CompatibilityCoreField]['authoritySource'];
    reasonCode: string | null;
    evidenceIds: string[];
    genusResearchKey: string | null;
  }>;
};

export const buildCompatibilityNewSpeciesEvidenceAcquisitionPlan = (
  input: {
    catalogKey: string;
    scientificName: string;
    identityVerified: boolean;
  },
  options: {
    taxonFactResolver?: CompatibilityTaxonFactResolver;
  } = {},
): CompatibilityEvidenceAcquisitionPlan => {
  const taxonFactResolver = options.taxonFactResolver ?? resolveReviewedCompatibilityTaxonFact;
  const genus = getScientificGenus(input.scientificName);
  const variant = isCompatibilityTaxonVariant(input.scientificName);
  const genusPlan = input.identityVerified && genus && !variant
    ? buildCompatibilityGenusAuthorityResearchPlan(1).find(item => item.genus === genus)
    : undefined;
  const genusFields = new Set(genusPlan?.targetFields ?? []);
  const required = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS] as CompatibilityCoreField[];
  const fields = required.map(field => {
    const authority = input.identityVerified
      ? taxonFactResolver({ id: input.catalogKey, scientificName: input.scientificName }, field)
      : undefined;
    const route: CompatibilityEvidenceAcquisitionRoute = !input.identityVerified
      ? 'identity_resolution_required'
      : authority
        ? 'authority_ready'
        : genus && genusFields.has(field as CompatibilityGenusAuthorityField)
          ? 'genus_authority_research'
          : 'species_targeted_research';
    return {
      field,
      route,
      authoritySource: authority
        ? authority.rank === 'genus' ? 'genus_default' as const : 'family_default' as const
        : 'none' as const,
      reasonCode: authority ? `reviewed_${authority.rank}_default` : null,
      evidenceIds: authority ? [...authority.evidenceIds] : [],
      genusResearchKey: route === 'genus_authority_research' ? genus : null,
    };
  });
  const authorityReady = new Set(fields.filter(item => item.route === 'authority_ready').map(item => item.field));
  const decisionReady = input.identityVerified
    && COMPATIBILITY_DECISION_REQUIRED_FACTS.every(field => authorityReady.has(field));
  const genericOnboardingReady = input.identityVerified
    && required.every(field => authorityReady.has(field));

  return {
    speciesId: input.catalogKey,
    scientificName: input.scientificName,
    genus,
    identityReadiness: input.identityVerified ? 'reviewed_direct_identity' : 'unreviewed_new_object',
    nextStage: !input.identityVerified
      ? 'identity_resolution'
      : genericOnboardingReady
        ? 'decision_ready'
        : 'field_authority',
    decisionReady,
    genericOnboardingReady,
    fields,
  };
};

export const buildCompatibilityEvidenceAcquisitionPlan = (
  fish: Parameters<typeof getCompatibilityCoreFieldCoverageRow>[0],
): CompatibilityEvidenceAcquisitionPlan => {
  const coverage = getCompatibilityCoreFieldCoverageRow(fish);
  const genus = getScientificGenus(fish.scientificName);
  const catalogPersisted = fishData.some(item => item.id === fish.id);
  const identityReady = isCompatibilityIdentityReady(coverage.identityReadiness);
  // For a not-yet-persisted exact species, one existing genus peer plus the new
  // object is enough to justify a reusable genus research pass. Existing catalog
  // objects keep the stricter two-existing-species threshold.
  const genusPlan = genus
    ? buildCompatibilityGenusAuthorityResearchPlan(catalogPersisted ? 2 : 1)
      .find(item => item.genus === genus)
    : undefined;
  const genusFields = new Set(genusPlan?.targetFields ?? []);

  const fields = (Object.keys(coverage.fields) as CompatibilityCoreField[]).map(field => {
    const cell = coverage.fields[field];
    let route: CompatibilityEvidenceAcquisitionRoute;

    if (cell.disposition === 'not_applicable') {
      route = 'not_applicable';
    } else if (!identityReady) {
      route = 'identity_resolution_required';
    } else if (cell.disposition === 'ready') {
      route = 'authority_ready';
    } else if (cell.authoritySource === 'identity_boundary' || cell.reasonCode?.includes('identity')) {
      route = 'identity_resolution_required';
    } else if (cell.disposition === 'domain_extension_required') {
      route = 'domain_extension_required';
    } else if (
      genus
      && eligibleFieldSet.has(field)
      && genusFields.has(field as CompatibilityGenusAuthorityField)
    ) {
      route = 'genus_authority_research';
    } else if (cell.disposition === 'targeted_source_expansion') {
      route = 'species_targeted_research';
    } else {
      route = 'public_evidence_ceiling';
    }

    return {
      field,
      route,
      authoritySource: cell.authoritySource,
      reasonCode: cell.reasonCode,
      evidenceIds: [...cell.evidenceIds],
      genusResearchKey: route === 'genus_authority_research' ? genus : null,
    };
  });

  return {
    speciesId: fish.id,
    scientificName: fish.scientificName,
    genus,
    decisionReady: coverage.decisionReady,
    identityReadiness: coverage.identityReadiness,
    nextStage: !identityReady ? 'identity_resolution' : coverage.genericOnboardingReady ? 'decision_ready' : 'field_authority',
    genericOnboardingReady: coverage.genericOnboardingReady,
    fields,
  };
};

export type CompatibilityResearchDebtLane =
  | 'full_authority_ready'
  | 'decision_ready_soft_debt'
  | 'identity_first'
  | 'domain_extension'
  | 'hard_evidence_ceiling'
  | 'decision_research_now'
  | 'not_applicable'
  | 'other_hold';

export type CompatibilityResearchDebtRoutingItem = {
  speciesId: string;
  name: string;
  scientificName: string;
  lifeType: ReturnType<typeof getCompatibilityCoreFieldCoverageRow>['lifeType'];
  lane: CompatibilityResearchDebtLane;
  decisionReady: boolean;
  genericOnboardingReady: boolean;
  identityReadiness: ReturnType<typeof getCompatibilityCoreFieldCoverageRow>['identityReadiness'];
  unresolvedFields: CompatibilityEvidenceAcquisitionPlan['fields'];
  hardDecisionGaps: CompatibilityEvidenceAcquisitionPlan['fields'];
  softRiskGaps: CompatibilityEvidenceAcquisitionPlan['fields'];
  immediateResearchFields: CompatibilityEvidenceAcquisitionPlan['fields'];
  optionalResearchFields: CompatibilityEvidenceAcquisitionPlan['fields'];
};

const unresolvedAcquisitionFields = (plan: CompatibilityEvidenceAcquisitionPlan) => (
  plan.fields.filter(item => item.route !== 'authority_ready' && item.route !== 'not_applicable')
);

const countBy = <T extends string>(values: T[]) => Object.fromEntries(
  [...new Set(values)].sort().map(value => [value, values.filter(candidate => candidate === value).length]),
) as Partial<Record<T, number>>;

export const buildCompatibilityResearchDebtRoutingReport = () => {
  const coverage = buildCompatibilityCoreFieldCoverage();
  const coverageById = new Map(coverage.rows.map(row => [row.speciesId, row]));
  const decisionFieldSet = new Set<CompatibilityCoreField>(
    [...COMPATIBILITY_DECISION_REQUIRED_FACTS] as CompatibilityCoreField[],
  );

  const items: CompatibilityResearchDebtRoutingItem[] = fishData.map(fish => {
    const row = coverageById.get(fish.id) ?? getCompatibilityCoreFieldCoverageRow(fish);
    const plan = buildCompatibilityEvidenceAcquisitionPlan(fish);
    const unresolvedFields = unresolvedAcquisitionFields(plan);
    const hardDecisionGaps = unresolvedFields.filter(item => decisionFieldSet.has(item.field));
    const softRiskGaps = unresolvedFields.filter(item => !decisionFieldSet.has(item.field));
    const applicableFields = plan.fields.filter(item => item.route !== 'not_applicable');

    let lane: CompatibilityResearchDebtLane;
    if (plan.genericOnboardingReady) lane = 'full_authority_ready';
    else if (plan.decisionReady) lane = 'decision_ready_soft_debt';
    else if (row.lifeType !== 'fish') lane = applicableFields.length === 0 ? 'not_applicable' : 'domain_extension';
    else if (hardDecisionGaps.some(item => item.route === 'identity_resolution_required')) lane = 'identity_first';
    else if (hardDecisionGaps.some(item => item.route === 'domain_extension_required')) lane = 'domain_extension';
    else if (hardDecisionGaps.some(item => item.route === 'public_evidence_ceiling')) lane = 'hard_evidence_ceiling';
    else if (hardDecisionGaps.some(item => (
      item.route === 'genus_authority_research'
      || item.route === 'species_targeted_research'
    ))) lane = 'decision_research_now';
    else lane = 'other_hold';

    const immediateResearchFields = lane === 'decision_research_now'
      ? hardDecisionGaps.filter(item => (
          item.route === 'genus_authority_research'
          || item.route === 'species_targeted_research'
        ))
      : [];
    const optionalResearchFields = lane === 'decision_ready_soft_debt'
      ? softRiskGaps.filter(item => (
          item.route === 'genus_authority_research'
          || item.route === 'species_targeted_research'
        ))
      : [];

    return {
      speciesId: fish.id,
      name: fish.name,
      scientificName: fish.scientificName,
      lifeType: row.lifeType,
      lane,
      decisionReady: plan.decisionReady,
      genericOnboardingReady: plan.genericOnboardingReady,
      identityReadiness: plan.identityReadiness,
      unresolvedFields,
      hardDecisionGaps,
      softRiskGaps,
      immediateResearchFields,
      optionalResearchFields,
    };
  });

  const oldBacklogRouted = coverage.backlog.map(backlogItem => {
    const item = items.find(candidate => candidate.speciesId === backlogItem.speciesId);
    const fieldRoute = item?.unresolvedFields.find(field => field.field === backlogItem.field)?.route ?? null;
    return {
      speciesId: backlogItem.speciesId,
      field: backlogItem.field,
      route: fieldRoute,
      lane: item?.lane ?? 'other_hold' as CompatibilityResearchDebtLane,
      completionEligible: backlogItem.completionEligible,
      blockingTerminalFields: [...backlogItem.blockingTerminalFields],
      blockingTerminalReasons: [...backlogItem.blockingTerminalReasons],
    };
  });

  const debtItems = items.filter(item => item.lane !== 'full_authority_ready');
  const decisionReadySoftDebt = items.filter(item => item.lane === 'decision_ready_soft_debt');
  const immediateResearch = items.filter(item => item.lane === 'decision_research_now');

  return {
    policy: 'Route work by decision impact: identity/domain/hard-evidence blockers first; direct research only when it can unlock a hard decision; decision-ready soft-risk gaps never block the user verdict. Pair packs are not an onboarding dependency.',
    summary: {
      catalogObjects: items.length,
      fullAuthorityReadySpecies: items.filter(item => item.lane === 'full_authority_ready').length,
      decisionReadySoftDebtSpecies: decisionReadySoftDebt.length,
      decisionReadySoftDebtFields: decisionReadySoftDebt.reduce((count, item) => count + item.unresolvedFields.length, 0),
      immediateDecisionResearchSpecies: immediateResearch.length,
      immediateDecisionResearchFields: immediateResearch.reduce((count, item) => count + item.immediateResearchFields.length, 0),
      optionalRiskResearchSpecies: decisionReadySoftDebt.filter(item => item.optionalResearchFields.length > 0).length,
      optionalRiskResearchFields: decisionReadySoftDebt.reduce((count, item) => count + item.optionalResearchFields.length, 0),
      identityFirstSpecies: items.filter(item => item.lane === 'identity_first').length,
      domainExtensionSpecies: items.filter(item => item.lane === 'domain_extension').length,
      hardEvidenceCeilingSpecies: items.filter(item => item.lane === 'hard_evidence_ceiling').length,
      notApplicableSpecies: items.filter(item => item.lane === 'not_applicable').length,
      otherHoldSpecies: items.filter(item => item.lane === 'other_hold').length,
      laneCounts: countBy(items.map(item => item.lane)),
      unresolvedRouteCounts: countBy(debtItems.flatMap(item => item.unresolvedFields.map(field => field.route))),
      legacyVisibleBacklogItems: oldBacklogRouted.length,
      legacyBacklogImmediateResearchItems: oldBacklogRouted.filter(item => (
        item.completionEligible
        && (item.route === 'genus_authority_research' || item.route === 'species_targeted_research')
      )).length,
      legacyBacklogIdentityFirstItems: oldBacklogRouted.filter(item => item.route === 'identity_resolution_required').length,
      legacyBacklogDeferredSpeciesResearchItems: oldBacklogRouted.filter(item => (
        !item.completionEligible && item.route === 'species_targeted_research'
      )).length,
    },
    items: debtItems,
    legacyBacklogRouting: oldBacklogRouted,
  };
};

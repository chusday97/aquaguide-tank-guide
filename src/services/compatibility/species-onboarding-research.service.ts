import {
  GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS,
  catalogEvidenceSourceSchema,
  type CatalogEvidenceSource,
} from '../../../packages/contracts/src';
import type {
  CompatibilityFactDisposition,
  CompatibilityRequiredFact,
  DomainSpeciesFact,
} from '../../../packages/domain-rules/src/compatibility';
import {
  isCatalogFieldReviewValueValid,
  type CatalogFieldReview,
} from '../../data/catalogFieldReviews';

export type CompatibilityOnboardingCoreField = typeof GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS[number];

export type CompatibilityResearchSource = CatalogEvidenceSource & {
  contentVerified: boolean;
};

export type CompatibilityResearchFieldClaim = {
  field: CompatibilityOnboardingCoreField;
  proposedValue: unknown;
  sourceId: string;
  evidenceKind: 'direct' | 'contextual';
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  note?: string;
};

export type CompatibilitySpeciesResearchPacket = {
  packetId: string;
  providerId: string;
  catalogKey: string;
  commonName: string;
  scientificName: string;
  identityStatus: 'verified' | 'ambiguous' | 'unresolved';
  sources: CompatibilityResearchSource[];
  claims: CompatibilityResearchFieldClaim[];
};

export interface CompatibilitySpeciesResearchProvider {
  id: string;
  research(input: { catalogKey: string; scientificName: string; commonName?: string }): Promise<CompatibilitySpeciesResearchPacket>;
}

export type CompatibilitySpeciesIdentityResolution = {
  status: 'verified' | 'ambiguous' | 'unresolved' | 'provider_unavailable';
  queriedScientificName: string;
  canonicalName: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  confidence: number | null;
  reasonCode: string;
};

export interface CompatibilitySpeciesIdentityResolver {
  id: string;
  resolve(scientificName: string): Promise<CompatibilitySpeciesIdentityResolution>;
}

export type CompatibilitySpeciesOnboardingPipelineResult = {
  status: 'research_assessed' | 'identity_hold';
  identity: CompatibilitySpeciesIdentityResolution;
  assessment: CompatibilitySpeciesOnboardingAssessment | null;
};

export const getCompatibilitySpeciesResearchCapability = (
  provider?: CompatibilitySpeciesResearchProvider | null,
) => provider
  ? { available: true as const, providerId: provider.id, reason: null }
  : { available: false as const, providerId: null, reason: 'research_provider_unavailable' as const };

export type CompatibilityOnboardingFieldResolution = {
  field: CompatibilityOnboardingCoreField;
  status: 'supported' | 'missing' | 'conflicted' | 'invalid_or_unverified';
  proposedValue: unknown | null;
  sourceIds: string[];
  notes: string[];
};

export type CompatibilityOnboardingCandidateProfile = {
  catalogKey: string;
  behaviorTraits: string[];
  minimumGroupSize?: number;
  predationTargets: string[];
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  reviewStatus: 'draft';
  citations: CompatibilityResearchSource[];
  requiredFacts: CompatibilityRequiredFact[];
  stageRiskRules: [];
  version: 1;
};

export type CompatibilitySpeciesOnboardingAssessment = {
  packetId: string;
  providerId: string;
  catalogKey: string;
  scientificName: string;
  status: 'ready_for_review' | 'research_pending' | 'terminal_hold';
  reasonCodes: string[];
  fieldResolutions: CompatibilityOnboardingFieldResolution[];
  draftFieldReviews: CatalogFieldReview[];
  candidateProfile: CompatibilityOnboardingCandidateProfile | null;
};

const coreFields = [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS] as CompatibilityOnboardingCoreField[];

const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, normalize(nested)]),
    );
  }
  return value;
};

const stableValueKey = (value: unknown) => JSON.stringify(normalize(value));

const weakestConfidence = (claims: CompatibilityResearchFieldClaim[]) => {
  const order = ['unknown', 'low', 'medium', 'high'] as const;
  return claims.reduce<(typeof order)[number]>((current, claim) => (
    order.indexOf(claim.confidence) < order.indexOf(current) ? claim.confidence : current
  ), 'high');
};

const fieldValueIsValid = (
  packet: CompatibilitySpeciesResearchPacket,
  field: CompatibilityOnboardingCoreField,
  proposedValue: unknown,
  sourceIds: string[],
) => isCatalogFieldReviewValueValid({
  speciesId: packet.catalogKey,
  field,
  proposedValue,
  status: 'reviewed',
  resolution: 'supported',
  confidence: 'medium',
  citationIds: sourceIds,
  conflictNotes: [],
  reviewedAt: new Date(0).toISOString(),
});

const resolveField = (
  packet: CompatibilitySpeciesResearchPacket,
  field: CompatibilityOnboardingCoreField,
  sourceById: Map<string, CompatibilityResearchSource>,
): CompatibilityOnboardingFieldResolution => {
  const fieldClaims = packet.claims.filter(claim => claim.field === field);
  const usable = fieldClaims.filter(claim => {
    const source = sourceById.get(claim.sourceId);
    return claim.evidenceKind === 'direct'
      && Boolean(source?.contentVerified)
      && Boolean(source && catalogEvidenceSourceSchema.safeParse(source).success)
      && source?.reviewStatus !== 'rejected';
  });

  if (usable.length === 0) {
    return {
      field,
      status: fieldClaims.length > 0 ? 'invalid_or_unverified' : 'missing',
      proposedValue: null,
      sourceIds: fieldClaims.map(claim => claim.sourceId),
      notes: fieldClaims.length > 0
        ? ['Only direct claims from content-verified, non-rejected sources may enter the onboarding candidate.']
        : ['No direct evidence claim was supplied for this required field.'],
    };
  }

  const values = new Map<string, { value: unknown; claims: CompatibilityResearchFieldClaim[] }>();
  for (const claim of usable) {
    const key = stableValueKey(claim.proposedValue);
    const existing = values.get(key);
    if (existing) existing.claims.push(claim);
    else values.set(key, { value: claim.proposedValue, claims: [claim] });
  }

  if (values.size > 1) {
    return {
      field,
      status: 'conflicted',
      proposedValue: null,
      sourceIds: [...new Set(usable.map(claim => claim.sourceId))],
      notes: [
        'Direct content-verified sources disagree on the field value; automatic onboarding must stop rather than select a convenient value.',
        ...usable.flatMap(claim => claim.note ? [claim.note] : []),
      ],
    };
  }

  const only = [...values.values()][0];
  const sourceIds = [...new Set(only.claims.map(claim => claim.sourceId))];
  if (!fieldValueIsValid(packet, field, only.value, sourceIds)) {
    return {
      field,
      status: 'invalid_or_unverified',
      proposedValue: null,
      sourceIds,
      notes: ['The extracted value does not satisfy the source-controlled Catalog field schema.'],
    };
  }

  return {
    field,
    status: 'supported',
    proposedValue: only.value,
    sourceIds,
    notes: only.claims.flatMap(claim => claim.note ? [claim.note] : []),
  };
};

const supportedValue = <T>(
  resolutions: CompatibilityOnboardingFieldResolution[],
  field: CompatibilityOnboardingCoreField,
) => resolutions.find(item => item.field === field && item.status === 'supported')?.proposedValue as T | undefined;

const candidateProfileFrom = (
  packet: CompatibilitySpeciesResearchPacket,
  resolutions: CompatibilityOnboardingFieldResolution[],
  sourceById: Map<string, CompatibilityResearchSource>,
): CompatibilityOnboardingCandidateProfile => {
  const social = supportedValue<{ mode: string; minimumGroupSize: number | null }>(resolutions, 'social_behavior');
  const territoriality = supportedValue<{ traits: string[] }>(resolutions, 'territoriality');
  const predation = supportedValue<{ targets: string[] }>(resolutions, 'predation');
  const sourceIds = new Set(resolutions.flatMap(item => item.sourceIds));
  const citations = [...sourceIds]
    .map(id => sourceById.get(id))
    .filter((source): source is CompatibilityResearchSource => Boolean(source));
  const claimConfidence = weakestConfidence(packet.claims.filter(claim => sourceIds.has(claim.sourceId)));

  return {
    catalogKey: packet.catalogKey,
    behaviorTraits: [...(territoriality?.traits ?? [])],
    ...(social?.minimumGroupSize ? { minimumGroupSize: social.minimumGroupSize } : {}),
    predationTargets: [...(predation?.targets ?? [])],
    confidence: claimConfidence,
    reviewStatus: 'draft',
    citations,
    requiredFacts: [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS],
    stageRiskRules: [],
    version: 1,
  };
};

export const assessCompatibilitySpeciesResearchPacket = (
  packet: CompatibilitySpeciesResearchPacket,
): CompatibilitySpeciesOnboardingAssessment => {
  const sourceById = new Map(packet.sources.map(source => [source.id, source] as const));
  const duplicateSourceIds = packet.sources
    .map(source => source.id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  const invalidSourceIds = packet.sources
    .filter(source => !catalogEvidenceSourceSchema.safeParse(source).success)
    .map(source => source.id || '(missing-id)');
  const unknownClaimSources = packet.claims
    .map(claim => claim.sourceId)
    .filter(id => !sourceById.has(id));

  const fieldResolutions = coreFields.map(field => resolveField(packet, field, sourceById));
  const reasonCodes: string[] = [];

  if (packet.identityStatus !== 'verified') reasonCodes.push('identity_unresolved');
  if (duplicateSourceIds.length > 0) reasonCodes.push('duplicate_source_id');
  if (invalidSourceIds.length > 0) reasonCodes.push('invalid_source_schema');
  if (unknownClaimSources.length > 0) reasonCodes.push('claim_source_missing');
  for (const field of fieldResolutions) {
    if (field.status === 'conflicted') reasonCodes.push('field_conflict_' + field.field);
    if (field.status === 'missing') reasonCodes.push('field_missing_' + field.field);
    if (field.status === 'invalid_or_unverified') reasonCodes.push('field_unverified_' + field.field);
  }

  const hasTerminal = packet.identityStatus !== 'verified'
    || duplicateSourceIds.length > 0
    || invalidSourceIds.length > 0
    || fieldResolutions.some(field => field.status === 'conflicted');
  const hasPending = unknownClaimSources.length > 0
    || fieldResolutions.some(field => field.status === 'missing' || field.status === 'invalid_or_unverified');
  const status = hasTerminal ? 'terminal_hold' : hasPending ? 'research_pending' : 'ready_for_review';

  const draftFieldReviews: CatalogFieldReview[] = fieldResolutions
    .filter(field => field.status === 'supported')
    .map(field => ({
      speciesId: packet.catalogKey,
      field: field.field,
      proposedValue: field.proposedValue,
      status: 'draft',
      resolution: null,
      confidence: weakestConfidence(packet.claims.filter(claim => field.sourceIds.includes(claim.sourceId))),
      citationIds: field.sourceIds,
      conflictNotes: field.notes,
      reviewedAt: null,
    }));

  return {
    packetId: packet.packetId,
    providerId: packet.providerId,
    catalogKey: packet.catalogKey,
    scientificName: packet.scientificName,
    status,
    reasonCodes: [...new Set(reasonCodes)],
    fieldResolutions,
    draftFieldReviews,
    candidateProfile: status === 'ready_for_review'
      ? candidateProfileFrom(packet, fieldResolutions, sourceById)
      : null,
  };
};

export const researchAndAssessCompatibilitySpecies = async (
  provider: CompatibilitySpeciesResearchProvider,
  input: { catalogKey: string; scientificName: string; commonName?: string },
) => {
  const packet = await provider.research(input);
  const assessment = assessCompatibilitySpeciesResearchPacket(packet);
  const reasonCodes = [...assessment.reasonCodes];
  if (packet.providerId !== provider.id) reasonCodes.push('provider_id_mismatch');
  if (packet.catalogKey !== input.catalogKey) reasonCodes.push('provider_catalog_key_mismatch');
  if (packet.scientificName.trim().toLowerCase() !== input.scientificName.trim().toLowerCase()) {
    reasonCodes.push('provider_scientific_name_mismatch');
  }
  if (reasonCodes.length === assessment.reasonCodes.length) return assessment;
  return {
    ...assessment,
    status: 'terminal_hold' as const,
    reasonCodes: [...new Set(reasonCodes)],
    candidateProfile: null,
  };
};

export const runCompatibilitySpeciesOnboardingPipeline = async (
  identityResolver: CompatibilitySpeciesIdentityResolver,
  researchProvider: CompatibilitySpeciesResearchProvider,
  input: { catalogKey: string; scientificName: string; commonName?: string },
): Promise<CompatibilitySpeciesOnboardingPipelineResult> => {
  const identity = await identityResolver.resolve(input.scientificName);
  if (identity.status !== 'verified') {
    return { status: 'identity_hold', identity, assessment: null };
  }
  const assessment = await researchAndAssessCompatibilitySpecies(researchProvider, input);
  return { status: 'research_assessed', identity, assessment };
};

export const buildPostReviewCompatibilityPreviewFact = (
  assessment: CompatibilitySpeciesOnboardingAssessment,
): DomainSpeciesFact => {
  if (assessment.status !== 'ready_for_review' || !assessment.candidateProfile) {
    throw new Error('Compatibility onboarding candidate is not review-ready: ' + assessment.status);
  }

  const value = <T>(field: CompatibilityOnboardingCoreField) => {
    const resolution = assessment.fieldResolutions.find(item => item.field === field);
    if (!resolution || resolution.status !== 'supported') {
      throw new Error('Missing supported onboarding field: ' + field);
    }
    return resolution.proposedValue as T;
  };

  const water = value<'freshwater' | 'saltwater' | 'brackish'>('water');
  const temperature = value<{ min: number; max: number }>('temperature');
  const ph = value<{ min: number; max: number }>('ph');
  const adult = value<{ min: number | null; max: number | null }>('adult_size');
  const tank = value<{ liters: number | null; lengthCm: number | null }>('tank_size');
  const social = value<{ mode: 'solitary' | 'pair' | 'group' | 'colony' | 'variable' | 'unknown'; minimumGroupSize: number | null }>('social_behavior');
  const territoriality = value<{ traits: string[] }>('territoriality');
  const predation = value<{ targets: string[] }>('predation');
  const maxLength = adult.max ?? adult.min ?? null;
  const dispositions = Object.fromEntries(
    GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS.map(field => [field, 'ready' as CompatibilityFactDisposition]),
  ) as Partial<Record<CompatibilityRequiredFact, CompatibilityFactDisposition>>;
  const evidenceIds = [...new Set(assessment.fieldResolutions.flatMap(item => item.sourceIds))];

  return {
    id: assessment.catalogKey,
    waterType: water,
    temperatureMinC: temperature.min,
    temperatureMaxC: temperature.max,
    phMin: ph.min,
    phMax: ph.max,
    minTankLiters: tank.liters,
    minTankLengthCm: tank.lengthCm,
    reviewed: true,
    compatibilityRequiredFacts: [...GENERIC_COMPATIBILITY_ONBOARDING_REQUIRED_FACTS],
    compatibilityFactDispositions: dispositions,
    adultLengthMinCm: adult.min,
    adultLengthMaxCm: adult.max,
    socialMode: social.mode === 'group' ? 'group' : social.mode,
    minimumGroupSize: social.minimumGroupSize,
    evidenceIds,
    behaviorTraits: [...territoriality.traits],
    territoriality: territoriality.traits.includes('territorial') ? 'medium' : 'none',
    predationRisk: predation.targets.length > 0 ? 'high' : 'none',
    predationTargets: [...predation.targets],
    predationVulnerability: 'low',
    finNippingRisk: 'none',
    finNipVulnerability: 'none',
    swimmingPace: 'moderate',
    lifeType: 'fish',
    size: maxLength == null ? 'Medium' : maxLength < 10 ? 'Small' : maxLength < 30 ? 'Medium' : 'Large',
  };
};

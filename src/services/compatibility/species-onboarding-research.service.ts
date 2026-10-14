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

export const isCompatibilityResearchClaimScopeEligible = (
  claim: Pick<CompatibilityResearchFieldClaim, 'field' | 'note'>,
) => {
  const note = claim.note?.trim() || '';

  if (claim.field === 'social_behavior') {
    if (!note) return false;
    const breedingOnlyContext = /\b(reproduction|reproductive|breeding|breed|spawn|spawning|grow(?:ing)? up|juvenile|young)\b/i.test(note)
      || /find(?:ing)?\s+(?:a\s+)?(?:breeding\s+)?pair/i.test(note);
    if (breedingOnlyContext) return false;
  }

  if (claim.field === 'predation') {
    if (!note) return false;
    const compatibilityContext = /tank\s*mate|community|aquarium|fit\s+(?:in|into)\s+.*mouth|mouth.*fit|swallow|attack|hunt|predat/i.test(note);
    const dietOnlyContext = /\b(feed|feeds|feeding|diet|food|zooplankton|plankton|algae|detritus)\b/i.test(note);
    if (dietOnlyContext && !compatibilityContext) return false;
  }

  return true;
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

type NumericRange = { min: number | null; max: number | null };
type TankMinimum = { liters: number | null; lengthCm: number | null };
type SocialValue = {
  mode: 'solitary' | 'pair' | 'group' | 'colony' | 'variable' | 'unknown';
  minimumGroupSize: number | null;
};
type StringListValue = { traits?: string[]; targets?: string[] };

const claimSourceIds = (claims: CompatibilityResearchFieldClaim[]) => (
  [...new Set(claims.map(claim => claim.sourceId))]
);

const claimNotes = (claims: CompatibilityResearchFieldClaim[]) => (
  claims.flatMap(claim => claim.note ? [claim.note] : [])
);

const conflictResolution = (
  field: CompatibilityOnboardingCoreField,
  claims: CompatibilityResearchFieldClaim[],
  reason: string,
): CompatibilityOnboardingFieldResolution => ({
  field,
  status: 'conflicted',
  proposedValue: null,
  sourceIds: claimSourceIds(claims),
  notes: [reason, ...claimNotes(claims)],
});

const invalidResolution = (
  field: CompatibilityOnboardingCoreField,
  claims: CompatibilityResearchFieldClaim[],
  reason: string,
): CompatibilityOnboardingFieldResolution => ({
  field,
  status: 'invalid_or_unverified',
  proposedValue: null,
  sourceIds: claimSourceIds(claims),
  notes: [reason, ...claimNotes(claims)],
});

const supportedResolution = (
  packet: CompatibilitySpeciesResearchPacket,
  field: CompatibilityOnboardingCoreField,
  claims: CompatibilityResearchFieldClaim[],
  proposedValue: unknown,
  reconciliationNote?: string,
): CompatibilityOnboardingFieldResolution => {
  const sourceIds = claimSourceIds(claims);
  if (!fieldValueIsValid(packet, field, proposedValue, sourceIds)) {
    return invalidResolution(
      field,
      claims,
      'The reconciled value does not satisfy the source-controlled Catalog field schema.',
    );
  }
  return {
    field,
    status: 'supported',
    proposedValue,
    sourceIds,
    notes: [
      ...(reconciliationNote ? [reconciliationNote] : []),
      ...claimNotes(claims),
    ],
  };
};

const numericSpreadIsMaterial = (values: number[]) => {
  if (values.length < 2) return false;
  const low = Math.min(...values);
  const high = Math.max(...values);
  return high - low > Math.max(1, Math.max(low, 0.1) * 0.1);
};

const unionStrings = (values: string[][]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values.flat()) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
};

const reconcileFieldClaims = (
  packet: CompatibilitySpeciesResearchPacket,
  field: CompatibilityOnboardingCoreField,
  claims: CompatibilityResearchFieldClaim[],
): CompatibilityOnboardingFieldResolution => {
  const invalidClaims = claims.filter(claim => !fieldValueIsValid(
    packet,
    field,
    claim.proposedValue,
    [claim.sourceId],
  ));
  if (invalidClaims.length > 0) {
    return invalidResolution(
      field,
      invalidClaims,
      'At least one direct extracted claim has an invalid field value; automatic reconciliation remains fail-closed.',
    );
  }

  if (field === 'water') {
    const values = [...new Set(claims.map(claim => stableValueKey(claim.proposedValue)))];
    if (values.length > 1) {
      return conflictResolution(field, claims, 'Direct sources disagree on the water type.');
    }
    return supportedResolution(packet, field, claims, claims[0].proposedValue);
  }

  if (field === 'temperature' || field === 'ph') {
    const ranges = claims.map(claim => claim.proposedValue as NumericRange);
    const mins = ranges.flatMap(range => range.min === null ? [] : [range.min]);
    const maxes = ranges.flatMap(range => range.max === null ? [] : [range.max]);
    if (mins.length === 0 && maxes.length === 0) {
      return invalidResolution(field, claims, 'Direct range claims contain no usable numeric boundary.');
    }
    const min = mins.length > 0 ? Math.max(...mins) : null;
    const max = maxes.length > 0 ? Math.min(...maxes) : null;
    if (min !== null && max !== null && min > max) {
      return conflictResolution(
        field,
        claims,
        'Direct husbandry ranges do not overlap; automatic onboarding must stop instead of inventing a compromise.',
      );
    }
    return supportedResolution(
      packet,
      field,
      claims,
      { min, max },
      claims.length > 1
        ? 'Overlapping direct husbandry ranges were reconciled to their conservative shared intersection.'
        : undefined,
    );
  }

  if (field === 'adult_size') {
    const ranges = claims.map(claim => claim.proposedValue as NumericRange);
    const mins = ranges.flatMap(range => range.min === null ? [] : [range.min]);
    const maxes = ranges.flatMap(range => range.max === null ? [] : [range.max]);
    if (mins.length === 0 && maxes.length === 0) {
      return invalidResolution(field, claims, 'Direct adult-size claims contain no usable numeric boundary.');
    }
    if (numericSpreadIsMaterial(mins) || numericSpreadIsMaterial(maxes)) {
      return conflictResolution(
        field,
        claims,
        'Direct adult-size measurements differ materially beyond the reconciliation tolerance.',
      );
    }
    return supportedResolution(
      packet,
      field,
      claims,
      {
        min: mins.length > 0 ? Math.min(...mins) : null,
        max: maxes.length > 0 ? Math.max(...maxes) : null,
      },
      claims.length > 1
        ? 'Near-equivalent adult-size measurements were reconciled conservatively to the widest supported range.'
        : undefined,
    );
  }

  if (field === 'tank_size') {
    const minimums = claims.map(claim => claim.proposedValue as TankMinimum);
    const liters = minimums.flatMap(value => value.liters === null ? [] : [value.liters]);
    const lengths = minimums.flatMap(value => value.lengthCm === null ? [] : [value.lengthCm]);
    if (liters.length === 0 && lengths.length === 0) {
      return invalidResolution(field, claims, 'Direct tank-minimum claims contain no usable minimum.');
    }
    return supportedResolution(
      packet,
      field,
      claims,
      {
        liters: liters.length > 0 ? Math.max(...liters) : null,
        lengthCm: lengths.length > 0 ? Math.max(...lengths) : null,
      },
      claims.length > 1
        ? 'Multiple explicit aquarium minimums were reconciled by keeping the most conservative supported minimum on each dimension.'
        : undefined,
    );
  }

  if (field === 'social_behavior') {
    const values = claims.map(claim => claim.proposedValue as SocialValue);
    const concreteModes = [...new Set(
      values.map(value => value.mode).filter(mode => mode !== 'unknown'),
    )];
    if (concreteModes.length > 1) {
      return conflictResolution(field, claims, 'Direct sources disagree on the normal social mode.');
    }
    const groupSizes = values.flatMap(value => value.minimumGroupSize === null ? [] : [value.minimumGroupSize]);
    return supportedResolution(
      packet,
      field,
      claims,
      {
        mode: concreteModes[0] ?? 'unknown',
        minimumGroupSize: groupSizes.length > 0 ? Math.max(...groupSizes) : null,
      },
      claims.length > 1
        ? 'Compatible social evidence was reconciled using the most conservative explicit minimum group size.'
        : undefined,
    );
  }

  if (field === 'territoriality' || field === 'predation') {
    const key = field === 'territoriality' ? 'traits' : 'targets';
    const lists = claims.map(claim => {
      const value = claim.proposedValue as StringListValue;
      return (value[key] ?? []) as string[];
    });
    const hasEmpty = lists.some(list => list.length === 0);
    const hasNonEmpty = lists.some(list => list.length > 0);
    if (hasEmpty && hasNonEmpty) {
      return conflictResolution(
        field,
        claims,
        field === 'territoriality'
          ? 'Direct sources conflict between explicit non-territorial evidence and territorial traits.'
          : 'Direct sources conflict between explicit no-fish-prey evidence and positive prey targets.',
      );
    }
    const merged = unionStrings(lists);
    return supportedResolution(
      packet,
      field,
      claims,
      { [key]: merged },
      claims.length > 1 && merged.length > 0
        ? 'Compatible direct risk evidence was merged without widening beyond the cited source statements.'
        : undefined,
    );
  }

  const values = new Map<string, unknown>();
  for (const claim of claims) values.set(stableValueKey(claim.proposedValue), claim.proposedValue);
  if (values.size > 1) {
    return conflictResolution(
      field,
      claims,
      'Direct content-verified sources disagree on the field value; automatic onboarding remains fail-closed.',
    );
  }
  return supportedResolution(packet, field, claims, [...values.values()][0]);
};

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
      && source?.reviewStatus !== 'rejected'
      && isCompatibilityResearchClaimScopeEligible(claim);
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

  return reconcileFieldClaims(packet, field, usable);
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

export const researchAndAssessCompatibilitySpeciesDetailed = async (
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
  const finalAssessment = reasonCodes.length === assessment.reasonCodes.length
    ? assessment
    : {
      ...assessment,
      status: 'terminal_hold' as const,
      reasonCodes: [...new Set(reasonCodes)],
      candidateProfile: null,
    };
  return { packet, assessment: finalAssessment };
};

export const researchAndAssessCompatibilitySpecies = async (
  provider: CompatibilitySpeciesResearchProvider,
  input: { catalogKey: string; scientificName: string; commonName?: string },
) => (await researchAndAssessCompatibilitySpeciesDetailed(provider, input)).assessment;

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

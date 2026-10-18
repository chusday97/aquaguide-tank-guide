type CatalogFish = { id: string; scientificName: string };

export type IdentityBulkQueueItem = {
  speciesId: string;
  name: string;
  scientificName: string;
  queue: string;
  automatedResearchAllowed: boolean;
  readyBaseSpeciesIds: string[];
  baseCandidateSpeciesIds: string[];
  morphologyRisk: boolean;
  soleBoundaryIdentityUnknownPairs: number;
  affectedIdentityUnknownPairs: number;
};

export type IdentityBulkQueueManifest = {
  items: IdentityBulkQueueItem[];
};

export type IdentityResolutionLike = {
  status: string;
  queriedScientificName: string;
  canonicalName: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  confidence: number | null;
  reasonCode: string;
};

export const selectIdentityResolutionWithVerifiedCache = (
  liveResolution: IdentityResolutionLike,
  cachedResolution: IdentityResolutionLike | null | undefined,
) => {
  const useCachedVerified = liveResolution.status === 'provider_unavailable'
    && cachedResolution?.status === 'verified';
  return {
    resolution: useCachedVerified ? cachedResolution : liveResolution,
    usedCachedVerified: Boolean(useCachedVerified),
  };
};

export const normalizeScientificName = (value: string) => value.trim().replace(/\s+/g, ' ');

export const deriveExactBinomialBase = (scientificName: string) => {
  const normalized = normalizeScientificName(scientificName);
  if (/\b(?:sp\.|spp\.|cf\.|aff\.)\b/i.test(normalized)) return null;
  if (/\s[×x]\s/i.test(normalized)) return null;
  const match = normalized.match(/^([A-Z][a-z-]+)\s+([a-z][a-z-]+)(?:\s+(?:var\.|subsp\.|forma\b|f\.)|$)/);
  return match ? match[1] + ' ' + match[2] : null;
};

export const isExactBinomialTaxon = (scientificName: string) => {
  const normalized = normalizeScientificName(scientificName);
  return deriveExactBinomialBase(normalized) === normalized;
};

const unique = (values: Array<string | null | undefined>) => (
  [...new Set(values.map(value => value ? normalizeScientificName(value) : '').filter(Boolean))]
);

export const buildIdentityBulkPreparation = (
  queue: IdentityBulkQueueManifest,
  catalog: CatalogFish[],
) => {
  const catalogById = new Map(catalog.map(item => [item.id, item] as const));
  const automatedItems = queue.items.filter(item => item.automatedResearchAllowed);

  const items = automatedItems.map(item => {
    const readyBaseNames = item.readyBaseSpeciesIds
      .map(id => catalogById.get(id)?.scientificName)
      .filter((value): value is string => Boolean(value))
      .filter(isExactBinomialTaxon);
    const candidateBaseNames = item.baseCandidateSpeciesIds
      .map(id => catalogById.get(id)?.scientificName)
      .filter((value): value is string => Boolean(value))
      .filter(isExactBinomialTaxon);
    const derivedBase = deriveExactBinomialBase(item.scientificName);
    const baseCandidateNames = unique([...readyBaseNames, ...candidateBaseNames, derivedBase]);
    const localBaseSpeciesIds = unique(baseCandidateNames.flatMap(baseName => (
      catalog
        .filter(candidate => (
          candidate.id !== item.speciesId
          && normalizeScientificName(candidate.scientificName) === baseName
        ))
        .map(candidate => candidate.id)
    )));

    return {
      speciesId: item.speciesId,
      name: item.name,
      scientificName: item.scientificName,
      sourceQueue: item.queue,
      morphologyRisk: item.morphologyRisk,
      soleBoundaryIdentityUnknownPairs: item.soleBoundaryIdentityUnknownPairs,
      affectedIdentityUnknownPairs: item.affectedIdentityUnknownPairs,
      baseCandidateNames,
      localBaseSpeciesIds,
      readyBaseSpeciesIds: [...item.readyBaseSpeciesIds],
      hasDeterministicBaseCandidate: baseCandidateNames.length > 0,
    };
  });

  return {
    items,
    uniqueBaseCandidateNames: unique(items.flatMap(item => item.baseCandidateNames)),
  };
};

export const chooseVerifiedBaseResolution = (
  candidateNames: string[],
  resolutions: Map<string, IdentityResolutionLike>,
) => {
  for (const candidateName of candidateNames) {
    const resolution = resolutions.get(candidateName);
    if (resolution?.status === 'verified') return resolution;
  }
  for (const candidateName of candidateNames) {
    const resolution = resolutions.get(candidateName);
    if (resolution) return resolution;
  }
  return null;
};

export type IdentityBulkBaseItem = ReturnType<typeof buildIdentityBulkPreparation>['items'][number] & {
  selectedBaseScientificName: string | null;
  baseResolution: IdentityResolutionLike | null;
  stage:
    | 'variant_identity_research'
    | 'taxonomy_review'
    | 'parent_resolution_unresolved';
};

export const buildVariantResearchGroups = (items: IdentityBulkBaseItem[]) => {
  const groups = new Map<string, {
    researchKey: string;
    baseScientificName: string;
    objects: Array<{ speciesId: string; name: string; scientificName: string; status: string }>;
  }>();

  for (const item of items) {
    if (item.stage !== 'variant_identity_research' || !item.selectedBaseScientificName) continue;
    const base = item.selectedBaseScientificName;
    const existing = groups.get(base) || {
      researchKey: 'identity-bulk-' + base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      baseScientificName: base,
      objects: [],
    };
    existing.objects.push({
      speciesId: item.speciesId,
      name: item.name,
      scientificName: item.scientificName,
      status: 'identity_review_required',
    });
    groups.set(base, existing);
  }

  return [...groups.values()]
    .map(group => ({
      ...group,
      objects: group.objects.sort((a, b) => a.speciesId.localeCompare(b.speciesId)),
    }))
    .sort((a, b) => a.baseScientificName.localeCompare(b.baseScientificName));
};

export type VariantIdentityResearchReportLike = {
  groups?: Array<{
    baseScientificName: string;
    status?: 'completed' | 'failed';
    errorCode?: string | null;
    sources?: Array<{ id: string; url?: string; title?: string; publisher?: string; sourceType?: string; contentSha256?: string }>;
    candidates?: Array<{
      speciesId: string;
      scientificName: string;
      sourceIds: string[];
      confidence: string;
      evidenceText: string;
      note: string | null;
    }>;
    unresolvedSpeciesIds?: string[];
    attemptedUrls?: string[];
  }>;
};

export const buildIdentityBulkReview = (
  baseReport: { generatedAt: string; items: IdentityBulkBaseItem[] },
  variantReport: VariantIdentityResearchReportLike,
  generatedAt = new Date().toISOString(),
) => {
  const candidateBySpecies = new Map<string, any>();
  const groupBySpecies = new Map<string, any>();

  for (const group of variantReport.groups || []) {
    for (const candidate of group.candidates || []) {
      candidateBySpecies.set(candidate.speciesId, candidate);
      groupBySpecies.set(candidate.speciesId, group);
    }
    for (const speciesId of group.unresolvedSpeciesIds || []) {
      if (!groupBySpecies.has(speciesId)) groupBySpecies.set(speciesId, group);
    }
  }

  const items = baseReport.items.map(item => {
    const identityCandidate = candidateBySpecies.get(item.speciesId) || null;
    const providerGroup = groupBySpecies.get(item.speciesId) || null;
    let status:
      | 'identity_candidate_ready_for_review'
      | 'partial_inheritance_candidate_ready_for_review'
      | 'taxonomy_candidate_ready_for_review'
      | 'exact_object_evidence_not_found_this_pass'
      | 'research_retry_required'
      | 'parent_or_taxonomy_unresolved';

    if (item.sourceQueue === 'taxonomic_review' && item.baseResolution?.status === 'verified') {
      status = 'taxonomy_candidate_ready_for_review';
    } else if (identityCandidate && item.sourceQueue === 'partial_inheritance_review') {
      status = 'partial_inheritance_candidate_ready_for_review';
    } else if (identityCandidate) {
      status = 'identity_candidate_ready_for_review';
    } else if (providerGroup?.status === 'failed') {
      status = 'research_retry_required';
    } else if (item.stage === 'variant_identity_research' && !providerGroup) {
      status = 'research_retry_required';
    } else if (item.stage === 'variant_identity_research' && item.baseResolution?.status === 'verified') {
      status = 'exact_object_evidence_not_found_this_pass';
    } else {
      status = 'parent_or_taxonomy_unresolved';
    }

    return {
      ...item,
      status,
      identityCandidate,
      provider: providerGroup ? {
        status: providerGroup.status || 'completed',
        errorCode: providerGroup.errorCode || null,
        attemptedUrls: providerGroup.attemptedUrls || [],
        sourceIds: (providerGroup.sources || []).map((source: any) => source.id),
      } : null,
      requiresHumanReview: true as const,
      promotionAllowed: false as const,
      writesAuthority: false as const,
      fullInheritanceAllowed: false as const,
    };
  }).sort((a, b) => (
    Number(Boolean(b.identityCandidate)) - Number(Boolean(a.identityCandidate))
    || b.soleBoundaryIdentityUnknownPairs - a.soleBoundaryIdentityUnknownPairs
    || a.speciesId.localeCompare(b.speciesId)
  ));

  const count = (status: string) => items.filter(item => item.status === status).length;
  const impact = (status: string) => items
    .filter(item => item.status === status)
    .reduce((sum, item) => sum + item.soleBoundaryIdentityUnknownPairs, 0);

  return {
    version: 1,
    kind: 'compatibility_identity_bulk_review',
    generatedAt,
    generatedFrom: {
      baseResolutionGeneratedAt: baseReport.generatedAt,
    },
    promotionAllowed: false as const,
    writesAuthority: false as const,
    policy: {
      researchMayBeAutomated: true,
      authorityRequiresExplicitHumanReview: true,
      noPairPrecompute: true,
      noAutomaticInheritance: true,
    },
    summary: {
      total: items.length,
      identityCandidateReady: count('identity_candidate_ready_for_review'),
      partialInheritanceCandidateReady: count('partial_inheritance_candidate_ready_for_review'),
      taxonomyCandidateReady: count('taxonomy_candidate_ready_for_review'),
      exactObjectEvidenceNotFoundThisPass: count('exact_object_evidence_not_found_this_pass'),
      researchRetryRequired: count('research_retry_required'),
      parentOrTaxonomyUnresolved: count('parent_or_taxonomy_unresolved'),
      candidateReadyPairImpact:
        impact('identity_candidate_ready_for_review')
        + impact('partial_inheritance_candidate_ready_for_review')
        + impact('taxonomy_candidate_ready_for_review'),
      unresolvedPairImpact:
        impact('exact_object_evidence_not_found_this_pass')
        + impact('research_retry_required')
        + impact('parent_or_taxonomy_unresolved'),
    },
    items,
  };
};

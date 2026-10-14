import type {
  CompatibilitySpeciesIdentityResolution,
  CompatibilitySpeciesIdentityResolver,
} from './species-onboarding-research.service';

type GbifSpeciesMatchResponse = {
  usageKey?: number;
  scientificName?: string;
  canonicalName?: string;
  rank?: string;
  status?: string;
  confidence?: number;
  matchType?: string;
};

export type GbifIdentityResolverOptions = {
  fetchImpl?: typeof fetch;
  endpoint?: string;
  minimumConfidence?: number;
};

const normalizeScientificName = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export const createGbifSpeciesIdentityResolver = ({
  fetchImpl = fetch,
  endpoint = 'https://api.gbif.org/v1/species/match',
  minimumConfidence = 95,
}: GbifIdentityResolverOptions = {}): CompatibilitySpeciesIdentityResolver => ({
  id: 'gbif-species-match-v1',
  resolve: async (scientificName: string): Promise<CompatibilitySpeciesIdentityResolution> => {
    const queriedScientificName = scientificName.trim();
    const url = new URL(endpoint);
    url.searchParams.set('verbose', 'true');
    url.searchParams.set('name', queriedScientificName);

    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      return {
        status: 'provider_unavailable',
        queriedScientificName,
        canonicalName: null,
        externalId: null,
        sourceUrl: null,
        confidence: null,
        reasonCode: 'gbif_request_failed',
      };
    }

    if (!response.ok) {
      return {
        status: 'provider_unavailable',
        queriedScientificName,
        canonicalName: null,
        externalId: null,
        sourceUrl: null,
        confidence: null,
        reasonCode: 'gbif_http_' + response.status,
      };
    }

    let payload: GbifSpeciesMatchResponse;
    try {
      payload = await response.json() as GbifSpeciesMatchResponse;
    } catch {
      return {
        status: 'provider_unavailable',
        queriedScientificName,
        canonicalName: null,
        externalId: null,
        sourceUrl: null,
        confidence: null,
        reasonCode: 'gbif_invalid_json',
      };
    }

    const canonicalName = payload.canonicalName?.trim() || null;
    const confidence = Number.isFinite(payload.confidence) ? Number(payload.confidence) : null;
    const externalId = payload.usageKey != null ? String(payload.usageKey) : null;
    const sourceUrl = externalId ? 'https://www.gbif.org/species/' + externalId : null;
    const exactName = canonicalName != null
      && normalizeScientificName(canonicalName) === normalizeScientificName(queriedScientificName);
    const verified = payload.matchType === 'EXACT'
      && payload.rank === 'SPECIES'
      && payload.status === 'ACCEPTED'
      && exactName
      && confidence != null
      && confidence >= minimumConfidence
      && externalId != null;

    if (verified) {
      return {
        status: 'verified',
        queriedScientificName,
        canonicalName,
        externalId,
        sourceUrl,
        confidence,
        reasonCode: 'gbif_exact_accepted_species',
      };
    }

    const unresolved = payload.matchType === 'NONE' || externalId == null;
    return {
      status: unresolved ? 'unresolved' : 'ambiguous',
      queriedScientificName,
      canonicalName,
      externalId,
      sourceUrl,
      confidence,
      reasonCode: unresolved ? 'gbif_no_species_match' : 'gbif_match_requires_review',
    };
  },
});

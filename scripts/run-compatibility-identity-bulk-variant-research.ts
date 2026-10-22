import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  buildCompatibilityResearchExtractionConfig,
  buildCompatibilityResearchProviderConfig,
  discoverCompatibilityVariantIdentityAcademicCandidates,
  probeCompatibilityResearchSearchProvider,
  researchCompatibilityVariantIdentities,
  type CompatibilityVariantIdentityResearchResult,
} from '../apps/api/src/compatibility-species-research-provider';

type BaseManifest = {
  groups: Array<{
    researchKey: string;
    baseScientificName: string;
    objects: Array<{
      speciesId: string;
      name: string;
      scientificName: string;
      status: string;
    }>;
  }>;
};

type GroupResult = CompatibilityVariantIdentityResearchResult & {
  status: 'completed' | 'retry_required' | 'failed';
  errorCode: string | null;
};

type OutputReport = {
  version: 1;
  kind: 'compatibility_identity_bulk_variant_research';
  generatedAt: string;
  generatedFrom: string;
  promotionAllowed: false;
  writesAuthority: false;
  summary: {
    groupCount: number;
    completedGroups: number;
    retryRequiredGroups: number;
    failedGroups: number;
    objectCount: number;
    candidateCount: number;
    unresolvedCount: number;
  };
  groups: GroupResult[];
};

const arg = (name: string) => {
  const prefix = '--' + name + '=';
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const inputPath = arg('input') || 'evaluation/product/compatibility-identity-bulk-base-resolution.v1.json';
const outputPath = arg('output') || 'evaluation/product/compatibility-identity-bulk-variant-research.v1.json';
const resume = arg('resume') !== 'false';
const forceRetry = arg('force-retry') === 'true';
const networkFailureThreshold = Math.max(1, Math.min(10, Number(arg('network-failure-threshold') || 3)));
const delayMs = Math.max(0, Math.min(5_000, Number(arg('delay-ms') || 250)));
const input = JSON.parse(readFileSync(inputPath, 'utf8')) as BaseManifest;

const discoveryConfig = buildCompatibilityResearchProviderConfig();
const extractionConfig = buildCompatibilityResearchExtractionConfig();
const providerPreflight = await probeCompatibilityResearchSearchProvider(discoveryConfig);
const discoveryReady = providerPreflight.status === 'ready';
console.log('IDENTITY_BULK_VARIANT_PREFLIGHT', JSON.stringify({
  ...providerPreflight,
  discoveryReady,
  extractionHost: (() => { try { return new URL(extractionConfig.baseUrl).host; } catch { return null; } })(),
  extractionModel: extractionConfig.model || null,
}));

const previous = resume && existsSync(outputPath)
  ? JSON.parse(readFileSync(outputPath, 'utf8')) as OutputReport
  : null;
const resultByBase = new Map<string, GroupResult>(
  (previous?.groups || []).map(group => [group.baseScientificName, group] as const),
);

const isNetworkFailure = (group: GroupResult | undefined) => Boolean(
  (group?.status === 'failed' || group?.status === 'retry_required')
  && (
    group.errorCode === 'provider_circuit_open_after_repeated_network_failures'
    || (group.errorCode || '').toLowerCase().includes('provider request failed')
    || (group.errorCode || '').toLowerCase().includes('network')
    || (group.errorCode || '').toLowerCase().includes('fetch failed')
  )
);

let consecutiveNetworkFailures = discoveryReady
  ? [...resultByBase.values()].filter(isNetworkFailure).length
  : 0;
let providerCircuitOpen = discoveryReady && !forceRetry && consecutiveNetworkFailures >= networkFailureThreshold;

const writeReport = () => {
  const groups = input.groups
    .map(group => resultByBase.get(group.baseScientificName))
    .filter((group): group is GroupResult => Boolean(group));
  const report: OutputReport = {
    version: 1,
    kind: 'compatibility_identity_bulk_variant_research',
    generatedAt: new Date().toISOString(),
    generatedFrom: inputPath,
    promotionAllowed: false,
    writesAuthority: false,
    summary: {
      groupCount: input.groups.length,
      completedGroups: groups.filter(group => group.status === 'completed').length,
      retryRequiredGroups: groups.filter(group => group.status === 'retry_required').length,
      failedGroups: groups.filter(group => group.status === 'failed').length,
      objectCount: input.groups.reduce((sum, group) => sum + group.objects.length, 0),
      candidateCount: groups.reduce((sum, group) => sum + group.candidates.length, 0),
      unresolvedCount: groups.reduce((sum, group) => sum + group.unresolvedSpeciesIds.length, 0),
    },
    groups,
  };
  mkdirSync(dirname(outputPath), { recursive: true });
  const tempPath = outputPath + '.tmp';
  writeFileSync(tempPath, JSON.stringify(report, null, 2) + '\n');
  renameSync(tempPath, outputPath);
  return report;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (let index = 0; index < input.groups.length; index += 1) {
  const group = input.groups[index];
  const previousGroup = resultByBase.get(group.baseScientificName);
  if (previousGroup?.status === 'completed') {
    console.log('IDENTITY_BULK_VARIANT_SKIP', index + 1, '/', input.groups.length, group.baseScientificName);
    continue;
  }

  if (discoveryReady && providerCircuitOpen && !forceRetry) {
    resultByBase.set(group.baseScientificName, {
      baseScientificName: group.baseScientificName,
      model: null,
      sources: [],
      candidates: [],
      unresolvedSpeciesIds: group.objects.map(object => object.speciesId),
      attemptedUrls: previousGroup?.attemptedUrls || [],
      sourceDiagnostics: previousGroup?.sourceDiagnostics || [],
      promotionAllowed: false,
      writesAuthority: false,
      status: 'retry_required',
      errorCode: 'provider_circuit_open_after_repeated_network_failures',
    });
    console.log('IDENTITY_BULK_VARIANT_CIRCUIT_OPEN', index + 1, '/', input.groups.length, group.baseScientificName);
    writeReport();
    continue;
  }

  const groupResearchInput = {
    baseScientificName: group.baseScientificName,
    variants: group.objects.map(object => ({
      speciesId: object.speciesId,
      scientificName: object.scientificName,
      commonName: object.name,
    })),
  };
  const academicFallback = !discoveryReady
    ? await discoverCompatibilityVariantIdentityAcademicCandidates(groupResearchInput)
    : { status: 'no_results' as const, candidateUrls: [], attemptedQueries: 0, successfulQueries: 0 };
  const resumableCandidateUrls = [...new Set([
    ...(previousGroup?.attemptedUrls || []),
    ...academicFallback.candidateUrls,
  ])];

  if (!discoveryReady && resumableCandidateUrls.length === 0) {
    resultByBase.set(group.baseScientificName, {
      baseScientificName: group.baseScientificName,
      model: null,
      sources: [],
      candidates: [],
      unresolvedSpeciesIds: group.objects.map(object => object.speciesId),
      attemptedUrls: [],
      sourceDiagnostics: [],
      promotionAllowed: false,
      writesAuthority: false,
      status: 'retry_required',
      errorCode: 'discovery_preflight_unavailable:'
        + (providerPreflight.phase || 'unknown')
        + ':'
        + (providerPreflight.reasonCode || providerPreflight.status)
        + ';academic_fallback:' + academicFallback.status,
    });
    console.log('IDENTITY_BULK_VARIANT_RETRY_REQUIRED', index + 1, '/', input.groups.length, group.baseScientificName, 'reason=discovery_unavailable_no_verified_candidate_urls', 'academic=' + academicFallback.status);
    writeReport();
    continue;
  }

  console.log('IDENTITY_BULK_VARIANT_START', index + 1, '/', input.groups.length, group.baseScientificName, 'objects=' + group.objects.length, 'academicUrls=' + academicFallback.candidateUrls.length);
  try {
    const result = await researchCompatibilityVariantIdentities(groupResearchInput, discoveryConfig, fetch, {
      candidateUrls: resumableCandidateUrls,
      skipDiscovery: !discoveryReady,
      extractionConfig,
    });
    const needsBroadDiscoveryRetry = !discoveryReady && result.unresolvedSpeciesIds.length > 0;
    const needsExtractionRetry = result.extractionStatus === 'unavailable' && result.unresolvedSpeciesIds.length > 0;
    const retryReasons = [
      ...(needsBroadDiscoveryRetry ? ['broad_discovery_unavailable_with_unresolved_objects;academic_fallback:' + academicFallback.status] : []),
      ...(needsExtractionRetry ? ['identity_extractor_unavailable:' + (result.extractionErrorCode || 'unknown')] : []),
    ];
    resultByBase.set(group.baseScientificName, {
      ...result,
      status: retryReasons.length > 0 ? 'retry_required' : 'completed',
      errorCode: retryReasons.length > 0 ? retryReasons.join(';') : null,
    });
    consecutiveNetworkFailures = 0;
    console.log(
      'IDENTITY_BULK_VARIANT_DONE',
      group.baseScientificName,
      'candidates=' + result.candidates.length,
      'unresolved=' + result.unresolvedSpeciesIds.length,
    );
  } catch (error) {
    const errorCode = error instanceof Error
      ? error.message.replace(/\s+/g, ' ').slice(0, 240)
      : 'unknown_error';
    const normalizedError = errorCode.toLowerCase();
    const networkFailure = normalizedError.includes('provider request failed')
      || normalizedError.includes('network')
      || normalizedError.includes('fetch failed')
      || normalizedError.includes('timed out')
      || normalizedError.includes('rate limit');
    resultByBase.set(group.baseScientificName, {
      baseScientificName: group.baseScientificName,
      model: null,
      sources: [],
      candidates: [],
      unresolvedSpeciesIds: group.objects.map(object => object.speciesId),
      attemptedUrls: previousGroup?.attemptedUrls || [],
      sourceDiagnostics: previousGroup?.sourceDiagnostics || [],
      promotionAllowed: false,
      writesAuthority: false,
      status: networkFailure ? 'retry_required' : 'failed',
      errorCode,
    });
    consecutiveNetworkFailures = networkFailure ? consecutiveNetworkFailures + 1 : 0;
    if (!forceRetry && consecutiveNetworkFailures >= networkFailureThreshold) {
      providerCircuitOpen = true;
      console.log('IDENTITY_BULK_VARIANT_CIRCUIT_TRIPPED', 'failures=' + consecutiveNetworkFailures);
    }
    console.log('IDENTITY_BULK_VARIANT_FAILED', group.baseScientificName, errorCode);
  }

  writeReport();
  if (delayMs > 0) await sleep(delayMs);
}

const finalReport = writeReport();
console.log(JSON.stringify({
  output: outputPath,
  ...finalReport.summary,
  promotionAllowed: false,
  writesAuthority: false,
}, null, 2));

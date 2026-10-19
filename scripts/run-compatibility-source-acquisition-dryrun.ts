import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  acquireVerifiedCompatibilitySourcesDetailed,
  buildCompatibilityResearchProviderConfig,
  type CompatibilitySourceFetchDiagnostic,
} from '../apps/api/src/compatibility-species-research-provider';
import {
  buildCompatibilityTaxonResearchPlan,
  type CompatibilityTaxonResearchPlanItem,
} from '../src/services/compatibility/compatibility-field-coverage.service';
import { createGbifSpeciesIdentityResolver } from '../src/services/compatibility/gbif-species-identity.service';
import { resolveCompatibilityResearchIdentity } from '../src/services/compatibility/research-identity.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  const value = process.argv.find(item => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : undefined;
};

const unique = <T>(values: T[]) => [...new Set(values)];

const isAccessBlockedDiagnostic = (diagnostic: CompatibilitySourceFetchDiagnostic) => (
  diagnostic.status === 'network_error'
  || (diagnostic.status === 'http_error'
    && diagnostic.httpStatus != null
    && (diagnostic.httpStatus === 403 || diagnostic.httpStatus === 429 || diagnostic.httpStatus >= 500))
);

type SourceAcquisitionResult = {
  researchKey: string;
  scientificName: string;
  researchDisposition: CompatibilityTaxonResearchPlanItem['researchDisposition'];
  catalogObjectCount: number;
  requestedGapFields: string[];
  status: 'verified_sources_found' | 'source_access_blocked' | 'no_verified_source' | 'identity_hold' | 'fetch_error';
  identityStatus: string;
  sourceCount: number;
  sourcePublishers: string[];
  sourceUrls: string[];
  sourceDiagnostics: CompatibilitySourceFetchDiagnostic[];
  elapsedMs: number;
  reasonCodes: string[];
};

const main = async () => {
  const allJobs = buildCompatibilityTaxonResearchPlan();
  const offset = Math.max(0, Math.min(allJobs.length, Number(arg('offset') || 0)));
  const remaining = Math.max(0, allJobs.length - offset);
  const limit = Math.max(1, Math.min(remaining || 1, Number(arg('limit') || remaining || 1)));
  const concurrency = Math.max(1, Math.min(12, Number(arg('concurrency') || 8)));
  const output = arg('output') || 'evaluation/reports/compatibility-source-acquisition-dryrun.json';
  const jobs = allJobs.slice(offset, offset + limit);
  const identityResolver = createGbifSpeciesIdentityResolver();
  const sourceConfig = {
    ...buildCompatibilityResearchProviderConfig(),
    timeoutMs: Math.max(2_000, Math.min(12_000, Number(arg('timeout-ms') || 8_000))),
  };
  const results: SourceAcquisitionResult[] = new Array(jobs.length);
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= jobs.length) return;
      const job = jobs[index];
      const started = Date.now();
      const scientificName = job.baseScientificName || '';
      if (!scientificName) {
        results[index] = {
          researchKey: job.researchKey,
          scientificName,
          researchDisposition: job.researchDisposition,
          catalogObjectCount: job.catalogObjectCount,
          requestedGapFields: job.combinedGapFields,
          status: 'identity_hold',
          identityStatus: 'unresolved',
          sourceCount: 0,
          sourcePublishers: [],
          sourceUrls: [],
          sourceDiagnostics: [],
          elapsedMs: Date.now() - started,
          reasonCodes: ['research_plan_identity_unresolved'],
        };
        continue;
      }

      try {
        const identity = await resolveCompatibilityResearchIdentity(job, identityResolver);
        if (identity.status !== 'verified') {
          results[index] = {
            researchKey: job.researchKey,
            scientificName,
            researchDisposition: job.researchDisposition,
            catalogObjectCount: job.catalogObjectCount,
            requestedGapFields: job.combinedGapFields,
            status: 'identity_hold',
            identityStatus: identity.status,
            sourceCount: 0,
            sourcePublishers: [],
            sourceUrls: [],
            sourceDiagnostics: [],
            elapsedMs: Date.now() - started,
            reasonCodes: [identity.reasonCode || 'identity_unresolved'],
          };
          continue;
        }

        const acquisition = await acquireVerifiedCompatibilitySourcesDetailed({ scientificName }, sourceConfig);
        const sources = acquisition.sources;
        const accessBlocked = sources.length === 0 && acquisition.diagnostics.some(isAccessBlockedDiagnostic);
        results[index] = {
          researchKey: job.researchKey,
          scientificName,
          researchDisposition: job.researchDisposition,
          catalogObjectCount: job.catalogObjectCount,
          requestedGapFields: job.combinedGapFields,
          status: sources.length > 0 ? 'verified_sources_found' : accessBlocked ? 'source_access_blocked' : 'no_verified_source',
          identityStatus: identity.status,
          sourceCount: sources.length,
          sourcePublishers: unique(sources.map(source => source.publisher)),
          sourceUrls: sources.map(source => source.url),
          sourceDiagnostics: acquisition.diagnostics,
          elapsedMs: Date.now() - started,
          reasonCodes: sources.length > 0
            ? []
            : accessBlocked
              ? ['trusted_source_access_blocked']
              : ['trusted_exact_taxon_source_not_verified'],
        };
      } catch (error) {
        results[index] = {
          researchKey: job.researchKey,
          scientificName,
          researchDisposition: job.researchDisposition,
          catalogObjectCount: job.catalogObjectCount,
          requestedGapFields: job.combinedGapFields,
          status: 'fetch_error',
          identityStatus: 'provider_error',
          sourceCount: 0,
          sourcePublishers: [],
          sourceUrls: [],
          sourceDiagnostics: [],
          elapsedMs: Date.now() - started,
          reasonCodes: [error instanceof Error ? error.message : String(error)],
        };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, jobs.length)) }, () => worker()));

  const withSources = results.filter(result => result.status === 'verified_sources_found');
  const exactWithSources = withSources.filter(result => result.researchDisposition === 'exact_taxon_research');
  const variantBridgeWithSources = withSources.filter(result => result.researchDisposition === 'base_taxon_candidate_research_with_variant_bridge');
  const publisherStats: Record<string, number> = {};
  for (const result of withSources) {
    for (const publisher of result.sourcePublishers) publisherStats[publisher] = (publisherStats[publisher] || 0) + 1;
  }
  const report = {
    generatedAt: new Date().toISOString(),
    writesAuthority: false as const,
    stage: 'verified_source_acquisition' as const,
    offset,
    nextOffset: offset + jobs.length < allJobs.length ? offset + jobs.length : null,
    totalPlanJobs: allJobs.length,
    summary: {
      jobs: jobs.length,
      jobsWithVerifiedSource: withSources.length,
      jobsWithoutVerifiedSource: results.filter(result => result.status === 'no_verified_source').length,
      sourceAccessBlocked: results.filter(result => result.status === 'source_access_blocked').length,
      identityHolds: results.filter(result => result.status === 'identity_hold').length,
      fetchErrors: results.filter(result => result.status === 'fetch_error').length,
      totalVerifiedSources: withSources.reduce((sum, result) => sum + result.sourceCount, 0),
      exactCatalogObjectsWithVerifiedSources: exactWithSources.reduce((sum, result) => sum + result.catalogObjectCount, 0),
      variantCandidateCatalogObjectsWithVerifiedSources: variantBridgeWithSources.reduce((sum, result) => sum + result.catalogObjectCount, 0),
      catalogObjectsWithSourceCandidates: withSources.reduce((sum, result) => sum + result.catalogObjectCount, 0),
      publisherStats,
    },
    results,
  };

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ totalPlanJobs: allJobs.length, offset, nextOffset: report.nextOffset, ...report.summary }, null, 2));
  console.log(`SOURCE_ACQUISITION_REPORT=${output}`);
};

await main();

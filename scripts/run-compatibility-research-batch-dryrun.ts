import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

import { compatibilitySpeciesResearchProvider, getCompatibilitySpeciesResearchProviderReadiness } from '../apps/api/src/compatibility-species-research-provider';
import { buildCompatibilityTaxonResearchPlan, type CompatibilityTaxonResearchPlanItem } from '../src/services/compatibility/compatibility-field-coverage.service';
import { createGbifSpeciesIdentityResolver } from '../src/services/compatibility/gbif-species-identity.service';
import { resolveCompatibilityResearchIdentity } from '../src/services/compatibility/research-identity.service';
import {
  assessCompatibilitySpeciesResearchPacket,
  type CompatibilitySpeciesIdentityResolver,
  type CompatibilitySpeciesResearchProvider,
} from '../src/services/compatibility/species-onboarding-research.service';

type BatchResult = {
  researchKey: string;
  scientificName: string;
  disposition: CompatibilityTaxonResearchPlanItem['researchDisposition'];
  catalogObjectCount: number;
  requestedGapFields: string[];
  identityStatus: string;
  sourceCount: number;
  sourcePublishers: string[];
  sourceUrls: string[];
  claimCount: number;
  supportedFields: string[];
  gapHits: string[];
  potentialCatalogFieldClosures: number;
  variantCandidateFieldHits: number;
  assessmentStatus: string;
  reasonCodes: string[];
  reviewCandidates: Array<{
    field: string;
    proposedValue: unknown;
    sourceIds: string[];
    sourceUrls: string[];
    notes: string[];
  }>;
  elapsedMs: number;
};

export type CompatibilityResearchBatchDryRun = {
  generatedAt: string;
  writesAuthority: false;
  summary: {
    jobs: number;
    exactJobs: number;
    variantBridgeJobs: number;
    identityHolds: number;
    providerErrors: number;
    jobsWithVerifiedSource: number;
    jobsWithAnyClaim: number;
    jobsWithAnyGapHit: number;
    exactJobsWithPotentialClosure: number;
    readyForReviewJobs: number;
    requestedCatalogFieldGaps: number;
    potentialCatalogFieldClosures: number;
    variantCandidateFieldHits: number;
    fieldStats: Record<string, { requestedCatalogGaps: number; potentialClosures: number; variantCandidateHits: number }>;
    publisherStats: Record<string, number>;
  };
  results: BatchResult[];
};

const unique = <T>(values: T[]) => [...new Set(values)];

export const summarizeCompatibilityResearchDryRun = (
  jobs: CompatibilityTaxonResearchPlanItem[],
  results: BatchResult[],
): CompatibilityResearchBatchDryRun['summary'] => {
  const fieldStats: CompatibilityResearchBatchDryRun['summary']['fieldStats'] = {};
  const publisherStats: Record<string, number> = {};
  let requestedCatalogFieldGaps = 0;
  let potentialCatalogFieldClosures = 0;
  let variantCandidateFieldHits = 0;

  jobs.forEach((job, index) => {
    const result = results[index];
    for (const object of job.catalogObjects) {
      const requestedFields = object.isVariant ? object.baseTaxonCandidateGaps : object.gaps;
      for (const field of requestedFields) {
        requestedCatalogFieldGaps += 1;
        fieldStats[field] ??= { requestedCatalogGaps: 0, potentialClosures: 0, variantCandidateHits: 0 };
        fieldStats[field].requestedCatalogGaps += 1;
        if (!result?.gapHits.includes(field)) continue;
        if (object.isVariant) {
          variantCandidateFieldHits += 1;
          fieldStats[field].variantCandidateHits += 1;
        } else {
          potentialCatalogFieldClosures += 1;
          fieldStats[field].potentialClosures += 1;
        }
      }
    }
    for (const publisher of result?.sourcePublishers ?? []) {
      publisherStats[publisher] = (publisherStats[publisher] || 0) + 1;
    }
  });

  return {
    jobs: jobs.length,
    exactJobs: jobs.filter(job => job.researchDisposition === 'exact_taxon_research').length,
    variantBridgeJobs: jobs.filter(job => job.researchDisposition === 'base_taxon_candidate_research_with_variant_bridge').length,
    identityHolds: results.filter(result => result.identityStatus !== 'verified').length,
    providerErrors: results.filter(result => result.assessmentStatus === 'provider_error').length,
    jobsWithVerifiedSource: results.filter(result => result.sourceCount > 0).length,
    jobsWithAnyClaim: results.filter(result => result.claimCount > 0).length,
    jobsWithAnyGapHit: results.filter(result => result.gapHits.length > 0).length,
    exactJobsWithPotentialClosure: results.filter(result => result.disposition === 'exact_taxon_research' && result.potentialCatalogFieldClosures > 0).length,
    readyForReviewJobs: results.filter(result => result.assessmentStatus === 'ready_for_review').length,
    requestedCatalogFieldGaps,
    potentialCatalogFieldClosures,
    variantCandidateFieldHits,
    fieldStats,
    publisherStats,
  };
};

export const runCompatibilityResearchBatchDryRun = async ({
  jobs,
  identityResolver,
  researchProvider,
  concurrency = 4,
}: {
  jobs: CompatibilityTaxonResearchPlanItem[];
  identityResolver: CompatibilitySpeciesIdentityResolver;
  researchProvider: CompatibilitySpeciesResearchProvider;
  concurrency?: number;
}): Promise<CompatibilityResearchBatchDryRun> => {
  const results: BatchResult[] = new Array(jobs.length);
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= jobs.length) return;
      const job = jobs[index];
      const scientificName = job.baseScientificName;
      const started = Date.now();
      if (!scientificName) {
        results[index] = {
          researchKey: job.researchKey,
          scientificName: '',
          disposition: job.researchDisposition,
          catalogObjectCount: job.catalogObjectCount,
          requestedGapFields: job.combinedGapFields,
          identityStatus: 'unresolved',
          sourceCount: 0,
          sourcePublishers: [],
          sourceUrls: [],
          claimCount: 0,
          supportedFields: [],
          gapHits: [],
          potentialCatalogFieldClosures: 0,
          variantCandidateFieldHits: 0,
          assessmentStatus: 'identity_hold',
          reasonCodes: ['research_plan_identity_unresolved'],
          reviewCandidates: [],
          elapsedMs: Date.now() - started,
        };
        continue;
      }

      try {
        const identity = await resolveCompatibilityResearchIdentity(job, identityResolver);
        if (identity.status !== 'verified') {
          results[index] = {
            researchKey: job.researchKey,
            scientificName,
            disposition: job.researchDisposition,
            catalogObjectCount: job.catalogObjectCount,
            requestedGapFields: job.combinedGapFields,
            identityStatus: identity.status,
            sourceCount: 0,
            sourcePublishers: [],
            sourceUrls: [],
            claimCount: 0,
            supportedFields: [],
            gapHits: [],
            potentialCatalogFieldClosures: 0,
            variantCandidateFieldHits: 0,
            assessmentStatus: 'identity_hold',
            reasonCodes: [identity.reasonCode || 'identity_unresolved'],
            reviewCandidates: [],
            elapsedMs: Date.now() - started,
          };
          continue;
        }

        const packet = await researchProvider.research({
          catalogKey: job.researchKey.replace(/[^\w.-]+/g, '_').slice(0, 160),
          scientificName,
          commonName: job.catalogObjects[0]?.name,
          targetFields: job.combinedGapFields,
        });
        const assessment = assessCompatibilitySpeciesResearchPacket(packet);
        const supportedFields = assessment.fieldResolutions
          .filter(field => field.status === 'supported')
          .map(field => field.field);
        const gapHits = job.combinedGapFields.filter(field => supportedFields.includes(field));
        const sourceUrlById = new Map(packet.sources.map(source => [source.id, source.url] as const));
        const reviewCandidates = assessment.fieldResolutions
          .filter(field => field.status === 'supported' && gapHits.includes(field.field))
          .map(field => ({
            field: field.field,
            proposedValue: field.proposedValue,
            sourceIds: field.sourceIds,
            sourceUrls: field.sourceIds.map(id => sourceUrlById.get(id)).filter((url): url is string => Boolean(url)),
            notes: field.notes,
          }));
        const potentialCatalogFieldClosures = job.catalogObjects.reduce((count, object) => (
          count + (object.isVariant ? 0 : object.gaps.filter(field => gapHits.includes(field)).length)
        ), 0);
        const variantCandidateFieldHits = job.catalogObjects.reduce((count, object) => (
          count + (object.isVariant ? object.baseTaxonCandidateGaps.filter(field => gapHits.includes(field)).length : 0)
        ), 0);
        results[index] = {
          researchKey: job.researchKey,
          scientificName,
          disposition: job.researchDisposition,
          catalogObjectCount: job.catalogObjectCount,
          requestedGapFields: job.combinedGapFields,
          identityStatus: identity.status,
          sourceCount: packet.sources.length,
          sourcePublishers: unique(packet.sources.map(source => source.publisher)),
          sourceUrls: packet.sources.map(source => source.url),
          claimCount: packet.claims.length,
          supportedFields,
          gapHits,
          potentialCatalogFieldClosures,
          variantCandidateFieldHits,
          assessmentStatus: assessment.status,
          reasonCodes: assessment.reasonCodes,
          reviewCandidates,
          elapsedMs: Date.now() - started,
        };
      } catch (error) {
        results[index] = {
          researchKey: job.researchKey,
          scientificName,
          disposition: job.researchDisposition,
          catalogObjectCount: job.catalogObjectCount,
          requestedGapFields: job.combinedGapFields,
          identityStatus: 'provider_error',
          sourceCount: 0,
          sourcePublishers: [],
          sourceUrls: [],
          claimCount: 0,
          supportedFields: [],
          gapHits: [],
          potentialCatalogFieldClosures: 0,
          variantCandidateFieldHits: 0,
          assessmentStatus: 'provider_error',
          reasonCodes: [error instanceof Error ? error.message : String(error)],
          reviewCandidates: [],
          elapsedMs: Date.now() - started,
        };
      }
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, jobs.length || 1)) }, () => worker()));
  return {
    generatedAt: new Date().toISOString(),
    writesAuthority: false,
    summary: summarizeCompatibilityResearchDryRun(jobs, results),
    results,
  };
};

const arg = (name: string) => {
  const prefix = `--${name}=`;
  const value = process.argv.find(item => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : undefined;
};

const main = async () => {
  const readiness = getCompatibilitySpeciesResearchProviderReadiness();
  if (!readiness.configured) throw new Error('compatibility_research_provider_not_configured');
  const allJobs = buildCompatibilityTaxonResearchPlan();
  const offset = Math.max(0, Math.min(allJobs.length, Number(arg('offset') || 0)));
  const remaining = Math.max(0, allJobs.length - offset);
  const limit = Math.max(1, Math.min(remaining || 1, Number(arg('limit') || remaining || 1)));
  const concurrency = Math.max(1, Math.min(8, Number(arg('concurrency') || 4)));
  const output = arg('output') || 'evaluation/reports/compatibility-research-dryrun.json';
  const jobs = allJobs.slice(offset, offset + limit);
  console.log(JSON.stringify({ readiness, jobs: jobs.length, totalPlanJobs: allJobs.length, offset, limit, concurrency, writesAuthority: false }, null, 2));
  const report = await runCompatibilityResearchBatchDryRun({
    jobs,
    identityResolver: createGbifSpeciesIdentityResolver(),
    researchProvider: compatibilitySpeciesResearchProvider,
    concurrency,
  });
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`DRY_RUN_REPORT=${output}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

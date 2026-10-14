import {
  compatibilitySpeciesResearchProvider,
  getCompatibilitySpeciesResearchProviderReadiness,
  type CompatibilityResearchProviderReadiness,
} from './compatibility-species-research-provider';
import { createGbifSpeciesIdentityResolver } from '../../../src/services/compatibility/gbif-species-identity.service';
import { researchAndAssessCompatibilitySpeciesDetailed } from '../../../src/services/compatibility/species-onboarding-research.service';
import { buildCompatibilityTaxonResearchPlan } from '../../../src/services/compatibility/compatibility-field-coverage.service';

export type CompatibilityResearchBatchPreviewInput = {
  offset: number;
  limit: number;
  concurrency: number;
};

export type CompatibilityResearchBatchPreviewResult = {
  status: 'research_batch_assessed' | 'provider_unavailable';
  provider: CompatibilityResearchProviderReadiness;
  offset: number;
  nextOffset: number | null;
  totalPlanJobs: number;
  processedJobs: number;
  summary: {
    readyForReview: number;
    researchPending: number;
    terminalHold: number;
    identityHolds: number;
    providerErrors: number;
  };
  results: Array<Record<string, unknown>>;
  writesAuthority: false;
};

export const runCompatibilityResearchBatchPreview = async (
  input: CompatibilityResearchBatchPreviewInput,
): Promise<CompatibilityResearchBatchPreviewResult> => {
  const readiness = getCompatibilitySpeciesResearchProviderReadiness();
  const allJobs = buildCompatibilityTaxonResearchPlan();
  const offset = Math.min(Math.max(0, input.offset), allJobs.length);
  const limit = Math.max(1, Math.min(4, input.limit));
  const concurrency = Math.max(1, Math.min(2, input.concurrency));

  if (!readiness.configured) {
    return {
      status: 'provider_unavailable',
      provider: readiness,
      offset,
      nextOffset: offset < allJobs.length ? offset : null,
      totalPlanJobs: allJobs.length,
      processedJobs: 0,
      summary: {
        readyForReview: 0,
        researchPending: 0,
        terminalHold: 0,
        identityHolds: 0,
        providerErrors: 0,
      },
      results: [],
      writesAuthority: false,
    };
  }

  const jobs = allJobs.slice(offset, offset + limit);
  const results: Array<Record<string, unknown>> = new Array(jobs.length);
  const identityResolver = createGbifSpeciesIdentityResolver();
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= jobs.length) return;
      const job = jobs[index];
      const baseResult = {
        researchKey: job.researchKey,
        scientificName: job.baseScientificName,
        researchDisposition: job.researchDisposition,
        catalogObjects: job.catalogObjects,
        requestedGapFields: job.combinedGapFields,
      };

      if (!job.baseScientificName) {
        results[index] = {
          ...baseResult,
          status: 'identity_hold',
          reasonCodes: ['research_plan_identity_unresolved'],
        };
        continue;
      }

      try {
        const identity = await identityResolver.resolve(job.baseScientificName);
        if (identity.status !== 'verified') {
          results[index] = {
            ...baseResult,
            status: 'identity_hold',
            identity,
            reasonCodes: [identity.reasonCode],
          };
          continue;
        }

        const detailed = await researchAndAssessCompatibilitySpeciesDetailed(
          compatibilitySpeciesResearchProvider,
          {
            catalogKey: job.researchKey.replace(/[^\w.-]+/g, '_').slice(0, 160),
            scientificName: job.baseScientificName,
            commonName: job.catalogObjects[0]?.name,
          },
        );
        results[index] = {
          ...baseResult,
          status: 'research_assessed',
          identity,
          ...detailed,
        };
      } catch (error) {
        results[index] = {
          ...baseResult,
          status: 'provider_error',
          reasonCodes: [error instanceof Error ? error.message : 'compatibility_research_failed'],
        };
      }
    }
  };

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, Math.max(1, jobs.length)) },
      () => worker(),
    ),
  );

  const assessed = results.filter(item => item.status === 'research_assessed');
  const readyForReview = assessed.filter(
    item => (item.assessment as { status?: string } | undefined)?.status === 'ready_for_review',
  ).length;
  const researchPending = assessed.filter(
    item => (item.assessment as { status?: string } | undefined)?.status === 'research_pending',
  ).length;
  const terminalHold = assessed.filter(
    item => (item.assessment as { status?: string } | undefined)?.status === 'terminal_hold',
  ).length;
  const nextOffset = offset + jobs.length < allJobs.length ? offset + jobs.length : null;

  return {
    status: 'research_batch_assessed',
    provider: readiness,
    offset,
    nextOffset,
    totalPlanJobs: allJobs.length,
    processedJobs: jobs.length,
    summary: {
      readyForReview,
      researchPending,
      terminalHold,
      identityHolds: results.filter(item => item.status === 'identity_hold').length,
      providerErrors: results.filter(item => item.status === 'provider_error').length,
    },
    results,
    writesAuthority: false,
  };
};

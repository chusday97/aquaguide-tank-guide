import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  getCompatibilitySpeciesResearchProviderReadiness,
  researchCompatibilityGenusAuthority,
} from '../apps/api/src/compatibility-species-research-provider';
import {
  assessCompatibilityGenusAuthorityResearchResult,
  buildCompatibilityGenusAuthorityResearchPlan,
} from '../src/services/compatibility/taxon-authority-research.service';

const arg = (name: string) => {
  const prefix = '--' + name + '=';
  const value = process.argv.find(item => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : undefined;
};

export const runCompatibilityGenusAuthorityDryRun = async ({
  offset = 0,
  limit,
  concurrency = 2,
}: {
  offset?: number;
  limit?: number;
  concurrency?: number;
} = {}) => {
  const plan = buildCompatibilityGenusAuthorityResearchPlan();
  const safeOffset = Math.max(0, Math.min(plan.length, offset));
  const remaining = Math.max(0, plan.length - safeOffset);
  const safeLimit = Math.max(0, Math.min(remaining, limit ?? remaining));
  const jobs = plan.slice(safeOffset, safeOffset + safeLimit);
  const results: Array<{
    genus: string;
    targetFields: string[];
    impactedSpeciesIds: string[];
    researchStatus: string;
    assessmentStatus: string;
    reasonCodes: string[];
    sourceCount: number;
    candidateFields: string[];
    unresolvedFields: string[];
    reviewCandidateFields: string[];
    writesAuthority: false;
  }> = new Array(jobs.length);

  let cursor = 0;
  const worker = async () => {
    while (true) {
      const index = cursor++;
      if (index >= jobs.length) return;
      const job = jobs[index]!;
      try {
        const research = await researchCompatibilityGenusAuthority({
          genus: job.genus,
          targetFields: job.targetFields,
        });
        const assessment = assessCompatibilityGenusAuthorityResearchResult(research);
        results[index] = {
          genus: job.genus,
          targetFields: [...job.targetFields],
          impactedSpeciesIds: [...job.impactedSpeciesIds],
          researchStatus: research.discoveryStatus,
          assessmentStatus: assessment.status,
          reasonCodes: [...assessment.reasonCodes],
          sourceCount: research.sources.length,
          candidateFields: [...new Set(research.fieldCandidates.map(candidate => candidate.field))],
          unresolvedFields: [...research.unresolvedFields],
          reviewCandidateFields: assessment.reviewCandidates.map(candidate => candidate.field),
          writesAuthority: false,
        };
      } catch (error) {
        results[index] = {
          genus: job.genus,
          targetFields: [...job.targetFields],
          impactedSpeciesIds: [...job.impactedSpeciesIds],
          researchStatus: 'provider_error',
          assessmentStatus: 'research_pending',
          reasonCodes: [error instanceof Error ? error.message : String(error)],
          sourceCount: 0,
          candidateFields: [],
          unresolvedFields: [...job.targetFields],
          reviewCandidateFields: [],
          writesAuthority: false,
        };
      }
    }
  };

  const workerCount = Math.max(1, Math.min(4, Math.floor(concurrency), jobs.length || 1));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return {
    generatedAt: new Date().toISOString(),
    writesAuthority: false as const,
    planSize: plan.length,
    offset: safeOffset,
    jobCount: jobs.length,
    summary: {
      jobs: jobs.length,
      readyForReview: results.filter(result => result.assessmentStatus === 'ready_for_review').length,
      researchPending: results.filter(result => result.assessmentStatus === 'research_pending').length,
      terminalHold: results.filter(result => result.assessmentStatus === 'terminal_hold').length,
      providerErrors: results.filter(result => result.researchStatus === 'provider_error').length,
      verifiedSourceJobs: results.filter(result => result.sourceCount > 0).length,
      reviewCandidateFields: results.reduce((count, result) => count + result.reviewCandidateFields.length, 0),
      impactedSpecies: new Set(results.flatMap(result => result.impactedSpeciesIds)).size,
    },
    results,
  };
};

const main = async () => {
  const readiness = getCompatibilitySpeciesResearchProviderReadiness();
  if (!readiness.configured) throw new Error('compatibility_research_provider_not_configured');

  const allJobs = buildCompatibilityGenusAuthorityResearchPlan();
  const offset = Math.max(0, Math.min(allJobs.length, Number(arg('offset') || 0)));
  const remaining = Math.max(0, allJobs.length - offset);
  const limit = Math.max(1, Math.min(remaining || 1, Number(arg('limit') || remaining || 1)));
  const concurrency = Math.max(1, Math.min(4, Number(arg('concurrency') || 2)));
  const output = arg('output') || 'evaluation/reports/compatibility-genus-authority-dryrun.json';

  console.log(JSON.stringify({
    readiness: {
      configured: readiness.configured,
      providerId: readiness.providerId,
      host: readiness.host,
      model: readiness.model,
      fallbackModels: readiness.fallbackModels,
    },
    totalPlanJobs: allJobs.length,
    offset,
    limit,
    concurrency,
    writesAuthority: false,
  }, null, 2));

  const report = await runCompatibilityGenusAuthorityDryRun({ offset, limit, concurrency });
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report.summary, null, 2));
  console.log('DRY_RUN_REPORT=' + output);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}

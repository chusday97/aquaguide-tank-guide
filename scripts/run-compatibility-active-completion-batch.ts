import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { runCompatibilityResearchBatchPreview, type CompatibilityResearchWorkQueue } from '../apps/api/src/compatibility-research-batch';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const pageSize = Math.max(1, Math.min(4, Number(arg('page-size') || 4)));
const concurrency = Math.max(1, Math.min(2, Number(arg('concurrency') || 2)));
const maxJobs = Math.max(1, Number(arg('max-jobs') || 999));
const output = arg('output') || 'evaluation/reports/compatibility-active-completion-batch.json';
let offset = 0;
let processed = 0;
const pages = [];
const totals: Record<CompatibilityResearchWorkQueue, number> = {
  manual_review: 0,
  gap_review: 0,
  extraction_retry: 0,
  evidence_gap: 0,
  identity_review: 0,
  provider_retry: 0,
  terminal_hold: 0,
};

while (processed < maxJobs) {
  const result = await runCompatibilityResearchBatchPreview({
    offset,
    limit: Math.min(pageSize, maxJobs - processed),
    concurrency,
    queueMode: 'active_completion',
  });
  if (result.status === 'provider_unavailable') {
    throw new Error('compatibility_research_provider_not_configured');
  }
  pages.push(result);
  processed += result.processedJobs;
  for (const [queue, count] of Object.entries(result.summary.workQueues)) {
    totals[queue as CompatibilityResearchWorkQueue] += count;
  }
  if (result.nextOffset === null || result.processedJobs === 0) break;
  offset = result.nextOffset;
}

const report = {
  generatedAt: new Date().toISOString(),
  queueMode: 'active_completion' as const,
  writesAuthority: false as const,
  processedJobs: processed,
  totalActiveJobs: pages[0]?.totalPlanJobs ?? 0,
  sourcePlanJobs: pages[0]?.sourcePlanJobs ?? 0,
  workQueues: totals,
  pages,
};
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  processedJobs: report.processedJobs,
  totalActiveJobs: report.totalActiveJobs,
  sourcePlanJobs: report.sourcePlanJobs,
  workQueues: report.workQueues,
  writesAuthority: false,
}, null, 2));
console.log(`ACTIVE_COMPLETION_REPORT=${output}`);

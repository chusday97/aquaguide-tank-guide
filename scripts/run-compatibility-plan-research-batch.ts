import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { probeCompatibilityResearchProvider } from '../apps/api/src/compatibility-species-research-provider';
import {
  runCompatibilityResearchBatchPreview,
  type CompatibilityResearchWorkQueue,
} from '../apps/api/src/compatibility-research-batch';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const pageSize = Math.max(1, Math.min(4, Number(arg('page-size') || 4)));
const concurrency = Math.max(1, Math.min(2, Number(arg('concurrency') || 2)));
const maxJobs = Math.max(1, Number(arg('max-jobs') || 999));
const startOffset = Math.max(0, Number(arg('offset') || 0));
const output = arg('output') || 'evaluation/reports/compatibility-plan-research-batch.json';
const requestedMode = arg('extraction-mode');
const preflight = await probeCompatibilityResearchProvider();
const extractionMode = requestedMode === 'source_only'
  ? 'source_only' as const
  : requestedMode === 'normal'
    ? 'normal' as const
    : preflight.status === 'ready'
      ? 'normal' as const
      : 'source_only' as const;

let offset = startOffset;
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
mkdirSync(dirname(output), { recursive: true });

const buildReport = (complete: boolean) => ({
  generatedAt: new Date().toISOString(),
  kind: 'compatibility_plan_research_batch' as const,
  queueMode: 'plan' as const,
  extractionMode,
  startOffset,
  nextOffset: complete ? null : offset,
  complete,
  providerPreflight: preflight,
  writesAuthority: false as const,
  processedJobs: processed,
  totalPlanJobs: pages[0]?.totalPlanJobs ?? 0,
  sourcePlanJobs: pages[0]?.sourcePlanJobs ?? 0,
  workQueues: totals,
  resumableJobs: pages.flatMap(page => page.results).filter(result => (
    result.workItem
    && (result.workItem as { queue?: string }).queue === 'extraction_retry'
    && result.resumeBundle
  )).length,
  pages,
});

while (processed < maxJobs) {
  const result = await runCompatibilityResearchBatchPreview({
    offset,
    limit: Math.min(pageSize, maxJobs - processed),
    concurrency,
    queueMode: 'plan',
    extractionMode,
    captureResume: true,
  });
  if (result.status === 'provider_unavailable' && extractionMode === 'normal') {
    throw new Error('compatibility_research_provider_not_configured');
  }
  pages.push(result);
  processed += result.processedJobs;
  for (const [queue, count] of Object.entries(result.summary.workQueues)) {
    totals[queue as CompatibilityResearchWorkQueue] += count;
  }
  const nextOffset = result.nextOffset;
  if (nextOffset !== null && result.processedJobs > 0) offset = nextOffset;
  writeFileSync(output, JSON.stringify(buildReport(nextOffset === null || result.processedJobs === 0), null, 2) + '\n');
  console.log(`PLAN_RESEARCH_CHECKPOINT offset=${offset} processed=${processed}`);
  if (nextOffset === null || result.processedJobs === 0) break;
}

const report = buildReport(true);
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  providerPreflight: report.providerPreflight,
  extractionMode: report.extractionMode,
  processedJobs: report.processedJobs,
  totalPlanJobs: report.totalPlanJobs,
  sourcePlanJobs: report.sourcePlanJobs,
  resumableJobs: report.resumableJobs,
  workQueues: report.workQueues,
  writesAuthority: false,
}, null, 2));
console.log(`PLAN_RESEARCH_REPORT=${output}`);

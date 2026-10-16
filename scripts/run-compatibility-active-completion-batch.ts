import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { probeCompatibilityResearchProvider } from '../apps/api/src/compatibility-species-research-provider';
import { runCompatibilityResearchBatchPreview, type CompatibilityResearchWorkQueue } from '../apps/api/src/compatibility-research-batch';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const pageSize = Math.max(1, Math.min(4, Number(arg('page-size') || 4)));
const concurrency = Math.max(1, Math.min(2, Number(arg('concurrency') || 2)));
const maxJobs = Math.max(1, Number(arg('max-jobs') || 999));
const startOffset = Math.max(0, Number(arg('offset') || 0));
const output = arg('output') || 'evaluation/reports/compatibility-active-completion-batch.json';
const reviewQueuePath = arg('review-queue') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const includePersistedReview = arg('include-persisted-review') === 'true';
type PersistedReviewQueueItem = { queue?: string; researchKey?: string };
const persistedReviewItems: PersistedReviewQueueItem[] = existsSync(reviewQueuePath)
  ? (JSON.parse(readFileSync(reviewQueuePath, 'utf8')).items || []) as PersistedReviewQueueItem[]
  : [];
const evidenceCeilingResearchKeys = [...new Set(persistedReviewItems
  .filter(item => item.queue === 'evidence_ceiling_review')
  .map(item => item.researchKey)
  .filter((value): value is string => typeof value === 'string' && value.length > 0))];
const persistedReviewResearchKeys = includePersistedReview
  ? []
  : [...new Set(persistedReviewItems
    .map(item => item.researchKey)
    .filter((value): value is string => typeof value === 'string' && value.length > 0))];
const preflight = await probeCompatibilityResearchProvider();
const extractionMode = preflight.status === 'ready' ? 'normal' as const : 'source_only' as const;
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
  queueMode: 'active_completion' as const,
  extractionMode,
  reviewQueuePath,
  evidenceCeilingExcluded: evidenceCeilingResearchKeys.length,
  persistedReviewExcluded: persistedReviewResearchKeys.length,
  startOffset,
  nextOffset: complete ? null : offset,
  complete,
  providerPreflight: preflight,
  writesAuthority: false as const,
  processedJobs: processed,
  totalActiveJobs: pages[0]?.totalPlanJobs ?? 0,
  sourcePlanJobs: pages[0]?.sourcePlanJobs ?? 0,
  workQueues: totals,
  resumableJobs: pages.flatMap(page => page.results).filter(result => (
    result.workItem && (result.workItem as { queue?: string }).queue === 'extraction_retry' && result.resumeBundle
  )).length,
  pages,
});

while (processed < maxJobs) {
  const result = await runCompatibilityResearchBatchPreview({
    offset,
    limit: Math.min(pageSize, maxJobs - processed),
    concurrency,
    queueMode: 'active_completion',
    extractionMode,
    captureResume: true,
    excludeResearchKeys: persistedReviewResearchKeys,
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
  console.log(`ACTIVE_COMPLETION_CHECKPOINT offset=${offset} processed=${processed}`);
  if (nextOffset === null || result.processedJobs === 0) break;
}

const report = buildReport(true);
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  providerPreflight: report.providerPreflight,
  extractionMode: report.extractionMode,
  evidenceCeilingExcluded: report.evidenceCeilingExcluded,
  persistedReviewExcluded: report.persistedReviewExcluded,
  startOffset: report.startOffset,
  processedJobs: report.processedJobs,
  totalActiveJobs: report.totalActiveJobs,
  sourcePlanJobs: report.sourcePlanJobs,
  resumableJobs: report.resumableJobs,
  workQueues: report.workQueues,
  writesAuthority: false,
}, null, 2));
console.log(`ACTIVE_COMPLETION_REPORT=${output}`);

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { probeCompatibilityResearchProvider, type CompatibilityResearchDiscoveryContext } from '../apps/api/src/compatibility-species-research-provider';
import { runCompatibilityResearchBatchPreview, type CompatibilityResearchWorkQueue } from '../apps/api/src/compatibility-research-batch';
import { buildCompatibilityResearchReviewManifest, type CompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';
import { buildCompatibilitySpecializedSourceRoutes } from '../src/services/compatibility/source-strategy-resolver.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const queuePath = arg('queue') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const output = arg('output') || 'evaluation/reports/compatibility-source-strategy-review.json';
const queueOutput = arg('queue-output') || queuePath;
const pageSize = Math.max(1, Math.min(3, Number(arg('page-size') || 3)));
const concurrency = Math.max(1, Math.min(2, Number(arg('concurrency') || 2)));
const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as CompatibilityResearchReviewManifest;
const strategyItems = queue.items.filter(item => item.queue === 'source_strategy_review');
const researchKeys = strategyItems.map(item => item.researchKey);

const allowedResearchSourceTypes = new Set([
  'government',
  'peer_reviewed',
  'university',
  'professional_association',
  'curated_husbandry',
] as const);
const isResearchSourceType = (value: string): value is NonNullable<CompatibilityResearchDiscoveryContext['attemptedSourceTypes']>[number] => (
  allowedResearchSourceTypes.has(value as NonNullable<CompatibilityResearchDiscoveryContext['attemptedSourceTypes']>[number])
);

const discoveryContextByResearchKey: Record<string, CompatibilityResearchDiscoveryContext> = Object.fromEntries(strategyItems.map(item => [
  item.researchKey,
  {
    attemptedUrls: item.researchHistory.attemptedUrls,
    attemptedSourceTypes: item.researchHistory.attemptedSourceTypes.filter(isResearchSourceType),
    round: item.researchHistory.rounds,
    specializedRoutes: buildCompatibilitySpecializedSourceRoutes(item.unresolvedFields, item.researchHistory.attemptedRouteIds || []),
  },
]));

const emptyRouteKeys = researchKeys.filter(key => (discoveryContextByResearchKey[key]?.specializedRoutes || []).length === 0);
if (emptyRouteKeys.length > 0) throw new Error('source_strategy_queue_contains_exhausted_routes:' + emptyRouteKeys.join(','));

const preflight = await probeCompatibilityResearchProvider();
if (preflight.status !== 'ready') throw new Error('compatibility_source_strategy_provider_not_ready:' + preflight.status);

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
mkdirSync(dirname(output), { recursive: true });

const buildReport = (complete: boolean) => ({
  generatedAt: new Date().toISOString(),
  queueMode: 'active_completion' as const,
  sourceStrategyReview: true as const,
  sourceQueue: queuePath,
  researchKeys,
  discoveryContextByResearchKey,
  extractionMode: 'normal' as const,
  providerPreflight: preflight,
  writesAuthority: false as const,
  processedJobs: processed,
  totalTargetJobs: researchKeys.length,
  nextOffset: complete ? null : offset,
  complete,
  workQueues: totals,
  pages,
});

while (processed < researchKeys.length) {
  const result = await runCompatibilityResearchBatchPreview({
    offset,
    limit: Math.min(pageSize, researchKeys.length - processed),
    concurrency,
    queueMode: 'active_completion',
    extractionMode: 'normal',
    captureResume: true,
    researchKeys,
    discoveryContextByResearchKey,
  });
  if (result.status === 'provider_unavailable') throw new Error('compatibility_source_strategy_provider_unavailable');
  pages.push(result);
  processed += result.processedJobs;
  for (const [workQueue, count] of Object.entries(result.summary.workQueues)) {
    totals[workQueue as CompatibilityResearchWorkQueue] += count;
  }
  const nextOffset = result.nextOffset;
  if (nextOffset !== null && result.processedJobs > 0) offset = nextOffset;
  writeFileSync(output, JSON.stringify(buildReport(nextOffset === null || result.processedJobs === 0), null, 2) + '\n');
  console.log(`SOURCE_STRATEGY_CHECKPOINT offset=${offset} processed=${processed}`);
  if (nextOffset === null || result.processedJobs === 0) break;
}

const report = buildReport(true);
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
const refreshed = buildCompatibilityResearchReviewManifest(
  [{ sourcePath: output, report }],
  new Date().toISOString(),
  queue,
);
mkdirSync(dirname(queueOutput), { recursive: true });
writeFileSync(queueOutput, JSON.stringify(refreshed, null, 2) + '\n');

console.log(JSON.stringify({
  sourceQueue: queuePath,
  report: output,
  refreshedQueue: queueOutput,
  selectedJobs: researchKeys.length,
  processedJobs: processed,
  workQueues: totals,
  refreshedSummary: refreshed.summary,
  writesAuthority: false,
  promotionAllowed: false,
}, null, 2));

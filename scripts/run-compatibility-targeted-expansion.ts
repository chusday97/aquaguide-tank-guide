import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { probeCompatibilityResearchProvider, type CompatibilityResearchDiscoveryContext } from '../apps/api/src/compatibility-species-research-provider';
import {
  runCompatibilityResearchBatchPreview,
  type CompatibilityResearchWorkQueue,
} from '../apps/api/src/compatibility-research-batch';
import { buildCompatibilityResearchReviewManifest, type CompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const queuePath = arg('queue') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const output = arg('output') || 'evaluation/reports/compatibility-targeted-expansion.json';
const queueOutput = arg('queue-output') || queuePath;
const pageSize = Math.max(1, Math.min(4, Number(arg('page-size') || 4)));
const concurrency = Math.max(1, Math.min(2, Number(arg('concurrency') || 2)));
const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as CompatibilityResearchReviewManifest;
const researchKeys = [...new Set((queue.items || [])
  .filter(item => item.queue === 'targeted_source_expansion' || item.queue === 'identity_provider_retry' || item.queue === 'source_snapshot_retry')
  .map(item => item.researchKey)
  .filter((value): value is string => typeof value === 'string' && value.length > 0))];


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

const discoveryContextByResearchKey = Object.fromEntries((queue.items || [])
  .filter(item => researchKeys.includes(item.researchKey))
  .map(item => [
    item.researchKey,
    {
      attemptedUrls: item.researchHistory?.attemptedUrls || item.verifiedSources.map(source => source.url),
      attemptedSourceTypes: (item.researchHistory?.attemptedSourceTypes || item.verifiedSources.map(source => source.sourceType)).filter(isResearchSourceType),
      round: item.researchHistory?.rounds || 0,
    },
  ]));

const preflight = await probeCompatibilityResearchProvider();
const extractionMode = preflight.status === 'ready' ? 'normal' as const : 'source_only' as const;
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
  targetedExpansion: true as const,
  sourceQueue: queuePath,
  researchKeys,
  discoveryContextByResearchKey,
  extractionMode,
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
    extractionMode,
    captureResume: true,
    researchKeys,
    discoveryContextByResearchKey,
  });
  if (result.status === 'provider_unavailable' && extractionMode === 'normal') {
    throw new Error('compatibility_research_provider_not_configured');
  }
  pages.push(result);
  processed += result.processedJobs;
  for (const [workQueue, count] of Object.entries(result.summary.workQueues)) {
    totals[workQueue as CompatibilityResearchWorkQueue] += count;
  }
  const nextOffset = result.nextOffset;
  if (nextOffset !== null && result.processedJobs > 0) offset = nextOffset;
  writeFileSync(output, JSON.stringify(buildReport(nextOffset === null || result.processedJobs === 0), null, 2) + '\n');
  console.log(`TARGETED_EXPANSION_CHECKPOINT offset=${offset} processed=${processed}`);
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

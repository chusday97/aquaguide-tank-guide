import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildCompatibilityResearchReviewManifest, type CompatibilityResearchReviewManifest } from '../src/services/compatibility/research-review-queue.service';
import { selectCompatibilityResearchBatchJobs } from '../apps/api/src/compatibility-research-batch';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const inputs = (arg('input') || 'evaluation/reports/compatibility-active-completion-batch.json')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const output = arg('output') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const basePath = arg('base');
const baseManifest = basePath ? JSON.parse(readFileSync(basePath, 'utf8')) as CompatibilityResearchReviewManifest : undefined;
const activeResearchKeys = new Set(
  selectCompatibilityResearchBatchJobs('active_completion').jobs.map(job => job.researchKey),
);
const reconciledBaseManifest = baseManifest
  ? {
    ...baseManifest,
    items: baseManifest.items.filter(item => activeResearchKeys.has(item.researchKey)),
  }
  : undefined;
const reports = inputs.map(sourcePath => ({
  sourcePath,
  report: JSON.parse(readFileSync(sourcePath, 'utf8')),
}));
const manifest = buildCompatibilityResearchReviewManifest(reports, new Date().toISOString(), reconciledBaseManifest);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({
  output,
  base: basePath || null,
  staleResolvedItemsPruned: (baseManifest?.items.length || 0) - (reconciledBaseManifest?.items.length || 0),
  ...manifest.summary,
  rawSourceTextCommitted: manifest.rawSourceTextCommitted,
  writesAuthority: manifest.writesAuthority,
  promotionAllowed: manifest.promotionAllowed,
}, null, 2));

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  buildCompatibilityResearchReviewManifest,
  reconcileCompatibilityResearchBatchReportToActiveScopes,
  reconcileCompatibilityResearchReviewManifestToActiveScopes,
  type CompatibilityResearchBatchReport,
  type CompatibilityResearchReviewManifest,
} from '../src/services/compatibility/research-review-queue.service';
import { resolveReviewedCatalogResearchIdentity, selectCompatibilityResearchBatchJobs } from '../apps/api/src/compatibility-research-batch';

const arg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const explicitInput = arg('input');
const output = arg('output') || 'evaluation/product/compatibility-research-review-queue.v1.json';
const basePath = arg('base');
const inputs = (explicitInput ?? (basePath ? '' : 'evaluation/reports/compatibility-active-completion-batch.json'))
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const baseManifest = basePath ? JSON.parse(readFileSync(basePath, 'utf8')) as CompatibilityResearchReviewManifest : undefined;
const activeJobs = selectCompatibilityResearchBatchJobs('active_completion').jobs;
const activeResearchScopes = new Map(
  activeJobs.map(job => [job.researchKey, new Set(job.combinedGapFields)] as const),
);
const activeJobByResearchKey = new Map(activeJobs.map(job => [job.researchKey, job] as const));
const identityRecoveredBaseManifest = baseManifest
  ? {
    ...baseManifest,
    items: baseManifest.items.map(item => {
      if (item.queue !== 'identity_review') return item;
      const job = activeJobByResearchKey.get(item.researchKey);
      const reviewedIdentity = job ? resolveReviewedCatalogResearchIdentity(job) : null;
      const activeFields = activeResearchScopes.get(item.researchKey);
      if (!reviewedIdentity || !activeFields || activeFields.size === 0) return item;
      const recoveredFields = [...activeFields];
      return {
        ...item,
        identity: {
          status: reviewedIdentity.status,
          canonicalName: reviewedIdentity.canonicalName,
          reasonCode: reviewedIdentity.reasonCode,
        },
        requestedGapFields: recoveredFields,
        unresolvedFields: recoveredFields,
        reasonCodes: item.reasonCodes.filter(code => code !== 'gbif_match_requires_review'),
      };
    }),
  }
  : undefined;
const reconciledBaseManifest = identityRecoveredBaseManifest
  ? reconcileCompatibilityResearchReviewManifestToActiveScopes(identityRecoveredBaseManifest, activeResearchScopes)
  : undefined;
const baseFieldCount = baseManifest?.items.reduce((sum, item) => sum + item.requestedGapFields.length, 0) || 0;
const reconciledBaseFieldCount = reconciledBaseManifest?.items.reduce((sum, item) => sum + item.requestedGapFields.length, 0) || 0;
const reports = inputs.map(sourcePath => ({
  sourcePath,
  report: reconcileCompatibilityResearchBatchReportToActiveScopes(
    JSON.parse(readFileSync(sourcePath, 'utf8')) as CompatibilityResearchBatchReport,
    activeResearchScopes,
  ),
}));
const manifest = buildCompatibilityResearchReviewManifest(reports, new Date().toISOString(), reconciledBaseManifest);

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({
  output,
  base: basePath || null,
  staleResolvedItemsPruned: (baseManifest?.items.length || 0) - (reconciledBaseManifest?.items.length || 0),
  staleResolvedFieldsPruned: baseFieldCount - reconciledBaseFieldCount,
  ...manifest.summary,
  rawSourceTextCommitted: manifest.rawSourceTextCommitted,
  writesAuthority: manifest.writesAuthority,
  promotionAllowed: manifest.promotionAllowed,
}, null, 2));

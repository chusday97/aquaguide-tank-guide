import {
  compatibilitySpeciesResearchProvider,
  getCompatibilitySpeciesResearchProviderReadiness,
  researchCompatibilitySpeciesWithResume,
  type CompatibilityResearchDiscoveryContext,
  type CompatibilityResearchProviderReadiness,
  type CompatibilityResearchResumeBundle,
} from './compatibility-species-research-provider';
import { createGbifSpeciesIdentityResolver } from '../../../src/services/compatibility/gbif-species-identity.service';
import {
  researchAndAssessCompatibilitySpeciesDetailed,
  type CompatibilitySpeciesOnboardingAssessment,
} from '../../../src/services/compatibility/species-onboarding-research.service';
import {
  buildCompatibilityTaxonResearchPlan,
  type CompatibilityTaxonResearchPlanItem,
} from '../../../src/services/compatibility/compatibility-field-coverage.service';
import {
  buildCompatibilityOnboardingReviewPacket,
  buildCompatibilityOnboardingReviewWorkItem,
  type CompatibilityOnboardingReviewPacket,
} from '../../../src/services/compatibility/onboarding-review-packet.service';
import { getApprovedCatalogFieldReviews } from '../../../src/data/catalogFieldReviews';

export type CompatibilityResearchQueueMode = 'plan' | 'active_completion';

const normalizeScientificName = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export const resolveReviewedCatalogResearchIdentity = (
  job: Pick<CompatibilityTaxonResearchPlanItem, 'baseScientificName' | 'catalogObjects'>,
) => {
  if (!job.baseScientificName || job.catalogObjects.length === 0) return null;
  const target = normalizeScientificName(job.baseScientificName);
  const allReviewed = job.catalogObjects.every(object => {
    const review = getApprovedCatalogFieldReviews(object.speciesId)
      .find(item => item.field === 'identity');
    if (!review || typeof review.proposedValue !== 'object' || review.proposedValue === null) return false;
    const value = review.proposedValue as { scientificName?: unknown; baseSpeciesKey?: unknown };
    return [value.scientificName, value.baseSpeciesKey]
      .some(candidate => typeof candidate === 'string' && normalizeScientificName(candidate) === target);
  });
  if (!allReviewed) return null;
  return {
    status: 'verified' as const,
    queriedScientificName: job.baseScientificName,
    canonicalName: job.baseScientificName,
    externalId: 'reviewed-catalog:' + job.catalogObjects.map(object => object.speciesId).join(','),
    sourceUrl: null,
    confidence: 100,
    reasonCode: 'reviewed_catalog_identity',
  };
};

export type CompatibilityResearchWorkQueue =
  | 'manual_review'
  | 'gap_review'
  | 'extraction_retry'
  | 'evidence_gap'
  | 'identity_review'
  | 'provider_retry'
  | 'terminal_hold';

export type CompatibilityResearchBatchWorkItem = {
  queue: CompatibilityResearchWorkQueue;
  severity: 'blocker' | 'decision' | 'attention';
  title: string;
  nextStep: string;
  reasonCodes: string[];
};

export type CompatibilityResearchBatchPreviewInput = {
  offset: number;
  limit: number;
  concurrency: number;
  queueMode?: CompatibilityResearchQueueMode;
  extractionMode?: 'normal' | 'source_only';
  captureResume?: boolean;
  researchKeys?: string[];
  excludeResearchKeys?: string[];
  discoveryContextByResearchKey?: Record<string, CompatibilityResearchDiscoveryContext>;
};

export type CompatibilityResearchBatchPreviewResult = {
  status: 'research_batch_assessed' | 'provider_unavailable';
  provider: CompatibilityResearchProviderReadiness;
  queueMode: CompatibilityResearchQueueMode;
  offset: number;
  nextOffset: number | null;
  totalPlanJobs: number;
  sourcePlanJobs: number;
  processedJobs: number;
  summary: {
    readyForReview: number;
    researchPending: number;
    terminalHold: number;
    identityHolds: number;
    providerErrors: number;
    requestedGapComplete: number;
    requestedGapPending: number;
    workQueues: Record<CompatibilityResearchWorkQueue, number>;
  };
  results: Array<Record<string, unknown>>;
  writesAuthority: false;
};

const emptyWorkQueues = (): Record<CompatibilityResearchWorkQueue, number> => ({
  manual_review: 0,
  gap_review: 0,
  extraction_retry: 0,
  evidence_gap: 0,
  identity_review: 0,
  provider_retry: 0,
  terminal_hold: 0,
});


const mergeResumeBundles = (
  existing: CompatibilityResearchResumeBundle | null,
  next: CompatibilityResearchResumeBundle,
): CompatibilityResearchResumeBundle => {
  if (!existing) return next;
  const documents = [...existing.documents];
  const seen = new Set(documents.map(document => `${document.url}|${document.contentSha256}`));
  for (const document of next.documents) {
    const key = `${document.url}|${document.contentSha256}`;
    if (seen.has(key)) continue;
    seen.add(key);
    documents.push(document);
  }
  return {
    ...existing,
    targetFields: [...new Set([...existing.targetFields, ...next.targetFields])],
    documents,
    acquisition: next.acquisition ?? existing.acquisition,
  };
};

export const selectCompatibilityResearchBatchJobs = (
  queueMode: CompatibilityResearchQueueMode = 'plan',
  researchKeys: readonly string[] = [],
  excludeResearchKeys: readonly string[] = [],
): { sourcePlanJobs: number; jobs: CompatibilityTaxonResearchPlanItem[] } => {
  const plan = buildCompatibilityTaxonResearchPlan();
  // The full plan may contain guarded base-taxon source-discovery work for
  // variants that still require exact-object evidence on other fields. Those
  // jobs are useful research inputs but cannot complete the catalog object, so
  // they must never masquerade as active-completion work.
  const queueJobs = queueMode === 'active_completion'
    ? plan.filter(job => job.canCompleteFromBaseTaxonResearch)
    : plan;
  const requested = new Set(researchKeys.filter(Boolean));
  const excluded = new Set(excludeResearchKeys.filter(Boolean));
  const requestedJobs = requested.size > 0
    ? queueJobs.filter(job => requested.has(job.researchKey))
    : queueJobs;
  const jobs = excluded.size > 0
    ? requestedJobs.filter(job => !excluded.has(job.researchKey))
    : requestedJobs;
  return { sourcePlanJobs: plan.length, jobs };
};

export const buildCompatibilityResearchBatchWorkItem = ({
  status,
  resourceLabel,
  reasonCodes = [],
  reviewPacket,
  queueMode = 'plan',
  researchScopeComplete = false,
  requestedGapFields = [],
}: {
  status: 'identity_hold' | 'provider_error' | 'research_assessed';
  resourceLabel: string;
  reasonCodes?: string[];
  reviewPacket?: CompatibilityOnboardingReviewPacket;
  queueMode?: CompatibilityResearchQueueMode;
  researchScopeComplete?: boolean;
  requestedGapFields?: string[];
}): CompatibilityResearchBatchWorkItem => {
  if (status === 'identity_hold') return {
    queue: 'identity_review',
    severity: 'blocker',
    title: `${resourceLabel} · 身份需先核验`,
    nextStep: '先核对 exact accepted taxon / synonym / trade-name 映射；身份未确认前不要抽取或晋级 Compatibility authority。',
    reasonCodes,
  };
  if (status === 'provider_error') return {
    queue: 'provider_retry',
    severity: 'attention',
    title: `${resourceLabel} · Research provider 需重试`,
    nextStep: '保留当前 reviewed authority 不变，重试 provider；不要把 provider failure 当成公开证据不存在。',
    reasonCodes,
  };
  if (!reviewPacket) throw new Error('compatibility_research_batch_review_packet_required');
  if (queueMode === 'active_completion') {
    if (reviewPacket.gate === 'terminal_hold') return {
      queue: 'terminal_hold',
      severity: 'blocker',
      title: `${resourceLabel} · 缺口补全被证据/身份边界阻断`,
      nextStep: '保留现有 reviewed authority；先解决本批字段的冲突或身份边界，再重新生成缺口审核包。',
      reasonCodes: [...reviewPacket.reasonCodes],
    };
    if (researchScopeComplete) return {
      queue: 'gap_review',
      severity: 'decision',
      title: `${resourceLabel} · Compatibility 缺口字段待审核`,
      nextStep: `只审核本批直接证据支持的字段（${requestedGapFields.join('、') || '当前缺口'}），通过后与既有 reviewed Profile 合并；不要重新研究已审核字段，也不要自动写入 authority。`,
      reasonCodes: [...reviewPacket.reasonCodes],
    };
    if (reviewPacket.reasonCodes.includes('provider_extraction_transport_unavailable')) return {
      queue: 'extraction_retry',
      severity: 'attention',
      title: `${resourceLabel} · Compatibility extraction 暂不可用`,
      nextStep: '已验证来源继续保留；只重试本批缺口字段的结构化 extraction，不重新补来源，也不猜测缺失事实。',
      reasonCodes: [...reviewPacket.reasonCodes],
    };
    return {
      queue: 'evidence_gap',
      severity: 'attention',
      title: `${resourceLabel} · Compatibility 缺口证据仍不完整`,
      nextStep: `只继续补本批未解决字段（${requestedGapFields.join('、') || '当前缺口'}）的直接 exact-taxon 来源；既有 reviewed 字段保持不变。`,
      reasonCodes: [...reviewPacket.reasonCodes],
    };
  }
  const reviewWorkItem = buildCompatibilityOnboardingReviewWorkItem(reviewPacket, resourceLabel);
  const queue: CompatibilityResearchWorkQueue = reviewPacket.gate === 'manual_review_required'
    ? 'manual_review'
    : reviewPacket.gate === 'terminal_hold'
      ? 'terminal_hold'
      : reviewPacket.reasonCodes.includes('provider_extraction_transport_unavailable')
        ? 'extraction_retry'
        : 'evidence_gap';
  return {
    queue,
    severity: reviewWorkItem.severity,
    title: reviewWorkItem.title,
    nextStep: reviewWorkItem.nextStep,
    reasonCodes: [...reviewPacket.reasonCodes],
  };
};

const researchAssessedWork = (
  assessment: CompatibilitySpeciesOnboardingAssessment,
  resourceLabel: string,
  queueMode: CompatibilityResearchQueueMode,
  researchScopeComplete: boolean,
  requestedGapFields: string[],
) => {
  const reviewPacket = buildCompatibilityOnboardingReviewPacket(assessment);
  const workItem = buildCompatibilityResearchBatchWorkItem({
    status: 'research_assessed',
    resourceLabel,
    reviewPacket,
    queueMode,
    researchScopeComplete,
    requestedGapFields,
  });
  const reviewWorkItem = queueMode === 'plan'
    ? buildCompatibilityOnboardingReviewWorkItem(reviewPacket, resourceLabel)
    : undefined;
  return { reviewPacket, ...(reviewWorkItem ? { reviewWorkItem } : {}), workItem };
};

export const runCompatibilityResearchBatchPreview = async (
  input: CompatibilityResearchBatchPreviewInput,
): Promise<CompatibilityResearchBatchPreviewResult> => {
  const readiness = getCompatibilitySpeciesResearchProviderReadiness();
  const queueMode = input.queueMode ?? 'plan';
  const extractionMode = input.extractionMode ?? 'normal';
  const selected = selectCompatibilityResearchBatchJobs(queueMode, input.researchKeys, input.excludeResearchKeys);
  const allJobs = selected.jobs;
  const offset = Math.min(Math.max(0, input.offset), allJobs.length);
  const limit = Math.max(1, Math.min(4, input.limit));
  const concurrency = Math.max(1, Math.min(2, input.concurrency));

  if (!readiness.configured && extractionMode === 'normal') {
    return {
      status: 'provider_unavailable',
      provider: readiness,
      queueMode,
      offset,
      nextOffset: offset < allJobs.length ? offset : null,
      totalPlanJobs: allJobs.length,
      sourcePlanJobs: selected.sourcePlanJobs,
      processedJobs: 0,
      summary: {
        readyForReview: 0,
        researchPending: 0,
        terminalHold: 0,
        identityHolds: 0,
        providerErrors: 0,
        requestedGapComplete: 0,
        requestedGapPending: 0,
        workQueues: emptyWorkQueues(),
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
      const resourceLabel = job.catalogObjects[0]?.name || job.researchKey;
      const baseResult = {
        researchKey: job.researchKey,
        scientificName: job.baseScientificName,
        researchDisposition: job.researchDisposition,
        priorityScore: job.priorityScore,
        catalogObjects: job.catalogObjects,
        requestedGapFields: job.combinedGapFields,
      };

      if (!job.baseScientificName) {
        const reasonCodes = ['research_plan_identity_unresolved'];
        results[index] = {
          ...baseResult,
          status: 'identity_hold',
          reasonCodes,
          workItem: buildCompatibilityResearchBatchWorkItem({ status: 'identity_hold', resourceLabel, reasonCodes }),
        };
        continue;
      }

      try {
        const identity = resolveReviewedCatalogResearchIdentity(job)
          ?? await identityResolver.resolve(job.baseScientificName);
        if (identity.status !== 'verified') {
          const reasonCodes = [identity.reasonCode || 'identity_unresolved'];
          results[index] = {
            ...baseResult,
            status: 'identity_hold',
            identity,
            reasonCodes,
            workItem: buildCompatibilityResearchBatchWorkItem({ status: 'identity_hold', resourceLabel, reasonCodes }),
          };
          continue;
        }

        let resumeBundle: CompatibilityResearchResumeBundle | null = null;
        const researchProvider = input.captureResume || extractionMode === 'source_only'
          ? {
            id: compatibilitySpeciesResearchProvider.id,
            research: async (researchInput: Parameters<typeof compatibilitySpeciesResearchProvider.research>[0]) => {
              const result = await researchCompatibilitySpeciesWithResume(researchInput, {
                skipAiExtraction: extractionMode === 'source_only',
                skipModelDiscovery: extractionMode === 'source_only',
                discoveryContext: input.discoveryContextByResearchKey?.[job.researchKey],
              });
              resumeBundle = mergeResumeBundles(resumeBundle, result.resumeBundle);
              return result.packet;
            },
          }
          : compatibilitySpeciesResearchProvider;
        const detailed = await researchAndAssessCompatibilitySpeciesDetailed(
          researchProvider,
          {
            catalogKey: job.researchKey.replace(/[^\w.-]+/g, '_').slice(0, 160),
            scientificName: job.baseScientificName,
            commonName: resourceLabel,
          },
          {
            researchScopeFields: job.combinedGapFields,
          },
        );
        const review = researchAssessedWork(
          detailed.assessment,
          resourceLabel,
          queueMode,
          detailed.researchScope.complete,
          job.combinedGapFields,
        );
        results[index] = {
          ...baseResult,
          status: 'research_assessed',
          identity,
          ...detailed,
          ...review,
          ...(resumeBundle ? { resumeBundle } : {}),
        };
      } catch (error) {
        const reasonCodes = [error instanceof Error ? error.message : 'compatibility_research_failed'];
        results[index] = {
          ...baseResult,
          status: 'provider_error',
          reasonCodes,
          workItem: buildCompatibilityResearchBatchWorkItem({ status: 'provider_error', resourceLabel, reasonCodes }),
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
  const requestedGapComplete = assessed.filter(item => (
    (item.researchScope as { complete?: boolean } | undefined)?.complete === true
    && (item.assessment as { status?: string } | undefined)?.status !== 'terminal_hold'
  )).length;
  const requestedGapPending = assessed.length - requestedGapComplete;
  const workQueues = emptyWorkQueues();
  for (const item of results) {
    const queue = (item.workItem as CompatibilityResearchBatchWorkItem | undefined)?.queue;
    if (queue) workQueues[queue] += 1;
  }

  return {
    status: 'research_batch_assessed',
    provider: readiness,
    queueMode,
    offset,
    nextOffset,
    totalPlanJobs: allJobs.length,
    sourcePlanJobs: selected.sourcePlanJobs,
    processedJobs: jobs.length,
    summary: {
      readyForReview,
      researchPending,
      terminalHold,
      identityHolds: results.filter(item => item.status === 'identity_hold').length,
      providerErrors: results.filter(item => item.status === 'provider_error').length,
      requestedGapComplete,
      requestedGapPending,
      workQueues,
    },
    results,
    writesAuthority: false,
  };
};

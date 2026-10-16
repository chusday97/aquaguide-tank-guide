import { createHash } from 'node:crypto';
import { isCompatibilityResearchClaimScopeEligible } from './species-onboarding-research.service';

export type CompatibilityResearchReviewQueueKind =
  | 'field_review'
  | 'targeted_source_expansion'
  | 'source_strategy_review'
  | 'identity_review'
  | 'identity_provider_retry'
  | 'source_snapshot_retry'
  | 'extraction_retry'
  | 'provider_retry'
  | 'terminal_hold'
  | 'onboarding_review';

type BatchResult = Record<string, any>;
type BatchReport = {
  generatedAt?: string;
  providerPreflight?: { providerId?: string; model?: string; status?: string };
  pages?: Array<{ results?: BatchResult[] }>;
};

export type CompatibilityResearchReviewQueueSource = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  sourceType: string;
  contentSha256: string;
};

export type CompatibilityResearchHistory = {
  rounds: number;
  attemptedUrls: string[];
  attemptedSourceTypes: string[];
  preferredNextSourceTypes: string[];
};

const sourceExpansionPriority = [
  'government',
  'peer_reviewed',
  'university',
  'professional_association',
  'curated_husbandry',
] as const;


export type CompatibilityResearchReviewQueueItem = {
  id: string;
  researchKey: string;
  scientificName: string | null;
  catalogObjects: Array<{
    speciesId: string;
    name: string;
    scientificName: string;
    isVariant: boolean;
    isExactBaseTaxon: boolean;
  }>;
  requestedGapFields: string[];
  unresolvedFields: string[];
  sourceReport: string;
  sourceReportGeneratedAt: string | null;
  sourceQueue: string;
  queue: CompatibilityResearchReviewQueueKind;
  reasonCodes: string[];
  identity: {
    status: string | null;
    canonicalName: string | null;
    reasonCode: string | null;
  } | null;
  fieldCandidates: Array<{
    field: string;
    proposedValue: unknown;
    sourceIds: string[];
    notes: string[];
    confidence: string | null;
  }>;
  verifiedSources: CompatibilityResearchReviewQueueSource[];
  researchHistory: CompatibilityResearchHistory;
  nextResearch: {
    mode: 'targeted_source_expansion';
    targetFields: string[];
    repeatsReviewedFields: false;
    preferredSourceTypes: string[];
    excludeAttemptedUrlCount: number;
  } | null;
  requiresHumanReview: boolean;
  promotionAllowed: false;
  writesAuthority: false;
};

export type CompatibilityResearchReviewManifest = {
  version: 1;
  kind: 'compatibility_research_review_queue';
  generatedAt: string;
  generatedFrom: string[];
  rawSourceTextCommitted: false;
  writesAuthority: false;
  promotionAllowed: false;
  summary: Record<CompatibilityResearchReviewQueueKind, number> & { total: number };
  items: CompatibilityResearchReviewQueueItem[];
};

const stringArray = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : [];

const queueFor = (result: BatchResult): CompatibilityResearchReviewQueueKind | null => {
  const current = result.workItem?.queue;
  if (current === 'gap_review') return 'field_review';
  if (current === 'evidence_gap') return 'targeted_source_expansion';
  if (current === 'identity_review') {
    const status = result.identity?.status;
    const reasons = stringArray(result.reasonCodes ?? result.workItem?.reasonCodes);
    return status === 'provider_unavailable' || reasons.includes('gbif_request_failed')
      ? 'identity_provider_retry'
      : 'identity_review';
  }
  if (current === 'extraction_retry') return 'extraction_retry';
  if (current === 'provider_retry') return 'provider_retry';
  if (current === 'terminal_hold') return 'terminal_hold';
  if (current === 'manual_review') return 'onboarding_review';
  return null;
};

const queueItemId = (researchKey: string, catalogObjects: Array<{ speciesId: string }>) => (
  'research-review-' + createHash('sha256')
    .update([researchKey, catalogObjects.map(item => item.speciesId).sort().join(',')].join('|'))
    .digest('hex')
    .slice(0, 20)
);

const verifiedSourcesFor = (result: BatchResult): CompatibilityResearchReviewQueueSource[] => {
  const docs = Array.isArray(result.resumeBundle?.documents) ? result.resumeBundle.documents : [];
  const hashByUrl = new Map(docs.flatMap((document: Record<string, unknown>) => (
    typeof document.url === 'string' && typeof document.contentSha256 === 'string'
      ? [[document.url, document.contentSha256] as const]
      : []
  )));
  const sources = Array.isArray(result.packet?.sources) ? result.packet.sources : [];
  return sources.flatMap((source: Record<string, unknown>) => {
    if (
      typeof source.id !== 'string'
      || typeof source.url !== 'string'
      || typeof source.title !== 'string'
      || typeof source.publisher !== 'string'
      || typeof source.sourceType !== 'string'
      || source.contentVerified !== true
    ) return [];
    const contentSha256 = hashByUrl.get(source.url);
    if (!contentSha256) return [];
    return [{
      id: source.id,
      url: source.url,
      title: source.title,
      publisher: source.publisher,
      sourceType: source.sourceType,
      contentSha256,
    }];
  });
};

const fieldCandidatesFor = (result: BatchResult, requestedGapFields: string[]) => {
  const requested = new Set(requestedGapFields);
  const fields = Array.isArray(result.reviewPacket?.fields) ? result.reviewPacket.fields : [];
  return fields.flatMap((field: Record<string, any>) => {
    const fieldName = String(field.field || '');
    if (field.status !== 'supported' || !requested.has(fieldName)) return [];
    const notes = stringArray(field.notes);
    const scopeEligible = (notes.length > 0 ? notes : ['']).some(note => (
      isCompatibilityResearchClaimScopeEligible({
        field: fieldName as any,
        proposedValue: field.proposedValue,
        note,
      })
    ));
    if (!scopeEligible) return [];
    return [{
      field: fieldName,
      proposedValue: field.proposedValue,
      sourceIds: stringArray(field.sourceIds),
      notes,
      confidence: typeof field.draftReview?.confidence === 'string' ? field.draftReview.confidence : null,
    }];
  });
};


const historyFromItem = (
  item: CompatibilityResearchReviewQueueItem,
): CompatibilityResearchHistory => {
  const attemptedUrls = [...new Set([
    ...(item.researchHistory?.attemptedUrls || []),
    ...item.verifiedSources.map(source => source.url),
  ])];
  const attemptedSourceTypes = [...new Set([
    ...(item.researchHistory?.attemptedSourceTypes || []),
    ...item.verifiedSources.map(source => source.sourceType),
  ])];
  const preferredNextSourceTypes = sourceExpansionPriority
    .filter(sourceType => !attemptedSourceTypes.includes(sourceType));
  return {
    rounds: item.researchHistory?.rounds || 0,
    attemptedUrls,
    attemptedSourceTypes,
    preferredNextSourceTypes: preferredNextSourceTypes.length > 0
      ? [...preferredNextSourceTypes]
      : [...sourceExpansionPriority],
  };
};

const shouldEscalateSourceStrategy = (
  queue: CompatibilityResearchReviewQueueKind,
  history: CompatibilityResearchHistory,
) => (
  queue === 'targeted_source_expansion'
  && history.rounds >= 2
  && history.attemptedUrls.length >= 5
);

const normalizeQueueItem = (
  item: CompatibilityResearchReviewQueueItem,
): CompatibilityResearchReviewQueueItem => {
  const researchHistory = historyFromItem(item);
  const queue = shouldEscalateSourceStrategy(item.queue, researchHistory)
    ? 'source_strategy_review' as const
    : item.queue;
  return {
    ...item,
    queue,
    reasonCodes: queue === 'source_strategy_review'
      ? [...new Set([...item.reasonCodes, 'generic_source_strategy_exhausted'])]
      : item.reasonCodes,
    researchHistory,
    nextResearch: queue === 'targeted_source_expansion' ? {
      mode: 'targeted_source_expansion',
      targetFields: item.nextResearch?.targetFields || item.unresolvedFields,
      repeatsReviewedFields: false,
      preferredSourceTypes: researchHistory.preferredNextSourceTypes,
      excludeAttemptedUrlCount: researchHistory.attemptedUrls.length,
    } : null,
  };
};

const buildResearchHistory = (
  previous: CompatibilityResearchReviewQueueItem | undefined,
  result: BatchResult,
  verifiedSources: CompatibilityResearchReviewQueueSource[],
): CompatibilityResearchHistory => {
  const acquisition = result.resumeBundle?.acquisition;
  const attemptedUrls = [...new Set([
    ...(previous?.researchHistory?.attemptedUrls || []),
    ...(previous?.verifiedSources || []).map(source => source.url),
    ...stringArray(acquisition?.attemptedUrls),
    ...verifiedSources.map(source => source.url),
  ])];
  const attemptedSourceTypes = [...new Set([
    ...(previous?.researchHistory?.attemptedSourceTypes || []),
    ...(previous?.verifiedSources || []).map(source => source.sourceType),
    ...verifiedSources.map(source => source.sourceType),
  ])];
  const preferredNextSourceTypes = sourceExpansionPriority
    .filter(sourceType => !attemptedSourceTypes.includes(sourceType));
  return {
    rounds: Math.max(
      previous?.researchHistory?.rounds || 0,
      typeof acquisition?.round === 'number' ? acquisition.round : 0,
    ),
    attemptedUrls,
    attemptedSourceTypes,
    preferredNextSourceTypes: preferredNextSourceTypes.length > 0
      ? [...preferredNextSourceTypes]
      : [...sourceExpansionPriority],
  };
};

export const buildCompatibilityResearchReviewManifest = (
  reports: Array<{ sourcePath: string; report: BatchReport }>,
  generatedAt = new Date().toISOString(),
  baseManifest?: CompatibilityResearchReviewManifest,
): CompatibilityResearchReviewManifest => {
  const deduped = new Map<string, CompatibilityResearchReviewQueueItem>(
    (baseManifest?.items || []).map(item => {
      const normalized = normalizeQueueItem(item);
      return [normalized.id, normalized];
    }),
  );

  for (const { sourcePath, report } of reports) {
    for (const result of (report.pages || []).flatMap(page => page.results || [])) {
      const queue = queueFor(result);
      if (!queue) continue;
      const requestedGapFields = stringArray(result.requestedGapFields);
      const researchScopeUnresolved = stringArray(result.researchScope?.unresolvedFields);
      const unresolvedFields = researchScopeUnresolved.length > 0
        ? researchScopeUnresolved
        : queue === 'targeted_source_expansion' ? requestedGapFields : [];
      const catalogObjects = (Array.isArray(result.catalogObjects) ? result.catalogObjects : []).flatMap((item: Record<string, unknown>) => (
        typeof item.speciesId === 'string' && typeof item.name === 'string' && typeof item.scientificName === 'string'
          ? [{
            speciesId: item.speciesId,
            name: item.name,
            scientificName: item.scientificName,
            isVariant: item.isVariant === true,
            isExactBaseTaxon: item.isExactBaseTaxon === true,
          }]
          : []
      ));
      const researchKey = String(result.researchKey || result.scientificName || catalogObjects[0]?.speciesId || '');
      if (!researchKey) continue;
      const id = queueItemId(researchKey, catalogObjects);
      const reasonCodes = stringArray(result.reasonCodes ?? result.reviewPacket?.reasonCodes ?? result.workItem?.reasonCodes);
      const previous = deduped.get(id);
      const fieldCandidates = queue === 'field_review' || queue === 'onboarding_review'
        ? fieldCandidatesFor(result, requestedGapFields)
        : [];
      const newVerifiedSources = verifiedSourcesFor(result);
      const verifiedSources = [...(previous?.verifiedSources || [])];
      const seenVerifiedSources = new Set(verifiedSources.map(source => source.url + '|' + source.contentSha256));
      for (const source of newVerifiedSources) {
        const key = source.url + '|' + source.contentSha256;
        if (seenVerifiedSources.has(key)) continue;
        seenVerifiedSources.add(key);
        verifiedSources.push(source);
      }
      const researchHistory = buildResearchHistory(previous, result, newVerifiedSources);
      const verifiedSourceIds = new Set(verifiedSources.map(source => source.id));
      const candidateSourceIds = new Set<string>(fieldCandidates.flatMap(candidate => candidate.sourceIds as string[]));
      const sourceSnapshotsComplete = fieldCandidates.length > 0
        && [...candidateSourceIds].every(sourceId => verifiedSourceIds.has(sourceId));
      const reviewCandidateRejected = (queue === 'field_review' || queue === 'onboarding_review')
        && fieldCandidates.length === 0;
      const preEscalationQueue = reviewCandidateRejected
        ? 'targeted_source_expansion' as const
        : (queue === 'field_review' || queue === 'onboarding_review') && !sourceSnapshotsComplete
          ? 'source_snapshot_retry' as const
          : queue;
      const effectiveQueue = shouldEscalateSourceStrategy(preEscalationQueue, researchHistory)
        ? 'source_strategy_review' as const
        : preEscalationQueue;
      const effectiveUnresolvedFields = effectiveQueue === 'targeted_source_expansion' || effectiveQueue === 'source_strategy_review'
        ? (researchScopeUnresolved.length > 0 ? researchScopeUnresolved : requestedGapFields)
        : unresolvedFields;
      const item: CompatibilityResearchReviewQueueItem = {
        id,
        researchKey,
        scientificName: typeof result.scientificName === 'string' ? result.scientificName : null,
        catalogObjects,
        requestedGapFields,
        unresolvedFields: effectiveUnresolvedFields,
        sourceReport: sourcePath,
        sourceReportGeneratedAt: typeof report.generatedAt === 'string' ? report.generatedAt : null,
        sourceQueue: String(result.workItem?.queue || ''),
        queue: effectiveQueue,
        reasonCodes: effectiveQueue === 'source_strategy_review'
          ? [...new Set([
            ...reasonCodes,
            ...(reviewCandidateRejected ? ['review_candidate_scope_rejected'] : []),
            'generic_source_strategy_exhausted',
          ])]
          : reviewCandidateRejected
            ? [...new Set([...reasonCodes, 'review_candidate_scope_rejected'])]
            : effectiveQueue === 'source_snapshot_retry'
              ? [...new Set([...reasonCodes, 'review_source_snapshot_missing'])]
              : reasonCodes,
        identity: result.identity ? {
          status: typeof result.identity.status === 'string' ? result.identity.status : null,
          canonicalName: typeof result.identity.canonicalName === 'string' ? result.identity.canonicalName : null,
          reasonCode: typeof result.identity.reasonCode === 'string' ? result.identity.reasonCode : null,
        } : null,
        fieldCandidates,
        verifiedSources,
        researchHistory,
        nextResearch: effectiveQueue === 'targeted_source_expansion' ? {
          mode: 'targeted_source_expansion',
          targetFields: effectiveUnresolvedFields,
          repeatsReviewedFields: false,
          preferredSourceTypes: researchHistory.preferredNextSourceTypes,
          excludeAttemptedUrlCount: researchHistory.attemptedUrls.length,
        } : null,
        requiresHumanReview: effectiveQueue === 'field_review' || effectiveQueue === 'identity_review' || effectiveQueue === 'onboarding_review',
        promotionAllowed: false,
        writesAuthority: false,
      };
      if (
        effectiveQueue === 'identity_provider_retry'
        && previous?.identity?.status === 'verified'
        && previous.queue !== 'identity_provider_retry'
      ) {
        continue;
      }
      deduped.set(id, item);
    }
  }

  const items = [...deduped.values()].sort((a, b) => (
    a.queue.localeCompare(b.queue) || a.researchKey.localeCompare(b.researchKey)
  ));
  const summary = {
    total: items.length,
    field_review: 0,
    targeted_source_expansion: 0,
    source_strategy_review: 0,
    identity_review: 0,
    identity_provider_retry: 0,
    source_snapshot_retry: 0,
    extraction_retry: 0,
    provider_retry: 0,
    terminal_hold: 0,
    onboarding_review: 0,
  } satisfies CompatibilityResearchReviewManifest['summary'];
  for (const item of items) summary[item.queue] += 1;

  return {
    version: 1,
    kind: 'compatibility_research_review_queue',
    generatedAt,
    generatedFrom: [...new Set([...(baseManifest?.generatedFrom || []), ...reports.map(item => item.sourcePath)])],
    rawSourceTextCommitted: false,
    writesAuthority: false,
    promotionAllowed: false,
    summary,
    items,
  };
};

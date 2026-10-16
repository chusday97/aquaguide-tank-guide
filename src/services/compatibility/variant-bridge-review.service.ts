import { getApprovedCatalogFieldReviews } from '../../data/catalogFieldReviews';
import { getCatalogIdentityBoundary } from '../../data/catalogIdentityBoundaries';
import { getCatalogReviewSourceCandidates } from '../../data/catalogReviewSourceCandidates';
import { resolveKnowledgeSources } from '../../modules/knowledge/knowledgeSources';
import { getReviewedSpeciesKnowledge } from '../../modules/knowledge/speciesKnowledge';
import type { CompatibilityTaxonResearchPlanItem } from './compatibility-field-coverage.service';
import type {
  CompatibilityResearchReviewManifest,
  CompatibilityResearchReviewQueueItem,
} from './research-review-queue.service';

export type CompatibilityVariantBridgeObjectStatus =
  | 'field_bridge_review_required'
  | 'field_bridge_evidence_ceiling'
  | 'identity_review_required'
  | 'identity_evidence_ceiling'
  | 'identity_boundary_hold';

export type CompatibilityVariantBridgeCandidate = {
  field: string;
  proposedValue: unknown;
  sourceIds: string[];
  confidence: string | null;
};

export type CompatibilityVariantBridgeReviewObject = {
  speciesId: string;
  name: string;
  scientificName: string;
  baseScientificName: string;
  status: CompatibilityVariantBridgeObjectStatus;
  unresolvedFields: string[];
  candidateFields: string[];
  fieldCandidates: CompatibilityVariantBridgeCandidate[];
  reviewedIdentitySourceIds: string[];
  identitySourceCandidates: Array<{
    id: string;
    title: string;
    publisher: string;
    url: string;
    sourceType: string;
    reviewStatus: string;
  }>;
  boundary: {
    code: string;
    resolutionMode: string | null;
    note: string;
  } | null;
  reasonCodes: string[];
  promotionAllowed: false;
  writesAuthority: false;
};

export type CompatibilityVariantBridgeReviewGroup = {
  researchKey: string;
  baseScientificName: string;
  objects: CompatibilityVariantBridgeReviewObject[];
};

export type CompatibilityVariantIdentityResearchReport = {
  groups?: Array<{
    baseScientificName?: string;
    candidates?: Array<{ speciesId?: string }>;
    unresolvedSpeciesIds?: string[];
    attemptedUrls?: string[];
  }>;
};

export type CompatibilityVariantFieldResearchReport = {
  speciesId?: string;
  field?: string;
  packet?: { sources?: unknown[] };
  resumeBundle?: { acquisition?: { round?: number; attemptedUrls?: string[] } };
};

export type CompatibilityVariantBridgeReviewManifest = {
  version: 1;
  kind: 'compatibility_variant_bridge_review';
  generatedAt: string;
  generatedFrom: string;
  promotionAllowed: false;
  writesAuthority: false;
  summary: {
    groupCount: number;
    objectCount: number;
    fieldBridgeReviewRequired: number;
    fieldBridgeEvidenceCeiling: number;
    identityReviewRequired: number;
    identityEvidenceCeiling: number;
    identityBoundaryHold: number;
  };
  groups: CompatibilityVariantBridgeReviewGroup[];
};

const normalizeScientificName = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const reviewedIdentityBridgeFor = (speciesId: string, baseScientificName: string) => {
  const target = normalizeScientificName(baseScientificName);
  return getApprovedCatalogFieldReviews(speciesId).find(review => {
    if (review.field !== 'identity' || typeof review.proposedValue !== 'object' || review.proposedValue === null) return false;
    const value = review.proposedValue as { baseSpeciesKey?: unknown; variantKey?: unknown };
    if (typeof value.baseSpeciesKey !== 'string' || normalizeScientificName(value.baseSpeciesKey) !== target) return false;
    if (typeof value.variantKey !== 'string' || !value.variantKey.trim()) return false;
    const variantToken = value.variantKey.trim().toLowerCase();
    return review.conflictNotes.some(note => note.toLowerCase().includes(variantToken));
  }) ?? null;
};

const candidateFieldsForObject = (
  queueItem: CompatibilityResearchReviewQueueItem,
  objectGaps: readonly string[],
) => {
  const gaps = new Set(objectGaps);
  return queueItem.fieldCandidates.filter(candidate => gaps.has(candidate.field));
};

const collectKnowledgeSourceIds = (value: unknown, out = new Set<string>()): Set<string> => {
  if (!value || typeof value !== 'object') return out;
  if (Array.isArray(value)) {
    for (const item of value) collectKnowledgeSourceIds(item, out);
    return out;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'sourceIds' && Array.isArray(child)) {
      for (const sourceId of child) if (typeof sourceId === 'string' && sourceId) out.add(sourceId);
      continue;
    }
    collectKnowledgeSourceIds(child, out);
  }
  return out;
};

const identityEvidenceCeilingSpeciesIds = (
  reports: readonly CompatibilityVariantIdentityResearchReport[],
) => {
  const unresolvedCount = new Map<string, number>();
  const resolved = new Set<string>();
  for (const report of reports) {
    for (const group of report.groups || []) {
      for (const candidate of group.candidates || []) {
        if (candidate.speciesId) resolved.add(candidate.speciesId);
      }
      for (const speciesId of group.unresolvedSpeciesIds || []) {
        unresolvedCount.set(speciesId, (unresolvedCount.get(speciesId) || 0) + 1);
      }
    }
  }
  return new Set([...unresolvedCount.entries()]
    .filter(([speciesId, count]) => count >= 2 && !resolved.has(speciesId))
    .map(([speciesId]) => speciesId));
};

const fieldBridgeEvidenceCeilings = (
  reports: readonly CompatibilityVariantFieldResearchReport[],
) => {
  const roundsByKey = new Map<string, number>();
  const supported = new Set<string>();
  for (const report of reports) {
    if (!report.speciesId || !report.field) continue;
    const key = `${report.speciesId}:${report.field}`;
    if ((report.packet?.sources?.length || 0) > 0) {
      supported.add(key);
      continue;
    }
    const round = report.resumeBundle?.acquisition?.round || 0;
    roundsByKey.set(key, Math.max(roundsByKey.get(key) || 0, round));
  }
  return new Set([...roundsByKey.entries()]
    .filter(([key, round]) => round >= 2 && !supported.has(key))
    .map(([key]) => key));
};

const identitySourceCandidatesFor = (speciesId: string) => {
  const catalogSources = getCatalogReviewSourceCandidates(speciesId);
  const knowledge = getReviewedSpeciesKnowledge(speciesId);
  const knowledgeSources = knowledge
    ? resolveKnowledgeSources([...collectKnowledgeSourceIds(knowledge)])
    : [];
  return [...new Map(
    [...catalogSources, ...knowledgeSources].map(source => [source.id, source] as const),
  ).values()].map(source => ({
    id: source.id,
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    sourceType: source.sourceType,
    reviewStatus: source.reviewStatus,
  }));
};

export const buildCompatibilityVariantBridgeReviewManifest = (
  queue: CompatibilityResearchReviewManifest,
  plan: readonly CompatibilityTaxonResearchPlanItem[],
  generatedAt = new Date().toISOString(),
  generatedFrom = 'evaluation/product/compatibility-research-review-queue.v1.json',
  identityResearchReports: readonly CompatibilityVariantIdentityResearchReport[] = [],
  fieldResearchReports: readonly CompatibilityVariantFieldResearchReport[] = [],
): CompatibilityVariantBridgeReviewManifest => {
  const planByKey = new Map(plan.map(item => [item.researchKey, item] as const));
  const identityCeilings = identityEvidenceCeilingSpeciesIds(identityResearchReports);
  const fieldCeilings = fieldBridgeEvidenceCeilings(fieldResearchReports);
  const groups: CompatibilityVariantBridgeReviewGroup[] = [];

  for (const queueItem of queue.items.filter(item => item.queue === 'variant_bridge_review')) {
    const planItem = planByKey.get(queueItem.researchKey);
    const baseScientificName = planItem?.baseScientificName || queueItem.scientificName;
    if (!planItem || !baseScientificName) continue;

    const objects = planItem.catalogObjects
      .filter(object => object.isVariant)
      .map(object => {
        const boundary = getCatalogIdentityBoundary(object.speciesId);
        const reviewedIdentity = reviewedIdentityBridgeFor(object.speciesId, baseScientificName);
        const fieldCandidates = candidateFieldsForObject(queueItem, object.gaps);
        const allCandidateFieldsCeiling = fieldCandidates.length > 0
          && fieldCandidates.every(candidate => fieldCeilings.has(`${object.speciesId}:${candidate.field}`));
        const status: CompatibilityVariantBridgeObjectStatus = boundary
          ? 'identity_boundary_hold'
          : reviewedIdentity
            ? allCandidateFieldsCeiling
              ? 'field_bridge_evidence_ceiling'
              : 'field_bridge_review_required'
            : identityCeilings.has(object.speciesId)
              ? 'identity_evidence_ceiling'
              : 'identity_review_required';

        const reasonCodes = boundary
          ? ['catalog_identity_boundary']
          : reviewedIdentity
            ? allCandidateFieldsCeiling
              ? ['reviewed_variant_identity_bridge', 'variant_field_bridge_research_exhausted']
              : ['reviewed_variant_identity_bridge', 'field_bridge_still_requires_review']
            : identityCeilings.has(object.speciesId)
              ? ['variant_identity_bridge_missing', 'variant_identity_research_exhausted']
              : ['variant_identity_bridge_missing'];

        return {
          speciesId: object.speciesId,
          name: object.name,
          scientificName: object.scientificName,
          baseScientificName,
          status,
          unresolvedFields: [...object.gaps],
          candidateFields: fieldCandidates.map(candidate => candidate.field),
          fieldCandidates: fieldCandidates.map(candidate => ({
            field: candidate.field,
            proposedValue: candidate.proposedValue,
            sourceIds: [...candidate.sourceIds],
            confidence: candidate.confidence,
          })),
          reviewedIdentitySourceIds: reviewedIdentity ? [...reviewedIdentity.citationIds] : [],
          identitySourceCandidates: identitySourceCandidatesFor(object.speciesId),
          boundary: boundary ? {
            code: boundary.code,
            resolutionMode: 'researchDisposition' in boundary ? boundary.researchDisposition ?? null : null,
            note: boundary.note,
          } : null,
          reasonCodes,
          promotionAllowed: false as const,
          writesAuthority: false as const,
        };
      });

    groups.push({
      researchKey: queueItem.researchKey,
      baseScientificName,
      objects,
    });
  }

  const allObjects = groups.flatMap(group => group.objects);
  return {
    version: 1,
    kind: 'compatibility_variant_bridge_review',
    generatedAt,
    generatedFrom,
    promotionAllowed: false,
    writesAuthority: false,
    summary: {
      groupCount: groups.length,
      objectCount: allObjects.length,
      fieldBridgeReviewRequired: allObjects.filter(item => item.status === 'field_bridge_review_required').length,
      fieldBridgeEvidenceCeiling: allObjects.filter(item => item.status === 'field_bridge_evidence_ceiling').length,
      identityReviewRequired: allObjects.filter(item => item.status === 'identity_review_required').length,
      identityEvidenceCeiling: allObjects.filter(item => item.status === 'identity_evidence_ceiling').length,
      identityBoundaryHold: allObjects.filter(item => item.status === 'identity_boundary_hold').length,
    },
    groups,
  };
};

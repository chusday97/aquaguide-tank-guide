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
  | 'identity_review_required'
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
    identityReviewRequired: number;
    identityBoundaryHold: number;
  };
  groups: CompatibilityVariantBridgeReviewGroup[];
};

const normalizeScientificName = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

const reviewedIdentityBridgeFor = (speciesId: string, baseScientificName: string) => {
  const target = normalizeScientificName(baseScientificName);
  return getApprovedCatalogFieldReviews(speciesId).find(review => {
    if (review.field !== 'identity' || typeof review.proposedValue !== 'object' || review.proposedValue === null) return false;
    const value = review.proposedValue as { baseSpeciesKey?: unknown };
    return typeof value.baseSpeciesKey === 'string'
      && normalizeScientificName(value.baseSpeciesKey) === target;
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
): CompatibilityVariantBridgeReviewManifest => {
  const planByKey = new Map(plan.map(item => [item.researchKey, item] as const));
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
        const status: CompatibilityVariantBridgeObjectStatus = boundary
          ? 'identity_boundary_hold'
          : reviewedIdentity
            ? 'field_bridge_review_required'
            : 'identity_review_required';

        const reasonCodes = boundary
          ? ['catalog_identity_boundary']
          : reviewedIdentity
            ? ['reviewed_variant_identity_bridge', 'field_bridge_still_requires_review']
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
      identityReviewRequired: allObjects.filter(item => item.status === 'identity_review_required').length,
      identityBoundaryHold: allObjects.filter(item => item.status === 'identity_boundary_hold').length,
    },
    groups,
  };
};

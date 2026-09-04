import type {
  CompatibilityCitationSnapshot,
  CompatibilityPairRuleRevisionInput,
  CompatibilityProfileRevisionInput,
  CompatibilityProfileRevisionStatus,
  CompatibilityRevisionReviewMutation,
} from '../../../packages/contracts/src';
import { apiRequest, createIdempotencyKey } from '../api/api-client';

export type CompatibilityRevisionImpactReport = {
  kind: 'profile' | 'pair_rule';
  baselineVersion: number;
  changedFields: string[];
  changes: Array<{ field: string; before: unknown; after: unknown }>;
};

export type AdminCompatibilityProfileRevision = {
  id: string;
  speciesId: string;
  revisionNumber: number;
  baseProfileVersion?: number;
  behaviorTraits: string[];
  minimumGroupSize?: number | null;
  predationTargets: string[];
  confidence: CompatibilityProfileRevisionInput['confidence'];
  status: CompatibilityProfileRevisionStatus;
  citationSnapshots: CompatibilityCitationSnapshot[];
  impactReport?: CompatibilityRevisionImpactReport;
  impactCheckedAt?: string;
  reviewNote?: string | null;
  version: number;
  species: { catalogKey: string; name: string; scientificName: string };
};

export type CompatibilityProfileDraftInput = CompatibilityProfileRevisionInput;
export type AdminCompatibilityProfileRevisionWorkspace = { revisions: AdminCompatibilityProfileRevision[]; writableCatalogKeys: string[] };



export type AdminCompatibilityPairRuleRevision = {
  id: string;
  speciesAId: string;
  speciesBId: string;
  revisionNumber: number;
  baseRuleVersion?: number;
  verdict: CompatibilityPairRuleRevisionInput['verdict'];
  riskType: string;
  reason: string;
  mitigation: string[];
  basis: CompatibilityPairRuleRevisionInput['basis'];
  confidence: CompatibilityPairRuleRevisionInput['confidence'];
  status: CompatibilityProfileRevisionStatus;
  citationSnapshots: CompatibilityCitationSnapshot[];
  impactReport?: CompatibilityRevisionImpactReport;
  impactCheckedAt?: string;
  reviewNote?: string | null;
  version: number;
  speciesA: { catalogKey: string; name: string; scientificName: string };
  speciesB: { catalogKey: string; name: string; scientificName: string };
};

export type AdminCompatibilityPairRuleRevisionWorkspace = { revisions: AdminCompatibilityPairRuleRevision[]; writablePairKeys: string[] };

export const compatibilityAdminService = {
  listProfileRevisions: () => apiRequest<AdminCompatibilityProfileRevisionWorkspace>('/admin/compatibility/profile-revisions'),
  listPairRuleRevisions: () => apiRequest<AdminCompatibilityPairRuleRevisionWorkspace>('/admin/compatibility/pair-rule-revisions'),

  createPairRuleRevision: (input: CompatibilityPairRuleRevisionInput) => apiRequest<AdminCompatibilityPairRuleRevision>('/admin/compatibility/pair-rule-revisions', {
    method: 'POST', body: input, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-create'),
  }),

  updatePairRuleRevision: (id: string, version: number, input: Partial<CompatibilityPairRuleRevisionInput>) => apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}`, {
    method: 'PATCH', body: { ...input, version }, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-update'),
  }),

  submitPairRuleRevision: (id: string, version: number) => apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}/submit`, {
    method: 'POST', body: { version }, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-submit'),
  }),

  reviewPairRuleRevision: (id: string, input: CompatibilityRevisionReviewMutation) => apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}/review`, {
    method: 'POST', body: input, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-review'),
  }),

  createProfileRevision: (input: CompatibilityProfileDraftInput) => apiRequest<AdminCompatibilityProfileRevision>('/admin/compatibility/profile-revisions', {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('compatibility-profile-revision-create'),
  }),

  updateProfileRevision: (id: string, version: number, input: Partial<CompatibilityProfileDraftInput>) => apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}`, {
    method: 'PATCH',
    body: { ...input, version },
    idempotencyKey: createIdempotencyKey('compatibility-profile-revision-update'),
  }),

  submitProfileRevision: (id: string, version: number) => apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}/submit`, {
    method: 'POST',
    body: { version },
    idempotencyKey: createIdempotencyKey('compatibility-profile-revision-submit'),
  }),

  reviewProfileRevision: (id: string, input: CompatibilityRevisionReviewMutation) => apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}/review`, {
    method: 'POST', body: input, idempotencyKey: createIdempotencyKey('compatibility-profile-revision-review'),
  }),
};

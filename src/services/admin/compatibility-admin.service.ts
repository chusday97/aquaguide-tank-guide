import type {
  CompatibilityCitationSnapshot,
  CompatibilityPairRuleRevisionInput,
  CompatibilityProfileRevisionInput,
  CompatibilityProfileRevisionStatus,
  CompatibilityRevisionReviewMutation,
} from '../../../packages/contracts/src';
import { apiRequest, createIdempotencyKey } from '../api/api-client';
import { isLocalBusinessAdminMode } from './local-business-admin.store';
import { localCompatibilityAdminStore } from './local-compatibility-admin.store';

export type CompatibilityRevisionImpactReport = {
  kind: 'profile' | 'pair_rule';
  baselineVersion: number;
  changedFields: string[];
  changes: Array<{ field: string; before: unknown; after: unknown }>;
};

export type CompatibilityRegressionDecision = {
  status: 'compatible' | 'caution' | 'not_recommended' | 'insufficient_data';
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'unknown';
  blocking: string[];
  warning: string[];
  missing: string[];
};
export type CompatibilityRegressionReport = {
  kind: 'profile' | 'pair_rule';
  targetKey: string;
  baselineVersion: number;
  authoritySequence: number;
  engineVersion: string;
  catalogFingerprint: string;
  regressionDigest: string;
  evaluatedScenarios: number;
  changedScenarios: number;
  changes: Array<{ scenario: string; species: [string, string]; before: CompatibilityRegressionDecision; after: CompatibilityRegressionDecision }>;
  generatedAt: string;
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
  evidenceResolution?: Array<{ sourceKey: string; sourceId: string; version: number }>;
  impactReport?: CompatibilityRevisionImpactReport;
  regressionReport?: CompatibilityRegressionReport;
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
  evidenceResolution?: Array<{ sourceKey: string; sourceId: string; version: number }>;
  impactReport?: CompatibilityRevisionImpactReport;
  regressionReport?: CompatibilityRegressionReport;
  impactCheckedAt?: string;
  reviewNote?: string | null;
  version: number;
  speciesA: { catalogKey: string; name: string; scientificName: string };
  speciesB: { catalogKey: string; name: string; scientificName: string };
};

export type AdminCompatibilityPairRuleRevisionWorkspace = { revisions: AdminCompatibilityPairRuleRevision[]; writablePairKeys: string[] };

export const compatibilityAdminService = {
  listProfileRevisions: () => isLocalBusinessAdminMode ? localCompatibilityAdminStore.listProfileRevisions() : apiRequest<AdminCompatibilityProfileRevisionWorkspace>('/admin/compatibility/profile-revisions'),
  listPairRuleRevisions: () => isLocalBusinessAdminMode ? localCompatibilityAdminStore.listPairRuleRevisions() : apiRequest<AdminCompatibilityPairRuleRevisionWorkspace>('/admin/compatibility/pair-rule-revisions'),

  createPairRuleRevision: (input: CompatibilityPairRuleRevisionInput) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.createPairRuleRevision(input) : apiRequest<AdminCompatibilityPairRuleRevision>('/admin/compatibility/pair-rule-revisions', {
    method: 'POST', body: input, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-create'),
  }),

  updatePairRuleRevision: (id: string, version: number, input: Partial<CompatibilityPairRuleRevisionInput>) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.updatePairRuleRevision(id, version, input) : apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}`, {
    method: 'PATCH', body: { ...input, version }, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-update'),
  }),

  submitPairRuleRevision: (id: string, version: number) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.submitPairRuleRevision(id, version) : apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}/submit`, {
    method: 'POST', body: { version }, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-submit'),
  }),

  reviewPairRuleRevision: (id: string, input: CompatibilityRevisionReviewMutation) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.reviewPairRuleRevision(id, input) : apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}/review`, {
    method: 'POST', body: input, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-review'),
  }),

  publishPairRuleRevision: (id: string, version: number) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.publishPairRuleRevision(id, version) : apiRequest<AdminCompatibilityPairRuleRevision>(`/admin/compatibility/pair-rule-revisions/${id}/publish`, {
    method: 'POST', body: { version }, idempotencyKey: createIdempotencyKey('compatibility-pair-rule-revision-publish'),
  }),

  createProfileRevision: (input: CompatibilityProfileDraftInput) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.createProfileRevision(input) : apiRequest<AdminCompatibilityProfileRevision>('/admin/compatibility/profile-revisions', {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('compatibility-profile-revision-create'),
  }),

  updateProfileRevision: (id: string, version: number, input: Partial<CompatibilityProfileDraftInput>) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.updateProfileRevision(id, version, input) : apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}`, {
    method: 'PATCH',
    body: { ...input, version },
    idempotencyKey: createIdempotencyKey('compatibility-profile-revision-update'),
  }),

  submitProfileRevision: (id: string, version: number) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.submitProfileRevision(id, version) : apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}/submit`, {
    method: 'POST',
    body: { version },
    idempotencyKey: createIdempotencyKey('compatibility-profile-revision-submit'),
  }),

  reviewProfileRevision: (id: string, input: CompatibilityRevisionReviewMutation) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.reviewProfileRevision(id, input) : apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}/review`, {
    method: 'POST', body: input, idempotencyKey: createIdempotencyKey('compatibility-profile-revision-review'),
  }),

  publishProfileRevision: (id: string, version: number) => isLocalBusinessAdminMode ? localCompatibilityAdminStore.publishProfileRevision(id, version) : apiRequest<AdminCompatibilityProfileRevision>(`/admin/compatibility/profile-revisions/${id}/publish`, {
    method: 'POST', body: { version }, idempotencyKey: createIdempotencyKey('compatibility-profile-revision-publish'),
  }),
};

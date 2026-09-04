import type {
  CompatibilityCitationSnapshot,
  CompatibilityProfileRevisionInput,
  CompatibilityProfileRevisionStatus,
} from '../../../packages/contracts/src';
import { apiRequest, createIdempotencyKey } from '../api/api-client';

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
  version: number;
  species: { catalogKey: string; name: string; scientificName: string };
};

export type CompatibilityProfileDraftInput = CompatibilityProfileRevisionInput;
export type AdminCompatibilityProfileRevisionWorkspace = { revisions: AdminCompatibilityProfileRevision[]; writableCatalogKeys: string[] };

export const compatibilityAdminService = {
  listProfileRevisions: () => apiRequest<AdminCompatibilityProfileRevisionWorkspace>('/admin/compatibility/profile-revisions'),

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
};

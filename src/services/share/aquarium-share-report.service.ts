import type { AquariumShareReport, SanitizedAquariumReport } from '../../../packages/contracts/src/share-reports';
import { apiRequest, createIdempotencyKey } from '../api/api-client';

export type AquariumShareReportListItem = Omit<AquariumShareReport, 'shareUrl'>;

export const createAquariumShareReport = (aquariumId: string, snapshot: SanitizedAquariumReport) =>
  apiRequest<AquariumShareReport>(`/aquariums/${aquariumId}/share-reports`, {
    method: 'POST',
    body: { snapshot },
    idempotencyKey: createIdempotencyKey('aquarium-share-report'),
  });

export const listAquariumShareReports = () =>
  apiRequest<{ items: AquariumShareReportListItem[] }>('/share-reports');

export const revokeAquariumShareReport = (id: string) =>
  apiRequest<{ id: string; revokedAt: string }>(`/share-reports/${id}`, {
    method: 'DELETE',
    idempotencyKey: createIdempotencyKey('aquarium-share-report-revoke'),
  });

export const getPublicAquariumShareReport = (token: string) =>
  apiRequest<SanitizedAquariumReport>(`/public/share-reports/${encodeURIComponent(token)}`, {
    authenticated: false,
  });
